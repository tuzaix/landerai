from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, Dict, Any, List

Base = declarative_base()

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    notify_email = Column(String(255), nullable=True)
    
    # 订阅与多租户管理
    plan_type = Column(String(50), nullable=False, default="free")  # free, basic, pro, enterprise
    status = Column(String(50), nullable=False, default="active")  # active, expired, suspended
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    users = relationship("User", back_populates="team")
    assets = relationship("Asset", back_populates="team")
    pages = relationship("Page", back_populates="team")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    team = relationship("Team", back_populates="users")

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # image, video, etc.
    original_url = Column(String(500), nullable=False)
    webp_url = Column(String(500), nullable=True)
    sizes = Column(JSON, nullable=True)  # Dict[str, str]
    tags = Column(JSON, nullable=True)   # List[str]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    team = relationship("Team", back_populates="assets")

class Page(Base):
    __tablename__ = "pages"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    custom_domain = Column(String(255), nullable=True)
    config = Column(JSON, nullable=False)
    tracking_config = Column(JSON, nullable=True)
    
    # SEO 字段
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(String(500), nullable=True)
    seo_keywords = Column(String(500), nullable=True)
    
    # 发布状态与时间
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # 元数据
    meta = Column(JSON, nullable=True)  # OG标签、自定义头尾脚本等
    thumbnail_url = Column(String(500), nullable=True)
    
    # 统计与版本
    view_count = Column(Integer, default=0)
    click_count = Column(Integer, default=0)
    conversion_count = Column(Integer, default=0)
    mobile_view_count = Column(Integer, default=0)
    desktop_view_count = Column(Integer, default=0)
    
    clone_count = Column(Integer, default=0)
    version = Column(Integer, default=1)
    last_viewed_at = Column(DateTime(timezone=True), nullable=True)
    
    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    team = relationship("Team", back_populates="pages")
    leads = relationship("Lead", back_populates="page")

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    page_id = Column(Integer, ForeignKey("pages.id"), nullable=False)
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    page = relationship("Page", back_populates="leads")
