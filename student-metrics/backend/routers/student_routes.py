import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import (
    User, Student, Subject, Assessment, Mark, StudyProof, Doubt, DoubtReply,
    StudyMaterial, PreviousYearPaper, Timetable, OnlineTest, TestQuestion,
    StudentTestAttempt, ActivityLog
)
from schemas import (
    StudyProofCreate, DoubtCreateRequest, DoubtReplyRequest, TestSubmitRequest
)
from auth import require_roles, get_current_user
from analysis import (
    classify_learner, calculate_learning_trend, compute_student_metrics,
    generate_improvement_suggestions
)

router = APIRouter(
    prefix="/api/student",
    tags=["Student Portal"],
    dependencies=[Depends(require_roles(["student", "admin"]))]
)

def get_student_for_user(current_user: User, db: Session) -> Student:
    """Resolve the Student model record associated with the current user."""
    # 1. Direct foreign key link
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if student:
        return student

    # 2. Match USN from email prefix (e.g., 1MS21CS001@college.edu -> 1MS21CS001)
    email_prefix = current_user.email.split("@")[0].upper()
    student = db.query(Student).filter(Student.usn == email_prefix).first()
    if student:
        # Link user_id for future queries
        student.user_id = current_user.id
        db.commit()
        return student

    # 3. Fallback to first student if admin or demo user
    student = db.query(Student).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No student record found in database."
        )
    return student

def compute_student_full_profile(student: Student, db: Session) -> Dict[str, Any]:
    """Calculate marks, averages, trend, and suggestions for a single student."""
    marks_query = (
        db.query(
            Mark.score,
            Subject.name.label("subject_name"),
            Assessment.name.label("assessment_name"),
            Assessment.order_num.label("assessment_order")
        )
        .join(Subject, Mark.subject_id == Subject.id)
        .join(Assessment, Mark.assessment_id == Assessment.id)
        .filter(Mark.student_id == student.id)
        .order_by(Assessment.order_num)
    )
    marks_records = marks_query.all()
    marks_list = [
        {"subject_name": m.subject_name, "assessment_name": m.assessment_name, "score": m.score}
        for m in marks_records
    ]
    metrics = compute_student_metrics(marks_list, student.attendance)

    # Detailed marks matrix structured by subject
    subjects = db.query(Subject).all()
    assessments = db.query(Assessment).order_by(Assessment.order_num).all()
    
    marks_lookup = {(m.subject_name, m.assessment_name): m.score for m in marks_records}
    marks_matrix = []
    for sub in subjects:
        sub_row = {
            "subject_id": sub.id,
            "subject_name": sub.name,
            "subject_code": sub.code,
            "tests": {},
            "subject_average": metrics["subject_averages"].get(sub.name, 0.0)
        }
        for ass in assessments:
            sub_row["tests"][ass.name] = marks_lookup.get((sub.name, ass.name), 0.0)
        marks_matrix.append(sub_row)

    return {
        "id": student.id,
        "student_id": student.student_id,
        "usn": student.usn,
        "name": student.name,
        "section": student.section,
        "semester": student.semester,
        "attendance": student.attendance,
        "overall_average": metrics["overall_average"],
        "category": metrics["category"],
        "trend": metrics["trend"],
        "highest_subject": metrics["highest_subject"],
        "highest_score": metrics["highest_score"],
        "lowest_subject": metrics["lowest_subject"],
        "lowest_score": metrics["lowest_score"],
        "subject_averages": metrics["subject_averages"],
        "test_averages": metrics["test_averages"],
        "suggestions": metrics["suggestions"],
        "marks_matrix": marks_matrix
    }

# ====================================================
# 1. STUDENT DASHBOARD
# ====================================================

