import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models import Base, Team, User, Page, Lead, Asset

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed_data():
    async with AsyncSessionLocal() as db:
        print("Checking for existing team...")
        from sqlalchemy import select
        result = await db.execute(select(Team).where(Team.id == 1))
        existing_team = result.scalar_one_or_none()
        
        if not existing_team:
            print("Creating default team...")
            team = Team(id=1, name="Default Team", notify_email="admin@landerai.com")
            db.add(team)
            await db.commit()
            print("Done.")
        else:
            print("Team already exists, skipping.")

        print("Checking for existing user...")
        result = await db.execute(select(User).where(User.id == 1))
        existing_user = result.scalar_one_or_none()
        
        import bcrypt
        password = "admin123".encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password, salt).decode('utf-8')
        
        if not existing_user:
            print("Creating default admin user...")
            user = User(
                id=1,
                team_id=1,
                email="admin@landerai.com",
                password_hash=hashed_password,
                role="admin"
            )
            db.add(user)
            
            print("Creating super admin user...")
            super_user = User(
                id=2,
                team_id=1,
                email="super@landerai.com",
                password_hash=hashed_password,
                role="super_admin"
            )
            db.add(super_user)
            
            await db.commit()
            print("Done.")
        else:
            print("Updating admin password to ensure compatibility...")
            existing_user.password_hash = hashed_password
            
            # 检查 super admin 是否存在
            result = await db.execute(select(User).where(User.id == 2))
            existing_super = result.scalar_one_or_none()
            if not existing_super:
                super_user = User(
                    id=2,
                    team_id=1,
                    email="super@landerai.com",
                    password_hash=hashed_password,
                    role="super_admin"
                )
                db.add(super_user)
            else:
                existing_super.password_hash = hashed_password
                
            await db.commit()
            print("Passwords updated.")

        print("Creating demo pages...")
        pages_data = [
            {
                "name": "iPhone 15 Pro Max 推广落地页",
                "slug": "iphone-15-pro-promo",
                "is_published": True,
                "view_count": 12450,
                "config": {
                    "components": [
                        {"id": "h1", "type": "hero", "data": {"title": "iPhone 15 Pro Max", "subtitle": "钛金属设计，性能巅峰", "buttonText": "立即预订", "buttonLink": "#", "imageUrl": "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=2070"}},
                        {"id": "f1", "type": "features", "data": {"features": [{"title": "A17 Pro 芯片", "description": "首款 3 纳米芯片"}, {"title": "48MP 主摄", "description": "细节惊人"}]}},
                        {"id": "form1", "type": "form", "data": {"fields": [{"name": "name", "label": "姓名", "type": "text", "required": True}, {"name": "email", "label": "邮箱", "type": "email", "required": True}], "submitText": "获取报价"}}
                    ]
                },
                "seo_title": "iPhone 15 Pro Max - 官方预订页面",
                "seo_description": "探索 iPhone 15 Pro Max 的卓越性能与精美设计"
            },
            {
                "name": "Smart Watch Series 9 预售页",
                "slug": "smart-watch-s9-preorder",
                "is_published": True,
                "view_count": 8560,
                "config": {
                    "components": [
                        {"id": "h2", "type": "hero", "data": {"title": "Watch Series 9", "subtitle": "更聪明，更明亮，更强大", "buttonText": "了解更多", "buttonLink": "#", "imageUrl": "https://images.unsplash.com/photo-1434493907317-a46b53b8188a?q=80&w=2070"}},
                        {"id": "form2", "type": "form", "data": {"fields": [{"name": "phone", "label": "手机号", "type": "phone", "required": True}], "submitText": "立即预约"}}
                    ]
                },
                "seo_title": "Apple Watch Series 9 - 预约通道",
                "seo_description": "预约全新 Apple Watch Series 9，享受健康生活"
            },
            {
                "name": "Yoga Master Class 报名页",
                "slug": "yoga-master-class",
                "is_published": False,
                "view_count": 0,
                "config": {
                    "components": [
                        {"id": "h3", "type": "hero", "data": {"title": "Yoga Master Class", "subtitle": "与世界顶级瑜伽大师一起", "buttonText": "立即报名", "buttonLink": "#", "imageUrl": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2070"}}
                    ]
                }
            }
        ]

        created_pages = []
        for p_data in pages_data:
            # 检查 slug 是否已存在
            result = await db.execute(select(Page).where(Page.slug == p_data["slug"]))
            if result.scalar_one_or_none():
                print(f"Page with slug '{p_data['slug']}' already exists, skipping.")
                continue
                
            page = Page(team_id=1, **p_data)
            db.add(page)
            created_pages.append(page)

        if created_pages:
            await db.commit()
            for page in created_pages:
                await db.refresh(page)
            print(f"Created {len(created_pages)} demo pages.")
        
        # 获取所有已发布的页面用于后续生成线索和事件
        result = await db.execute(select(Page).where(Page.is_published == True))
        published_pages = result.scalars().all()
        
        if not published_pages:
            print("No published pages found, skipping leads creation.")
        else:
            print("Creating demo leads...")
            names = ["John Doe", "Jane Smith", "Alice Wang", "Bob Zhang", "Charlie Brown"]
            emails = ["john@example.com", "jane@example.com", "alice@example.com", "bob@test.com", "charlie@gmail.com"]

            for i in range(10):
                page = random.choice(published_pages)
                lead = Lead(
                    page_id=page.id,
                    name=random.choice(names),
                    email=random.choice(emails),
                    phone=f"138{random.randint(10000000, 99999999)}",
                    message="I am interested in this product. Please contact me.",
                    created_at=datetime.now() - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))
                )
                db.add(lead)

            await db.commit()
            print("Created 10 demo leads.")

            print("Initializing demo page counters...")
            for page in published_pages:
                page.view_count = random.randint(1000, 5000)
                page.click_count = random.randint(100, 500)
                page.conversion_count = random.randint(10, 50)
                page.mobile_view_count = int(page.view_count * 0.6)
                page.desktop_view_count = page.view_count - page.mobile_view_count
            
            await db.commit()
            print("Done.")

        print("Creating demo assets...")
        assets_data = [
            {"name": "iPhone 15 Pro Hero", "type": "image/jpeg", "original_url": "https://images.unsplash.com/photo-1696446701796-da61225697cc"},
            {"name": "Watch Series 9 Hero", "type": "image/jpeg", "original_url": "https://images.unsplash.com/photo-1434493907317-a46b53b8188a"},
            {"name": "Yoga Background", "type": "image/jpeg", "original_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b"}
        ]
        for a_data in assets_data:
            asset = Asset(team_id=1, **a_data)
            db.add(asset)

        await db.commit()
        print("Created demo assets.")
        print("\nAll demo data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
