"""
Pydantic schemas for away periods.
"""

from pydantic import BaseModel, field_validator
from datetime import date
from typing import Optional


class AwayPeriodBase(BaseModel):
    """Base schema for away period"""
    start_date: date
    end_date: date

    @field_validator('end_date')
    @classmethod
    def validate_end_after_start(cls, v, info):
        """Ensure end_date is after start_date"""
        if 'start_date' in info.data and v < info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class AwayPeriodCreate(AwayPeriodBase):
    """Schema for creating an away period"""
    pass


class AwayPeriodUpdate(BaseModel):
    """Schema for updating an away period"""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class AwayPeriod(AwayPeriodBase):
    """Schema for away period with all fields"""
    id: int
    user_id: int
    is_active: bool

    class Config:
        from_attributes = True


class AwayPeriodList(BaseModel):
    """Schema for list of away periods"""
    away_periods: list[AwayPeriod]
    current_away_period: Optional[AwayPeriod] = None
