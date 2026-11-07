# 📘 ACADEMIC PROJECT REPORT

## STUDENT LEARNING PERFORMANCE ANALYSIS SYSTEM

**A Mini-Project Report Submitted in Partial Fulfillment of the Requirements for the Award of the Degree of**

### BACHELOR OF ENGINEERING  
**IN**  
### COMPUTER SCIENCE & ENGINEERING  

---

## 🏛️ CERTIFICATE

This is to certify that the mini-project work entitled **"Student Learning Performance Analysis System"** is a bonafide work carried out by:

- **Student Name**: __________________________  
- **University Seat Number (USN)**: __________________________  

in partial fulfillment for the award of the degree of **Bachelor of Engineering in Computer Science and Engineering** during the academic year **2026–2027**. It is certified that all corrections and suggestions indicated for internal assessment have been incorporated in the report.

---

**Internal Guide** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Head of the Department**  
Signature: __________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Signature: __________________  
Name: ______________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Name: ______________________  

---

## 🙏 ACKNOWLEDGEMENT

I express my sincere gratitude to our respected Principal and Head of the Department of Computer Science & Engineering for providing the necessary infrastructure, computational laboratory facilities, and encouragement to undertake and successfully complete this project.

I convey my deep sense of gratitude and indebtedness to my Project Guide for their inspiring guidance, constant supervision, valuable suggestions, and constructive criticism throughout the duration of this mini-project.

Finally, I thank my parents, faculty members, and peers who directly or indirectly aided me in the successful completion of this system.

---

## 📑 TABLE OF CONTENTS

1. **Chapter 1: Introduction**
   - 1.1 Project Overview
   - 1.2 Problem Statement
   - 1.3 Purpose & Objectives
   - 1.4 Scope of the Project
2. **Chapter 2: Literature Survey & Existing Systems**
   - 2.1 Existing System Analysis
   - 2.2 Limitations of the Existing System
   - 2.3 Proposed System Architecture & Advantages
3. **Chapter 3: System Requirement Specifications (SRS)**
   - 3.1 Hardware Requirements
   - 3.2 Software Requirements
   - 3.3 Functional Requirements
   - 3.4 Non-Functional Requirements
4. **Chapter 4: System Design & Modeling**
   - 4.1 System Architecture Diagram
   - 4.2 Entity-Relationship (ER) Diagram
   - 4.3 Data Flow Diagram (DFD Level 0 & Level 1)
   - 4.4 Mathematical Modeling & Algorithms
5. **Chapter 5: Implementation**
   - 5.1 Backend Implementation (FastAPI, SQLAlchemy, Pandas)
   - 5.2 Frontend Implementation (React.js, Tailwind CSS, Recharts)
   - 5.3 Database Normalization & Design
   - 5.4 Seed Data Generation & Relational Integrity
6. **Chapter 6: Software Testing & Results**
   - 6.1 Test Methodology (Unit & Integration Testing)
   - 6.2 Test Cases and Verification Results
   - 6.3 Module Demonstrations & Screen Flow
7. **Chapter 7: Conclusion & Future Scope**
   - 7.1 Conclusion
   - 7.2 Future Enhancements
8. **References & Bibliography**

---

## 🌟 CHAPTER 1: INTRODUCTION

### 1.1 Project Overview
In modern educational pedagogy, Outcome-Based Education (OBE) and continuous evaluation form the foundation for assessing learning effectiveness. The **Student Learning Performance Analysis System** is an automated web platform that evaluates continuous assessment performance across **180 students** grouped into **three sections (Section A, B, and C)**. Each student is evaluated across **five subjects** (Mathematics, Science, English, Computer Science, and Social Studies) over **four sequential test cycles** (Test 1, Test 2, Test 3, and Test 4).

### 1.2 Problem Statement
Traditional academic tracking mechanisms depend heavily on static spreadsheets or end-of-semester examinations. These approaches exhibit significant shortcomings:
- Inability to detect declining trajectories early in the semester.
- Absence of transparent, mathematical rules to segment Fast, Average, and Slow Learners.
- Lack of individualized diagnostic recommendations for students requiring remedial assistance.
- Tedious manual compilation of section-wise performance metrics.

### 1.3 Purpose & Objectives
1. Maintain a normalized relational store tracking 180 students across 3 sections.
2. Automate learner tier classification: **Fast Learner** ($\ge 75\%$), **Average Learner** ($50\% - 74\%$), and **Slow Learner** ($< 50\%$).
3. Formulate a trajectory detection formula comparing early phase tests (Tests 1 & 2) against late phase tests (Tests 3 & 4) to identify **Improving**, **Consistent**, or **Declining** trends.
4. Provide an executive dashboard with interactive visual graphs.
5. Generate an official, print-ready institutional transcript with individualized remedial guidance.
6. Support bulk CSV data ingestion and export.

---

