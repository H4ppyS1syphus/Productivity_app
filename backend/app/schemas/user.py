"""
Pydantic schemas for User API endpoints.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: str


class UserResponse(UserBase):
    """Schema for user responses"""
    id: int
    created_at: datetime
    last_active: datetime

    class Config:
        from_attributes = True  # Updated from orm_mode in Pydantic v2
