#!/bin/bash

# 海外广告智能落地页系统 - 前端启动脚本
# 适用于手动启动，不依赖Docker

echo "🚀 启动前端服务..."

# 检查Node.js版本
node_version=$(node --version)
echo "📍 Node.js版本: $node_version"

# 检查npm版本
npm_version=$(npm --version)
echo "📍 npm版本: $npm_version"

# 安装依赖
echo "📦 安装前端依赖..."
npm install

# 检查依赖安装
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败，请检查网络连接和npm配置"
    exit 1
fi

# 检查TypeScript编译
echo "🔍 检查TypeScript编译..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo "❌ TypeScript编译错误，请修复类型错误"
    exit 1
fi

# 启动开发服务器
echo "🚀 启动Next.js开发服务器..."
echo "📡 前端地址: http://localhost:3000"
echo "📝 注意: 请确保后端服务已启动在 http://localhost:8000"

npm run dev