@router.get("/dashboard")
def get_student_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)
    profile = compute_student_full_profile(student, db)

    # Available Online Tests
    tests_query = db.query(OnlineTest).filter(
        OnlineTest.is_active == True,
        OnlineTest.section.in_(["All", student.section])
    ).all()

    attempts = db.query(StudentTestAttempt).filter(StudentTestAttempt.student_id == student.id).all()
    attempts_by_test = {att.test_id: att for att in attempts}

    online_tests_summary = []
    for t in tests_query:
        att = attempts_by_test.get(t.id)
        online_tests_summary.append({
            "id": t.id,
            "title": t.title,
            "subject_name": t.subject.name if t.subject else "General",
            "duration_minutes": t.duration_minutes,
            "total_marks": t.total_marks,
            "passing_marks": t.passing_marks,
            "has_attempted": att is not None,
            "score": att.score if att else None,
            "passed": att.passed if att else None,
            "submitted_at": att.submitted_at.isoformat() if att else None
        })

    # Study Proofs summary
    proofs = db.query(StudyProof).filter(StudyProof.student_id == student.id).order_by(StudyProof.created_at.desc()).all()
    proofs_summary = {
        "total": len(proofs),
        "verified": sum(1 for p in proofs if p.status == "Verified"),
        "pending": sum(1 for p in proofs if p.status == "Pending"),
        "rejected": sum(1 for p in proofs if p.status in ["Rejected", "Resubmission Required"]),
        "recent": [
            {
                "id": p.id,
                "title": p.title,
                "subject_name": p.subject.name if p.subject else "General",
                "study_duration_minutes": p.study_duration_minutes,
                "status": p.status,
                "feedback": p.feedback,
                "created_at": p.created_at.isoformat()
            }
            for p in proofs[:5]
        ]
    }

    # Doubts summary
    doubts = db.query(Doubt).filter(Doubt.student_id == student.id).order_by(Doubt.created_at.desc()).all()
    doubts_summary = {
        "total": len(doubts),
        "pending": sum(1 for d in doubts if d.status == "Pending"),
        "answered": sum(1 for d in doubts if d.status in ["Answered", "Resolved"]),
        "recent": [
            {
                "id": d.id,
                "title": d.title,
                "subject_name": d.subject.name if d.subject else "General",
                "status": d.status,
                "replies_count": len(d.replies),
                "created_at": d.created_at.isoformat()
            }
            for d in doubts[:5]
        ]
    }

    # Recommended Materials based on category
    student_cat = profile["category"]
    rec_materials = db.query(StudyMaterial).filter(
        StudyMaterial.learner_category.in_([student_cat, "All"]),
        StudyMaterial.section.in_([student.section, "All"])
    ).order_by(StudyMaterial.created_at.desc()).limit(6).all()

    materials_list = [
        {
            "id": m.id,
            "title": m.title,
            "subject_name": m.subject.name if m.subject else "General",
            "material_type": m.material_type,
            "learner_category": m.learner_category,
            "file_url": m.file_url,
            "description": m.description
        }
        for m in rec_materials
    ]

    # Weekly Timetable for Section
    tt_records = db.query(Timetable).filter(
        Timetable.section == student.section
    ).order_by(Timetable.day_of_week, Timetable.start_time).all()

    timetable_list = [
        {
            "id": tt.id,
            "day_of_week": tt.day_of_week,
            "start_time": tt.start_time,
            "end_time": tt.end_time,
            "subject_name": tt.subject.name if tt.subject else "",
            "lecturer_name": tt.lecturer_name,
            "room_number": tt.room_number
        }
        for tt in tt_records
    ]

    return {
        "student": profile,
        "kpi": {
            "overall_average": profile["overall_average"],
            "attendance": profile["attendance"],
            "category": profile["category"],
            "trend": profile["trend"],
            "tests_completed": len(attempts),
            "total_tests_available": len(tests_query),
            "proofs_verified": proofs_summary["verified"],
            "proofs_pending": proofs_summary["pending"],
            "doubts_total": doubts_summary["total"],
            "doubts_answered": doubts_summary["answered"]
        },
        "online_tests": online_tests_summary,
        "proofs": proofs_summary,
        "doubts": doubts_summary,
        "recommended_materials": materials_list,
        "timetable": timetable_list
    }

# ====================================================
# 2. ONLINE TESTS & ATTEMPTS
# ====================================================

@router.get("/tests")
def get_student_tests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)
    tests = db.query(OnlineTest).filter(
        OnlineTest.is_active == True,
        OnlineTest.section.in_(["All", student.section])
    ).all()

    attempts = db.query(StudentTestAttempt).filter(StudentTestAttempt.student_id == student.id).all()
    attempts_map = {att.test_id: att for att in attempts}

    result = []
    for t in tests:
        att = attempts_map.get(t.id)
        result.append({
            "id": t.id,
            "title": t.title,
            "subject_id": t.subject_id,
            "subject_name": t.subject.name if t.subject else "General",
            "duration_minutes": t.duration_minutes,
            "total_marks": t.total_marks,
            "passing_marks": t.passing_marks,
            "question_count": len(t.questions),
            "has_attempted": att is not None,
            "score": att.score if att else None,
            "passed": att.passed if att else None,
            "percentage": round((att.score / att.total_marks * 100), 1) if (att and att.total_marks > 0) else None,
            "submitted_at": att.submitted_at.isoformat() if att else None
        })

    return result

