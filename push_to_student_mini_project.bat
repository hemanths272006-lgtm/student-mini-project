@echo off
title Push to GitHub - Student Learning Performance Analysis System
echo ===================================================================
echo Pushing clean source code to GitHub repository:
echo https://github.com/hemanths272006-lgtm/student-mini-project.git
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/4] Staging source code and configurations...
git add .

echo [2/4] Creating upgrade commit...
git commit -m "Upgrade to 3-Portal System: Admin, Lecturer, Student with Google/Demo Auth, Online MCQ Tests, Study Proofs, and Materials"

echo [3/4] Ensuring main branch...
git branch -M main

echo [4/4] Pushing to GitHub remote origin...
git push -u origin main

echo.
echo ===================================================================
echo Completed! Your repository is updated:
echo https://github.com/hemanths272006-lgtm/student-mini-project
echo ===================================================================
echo.
pause
