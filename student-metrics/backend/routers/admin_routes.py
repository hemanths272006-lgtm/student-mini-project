import os
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import (
    User, Lecturer, SubjectAssignment, Student, Subject, Assessment, Mark,
    StudyProof, Doubt, DoubtReply, StudyMaterial, PreviousYearPaper,
    Timetable, ActivityLog
)
from schemas import (
    LecturerCreateRequest, LecturerUpdateRequest, LecturerVerifyRequest,
    StudyMaterialCreateRequest, PreviousYearPaperCreate
)
from auth import require_roles, hash_password
from analysis import (
    classify_learner, calculate_learning_trend, compute_student_metrics
)

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Portal"],
    dependencies=[Depends(require_roles(["admin"]))]
)

# Helper for student calculated data
def get_student_metrics(student: Student, db: Session):
    marks_query = (
        db.query(Mark.score, Subject.name.label("subject_name"), Assessment.name.label("assessment_name"))
        .join(Subject, Mark.subject_id == Subject.id)
        .join(Assessment, Mark.assessment_id == Assessment.id)
        .filter(Mark.student_id == student.id)
        .all()
    )
    marks_list = [{"subject_name": m.subject_name, "assessment_name": m.assessment_name, "score": m.score} for m in marks_query]
    return compute_student_metrics(marks_list, student.attendance)

