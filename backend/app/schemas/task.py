"""
Pydantic schemas for Task API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, time
from ..models.task import TaskType, TaskStatus


class TaskBase(BaseModel):
    """Base task schema with common fields"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    type: TaskType = TaskType.DAILY
    recurrence: Optional[str] = None
    pause_on_away: bool = True
    due_date: Optional[datetime] = None

    # Recurring task fields
    is_recurring: bool = False
    recurrence_time: Optional[time] = None  # Time of day (HH:MM:SS)
    recurrence_day_of_week: Optional[int] = Field(None, ge=0, le=6)  # 0=Monday, 6=Sunday
    recurrence_day_of_month: Optional[int] = Field(None, ge=1, le=31)  # Day of month


class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    type: Optional[TaskType] = None
    recurrence: Optional[str] = None
    status: Optional[TaskStatus] = None
    pause_on_away: Optional[bool] = None
    due_date: Optional[datetime] = None

    # Recurring task fields
    is_recurring: Optional[bool] = None
    recurrence_time: Optional[time] = None
    recurrence_day_of_week: Optional[int] = Field(None, ge=0, le=6)
    recurrence_day_of_month: Optional[int] = Field(None, ge=1, le=31)


class TaskResponse(TaskBase):
    """Schema for task responses"""
    id: int
    user_id: int
    status: TaskStatus
    completed_at: Optional[datetime] = None
    created_at: datetime
    calendar_event_id: Optional[str] = None
    last_reset_date: Optional[datetime] = None  # For recurring tasks

    class Config:
        from_attributes = True  # Updated from orm_mode in Pydantic v2


class TaskList(BaseModel):
    """Schema for paginated task list"""
    tasks: List[TaskResponse]
    total: int
    page: int = 1
    page_size: int = 50
