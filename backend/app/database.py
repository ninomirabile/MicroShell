"""
Database configuration and connection management for MicroShell Backend.
Uses SQLAlchemy with PostgreSQL for data persistence.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from .config import settings

# Create SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.DEBUG  # Log SQL queries in debug mode
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    Used with FastAPI's Depends() for automatic session management.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