@router.get("/tests/{test_id}")
def get_test_for_taking(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)
    test = db.query(OnlineTest).filter(OnlineTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")

    # Check if student already attempted
    existing_attempt = db.query(StudentTestAttempt).filter(
        StudentTestAttempt.test_id == test_id,
        StudentTestAttempt.student_id == student.id
    ).first()

    # Hide correct answers from active test questions
    questions = []
    for q in test.questions:
        questions.append({
            "id": q.id,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "marks": q.marks
        })

    return {
        "id": test.id,
        "title": test.title,
        "subject_name": test.subject.name if test.subject else "General",
        "duration_minutes": test.duration_minutes,
        "total_marks": test.total_marks,
        "passing_marks": test.passing_marks,
        "has_attempted": existing_attempt is not None,
        "questions": questions
    }

@router.post("/tests/{test_id}/submit")
def submit_test_attempt(
    test_id: int,
    payload: TestSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)
    test = db.query(OnlineTest).filter(OnlineTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")

    # Auto-grade
    earned_score = 0.0
    total_marks = 0.0
    breakdown = []

    for q in test.questions:
        q_marks = q.marks or 2.0
        total_marks += q_marks
        user_choice = payload.answers.get(str(q.id), "").strip().upper()
        is_correct = (user_choice == q.correct_option.strip().upper()) if user_choice else False
        points_awarded = q_marks if is_correct else 0.0
        earned_score += points_awarded

        breakdown.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "chosen_option": user_choice,
            "correct_option": q.correct_option,
            "is_correct": is_correct,
            "marks_awarded": points_awarded,
            "max_marks": q_marks,
            "explanation": q.explanation
        })

    passed = earned_score >= test.passing_marks
    percentage = round((earned_score / total_marks * 100), 1) if total_marks > 0 else 0.0

    # Save or update attempt
    existing_attempt = db.query(StudentTestAttempt).filter(
        StudentTestAttempt.test_id == test_id,
        StudentTestAttempt.student_id == student.id
    ).first()

    if existing_attempt:
        existing_attempt.score = earned_score
        existing_attempt.total_marks = total_marks
        existing_attempt.passed = passed
        existing_attempt.answers_json = json.dumps(payload.answers)
        existing_attempt.submitted_at = datetime.utcnow()
    else:
        attempt = StudentTestAttempt(
            test_id=test_id,
            student_id=student.id,
            score=earned_score,
            total_marks=total_marks,
            passed=passed,
            answers_json=json.dumps(payload.answers),
            submitted_at=datetime.utcnow()
        )
        db.add(attempt)

    # Activity log
    db.add(ActivityLog(
        user_id=current_user.id,
        user_name=current_user.name,
        action="Completed Online Test",
        details=f"Test '{test.title}' scored {earned_score}/{total_marks} ({percentage}%)"
    ))

    db.commit()

    return {
        "success": True,
        "test_id": test.id,
        "title": test.title,
        "score": earned_score,
        "total_marks": total_marks,
        "percentage": percentage,
        "passed": passed,
        "passing_marks": test.passing_marks,
        "breakdown": breakdown
    }

