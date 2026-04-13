from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import bcrypt

from app.db.database import get_db
from app.models import Team, User
from app.schemas import TeamSchema, TeamUpdateRequest, UserSchema, UserUpdateRequest

router = APIRouter()

def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

@router.get("/team/{team_id}", response_model=TeamSchema)
async def get_team_settings(
    team_id: int,
    db: AsyncSession = Depends(get_db)
):
    """获取团队设置"""
    result = await db.execute(select(Team).where(Team.id == team_id))
    team = result.scalar_one_or_none()
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="团队不存在"
        )
    
    return team

@router.put("/team/{team_id}", response_model=TeamSchema)
async def update_team_settings(
    team_id: int,
    request: TeamUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """更新团队设置"""
    update_data = {}
    if request.name is not None:
        update_data["name"] = request.name
    if request.notify_email is not None:
        update_data["notify_email"] = request.notify_email
        
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="没有提供更新字段"
        )
        
    await db.execute(
        update(Team).where(Team.id == team_id).values(**update_data)
    )
    await db.commit()
    
    result = await db.execute(select(Team).where(Team.id == team_id))
    return result.scalar_one()

@router.get("/user/{user_id}", response_model=UserSchema)
async def get_user_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """获取用户信息"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return user

@router.put("/user/{user_id}", response_model=UserSchema)
async def update_user_profile(
    user_id: int,
    request: UserUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """更新用户信息（包括修改密码）"""
    update_data = {}
    if request.email is not None:
        update_data["email"] = request.email
    if request.password is not None:
        update_data["password_hash"] = get_password_hash(request.password)
        
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="没有提供更新字段"
        )
        
    await db.execute(
        update(User).where(User.id == user_id).values(**update_data)
    )
    await db.commit()
    
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one()
