from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from database import Base

# ====================================================
# 1. CORE ACADEMIC MODELS (PRESERVED & EXTENDED)
# ====================================================

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(20), unique=True, index=True, nullable=False)
    usn = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    section = Column(String(5), nullable=False, index=True)  # "A", "B", "C"
    semester = Column(Integer, default=4)
    attendance = Column(Float, default=85.0)  # percentage (0.0 to 100.0)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, unique=True)

    # Relationships
    marks = relationship("Mark", back_populates="student", cascade="all, delete-orphan")
    user = relationship("User", back_populates="student_profile")
    proofs = relationship("StudyProof", back_populates="student", cascade="all, delete-orphan")
    doubts = relationship("Doubt", back_populates="student", cascade="all, delete-orphan")
    test_attempts = relationship("StudentTestAttempt", back_populates="student", cascade="all, delete-orphan")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)

    marks = relationship("Mark", back_populates="subject")
    assignments = relationship("SubjectAssignment", back_populates="subject")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    order_num = Column(Integer, default=1)

    marks = relationship("Mark", back_populates="assessment")

class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False, index=True)
    score = Column(Float, nullable=False)  # 0.0 to 100.0

    student = relationship("Student", back_populates="marks")
    subject = relationship("Subject", back_populates="marks")
    assessment = relationship("Assessment", back_populates="marks")

    __table_args__ = (
        UniqueConstraint('student_id', 'subject_id', 'assessment_id', name='uq_student_subject_assessment'),
    )

# ====================================================
# 2. USER & AUTHENTICATION MODELS
# ====================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    picture = Column(String(255), nullable=True)
    role = Column(String(20), nullable=False)  # "admin", "lecturer", "student"
    password_hash = Column(String(200), nullable=True)
    google_id = Column(String(100), unique=True, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    lecturer_profile = relationship("Lecturer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    student_profile = relationship("Student", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

# ====================================================
# 3. LECTURER & ASSIGNMENT MODELS
# ====================================================

class Lecturer(Base):
    __tablename__ = "lecturers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    employee_id = Column(String(30), unique=True, nullable=False, index=True)
    department = Column(String(100), default="Computer Science & Engineering")
    qualification = Column(String(100), default="M.Tech, Ph.D")
    phone = Column(String(20), nullable=True)
    is_verified = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="lecturer_profile")
    assignments = relationship("SubjectAssignment", back_populates="lecturer", cascade="all, delete-orphan")
    created_tests = relationship("OnlineTest", back_populates="creator")

class SubjectAssignment(Base):
    __tablename__ = "subject_assignments"

    id = Column(Integer, primary_key=True, index=True)
    lecturer_id = Column(Integer, ForeignKey("lecturers.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    section = Column(String(5), nullable=False)  # "A", "B", "C", "All"

    lecturer = relationship("Lecturer", back_populates="assignments")
    subject = relationship("Subject", back_populates="assignments")

    __table_args__ = (
        UniqueConstraint('lecturer_id', 'subject_id', 'section', name='uq_lecturer_subject_section'),
    )

# ====================================================
# 4. ONLINE TESTS & ASSESSMENTS
# ====================================================

class OnlineTest(Base):
    __tablename__ = "online_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    section = Column(String(5), default="All")  # "All", "A", "B", "C"
    created_by = Column(Integer, ForeignKey("lecturers.id"), nullable=True)
    duration_minutes = Column(Integer, default=20)
    total_marks = Column(Float, default=20.0)
    passing_marks = Column(Float, default=10.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject")
    creator = relationship("Lecturer", back_populates="created_tests")
    questions = relationship("TestQuestion", back_populates="test", cascade="all, delete-orphan")
    attempts = relationship("StudentTestAttempt", back_populates="test", cascade="all, delete-orphan")

class TestQuestion(Base):
    __tablename__ = "test_questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("online_tests.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(255), nullable=False)
    option_b = Column(String(255), nullable=False)
    option_c = Column(String(255), nullable=False)
    option_d = Column(String(255), nullable=False)
    correct_option = Column(String(1), nullable=False)  # "A", "B", "C", "D"
    explanation = Column(Text, nullable=True)
    marks = Column(Float, default=2.0)

    test = relationship("OnlineTest", back_populates="questions")

class StudentTestAttempt(Base):
    __tablename__ = "student_test_attempts"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("online_tests.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    score = Column(Float, nullable=False)
    total_marks = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    answers_json = Column(Text, nullable=True)  # JSON string of responses
    submitted_at = Column(DateTime, default=datetime.utcnow)

    test = relationship("OnlineTest", back_populates="attempts")
    student = relationship("Student", back_populates="test_attempts")

# ====================================================
# 5. STUDY PROOFS & VERIFICATION
# ====================================================

class StudyProof(Base):
    __tablename__ = "study_proofs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    file_url = Column(String(255), nullable=False)
    file_type = Column(String(20), default="image")  # "image", "pdf"
    study_duration_minutes = Column(Integer, default=60)
    status = Column(String(30), default="Pending")  # "Pending", "Verified", "Rejected", "Resubmission Required"
    feedback = Column(Text, nullable=True)
    verified_by = Column(Integer, ForeignKey("lecturers.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="proofs")
    subject = relationship("Subject")
    verifier = relationship("Lecturer")

# ====================================================
# 6. DOUBTS & FORUM
# ====================================================

class Doubt(Base):
    __tablename__ = "doubts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    section = Column(String(5), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    file_url = Column(String(255), nullable=True)
    status = Column(String(20), default="Pending")  # "Pending", "Answered", "Resolved"
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="doubts")
    subject = relationship("Subject")
    replies = relationship("DoubtReply", back_populates="doubt", cascade="all, delete-orphan")

class DoubtReply(Base):
    __tablename__ = "doubt_replies"

    id = Column(Integer, primary_key=True, index=True)
    doubt_id = Column(Integer, ForeignKey("doubts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    file_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    doubt = relationship("Doubt", back_populates="replies")
    user = relationship("User")

# ====================================================
# 7. STUDY MATERIALS & PREVIOUS YEAR PAPERS
# ====================================================

class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    section = Column(String(5), default="All")  # "All", "A", "B", "C"
    learner_category = Column(String(30), default="All")  # "All", "Fast Learner", "Average Learner", "Slow Learner"
    material_type = Column(String(30), default="Notes")  # "Notes", "Exercise", "Video Link", "Question Paper", "Study Schedule"
    file_url = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject")
    uploader = relationship("User")

class PreviousYearPaper(Base):
    __tablename__ = "previous_year_papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    semester = Column(Integer, default=4)
    academic_year = Column(String(20), default="2025")  # "2025", "2024", "2023"
    file_url = Column(String(255), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject")
    uploader = relationship("User")

# ====================================================
# 8. TIMETABLE, NOTIFICATIONS & LOGS
# ====================================================

class Timetable(Base):
    __tablename__ = "timetables"

    id = Column(Integer, primary_key=True, index=True)
    section = Column(String(5), nullable=False, index=True)  # "A", "B", "C"
    day_of_week = Column(String(15), nullable=False)  # "Monday", "Tuesday", etc.
    start_time = Column(String(10), nullable=False)  # "09:00 AM"
    end_time = Column(String(10), nullable=False)  # "10:00 AM"
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    lecturer_name = Column(String(100), nullable=False)
    room_number = Column(String(20), default="CR-201")

    subject = relationship("Subject")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(150), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
