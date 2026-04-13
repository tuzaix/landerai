from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from typing import List

from app.db.database import get_db
from app.models import Lead, Page, User
from app.schemas import LeadSubmitRequest, LeadSubmitResponse, LeadSchema
from app.api.auth import get_current_user

router = APIRouter()

@router.post("/submit/{page_id}", response_model=LeadSubmitResponse)
async def submit_lead(
    page_id: int,
    request: LeadSubmitRequest,
    db: AsyncSession = Depends(get_db)
):
    """提交线索 (公开接口)"""
    # 验证页面是否存在
    result = await db.execute(
        select(Page).where(Page.id == page_id)
    )
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="页面不存在"
        )
    
    # 创建线索
    db_lead = Lead(
        page_id=page_id,
        name=request.name,
        email=request.email,
        phone=request.phone,
        message=request.message
    )
    
    db.add(db_lead)
    await db.commit()
    await db.refresh(db_lead)
    
    return {
        "success": True,
        "message": "线索提交成功"
    }

@router.get("/", response_model=List[LeadSchema])
async def get_all_leads(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前团队的所有线索列表"""
    # 使用 join 获取页面名称，并根据 team_id 进行过滤
    query = (
        select(Lead, Page.name.label("page_name"))
        .join(Page, Lead.page_id == Page.id)
        .where(Page.team_id == current_user.team_id)
        .order_by(Lead.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(query)
    
    leads_with_page = []
    for row in result.all():
        lead, page_name = row
        lead_dict = {
            "id": lead.id,
            "page_id": lead.page_id,
            "page_name": page_name,
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "message": lead.message,
            "created_at": lead.created_at
        }
        leads_with_page.append(lead_dict)
        
    return leads_with_page

@router.get("/page/{page_id}", response_model=List[LeadSchema])
async def get_page_leads(
    page_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取特定页面的线索列表"""
    # 验证页面是否存在且属于当前团队
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
    
    # 获取线索列表
    result = await db.execute(
        select(Lead).where(Lead.page_id == page_id).offset(skip).limit(limit)
    )
    leads = result.scalars().all()
    
    return leads