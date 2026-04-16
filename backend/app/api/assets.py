from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, delete
from typing import List
import uuid
import os

from app.db.database import get_db
from app.models import Asset, Team, User
from app.schemas import AssetSchema, AssetCreateRequest
from app.core.config import settings

from app.api.auth import get_current_user

router = APIRouter()

@router.post("/upload", response_model=AssetSchema)
async def upload_asset(
    file: UploadFile = File(...),
    name: str = None,
    tags: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """上传物料文件"""
    if not name:
        name = file.filename
    
    # 生成唯一文件名
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # 这里应该上传到Cloudflare R2，现在先保存到本地
    # TODO: 实现R2上传逻辑
    file_path = f"uploads/{unique_filename}"
    os.makedirs("uploads", exist_ok=True)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # 创建物料记录
    db_asset = Asset(
        team_id=current_user.team_id,
        name=name,
        type=file.content_type or "application/octet-stream",
        original_url=f"/uploads/{unique_filename}",
        webp_url=None,  # TODO: 生成WebP版本
        sizes=None,
        tags=tags.split(",") if tags else []
    )
    
    db.add(db_asset)
    await db.commit()
    await db.refresh(db_asset)
    
    return db_asset

@router.get("/", response_model=List[AssetSchema])
async def get_assets(
    skip: int = 0,
    limit: int = 100,
    asset_type: str = None,
    search: str = None,
    tag: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取物料列表"""
    query = select(Asset).where(Asset.team_id == current_user.team_id)
    
    if asset_type:
        query = query.where(Asset.type == asset_type)
    
    if search:
        query = query.where(Asset.name.ilike(f"%{search}%"))
    
    if tag:
        # 使用 JSON 包含查询
        from sqlalchemy import func
        query = query.where(func.json_contains(Asset.tags, func.json_quote(tag)))
    
    query = query.offset(skip).limit(limit).order_by(Asset.created_at.desc())
    
    result = await db.execute(query)
    assets = result.scalars().all()
    
    return assets

@router.get("/{asset_id}", response_model=AssetSchema)
async def get_asset(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取指定物料"""
    result = await db.execute(
        select(Asset).where(
            Asset.id == asset_id,
            Asset.team_id == current_user.team_id
        )
    )
    asset = result.scalar_one_or_none()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="物料不存在或无权访问"
        )
    
    return asset

@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除物料"""
    result = await db.execute(
        select(Asset).where(
            Asset.id == asset_id,
            Asset.team_id == current_user.team_id
        )
    )
    asset = result.scalar_one_or_none()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="物料不存在或无权访问"
        )
    
    # 删除文件
    # 处理路径，移除开头的 / 并在当前目录下查找
    file_path = asset.original_url.lstrip("/")
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
    
    # 删除数据库记录
    await db.execute(
        delete(Asset).where(Asset.id == asset_id)
    )
    await db.commit()
    
    return {"message": "物料删除成功"}