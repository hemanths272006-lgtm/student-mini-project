# Student Learning Performance Analysis System — Full Stack Application

This directory contains the core source code for the **Student Learning Performance Analysis System**:

- **`backend/`**: FastAPI Python server, SQLAlchemy models, SQLite database, algorithms, and portal endpoints.
- **`frontend/`**: React 18, Vite, Tailwind CSS, Recharts, and Role-Based Access Control portal layouts.

Please refer to the root [README.md](../../README.md) for full project architecture diagrams, role features, academic formulas, and 1-click startup guides.

---

## 🚀 Quick Execution Commands

### 1. Backend Server
```powershell
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API URL: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend Server
```powershell
cd frontend
npm.cmd run dev
```
- App URL: [http://localhost:5173](http://localhost:5173)
