@echo off
REM 数据库初始化脚本 (Windows)
REM 创建数据库和表结构

echo 🗄️ 初始化数据库...

REM MySQL连接信息
set MYSQL_HOST=127.0.0.1
set MYSQL_PORT=3306
set MYSQL_USER=root
set MYSQL_PASSWORD=root
set MYSQL_DATABASE=landerai

REM 检查MySQL连接
echo 🔍 检查MySQL连接...
mysql -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASSWORD% -e "SELECT 1;" > nul 2>&1

if %errorlevel% neq 0 (
    echo ❌ MySQL连接失败，请确保：
    echo    - MySQL服务正在运行
    echo    - 连接信息正确：%MYSQL_HOST%:%MYSQL_PORT%
    echo    - 用户名密码正确：%MYSQL_USER%/*****
    pause
    exit /b 1
)

echo ✅ MySQL连接成功

REM 创建数据库
echo 📊 创建数据库 %MYSQL_DATABASE%...
mysql -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS %MYSQL_DATABASE% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %errorlevel% neq 0 (
    echo ❌ 数据库创建失败
    pause
    exit /b 1
)

echo ✅ 数据库创建成功

REM 检查Redis连接
echo 🔄 检查Redis连接...
redis-cli -h 127.0.0.1 -p 6379 ping > nul 2>&1

if %errorlevel% neq 0 (
    echo ⚠️  Redis连接失败，请确保Redis服务正在运行
    echo    不影响后端启动，但会影响缓存功能
) else (
    echo ✅ Redis连接成功
)

echo 🎉 数据库初始化完成！
echo 📋 数据库信息：
echo    - 地址: %MYSQL_HOST%:%MYSQL_PORT%
echo    - 数据库: %MYSQL_DATABASE%
echo    - 用户: %MYSQL_USER%
echo    - Redis: 127.0.0.1:6379

pause