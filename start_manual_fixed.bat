@echo off
REM LanderAI Manual Startup Script (Windows)
REM No Docker required

echo Starting LanderAI System...
echo =============================

REM Check system requirements
echo Checking system requirements...

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.11+
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

REM Check MySQL
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL client not found. Please install MySQL
    pause
    exit /b 1
)

echo System requirements check passed.

REM Initialize database
echo.
echo Step 1: Initializing database...
cd scripts
call init_database.bat
cd ..

REM Start backend service
echo.
echo Step 2: Starting backend service...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing backend dependencies...
pip install -r requirements.txt

REM Run database migrations
echo Running database migrations...
alembic upgrade head

REM Start backend service (background)
echo Starting backend service...
start "Backend Service" cmd /k "venv\Scripts\uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 5 /nobreak > nul

REM Check backend status
powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing).StatusCode" >nul 2>&1
if %errorlevel% equ 0 (
    echo Backend service running normally
) else (
    echo ERROR: Backend service failed to start
    pause
    exit /b 1
)

cd ..

REM Start frontend service
echo.
echo Step 3: Starting frontend service...
cd frontend

REM Install dependencies
echo Installing frontend dependencies...
npm install

REM Check TypeScript compilation
echo Checking TypeScript compilation...
npx tsc --noEmit

REM Start frontend service
echo Starting frontend service...
start "Frontend Service" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul

cd ..

REM Display status information
echo.
echo System startup complete!
echo =============================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Health Check: http://localhost:8000/health
echo.
echo Note: Services are running in background
echo To stop services, close the terminal windows
echo =============================

pause