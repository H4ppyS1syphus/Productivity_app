"""
Google Calendar service for managing calendar events and syncing with tasks.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from sqlalchemy.orm import Session

from ..models import User, Task
from ..config import settings


class CalendarService:
    """Service for interacting with Google Calendar API."""

    def __init__(self, user: User, db: Session):
        """
        Initialize Calendar service for a user.

        Args:
            user: User object with Google OAuth tokens
            db: Database session for updating tokens if refreshed
        """
        self.user = user
        self.db = db
        self.service = None

    def _get_credentials(self) -> Optional[Credentials]:
        """
        Build Google API credentials from stored tokens.

        Returns:
            Credentials object or None if tokens don't exist
        """
        if not self.user.google_access_token:
            return None

        creds = Credentials(
            token=self.user.google_access_token,
            refresh_token=self.user.google_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
            scopes=[
                'openid',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/calendar'
            ]
        )

        # Refresh token if expired
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            # Update stored tokens
            self.user.google_access_token = creds.token
            if creds.refresh_token:
                self.user.google_refresh_token = creds.refresh_token
            self.db.commit()

        return creds

    def _get_service(self):
        """Get or create Google Calendar service instance."""
        if self.service is None:
            creds = self._get_credentials()
            if creds is None:
                raise ValueError("User has not authorized calendar access")
            self.service = build('calendar', 'v3', credentials=creds)
        return self.service

    def list_events(
        self,
        calendar_id: str = 'primary',
        time_min: Optional[datetime] = None,
        time_max: Optional[datetime] = None,
        max_results: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Fetch events from user's calendar.

        Args:
            calendar_id: Calendar ID (default: 'primary')
            time_min: Start time for event range
            time_max: End time for event range
            max_results: Maximum number of events to return

        Returns:
            List of calendar events
        """
        service = self._get_service()

        # Default to next 30 days if not specified
        if time_min is None:
            time_min = datetime.utcnow()
        if time_max is None:
            time_max = time_min + timedelta(days=30)

        events_result = service.events().list(
            calendarId=calendar_id,
            timeMin=time_min.isoformat() + 'Z',
            timeMax=time_max.isoformat() + 'Z',
            maxResults=max_results,
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        return events_result.get('items', [])

    def get_event(
        self,
        event_id: str,
        calendar_id: str = 'primary'
    ) -> Optional[Dict[str, Any]]:
        """
        Get a single calendar event by ID.

        Args:
            event_id: Event ID to fetch
            calendar_id: Calendar ID (default: 'primary')

        Returns:
            Event object or None if not found
        """
        service = self._get_service()

        try:
            event = service.events().get(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            return event
        except Exception:
            # Event not found or other error
            return None

    def create_event(
        self,
        title: str,
        start_time: datetime,
        end_time: Optional[datetime] = None,
        description: Optional[str] = None,
        location: Optional[str] = None,
        calendar_id: str = 'primary'
    ) -> Dict[str, Any]:
        """
        Create a new calendar event.

        Args:
            title: Event title
            start_time: Event start time
            end_time: Event end time (defaults to start_time + 1 hour)
            description: Event description
            location: Event location
            calendar_id: Calendar ID (default: 'primary')

        Returns:
            Created event object with 'id' field
        """
        service = self._get_service()

        if end_time is None:
            end_time = start_time + timedelta(hours=1)

        event = {
            'summary': title,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            },
        }

        if description:
            event['description'] = description
        if location:
            event['location'] = location

        created_event = service.events().insert(
            calendarId=calendar_id,
            body=event
        ).execute()

        return created_event

    def update_event(
        self,
        event_id: str,
        title: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        description: Optional[str] = None,
        location: Optional[str] = None,
        calendar_id: str = 'primary'
    ) -> Dict[str, Any]:
        """
        Update an existing calendar event.

        Args:
            event_id: Google Calendar event ID
            title: New event title
            start_time: New start time
            end_time: New end time
            description: New description
            location: New location
            calendar_id: Calendar ID (default: 'primary')

        Returns:
            Updated event object
        """
        service = self._get_service()

        # Get existing event
        event = service.events().get(
            calendarId=calendar_id,
            eventId=event_id
        ).execute()

        # Update fields if provided
        if title:
            event['summary'] = title
        if start_time:
            event['start'] = {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            }
        if end_time:
            event['end'] = {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            }
        if description is not None:
            event['description'] = description
        if location is not None:
            event['location'] = location

        updated_event = service.events().update(
            calendarId=calendar_id,
            eventId=event_id,
            body=event
        ).execute()

        return updated_event

    def delete_event(
        self,
        event_id: str,
        calendar_id: str = 'primary'
    ) -> bool:
        """
        Delete a calendar event.

        Args:
            event_id: Google Calendar event ID
            calendar_id: Calendar ID (default: 'primary')

        Returns:
            True if deleted successfully
        """
        service = self._get_service()

        try:
            service.events().delete(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            return True
        except Exception:
            return False

    def sync_task_to_calendar(
        self,
        task: Task,
        calendar_id: str = 'primary'
    ) -> str:
        """
        Create or update a calendar event for a task.

        Args:
            task: Task object to sync
            calendar_id: Calendar ID (default: 'primary')

        Returns:
            Google Calendar event ID
        """
        # Determine start and end times
        if task.due_date:
            start_time = task.due_date
            end_time = task.due_date + timedelta(hours=1)
        else:
            # Default to tomorrow at 9 AM
            tomorrow = datetime.utcnow().replace(
                hour=9, minute=0, second=0, microsecond=0
            ) + timedelta(days=1)
            start_time = tomorrow
            end_time = tomorrow + timedelta(hours=1)

        # Create or update event
        if task.calendar_event_id:
            # Update existing event
            try:
                event = self.update_event(
                    event_id=task.calendar_event_id,
                    title=task.title,
                    start_time=start_time,
                    end_time=end_time,
                    description=task.description or "",
                    calendar_id=calendar_id
                )
                return event['id']
            except Exception:
                # Event doesn't exist, create new one
                task.calendar_event_id = None

        # Create new event
        event = self.create_event(
            title=task.title,
            start_time=start_time,
            end_time=end_time,
            description=task.description or "",
            calendar_id=calendar_id
        )

        # Update task with event ID
        task.calendar_event_id = event['id']
        self.db.commit()

        return event['id']

    def unsync_task(
        self,
        task: Task,
        calendar_id: str = 'primary'
    ) -> bool:
        """
        Remove calendar event associated with a task.

        Args:
            task: Task object to unsync
            calendar_id: Calendar ID (default: 'primary')

        Returns:
            True if unsynced successfully
        """
        if not task.calendar_event_id:
            return True

        # Delete calendar event
        deleted = self.delete_event(task.calendar_event_id, calendar_id)

        if deleted:
            task.calendar_event_id = None
            self.db.commit()

        return deleted
