#!/bin/bash

# 海外广告智能落地页系统 - 一键启动脚本
# 适用于Linux/Mac，不依赖Docker

echo "🚀 海外广告智能落地页系统 - 一键启动"
echo "======================================"

# 检查系统要求
echo "🔍 检查系统要求..."

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装Python 3.11+"
    exit 1
fi

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装Node.js 18+"
    exit 1
fi

# 检查MySQL
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL 客户端未安装，请先安装MySQL"
    exit 1
fi

# 检查Redis
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis 客户端未安装，缓存功能将不可用"
fi

echo "✅ 系统要求检查完成"

# 数据库初始化
echo ""
echo "🗄️ 步骤1: 初始化数据库..."
cd scripts
./init_database.sh
cd ..

# 启动后端服务
echo ""
echo "🔧 步骤2: 启动后端服务..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# 安装依赖
echo "📚 安装后端依赖..."
pip install -r requirements.txt

# 运行数据库迁移
echo "🔄 运行数据库迁移..."
alembic upgrade head

# 启动后端服务（后台运行）
echo "🚀 启动后端服务..."
nohup venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
echo "📋 日志文件: backend/backend.log"

# 等待后端启动
sleep 5

# 检查后端状态
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端服务运行正常"
else
    echo "❌ 后端服务启动失败，请检查日志"
    exit 1
fi

cd ..

# 启动前端服务
echo ""
echo "🎨 步骤3: 启动前端服务..."
cd frontend

# 安装依赖
echo "📦 安装前端依赖..."
npm install

# 检查TypeScript编译
echo "🔍 检查TypeScript编译..."
npx tsc --noEmit

# 启动前端服务（后台运行）
echo "🚀 启动前端服务..."
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
echo "📋 日志文件: frontend/frontend.log"

cd ..

# 显示状态信息
echo ""
echo "🎉 系统启动完成！"
echo "======================================"
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端API: http://localhost:8000"
echo "📖 API文档: http://localhost:8000/docs"
echo "🔍 健康检查: http://localhost:8000/health"
echo ""
echo "📋 进程信息:"
echo "   后端PID: $BACKEND_PID"
echo "   前端PID: $FRONTEND_PID"
echo ""
echo "📝 日志文件:"
echo "   后端日志: backend/backend.log"
echo "   前端日志: frontend/frontend.log"
echo ""
echo "🛑 停止服务:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "======================================"