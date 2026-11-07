from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Any

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