## 🔍 CHAPTER 2: LITERATURE SURVEY & EXISTING SYSTEMS

### 2.1 Existing System Analysis
In most colleges, marks are recorded in Microsoft Excel or Google Sheets. Teachers manually calculate averages and percentage cutoffs.
- **Drawbacks**:
  - No relational integrity (duplicate entries or missing marks frequently occur).
  - High risk of accidental data deletion or overwriting.
  - No interactive cohort visualization or real-time distribution charts.
  - Inconvenient for generating printable student transcripts.

### 2.2 Proposed System & Advantages
The proposed web application couples a high-throughput **FastAPI** backend with a reactive **React.js** frontend:
- **Centralized Database**: SQLite relational database enforces unique USN constraints and cascade deletions.
- **Automated Intelligence**: Trajectory algorithms automatically identify students needing academic support without teacher calculation.
- **Interactive Visualizations**: Recharts provides responsive donut, grouped bar, and multi-line charts.
- **Institutional Transcripts**: Generates formal evaluation transcripts printable in one click.

---

## ⚙️ CHAPTER 3: SYSTEM REQUIREMENT SPECIFICATIONS (SRS)

### 3.1 Hardware Requirements
- **Processor**: Intel Core i3 / AMD Ryzen 3 or higher.
- **RAM**: Minimum 4 GB (8 GB recommended).
- **Storage**: Minimum 500 MB free hard disk space.
- **Display**: $1366 \times 768$ minimum resolution (1080p recommended).

### 3.2 Software Requirements
- **Operating System**: Windows 10/11, macOS, or Linux.
- **Backend Runtime**: Python 3.9+ (Python 3.13 tested).
- **Frontend Runtime**: Node.js v18+ and npm v9+.
- **Database**: SQLite 3.
- **Web Browser**: Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

### 3.3 Functional Requirements
1. **FR1 - Student Management**: System must allow adding, updating, searching, and deleting students with unique USNs.
2. **FR2 - Continuous Assessment Evaluation**: System must record scores out of 100 across 5 subjects for Tests 1 through 4.
3. **FR3 - Learner Classification**: System must categorize learners based on cumulative averages.
4. **FR4 - Trend Detection**: System must calculate score changes over time to flag trajectory.
5. **FR5 - Report Generation**: System must format and render official student transcripts.
6. **FR6 - CSV Ingestion & Export**: System must validate and import CSV marks files and export full records.

---

## 📐 CHAPTER 4: SYSTEM DESIGN & MODELING

### 4.1 System Architecture

```
+-------------------------------------------------------------+
|                     Presentation Layer                      |
|                  React.js + Tailwind CSS                    |
|    [Dashboard]  [Students]  [Analytics]  [Reports] [Settings]|
+------------------------------+------------------------------+
                               |
                        HTTP / REST APIs
                               |
+------------------------------v------------------------------+
|                     Application Layer                       |
|                   FastAPI (Python 3.13)                     |
|  - Pydantic Validation Engine                               |
|  - Business Logic & Classification Algorithm                |
|  - Pandas / NumPy Analytical Processing                     |
+------------------------------+------------------------------+
                               |
                       SQLAlchemy 2.0 ORM
                               |
+------------------------------v------------------------------+
|                      Data Storage Layer                     |
|                     SQLite (students.db)                    |
|          [students]   [subjects]   [assessments]  [marks]   |
+-------------------------------------------------------------+
```

### 4.2 Entity-Relationship (ER) Schema

- **`students` Table**:
  - `id`: Integer (Primary Key)
  - `student_id`: String(20) (Unique, Indexed)
  - `usn`: String(20) (Unique, Indexed)
  - `name`: String(100)
  - `section`: String(5) — "A", "B", "C"
  - `semester`: Integer (Default 4)
  - `attendance`: Float (0.0 to 100.0)

- **`subjects` Table**:
  - `id`: Integer (Primary Key)
  - `name`: String(50) (Unique) — Mathematics, Science, English, Computer Science, Social Studies
  - `code`: String(10) (Unique) — MATH, SCI, ENG, CS, SOC

- **`assessments` Table**:
  - `id`: Integer (Primary Key)
  - `name`: String(50) (Unique) — Test 1, Test 2, Test 3, Test 4
  - `code`: String(10) (Unique) — T1, T2, T3, T4
  - `order_num`: Integer (1, 2, 3, 4)

- **`marks` Table**:
  - `id`: Integer (Primary Key)
  - `student_id`: ForeignKey(`students.id`, ondelete="CASCADE")
  - `subject_id`: ForeignKey(`subjects.id`)
  - `assessment_id`: ForeignKey(`assessments.id`)
  - `score`: Float (0.0 to 100.0)
  - `UniqueConstraint('student_id', 'subject_id', 'assessment_id')`

---

## 🧮 CHAPTER 5: MATHEMATICAL MODELING & FORMULAS

