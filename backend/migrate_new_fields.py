
import asyncio
from sqlalchemy import text
from app.db.database import AsyncSessionLocal

async def migrate():
    print("Starting migration...")
    async with AsyncSessionLocal() as db:
        try:
            # Add enable_gender_verification
            print("Adding enable_gender_verification column...")
            await db.execute(text("ALTER TABLE pages ADD COLUMN enable_gender_verification BOOLEAN DEFAULT 0"))
            print("Successfully added enable_gender_verification.")
        except Exception as e:
            print(f"Skipping enable_gender_verification (maybe already exists): {e}")

        try:
            # Add enable_cookies_consent
            print("Adding enable_cookies_consent column...")
            await db.execute(text("ALTER TABLE pages ADD COLUMN enable_cookies_consent BOOLEAN DEFAULT 0"))
            print("Successfully added enable_cookies_consent.")
        except Exception as e:
            print(f"Skipping enable_cookies_consent (maybe already exists): {e}")
            
        await db.commit()
    print("Migration finished.")

if __name__ == "__main__":
    asyncio.run(migrate())
