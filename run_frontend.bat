@echo off
title Student Metrics - Frontend Server (React + Vite)
echo ========================================================
echo Starting React Vite Frontend Server on http://localhost:5173
echo ========================================================
cd /d "%~dp0student-metrics\frontend"
call npm.cmd run dev
pause
