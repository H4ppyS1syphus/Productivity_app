"""
Away period model for travel/away mode.
"""

from sqlalchemy import Column, Integer, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import date
from ..database import Base


class AwayPeriod(Base):
    """
    Away period model for tracking when user is traveling.

    Attributes:
        id: Primary key
        user_id: Foreign key to User
        start_date: Start date of away period
        end_date: End date of away period
        is_active: Whether this period is currently active
    """
    __tablename__ = "away_periods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Period dates
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="away_periods")

    def __repr__(self):
        return f"<AwayPeriod(id={self.id}, start={self.start_date}, end={self.end_date}, active={self.is_active})>"

    def is_current(self):
        """Check if this away period includes today"""
        today = date.today()
        return self.is_active and self.start_date <= today <= self.end_date

    def deactivate(self):
        """Mark this away period as inactive"""
        self.is_active = False
