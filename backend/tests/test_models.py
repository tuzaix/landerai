import pytest
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal, engine, Base
from app.models import User, Team, Page, Lead, Event, Asset

@pytest.fixture
async def db_session():
    """创建测试数据库会话"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        yield session
        await session.close()
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_create_team(db_session):
    """测试创建团队"""
    team = Team(name="测试团队", notify_email="test@example.com")
    db_session.add(team)
    await db_session.commit()
    
    assert team.id is not None
    assert team.name == "测试团队"
    assert team.notify_email == "test@example.com"

@pytest.mark.asyncio
async def test_create_user(db_session):
    """测试创建用户"""
    # 先创建团队
    team = Team(name="测试团队")
    db_session.add(team)
    await db_session.commit()
    
    # 创建用户
    user = User(
        team_id=team.id,
        email="test@example.com",
        password_hash="hashed_password",
        role="user"
    )
    db_session.add(user)
    await db_session.commit()
    
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.team_id == team.id

@pytest.mark.asyncio
async def test_create_page(db_session):
    """测试创建页面"""
    # 先创建团队
    team = Team(name="测试团队")
    db_session.add(team)
    await db_session.commit()
    
    # 创建页面
    page = Page(
        team_id=team.id,
        name="测试页面",
        slug="test-page",
        config={"title": "测试页面", "description": "这是一个测试页面"},
        is_published=True
    )
    db_session.add(page)
    await db_session.commit()
    
    assert page.id is not None
    assert page.name == "测试页面"
    assert page.slug == "test-page"
    assert page.is_published == True

@pytest.mark.asyncio
async def test_create_lead(db_session):
    """测试创建线索"""
    # 先创建团队和页面
    team = Team(name="测试团队")
    db_session.add(team)
    await db_session.commit()
    
    page = Page(
        team_id=team.id,
        name="测试页面",
        slug="test-page",
        config={}
    )
    db_session.add(page)
    await db_session.commit()
    
    # 创建线索
    lead = Lead(
        page_id=page.id,
        name="测试用户",
        email="lead@example.com",
        phone="13800138000",
        message="这是一个测试线索"
    )
    db_session.add(lead)
    await db_session.commit()
    
    assert lead.id is not None
    assert lead.name == "测试用户"
    assert lead.email == "lead@example.com"
    assert lead.page_id == page.id