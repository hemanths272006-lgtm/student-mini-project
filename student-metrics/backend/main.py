import io
import csv
import os
import shutil
import uuid
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from database import engine, Base, get_db, SessionLocal
from cache import cache
from models import Student, Subject, Assessment, Mark
from schemas import (
    StudentCreate, StudentUpdate, StudentListResponse, StudentListItem,
    StudentDetailResponse, DashboardResponse, KPIStats, LearnerDistItem,
    SubjectPerfItem, TestTrendItem, SectionPerfItem, AnalyticsResponse,
    TopStudent, SupportNeededStudent, CSVImportResponse
)
from analysis import (
    SUBJECT_DEFAULTS, ASSESSMENT_DEFAULTS,
    classify_learner, calculate_learning_trend,
    compute_student_metrics, generate_seed_students_data,
    batch_compute_students_metrics
)
from seed_portals import seed_portals_data
from routers import auth_routes, admin_routes, lecturer_routes, student_routes

# Helper function to initialize database and seed on first run
def init_db_and_seed():
    Base.metadata.create_all(bind=engine)
    if engine.dialect.name == "sqlite":
        with engine.connect() as conn:
            try:
                cols = [row[1] for row in conn.execute(text("PRAGMA table_info(students)")).fetchall()]
                if cols and "user_id" not in cols:
                    conn.execute(text("ALTER TABLE students ADD COLUMN user_id INTEGER"))
                    conn.commit()
                    print("Migrated students table: added user_id column.")
            except Exception as e:
                print("Migration warning:", e)
    db = SessionLocal()
    try:
        # 1. Initialize Subjects if missing
        existing_subjs = {s.name: s for s in db.query(Subject).all()}
        for s_def in SUBJECT_DEFAULTS:
            if s_def["name"] not in existing_subjs:
                new_sub = Subject(name=s_def["name"], code=s_def["code"])
                db.add(new_sub)
        db.commit()

        # 2. Initialize Assessments if missing
        existing_assess = {a.name: a for a in db.query(Assessment).all()}
        for a_def in ASSESSMENT_DEFAULTS:
            if a_def["name"] not in existing_assess:
                new_ass = Assessment(
                    name=a_def["name"],
                    code=a_def["code"],
                    order_num=a_def["order_num"]
                )
                db.add(new_ass)
        db.commit()

        # 3. Check if students exist; if < 180, seed 180 students in fast batches
        student_count = db.query(Student).count()
        if student_count < 180:
            print(f"Database currently has {student_count} students. Seeding 180 realistic students across Sections A, B, and C...")
            seed_data = generate_seed_students_data()

            # Cache subjects and assessments for fast lookup
            sub_map = {s.name: s.id for s in db.query(Subject).all()}
            ass_map = {a.name: a.id for a in db.query(Assessment).all()}

            existing_usns = {s.usn for s in db.query(Student.usn).all()}
            students_to_add = []
            seed_items_to_add = []

            for item in seed_data:
                if item["usn"] not in existing_usns:
                    student = Student(
                        student_id=item["student_id"],
                        usn=item["usn"],
                        name=item["name"],
                        section=item["section"],
                        semester=item["semester"],
                        attendance=item["attendance"]
                    )
                    students_to_add.append(student)
                    seed_items_to_add.append(item)

            if students_to_add:
                # Add all students and flush once to retrieve IDs
                db.add_all(students_to_add)
                db.flush()

                # Build all marks
                all_marks = []
                for student, item in zip(students_to_add, seed_items_to_add):
                    for m in item["marks"]:
                        all_marks.append(Mark(
                            student_id=student.id,
                            subject_id=sub_map[m["subject"]],
                            assessment_id=ass_map[m["test"]],
                            score=m["score"]
                        ))

                # Batch insert marks in chunks of 500
                chunk_size = 500
                for i in range(0, len(all_marks), chunk_size):
                    db.add_all(all_marks[i:i + chunk_size])
                    db.flush()

                db.commit()
                print(f"Successfully seeded {len(students_to_add)} students and {len(all_marks)} marks.")
        else:
            print(f"Database already contains {student_count} students. Skipping seeding.")
        
        # 4. Initialize portal tables and seed users/lecturers/tests/proofs/doubts
        seed_portals_data(db)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and seed
    init_db_and_seed()
    yield
    # Shutdown logic if any

