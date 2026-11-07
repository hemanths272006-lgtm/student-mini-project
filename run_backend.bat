@echo off
title Student Metrics - Backend Server (FastAPI)
echo ========================================================
echo Starting FastAPI Backend Server on http://127.0.0.1:8000
echo ========================================================
cd /d "%~dp0student-metrics\backend"
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause

