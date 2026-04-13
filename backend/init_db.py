#!/usr/bin/env python3
"""
Database initialization script
Creates database tables directly without Alembic migration
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models import Base

async def create_database():
    """Create database if it doesn't exist"""
    try:
        # Connect to MySQL server (not specific database)
        engine = create_async_engine(
            "mysql+aiomysql://root:root@127.0.0.1:3306/mysql",
            echo=True
        )
        
        async with engine.connect() as conn:
            # Create database
            await conn.execute(
                text("CREATE DATABASE IF NOT EXISTS lander_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            )
            await conn.commit()
            print("✅ Database 'lander_ai' created successfully")
            
    except Exception as e:
        print(f"❌ Failed to create database: {e}")
        return False
    
    return True

async def create_tables():
    """Create all database tables"""
    try:
        # Connect to the specific database
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=True
        )
        
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            print("✅ All tables created successfully")
            
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return False
    
    return True

async def check_database_connection():
    """Check if database connection works"""
    try:
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False
        )
        
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            await result.fetchone()
            print("✅ Database connection successful")
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    return True

async def main():
    """Main initialization function"""
    print("🗄️  Starting database initialization...")
    print("=" * 50)
    
    # Step 1: Create database
    print("\n📊 Step 1: Creating database...")
    if not await create_database():
        print("❌ Database creation failed")
        return False
    
    # Step 2: Create tables
    print("\n📋 Step 2: Creating tables...")
    if not await create_tables():
        print("❌ Table creation failed")
        return False
    
    # Step 3: Verify connection
    print("\n🔍 Step 3: Verifying connection...")
    if not await check_database_connection():
        print("❌ Connection verification failed")
        return False
    
    print("\n🎉 Database initialization completed successfully!")
    print("=" * 50)
    print("📍 Database: mysql://root:root@127.0.0.1:3306/lander_ai")
    print("📍 All tables are ready for use")
    
    return True

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)