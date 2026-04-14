
import asyncio
import argparse
import bcrypt
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# 导入模型
from app.models import Base, User, Team

# 加载环境变量
load_dotenv()

def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

async def create_super_admin(email, password, team_name):
    engine = create_async_engine(settings.DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as session:
        try:
            # 1. 检查用户是否已存在
            result = await session.execute(select(User).where(User.email == email))
            existing_user = result.scalar_one_or_none()
            if existing_user:
                print(f"错误: 用户 {email} 已存在")
                return

            # 2. 检查或创建团队
            result = await session.execute(select(Team).where(Team.name == team_name))
            team = result.scalar_one_or_none()
            if not team:
                print(f"正在创建团队: {team_name}...")
                team = Team(
                    name=team_name,
                    plan_type="enterprise",
                    status="active"
                )
                session.add(team)
                await session.flush() # 获取团队 ID
            else:
                print(f"使用现有团队: {team_name}")

            # 3. 创建超级管理员用户
            print(f"正在创建超级管理员: {email}...")
            hashed_password = get_password_hash(password)
            super_admin = User(
                email=email,
                password_hash=hashed_password,
                role="super_admin",
                team_id=team.id
            )
            session.add(super_admin)
            
            await session.commit()
            print(f"\n成功! 超级管理员已创建。")
            print(f"邮箱: {email}")
            print(f"密码: {password}")
            print(f"角色: super_admin")
            print(f"团队: {team_name}")

        except Exception as e:
            await session.rollback()
            print(f"发生错误: {e}")
        finally:
            await session.close()
    
    await engine.dispose()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="创建 LanderAI 超级管理员用户")
    parser.add_argument("--email", default="super@landerai.com", help="管理员邮箱 (默认: super@landerai.com)")
    parser.add_argument("--password", default="Landerai_2026", help="管理员密码 (默认: Landerai_2026)")
    parser.add_argument("--team", default="System Admin", help="关联团队名称 (默认: System Admin)")

    args = parser.parse_args()

    asyncio.run(create_super_admin(args.email, args.password, args.team))
