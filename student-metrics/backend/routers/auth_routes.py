import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Lecturer, Student, SubjectAssignment, Subject
from schemas import GoogleLoginRequest, DemoLoginRequest, LoginResponse
from auth import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def get_user_profile_payload(user: User, db: Session):
    profile_data = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "role": user.role,
    }

    if user.role == "lecturer":
        lec = db.query(Lecturer).filter(Lecturer.user_id == user.id).first()
        if lec:
            assignments = (
                db.query(SubjectAssignment, Subject.name.label("subject_name"))
                .join(Subject, SubjectAssignment.subject_id == Subject.id)
                .filter(SubjectAssignment.lecturer_id == lec.id)
                .all()
            )
            profile_data["lecturer"] = {
                "id": lec.id,
                "employee_id": lec.employee_id,
                "department": lec.department,
                "qualification": lec.qualification,
                "phone": lec.phone,
                "is_verified": lec.is_verified,
                "assignments": [
                    {"subject_id": a.SubjectAssignment.subject_id, "subject_name": a.subject_name, "section": a.SubjectAssignment.section}
                    for a in assignments
                ]
            }
    elif user.role == "student":
        stu = db.query(Student).filter(Student.user_id == user.id).first()
        if stu:
            profile_data["student"] = {
                "id": stu.id,
                "student_id": stu.student_id,
                "usn": stu.usn,
                "name": stu.name,
                "section": stu.section,
                "semester": stu.semester,
                "attendance": stu.attendance,
            }

    return profile_data

@router.post("/demo-login", response_model=LoginResponse)
def demo_login(req: DemoLoginRequest, db: Session = Depends(get_db)):
    """
    1-Click Quick Login for testing and demonstrating Admin, Lecturer, and Student portals.
    """
    user = None
    role = req.role.lower()

    if role == "admin":
        user = db.query(User).filter(User.role == "admin").first()
        if not user:
            # Fallback create admin
            user = User(
                email="admin@studentmetrics.edu",
                name="Dr. S. K. Sharma",
                picture="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                role="admin",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    elif role == "lecturer":
        if req.email:
            user = db.query(User).filter(User.email == req.email, User.role == "lecturer").first()
        if not user:
            # Default to Dr. Vikram Hegde or first lecturer
            user = db.query(User).filter(User.role == "lecturer").first()
        if not user:
            raise HTTPException(status_code=404, detail="No lecturer account found.")

    elif role == "student":
        if req.usn:
            stu = db.query(Student).filter(Student.usn == req.usn.strip().upper()).first()
            if stu and stu.user:
                user = stu.user
            elif stu:
                # Link student to new user account
                user = User(
                    email=f"{stu.usn.lower()}@studentmetrics.edu",
                    name=stu.name,
                    role="student",
                    is_active=True
                )
                db.add(user)
                db.flush()
                stu.user_id = user.id
                db.commit()
                db.refresh(user)
        elif req.email:
            user = db.query(User).filter(User.email == req.email, User.role == "student").first()

        if not user:
            # Default to first student with user account or first student in DB
            user = db.query(User).filter(User.role == "student").first()
            if not user:
                stu = db.query(Student).first()
                if stu:
                    user = User(
                        email=f"{stu.usn.lower()}@studentmetrics.edu",
                        name=stu.name,
                        role="student",
                        is_active=True
                    )
                    db.add(user)
                    db.flush()
                    stu.user_id = user.id
                    db.commit()
                    db.refresh(user)

    if not user:
        raise HTTPException(status_code=400, detail=f"Invalid demo login credentials for role '{req.role}'.")

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role, "name": user.name})
    user_payload = get_user_profile_payload(user, db)

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user_payload
    )

@router.post("/google", response_model=LoginResponse)
def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Google OAuth 2.0 Login / Registration.
    Checks existing user by email or google_id.
    Admin role can NEVER be self-assigned (enforced by DB).
    """
    email = req.email
    name = req.name or "Google User"
    picture = req.picture

    if not email:
        raise HTTPException(status_code=400, detail="Google authentication did not provide a valid email.")

    user = db.query(User).filter(User.email == email.lower()).first()

    if not user:
        # Determine initial role: Check if it's admin email, lecturer email, or student
        assigned_role = "student"
        if email.lower() == "admin@studentmetrics.edu":
            assigned_role = "admin"
        elif req.role in ["lecturer", "student"] and req.role != "admin":
            assigned_role = req.role

        user = User(
            email=email.lower(),
            name=name,
            picture=picture,
            role=assigned_role,
            is_active=True
        )
        db.add(user)
        db.flush()

        # If student, link to first available unassigned student or create profile
        if assigned_role == "student":
            free_student = db.query(Student).filter(Student.user_id == None).first()
            if free_student:
                free_student.user_id = user.id
        db.commit()
        db.refresh(user)
    else:
        # Update picture and name from Google
        if picture:
            user.picture = picture
        if name and user.name != name:
            user.name = name
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role, "name": user.name})
    user_payload = get_user_profile_payload(user, db)

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user_payload
    )

@router.get("/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns current authenticated user details and linked role profile.
    """
    return get_user_profile_payload(current_user, db)

@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    """
    Provides demo accounts list for the login page switcher.
    """
    admin = db.query(User).filter(User.role == "admin").first()
    lecturers = (
        db.query(User, Lecturer.employee_id, Lecturer.department)
        .join(Lecturer, Lecturer.user_id == User.id)
        .filter(User.role == "lecturer")
        .all()
    )
    students = (
        db.query(Student, User.email, User.picture)
        .join(User, Student.user_id == User.id)
        .limit(6)
        .all()
    )

    return {
        "admin": {
            "email": admin.email if admin else "admin@studentmetrics.edu",
            "name": admin.name if admin else "Dr. S. K. Sharma",
            "role": "admin"
        },
        "lecturers": [
            {
                "email": u.User.email,
                "name": u.User.name,
                "employee_id": u.employee_id,
                "department": u.department,
                "role": "lecturer"
            }
            for u in lecturers
        ],
        "students": [
            {
                "email": s.email,
                "name": s.Student.name,
                "usn": s.Student.usn,
                "section": s.Student.section,
                "role": "student"
            }
            for s in students
        ]
    }

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

