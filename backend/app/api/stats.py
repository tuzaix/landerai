from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, update, case
from typing import Dict, Any
from datetime import datetime

from app.db.database import get_db
from app.models import Lead, Page, User
from app.schemas import EventRequest, PageStatsResponse
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取仪表盘统计摘要"""
    team_id = current_user.team_id
    
    # 直接从 Page 表汇总计数器数据
    # 使用 case 语句进行跨数据库兼容的条件统计
    result = await db.execute(
        select(
            func.sum(Page.view_count).label("total_visits"),
            func.sum(Page.conversion_count).label("total_conversions"),
            func.sum(case((Page.is_published == True, 1), else_=0)).label("active_pages")
        ).where(Page.team_id == team_id)
    )
    row = result.one()
    total_visits = row.total_visits or 0
    total_conversions = row.total_conversions or 0
    active_pages = row.active_pages or 0
    
    # 线索数仍然需要从 Lead 表统计 (因为线索包含详细信息)
    leads_result = await db.execute(
        select(func.count(Lead.id))
        .join(Page, Lead.page_id == Page.id)
        .where(Page.team_id == team_id)
    )
    total_leads = leads_result.scalar() or 0
    
    # 计算总转化率
    conversion_rate = (total_conversions / total_visits * 100) if total_visits > 0 else 0
    
    return {
        "total_visits": total_visits,
        "total_conversions": total_conversions,
        "total_leads": total_leads,
        "active_pages": active_pages,
        "conversion_rate": round(conversion_rate, 2)
    }

@router.post("/event/{page_id}")
async def track_event(
    page_id: int,
    request: EventRequest,
    db: AsyncSession = Depends(get_db)
):
    """跟踪用户行为事件 (优化为计数器模式，不再产生大量 Event 记录)"""
    # 更新计数器逻辑
    update_values = {}
    
    if request.event_type == "visit":
        update_values[Page.view_count] = Page.view_count + 1
        if request.device_type == "mobile":
            update_values[Page.mobile_view_count] = Page.mobile_view_count + 1
        else:
            update_values[Page.desktop_view_count] = Page.desktop_view_count + 1
        update_values[Page.last_viewed_at] = datetime.now()
    elif request.event_type == "click":
        update_values[Page.click_count] = Page.click_count + 1
    elif request.event_type == "conversion":
        update_values[Page.conversion_count] = Page.conversion_count + 1
        
    if not update_values:
        return {"message": "无效的事件类型"}

    # 执行原子更新
    result = await db.execute(
        update(Page)
        .where(Page.id == page_id)
        .values(update_values)
    )
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="页面不存在")
        
    await db.commit()
    
    # 注意：为了性能考虑，我们不再记录每一条详细的 Event 数据到 events 表
    # 如果未来需要保留详细日志(如IP、UA等)，可以考虑异步写入或存入 NoSQL/日志系统
    
    return {"message": "事件计数成功"}

@router.get("/stats/{page_id}", response_model=PageStatsResponse)
async def get_page_stats(
    page_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取指定页面的详细统计数据 (直接从 Page 表读取计数器)"""
    result = await db.execute(
        select(Page).where(
            Page.id == page_id,
            Page.team_id == current_user.team_id
        )
    )
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="页面不存在或无权访问"
        )
    
    # 从 Page 计数器直接获取
    visits = page.view_count
    clicks = page.click_count
    conversions = page.conversion_count
    mobile_visits = page.mobile_view_count
    desktop_visits = page.desktop_view_count
    
    # 线索数仍然从 Lead 表获取 (实时性要求)
    leads_result = await db.execute(
        select(func.count(Lead.id))
        .where(Lead.page_id == page_id)
    )
    leads = leads_result.scalar() or 0
    
    # 计算转化率
    mobile_conversion_rate = (conversions / mobile_visits * 100) if mobile_visits > 0 else 0
    desktop_conversion_rate = (conversions / desktop_visits * 100) if desktop_visits > 0 else 0
    
    return PageStatsResponse(
        page_id=page_id,
        visits=visits,
        clicks=clicks,
        conversions=conversions,
        leads=leads,
        mobile_visits=mobile_visits,
        desktop_visits=desktop_visits,
        mobile_conversion_rate=round(mobile_conversion_rate, 2),
        desktop_conversion_rate=round(desktop_conversion_rate, 2)
    )
