"""
Task model for task management.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Time
from sqlalchemy.orm import relationship
from datetime import datetime, time as dt_time
import enum
from ..database import Base


class TaskType(str, enum.Enum):
    """Task frequency types"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    LONG_TERM = "long_term"
    GYM_WORKOUT = "gym_workout"


class TaskStatus(str, enum.Enum):
    """Task completion status"""
    PENDING = "pending"
    COMPLETED = "completed"
    SUGGESTED = "suggested"  # For smart scheduler suggestions


class Task(Base):
    """
    Task model representing user tasks and todos.

    Attributes:
        id: Primary key
        user_id: Foreign key to User
        title: Task title
        description: Optional task description
        type: Task frequency (daily, weekly, long_term, gym_workout)
        recurrence: JSON pattern for recurring tasks (e.g., "every monday")
        status: Current status (pending, completed, suggested)
        pause_on_away: Whether to pause this task during away mode
        due_date: Optional due date
        completed_at: Completion timestamp
        calendar_event_id: Google Calendar event ID for synced tasks
        created_at: Task creation timestamp
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Task details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum(TaskType), nullable=False, default=TaskType.DAILY)
    recurrence = Column(String, nullable=True)  # JSON pattern for recurrence
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.PENDING)

    # Recurring task settings
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_time = Column(Time, nullable=True)  # Time of day for daily tasks (e.g., 09:00)
    recurrence_day_of_week = Column(Integer, nullable=True)  # 0-6 for weekly (0=Monday)
    recurrence_day_of_month = Column(Integer, nullable=True)  # 1-31 for monthly
    last_reset_date = Column(DateTime, nullable=True)  # Track when task was last reset

    # Away mode setting
    pause_on_away = Column(Boolean, default=True, nullable=False)

    # Dates
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Google Calendar integration
    calendar_event_id = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="tasks")
    streak = relationship("Streak", back_populates="task", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', type={self.type}, status={self.status})>"

    def mark_complete(self):
        """Mark task as completed with current timestamp"""
        self.status = TaskStatus.COMPLETED
        self.completed_at = datetime.utcnow()

    def mark_pending(self):
        """Reset task to pending state"""
        self.status = TaskStatus.PENDING
        self.completed_at = None

    def should_reset(self) -> bool:
        """Check if recurring task should be reset based on its schedule"""
        if not self.is_recurring or self.status != TaskStatus.COMPLETED:
            return False

        now = datetime.utcnow()

        # If never reset before, check completion time
        check_time = self.last_reset_date or self.completed_at
        if not check_time:
            return False

        # Daily tasks: reset if completed yesterday or earlier
        if self.type == TaskType.DAILY:
            return check_time.date() < now.date()

        # Weekly tasks: reset if it's been 7+ days
        if self.type == TaskType.WEEKLY:
            return (now - check_time).days >= 7

        # Monthly tasks: reset if it's a new month
        if self.type == TaskType.MONTHLY:
            return check_time.month != now.month or check_time.year != now.year

        return False

    def reset_recurring(self):
        """Reset a recurring task to pending state and update last_reset_date"""
        self.mark_pending()
        self.last_reset_date = datetime.utcnow()
