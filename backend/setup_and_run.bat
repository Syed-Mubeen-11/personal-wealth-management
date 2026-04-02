@echo off
echo ============================================
echo   FULL SETUP - Personal Wealth Management
echo ============================================
echo.

cd /d "c:\Users\aabel\Desktop\personal-wealth-management\backend"

echo [1/4] Activating virtual environment...
call "..\venv\Scripts\activate.bat" 2>nul
if errorlevel 1 (
    echo   venv not found, creating new one...
    python -m venv "..\venv"
    call "..\venv\Scripts\activate.bat"
)
echo   DONE.
echo.

echo [2/4] Installing dependencies...
pip install -r requirements.txt
echo   DONE.
echo.

echo [3/4] Creating your user account...
python seed_user.py
echo   DONE.
echo.

echo [4/4] Starting backend server...
echo.
echo   ==========================================
echo   Backend: http://127.0.0.1:8000
echo   Login:   aabeltemp@gmail.com / Aabel@2003
echo   Press Ctrl+C to stop
echo   ==========================================
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
