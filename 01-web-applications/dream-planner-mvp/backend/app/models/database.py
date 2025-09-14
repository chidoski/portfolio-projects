"""
Database configuration and session management for Dream Planner

Sets up SQLite database with SQLAlchemy for the MVP demo.
In production, this would be PostgreSQL or similar.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ensure database directory exists
database_dir = "/Volumes/Extreme Pro/Programming/Python/Portfolio-Projects/01-web-applications/dream-planner-mvp/backend/database"
os.makedirs(database_dir, exist_ok=True)

# SQLite database URL for MVP
SQLALCHEMY_DATABASE_URL = f"sqlite:///{database_dir}/dream_planner.db"

# Create engine with SQLite-specific configurations
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite specific - allows multiple threads
    echo=False  # Set to True for SQL query debugging
)

# Session factory for database operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()

def get_db():
    """
    Database dependency for FastAPI endpoints.
    
    Yields a database session and ensures it's properly closed.
    Use with FastAPI's Depends() function.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """
    Create all database tables.
    Call this once during application startup.
    """
    Base.metadata.create_all(bind=engine)

