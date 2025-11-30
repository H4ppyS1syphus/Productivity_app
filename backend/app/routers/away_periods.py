"""
Away period management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from ..database import get_db
from ..models import AwayPeriod, User
from ..schemas.away_period import (
    AwayPeriodCreate,
    AwayPeriodUpdate,
    AwayPeriod as AwayPeriodSchema,
    AwayPeriodList
)
from ..auth import get_current_user

router = APIRouter()


@router.get("/", response_model=AwayPeriodList)
def get_away_periods(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all away periods for the current user.

    Parameters:
    - skip: Number of periods to skip (for pagination)
    - limit: Maximum number of periods to return
    """
    query = db.query(AwayPeriod).filter(AwayPeriod.user_id == current_user.id)
    away_periods = query.offset(skip).limit(limit).all()

    # Find current away period
    current_away_period = None
    today = date.today()
    for period in away_periods:
        if period.is_current():
            current_away_period = period
            break

    return AwayPeriodList(
        away_periods=away_periods,
        current_away_period=current_away_period
    )


@router.post("/", response_model=AwayPeriodSchema, status_code=201)
def create_away_period(
    period_data: AwayPeriodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new away period.
    """
    # Check for overlapping active periods
    overlapping = db.query(AwayPeriod).filter(
        AwayPeriod.user_id == current_user.id,
        AwayPeriod.is_active == True,
        AwayPeriod.start_date <= period_data.end_date,
        AwayPeriod.end_date >= period_data.start_date
    ).first()

    if overlapping:
        raise HTTPException(
            status_code=400,
            detail=f"Away period overlaps with existing period (id: {overlapping.id})"
        )

    period = AwayPeriod(
        user_id=current_user.id,
        **period_data.model_dump()
    )

    db.add(period)
    db.commit()
    db.refresh(period)

    return period


@router.get("/{period_id}", response_model=AwayPeriodSchema)
def get_away_period(
    period_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific away period by ID.
    """
    period = db.query(AwayPeriod).filter(
        AwayPeriod.id == period_id,
        AwayPeriod.user_id == current_user.id
    ).first()

    if not period:
        raise HTTPException(status_code=404, detail="Away period not found")

    return period


@router.patch("/{period_id}", response_model=AwayPeriodSchema)
def update_away_period(
    period_id: int,
    period_data: AwayPeriodUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an away period.
    """
    period = db.query(AwayPeriod).filter(
        AwayPeriod.id == period_id,
        AwayPeriod.user_id == current_user.id
    ).first()

    if not period:
        raise HTTPException(status_code=404, detail="Away period not found")

    # Update only provided fields
    update_data = period_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(period, field, value)

    db.commit()
    db.refresh(period)

    return period


@router.post("/{period_id}/deactivate", response_model=AwayPeriodSchema)
def deactivate_away_period(
    period_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deactivate an away period (end it early).
    """
    period = db.query(AwayPeriod).filter(
        AwayPeriod.id == period_id,
        AwayPeriod.user_id == current_user.id
    ).first()

    if not period:
        raise HTTPException(status_code=404, detail="Away period not found")

    period.deactivate()
    db.commit()
    db.refresh(period)

    return period


@router.delete("/{period_id}", status_code=204)
def delete_away_period(
    period_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an away period.
    """
    period = db.query(AwayPeriod).filter(
        AwayPeriod.id == period_id,
        AwayPeriod.user_id == current_user.id
    ).first()

    if not period:
        raise HTTPException(status_code=404, detail="Away period not found")

    db.delete(period)
    db.commit()

    return None
