import sys, io, csv
sys.path.insert(0, r'e:\student mini project\student-metrics\backend')
from database import SessionLocal
from models import Student, Mark
from main import (
    get_dashboard, get_students, create_student, get_student,
    update_student, delete_student, get_student_report, get_analytics,
    export_csv, reset_sample_data
)
from schemas import StudentCreate, StudentUpdate, MarkItem

db = SessionLocal()

print('=== 1. TESTING DASHBOARD ===')
d = get_dashboard(db)
print(f'Total Students: {d.kpi.total_students}')
print(f'Fast: {d.kpi.fast_learners}, Avg: {d.kpi.average_learners}, Slow: {d.kpi.slow_learners}')
assert d.kpi.total_students == 180, 'Total students should be 180'
assert d.kpi.fast_learners + d.kpi.average_learners + d.kpi.slow_learners == 180
print('Dashboard tests passed!')

print('=== 2. TESTING SEARCH & FILTERS ===')
res_secA = get_students(page=1, limit=100, search=None, section='A', category=None, sort_by='usn', sort_order='asc', db=db)
print(f'Section A student count: {len(res_secA.students)}')
assert len(res_secA.students) == 60, 'Section A should have 60 students'

res_secB = get_students(page=1, limit=100, search=None, section='B', category=None, sort_by='usn', sort_order='asc', db=db)
print(f'Section B student count: {len(res_secB.students)}')
assert len(res_secB.students) == 60, 'Section B should have 60 students'

res_secC = get_students(page=1, limit=100, search=None, section='C', category=None, sort_by='usn', sort_order='asc', db=db)
print(f'Section C student count: {len(res_secC.students)}')
assert len(res_secC.students) == 60, 'Section C should have 60 students'

res_fast = get_students(page=1, limit=100, search=None, section=None, category='Fast Learner', sort_by='usn', sort_order='asc', db=db)
print(f'Fast learners count: {len(res_fast.students)}')
assert len(res_fast.students) == d.kpi.fast_learners

# Search by USN
res_search = get_students(page=1, limit=10, search='1MS24CS001', section=None, category=None, sort_by='usn', sort_order='asc', db=db)
assert len(res_search.students) == 1
print(f'Found student: {res_search.students[0].name} ({res_search.students[0].usn})')
print('Search and filter tests passed!')

print('=== 3. TESTING CREATE, UPDATE, DELETE ===')
new_stu_data = StudentCreate(
    usn='1MS24CS999',
    name='Test Student Final',
    section='B',
    semester=4,
    attendance=92.5,
    marks=[
        MarkItem(subject='Mathematics', test='Test 1', score=95.0),
        MarkItem(subject='Science', test='Test 1', score=90.0),
        MarkItem(subject='English', test='Test 1', score=88.0),
        MarkItem(subject='Computer Science', test='Test 1', score=96.0),
        MarkItem(subject='Social Studies', test='Test 1', score=85.0),
    ]
)
created = create_student(new_stu_data, db)
print(f'Created student: ID {created.id}, Category: {created.category}, Avg: {created.overall_average}')
assert created.category == 'Fast Learner'

# Update
updated = update_student(created.id, StudentUpdate(attendance=95.0), db)
assert updated.attendance == 95.0
print('Update passed!')

# Report
rep = get_student_report(created.id, db)
print(f'Student report rank: #{rep["class_rank"]} of {rep["total_students"]}')
assert rep['name'] == 'Test Student Final'

# Delete
del_res = delete_student(created.id, db)
print(del_res['message'])
print('CRUD tests passed!')

print('=== 4. TESTING ANALYTICS ===')
analytics = get_analytics(db)
print(f'Top 10 students count: {len(analytics.top_10_students)}')
print(f'Students requiring support count: {len(analytics.support_needed_students)}')
assert len(analytics.top_10_students) == 10
print('Analytics tests passed!')

# Test reset sample data
reset_res = reset_sample_data(db)
print(reset_res['message'])
assert db.query(Student).count() == 180

db.close()
print('\n>>> ALL 11 VERIFICATION TESTS PASSED SUCCESSFULLY! <<<')

