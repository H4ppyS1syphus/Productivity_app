"""
Pydantic schemas for request/response validation.
"""

from .task import TaskCreate, TaskUpdate, TaskResponse, TaskList
from .user import UserResponse
from .away_period import (
    AwayPeriodCreate,
    AwayPeriodUpdate,
    AwayPeriod,
    AwayPeriodList
)
from .calendar import (
    CalendarEventCreate,
    CalendarEventUpdate,
    CalendarEventResponse,
    CalendarEventList,
    TaskSyncRequest,
    TaskSyncResponse,
    CalendarAuthStatus
)

__all__ = [
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "TaskList",
    "UserResponse",
    "AwayPeriodCreate",
    "AwayPeriodUpdate",
    "AwayPeriod",
    "AwayPeriodList",
    "CalendarEventCreate",
    "CalendarEventUpdate",
    "CalendarEventResponse",
    "CalendarEventList",
    "TaskSyncRequest",
    "TaskSyncResponse",
    "CalendarAuthStatus",
]
