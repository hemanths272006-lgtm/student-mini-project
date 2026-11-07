import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional

SUBJECT_DEFAULTS = [
    {"name": "Mathematics", "code": "MATH"},
    {"name": "Science", "code": "SCI"},
    {"name": "English", "code": "ENG"},
    {"name": "Computer Science", "code": "CS"},
    {"name": "Social Studies", "code": "SOC"},
]

ASSESSMENT_DEFAULTS = [
    {"name": "Test 1", "code": "T1", "order_num": 1},
    {"name": "Test 2", "code": "T2", "order_num": 2},
    {"name": "Test 3", "code": "T3", "order_num": 3},
    {"name": "Test 4", "code": "T4", "order_num": 4},
]

def classify_learner(average_score: float) -> str:
    """
    Classification rules:
    - Fast Learner: Average >= 75
    - Average Learner: Average >= 50 and < 75
    - Slow Learner: Average < 50
    """
    if average_score >= 75.0:
        return "Fast Learner"
    elif average_score >= 50.0:
        return "Average Learner"
    else:
        return "Slow Learner"

def calculate_learning_trend(test_averages: Dict[str, float]) -> str:
    """
    Calculate learning trends by comparing the average of the
    first two tests (Test 1, Test 2) with the average of the last two tests (Test 3, Test 4).
    Returns: 'Improving', 'Declining', or 'Consistent'
    """
    t1 = test_averages.get("Test 1") or test_averages.get("T1") or 0.0
    t2 = test_averages.get("Test 2") or test_averages.get("T2") or 0.0
    t3 = test_averages.get("Test 3") or test_averages.get("T3") or 0.0
    t4 = test_averages.get("Test 4") or test_averages.get("T4") or 0.0

    first_two_avg = (t1 + t2) / 2.0 if (t1 + t2) > 0 else 0.0
    last_two_avg = (t3 + t4) / 2.0 if (t3 + t4) > 0 else 0.0

    diff = last_two_avg - first_two_avg

    if diff > 2.0:
        return "Improving"
    elif diff < -2.0:
        return "Declining"
    else:
        return "Consistent"

def generate_improvement_suggestions(
    category: str,
    trend: str,
    attendance: float,
    subject_averages: Dict[str, float]
) -> List[str]:
    """
    Provide tailored, actionable improvement suggestions based on
    subject-wise marks, attendance rate, and trend.
    """
    suggestions = []

    # Identify lowest and highest scoring subjects
    sorted_subjects = sorted(subject_averages.items(), key=lambda x: x[1])
    if sorted_subjects:
        lowest_subject, lowest_score = sorted_subjects[0]
        highest_subject, highest_score = sorted_subjects[-1]

        if lowest_score < 50:
            suggestions.append(
                f"Critical focus needed in {lowest_subject} (Avg: {lowest_score:.1f}%). Arrange remedial coaching and fundamental concept revisions."
            )
        elif lowest_score < 70:
            suggestions.append(
                f"Allocate 45 minutes daily for targeted practice questions and previous years' papers in {lowest_subject}."
            )
        else:
            suggestions.append(
                f"Maintain steady practice in {lowest_subject} (Avg: {lowest_score:.1f}%) to push towards mastery."
            )

        if highest_score >= 80:
            suggestions.append(
                f"Excelling in {highest_subject} ({highest_score:.1f}%). Consider taking up advanced projects or peer-tutoring fellow classmates."
            )

    # Attendance based advice
    if attendance < 75.0:
        suggestions.append(
            f"Attendance ({attendance:.1f}%) is below the mandatory 75% threshold. Consistent attendance is crucial to prevent falling behind."
        )
    elif attendance >= 90.0:
        suggestions.append(
            f"Excellent attendance record ({attendance:.1f}%). Consistent classroom presence directly supports steady academic growth."
        )

    # Trend based advice
    if trend == "Declining":
        suggestions.append(
            "Recent test performance shows a declining trajectory. Schedule a 1-on-1 counseling session to diagnose study roadblocks."
        )
    elif trend == "Improving":
        suggestions.append(
            "Strong upward progression observed from Test 1/2 to Test 3/4! Keep up the momentum through consistent test simulations."
        )
    else:
        suggestions.append(
            "Consistent test performance. To progress to the next learner tier, implement structured weekend revision schedules."
        )

    # Category specific advice
    if category == "Slow Learner":
        suggestions.append(
            "Break down syllabus chapters into bite-sized weekly goals and attend after-class doubt clearing hours."
        )
    elif category == "Fast Learner":
        suggestions.append(
            "Encourage participation in inter-college competitive tests, technical seminars, and advanced laboratory assignments."
        )

    return suggestions

