import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from cache import cache
from models import (
    User, Lecturer, SubjectAssignment, Student, Subject, Assessment, Mark,
    StudyProof, Doubt, DoubtReply, StudyMaterial, OnlineTest, TestQuestion,
    StudentTestAttempt, ActivityLog
)
from schemas import (
    StudyProofVerifyRequest, DoubtReplyRequest, StudyMaterialCreateRequest,
    TestCreateRequest, MarkItem
)
from auth import require_roles, get_current_user
from analysis import (
    classify_learner, calculate_learning_trend, compute_student_metrics,
    batch_compute_students_metrics
)

router = APIRouter(
    prefix="/api/lecturer",
    tags=["Lecturer Portal"],
    dependencies=[Depends(require_roles(["lecturer", "admin"]))]
)

# Helper to find current lecturer profile
def get_lecturer_profile(current_user: User, db: Session) -> Lecturer:
    lec = db.query(Lecturer).filter(Lecturer.user_id == current_user.id).first()
    if not lec:
        # If admin is testing lecturer endpoints, provide fallback to first lecturer
        if current_user.role == "admin":
            lec = db.query(Lecturer).first()
        if not lec:
            raise HTTPException(status_code=404, detail="Lecturer profile not found for current user.")
    return lec

def get_student_calculated(student: Student, db: Session):
    marks_query = (
        db.query(Mark.score, Subject.name.label("subject_name"), Assessment.name.label("assessment_name"))
        .join(Subject, Mark.subject_id == Subject.id)
        .join(Assessment, Mark.assessment_id == Assessment.id)
        .filter(Mark.student_id == student.id)
        .all()
    )
    marks_list = [{"subject_name": m.subject_name, "assessment_name": m.assessment_name, "score": m.score} for m in marks_query]
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
        "marks_matrix": marks_list
    }

# ----------------------------------------------------
# 1. LECTURER DASHBOARD
# ----------------------------------------------------
@router.get("/dashboard")
def get_lecturer_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lec = get_lecturer_profile(current_user, db)

    cache_key = f"lecturer_dashboard_{lec.id}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    # Get assigned classes
    assignments = (
        db.query(SubjectAssignment, Subject.name.label("subject_name"))
        .join(Subject, SubjectAssignment.subject_id == Subject.id)
        .filter(SubjectAssignment.lecturer_id == lec.id)
        .all()
    )

    assigned_sections = list(set(a.SubjectAssignment.section for a in assignments))
    assigned_subject_ids = list(set(a.SubjectAssignment.subject_id for a in assignments))

    # Students taught by this lecturer (by assigned sections)
    students = (
        db.query(Student)
        .filter(Student.section.in_(assigned_sections))
        .all()
    ) if assigned_sections else []

    total_students = len(students)
    metrics_map = batch_compute_students_metrics(students, db)
    student_metrics = [metrics_map[s.id] for s in students if s.id in metrics_map]

    fast_learners = [s for s in student_metrics if s["category"] == "Fast Learner"]
    avg_learners = [s for s in student_metrics if s["category"] == "Average Learner"]
    slow_learners = [s for s in student_metrics if s["category"] == "Slow Learner"]

    # Pending proof verifications for lecturer's subjects/sections
    pending_proofs_count = (
        db.query(StudyProof)
        .join(Student, StudyProof.student_id == Student.id)
        .filter(
            StudyProof.subject_id.in_(assigned_subject_ids),
            Student.section.in_(assigned_sections),
            StudyProof.status == "Pending"
        )
        .count()
    ) if assigned_subject_ids else 0

    # Pending doubts
    pending_doubts_count = (
        db.query(Doubt)
        .filter(
            Doubt.subject_id.in_(assigned_subject_ids),
            Doubt.section.in_(assigned_sections),
            Doubt.status == "Pending"
        )
        .count()
    ) if assigned_subject_ids else 0

    # Recent test attempts in lecturer's subjects
    recent_attempts = (
        db.query(StudentTestAttempt, Student.name.label("student_name"), Student.usn, OnlineTest.title.label("test_title"))
        .join(Student, StudentTestAttempt.student_id == Student.id)
        .join(OnlineTest, StudentTestAttempt.test_id == OnlineTest.id)
        .filter(OnlineTest.subject_id.in_(assigned_subject_ids))
        .order_by(StudentTestAttempt.submitted_at.desc())
        .limit(5)
        .all()
    ) if assigned_subject_ids else []

    assigned_sub_names = [a.subject_name for a in assignments]
    active_tests_count = db.query(OnlineTest).filter(OnlineTest.is_active == True).count()

    stats_data = {
        "total_students": total_students,
        "fast_learners": len(fast_learners),
        "fast_learners_count": len(fast_learners),
        "average_learners": len(avg_learners),
        "average_learners_count": len(avg_learners),
        "slow_learners": len(slow_learners),
        "slow_learners_count": len(slow_learners),
        "pending_proofs": pending_proofs_count,
        "pending_doubts": pending_doubts_count,
        "assigned_classes_count": len(assignments),
        "active_tests": active_tests_count
    }

    result = {
        "lecturer": {
            "name": lec.user.name,
            "department": lec.department,
            "employee_id": lec.employee_id,
            "qualification": lec.qualification,
            "picture": lec.user.picture,
            "is_verified": lec.is_verified,
            "assigned_subjects": assigned_sub_names,
            "assigned_sections": assigned_sections
        },
        "stats": stats_data,
        "kpi": stats_data,
        "assigned_sections": assigned_sections,
        "assigned_subjects": assigned_sub_names,
        "recent_test_submissions": [
            {
                "id": a.StudentTestAttempt.id,
                "student_name": a.student_name,
                "usn": a.usn,
                "test_title": a.test_title,
                "score": a.StudentTestAttempt.score,
                "total_marks": a.StudentTestAttempt.total_marks,
                "passed": a.StudentTestAttempt.passed,
                "submitted_at": a.StudentTestAttempt.submitted_at.strftime("%b %d, %H:%M")
            }
            for a in recent_attempts
        ]
    }
    cache.set(cache_key, result, ttl=180)
    return result

