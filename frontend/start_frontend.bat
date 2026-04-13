@echo off
REM 海外广告智能落地页系统 - 前端启动脚本 (Windows)
REM 适用于手动启动，不依赖Docker

echo 🚀 启动前端服务...

REM 检查Node.js版本
for /f "tokens=1" %%i in ('node --version') do set node_version=%%i
echo 📍 Node.js版本: %node_version%

REM 检查npm版本
for /f "tokens=1" %%i in ('npm --version') do set npm_version=%%i
echo 📍 npm版本: %npm_version%

REM 安装依赖
echo 📦 安装前端依赖...
npm install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败，请检查网络连接和npm配置
    pause
    exit /b 1
)

REM 检查TypeScript编译
echo 🔍 检查TypeScript编译...
npx tsc --noEmit

if %errorlevel% neq 0 (
    echo ❌ TypeScript编译错误，请修复类型错误
    pause
    exit /b 1
)

REM 启动开发服务器
echo 🚀 启动Next.js开发服务器...
echo 📡 前端地址: http://localhost:3000
echo 📝 注意: 请确保后端服务已启动在 http://localhost:8000

npm run dev

pause