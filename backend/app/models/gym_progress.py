"""
Gym progress model for tracking powerlifting metrics.
"""

from sqlalchemy import Column, Integer, Float, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import date
from ..database import Base


class GymProgress(Base):
    """
    Gym progress model for tracking 1RM and bodyweight.

    Attributes:
        id: Primary key
        user_id: Foreign key to User
        date: Date of the entry
        bodyweight: User's bodyweight in kg
        squat_1rm: Squat one-rep max in kg
        bench_1rm: Bench press one-rep max in kg
        deadlift_1rm: Deadlift one-rep max in kg
        notes: Optional notes about the session
    """
    __tablename__ = "gym_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Entry date
    date = Column(Date, default=date.today, nullable=False, index=True)

    # Metrics
    bodyweight = Column(Float, nullable=True)  # in kg
    squat_1rm = Column(Float, nullable=True)   # in kg
    bench_1rm = Column(Float, nullable=True)   # in kg
    deadlift_1rm = Column(Float, nullable=True) # in kg

    # Optional notes
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="gym_progress")

    def __repr__(self):
        return f"<GymProgress(id={self.id}, date={self.date}, squat={self.squat_1rm}, bench={self.bench_1rm}, deadlift={self.deadlift_1rm})>"

    @property
    def total(self):
        """Calculate total (squat + bench + deadlift)"""
        values = [self.squat_1rm or 0, self.bench_1rm or 0, self.deadlift_1rm or 0]
        return sum(values) if any(values) else None

    @property
    def is_1000lb_club(self):
        """Check if total exceeds 1000 lbs (≈453.6 kg)"""
        total = self.total
        return total >= 453.6 if total else False

    @property
    def wilks_score(self):
        """
        Calculate Wilks score (simplified - needs proper formula implementation)
        TODO: Implement proper Wilks coefficient calculation
        """
        # Placeholder for now
        return None