def compute_student_metrics(marks_data: List[Dict[str, Any]], attendance: float) -> Dict[str, Any]:
    """
    Compute overall average, category, subject averages, test averages,
    trend, highest/lowest subjects, and suggestions from raw marks.
    marks_data: list of dicts with keys: subject_name, assessment_name, score
    """
    if not marks_data:
        return {
            "overall_average": 0.0,
            "category": "Slow Learner",
            "trend": "Consistent",
            "subject_averages": {},
            "test_averages": {},
            "highest_subject": "N/A",
            "highest_score": 0.0,
            "lowest_subject": "N/A",
            "lowest_score": 0.0,
            "suggestions": ["No assessment marks entered yet."],
            "total_marks_count": 0
        }

    df = pd.DataFrame(marks_data)
    overall_avg = float(df["score"].mean()) if not df.empty else 0.0
    overall_avg = round(overall_avg, 2)

    category = classify_learner(overall_avg)

    # Subject-wise averages
    subject_grp = df.groupby("subject_name")["score"].mean().round(2).to_dict()

    # Test-wise averages
    test_grp = df.groupby("assessment_name")["score"].mean().round(2).to_dict()

    trend = calculate_learning_trend(test_grp)

    # Highest & lowest subject
    if subject_grp:
        highest_subj = max(subject_grp.items(), key=lambda x: x[1])
        lowest_subj = min(subject_grp.items(), key=lambda x: x[1])
        highest_name, highest_val = highest_subj[0], highest_subj[1]
        lowest_name, lowest_val = lowest_subj[0], lowest_subj[1]
    else:
        highest_name, highest_val = "N/A", 0.0
        lowest_name, lowest_val = "N/A", 0.0

    suggestions = generate_improvement_suggestions(category, trend, attendance, subject_grp)

    return {
        "overall_average": overall_avg,
        "category": category,
        "trend": trend,
        "subject_averages": subject_grp,
        "test_averages": test_grp,
        "highest_subject": highest_name,
        "highest_score": highest_val,
        "lowest_subject": lowest_name,
        "lowest_score": lowest_val,
        "suggestions": suggestions,
        "total_marks_count": len(marks_data)
    }

# ----------------------------------------------------
# Realistic 180 Student Seed Data Generator
# ----------------------------------------------------
FIRST_NAMES = [
    "Aarav", "Aditi", "Aditya", "Akshay", "Amrita", "Ananya", "Aniket", "Anirudh", "Ankita", "Arjun",
    "Ayush", "Bhavya", "Chetan", "Deepa", "Deepak", "Dev", "Divya", "Gaurav", "Harini", "Harish",
    "Ishaan", "Isha", "Jaya", "Karan", "Kavya", "Keerthi", "Kiran", "Komal", "Krishna", "Madhuri",
    "Manish", "Meera", "Manoj", "Neha", "Nikhil", "Nisha", "Naveen", "Pooja", "Pranav", "Prashanth",
    "Priya", "Rahul", "Rajesh", "Rakshith", "Rhea", "Rishi", "Rohan", "Sanjana", "Santosh", "Shreya",
    "Siddharth", "Sneha", "Suraj", "Suresh", "Tanvi", "Tarun", "Varun", "Vidya", "Vikram", "Yash",
    "Aakash", "Abhinav", "Alok", "Anurag", "Aryan", "Ashish", "Chandan", "Gautam", "Himanshu", "Jayesh",
    "Kartik", "Kunal", "Mahesh", "Mayank", "Mohit", "Naveen", "Pawan", "Prateek", "Ravi", "Rishabh",
    "Sachin", "Sameer", "Saurabh", "Shashank", "Shivam", "Sumit", "Sunny", "Utkarsh", "Vaibhav", "Vikas",
    "Vishal", "Vivek", "Akansha", "Anjali", "Apoorva", "Archana", "Barkha", "Deepika", "Garima", "Ipsita",
    "Kajal", "Khushboo", "Kritika", "Latika", "Mamta", "Monika", "Namrata", "Neelam", "Pallavi", "Payal",
    "Pratibha", "Preeti", "Priyanka", "Radhika", "Rashi", "Rekha", "Ritu", "Ruchika", "Sangeeta", "Sapna"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Reddy", "Rao", "Nair", "Iyer", "Kumar", "Singh", "Gupta",
    "Joshi", "Bhat", "Hegde", "Shetty", "Kulkarni", "Deshmukh", "Choudhury", "Das", "Banerjee", "Mehta",
    "Agarwal", "Mishra", "Pandey", "Saxena", "Soni", "Jain", "Trivedi", "Shukla", "Pandit", "Menon",
    "Pillai", "Gowda", "Naik", "Prasad", "Swamy", "Acharya", "Shenoy", "Kamath", "Pai", "Murthy"
]

