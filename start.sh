#!/bin/bash

# 海外广告智能落地页系统启动脚本

echo "🚀 启动海外广告智能落地页系统..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 启动服务
echo "📦 启动Docker容器..."
docker-compose up -d

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 10

# 运行数据库迁移
echo "🗄️ 运行数据库迁移..."
docker-compose exec backend alembic upgrade head

echo "✅ 系统启动完成！"
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端API地址: http://localhost:8000"
echo "📊 API文档: http://localhost:8000/docs"
echo "🔍 管理后台: http://localhost:8000/admin"