app = FastAPI(
    title="Student Learning Performance Analysis System API",
    description="Backend API for managing students, assessments, and learning metrics analysis.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload endpoint for study proofs, materials, and question papers."""
    cleaned_name = file.filename.replace(" ", "_").replace("/", "_").replace("\\", "_")
    filename = f"{uuid.uuid4().hex[:10]}_{cleaned_name}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    file_url = f"/uploads/{filename}"
    return {"url": file_url, "filename": file.filename}

# Include upgraded portal routers
app.include_router(auth_routes.router)
app.include_router(admin_routes.router)
app.include_router(lecturer_routes.router)
app.include_router(student_routes.router)

# ----------------------------------------------------
# Helper to build student details with calculated metrics
# ----------------------------------------------------
def get_student_calculated_data(student: Student, db: Session) -> Dict[str, Any]:
    # Query all marks with subject and assessment names
    marks_query = (
        db.query(Mark.score, Subject.name.label("subject_name"), Assessment.name.label("assessment_name"))
        .join(Subject, Mark.subject_id == Subject.id)
        .join(Assessment, Mark.assessment_id == Assessment.id)
        .filter(Mark.student_id == student.id)
        .all()
    )

    marks_list = [
        {"subject_name": m.subject_name, "assessment_name": m.assessment_name, "score": m.score}
        for m in marks_query
    ]

    metrics = compute_student_metrics(marks_list, student.attendance)
    return {
        "id": student.id,
        "student_id": student.student_id,
        "usn": student.usn,
        "name": student.name,
        "section": student.section,
        "semester": student.semester,
        "attendance": student.attendance,
        **metrics,
        "raw_marks": marks_list
    }

# ----------------------------------------------------
# 1. Dashboard Endpoint
# ----------------------------------------------------
@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    if not students:
        return DashboardResponse(
            kpi=KPIStats(
                total_students=0, fast_learners=0, average_learners=0, slow_learners=0,
                overall_average=0.0, average_attendance=0.0,
                improving_count=0, declining_count=0, consistent_count=0
            ),
            learner_distribution=[],
            subject_performance=[],
            test_trends=[],
            section_performance=[]
        )

    # Calculate metrics for all students using high-performance batch query
    metrics_map = batch_compute_students_metrics(students, db)
    all_data = [metrics_map[s.id] for s in students if s.id in metrics_map]

    total_students = len(all_data)
    fast_count = sum(1 for d in all_data if d["category"] == "Fast Learner")
    avg_count = sum(1 for d in all_data if d["category"] == "Average Learner")
    slow_count = sum(1 for d in all_data if d["category"] == "Slow Learner")

    improving_count = sum(1 for d in all_data if d["trend"] == "Improving")
    declining_count = sum(1 for d in all_data if d["trend"] == "Declining")
    consistent_count = sum(1 for d in all_data if d["trend"] == "Consistent")

    overall_avg = round(sum(d["overall_average"] for d in all_data) / total_students, 2)
    avg_attendance = round(sum(d["attendance"] for d in all_data) / total_students, 1)

    kpi = KPIStats(
        total_students=total_students,
        fast_learners=fast_count,
        average_learners=avg_count,
        slow_learners=slow_count,
        overall_average=overall_avg,
        average_attendance=avg_attendance,
        improving_count=improving_count,
        declining_count=declining_count,
        consistent_count=consistent_count
    )

    # Learner distribution
    learner_distribution = [
        LearnerDistItem(
            name="Fast Learner",
            count=fast_count,
            percentage=round((fast_count / total_students) * 100, 1),
            color="#10B981"  # Emerald / Green
        ),
        LearnerDistItem(
            name="Average Learner",
            count=avg_count,
            percentage=round((avg_count / total_students) * 100, 1),
            color="#3B82F6"  # Blue
        ),
        LearnerDistItem(
            name="Slow Learner",
            count=slow_count,
            percentage=round((slow_count / total_students) * 100, 1),
            color="#EF4444"  # Red / Rose
        )
    ]

    # Subject performance across all students
    subjects = db.query(Subject).all()
    subject_performance = []
    for subj in subjects:
        subj_marks = (
            db.query(Mark.score)
            .filter(Mark.subject_id == subj.id)
            .all()
        )
        scores = [m.score for m in subj_marks]
        if scores:
            subject_performance.append(SubjectPerfItem(
                subject=subj.name,
                average=round(sum(scores) / len(scores), 2),
                highest=round(max(scores), 1),
                lowest=round(min(scores), 1)
            ))

    # Test trends progression
    assessments = db.query(Assessment).order_by(Assessment.order_num).all()
    test_trends = []
    for ass in assessments:
        # All marks for this assessment
        marks_rows = (
            db.query(Mark.score, Student.id.label("student_id"))
            .join(Student, Mark.student_id == Student.id)
            .filter(Mark.assessment_id == ass.id)
            .all()
        )
        if marks_rows:
            overall_test_avg = sum(m.score for m in marks_rows) / len(marks_rows)
            # Map student category
            student_cat_map = {d["id"]: d["category"] for d in all_data}
            fast_scores = [m.score for m in marks_rows if student_cat_map.get(m.student_id) == "Fast Learner"]
            avg_scores = [m.score for m in marks_rows if student_cat_map.get(m.student_id) == "Average Learner"]
            slow_scores = [m.score for m in marks_rows if student_cat_map.get(m.student_id) == "Slow Learner"]

            test_trends.append(TestTrendItem(
                test=ass.name,
                overall=round(overall_test_avg, 2),
                fast=round(sum(fast_scores) / len(fast_scores), 2) if fast_scores else 0.0,
                average=round(sum(avg_scores) / len(avg_scores), 2) if avg_scores else 0.0,
                slow=round(sum(slow_scores) / len(slow_scores), 2) if slow_scores else 0.0
            ))

    # Section-wise student performance
    sections = ["A", "B", "C"]
    section_performance = []
    for sec in sections:
        sec_students = [d for d in all_data if d["section"] == sec]
        sec_total = len(sec_students)
        if sec_total > 0:
            sec_avg = round(sum(d["overall_average"] for d in sec_students) / sec_total, 2)
            sec_fast = sum(1 for d in sec_students if d["category"] == "Fast Learner")
            sec_mid = sum(1 for d in sec_students if d["category"] == "Average Learner")
            sec_slow = sum(1 for d in sec_students if d["category"] == "Slow Learner")
            sec_att = round(sum(d["attendance"] for d in sec_students) / sec_total, 1)

            section_performance.append(SectionPerfItem(
                section=f"Section {sec}",
                total=sec_total,
                average=sec_avg,
                fast_count=sec_fast,
                avg_count=sec_mid,
                slow_count=sec_slow,
                attendance=sec_att
            ))

    return DashboardResponse(
        kpi=kpi,
        learner_distribution=learner_distribution,
        subject_performance=subject_performance,
        test_trends=test_trends,
        section_performance=section_performance
    )

# ----------------------------------------------------
# 2. Students List & Management Endpoints
# ----------------------------------------------------
@app.get("/api/students", response_model=StudentListResponse)
def get_students(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=200),
    search: Optional[str] = Query(None),
    section: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("usn"),
    sort_order: Optional[str] = Query("asc"),
    db: Session = Depends(get_db)
):
    cache_key = f"students_list_{page}_{limit}_{section}_{category}_{sort_by}_{sort_order}_{search}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    query = db.query(Student)

    # Filter by section
    if section and isinstance(section, str) and section.upper() in ["A", "B", "C"]:
        query = query.filter(Student.section == section.upper())

    # Search filter (USN or Name)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter((Student.usn.ilike(search_term)) | (Student.name.ilike(search_term)))

    students = query.all()

    # Calculate metrics for filtering & sorting in 1 fast batch
    metrics_map = batch_compute_students_metrics(students, db)
    calculated_list = [metrics_map[s.id] for s in students if s.id in metrics_map]

    # Category filter
    if category and category.lower() != "all":
        calculated_list = [
            c for c in calculated_list
            if c["category"].lower() == category.lower()
        ]

    # Sorting
    reverse = (sort_order.lower() == "desc")
    if sort_by == "overall_average":
        calculated_list.sort(key=lambda x: x["overall_average"], reverse=reverse)
    elif sort_by == "attendance":
        calculated_list.sort(key=lambda x: x["attendance"], reverse=reverse)
    elif sort_by == "name":
        calculated_list.sort(key=lambda x: x["name"].lower(), reverse=reverse)
    elif sort_by == "section":
        calculated_list.sort(key=lambda x: (x["section"], x["usn"]), reverse=reverse)
    else:  # default usn
        calculated_list.sort(key=lambda x: x["usn"], reverse=reverse)

    # Pagination
    total = len(calculated_list)
    total_pages = max(1, (total + limit - 1) // limit)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_items = calculated_list[start_idx:end_idx]

    result_items = [
        StudentListItem(
            id=item["id"],
            student_id=item["student_id"],
            usn=item["usn"],
            name=item["name"],
            section=item["section"],
            semester=item["semester"],
            attendance=item["attendance"],
            overall_average=item["overall_average"],
            category=item["category"],
            trend=item["trend"],
            highest_subject=item["highest_subject"],
            lowest_subject=item["lowest_subject"]
        )
        for item in paginated_items
    ]

    res_obj = StudentListResponse(
        students=result_items,
        pagination={
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    )
    cache.set(cache_key, res_obj, ttl=180)
    return res_obj

@app.post("/api/students", response_model=StudentDetailResponse)
def create_student(data: StudentCreate, db: Session = Depends(get_db)):
    # Check USN uniqueness
    existing = db.query(Student).filter(Student.usn == data.usn.strip().upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Student with USN '{data.usn}' already exists.")

    # Assign student_id if not provided
    count = db.query(Student).count()
    student_id = data.student_id or f"STU{count + 1:03d}"

    student = Student(
        student_id=student_id,
        usn=data.usn.strip().upper(),
        name=data.name.strip(),
        section=data.section.strip().upper(),
        semester=data.semester,
        attendance=data.attendance
    )
    db.add(student)
    db.flush()

    sub_map = {s.name: s.id for s in db.query(Subject).all()}
    ass_map = {a.name: a.id for a in db.query(Assessment).all()}

    # Insert marks: either from data or generate realistic defaults
    if data.marks:
        for m in data.marks:
            if m.subject in sub_map and m.test in ass_map:
                mark = Mark(
                    student_id=student.id,
                    subject_id=sub_map[m.subject],
                    assessment_id=ass_map[m.test],
                    score=m.score
                )
                db.add(mark)
    else:
        # Default baseline marks around 65.0
        for subj_name, s_id in sub_map.items():
            for test_name, a_id in ass_map.items():
                mark = Mark(
                    student_id=student.id,
                    subject_id=s_id,
                    assessment_id=a_id,
                    score=65.0
                )
                db.add(mark)

    db.commit()
    db.refresh(student)

    detail = get_student_calculated_data(student, db)
    return StudentDetailResponse(
        id=detail["id"],
        student_id=detail["student_id"],
        usn=detail["usn"],
        name=detail["name"],
        section=detail["section"],
        semester=detail["semester"],
        attendance=detail["attendance"],
        overall_average=detail["overall_average"],
        category=detail["category"],
        trend=detail["trend"],
        highest_subject=detail["highest_subject"],
        highest_score=detail["highest_score"],
        lowest_subject=detail["lowest_subject"],
        lowest_score=detail["lowest_score"],
        subject_averages=detail["subject_averages"],
        test_averages=detail["test_averages"],
        marks=detail["raw_marks"],
        suggestions=detail["suggestions"]
    )

@app.get("/api/students/{id}", response_model=StudentDetailResponse)
def get_student(id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    detail = get_student_calculated_data(student, db)
    return StudentDetailResponse(
        id=detail["id"],
        student_id=detail["student_id"],
        usn=detail["usn"],
        name=detail["name"],
        section=detail["section"],
        semester=detail["semester"],
        attendance=detail["attendance"],
        overall_average=detail["overall_average"],
        category=detail["category"],
        trend=detail["trend"],
        highest_subject=detail["highest_subject"],
        highest_score=detail["highest_score"],
        lowest_subject=detail["lowest_subject"],
        lowest_score=detail["lowest_score"],
        subject_averages=detail["subject_averages"],
        test_averages=detail["test_averages"],
        marks=detail["raw_marks"],
        suggestions=detail["suggestions"]
    )

@app.put("/api/students/{id}", response_model=StudentDetailResponse)
def update_student(id: int, data: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    if data.name is not None:
        student.name = data.name.strip()
    if data.section is not None:
        student.section = data.section.strip().upper()
    if data.semester is not None:
        student.semester = data.semester
    if data.attendance is not None:
        student.attendance = data.attendance

    # Update marks if provided
    if data.marks is not None:
        sub_map = {s.name: s.id for s in db.query(Subject).all()}
        ass_map = {a.name: a.id for a in db.query(Assessment).all()}

        for m in data.marks:
            if m.subject in sub_map and m.test in ass_map:
                s_id = sub_map[m.subject]
                a_id = ass_map[m.test]
                mark_record = (
                    db.query(Mark)
                    .filter(
                        Mark.student_id == student.id,
                        Mark.subject_id == s_id,
                        Mark.assessment_id == a_id
                    )
                    .first()
                )
                if mark_record:
                    mark_record.score = m.score
                else:
                    new_mark = Mark(
                        student_id=student.id,
                        subject_id=s_id,
                        assessment_id=a_id,
                        score=m.score
                    )
                    db.add(new_mark)

    db.commit()
    db.refresh(student)

    detail = get_student_calculated_data(student, db)
    return StudentDetailResponse(
        id=detail["id"],
        student_id=detail["student_id"],
        usn=detail["usn"],
        name=detail["name"],
        section=detail["section"],
        semester=detail["semester"],
        attendance=detail["attendance"],
        overall_average=detail["overall_average"],
        category=detail["category"],
        trend=detail["trend"],
        highest_subject=detail["highest_subject"],
        highest_score=detail["highest_score"],
        lowest_subject=detail["lowest_subject"],
        lowest_score=detail["lowest_score"],
        subject_averages=detail["subject_averages"],
        test_averages=detail["test_averages"],
        marks=detail["raw_marks"],
        suggestions=detail["suggestions"]
    )

@app.delete("/api/students/{id}")
def delete_student(id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    db.delete(student)
    db.commit()
    return {"message": f"Student '{student.name}' ({student.usn}) deleted successfully."}

# ----------------------------------------------------
# 3. Analytics Endpoint
# ----------------------------------------------------
@app.get("/api/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    metrics_map = batch_compute_students_metrics(students, db)
    all_data = [metrics_map[s.id] for s in students if s.id in metrics_map]

    # Section comparison
    sections = ["A", "B", "C"]
    section_comparison = []
    for sec in sections:
        sec_students = [d for d in all_data if d["section"] == sec]
        sec_total = len(sec_students)
        if sec_total > 0:
            sec_avg = round(sum(d["overall_average"] for d in sec_students) / sec_total, 2)
            sec_fast = sum(1 for d in sec_students if d["category"] == "Fast Learner")
            sec_mid = sum(1 for d in sec_students if d["category"] == "Average Learner")
            sec_slow = sum(1 for d in sec_students if d["category"] == "Slow Learner")
            sec_att = round(sum(d["attendance"] for d in sec_students) / sec_total, 1)

            section_comparison.append(SectionPerfItem(
                section=f"Section {sec}",
                total=sec_total,
                average=sec_avg,
                fast_count=sec_fast,
                avg_count=sec_mid,
                slow_count=sec_slow,
                attendance=sec_att
            ))

    # Subject performance
    subjects = db.query(Subject).all()
    subject_performance = []
    for subj in subjects:
        subj_marks = db.query(Mark.score).filter(Mark.subject_id == subj.id).all()
        scores = [m.score for m in subj_marks]
        if scores:
            subject_performance.append(SubjectPerfItem(
                subject=subj.name,
                average=round(sum(scores) / len(scores), 2),
                highest=round(max(scores), 1),
                lowest=round(min(scores), 1)
            ))

    # Trend distribution
    trend_distribution = {
        "Improving": sum(1 for d in all_data if d["trend"] == "Improving"),
        "Consistent": sum(1 for d in all_data if d["trend"] == "Consistent"),
        "Declining": sum(1 for d in all_data if d["trend"] == "Declining")
    }

    # Top 10 Performing Students
    sorted_by_score = sorted(all_data, key=lambda x: x["overall_average"], reverse=True)
    top_10_students = [
        TopStudent(
            rank=idx + 1,
            id=d["id"],
            usn=d["usn"],
            name=d["name"],
            section=d["section"],
            overall_average=d["overall_average"],
            category=d["category"],
            trend=d["trend"],
            attendance=d["attendance"]
        )
        for idx, d in enumerate(sorted_by_score[:10])
    ]

    # Students Requiring Academic Support
    support_needed = []
    for d in all_data:
        reasons = []
        if d["category"] == "Slow Learner":
            reasons.append("Overall Average below 50%")
        if d["attendance"] < 75.0:
            reasons.append(f"Low Attendance ({d['attendance']}%)")
        if d["trend"] == "Declining":
            reasons.append("Declining Test Scores")
        if d["lowest_score"] < 40.0:
            reasons.append(f"Critically Low in {d['lowest_subject']} ({d['lowest_score']}%)")

        if reasons:
            # Action plan
            if "Overall Average below 50%" in reasons:
                plan = "Enrol in mandatory remedial bridge courses and assign weekly faculty mentor sessions."
            elif "Declining Test Scores" in reasons:
                plan = "Conduct academic counseling to identify learning gaps and provide structured revision tests."
            elif "Low Attendance" in str(reasons):
                plan = "Issue attendance advisory letter and schedule parent-teacher conference."
            else:
                plan = f"Provide targeted assignments and solved problem sets for {d['lowest_subject']}."

            support_needed.append(SupportNeededStudent(
                id=d["id"],
                usn=d["usn"],
                name=d["name"],
                section=d["section"],
                overall_average=d["overall_average"],
                attendance=d["attendance"],
                category=d["category"],
                trend=d["trend"],
                weakest_subject=f"{d['lowest_subject']} ({d['lowest_score']}%)",
                reasons=reasons,
                action_plan=plan
            ))

    # Sort support students by priority (lowest avg first)
    support_needed.sort(key=lambda x: x.overall_average)

    return AnalyticsResponse(
        section_comparison=section_comparison,
        subject_performance=subject_performance,
        trend_distribution=trend_distribution,
        top_10_students=top_10_students,
        support_needed_students=support_needed
    )

# ----------------------------------------------------
# 4. Reports Endpoint
# ----------------------------------------------------
@app.get("/api/reports/{id}")
def get_student_report(id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    detail = get_student_calculated_data(student, db)

    # Class and Section rank calculation in 1 fast batch
    all_students = db.query(Student).all()
    all_metrics = batch_compute_students_metrics(all_students, db)

    all_avgs = [
        (s.id, all_metrics[s.id]["overall_average"])
        for s in all_students if s.id in all_metrics
    ]
    all_avgs.sort(key=lambda x: x[1], reverse=True)
    rank = next((idx + 1 for idx, item in enumerate(all_avgs) if item[0] == student.id), 1)
    total_class = len(all_avgs)

    # Section rank calculation
    sec_students = [s for s in all_students if s.section == student.section]
    sec_avgs = [
        (s.id, all_metrics[s.id]["overall_average"])
        for s in sec_students if s.id in all_metrics
    ]
    sec_avgs.sort(key=lambda x: x[1], reverse=True)
    sec_rank = next((idx + 1 for idx, item in enumerate(sec_avgs) if item[0] == student.id), 1)

    return {
        **detail,
        "class_rank": rank,
        "section_rank": sec_rank,
        "total_students": total_class,
        "section_total": len(sec_students),
        "institution_name": "Department of Computer Science & Engineering",
        "academic_year": "2026-2027",
        "program": "Bachelor of Engineering (B.E.)"
    }

# ----------------------------------------------------
# 5. CSV Import and Export Endpoints
# ----------------------------------------------------
@app.get("/api/sample-csv")
def download_sample_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["usn", "name", "section", "semester", "attendance", "subject", "test", "score"])
    sample_rows = [
        ["1MS24CS201", "Aarav Sharma", "A", "4", "88.5", "Mathematics", "Test 1", "82.0"],
        ["1MS24CS201", "Aarav Sharma", "A", "4", "88.5", "Science", "Test 1", "78.5"],
        ["1MS24CS201", "Aarav Sharma", "A", "4", "88.5", "English", "Test 1", "85.0"],
        ["1MS24CS201", "Aarav Sharma", "A", "4", "88.5", "Computer Science", "Test 1", "90.0"],
        ["1MS24CS201", "Aarav Sharma", "A", "4", "88.5", "Social Studies", "Test 1", "76.0"],
        ["1MS24CS201", "Aarav Sharma", "A", "4", "88.5", "Mathematics", "Test 2", "85.0"],
        ["1MS24CS202", "Priya Verma", "B", "4", "72.0", "Mathematics", "Test 1", "45.0"],
        ["1MS24CS202", "Priya Verma", "B", "4", "72.0", "Computer Science", "Test 1", "52.0"],
    ]
    writer.writerows(sample_rows)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sample_student_marks.csv"}
    )

@app.post("/api/import-csv", response_model=CSVImportResponse)
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .csv file.")

    contents = await file.read()
    try:
        text = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = contents.decode("latin1")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")

    # Standardize column headers (lowercase, trimmed)
    normalized_headers = {col.lower().strip(): col for col in reader.fieldnames}
    required_cols = ["usn", "name", "section"]
    for req in required_cols:
        if req not in normalized_headers:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required CSV column '{req}'. Required columns: usn, name, section, semester, attendance, subject, test, score."
            )

    sub_map = {s.name.lower(): s.id for s in db.query(Subject).all()}
    ass_map = {a.name.lower(): a.id for a in db.query(Assessment).all()}

    total_rows = 0
    imported = 0
    updated = 0
    errors = []

    for row_idx, row in enumerate(reader, start=2):
        total_rows += 1
        clean_row = {k.lower().strip(): (v.strip() if v else "") for k, v in row.items()}

        usn = clean_row.get("usn", "").upper()
        name = clean_row.get("name", "")
        section = clean_row.get("section", "").upper()

        if not usn or not name:
            errors.append(f"Row {row_idx}: USN and Name cannot be empty.")
            continue

        if section not in ["A", "B", "C"]:
            errors.append(f"Row {row_idx}: Section must be 'A', 'B', or 'C'. Received: '{section}'.")
            continue

        try:
            semester = int(clean_row.get("semester", 4))
        except ValueError:
            semester = 4

        try:
            attendance = float(clean_row.get("attendance", 85.0))
            if not (0.0 <= attendance <= 100.0):
                errors.append(f"Row {row_idx}: Attendance must be between 0 and 100. Got: {attendance}")
                continue
        except ValueError:
            attendance = 85.0

        # Find or create student
        student = db.query(Student).filter(Student.usn == usn).first()
        is_new = False
        if not student:
            count = db.query(Student).count()
            student_id = f"STU{count + 1:03d}"
            student = Student(
                student_id=student_id,
                usn=usn,
                name=name,
                section=section,
                semester=semester,
                attendance=attendance
            )
            db.add(student)
            db.flush()
            is_new = True
            imported += 1
        else:
            student.name = name
            student.section = section
            student.semester = semester
            student.attendance = attendance
            updated += 1

        # Check if subject and test score are in this row
        subject_val = clean_row.get("subject", "").lower()
        test_val = clean_row.get("test", "").lower()
        score_val = clean_row.get("score", "")

        if subject_val and test_val and score_val:
            if subject_val not in sub_map:
                errors.append(f"Row {row_idx}: Unknown subject '{subject_val}'.")
                continue
            if test_val not in ass_map:
                errors.append(f"Row {row_idx}: Unknown assessment '{test_val}'.")
                continue

            try:
                score = float(score_val)
                if not (0.0 <= score <= 100.0):
                    errors.append(f"Row {row_idx}: Score must be between 0 and 100. Got: {score}")
                    continue
            except ValueError:
                errors.append(f"Row {row_idx}: Invalid score number '{score_val}'.")
                continue

            s_id = sub_map[subject_val]
            a_id = ass_map[test_val]

            mark = (
                db.query(Mark)
                .filter(Mark.student_id == student.id, Mark.subject_id == s_id, Mark.assessment_id == a_id)
                .first()
            )
            if mark:
                mark.score = score
            else:
                db.add(Mark(student_id=student.id, subject_id=s_id, assessment_id=a_id, score=score))

    db.commit()

    return CSVImportResponse(
        success=len(errors) < total_rows,
        total_rows=total_rows,
        imported_count=imported,
        updated_count=updated,
        error_count=len(errors),
        errors=errors[:15]  # Limit to 15 to keep response clean
    )

@app.get("/api/export-csv")
def export_csv(db: Session = Depends(get_db)):
    students = db.query(Student).order_by(Student.section, Student.usn).all()
    metrics_map = batch_compute_students_metrics(students, db)
    all_data = [metrics_map[s.id] for s in students if s.id in metrics_map]

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    headers = [
        "Student ID", "USN", "Name", "Section", "Semester", "Attendance (%)",
        "Overall Average (%)", "Learner Category", "Learning Trend",
        "Highest Subject", "Lowest Subject",
        "Mathematics Avg", "Science Avg", "English Avg", "Computer Science Avg", "Social Studies Avg",
        "Test 1 Avg", "Test 2 Avg", "Test 3 Avg", "Test 4 Avg"
    ]
    writer.writerow(headers)

    for d in all_data:
        sub_avgs = d["subject_averages"]
        test_avgs = d["test_averages"]
        writer.writerow([
            d["student_id"],
            d["usn"],
            d["name"],
            d["section"],
            d["semester"],
            d["attendance"],
            d["overall_average"],
            d["category"],
            d["trend"],
            d["highest_subject"],
            d["lowest_subject"],
            sub_avgs.get("Mathematics", 0.0),
            sub_avgs.get("Science", 0.0),
            sub_avgs.get("English", 0.0),
            sub_avgs.get("Computer Science", 0.0),
            sub_avgs.get("Social Studies", 0.0),
            test_avgs.get("Test 1", 0.0),
            test_avgs.get("Test 2", 0.0),
            test_avgs.get("Test 3", 0.0),
            test_avgs.get("Test 4", 0.0)
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=student_learning_performance_report.csv"}
    )

@app.post("/api/reset-sample-data")
def reset_sample_data(db: Session = Depends(get_db)):
    # Clear existing marks and students
    db.query(Mark).delete()
    db.query(Student).delete()
    db.commit()

    # Re-seed
    seed_data = generate_seed_students_data()
    sub_map = {s.name: s.id for s in db.query(Subject).all()}
    ass_map = {a.name: a.id for a in db.query(Assessment).all()}

    for item in seed_data:
        student = Student(
            student_id=item["student_id"],
            usn=item["usn"],
            name=item["name"],
            section=item["section"],
            semester=item["semester"],
            attendance=item["attendance"]
        )
        db.add(student)
        db.flush()

        for m in item["marks"]:
            db.add(Mark(
                student_id=student.id,
                subject_id=sub_map[m["subject"]],
                assessment_id=ass_map[m["test"]],
                score=m["score"]
            ))

    db.commit()
    return {"message": "Database reset and successfully re-seeded with 180 students across Sections A, B, and C."}

# ====================================================
# SERVE REACT FRONTEND DIRECTLY (SPA SUPPORT)
# ====================================================
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    from fastapi.responses import FileResponse
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api/") or full_path in ["docs", "openapi.json", "redoc"]:
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))


