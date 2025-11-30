"""
Streak model for gamification and habit tracking.
"""

from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import date
from ..database import Base


class Streak(Base):
    """
    Streak model for tracking task completion streaks.

    Attributes:
        id: Primary key
        user_id: Foreign key to User
        task_id: Foreign key to Task
        current_streak: Current consecutive completion count
        longest_streak: All-time longest streak
        last_completed_date: Date of last completion
        visual_theme: Theme based on streak milestone
    """
    __tablename__ = "streaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False, unique=True)

    # Streak tracking
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_completed_date = Column(Date, nullable=True)

    # Visual theme based on milestones
    # basic (0-7), bronze (7-30), silver (30-90), gold (90+)
    visual_theme = Column(String, default="basic", nullable=False)

    # Relationships
    user = relationship("User", back_populates="streaks")
    task = relationship("Task", back_populates="streak")

    def __repr__(self):
        return f"<Streak(id={self.id}, current={self.current_streak}, longest={self.longest_streak})>"

    def increment_streak(self):
        """Increment streak counter and update theme if needed"""
        self.current_streak += 1
        self.last_completed_date = date.today()

        # Update longest streak if current exceeds it
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak

        # Update visual theme based on milestones
        self.update_visual_theme()

    def break_streak(self):
        """Reset current streak to 0"""
        self.current_streak = 0
        self.visual_theme = "basic"

    def update_visual_theme(self):
        """Update visual theme based on current streak"""
        if self.current_streak >= 90:
            self.visual_theme = "gold"
        elif self.current_streak >= 30:
            self.visual_theme = "silver"
        elif self.current_streak >= 7:
            self.visual_theme = "bronze"
        else:
            self.visual_theme = "basic"
