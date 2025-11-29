"""
Teacher management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database import get_db
from auth import get_current_admin_user
import schemas
import crud
import models

router = APIRouter(prefix="/api/teachers", tags=["Teachers"])


@router.post("/", response_model=schemas.TeacherResponse, status_code=status.HTTP_201_CREATED)
def create_teacher(
    teacher: schemas.TeacherCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Create a new teacher (Admin only)
    """
    return crud.create_teacher(db=db, teacher=teacher)


@router.get("/", response_model=List[schemas.TeacherResponse])
def list_teachers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Get list of teachers with optional filtering (Admin only)
    """
    return crud.get_teachers(db=db, skip=skip, limit=limit, status=status)


@router.get("/{teacher_id}", response_model=schemas.TeacherResponse)
def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Get a specific teacher by ID (Admin only)
    """
    db_teacher = crud.get_teacher(db, teacher_id=teacher_id)
    if db_teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return db_teacher


@router.get("/{teacher_id}/stats", response_model=schemas.TeacherWithStats)
def get_teacher_stats(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Get teacher statistics including students and hours (Admin only)
    """
    db_teacher = crud.get_teacher(db, teacher_id=teacher_id)
    if db_teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Get student count
    total_students = crud.count_students(db, teacher_id=teacher_id)

    # Get daily hours (today)
    today = date.today()
    daily_hours = crud.get_teacher_daily_hours(db, teacher_id, today)

    # Get monthly hours (current month)
    monthly_hours = crud.get_teacher_monthly_hours(db, teacher_id, today.year, today.month)

    return {
        **db_teacher.__dict__,
        "total_students": total_students,
        "daily_hours": daily_hours,
        "monthly_hours": monthly_hours,
    }


@router.put("/{teacher_id}", response_model=schemas.TeacherResponse)
def update_teacher(
    teacher_id: int,
    teacher: schemas.TeacherUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Update a teacher (Admin only)
    """
    db_teacher = crud.update_teacher(db, teacher_id=teacher_id, teacher=teacher)
    if db_teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return db_teacher


@router.delete("/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Delete a teacher (Admin only)
    """
    success = crud.delete_teacher(db, teacher_id=teacher_id)
    if not success:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return None
