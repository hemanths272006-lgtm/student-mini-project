# 🎓 College Mini Project Viva & Interview Guide

This guide contains the most common questions external examiners and professors ask during a mini project demonstration and viva voce, along with clear technical answers.

---

### Q1: What is the main objective of this project?
**Answer**:  
The **Student Learning Performance Analysis System** is an academic decision-support web application that evaluates continuous assessment marks across 180 students in three sections (A, B, C). It automatically categorizes students into **Fast Learners** ($\ge 75\%$), **Average Learners** ($50\% - 74\%$), and **Slow Learners** ($< 50\%$), monitors score trajectories across sequential assessments to determine learning trends (**Improving**, **Consistent**, or **Declining**), and provides personalized remedial study recommendations.

---

### Q2: Why did you choose FastAPI instead of Flask or Django?
**Answer**:
1. **Asynchronous Performance & Concurrency**: FastAPI is built on Starlette and ASGI, delivering high throughput.
2. **Automatic Data Validation**: FastAPI uses Pydantic v2 to validate request payloads (e.g., student marks between 0-100, valid USN format).
3. **Automatic OpenAPI/Swagger Documentation**: FastAPI generates interactive documentation at `/docs` without third-party plugins.
4. **Lightweight**: Unlike Django, it has no bulky overhead, making it ideal for microservices and targeted REST APIs.

---

### Q3: Explain your database schema and normalization.
**Answer**:
Our SQLite database consists of four normalized tables:
- `students`: Stores demographic information (`id`, `student_id`, `usn`, `name`, `section`, `semester`, `attendance`). `usn` is defined with a `UNIQUE` constraint to prevent duplicate enrollments.
- `subjects`: Stores the 5 course subjects (`Mathematics`, `Science`, `English`, `Computer Science`, `Social Studies`).
- `assessments`: Stores the 4 continuous evaluation tests (`Test 1`, `Test 2`, `Test 3`, `Test 4`).
- `marks`: Bridge table with Foreign Keys linking `student_id`, `subject_id`, and `assessment_id` to their respective score. A composite unique constraint ensures no student has duplicate marks for the same test and subject. It uses `CASCADE DELETE` so deleting a student cleans up all related mark entries.

---

### Q4: How is the learning trend calculated?
**Answer**:
Instead of using single-point test scores, the system computes the change between the early phase and late phase:
$$\text{Early Phase Average} = \frac{\text{Test 1} + \text{Test 2}}{2}$$
$$\text{Late Phase Average} = \frac{\text{Test 3} + \text{Test 4}}{2}$$
$$\Delta = \text{Late Phase Average} - \text{Early Phase Average}$$
- If $\Delta > +2.0\%$, the student is tagged as **Improving**.
- If $\Delta < -2.0\%$, the student is tagged as **Declining**.
- Otherwise, they are classified as **Consistent**.

---

### Q5: How do the frontend and backend communicate?
**Answer**:
- The frontend (React.js) communicates asynchronously with the backend (FastAPI) via HTTP REST requests using **Axios**.
- **CORS (Cross-Origin Resource Sharing)** is enabled in FastAPI via `CORSMiddleware` so the React application on `http://localhost:5173` can securely access API resources on `http://127.0.0.1:8000`.
- Vite is also configured with a development proxy forwarding `/api` requests directly to `http://127.0.0.1:8000`.

---

### Q6: How does the application prevent duplicate student seeding on restart?
**Answer**:
In `main.py`'s `lifespan` handler, the system queries the `students` table count before running the generator. If `db.query(Student).count() > 0`, the seed generator is bypassed. The database state persists inside `students.db`.

---

### Q7: What diagnostic criteria are used for the Academic Support Center?
**Answer**:
Students are automatically routed to the Academic Support Center if they meet any of the following criteria:
1. Overall Average $< 50\%$ (Slow Learner tier).
2. Class Attendance $< 75\%$ (statutory university shortfall).
3. Declining test trajectory ($\Delta < -2.0\%$).
4. Critically low individual subject score ($< 40\%$).
The system then suggests targeted interventions (e.g., remedial bridge classes, counselor sessions, or parent-teacher notifications).

