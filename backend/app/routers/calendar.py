"""
Google Calendar API endpoints for event management and task syncing.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, Task
from ..auth import get_current_user
from ..services import CalendarService
from ..schemas.calendar import (
    CalendarEventCreate,
    CalendarEventUpdate,
    CalendarEventResponse,
    CalendarEventList,
    TaskSyncRequest,
    TaskSyncResponse,
    CalendarAuthStatus
)

router = APIRouter()


def get_calendar_service(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> CalendarService:
    """Dependency to get calendar service for current user."""
    return CalendarService(current_user, db)


@router.get("/status", response_model=CalendarAuthStatus)
def check_calendar_auth(
    current_user: User = Depends(get_current_user)
):
    """
    Check if user has authorized Google Calendar access.

    Returns:
        Authorization status with granted scopes
    """
    is_authorized = bool(current_user.google_access_token)

    return CalendarAuthStatus(
        is_authorized=is_authorized,
        scopes=[
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/calendar'
        ] if is_authorized else [],
        email=current_user.email if is_authorized else None
    )


@router.get("/events", response_model=CalendarEventList)
def list_calendar_events(
    time_min: Optional[datetime] = Query(
        None,
        description="Start time for event range (defaults to now)"
    ),
    time_max: Optional[datetime] = Query(
        None,
        description="End time for event range (defaults to 30 days from now)"
    ),
    max_results: int = Query(
        50,
        ge=1,
        le=100,
        description="Maximum number of events to return"
    ),
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """
    Fetch events from user's Google Calendar.

    Parameters:
    - time_min: Start time for event range
    - time_max: End time for event range
    - max_results: Maximum number of events to return

    Returns:
        List of calendar events
    """
    try:
        events = calendar_service.list_events(
            time_min=time_min,
            time_max=time_max,
            max_results=max_results
        )

        return CalendarEventList(
            events=[CalendarEventResponse(**event) for event in events],
            total=len(events)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch calendar events: {str(e)}"
        )


@router.post("/events", response_model=CalendarEventResponse, status_code=201)
def create_calendar_event(
    event_data: CalendarEventCreate,
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """
    Create a new event in user's Google Calendar.

    Args:
        event_data: Event details (title, description, start/end times, etc.)

    Returns:
        Created calendar event
    """
    try:
        event = calendar_service.create_event(
            title=event_data.title,
            start_time=event_data.start_time,
            end_time=event_data.end_time,
            description=event_data.description,
            location=event_data.location
        )

        return CalendarEventResponse(**event)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create calendar event: {str(e)}"
        )


@router.patch("/events/{event_id}", response_model=CalendarEventResponse)
def update_calendar_event(
    event_id: str,
    event_data: CalendarEventUpdate,
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """
    Update an existing calendar event.

    Args:
        event_id: Google Calendar event ID
        event_data: Fields to update

    Returns:
        Updated calendar event
    """
    try:
        event = calendar_service.update_event(
            event_id=event_id,
            title=event_data.title,
            start_time=event_data.start_time,
            end_time=event_data.end_time,
            description=event_data.description,
            location=event_data.location
        )

        return CalendarEventResponse(**event)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event not found or could not be updated: {str(e)}"
        )


@router.delete("/events/{event_id}", status_code=204)
def delete_calendar_event(
    event_id: str,
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """
    Delete a calendar event.

    Args:
        event_id: Google Calendar event ID

    Returns:
        No content (204)
    """
    try:
        deleted = calendar_service.delete_event(event_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete calendar event: {str(e)}"
        )


@router.post("/sync-task", response_model=TaskSyncResponse, status_code=201)
def sync_task_to_calendar(
    sync_request: TaskSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """
    Create or update a calendar event for a task.

    Args:
        sync_request: Task ID and optional custom time

    Returns:
        Sync result with event ID
    """
    # Get task
    task = db.query(Task).filter(
        Task.id == sync_request.task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    try:
        event_id = calendar_service.sync_task_to_calendar(task)

        return TaskSyncResponse(
            task_id=task.id,
            calendar_event_id=event_id,
            message="Task synced to calendar successfully"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync task to calendar: {str(e)}"
        )


@router.post("/unsync-task/{task_id}", status_code=204)
def unsync_task_from_calendar(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    calendar_service: CalendarService = Depends(get_calendar_service)
):
    """
    Remove calendar event associated with a task.

    Args:
        task_id: Task ID to unsync

    Returns:
        No content (204)
    """
    # Get task
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    try:
        calendar_service.unsync_task(task)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unsync task: {str(e)}"
        )
