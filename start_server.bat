@echo off
title Exam System Server
echo ===========================================
echo   EXAM CONTROL SYSTEM - SERVER LAUNCHER
echo ===========================================
echo.
echo 1. Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install it from nodejs.org
    pause
    exit /b
)

echo 2. Entering backend directory...
cd /d "%~dp0backend"

echo 3. Checking for node_modules...
if not exist "node_modules\" (
    echo [INFO] Installing dependencies (this may take a minute)...
    call npm install
)

echo 4. Starting the server...
echo -------------------------------------------
echo THE SERVER IS STARTING. DO NOT CLOSE THIS WINDOW.
echo If this window closes, the website will stop working.
echo -------------------------------------------
node server.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server crashed or failed to start.
    echo Check if Port 3000 is already in use by another program.
)
echo.
pause
