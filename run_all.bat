@echo off
title Student Learning Performance Analysis System - Launcher
echo ===================================================================
echo Launching Student Learning Performance Analysis System...
echo ===================================================================
echo 1. Starting FastAPI Backend Server on port 8000...
start "Backend (FastAPI)" cmd /k "cd /d "%~dp0student-metrics\backend" && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

echo 2. Starting React Vite Frontend Server on port 5173...
start "Frontend (React + Vite)" cmd /k "cd /d "%~dp0student-metrics\frontend" && npm.cmd run dev"

echo 3. Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo 4. Opening Web Application in your browser...
start http://localhost:5173

echo ===================================================================
echo Both servers are running! Keep the terminal windows open.
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000
echo API Docs: http://127.0.0.1:8000/docs
echo ===================================================================
pause
