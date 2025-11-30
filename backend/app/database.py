"""
Database configuration and session management.
Supports both SQLite (development) and PostgreSQL (production).
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# SQLite-specific config (needed for FastAPI's threading)
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create database engine
engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=True  # Log SQL queries (disable in production)
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()


def get_db():
    """
    Dependency for getting database sessions.
    Use with FastAPI's Depends() to inject into route functions.

    Example:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
