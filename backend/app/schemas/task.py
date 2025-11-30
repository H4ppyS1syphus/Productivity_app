"""
Pydantic schemas for Task API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from ..models.task import TaskType, TaskStatus


class TaskBase(BaseModel):
    """Base task schema with common fields"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    type: TaskType = TaskType.DAILY
    recurrence: Optional[str] = None
    pause_on_away: bool = True
    due_date: Optional[datetime] = None


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


class TaskResponse(TaskBase):
    """Schema for task responses"""
    id: int
    user_id: int
    status: TaskStatus
    completed_at: Optional[datetime] = None
    created_at: datetime
    calendar_event_id: Optional[str] = None

    class Config:
        from_attributes = True  # Updated from orm_mode in Pydantic v2


class TaskList(BaseModel):
    """Schema for paginated task list"""
    tasks: List[TaskResponse]
    total: int
    page: int = 1
    page_size: int = 50
