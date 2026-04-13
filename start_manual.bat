@echo off
REM 海外广告智能落地页系统 - 一键启动脚本 (Windows)
REM 不依赖Docker

echo 🚀 海外广告智能落地页系统 - 一键启动
echo ======================================

REM 检查系统要求
echo 🔍 检查系统要求...

REM 检查Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 未安装，请先安装Python 3.11+
    pause
    exit /b 1
)

REM 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装，请先安装Node.js 18+
    pause
    exit /b 1
)

REM 检查MySQL
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL 客户端未安装，请先安装MySQL
    pause
    exit /b 1
)

echo ✅ 系统要求检查完成

REM 数据库初始化
echo.
echo 🗄️ 步骤1: 初始化数据库...
cd scripts
call init_database.bat
cd ..

REM 启动后端服务
echo.
echo 🔧 步骤2: 启动后端服务...
cd backend

if not exist "venv" (
    echo 📦 创建虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
echo 🔧 激活虚拟环境...
call venv\Scripts\activate.bat

REM 安装依赖
echo 📚 安装后端依赖...
pip install -r requirements.txt

REM 运行数据库迁移
echo 🔄 运行数据库迁移...
alembic upgrade head

REM 启动后端服务（后台运行）
echo 🚀 启动后端服务...
start "后端服务" cmd /k "venv\Scripts\uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 5 /nobreak > nul

REM 检查后端状态
powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing).StatusCode" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务运行正常
) else (
    echo ❌ 后端服务启动失败
    pause
    exit /b 1
)

cd ..

REM 启动前端服务
echo.
echo 🎨 步骤3: 启动前端服务...
cd frontend

REM 安装依赖
echo 📦 安装前端依赖...
npm install

REM 检查TypeScript编译
echo 🔍 检查TypeScript编译...
npx tsc --noEmit

REM 启动前端服务
echo 🚀 启动前端服务...
start "前端服务" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul

cd ..

REM 显示状态信息
echo.
echo 🎉 系统启动完成！
echo ======================================
echo 📱 前端地址: http://localhost:3000
echo 🔧 后端API: http://localhost:8000
echo 📖 API文档: http://localhost:8000/docs
echo 🔍 健康检查: http://localhost:8000/health
echo.
echo 📝 注意：服务正在后台运行，关闭此窗口不会停止服务
echo 🛑 要停止服务，请在任务管理器中结束相关进程
echo ======================================

pause