@echo off
title Grievance Classifier API Service
setlocal enabledelayedexpansion

echo ========================================================
echo    Starting Citizen Grievance Classifier API Service
echo ========================================================
echo.

cd /d "%~dp0"

:: Check if Python 3.13 via py launcher exists
py -3.13 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python 3.13 via py launcher...
    set PYTHON_CMD=py -3.13
    goto RUN
)

:: Check if standard python exists
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python from PATH...
    set PYTHON_CMD=python
    goto RUN
)

:: Check .venv
if exist ".venv\Scripts\python.exe" (
    echo Using virtual environment .venv...
    set PYTHON_CMD=".venv\Scripts\python.exe"
    goto RUN
)

echo [ERROR] No suitable Python installation found!
echo Please ensure Python 3.12+ is installed and in your PATH.
pause
exit /b 1

:RUN
echo.
echo Starting FastAPI Service on http://0.0.0.0:8000 ...
echo Press Ctrl+C anytime to stop the service.
echo.

%PYTHON_CMD% run_service.py --host 0.0.0.0 --port 8000

pause
