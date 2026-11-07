# Student Learning Performance Analysis System

A comprehensive, full-stack college mini project web application designed for academic administrators, faculties, and students to evaluate, track, and improve student learning outcomes using data-driven insights.

---

## 🌟 Key Features

1. **180 Student Pre-Configured Database**:
   - **Section A**: 60 Students (`1MS24CS001` - `1MS24CS060`)
   - **Section B**: 60 Students (`1MS24CS061` - `1MS24CS120`)
   - **Section C**: 60 Students (`1MS24CS121` - `1MS24CS180`)
   - 5 Subjects: Mathematics, Science, English, Computer Science, Social Studies.
   - 4 Continuous Assessments: Test 1, Test 2, Test 3, Test 4.
   - Realistic, non-identical scores and attendance percentages.

2. **Automated Learner Classification**:
   - 🟢 **Fast Learner**: Cumulative Average $\ge$ 75%
   - 🔵 **Average Learner**: Cumulative Average between 50% and 74%
   - 🔴 **Slow Learner**: Cumulative Average $<$ 50%

3. **Continuous Learning Trend Detection**:
   - Compares the first two tests ($\text{Test 1} + \text{Test 2}$) with the last two tests ($\text{Test 3} + \text{Test 4}$):
     - **Improving**: Score increase $> +2.0\%$
     - **Declining**: Score decrease $< -2.0\%$
     - **Consistent**: Change within $[-2.0\%, +2.0\%]$

4. **Interactive Dashboard**:
   - KPI Cards: Total Students, Fast Learners, Average Learners, Slow Learners, Class Average, Attendance.
   - Recharts visual charts: Donut learner breakdown, Subject averages bar chart, Test progression line chart, and Section comparisons.

5. **Student Management & Operations**:
   - Live Search by Student Name or USN.
   - Filter by Section (A, B, C) and Learner Category.
   - Sort by Marks, Attendance, USN, or Name.
   - Add new student with live preview of learner classification.
   - Edit student details and update assessment marks.
   - Delete student with safety confirmation modal.
   - Pagination with custom limits.

6. **Printable Student Performance Report**:
   - Institutional transcript with department header and signature blocks.
   - Marks matrix table across all 4 tests and 5 subjects.
   - Progression graphs and strongest/weakest subject analysis.
   - Personalized actionable academic improvement suggestions.
   - Print-ready stylesheet via one-click **Print Formal Report**.

7. **Performance Analytics**:
   - Cross-sectional benchmarking (Section A vs B vs C).
   - Cohort trend distribution.
   - Academic Honors: Top 10 High Performers Leaderboard.
   - Academic Support Center: Flags students with low marks, low attendance ($< 75\%$), or declining trajectory with custom intervention plans.

8. **CSV Import & Export**:
   - Bulk upload student marks with column verification and row-level error reporting.
   - Export full cohort report as CSV.
   - Downloadable formatted CSV sample template.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, React Router v6, Axios, Lucide React Icons |
| **Backend** | Python 3.13, FastAPI, SQLAlchemy 2.0, Pandas, NumPy, Pydantic v2 |
| **Database** | SQLite (`students.db`) with relational integrity & cascade delete |

---

## 🚀 How to Run the Application (Step-by-Step)

### Prerequisites
- Python 3.9+ installed on your computer.
- Node.js (v18 or higher) and npm installed on your computer.

---

### Step 1: Start the Backend Server

Open your terminal or command prompt:

```bash
# Navigate to the backend folder
cd "e:\student mini project\student-metrics\backend"

# (Optional) Install dependencies if not already installed
pip install -r requirements.txt

# Start the FastAPI server using Uvicorn
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

> **Verification**:
> - Backend API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
> - Interactive API Documentation (Swagger UI): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
> - Alternative API Docs (ReDoc): [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### Step 2: Start the Frontend Application

Open a **second** terminal window:

```bash
# Navigate to the frontend folder
cd "e:\student mini project\student-metrics\frontend"

# (Optional) Install dependencies if running for the first time
npm install

# Start the Vite development server
npm run dev
```

> **Verification**:
> - Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Directory Structure

```
student-metrics/
├── backend/
│   ├── main.py              # FastAPI endpoints, CORS, and lifecycle events
│   ├── database.py          # SQLite engine & database session management
│   ├── models.py            # SQLAlchemy models: Student, Subject, Assessment, Mark
│   ├── schemas.py           # Pydantic validation schemas
│   ├── analysis.py          # Classification rules, trend detection, seed generator
│   ├── requirements.txt     # Python dependencies
│   └── students.db          # SQLite persistent database (created automatically)
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Navbar, StatCard, Badges, Modals
│   │   ├── pages/           # Dashboard, Students, StudentReport, Analytics, Settings
│   │   ├── services/        # Axios API client functions
│   │   ├── App.jsx          # Router layout & navigation configuration
│   │   ├── main.jsx         # React application entry point
│   │   └── index.css        # Tailwind directives and printable styles
│   ├── package.json         # Frontend packages and build scripts
│   ├── vite.config.js       # Vite development proxy configuration
│   └── tailwind.config.js   # Custom Navy & Learner color palette
└── README.md                # Project documentation and user guide
```

---

## 🧪 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | KPI stats, distribution charts, and section summaries |
| `GET` | `/api/students` | Paginated students with search, filters, and sorting |
| `POST` | `/api/students` | Register a new student with assessment marks |
| `GET` | `/api/students/{id}` | Get full profile, marks matrix, and metrics |
| `PUT` | `/api/students/{id}` | Update student information or assessment scores |
| `DELETE`| `/api/students/{id}` | Delete student and cascade associated marks |
| `GET` | `/api/reports/{id}` | Detailed printable student transcript and recommendations |
| `GET` | `/api/analytics` | Comparative sectional analytics, top rankers, support target |
| `POST` | `/api/import-csv` | Validate and import student records from CSV file |
| `GET` | `/api/export-csv` | Export all student performance metrics to CSV |
| `GET` | `/api/sample-csv` | Download template CSV for student mark ingestion |
| `POST` | `/api/reset-sample-data` | Re-seed pristine 180 student dataset across A, B, and C |

---

## 🎓 Academic Viva & College Presentation Highlights

- **Data Consistency**: Relational database with Foreign Keys and Unique Constraints prevents duplicate USNs.
- **Dynamic Metrics**: Overall averages, ranks, and categories are computed dynamically from stored assessment marks rather than hardcoded.
- **Scalability**: Paginated queries and modular schema support easy scaling beyond 180 students.
- **Pedagogical Impact**: Tailored recommendations guide teachers on remedial classes for slow learners and advanced topics for fast learners.

