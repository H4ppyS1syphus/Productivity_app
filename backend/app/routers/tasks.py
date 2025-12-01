"""
Task management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Task, User, TaskStatus
from ..schemas import TaskCreate, TaskUpdate, TaskResponse, TaskList
from ..auth import get_current_user

router = APIRouter()


@router.get("/", response_model=TaskList)
def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: TaskStatus = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all tasks for the current user.

    Parameters:
    - skip: Number of tasks to skip (for pagination)
    - limit: Maximum number of tasks to return
    - status: Filter by task status (optional)
    """
    query = db.query(Task).filter(Task.user_id == current_user.id)

    if status:
        query = query.filter(Task.status == status)

    total = query.count()
    tasks = query.offset(skip).limit(limit).all()

    return TaskList(
        tasks=tasks,
        total=total,
        page=(skip // limit) + 1,
        page_size=limit
    )


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task.
    """
    task = Task(
        user_id=current_user.id,
        **task_data.model_dump()
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific task by ID.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a task.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


@router.post("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a task as completed.
    If the task is synced to Google Calendar, the calendar event will be updated.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.mark_complete()

    # Update calendar event if synced
    if task.calendar_event_id and current_user.google_refresh_token:
        try:
            from ..services.calendar import CalendarService
            calendar_service = CalendarService(current_user, db)

            # Update the event to mark it as done (add [DONE] prefix to title)
            try:
                event = calendar_service.get_event(task.calendar_event_id)
                if event:
                    updated_summary = f"[DONE] {event.get('summary', task.title)}"
                    if not event.get('summary', '').startswith('[DONE]'):
                        current_desc = event.get('description', '')
                        updated_desc = f"{current_desc}\n\n✅ Completed in Productivity App" if current_desc else "✅ Completed in Productivity App"
                        calendar_service.update_event(
                            event_id=task.calendar_event_id,
                            title=updated_summary,
                            description=updated_desc
                        )
            except Exception as e:
                # If calendar update fails, log but don't fail the task completion
                print(f"Failed to update calendar event: {e}")
        except Exception as e:
            print(f"Failed to initialize calendar service: {e}")

    db.commit()
    db.refresh(task)

    return task


@router.post("/{task_id}/uncomplete", response_model=TaskResponse)
def uncomplete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a task as pending (undo completion).
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.mark_pending()
    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a task.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return None


@router.post("/reset-recurring", response_model=dict)
def reset_recurring_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reset all recurring tasks that should be reset (daily/weekly/monthly).
    This checks all completed recurring tasks and resets them if their
    recurrence period has passed.

    Returns:
        dict: Number of tasks reset
    """
    # Get all recurring tasks for the user
    recurring_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.is_recurring == True
    ).all()

    reset_count = 0
    for task in recurring_tasks:
        if task.should_reset():
            task.reset_recurring()
            reset_count += 1

    db.commit()

    return {
        "message": f"Reset {reset_count} recurring task(s)",
        "reset_count": reset_count
    }