@router.get("/tests/{test_id}/results")
def get_test_results(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)
    test = db.query(OnlineTest).filter(OnlineTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")

    attempt = db.query(StudentTestAttempt).filter(
        StudentTestAttempt.test_id == test_id,
        StudentTestAttempt.student_id == student.id
    ).first()

    if not attempt:
        raise HTTPException(status_code=404, detail="No attempt found for this test.")

    answers = json.loads(attempt.answers_json or "{}")
    breakdown = []
    for q in test.questions:
        q_marks = q.marks or 2.0
        user_choice = answers.get(str(q.id), "").strip().upper()
        is_correct = (user_choice == q.correct_option.strip().upper()) if user_choice else False
        breakdown.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "chosen_option": user_choice,
            "correct_option": q.correct_option,
            "is_correct": is_correct,
            "marks_awarded": q_marks if is_correct else 0.0,
            "max_marks": q_marks,
            "explanation": q.explanation
        })

    percentage = round((attempt.score / attempt.total_marks * 100), 1) if attempt.total_marks > 0 else 0.0

    return {
        "test_id": test.id,
        "title": test.title,
        "subject_name": test.subject.name if test.subject else "General",
        "score": attempt.score,
        "total_marks": attempt.total_marks,
        "percentage": percentage,
        "passed": attempt.passed,
        "passing_marks": test.passing_marks,
        "submitted_at": attempt.submitted_at.isoformat(),
        "breakdown": breakdown
    }

# ====================================================
# 3. STUDY PROOFS
# ====================================================

@router.get("/proofs")
def get_student_study_proofs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)
    proofs = db.query(StudyProof).filter(
        StudyProof.student_id == student.id
    ).order_by(StudyProof.created_at.desc()).all()

    return [
        {
            "id": p.id,
            "title": p.title,
            "subject_id": p.subject_id,
            "subject_name": p.subject.name if p.subject else "General",
            "description": p.description,
            "file_url": p.file_url,
            "file_type": p.file_type,
            "study_duration_minutes": p.study_duration_minutes,
            "status": p.status,
            "feedback": p.feedback,
            "verified_by_name": p.verifier.user.name if (p.verifier and p.verifier.user) else None,
            "verified_at": p.verified_at.isoformat() if p.verified_at else None,
            "created_at": p.created_at.isoformat()
        }
        for p in proofs
    ]

@router.post("/proofs")
def submit_study_proof(
    payload: StudyProofCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)
    
    proof = StudyProof(
        student_id=student.id,
        subject_id=payload.subject_id,
        title=payload.title,
        description=payload.description,
        file_url=payload.file_url,
        file_type=payload.file_type,
        study_duration_minutes=payload.study_duration_minutes,
        status="Pending",
        created_at=datetime.utcnow()
    )
    db.add(proof)

    db.add(ActivityLog(
        user_id=current_user.id,
        user_name=current_user.name,
        action="Uploaded Study Proof",
        details=f"Submitted proof '{payload.title}' ({payload.study_duration_minutes} mins)"
    ))

    db.commit()
    db.refresh(proof)

    return {
        "success": True,
        "message": "Study proof submitted successfully. Pending lecturer verification.",
        "proof_id": proof.id
    }

# ====================================================
# 4. STUDY MATERIALS & PAPERS
# ====================================================

@router.get("/materials")
def get_student_materials(
    category: Optional[str] = Query(None),
    subject_id: Optional[int] = Query(None),
    all_levels: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)
    profile = compute_student_full_profile(student, db)

    query = db.query(StudyMaterial)

    if not all_levels:
        target_cat = category or profile["category"]
        query = query.filter(StudyMaterial.learner_category.in_([target_cat, "All"]))
        query = query.filter(StudyMaterial.section.in_([student.section, "All"]))
    else:
        if category:
            query = query.filter(StudyMaterial.learner_category == category)

    if subject_id:
        query = query.filter(StudyMaterial.subject_id == subject_id)

    materials = query.order_by(StudyMaterial.created_at.desc()).all()

    return {
        "student_category": profile["category"],
        "materials": [
            {
                "id": m.id,
                "title": m.title,
                "subject_id": m.subject_id,
                "subject_name": m.subject.name if m.subject else "General",
                "section": m.section,
                "learner_category": m.learner_category,
                "material_type": m.material_type,
                "file_url": m.file_url,
                "description": m.description,
                "uploader_name": m.uploader.name if m.uploader else "Faculty",
                "created_at": m.created_at.isoformat()
            }
            for m in materials
        ]
    }

