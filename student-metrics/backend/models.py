from sqlalchemy import Column, Integer, String, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(20), unique=True, index=True, nullable=False)
    usn = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    section = Column(String(5), nullable=False, index=True)  # "A", "B", "C"
    semester = Column(Integer, default=4)
    attendance = Column(Float, default=85.0)  # percentage (0.0 to 100.0)

    # Cascade delete marks when a student is deleted
    marks = relationship("Mark", back_populates="student", cascade="all, delete-orphan")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)

    marks = relationship("Mark", back_populates="subject")

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
