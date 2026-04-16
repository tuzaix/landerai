from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update, delete, func
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.models import Page, Team, User
from app.schemas import (
    PageCreateRequest, 
    PageSchema, 
    PageUpdateRequest, 
    PagePublishRequest,
    PageCopyRequest,
    PageListItemSchema
)

from app.api.auth import get_current_user

router = APIRouter()

async def check_page_access(db: AsyncSession, page_id: int, team_id: int) -> Page:
    """检查页面是否存在且属于当前团队"""
    result = await db.execute(
        select(Page).where(
            Page.id == page_id,
            Page.team_id == team_id
        )
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="页面不存在或无权访问"
        )
    return page

async def generate_unique_slug(db: AsyncSession, base_slug: str) -> str:
    """生成唯一的 slug，避免与现有页面冲突"""
    import random
    slug = base_slug
    while True:
        result = await db.execute(select(Page).where(Page.slug == slug))
        if result.scalar_one_or_none() is None:
            return slug
        slug = f"{base_slug}-{random.randint(1, 1000)}"

@router.post("/", response_model=PageSchema)
async def create_page(
    request: PageCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新页面"""
    base_slug = request.name.lower().replace(" ", "-")
    slug = await generate_unique_slug(db, base_slug)
    
    db_page = Page(
        team_id=current_user.team_id,
        name=request.name,
        slug=slug,
        custom_domain=request.custom_domain,
        config=request.config,
        tracking_config=request.tracking_config,
        seo_title=request.seo_title or request.name,
        seo_description=request.seo_description,
        seo_keywords=request.seo_keywords,
        is_published=request.is_published if request.is_published is not None else False,
        enable_age_verification=request.enable_age_verification if request.enable_age_verification is not None else False
    )
    
    db.add(db_page)
    await db.commit()
    await db.refresh(db_page)
    
    return db_page

@router.get("/", response_model=List[PageSchema])
async def get_pages(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    is_published: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取页面列表，支持搜索、状态筛选和分页"""
    query = select(Page).where(Page.team_id == current_user.team_id)
    
    if search:
        query = query.where(Page.name.ilike(f"%{search}%"))
    
    if is_published is not None:
        query = query.where(Page.is_published == is_published)
    
    query = query.offset(skip).limit(limit).order_by(Page.updated_at.desc())
    
    result = await db.execute(query)
    pages = result.scalars().all()
    return pages

@router.get("/slug/{slug}", response_model=PageSchema)
async def get_page_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """通过 slug 获取公开页面配置，同时增加访问计数 (公开接口，不进行租户隔离验证)"""
    result = await db.execute(
        select(Page).where(
            Page.slug == slug,
            Page.is_published == True  # 仅允许访问已发布的页面
        )
    )
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="页面不存在或未发布"
        )
    
    # 增加访问计数
    await db.execute(
        update(Page).where(Page.id == page.id).values(
            view_count=page.view_count + 1,
            last_viewed_at=datetime.now()
        )
    )
    await db.commit()
    
    # 重新获取更新后的数据
    result = await db.execute(select(Page).where(Page.id == page.id))
    return result.scalar_one()

@router.get("/stats/summary")
async def get_pages_stats_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取所有页面的总体统计摘要"""
    team_id = current_user.team_id
    # 从 Page 表汇总计数器数据
    result = await db.execute(
        select(
            func.sum(Page.view_count).label("total_visits"),
            func.sum(Page.conversion_count).label("total_conversions")
        ).where(Page.team_id == team_id)
    )
    row = result.one()
    total_visits = row.total_visits or 0
    total_conversions = row.total_conversions or 0
    
    # 总线索量 (从 Lead 模型)
    from app.models import Lead
    leads_result = await db.execute(
        select(func.count(Lead.id))
        .join(Page, Lead.page_id == Page.id)
        .where(Page.team_id == team_id)
    )
    total_leads = leads_result.scalar() or 0
    
    # 活跃页面数
    pages_result = await db.execute(
        select(func.count(Page.id))
        .where(Page.team_id == team_id)
        .where(Page.is_published == True)
    )
    active_pages = pages_result.scalar() or 0
    
    # 总浏览量 (从 Page 模型汇总)
    total_views = total_visits  # 统一使用 view_count
    
    # 计算转化率
    conversion_rate = (total_conversions / total_visits * 100) if total_visits > 0 else 0
    
    return {
        "total_visits": total_visits,
        "total_views": total_views,
        "total_conversions": total_conversions,
        "total_leads": total_leads,
        "active_pages": active_pages,
        "conversion_rate": round(conversion_rate, 2)
    }

@router.get("/{page_id}", response_model=PageSchema)
async def get_page(
    page_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取指定页面详情"""
    return await check_page_access(db, page_id, current_user.team_id)

