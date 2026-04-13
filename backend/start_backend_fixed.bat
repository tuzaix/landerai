@echo off
REM Backend startup script (Windows)
REM No Docker required

echo Starting backend service...

REM Check Python version
for /f "tokens=2" %%i in ('python --version') do set python_version=%%i
echo Python version: %python_version%

REM Check virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check database connection
echo Checking database connection...
python -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def check_db():
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.connect() as conn:
            result = await conn.execute('SELECT 1')
            print('Database connection successful')
    except Exception as e:
        print(f'Database connection failed: {e}')
        print('Please ensure MySQL service is running and configuration is correct')

asyncio.run(check_db())
"

REM Run database migrations
echo Running database migrations...
alembic upgrade head

REM Start backend service
echo Starting FastAPI service...
echo Service address: http://localhost:8000
echo API docs: http://localhost:8000/docs
echo Health check: http://localhost:8000/health

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause