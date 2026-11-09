from datetime import datetime, timedelta
import json
from sqlalchemy.orm import Session
from models import (
    User, Lecturer, SubjectAssignment, OnlineTest, TestQuestion,
    StudentTestAttempt, StudyProof, Doubt, DoubtReply, StudyMaterial,
    PreviousYearPaper, Timetable, Notification, ActivityLog,
    Student, Subject, Assessment, Mark
)
from auth import hash_password

def seed_portals_data(db: Session):
    """
    Safely seeds users, lecturers, test MCQs, doubts, study proofs,
    materials, and timetables without duplicating records on backend restart.
    """
    # 1. Check if users are already seeded
    user_count = db.query(User).count()
    if user_count > 0:
        print(f"Users and portal data already present ({user_count} users). Skipping portal seeding.")
        return

    print("Seeding Users, Lecturers, Tests, Proofs, Doubts, and Study Materials...")

    # Fetch subjects
    subjects = {s.name: s for s in db.query(Subject).all()}
    cs_sub = subjects.get("Computer Science")
    math_sub = subjects.get("Mathematics")
    sci_sub = subjects.get("Science")
    eng_sub = subjects.get("English")
    soc_sub = subjects.get("Social Studies")

    # ====================================================
    # 2. CREATE ADMIN USER
    # ====================================================
    admin_user = User(
        email="admin@studentmetrics.edu",
        name="Dr. S. K. Sharma",
        picture="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        role="admin",
        password_hash=hash_password("admin123"),
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(admin_user)
    db.flush()

    # ====================================================
    # 3. CREATE LECTURERS (5 Verified + 1 Pending)
    # ====================================================
    lecturers_def = [
        {
            "email": "vikram.hegde@studentmetrics.edu",
            "name": "Dr. Vikram Hegde",
            "picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "emp_id": "LEC001",
            "dept": "Computer Science & Engineering",
            "qual": "Ph.D. in Computer Science",
            "phone": "+91 98450 11223",
            "verified": True,
            "assignments": [("Computer Science", "A"), ("Computer Science", "B"), ("Computer Science", "C")]
        },
        {
            "email": "anitha.rao@studentmetrics.edu",
            "name": "Prof. Anitha Rao",
            "picture": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
            "emp_id": "LEC002",
            "dept": "Mathematics",
            "qual": "M.Sc, M.Phil in Applied Mathematics",
            "phone": "+91 98450 22334",
            "verified": True,
            "assignments": [("Mathematics", "A"), ("Mathematics", "B")]
        },
        {
            "email": "sunita.nair@studentmetrics.edu",
            "name": "Prof. Sunita Nair",
            "picture": "https://images.unsplash.com/photo-1580894732526-704f147e050b?w=150",
            "emp_id": "LEC003",
            "dept": "Applied Sciences & Physics",
            "qual": "M.Sc, Ph.D in Physics",
            "phone": "+91 98450 33445",
            "verified": True,
            "assignments": [("Science", "B"), ("Science", "C")]
        },
        {
            "email": "rajesh.k@studentmetrics.edu",
            "name": "Prof. Rajesh Kulkarni",
            "picture": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
            "emp_id": "LEC004",
            "dept": "Humanities & English",
            "qual": "M.A. English Literature",
            "phone": "+91 98450 44556",
            "verified": True,
            "assignments": [("English", "A"), ("English", "C")]
        },
        {
            "email": "meera.shenoy@studentmetrics.edu",
            "name": "Prof. Meera Shenoy",
            "picture": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150",
            "emp_id": "LEC005",
            "dept": "Social Studies",
            "qual": "M.A., B.Ed in Social Sciences",
            "phone": "+91 98450 55667",
            "verified": True,
            "assignments": [("Social Studies", "A"), ("Social Studies", "B")]
        },
        {
            "email": "chetan.joshi@studentmetrics.edu",
            "name": "Dr. Chetan Joshi",
            "picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            "emp_id": "LEC006",
            "dept": "Computer Science & Engineering",
            "qual": "Ph.D. in Artificial Intelligence",
            "phone": "+91 98450 66778",
            "verified": False,  # Pending verification for demonstration
            "assignments": [("Computer Science", "B")]
        }
    ]

    lecturer_objs = {}
    for l_data in lecturers_def:
        user = User(
            email=l_data["email"],
            name=l_data["name"],
            picture=l_data["picture"],
            role="lecturer",
            password_hash=hash_password("lecturer123"),
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.flush()

        lec = Lecturer(
            user_id=user.id,
            employee_id=l_data["emp_id"],
            department=l_data["dept"],
            qualification=l_data["qual"],
            phone=l_data["phone"],
            is_verified=l_data["verified"],
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(lec)
        db.flush()
        lecturer_objs[l_data["emp_id"]] = lec

        # Assign subjects
        for sub_name, sec in l_data["assignments"]:
            if sub_name in subjects:
                assignment = SubjectAssignment(
                    lecturer_id=lec.id,
                    subject_id=subjects[sub_name].id,
                    section=sec
                )
                db.add(assignment)

    db.commit()

    # ====================================================
    # 4. CREATE DEMO STUDENT USERS & LINK TO STUDENTS
    # ====================================================
    all_db_students = db.query(Student).order_by(Student.id).all()
    demo_student_configs = [
        {"usn": "1MS24CS001", "email": "aarav.sharma@studentmetrics.edu", "pic": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"},
        {"usn": "1MS24CS002", "email": "pooja.hegde@studentmetrics.edu", "pic": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"},
        {"usn": "1MS24CS015", "email": "rohan.verma@studentmetrics.edu", "pic": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"},
        {"usn": "1MS24CS061", "email": "secb.student@studentmetrics.edu", "pic": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150"},
        {"usn": "1MS24CS121", "email": "secc.student@studentmetrics.edu", "pic": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150"},
    ]

    student_objs = {}
    for cfg in demo_student_configs:
        st_match = next((s for s in all_db_students if s.usn == cfg["usn"]), None)
        if st_match:
            user = User(
                email=cfg["email"],
                name=st_match.name,
                picture=cfg["pic"],
                role="student",
                password_hash=hash_password("student123"),
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(user)
            db.flush()
            st_match.user_id = user.id
            student_objs[cfg["usn"]] = st_match

    db.commit()

    sample_student_1 = student_objs.get("1MS24CS001") or all_db_students[0]
    sample_student_2 = student_objs.get("1MS24CS002") or all_db_students[1]
    sample_student_3 = student_objs.get("1MS24CS015") or all_db_students[2]

    primary_lecturer = lecturer_objs["LEC001"]  # Dr. Vikram Hegde

    # ====================================================
    # 5. CREATE ONLINE TESTS & MCQS
    # ====================================================
    test_1 = OnlineTest(
        title="Computer Science Unit 1: Data Structures & Algorithms",
        subject_id=cs_sub.id,
        section="All",
        created_by=primary_lecturer.id,
        duration_minutes=20,
        total_marks=10.0,
        passing_marks=5.0,
        is_active=True,
        created_at=datetime.utcnow() - timedelta(days=5)
    )
    db.add(test_1)
    db.flush()

    q_data_1 = [
        {
            "q": "What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL tree)?",
            "a": "O(1)", "b": "O(log n)", "c": "O(n)", "d": "O(n log n)", "ans": "B",
            "exp": "AVL trees maintain height balance factor of at most 1, guaranteeing logarithmic O(log n) search time."
        },
        {
            "q": "Which data structure operates on the Last-In-First-Out (LIFO) access principle?",
            "a": "Queue", "b": "Stack", "c": "Doubly Linked List", "d": "Min Heap", "ans": "B",
            "exp": "A Stack performs insertions (push) and deletions (pop) at the same top position (LIFO)."
        },
        {
            "q": "Which object-oriented principle allows calling the same method name on different derived classes with specific behaviors?",
            "a": "Polymorphism", "b": "Data Encapsulation", "c": "Inheritance", "d": "Information Hiding", "ans": "A",
            "exp": "Polymorphism allows dynamic method dispatch at runtime based on the actual object instance."
        },
        {
            "q": "Which in-place sorting algorithm has an average runtime complexity of O(n log n)?",
            "a": "Merge Sort", "b": "Quick Sort", "c": "Bubble Sort", "d": "Selection Sort", "ans": "B",
            "exp": "Quick Sort sorts in-place using partitioning with average time complexity O(n log n)."
        },
        {
            "q": "What database mechanism directly prevents full-table scans during WHERE filter queries?",
            "a": "Foreign Key", "b": "B-Tree Index", "c": "Stored Procedure", "d": "Trigger", "ans": "B",
            "exp": "Indexes (typically B-Tree or Hash) provide direct lookup pointers avoiding sequential table scans."
        }
    ]

    for q in q_data_1:
        db.add(TestQuestion(
            test_id=test_1.id,
            question_text=q["q"],
            option_a=q["a"],
            option_b=q["b"],
            option_c=q["c"],
            option_d=q["d"],
            correct_option=q["ans"],
            explanation=q["exp"],
            marks=2.0
        ))

    # Test 2: Mathematics
    test_2 = OnlineTest(
        title="Mathematics Quiz: Differential Equations & Matrices",
        subject_id=math_sub.id,
        section="A",
        created_by=lecturer_objs["LEC002"].id,
        duration_minutes=25,
        total_marks=10.0,
        passing_marks=5.0,
        is_active=True,
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    db.add(test_2)
    db.flush()

    q_data_2 = [
        {
            "q": "What is the derivative of f(x) = sin(2x) with respect to x?",
            "a": "2 cos(2x)", "b": "-2 cos(2x)", "c": "cos(2x)", "d": "2 sin(x)", "ans": "A",
            "exp": "By the chain rule: d/dx[sin(u)] = cos(u) * du/dx = cos(2x) * 2 = 2 cos(2x)."
        },
        {
            "q": "If the determinant of a square matrix A is 0, what does this indicate?",
            "a": "Matrix is singular (non-invertible)", "b": "Matrix is orthogonal", "c": "Trace is 0", "d": "Eigenvalues are all 1", "ans": "A",
            "exp": "A zero determinant means the matrix is singular and does not possess an inverse."
        },
        {
            "q": "What is the integral of (1/x) dx for x > 0?",
            "a": "ln(x) + C", "b": "-1/x^2 + C", "c": "e^x + C", "d": "x^2/2 + C", "ans": "A",
            "exp": "The anti-derivative of 1/x is natural logarithm ln|x| + C."
        },
        {
            "q": "The eigenvalues of an upper triangular matrix are:",
            "a": "Always 0", "b": "Its main diagonal entries", "c": "The determinant values", "d": "Complex conjugates", "ans": "B",
            "exp": "For triangular matrices, eigenvalues correspond exactly to the entries along the main diagonal."
        },
        {
            "q": "Which theorem relates a line integral around a simple closed curve to a double integral over the enclosed plane region?",
            "a": "Green's Theorem", "b": "Mean Value Theorem", "c": "Rolle's Theorem", "d": "Taylor's Theorem", "ans": "A",
            "exp": "Green's theorem relates a line integral around a closed curve C to a double integral over the region D."
        }
    ]

    for q in q_data_2:
        db.add(TestQuestion(
            test_id=test_2.id,
            question_text=q["q"],
            option_a=q["a"],
            option_b=q["b"],
            option_c=q["c"],
            option_d=q["d"],
            correct_option=q["ans"],
            explanation=q["exp"],
            marks=2.0
        ))

    db.commit()

    # Record sample student test attempts
    db.add(StudentTestAttempt(
        test_id=test_1.id,
        student_id=sample_student_1.id,
        score=10.0,
        total_marks=10.0,
        passed=True,
        answers_json=json.dumps({"1": "B", "2": "B", "3": "A", "4": "B", "5": "B"}),
        submitted_at=datetime.utcnow() - timedelta(days=3)
    ))
    db.add(StudentTestAttempt(
        test_id=test_1.id,
        student_id=sample_student_2.id,
        score=8.0,
        total_marks=10.0,
        passed=True,
        answers_json=json.dumps({"1": "B", "2": "B", "3": "A", "4": "A", "5": "B"}),
        submitted_at=datetime.utcnow() - timedelta(days=2)
    ))

    # ====================================================
    # 6. CREATE SAMPLE STUDY PROOFS
    # ====================================================
    proofs_data = [
        {
            "student": sample_student_1,
            "subject": cs_sub,
            "title": "Self-Study Notes: Binary Search Trees & AVL Rotations",
            "desc": "Handwritten notes explaining Left-Right and Right-Left double rotations with state balance factor diagrams and code snippets.",
            "url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
            "type": "image",
            "duration": 90,
            "status": "Verified",
            "feedback": "Outstanding clarity in rotation diagrams. Proof verified for continuous assessment credit.",
            "verifier": primary_lecturer
        },
        {
            "student": sample_student_2,
            "subject": math_sub,
            "title": "Calculus Practice: Integration by Parts Problem Set",
            "desc": "Completed 15 exercise problems from Chapter 4 on definite integrals and matrix diagonalization.",
            "url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
            "type": "image",
            "duration": 60,
            "status": "Pending",
            "feedback": None,
            "verifier": None
        },
        {
            "student": sample_student_3,
            "subject": sci_sub,
            "title": "Physics Circuit Analysis Lab Summary",
            "desc": "Summary of Kirchhoff's voltage and current law experiments with multimeter measurements.",
            "url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
            "type": "image",
            "duration": 45,
            "status": "Resubmission Required",
            "feedback": "Please attach the percentage error calculations and resubmit for verification.",
            "verifier": lecturer_objs["LEC003"]
        }
    ]

    for p in proofs_data:
        db.add(StudyProof(
            student_id=p["student"].id,
            subject_id=p["subject"].id,
            title=p["title"],
            description=p["desc"],
            file_url=p["url"],
            file_type=p["type"],
            study_duration_minutes=p["duration"],
            status=p["status"],
            feedback=p["feedback"],
            verified_by=p["verifier"].id if p["verifier"] else None,
            verified_at=datetime.utcnow() - timedelta(days=1) if p["status"] == "Verified" else None,
            created_at=datetime.utcnow() - timedelta(days=2)
        ))

    # ====================================================
    # 7. CREATE SAMPLE DOUBTS & REPLIES
    # ====================================================
    d1 = Doubt(
        student_id=sample_student_1.id,
        subject_id=cs_sub.id,
        section=sample_student_1.section,
        title="Double rotation order in AVL Tree when balance factor is -2 and child is +1",
        description="I am confused about whether we rotate the child node first or the grandchild node during a Left-Right case.",
        file_url=None,
        status="Answered",
        created_at=datetime.utcnow() - timedelta(days=3)
    )
    db.add(d1)
    db.flush()

    db.add(DoubtReply(
        doubt_id=d1.id,
        user_id=primary_lecturer.user_id,
        message="For a Left-Right (LR) imbalance: first perform a Left Rotation around the left child node. This converts the situation into a Left-Left (LL) case. Then perform a Right Rotation around the unbalanced root node.",
        created_at=datetime.utcnow() - timedelta(days=2)
    ))

    d2 = Doubt(
        student_id=sample_student_2.id,
        subject_id=math_sub.id,
        section=sample_student_2.section,
        title="Repeated Eigenvalues: How to construct linearly independent Eigenvectors?",
        description="When the algebraic multiplicity is greater than 1, how do we systematically find independent eigenvectors if geometric multiplicity is less?",
        file_url=None,
        status="Pending",
        created_at=datetime.utcnow() - timedelta(hours=8)
    )
    db.add(d2)

    # ====================================================
    # 8. CREATE STUDY MATERIALS FOR FAST, AVERAGE & SLOW
    # ====================================================
    materials_data = [
        # Fast Learners
        {
            "title": "Advanced Algorithmic Design & Graph Theory Honors Track",
            "subj": cs_sub, "sec": "All", "cat": "Fast Learner", "type": "Notes",
            "desc": "Covers Tarjan's Strongly Connected Components, Max-Flow Min-Cut theorem, and competitive programming problems.",
            "url": "https://example.com/materials/advanced-algorithms.pdf"
        },
        {
            "title": "Multi-Variable Optimization & Machine Learning Mathematics",
            "subj": math_sub, "sec": "All", "cat": "Fast Learner", "type": "Exercise",
            "desc": "Lagrange Multipliers, Gradient Descent convergence proofs, and Singular Value Decomposition (SVD) problem sets.",
            "url": "https://example.com/materials/optimization-math.pdf"
        },
        # Average Learners
        {
            "title": "Data Structures Comprehensive Question Bank & University Exam Solutions",
            "subj": cs_sub, "sec": "All", "cat": "Average Learner", "type": "Question Paper",
            "desc": "Solved step-by-step algorithms for Stacks, Queues, Linked Lists, Trees, and Hashing.",
            "url": "https://example.com/materials/cs-question-bank.pdf"
        },
        {
            "title": "Applied Calculus Concept Summaries & 4-Week Study Schedule",
            "subj": math_sub, "sec": "All", "cat": "Average Learner", "type": "Study Schedule",
            "desc": "Daily 45-minute revision milestones for differential calculus and matrix algebra.",
            "url": "https://example.com/materials/calculus-study-plan.pdf"
        },
        # Slow Learners
        {
            "title": "Programming & Data Structures: Simplified Foundations Guide",
            "subj": cs_sub, "sec": "All", "cat": "Slow Learner", "type": "Notes",
            "desc": "Visual analogies, pseudocode breakdowns, and fundamental memory layout diagrams for beginner students.",
            "url": "https://example.com/materials/cs-remedial-guide.pdf"
        },
        {
            "title": "Remedial Mathematics: Step-by-Step Solved Problem Sets",
            "subj": math_sub, "sec": "All", "cat": "Slow Learner", "type": "Exercise",
            "desc": "Basic matrix operations, standard derivatives, and formula cheat sheet with solved examples.",
            "url": "https://example.com/materials/math-remedial-problems.pdf"
        }
    ]

    for m in materials_data:
        db.add(StudyMaterial(
            title=m["title"],
            subject_id=m["subj"].id,
            section=m["sec"],
            learner_category=m["cat"],
            material_type=m["type"],
            file_url=m["url"],
            description=m["desc"],
            uploaded_by=primary_lecturer.user_id,
            created_at=datetime.utcnow() - timedelta(days=4)
        ))

    # ====================================================
    # 9. CREATE PREVIOUS YEAR QUESTION PAPERS
    # ====================================================
    papers_data = [
        {"title": "Computer Science & Engineering - Semester 4 End Exam 2025", "subj": cs_sub, "year": "2025"},
        {"title": "Computer Science & Engineering - Semester 4 End Exam 2024", "subj": cs_sub, "year": "2024"},
        {"title": "Applied Mathematics - Semester 4 End Exam 2025", "subj": math_sub, "year": "2025"},
        {"title": "Applied Mathematics - Semester 4 End Exam 2024", "subj": math_sub, "year": "2024"},
        {"title": "Engineering Physics & Science - Semester 4 Exam 2025", "subj": sci_sub, "year": "2025"},
        {"title": "Professional Communication in English - Semester 4 Exam 2024", "subj": eng_sub, "year": "2024"},
    ]

    for p in papers_data:
        db.add(PreviousYearPaper(
            title=p["title"],
            subject_id=p["subj"].id,
            semester=4,
            academic_year=p["year"],
            file_url=f"https://example.com/papers/{p['subj'].code.lower()}_{p['year']}.pdf",
            uploaded_by=admin_user.id,
            created_at=datetime.utcnow() - timedelta(days=10)
        ))

    # ====================================================
    # 10. CREATE WEEKLY TIMETABLE FOR SECTIONS A, B, C
    # ====================================================
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    periods = [
        ("09:00 AM", "10:00 AM", cs_sub, "Dr. Vikram Hegde", "CR-201"),
        ("10:00 AM", "11:00 AM", math_sub, "Prof. Anitha Rao", "CR-201"),
        ("11:15 AM", "12:15 PM", sci_sub, "Prof. Sunita Nair", "Lab-2"),
        ("01:15 PM", "02:15 PM", eng_sub, "Prof. Rajesh Kulkarni", "CR-201"),
        ("02:15 PM", "03:15 PM", soc_sub, "Prof. Meera Shenoy", "CR-201"),
    ]

    for sec in ["A", "B", "C"]:
        for d in days:
            for p in periods:
                db.add(Timetable(
                    section=sec,
                    day_of_week=d,
                    start_time=p[0],
                    end_time=p[1],
                    subject_id=p[2].id,
                    lecturer_name=p[3],
                    room_number=p[4]
                ))

    # ====================================================
    # 11. CREATE SAMPLE NOTIFICATIONS & ACTIVITY LOGS
    # ====================================================
    db.add(Notification(
        user_id=sample_student_1.user_id,
        title="Assessment Scheduled",
        message="Computer Science Unit 1 Assessment is now live! Complete before Friday.",
        link="/student/tests",
        is_read=False,
        created_at=datetime.utcnow() - timedelta(hours=5)
    ))
    db.add(Notification(
        user_id=sample_student_1.user_id,
        title="Study Proof Approved",
        message="Dr. Vikram Hegde has verified your AVL Tree notes.",
        link="/student/proofs",
        is_read=True,
        created_at=datetime.utcnow() - timedelta(days=1)
    ))
    db.add(Notification(
        user_id=primary_lecturer.user_id,
        title="Pending Study Proofs",
        message="You have 1 new study proof awaiting verification in Mathematics.",
        link="/lecturer/proofs",
        is_read=False,
        created_at=datetime.utcnow() - timedelta(hours=2)
    ))
    db.add(Notification(
        user_id=admin_user.id,
        title="Lecturer Verification Request",
        message="Dr. Chetan Joshi (LEC006) submitted verification documents.",
        link="/admin/lecturers",
        is_read=False,
        created_at=datetime.utcnow() - timedelta(hours=3)
    ))

    # Activity Logs
    db.add(ActivityLog(
        user_id=admin_user.id,
        user_name="Dr. S. K. Sharma (Admin)",
        action="System Initialized",
        details="Initialized 180 students across Sections A, B, and C with full assessment baselines.",
        created_at=datetime.utcnow() - timedelta(days=5)
    ))
    db.add(ActivityLog(
        user_id=primary_lecturer.user_id,
        user_name="Dr. Vikram Hegde (Lecturer)",
        action="Created Online Test",
        details="Published Computer Science Unit 1 Assessment (5 Questions, 10 Marks).",
        created_at=datetime.utcnow() - timedelta(days=5)
    ))
    db.add(ActivityLog(
        user_id=sample_student_1.user_id,
        user_name="Aarav Sharma (Student)",
        action="Completed Assessment",
        details="Scored 10/10 in Computer Science Unit 1 Assessment.",
        created_at=datetime.utcnow() - timedelta(days=3)
    ))

    db.commit()
    print("Portal seed data successfully initialized!")