def generate_seed_students_data():
    """
    Generates data for 180 students across Section A (60), B (60), C (60).
    Ensures realistic, varied names and non-identical marks.
    Distribution: ~30% Fast Learners, ~50% Average Learners, ~20% Slow Learners.
    Assessments: Test 1, Test 2, Test 3, Test 4.
    Subjects: Mathematics, Science, English, Computer Science, Social Studies.
    """
    students_data = []
    student_id_counter = 1
    np.random.seed(42)  # Deterministic yet realistic

    sections = [
        {"name": "A", "start_usn": 1, "count": 60},
        {"name": "B", "start_usn": 61, "count": 60},
        {"name": "C", "start_usn": 121, "count": 60},
    ]

    used_names = set()

    for sec in sections:
        sec_name = sec["name"]
        for i in range(sec["count"]):
            idx = sec["start_usn"] + i
            usn = f"1MS24CS{idx:03d}"
            student_id = f"STU{idx:03d}"

            # Pick a unique student name
            while True:
                fn = np.random.choice(FIRST_NAMES)
                ln = np.random.choice(LAST_NAMES)
                full_name = f"{fn} {ln}"
                if full_name not in used_names:
                    used_names.add(full_name)
                    break

            # Target tier assignment
            # 0: Fast Learner (~30%), 1: Average Learner (~50%), 2: Slow Learner (~20%)
            tier_prob = np.random.rand()
            if tier_prob < 0.32:
                # Fast Learner: base 77 - 94
                base_score = np.random.uniform(77.0, 93.0)
                attendance = round(float(np.random.uniform(84.0, 99.0)), 1)
            elif tier_prob < 0.82:
                # Average Learner: base 53 - 73
                base_score = np.random.uniform(53.0, 72.0)
                attendance = round(float(np.random.uniform(74.0, 92.0)), 1)
            else:
                # Slow Learner: base 34 - 48
                base_score = np.random.uniform(34.0, 48.0)
                attendance = round(float(np.random.uniform(62.0, 80.0)), 1)

            # Trend preference for this student:
            # -1 = Declining, 0 = Consistent, 1 = Improving
            trend_type = np.random.choice([-1, 0, 1], p=[0.32, 0.36, 0.32])

            student_record = {
                "student_id": student_id,
                "usn": usn,
                "name": full_name,
                "section": sec_name,
                "semester": 4,
                "attendance": attendance,
                "marks": []
            }

            # Subject offsets (each student has natural strengths/weaknesses)
            subject_offsets = {
                "Mathematics": np.random.uniform(-7.0, 8.0),
                "Science": np.random.uniform(-6.0, 7.0),
                "English": np.random.uniform(-4.0, 9.0),
                "Computer Science": np.random.uniform(-5.0, 10.0),
                "Social Studies": np.random.uniform(-7.0, 6.0),
            }

            for t_idx, test_name in enumerate(["Test 1", "Test 2", "Test 3", "Test 4"]):
                # Trend delta based on test order
                if trend_type == 1:
                    test_delta = (t_idx - 1.5) * 2.8  # Increases over time
                elif trend_type == -1:
                    test_delta = -(t_idx - 1.5) * 2.8  # Decreases over time
                else:
                    test_delta = np.random.uniform(-1.5, 1.5)

                for subj in ["Mathematics", "Science", "English", "Computer Science", "Social Studies"]:
                    noise = np.random.normal(0, 3.2)
                    mark = base_score + subject_offsets[subj] + test_delta + noise
                    # Clamp marks between 15 and 99
                    mark = max(18.0, min(99.0, mark))
                    student_record["marks"].append({
                        "test": test_name,
                        "subject": subj,
                        "score": round(float(mark), 1)
                    })

            students_data.append(student_record)

    return students_data

