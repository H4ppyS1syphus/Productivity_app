"""
Pydantic schemas for Google Calendar operations.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CalendarEventBase(BaseModel):
    """Base schema for calendar events"""
    title: str = Field(..., min_length=1, max_length=200, description="Event title")
    description: Optional[str] = Field(None, max_length=2000, description="Event description")
    location: Optional[str] = Field(None, max_length=200, description="Event location")
    start_time: datetime = Field(..., description="Event start time")
    end_time: Optional[datetime] = Field(None, description="Event end time (defaults to start_time + 1 hour)")


class CalendarEventCreate(CalendarEventBase):
    """Schema for creating a calendar event"""
    pass


class CalendarEventUpdate(BaseModel):
    """Schema for updating a calendar event"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    location: Optional[str] = Field(None, max_length=200)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class CalendarEventResponse(BaseModel):
    """Schema for calendar event response"""
    id: str = Field(..., description="Google Calendar event ID")
    summary: str = Field(..., description="Event title")
    description: Optional[str] = None
    location: Optional[str] = None
    start: dict = Field(..., description="Event start time")
    end: dict = Field(..., description="Event end time")
    html_link: Optional[str] = Field(None, description="Link to event in Google Calendar")
    created: Optional[str] = None
    updated: Optional[str] = None

    class Config:
        from_attributes = True


class CalendarEventList(BaseModel):
    """Schema for list of calendar events"""
    events: List[CalendarEventResponse]
    total: int


class TaskSyncRequest(BaseModel):
    """Schema for syncing a task to calendar"""
    task_id: int = Field(..., description="Task ID to sync")
    start_time: Optional[datetime] = Field(None, description="Custom start time (uses task due_date if not provided)")
    duration_hours: Optional[int] = Field(1, ge=1, le=24, description="Event duration in hours")


class TaskSyncResponse(BaseModel):
    """Schema for task sync response"""
    task_id: int
    calendar_event_id: str
    message: str


class CalendarAuthStatus(BaseModel):
    """Schema for checking calendar authorization status"""
    is_authorized: bool = Field(..., description="Whether user has authorized calendar access")
    scopes: List[str] = Field(default_factory=list, description="Granted OAuth scopes")
    email: Optional[str] = Field(None, description="User's Google account email")