# ----------------------------------------------------
# 1. ADMIN DASHBOARD
# ----------------------------------------------------
@router.get("/dashboard")
def get_admin_dashboard(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    lecturers = db.query(Lecturer).all()
    subjects = db.query(Subject).all()

    total_students = len(students)
    total_lecturers = len(lecturers)
    total_subjects = len(subjects)
    total_sections = 3

    # Calculate student metrics
    all_student_metrics = [get_student_metrics(s, db) for s in students]

    fast_count = sum(1 for m in all_student_metrics if m["category"] == "Fast Learner")
    avg_count = sum(1 for m in all_student_metrics if m["category"] == "Average Learner")
    slow_count = sum(1 for m in all_student_metrics if m["category"] == "Slow Learner")

    improving_count = sum(1 for m in all_student_metrics if m["trend"] == "Improving")
    declining_count = sum(1 for m in all_student_metrics if m["trend"] == "Declining")
    consistent_count = sum(1 for m in all_student_metrics if m["trend"] == "Consistent")

    overall_avg = round(sum(m["overall_average"] for m in all_student_metrics) / total_students, 2) if total_students else 0.0
    avg_attendance = round(sum(s.attendance for s in students) / total_students, 1) if total_students else 0.0

    # Verification counts
    pending_lecturer_verifications = db.query(Lecturer).filter(Lecturer.is_verified == False).count()
    pending_proof_verifications = db.query(StudyProof).filter(StudyProof.status == "Pending").count()
    pending_doubts = db.query(Doubt).filter(Doubt.status == "Pending").count()

    # Recent activities
    recent_activities = (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(8)
        .all()
    )

    # Section comparisons
    section_performance = []
    for sec in ["A", "B", "C"]:
        sec_students = [s for s in students if s.section == sec]
        sec_total = len(sec_students)
        if sec_total > 0:
            sec_metrics = [get_student_metrics(s, db) for s in sec_students]
            sec_avg = round(sum(m["overall_average"] for m in sec_metrics) / sec_total, 2)
            sec_att = round(sum(s.attendance for s in sec_students) / sec_total, 1)
            section_performance.append({
                "section": f"Section {sec}",
                "total": sec_total,
                "average": sec_avg,
                "fast_count": sum(1 for m in sec_metrics if m["category"] == "Fast Learner"),
                "avg_count": sum(1 for m in sec_metrics if m["category"] == "Average Learner"),
                "slow_count": sum(1 for m in sec_metrics if m["category"] == "Slow Learner"),
                "attendance": sec_att
            })

    # Subject performance
    subject_performance = []
    for subj in subjects:
        scores = [m.score for m in db.query(Mark.score).filter(Mark.subject_id == subj.id).all()]
        if scores:
            subject_performance.append({
                "subject": subj.name,
                "average": round(sum(scores) / len(scores), 2),
                "highest": round(max(scores), 1),
                "lowest": round(min(scores), 1)
            })

    return {
        "kpi": {
            "total_students": total_students,
            "total_lecturers": total_lecturers,
            "total_subjects": total_subjects,
            "total_sections": total_sections,
            "fast_learners": fast_count,
            "average_learners": avg_count,
            "slow_learners": slow_count,
            "overall_average": overall_avg,
            "average_attendance": avg_attendance,
            "improving_count": improving_count,
            "declining_count": declining_count,
            "consistent_count": consistent_count,
            "pending_lecturer_verifications": pending_lecturer_verifications,
            "pending_proof_verifications": pending_proof_verifications,
            "pending_doubts": pending_doubts,
        },
        "charts": {
            "learner_distribution": [
                {"name": "Fast Learner", "count": fast_count, "color": "#10B981"},
                {"name": "Average Learner", "count": avg_count, "color": "#3B82F6"},
                {"name": "Slow Learner", "count": slow_count, "color": "#EF4444"},
            ],
            "section_comparison": section_performance,
            "subject_performance": subject_performance,
            "trend_distribution": {
                "Improving": improving_count,
                "Consistent": consistent_count,
                "Declining": declining_count
            }
        },
        "recent_activities": [
            {
                "id": a.id,
                "user_name": a.user_name,
                "action": a.action,
                "details": a.details,
                "time": a.created_at.strftime("%b %d, %H:%M")
            }
            for a in recent_activities
        ]
    }

# ----------------------------------------------------
# 2. LECTURER MANAGEMENT
# ----------------------------------------------------
@router.get("/lecturers")
def get_all_lecturers(db: Session = Depends(get_db)):
    lecturers = db.query(Lecturer).all()
    result = []
    for lec in lecturers:
        assignments = (
            db.query(SubjectAssignment, Subject.name.label("subject_name"))
            .join(Subject, SubjectAssignment.subject_id == Subject.id)
            .filter(SubjectAssignment.lecturer_id == lec.id)
            .all()
        )
        # Check lecturer review activity
        proofs_reviewed = db.query(StudyProof).filter(StudyProof.verified_by == lec.id).count()
        doubts_answered = db.query(DoubtReply).filter(DoubtReply.user_id == lec.user_id).count()

        result.append({
            "id": lec.id,
            "user_id": lec.user_id,
            "name": lec.user.name,
            "email": lec.user.email,
            "picture": lec.user.picture,
            "employee_id": lec.employee_id,
            "department": lec.department,
            "qualification": lec.qualification,
            "phone": lec.phone,
            "is_verified": lec.is_verified,
            "is_active": lec.is_active,
            "assignments": [
                {"subject_id": a.SubjectAssignment.subject_id, "subject_name": a.subject_name, "section": a.SubjectAssignment.section}
                for a in assignments
            ],
            "activity": {
                "proofs_reviewed": proofs_reviewed,
                "doubts_answered": doubts_answered
            }
        })
    return result

@router.post("/lecturers")
def create_lecturer(data: LecturerCreateRequest, db: Session = Depends(get_db)):
    # Check email uniqueness
    existing_user = db.query(User).filter(User.email == data.email.strip().lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    user = User(
        email=data.email.strip().lower(),
        name=data.name.strip(),
        role="lecturer",
        password_hash=hash_password("lecturer123"),
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.flush()

    lec = Lecturer(
        user_id=user.id,
        employee_id=data.employee_id.strip().upper(),
        department=data.department.strip(),
        qualification=data.qualification.strip(),
        phone=data.phone,
        is_verified=True,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(lec)
    db.flush()

    sub_map = {s.name.lower(): s.id for s in db.query(Subject).all()}
    for asgn in data.assignments:
        s_id = sub_map.get(asgn.subject_name.lower())
        if s_id:
            db.add(SubjectAssignment(
                lecturer_id=lec.id,
                subject_id=s_id,
                section=asgn.section.upper()
            ))

    db.add(ActivityLog(
        user_name="Admin",
        action="Added Lecturer",
        details=f"Registered lecturer {data.name} ({data.employee_id})."
    ))

    db.commit()
    return {"message": f"Lecturer '{data.name}' registered successfully.", "id": lec.id}

@router.put("/lecturers/{id}")
def update_lecturer(id: int, data: LecturerUpdateRequest, db: Session = Depends(get_db)):
    lec = db.query(Lecturer).filter(Lecturer.id == id).first()
    if not lec:
        raise HTTPException(status_code=404, detail="Lecturer not found.")

    if data.name:
        lec.user.name = data.name.strip()
    if data.department:
        lec.department = data.department.strip()
    if data.qualification:
        lec.qualification = data.qualification.strip()
    if data.phone is not None:
        lec.phone = data.phone
    if data.is_active is not None:
        lec.is_active = data.is_active
        lec.user.is_active = data.is_active

    if data.assignments is not None:
        # Re-assign
        db.query(SubjectAssignment).filter(SubjectAssignment.lecturer_id == lec.id).delete()
        sub_map = {s.name.lower(): s.id for s in db.query(Subject).all()}
        for asgn in data.assignments:
            s_id = sub_map.get(asgn.subject_name.lower())
            if s_id:
                db.add(SubjectAssignment(
                    lecturer_id=lec.id,
                    subject_id=s_id,
                    section=asgn.section.upper()
                ))

    db.commit()
    return {"message": "Lecturer details updated successfully."}

@router.put("/lecturers/{id}/verify")
def verify_lecturer(id: int, req: LecturerVerifyRequest, db: Session = Depends(get_db)):
    lec = db.query(Lecturer).filter(Lecturer.id == id).first()
    if not lec:
        raise HTTPException(status_code=404, detail="Lecturer not found.")

    if req.action == "approve":
        lec.is_verified = True
        db.add(ActivityLog(
            user_name="Admin",
            action="Approved Lecturer",
            details=f"Approved verification for {lec.user.name}."
        ))
        msg = f"Verification approved for {lec.user.name}."
    else:
        lec.is_verified = False
        db.add(ActivityLog(
            user_name="Admin",
            action="Rejected Lecturer Verification",
            details=f"Rejected verification for {lec.user.name}."
        ))
        msg = f"Verification rejected for {lec.user.name}."

    db.commit()
    return {"message": msg, "is_verified": lec.is_verified}

@router.delete("/lecturers/{id}")
def delete_lecturer(id: int, db: Session = Depends(get_db)):
    lec = db.query(Lecturer).filter(Lecturer.id == id).first()
    if not lec:
        raise HTTPException(status_code=404, detail="Lecturer not found.")

    user = lec.user
    db.delete(lec)
    if user:
        db.delete(user)
    db.commit()
    return {"message": "Lecturer deleted successfully."}

# ----------------------------------------------------
# 3. SECTION MANAGEMENT
# ----------------------------------------------------
@router.get("/sections/{sec}")
def get_section_details(sec: str, db: Session = Depends(get_db)):
    section_code = sec.strip().upper()
    if section_code not in ["A", "B", "C"]:
        raise HTTPException(status_code=400, detail="Section must be A, B, or C.")

    students = db.query(Student).filter(Student.section == section_code).all()
    total = len(students)

    all_data = []
    for s in students:
        metrics = get_student_metrics(s, db)
        all_data.append({
            "id": s.id,
            "student_id": s.student_id,
            "usn": s.usn,
            "name": s.name,
            "section": s.section,
            "attendance": s.attendance,
            "overall_average": metrics["overall_average"],
            "category": metrics["category"],
            "trend": metrics["trend"],
            "highest_subject": metrics["highest_subject"],
            "lowest_subject": metrics["lowest_subject"],
            "subject_averages": metrics["subject_averages"]
        })

    avg_score = round(sum(d["overall_average"] for d in all_data) / total, 2) if total else 0.0
    avg_att = round(sum(d["attendance"] for d in all_data) / total, 1) if total else 0.0

    fast_count = sum(1 for d in all_data if d["category"] == "Fast Learner")
    avg_count = sum(1 for d in all_data if d["category"] == "Average Learner")
    slow_count = sum(1 for d in all_data if d["category"] == "Slow Learner")

    return {
        "section": f"Section {section_code}",
        "total_students": total,
        "average_score": avg_score,
        "average_attendance": avg_att,
        "fast_learners": fast_count,
        "average_learners": avg_count,
        "slow_learners": slow_count,
        "students": all_data
    }

# ----------------------------------------------------
# 4. DOUBT MANAGEMENT (ADMIN VIEW & MODERATION)
# ----------------------------------------------------
@router.get("/doubts")
def get_admin_doubts(
    section: Optional[str] = Query(None),
    subject_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Doubt)
    if section and section != "All":
        query = query.filter(Doubt.section == section.upper())
    if subject_id:
        query = query.filter(Doubt.subject_id == subject_id)
    if status and status != "All":
        query = query.filter(Doubt.status == status)

    doubts = query.order_by(Doubt.created_at.desc()).all()
    result = []
    for d in doubts:
        replies_count = len(d.replies)
        result.append({
            "id": d.id,
            "student_name": d.student.name if d.student else "Student",
            "usn": d.student.usn if d.student else "",
            "section": d.section,
            "subject_name": d.subject.name if d.subject else "",
            "title": d.title,
            "description": d.description,
            "file_url": d.file_url,
            "status": d.status,
            "replies_count": replies_count,
            "created_at": d.created_at.strftime("%b %d, %Y %H:%M")
        })
    return result

@router.delete("/doubts/{id}")
def delete_doubt(id: int, db: Session = Depends(get_db)):
    d = db.query(Doubt).filter(Doubt.id == id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Doubt not found.")
    db.delete(d)
    db.commit()
    return {"message": "Doubt removed successfully."}

# ----------------------------------------------------
# 5. ACADEMIC MATERIALS & PREVIOUS PAPERS
# ----------------------------------------------------
@router.get("/materials")
def get_all_materials(db: Session = Depends(get_db)):
    materials = db.query(StudyMaterial).order_by(StudyMaterial.created_at.desc()).all()
    papers = db.query(PreviousYearPaper).order_by(PreviousYearPaper.created_at.desc()).all()

    return {
        "study_materials": [
            {
                "id": m.id,
                "title": m.title,
                "subject_name": m.subject.name if m.subject else "",
                "section": m.section,
                "learner_category": m.learner_category,
                "material_type": m.material_type,
                "file_url": m.file_url,
                "description": m.description,
                "uploaded_by": m.uploader.name if m.uploader else "Faculty",
                "created_at": m.created_at.strftime("%b %d, %Y")
            }
            for m in materials
        ],
        "previous_year_papers": [
            {
                "id": p.id,
                "title": p.title,
                "subject_name": p.subject.name if p.subject else "",
                "semester": p.semester,
                "academic_year": p.academic_year,
                "file_url": p.file_url,
                "created_at": p.created_at.strftime("%b %d, %Y")
            }
            for p in papers
        ]
    }

@router.post("/materials")
def create_material(data: StudyMaterialCreateRequest, db: Session = Depends(get_db)):
    mat = StudyMaterial(
        title=data.title.strip(),
        subject_id=data.subject_id,
        section=data.section,
        learner_category=data.learner_category,
        material_type=data.material_type,
        file_url=data.file_url,
        description=data.description,
        created_at=datetime.utcnow()
    )
    db.add(mat)
    db.commit()
    return {"message": "Study material published successfully.", "id": mat.id}

@router.delete("/materials/{id}")
def delete_material(id: int, db: Session = Depends(get_db)):
    mat = db.query(StudyMaterial).filter(StudyMaterial.id == id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found.")
    db.delete(mat)
    db.commit()
    return {"message": "Study material deleted successfully."}

