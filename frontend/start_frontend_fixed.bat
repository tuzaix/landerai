@echo off
REM Frontend startup script (Windows)
REM No Docker required

echo Starting frontend service...

REM Check Node.js version
for /f "tokens=1" %%i in ('node --version') do set node_version=%%i
echo Node.js version: %node_version%

REM Check npm version
for /f "tokens=1" %%i in ('npm --version') do set npm_version=%%i
echo npm version: %npm_version%

REM Install dependencies
echo Installing frontend dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Dependency installation failed. Please check network connection and npm configuration
    pause
    exit /b 1
)

REM Check TypeScript compilation
echo Checking TypeScript compilation...
npx tsc --noEmit

if %errorlevel% neq 0 (
    echo ERROR: TypeScript compilation error. Please fix type errors
    pause
    exit /b 1
)

REM Start development server
echo Starting Next.js development server...
echo Frontend address: http://localhost:3000
echo Note: Please ensure backend service is running at http://localhost:8000

npm run dev

pause