### 5.1 Cumulative Overall Average
For a student $s$ with assessment marks $M$:
$$\text{Overall Average}_s = \frac{1}{K \times J} \sum_{k=1}^{K} \sum_{j=1}^{J} \text{Score}_{s, k, j}$$
*(Where $K = 4$ assessments and $J = 5$ subjects, giving $N = 20$ marks per student).*

### 5.2 Learner Tier Classification
$$\text{Category}_s = \begin{cases}
\text{Fast Learner}, & \text{if } \text{Overall Average}_s \ge 75.0\% \\
\text{Average Learner}, & \text{if } 50.0\% \le \text{Overall Average}_s < 75.0\% \\
\text{Slow Learner}, & \text{if } \text{Overall Average}_s < 50.0\%
\end{cases}$$

### 5.3 Learning Trajectory Trend Metric ($\Delta$)
Let $T_1, T_2, T_3, T_4$ denote the student's test averages:
$$\text{Early Phase Average} = \frac{T_1 + T_2}{2}$$
$$\text{Late Phase Average} = \frac{T_3 + T_4}{2}$$
$$\Delta = \text{Late Phase Average} - \text{Early Phase Average}$$
$$\text{Trend}_s = \begin{cases}
\text{Improving}, & \text{if } \Delta > +2.0\% \\
\text{Declining}, & \text{if } \Delta < -2.0\% \\
\text{Consistent}, & \text{if } -2.0\% \le \Delta \le +2.0\%
\end{cases}$$

---

## 🧪 CHAPTER 6: TESTING & VERIFICATION RESULTS

An automated verification test suite (`test_suite.py`) was executed to validate the entire backend.

| Test Case | Description | Expected Result | Observed Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Database Seeding | Seeds exactly 180 students across Sections A, B, C | 180 students, 60 in each section | **PASS** |
| **TC-02** | Restart Duplication Check | Database re-init must not duplicate records | Count remains 180 | **PASS** |
| **TC-03** | USN Search | Search `1MS24CS001` returns exact student | Correct student record retrieved | **PASS** |
| **TC-04** | Section Filter | Filter by Section A | Exactly 60 students returned | **PASS** |
| **TC-05** | Category Filter | Filter by Fast Learner | Exactly 52 Fast Learners returned | **PASS** |
| **TC-06** | Student Creation | Create student with 5 marks in Test 1 | Student ID 181 created, Fast Learner | **PASS** |
| **TC-07** | Mark Update | Update student attendance to 95.0% | Updated successfully | **PASS** |
| **TC-08** | Cascade Deletion | Delete student ID 181 | Student and associated marks removed | **PASS** |
| **TC-09** | Report Generation | Get transcript for student ID 1 | Report returns ranks & recommendations | **PASS** |
| **TC-10** | Analytics Top 10 | Retrieve top rankers | Returns exactly 10 sorted students | **PASS** |
| **TC-11** | Database Re-seed | Reset database from UI/API | Re-seeds pristine 180 student dataset | **PASS** |

---

## 🎯 CHAPTER 7: CONCLUSION & FUTURE SCOPE

### 7.1 Conclusion
The **Student Learning Performance Analysis System** demonstrates a full-stack, data-driven approach to educational monitoring. By replacing fragile spreadsheets with a relational database and interactive analytical dashboards, the application allows educational institutions to detect declining performance early, support at-risk students, and foster academic excellence.

### 7.2 Future Scope
1. **Machine Learning Predictive Modeling**: Integrate algorithms (e.g. Linear Regression, Random Forest) to forecast semester-end exam GPA based on continuous test trends.
2. **Automated Notification Gateway**: SMS and email notifications to parents when attendance drops below 75%.
3. **Role-Based Portals**: Dedicated student self-service dashboards where students can log in with their USN to track their individual progress.
4. **Mobile Application**: Native mobile app wrapper using React Native for faculty grade entry on mobile devices.

---

## 📚 REFERENCES & BIBLIOGRAPHY

1. **FastAPI Documentation**: Tiangolo, S., *"FastAPI Framework, High Performance Web APIs with Python"*, https://fastapi.tiangolo.com/
2. **React.js Documentation**: Meta Open Source, *"React — A JavaScript library for building user interfaces"*, https://react.dev/
3. **SQLAlchemy 2.0 Documentation**: Bayer, M., *"The Python SQL Toolkit and Object Relational Mapper"*, https://www.sqlalchemy.org/
4. **Outcome-Based Education (OBE) Principles**: Spady, W., *"Outcome-Based Education: Critical Issues and Answers"*, American Association of School Administrators.
5. **Tailwind CSS**: Wathan, A. et al., *"Utility-First CSS Framework"*, https://tailwindcss.com/
6. **Recharts**: Recharts Group, *"Redefined chart library built with React and D3"*, https://recharts.org/
