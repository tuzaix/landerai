import pytest
import asyncio
from httpx import AsyncClient
from main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_health_check(client):
    """测试健康检查接口"""
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

@pytest.mark.asyncio
async def test_root_endpoint(client):
    """测试根路径接口"""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert data["version"] == "1.0.0"

@pytest.mark.asyncio
async def test_auth_login_invalid_credentials(client):
    """测试无效凭据的登录"""
    login_data = {
        "email": "test@example.com",
        "password": "wrongpassword"
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_pages_list_empty(client):
    """测试空页面列表"""
    response = await client.get("/api/v1/pages/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_page_validation(client):
    """测试创建页面验证"""
    # 缺少必需字段
    invalid_data = {
        "template_id": 1
    }
    response = await client.post("/api/v1/pages/", json=invalid_data)
    assert response.status_code == 422  # 验证错误