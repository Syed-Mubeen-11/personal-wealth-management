@echo off
echo ============================================
echo   Personal Wealth Management - Backend
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Activating virtual environment...
call "..\venv\Scripts\activate.bat"
if errorlevel 1 (
    echo ERROR: venv not found at ..\venv - creating new one...
    python -m venv ..\venv
    call "..\venv\Scripts\activate.bat"
)

echo [2/3] Installing dependencies...
pip install -r requirements.txt

echo [3/3] Starting Uvicorn server on port 8000...
echo.
echo   Backend URL: http://127.0.0.1:8000
echo   Press Ctrl+C to stop
echo ============================================
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
