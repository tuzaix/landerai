@echo off
REM Database initialization script (Windows)
REM Create database and table structure

echo Initializing database...

REM MySQL connection info
set MYSQL_HOST=127.0.0.1
set MYSQL_PORT=3306
set MYSQL_USER=root
set MYSQL_PASSWORD=root
set MYSQL_DATABASE=landerai

REM Check MySQL connection
echo Checking MySQL connection...
mysql -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASSWORD% -e "SELECT 1;" > nul 2>&1

if %errorlevel% neq 0 (
    echo ERROR: MySQL connection failed. Please ensure:
    echo    - MySQL service is running
    echo    - Connection info is correct: %MYSQL_HOST%:%MYSQL_PORT%
    echo    - Username and password are correct: %MYSQL_USER%/*****
    pause
    exit /b 1
)

echo MySQL connection successful.

REM Create database
echo Creating database %MYSQL_DATABASE%...
mysql -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS %MYSQL_DATABASE% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %errorlevel% neq 0 (
    echo ERROR: Database creation failed
    pause
    exit /b 1
)

echo Database created successfully.

REM Check Redis connection
echo Checking Redis connection...
redis-cli -h 127.0.0.1 -p 6379 ping > nul 2>&1

if %errorlevel% neq 0 (
    echo WARNING: Redis connection failed. Please ensure Redis service is running
    echo    This will not affect backend startup but will impact cache functionality
) else (
    echo Redis connection successful.
)

echo Database initialization complete!
echo Database info:
echo    - Address: %MYSQL_HOST%:%MYSQL_PORT%
echo    - Database: %MYSQL_DATABASE%
echo    - User: %MYSQL_USER%
echo    - Redis: 127.0.0.1:6379

pause