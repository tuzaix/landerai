from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api import auth, pages, assets, leads, stats, settings as api_settings, super_admin
from app.core.config import settings

app = FastAPI(
    title="海外广告智能落地页系统",
    description="AI驱动的智能落地页生成和管理系统",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 确保 uploads 目录存在
os.makedirs("uploads", exist_ok=True)

# 挂载静态文件目录
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 注册路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(pages.router, prefix="/api/v1/pages", tags=["页面管理"])
app.include_router(assets.router, prefix="/api/v1/assets", tags=["物料管理"])
app.include_router(leads.router, prefix="/api/v1/leads", tags=["线索管理"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["统计分析"])
app.include_router(api_settings.router, prefix="/api/v1/settings", tags=["系统设置"])
app.include_router(super_admin.router, prefix="/api/v1/super-admin", tags=["超级管理员"])

@app.get("/")
async def root():
    return {"message": "海外广告智能落地页系统API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}