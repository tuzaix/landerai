from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from typing import List, Dict, Any
from datetime import datetime

from app.db.database import get_db
from app.models import Team, User, Page, Lead, Asset
from app.schemas import TeamSchema, SuperAdminTeamUpdateRequest, TeamCreateRequest
from app.api.auth import get_current_user, get_password_hash

router = APIRouter()

async def check_super_admin(current_user: User = Depends(get_current_user)):
    """检查是否为超级管理员且邮箱匹配"""
    if current_user.role != "super_admin" or current_user.email != "super@landerai.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要超级管理员权限且仅限指定账号访问"
        )
    return current_user

@router.get("/teams", response_model=List[TeamSchema])
async def list_teams(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(check_super_admin)
):
    """列出所有租户团队"""
    result = await db.execute(select(Team).order_by(Team.created_at.desc()))
    return result.scalars().all()

@router.post("/teams", response_model=TeamSchema)
async def create_team(
    request: TeamCreateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(check_super_admin)
):
    """创建新租户团队，并自动创建默认管理员用户"""
    # 1. 创建团队
    db_team = Team(
        name=request.name,
        notify_email=request.notify_email,
        plan_type=request.plan_type,
        status=request.status,
        expires_at=request.expires_at
    )
    db.add(db_team)
    await db.flush()  # 获取团队 ID
    
    # 2. 如果提供了通知邮箱，则自动创建默认管理员用户
    if request.notify_email:
        # 检查邮箱是否已被占用
        result = await db.execute(select(User).where(User.email == request.notify_email))
        if result.scalar_one_or_none():
            await db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"邮箱 {request.notify_email} 已被其他用户占用，无法作为租户管理员邮箱"
            )
            
        # 创建默认管理员，初始密码为 admin123
        default_password = "admin123"
        db_user = User(
            team_id=db_team.id,
            email=request.notify_email,
            password_hash=get_password_hash(default_password),
            role="admin"
        )
        db.add(db_user)
    
    await db.commit()
    await db.refresh(db_team)
    return db_team

@router.get("/teams/{team_id}/stats")
async def get_team_usage_stats(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(check_super_admin)
):
    """获取租户使用统计"""
    # 页面总数
    pages_count_result = await db.execute(
        select(func.count(Page.id)).where(Page.team_id == team_id)
    )
    pages_count = pages_count_result.scalar() or 0
    
    # 线索总数
    leads_count_result = await db.execute(
        select(func.count(Lead.id))
        .join(Page, Lead.page_id == Page.id)
        .where(Page.team_id == team_id)
    )
    leads_count = leads_count_result.scalar() or 0
    
    return {
        "pages_count": pages_count,
        "leads_count": leads_count
    }

@router.put("/teams/{team_id}", response_model=TeamSchema)
async def update_team_subscription(
    team_id: int,
    request: SuperAdminTeamUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(check_super_admin)
):
    """更新租户订阅信息"""
    update_data = request.dict(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="没有更新数据")
        
    await db.execute(
        update(Team).where(Team.id == team_id).values(**update_data)
    )
    await db.commit()
    
    result = await db.execute(select(Team).where(Team.id == team_id))
    return result.scalar_one()

@router.delete("/teams/{team_id}")
async def delete_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(check_super_admin)
):
    """删除租户，同时级联删除所有关联数据"""
    result = await db.execute(select(Team).where(Team.id == team_id))
    team = result.scalar_one_or_none()
    
    if not team:
        raise HTTPException(status_code=404, detail="团队不存在")
        
    # 获取该团队的所有页面 ID 用于清理线索和事件
    pages_result = await db.execute(select(Page.id).where(Page.team_id == team_id))
    page_ids = pages_result.scalars().all()
    
    from sqlalchemy import delete as sqlalchemy_delete
    
    if page_ids:
        # 删除线索
        await db.execute(sqlalchemy_delete(Lead).where(Lead.page_id.in_(page_ids)))
        # 删除页面
        await db.execute(sqlalchemy_delete(Page).where(Page.id.in_(page_ids)))
    
    # 删除用户
    await db.execute(sqlalchemy_delete(User).where(User.team_id == team_id))
    # 删除资产
    await db.execute(sqlalchemy_delete(Asset).where(Asset.team_id == team_id))
    # 最后删除团队
    await db.execute(sqlalchemy_delete(Team).where(Team.id == team_id))
    
    await db.commit()
    return {"message": "团队及其所有关联数据已成功删除"}
