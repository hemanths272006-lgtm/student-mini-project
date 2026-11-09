from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Any
from datetime import datetime

# ====================================================
# 1. CORE MARKS & STUDENT SCHEMAS (PRESERVED)
# ====================================================

class MarkItem(BaseModel):
    subject: str
    test: str
    score: float

    @field_validator('score')
    @classmethod
    def validate_score(cls, v):
        if not (0.0 <= v <= 100.0):
            raise ValueError('Score must be between 0 and 100')
        return round(float(v), 1)

class StudentBase(BaseModel):
    usn: str = Field(..., min_length=3, max_length=20)
    name: str = Field(..., min_length=2, max_length=100)
    section: str = Field(..., min_length=1, max_length=5)
    semester: int = Field(default=4, ge=1, le=8)
    attendance: float = Field(default=85.0, ge=0.0, le=100.0)

class StudentCreate(StudentBase):
    student_id: Optional[str] = None
    marks: Optional[List[MarkItem]] = None

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    section: Optional[str] = None
    semester: Optional[int] = None
    attendance: Optional[float] = None
    marks: Optional[List[MarkItem]] = None

class StudentListItem(BaseModel):
    id: int
    student_id: str
    usn: str
    name: str
    section: str
    semester: int
    attendance: float
    overall_average: float
    category: str
    trend: str
    highest_subject: str
    lowest_subject: str

class Pagination(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int

class StudentListResponse(BaseModel):
    students: List[StudentListItem]
    pagination: Pagination

class StudentDetailResponse(BaseModel):
    id: int
    student_id: str
    usn: str
    name: str
    section: str
    semester: int
    attendance: float
    overall_average: float
    category: str
    trend: str
    highest_subject: str
    highest_score: float
    lowest_subject: str
    lowest_score: float
    subject_averages: Dict[str, float]
    test_averages: Dict[str, float]
    marks: List[Dict[str, Any]]
    suggestions: List[str]

# Dashboard Schemas
class KPIStats(BaseModel):
    total_students: int
    fast_learners: int
    average_learners: int
    slow_learners: int
    overall_average: float
    average_attendance: float
    improving_count: int
    declining_count: int
    consistent_count: int

class LearnerDistItem(BaseModel):
    name: str
    count: int
    percentage: float
    color: str

class SubjectPerfItem(BaseModel):
    subject: str
    average: float
    highest: float
    lowest: float

class TestTrendItem(BaseModel):
    test: str
    overall: float
    fast: float
    average: float
    slow: float

class SectionPerfItem(BaseModel):
    section: str
    total: int
    average: float
    fast_count: int
    avg_count: int
    slow_count: int
    attendance: float

class DashboardResponse(BaseModel):
    kpi: KPIStats
    learner_distribution: List[LearnerDistItem]
    subject_performance: List[SubjectPerfItem]
    test_trends: List[TestTrendItem]
    section_performance: List[SectionPerfItem]

# Analytics Schemas
class SupportNeededStudent(BaseModel):
    id: int
    usn: str
    name: str
    section: str
    overall_average: float
    attendance: float
    category: str
    trend: str
    weakest_subject: str
    reasons: List[str]
    action_plan: str

class TopStudent(BaseModel):
    rank: int
    id: int
    usn: str
    name: str
    section: str
    overall_average: float
    category: str
    trend: str
    attendance: float

class AnalyticsResponse(BaseModel):
    section_comparison: List[SectionPerfItem]
    subject_performance: List[SubjectPerfItem]
    trend_distribution: Dict[str, int]
    top_10_students: List[TopStudent]
    support_needed_students: List[SupportNeededStudent]

class CSVImportResponse(BaseModel):
    success: bool
    total_rows: int
    imported_count: int
    updated_count: int
    error_count: int
    errors: List[str]

# ====================================================
# 2. AUTHENTICATION & USER SCHEMAS (NEW)
# ====================================================

class GoogleLoginRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    role: Optional[str] = None

class DemoLoginRequest(BaseModel):
    role: str  # "admin", "lecturer", "student"
    email: Optional[str] = None
    usn: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfileResponse(BaseModel):
    id: int
    email: str
    name: str
    picture: Optional[str] = None
    role: str
    profile_details: Optional[Dict[str, Any]] = None

# ====================================================
# 3. LECTURER & ASSIGNMENT SCHEMAS (NEW)
# ====================================================

class SubjectAssignmentItem(BaseModel):
    subject_name: str
    section: str

class LecturerCreateRequest(BaseModel):
    name: str
    email: str
    employee_id: str
    department: str = "Computer Science & Engineering"
    qualification: str = "M.Tech, Ph.D"
    phone: Optional[str] = None
    assignments: List[SubjectAssignmentItem] = []

class LecturerUpdateRequest(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    qualification: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    assignments: Optional[List[SubjectAssignmentItem]] = None

class LecturerVerifyRequest(BaseModel):
    action: str  # "approve" or "reject"

class LecturerListItem(BaseModel):
    id: int
    user_id: int
    name: str
    email: str
    picture: Optional[str] = None
    employee_id: str
    department: str
    qualification: str
    phone: Optional[str] = None
    is_verified: bool
    is_active: bool
    assignments: List[Dict[str, Any]] = []

# ====================================================
# 4. ONLINE TESTS SCHEMAS (NEW)
# ====================================================

class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str  # "A", "B", "C", "D"
    explanation: Optional[str] = None
    marks: float = 2.0

class TestCreateRequest(BaseModel):
    title: str
    subject_id: int
    section: str = "All"
    duration_minutes: int = 20
    total_marks: float = 20.0
    passing_marks: float = 10.0
    questions: List[QuestionCreate]

class TestSubmitRequest(BaseModel):
    answers: Dict[str, str]  # question_id -> chosen option

# ====================================================
# 5. STUDY PROOFS & DOUBTS SCHEMAS (NEW)
# ====================================================

class StudyProofCreate(BaseModel):
    subject_id: int
    title: str
    description: str
    file_url: str
    file_type: str = "image"
    study_duration_minutes: int = 60

class StudyProofVerifyRequest(BaseModel):
    status: str  # "Verified", "Rejected", "Resubmission Required"
    feedback: Optional[str] = None

class DoubtCreateRequest(BaseModel):
    subject_id: int
    title: str
    description: str
    file_url: Optional[str] = None

class DoubtReplyRequest(BaseModel):
    message: str
    file_url: Optional[str] = None
    mark_resolved: bool = False

# ====================================================
# 6. STUDY MATERIALS & PAPERS SCHEMAS (NEW)
# ====================================================

class StudyMaterialCreateRequest(BaseModel):
    title: str
    subject_id: int
    section: str = "All"
    learner_category: str = "All"  # "All", "Fast Learner", "Average Learner", "Slow Learner"
    material_type: str = "Notes"   # "Notes", "Exercise", "Video Link", "Question Paper"
    file_url: str
    description: Optional[str] = None

class PreviousYearPaperCreate(BaseModel):
    title: str
    subject_id: int
    semester: int = 4
    academic_year: str = "2025"
    file_url: str
