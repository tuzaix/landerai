from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # 数据库配置
    DATABASE_URL: str = "mysql+aiomysql://root:root@127.0.0.1:3306/landerai"
    
    # Redis配置
    REDIS_URL: str = "redis://127.0.0.1:6379/0"
    
    # JWT配置
    SECRET_KEY: str = "your-secret-key-here-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS配置
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Cloudflare R2配置
    R2_ACCESS_KEY_ID: Optional[str] = None
    R2_SECRET_ACCESS_KEY: Optional[str] = None
    R2_BUCKET_NAME: Optional[str] = None
    R2_ENDPOINT_URL: Optional[str] = None
    
    # CDN配置
    CDN_BASE_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()