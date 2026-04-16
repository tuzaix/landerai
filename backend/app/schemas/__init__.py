from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime

# 认证相关Schema
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

# 团队相关Schema
class TeamSchema(BaseModel):
    id: int
    name: str
    notify_email: Optional[str]
    plan_type: str
    status: str
    expires_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class TeamUpdateRequest(BaseModel):
    name: Optional[str] = None
    notify_email: Optional[str] = None

class TeamCreateRequest(BaseModel):
    name: str
    notify_email: Optional[str] = None
    plan_type: Optional[str] = "free"
    status: Optional[str] = "active"
    expires_at: Optional[datetime] = None

class SuperAdminTeamUpdateRequest(BaseModel):
    name: Optional[str] = None
    notify_email: Optional[str] = None
    plan_type: Optional[str] = None
    status: Optional[str] = None
    expires_at: Optional[datetime] = None

# 用户相关Schema
class UserSchema(BaseModel):
    id: int
    team_id: int
    email: EmailStr
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None

# 物料相关Schema
class AssetSchema(BaseModel):
    id: int
    team_id: int
    name: str
    type: str
    original_url: str
    webp_url: Optional[str]
    sizes: Optional[Dict[str, str]]
    tags: Optional[List[str]]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AssetCreateRequest(BaseModel):
    name: str
    type: str
    original_url: str
    webp_url: Optional[str]
    sizes: Optional[Dict[str, str]]
    tags: Optional[List[str]]

# 页面相关Schema
class PageCreateRequest(BaseModel):
    name: str
    template_id: Optional[int] = None
    config: Dict[str, Any]
    tracking_config: Optional[Dict[str, str]] = None
    custom_domain: Optional[str] = None
    is_published: Optional[bool] = False
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    enable_age_verification: Optional[bool] = False

class PageUpdateRequest(BaseModel):
    name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    tracking_config: Optional[Dict[str, str]] = None
    custom_domain: Optional[str] = None
    is_published: Optional[bool] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    thumbnail_url: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    enable_age_verification: Optional[bool] = None

class PagePublishRequest(BaseModel):
    is_published: bool

class PageCopyRequest(BaseModel):
    name: str

class PageSchema(BaseModel):
    id: int
    team_id: int
    name: str
    slug: str
    custom_domain: Optional[str]
    config: Dict[str, Any]
    tracking_config: Optional[Dict[str, str]]
    seo_title: Optional[str]
    seo_description: Optional[str]
    seo_keywords: Optional[str]
    is_published: bool
    published_at: Optional[datetime]
    enable_age_verification: bool
    thumbnail_url: Optional[str]
    view_count: int
    clone_count: int
    version: int
    last_viewed_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class PageListItemSchema(BaseModel):
    id: int
    name: str
    slug: str
    is_published: bool
    view_count: int
    clone_count: int
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# 线索相关Schema
class LeadSubmitRequest(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    message: Optional[str]

class LeadSubmitResponse(BaseModel):
    success: bool
    message: str

class LeadSchema(BaseModel):
    id: int
    page_id: int
    page_name: Optional[str] = None
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    message: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# 统计相关Schema
class EventRequest(BaseModel):
    event_type: str
    device_type: str
    user_agent: Optional[str]

class PageStatsResponse(BaseModel):
    page_id: int
    visits: int
    clicks: int
    conversions: int
    leads: int
    mobile_visits: int
    desktop_visits: int
    mobile_conversion_rate: float
    desktop_conversion_rate: float