@router.get("/previous-papers")
def get_previous_year_papers(
    subject_id: Optional[int] = Query(None),
    academic_year: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(PreviousYearPaper)
    if subject_id:
        query = query.filter(PreviousYearPaper.subject_id == subject_id)
    if academic_year:
        query = query.filter(PreviousYearPaper.academic_year == academic_year)

    papers = query.order_by(PreviousYearPaper.academic_year.desc(), PreviousYearPaper.title).all()

    return [
        {
            "id": p.id,
            "title": p.title,
            "subject_id": p.subject_id,
            "subject_name": p.subject.name if p.subject else "General",
            "semester": p.semester,
            "academic_year": p.academic_year,
            "file_url": p.file_url,
            "uploader_name": p.uploader.name if p.uploader else "Academic Dept",
            "created_at": p.created_at.isoformat()
        }
        for p in papers
    ]

# ====================================================
# 5. WEEKLY TIMETABLE
# ====================================================

@router.get("/timetable")
def get_student_timetable(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)
    entries = db.query(Timetable).filter(
        Timetable.section == student.section
    ).order_by(Timetable.day_of_week, Timetable.start_time).all()

    # Sort days conventionally
    day_order = {"Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6}
    sorted_entries = sorted(entries, key=lambda x: (day_order.get(x.day_of_week, 7), x.start_time))

    return {
        "section": student.section,
        "entries": [
            {
                "id": e.id,
                "day_of_week": e.day_of_week,
                "start_time": e.start_time,
                "end_time": e.end_time,
                "subject_id": e.subject_id,
                "subject_name": e.subject.name if e.subject else "",
                "lecturer_name": e.lecturer_name,
                "room_number": e.room_number
            }
            for e in sorted_entries
        ]
    }

# ====================================================
# 6. DOUBTS & FORUM
# ====================================================

@router.get("/doubts")
def get_student_doubts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)
    doubts = db.query(Doubt).filter(
        Doubt.student_id == student.id
    ).order_by(Doubt.created_at.desc()).all()

    result = []
    for d in doubts:
        replies = [
            {
                "id": r.id,
                "user_name": r.user.name if r.user else "User",
                "user_role": r.user.role if r.user else "User",
                "message": r.message,
                "file_url": r.file_url,
                "created_at": r.created_at.isoformat()
            }
            for r in d.replies
        ]
        result.append({
            "id": d.id,
            "title": d.title,
            "subject_id": d.subject_id,
            "subject_name": d.subject.name if d.subject else "General",
            "section": d.section,
            "description": d.description,
            "file_url": d.file_url,
            "status": d.status,
            "created_at": d.created_at.isoformat(),
            "replies": replies
        })

    return result

@router.post("/doubts")
def create_student_doubt(
    payload: DoubtCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)

    doubt = Doubt(
        student_id=student.id,
        subject_id=payload.subject_id,
        section=student.section,
        title=payload.title,
        description=payload.description,
        file_url=payload.file_url,
        status="Pending",
        created_at=datetime.utcnow()
    )
    db.add(doubt)

    db.add(ActivityLog(
        user_id=current_user.id,
        user_name=current_user.name,
        action="Asked Academic Doubt",
        details=f"Submitted doubt: '{payload.title}'"
    ))

    db.commit()
    db.refresh(doubt)

    return {
        "success": True,
        "message": "Doubt submitted successfully. Faculty will respond shortly.",
        "doubt_id": doubt.id
    }

@router.post("/doubts/{doubt_id}/reply")
def reply_to_doubt(
    doubt_id: int,
    payload: DoubtReplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = get_student_for_user(current_user, db)
    doubt = db.query(Doubt).filter(
        Doubt.id == doubt_id,
        Doubt.student_id == student.id
    ).first()

    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt thread not found or unauthorized.")

    reply = DoubtReply(
        doubt_id=doubt_id,
        user_id=current_user.id,
        message=payload.message,
        file_url=payload.file_url,
        created_at=datetime.utcnow()
    )
    db.add(reply)
    db.commit()

    return {"success": True, "message": "Reply added successfully."}

# ====================================================
# 7. PRIVATE OFFICIAL REPORT CARD
# ====================================================

@router.get("/report-card")
def get_private_report_card(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns private report card exclusively for the logged-in student.
    Strictly blocked for other students.
    """
    student = get_student_for_user(current_user, db)
    profile = compute_student_full_profile(student, db)

    # Academic metadata
    return {
        "institution_name": "Autonomous Institute of Engineering & Technology",
        "department": "Department of Computer Science & Engineering",
        "academic_year": "2025 - 2026",
        "student": profile,
        "generated_at": datetime.utcnow().strftime("%B %d, %Y at %I:%M %p"),
        "signature_title": "Dean of Academics & Controller of Examinations"
    }
