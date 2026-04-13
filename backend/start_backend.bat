@echo off
REM 海外广告智能落地页系统 - 后端启动脚本 (Windows)
REM 适用于手动启动，不依赖Docker

echo 🚀 启动后端服务...

REM 检查Python版本
for /f "tokens=2" %%i in ('python --version') do set python_version=%%i
echo 📍 Python版本: %python_version%

REM 检查虚拟环境
if not exist "venv" (
    echo 📦 创建虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
echo 🔧 激活虚拟环境...
call venv\Scripts\activate.bat

REM 安装依赖
echo 📚 安装依赖...
pip install -r requirements.txt

REM 检查数据库连接
echo 🗄️ 检查数据库连接...
python -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def check_db():
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.connect() as conn:
            result = await conn.execute('SELECT 1')
            print('✅ 数据库连接成功')
    except Exception as e:
        print(f'❌ 数据库连接失败: {e}')
        print('请确保MySQL服务正在运行，并且配置正确')

asyncio.run(check_db())
"

REM 运行数据库迁移
echo 🔄 运行数据库迁移...
alembic upgrade head

REM 启动后端服务
echo 🚀 启动FastAPI服务...
echo 📡 服务地址: http://localhost:8000
echo 📖 API文档: http://localhost:8000/docs
echo 🔍 健康检查: http://localhost:8000/health

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause