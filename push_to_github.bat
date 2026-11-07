@echo off
title Push to GitHub - Student Learning Performance Analysis System
echo ========================================================
echo Push Project to GitHub
echo ========================================================
echo.
set /p REPO_URL="Enter your GitHub repository URL (e.g. https://github.com/username/repo.git): "

if "%REPO_URL%"=="" (
    echo Error: Repository URL cannot be empty.
    pause
    exit /b
)

echo.
echo 1. Configuring remote origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo 2. Ensuring branch is main...
git branch -M main

echo 3. Pushing code to GitHub...
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo SUCCESS! Your code has been uploaded to GitHub!
    echo ========================================================
) else (
    echo ========================================================
    echo Push encountered an issue. Please verify your GitHub URL 
    echo and ensure you are logged into Git on your computer.
    echo ========================================================
)
pause