@router.put("/{page_id}", response_model=PageSchema)
async def update_page(
    page_id: int,
    request: PageUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新页面配置"""
    page = await check_page_access(db, page_id, current_user.team_id)
    
    # 收集需要更新的字段
    update_data = {}
    
    if request.name is not None:
        update_data["name"] = request.name
        # 如果名称变化，更新 slug
        update_data["slug"] = await generate_unique_slug(db, request.name.lower().replace(" ", "-"))
    
    if request.config is not None:
        update_data["config"] = request.config
    
    if request.tracking_config is not None:
        update_data["tracking_config"] = request.tracking_config
    
    if request.custom_domain is not None:
        update_data["custom_domain"] = request.custom_domain
    
    if request.seo_title is not None:
        update_data["seo_title"] = request.seo_title
    
    if request.seo_description is not None:
        update_data["seo_description"] = request.seo_description
    
    if request.seo_keywords is not None:
        update_data["seo_keywords"] = request.seo_keywords
    
    if request.thumbnail_url is not None:
        update_data["thumbnail_url"] = request.thumbnail_url
    
    if request.meta is not None:
        update_data["meta"] = request.meta
    
    # 如果设置了发布状态
    if request.is_published is not None:
        update_data["is_published"] = request.is_published
        if request.is_published:
            update_data["published_at"] = datetime.now()
    
    if request.enable_age_verification is not None:
        update_data["enable_age_verification"] = request.enable_age_verification
    
    # 增加版本号
    update_data["version"] = page.version + 1
    
    if update_data:
        await db.execute(
            update(Page).where(Page.id == page_id).values(**update_data)
        )
        await db.commit()
    
    # 返回更新后的页面
    result = await db.execute(
        select(Page).where(Page.id == page_id)
    )
    return result.scalar_one()

@router.post("/{page_id}/publish", response_model=PageSchema)
async def toggle_publish_status(
    page_id: int,
    request: PagePublishRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """切换页面发布状态"""
    page = await check_page_access(db, page_id, current_user.team_id)
    
    update_data = {
        "is_published": request.is_published,
        "version": page.version + 1
    }
    
    if request.is_published:
        update_data["published_at"] = datetime.now()
    
    await db.execute(
        update(Page).where(Page.id == page_id).values(**update_data)
    )
    await db.commit()
    
    result = await db.execute(
        select(Page).where(Page.id == page_id)
    )
    return result.scalar_one()

@router.post("/{page_id}/copy", response_model=PageSchema)
async def copy_page(
    page_id: int,
    request: PageCopyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """复制页面为新页面"""
    page = await check_page_access(db, page_id, current_user.team_id)
    
    # 生成新 slug
    base_slug = request.name.lower().replace(" ", "-")
    new_slug = await generate_unique_slug(db, base_slug)
    
    # 创建副本
    new_page = Page(
        team_id=page.team_id,
        name=request.name,
        slug=new_slug,
        custom_domain=None,  # 复制时清空自定义域名
        config=page.config,
        tracking_config=page.tracking_config,
        seo_title=page.seo_title,
        seo_description=page.seo_description,
        seo_keywords=page.seo_keywords,
        is_published=False,  # 复制后默认不发布
        enable_age_verification=page.enable_age_verification,
        meta=page.meta,
        thumbnail_url=page.thumbnail_url
    )
    
    db.add(new_page)
    
    # 增加原页面复制计数
    await db.execute(
        update(Page).where(Page.id == page_id).values(
            clone_count=page.clone_count + 1
        )
    )
    
    await db.commit()
    await db.refresh(new_page)
    
    return new_page

@router.delete("/{page_id}")
async def delete_page(
    page_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除页面，同时删除关联的线索和事件"""
    page = await check_page_access(db, page_id, current_user.team_id)
    
    # 导入关联模型
    from app.models import Lead
    
    # 删除关联的线索
    await db.execute(delete(Lead).where(Lead.page_id == page_id))
    
    # 删除页面本身
    await db.execute(delete(Page).where(Page.id == page_id))
    
    await db.commit()
    
    return {"message": "页面及其关联数据删除成功"}