# ----------------------------------------------------
# 2. CLICKABLE LEARNER CLASSIFICATION (MOST IMPORTANT)
# ----------------------------------------------------
@router.get("/learner-classification")
def get_learner_classification(
    category: Optional[str] = Query("All"),
    section: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns classified students for clickable Fast, Average, and Slow learner cards.
    Supports sorting, subject strengths/weaknesses, search, and detailed metrics.
    """
    lec = get_lecturer_profile(current_user, db)
    assignments = db.query(SubjectAssignment).filter(SubjectAssignment.lecturer_id == lec.id).all()
    assigned_sections = list(set(a.section for a in assignments))

    # Query students in assigned sections
    query = db.query(Student)
    if assigned_sections and "All" not in assigned_sections:
        query = query.filter(Student.section.in_(assigned_sections))

    if section and section != "All":
        query = query.filter(Student.section == section)

    students = query.all()
    metrics_map = batch_compute_students_metrics(students, db)
    all_data = [metrics_map[s.id] for s in students if s.id in metrics_map]

    # Category filtering (Fast, Average, Slow, or All)
    cat_lower = (category or "All").lower()
    if "fast" in cat_lower:
        filtered = [s for s in all_data if s["category"] == "Fast Learner"]
    elif "average" in cat_lower:
        filtered = [s for s in all_data if s["category"] == "Average Learner"]
    elif "slow" in cat_lower:
        filtered = [s for s in all_data if s["category"] == "Slow Learner"]
    else:
        filtered = all_data

    # Search filtering
    if search:
        s_query = search.strip().lower()
        filtered = [
            s for s in filtered
            if s_query in s["name"].lower() or s_query in s["usn"].lower()
        ]

    # Fast, Average, Slow summary counts for the cards
    fast_c = sum(1 for s in all_data if s["category"] == "Fast Learner")
    avg_c = sum(1 for s in all_data if s["category"] == "Average Learner")
    slow_c = sum(1 for s in all_data if s["category"] == "Slow Learner")
    total_c = len(all_data)

    summary = {
        "fast": fast_c,
        "fast_learners": fast_c,
        "fast_learners_count": fast_c,
        "average": avg_c,
        "average_learners": avg_c,
        "average_learners_count": avg_c,
        "slow": slow_c,
        "slow_learners": slow_c,
        "slow_learners_count": slow_c,
        "total": total_c,
        "total_students": total_c
    }

    return {
        "summary": summary,
        "selected_category": category,
        "students": filtered
    }

# ----------------------------------------------------
# 3. ASSIGNED CLASSES & STUDENT MARKS ENTRY
# ----------------------------------------------------
@router.get("/assigned-classes")
def get_assigned_classes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lec = get_lecturer_profile(current_user, db)
    assignments = (
        db.query(SubjectAssignment, Subject.name.label("subject_name"), Subject.code.label("subject_code"))
        .join(Subject, SubjectAssignment.subject_id == Subject.id)
        .filter(SubjectAssignment.lecturer_id == lec.id)
        .all()
    )
    return [
        {
            "assignment_id": a.SubjectAssignment.id,
            "subject_id": a.SubjectAssignment.subject_id,
            "subject_name": a.subject_name,
            "subject_code": a.subject_code,
            "section": a.SubjectAssignment.section
        }
        for a in assignments
    ]

@router.get("/students")
def get_lecturer_students(
    section: Optional[str] = Query(None),
    subject_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lec = get_lecturer_profile(current_user, db)
    assignments = db.query(SubjectAssignment).filter(SubjectAssignment.lecturer_id == lec.id).all()
    assigned_sections = list(set(a.section for a in assignments))

    query = db.query(Student).filter(Student.section.in_(assigned_sections))
    if section and section != "All" and section in assigned_sections:
        query = query.filter(Student.section == section)

    students = query.all()
    return [get_student_calculated(s, db) for s in students]

@router.post("/marks")
def enter_student_marks(
    student_id: int,
    subject: str,
    test: str,
    score: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not (0.0 <= score <= 100.0):
        raise HTTPException(status_code=400, detail="Score must be between 0 and 100.")

    sub = db.query(Subject).filter(Subject.name == subject).first()
    ass = db.query(Assessment).filter(Assessment.name == test).first()
    stu = db.query(Student).filter(Student.id == student_id).first()

    if not sub or not ass or not stu:
        raise HTTPException(status_code=404, detail="Student, Subject, or Assessment not found.")

    mark = (
        db.query(Mark)
        .filter(Mark.student_id == stu.id, Mark.subject_id == sub.id, Mark.assessment_id == ass.id)
        .first()
    )
    if mark:
        mark.score = score
    else:
        db.add(Mark(student_id=stu.id, subject_id=sub.id, assessment_id=ass.id, score=score))

    db.add(ActivityLog(
        user_name=current_user.name,
        action="Updated Marks",
        details=f"Updated {subject} ({test}) for {stu.name} ({stu.usn}) to {score}%."
    ))

    db.commit()
    return {"message": "Mark updated successfully.", "score": score}

# ----------------------------------------------------
# 4. STUDY PROOF VERIFICATION
# ----------------------------------------------------
@router.get("/proofs")
def get_study_proofs(
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lec = get_lecturer_profile(current_user, db)
    assignments = db.query(SubjectAssignment).filter(SubjectAssignment.lecturer_id == lec.id).all()
    assigned_subject_ids = list(set(a.subject_id for a in assignments))
    assigned_sections = list(set(a.section for a in assignments))

    query = (
        db.query(StudyProof)
        .join(Student, StudyProof.student_id == Student.id)
        .filter(
            StudyProof.subject_id.in_(assigned_subject_ids),
            Student.section.in_(assigned_sections)
        )
    )
    if status_filter and status_filter != "All":
        query = query.filter(StudyProof.status == status_filter)

    proofs = query.order_by(StudyProof.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "student_id": p.student_id,
            "student_name": p.student.name if p.student else "Student",
            "usn": p.student.usn if p.student else "",
            "section": p.student.section if p.student else "",
            "subject_name": p.subject.name if p.subject else "",
            "title": p.title,
            "description": p.description,
            "file_url": p.file_url,
            "file_type": p.file_type,
            "study_duration_minutes": p.study_duration_minutes,
            "status": p.status,
            "feedback": p.feedback,
            "submitted_at": p.created_at.strftime("%b %d, %Y %H:%M")
        }
        for p in proofs
    ]

@router.post("/proofs/{id}/verify")
@router.put("/proofs/{id}/verify")
def verify_study_proof(
    id: int,
    req: StudyProofVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lec = get_lecturer_profile(current_user, db)
    proof = db.query(StudyProof).filter(StudyProof.id == id).first()
    if not proof:
        raise HTTPException(status_code=404, detail="Study proof not found.")

    proof.status = req.status
    proof.feedback = req.feedback
    proof.verified_by = lec.id
    proof.verified_at = datetime.utcnow()

    # Add notification for the student
    if proof.student and proof.student.user_id:
        db.add(ActivityLog(
            user_name=current_user.name,
            action=f"Study Proof {req.status}",
            details=f"Evaluated study proof '{proof.title}' for {proof.student.name}."
        ))

    db.commit()
    return {"message": f"Proof marked as '{req.status}'.", "status": proof.status}

# ----------------------------------------------------
# 5. DOUBT MANAGEMENT
# ----------------------------------------------------
@router.get("/doubts")
def get_lecturer_doubts(
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lec = get_lecturer_profile(current_user, db)
    assignments = db.query(SubjectAssignment).filter(SubjectAssignment.lecturer_id == lec.id).all()
    assigned_subject_ids = list(set(a.subject_id for a in assignments))
    assigned_sections = list(set(a.section for a in assignments))

    query = (
        db.query(Doubt)
        .filter(
            Doubt.subject_id.in_(assigned_subject_ids),
            Doubt.section.in_(assigned_sections)
        )
    )
    if status_filter and status_filter != "All":
        query = query.filter(Doubt.status == status_filter)

    doubts = query.order_by(Doubt.created_at.desc()).all()
    result = []
    for d in doubts:
        result.append({
            "id": d.id,
            "student_id": d.student_id,
            "student_name": d.student.name if d.student else "Student",
            "usn": d.student.usn if d.student else "",
            "section": d.section,
            "subject_name": d.subject.name if d.subject else "",
            "title": d.title,
            "description": d.description,
            "file_url": d.file_url,
            "status": d.status,
            "created_at": d.created_at.strftime("%b %d, %Y %H:%M"),
            "replies": [
                {
                    "id": r.id,
                    "user_name": r.user.name if r.user else "User",
                    "role": r.user.role if r.user else "",
                    "message": r.message,
                    "file_url": r.file_url,
                    "created_at": r.created_at.strftime("%b %d, %H:%M")
                }
                for r in d.replies
            ]
        })
    return result

@router.post("/doubts/{id}/reply")
def reply_to_doubt(
    id: int,
    req: DoubtReplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doubt = db.query(Doubt).filter(Doubt.id == id).first()
    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt not found.")

    reply = DoubtReply(
        doubt_id=doubt.id,
        user_id=current_user.id,
        message=req.message.strip(),
        file_url=req.file_url,
        created_at=datetime.utcnow()
    )
    db.add(reply)

    if req.mark_resolved:
        doubt.status = "Resolved"
    else:
        doubt.status = "Answered"

    db.commit()
    return {"message": "Reply posted successfully.", "status": doubt.status}

# ----------------------------------------------------
# 6. STUDY MATERIALS (CATEGORIZED: FAST, AVG, SLOW)
# ----------------------------------------------------
@router.get("/materials")
def get_lecturer_materials(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lec = get_lecturer_profile(current_user, db)
    assignments = db.query(SubjectAssignment).filter(SubjectAssignment.lecturer_id == lec.id).all()
    assigned_sub_ids = list(set(a.subject_id for a in assignments))

    query = db.query(StudyMaterial)
    if assigned_sub_ids:
        query = query.filter(
            (StudyMaterial.uploaded_by == current_user.id) | (StudyMaterial.subject_id.in_(assigned_sub_ids))
        )
    materials = query.order_by(StudyMaterial.created_at.desc()).all()
    return [
        {
            "id": m.id,
            "title": m.title,
            "subject_id": m.subject_id,
            "subject_name": m.subject.name if m.subject else "",
            "section": m.section,
            "learner_category": m.learner_category,
            "material_type": m.material_type,
            "file_url": m.file_url,
            "description": m.description,
            "created_at": m.created_at.strftime("%b %d, %Y")
        }
        for m in materials
    ]

@router.post("/materials")
def create_lecturer_material(
    data: StudyMaterialCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mat = StudyMaterial(
        title=data.title.strip(),
        subject_id=data.subject_id,
        section=data.section,
        learner_category=data.learner_category,
        material_type=data.material_type,
        file_url=data.file_url,
        description=data.description,
        uploaded_by=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(mat)
    db.commit()
    return {"message": f"Material published for {data.learner_category} learners.", "id": mat.id}

# ----------------------------------------------------
# 7. ONLINE TESTS & ATTEMPTS
# ----------------------------------------------------
@router.get("/tests")
def get_lecturer_tests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lec = get_lecturer_profile(current_user, db)
    tests = db.query(OnlineTest).filter(OnlineTest.created_by == lec.id).order_by(OnlineTest.created_at.desc()).all()
    result = []
    for t in tests:
        attempts = db.query(StudentTestAttempt).filter(StudentTestAttempt.test_id == t.id).all()
        avg_score = round(sum(a.score for a in attempts) / len(attempts), 1) if attempts else 0.0
        result.append({
            "id": t.id,
            "title": t.title,
            "subject_name": t.subject.name if t.subject else "",
            "section": t.section,
            "duration_minutes": t.duration_minutes,
            "total_marks": t.total_marks,
            "passing_marks": t.passing_marks,
            "questions_count": len(t.questions),
            "attempts_count": len(attempts),
            "average_score": avg_score,
            "created_at": t.created_at.strftime("%b %d, %Y")
        })
    return result

@router.post("/tests")
def create_online_test(
    data: TestCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lec = get_lecturer_profile(current_user, db)
    new_test = OnlineTest(
        title=data.title.strip(),
        subject_id=data.subject_id,
        section=data.section,
        created_by=lec.id,
        duration_minutes=data.duration_minutes,
        total_marks=data.total_marks,
        passing_marks=data.passing_marks,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(new_test)
    db.flush()

    for q in data.questions:
        db.add(TestQuestion(
            test_id=new_test.id,
            question_text=q.question_text.strip(),
            option_a=q.option_a.strip(),
            option_b=q.option_b.strip(),
            option_c=q.option_c.strip(),
            option_d=q.option_d.strip(),
            correct_option=q.correct_option.upper(),
            explanation=q.explanation,
            marks=q.marks
        ))

    db.commit()
    return {"message": "Online test published successfully.", "id": new_test.id}

