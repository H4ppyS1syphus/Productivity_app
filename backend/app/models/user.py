"""
User model for authentication and user management.
"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class User(Base):
    """
    User model representing app users.

    Attributes:
        id: Primary key
        email: User's email (from Google OAuth)
        name: User's display name
        google_access_token: OAuth access token (encrypted in production)
        google_refresh_token: OAuth refresh token (encrypted in production)
        created_at: Account creation timestamp
        last_active: Last activity timestamp
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)

    # Google OAuth tokens (TODO: encrypt these in production)
    google_access_token = Column(String, nullable=True)
    google_refresh_token = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_active = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    streaks = relationship("Streak", back_populates="user", cascade="all, delete-orphan")
    gym_progress = relationship("GymProgress", back_populates="user", cascade="all, delete-orphan")
    away_periods = relationship("AwayPeriod", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"
