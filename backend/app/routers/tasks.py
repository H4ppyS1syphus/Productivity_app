"""
Task management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Task, User, TaskStatus
from ..schemas import TaskCreate, TaskUpdate, TaskResponse, TaskList

router = APIRouter()


# Temporary: Create a default user for testing (will be replaced with OAuth)
def get_or_create_test_user(db: Session) -> User:
    """Get or create a test user for development"""
    user = db.query(User).filter(User.email == "test@example.com").first()
    if not user:
        user = User(
            email="test@example.com",
            name="Test User"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.get("/", response_model=TaskList)
def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: TaskStatus = None,
    db: Session = Depends(get_db)
):
    """
    Get all tasks for the current user.

    Parameters:
    - skip: Number of tasks to skip (for pagination)
    - limit: Maximum number of tasks to return
    - status: Filter by task status (optional)
    """
    user = get_or_create_test_user(db)

    query = db.query(Task).filter(Task.user_id == user.id)

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
    db: Session = Depends(get_db)
):
    """
    Create a new task.
    """
    user = get_or_create_test_user(db)

    task = Task(
        user_id=user.id,
        **task_data.model_dump()
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific task by ID.
    """
    user = get_or_create_test_user(db)

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a task.
    """
    user = get_or_create_test_user(db)

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
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
    db: Session = Depends(get_db)
):
    """
    Mark a task as completed.
    """
    user = get_or_create_test_user(db)

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.mark_complete()
    db.commit()
    db.refresh(task)

    return task


@router.post("/{task_id}/uncomplete", response_model=TaskResponse)
def uncomplete_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    """
    Mark a task as pending (undo completion).
    """
    user = get_or_create_test_user(db)

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
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
    db: Session = Depends(get_db)
):
    """
    Delete a task.
    """
    user = get_or_create_test_user(db)

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return None
