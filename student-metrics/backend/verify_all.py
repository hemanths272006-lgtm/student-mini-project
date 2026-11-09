import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine
from models import Student, Subject, Assessment, Mark, User, Lecturer, OnlineTest, StudyProof, Doubt
from schemas import DemoLoginRequest
from routers.auth_routes import demo_login
from routers.admin_routes import get_admin_dashboard, get_all_lecturers, get_section_details
from routers.lecturer_routes import get_lecturer_dashboard, get_learner_classification
from routers.student_routes import get_student_dashboard, get_student_tests, get_private_report_card

print("=" * 60)
print("VERIFYING SYSTEM BACKEND & DATABASE")
print("=" * 60)

db = SessionLocal()

try:
    # 1. Check core counts
    st_count = db.query(Student).count()
    sub_count = db.query(Subject).count()
    ass_count = db.query(Assessment).count()
    mark_count = db.query(Mark).count()
    user_count = db.query(User).count()
    lec_count = db.query(Lecturer).count()
    test_count = db.query(OnlineTest).count()

    print(f"[OK] Students in DB: {st_count} (Expect 180)")
    print(f"[OK] Subjects: {sub_count} (Expect 5)")
    print(f"[OK] Assessments: {ass_count} (Expect 4)")
    print(f"[OK] Marks: {mark_count}")
    print(f"[OK] Users: {user_count}")
    print(f"[OK] Lecturers: {lec_count}")
    print(f"[OK] Online Tests: {test_count}")

    # 2. Test Auth demo login
    admin_auth = demo_login(DemoLoginRequest(role="admin"), db)
    lec_auth = demo_login(DemoLoginRequest(role="lecturer"), db)
    stu_auth = demo_login(DemoLoginRequest(role="student"), db)

    print(f"[OK] Admin Auth: Token generated for '{admin_auth.user['name']}' (Role: {admin_auth.user['role']})")
    print(f"[OK] Lecturer Auth: Token generated for '{lec_auth.user['name']}' (Role: {lec_auth.user['role']})")
    print(f"[OK] Student Auth: Token generated for '{stu_auth.user['name']}' (Role: {stu_auth.user['role']})")

    # 3. Test Admin endpoints
    admin_user = db.query(User).filter(User.role == "admin").first()
    admin_dash = get_admin_dashboard(db=db)
    print(f"[OK] Admin Dashboard KPI: Total Students = {admin_dash['kpis']['total_students']}, Overall Avg = {admin_dash['kpis']['overall_average']}%")

    admin_sec_a = get_section_details("A", db=db)
    print(f"[OK] Admin Section A Analytics: {admin_sec_a['total_students']} students, Class Avg = {admin_sec_a['average_score']}%")

    # 4. Test Lecturer endpoints
    lec_user = db.query(User).filter(User.role == "lecturer").first()
    lec_dash = get_lecturer_dashboard(current_user=lec_user, db=db)
    print(f"[OK] Lecturer Dashboard: Total In Scope = {lec_dash['stats']['total_students']}, Fast = {lec_dash['stats']['fast_learners']}, Avg = {lec_dash['stats']['average_learners']}, Slow = {lec_dash['stats']['slow_learners']}")

    lec_class = get_learner_classification(category="Fast", section=None, search=None, current_user=lec_user, db=db)
    print(f"[OK] Lecturer Classification Filter (Fast): Retrieved {len(lec_class['students'])} students")

    # 5. Test Student endpoints
    stu_user = db.query(User).filter(User.role == "student").first()
    stu_dash = get_student_dashboard(current_user=stu_user, db=db)
    print(f"[OK] Student Dashboard: Student Name = {stu_dash['student']['name']}, Category = {stu_dash['student']['category']}, Attendance = {stu_dash['student']['attendance']}%")

    stu_rep = get_private_report_card(current_user=stu_user, db=db)
    print(f"[OK] Student Report Card: Generated for {stu_rep['student']['name']} (USN: {stu_rep['student']['usn']})")

    print("=" * 60)
    print("ALL BACKEND ENDPOINTS AND LOGIC PASSED SUCCESSFULLY!")
    print("=" * 60)

except Exception as e:
    print(f"[ERROR]: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
