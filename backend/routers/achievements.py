"""
Achievement/Award API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from auth import get_current_teacher_user, get_current_user
import schemas
import crud
import models

router = APIRouter(prefix="/api/achievements", tags=["Achievements"])


@router.post("/", response_model=schemas.AchievementResponse, status_code=status.HTTP_201_CREATED)
def create_achievement(
    achievement: schemas.AchievementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_teacher_user),
):
    """
    Create a new achievement/award for a student (Teacher/Admin only)
    """
    # Verify student exists
    student = crud.get_student(db, achievement.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get teacher ID from current user
    if current_user.role == models.UserRole.ADMIN:
        # Admin can award on behalf of any teacher, but we need a teacher_id
        # For now, we'll use the student's assigned teacher
        if not student.assigned_teacher_id:
            raise HTTPException(
                status_code=400,
                detail="Student has no assigned teacher. Cannot award achievement."
            )
        teacher_id = student.assigned_teacher_id
    elif current_user.role == models.UserRole.TEACHER:
        # Get teacher record for the current user
        teacher = db.query(models.Teacher).filter(
            models.Teacher.user_id == current_user.id
        ).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher profile not found")
        teacher_id = teacher.id
    else:
        raise HTTPException(status_code=403, detail="Not authorized to award achievements")

    return crud.create_achievement(db=db, achievement=achievement, teacher_id=teacher_id)


@router.get("/", response_model=List[schemas.AchievementResponse])
def get_achievements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    student_id: Optional[int] = Query(None, description="Filter by student ID"),
    teacher_id: Optional[int] = Query(None, description="Filter by teacher ID"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get achievements with optional filtering
    - Admin: Can see all achievements
    - Teacher: Can see achievements they awarded or for their students
    - Student: Can see only their own achievements
    """
    # Role-based filtering
    if current_user.role == models.UserRole.STUDENT:
        # Students can only see their own achievements
        student = db.query(models.Student).filter(
            models.Student.user_id == current_user.id
        ).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        student_id = student.id
    elif current_user.role == models.UserRole.TEACHER and not student_id and not teacher_id:
        # If teacher doesn't specify filters, show achievements they awarded
        teacher = db.query(models.Teacher).filter(
            models.Teacher.user_id == current_user.id
        ).first()
        if teacher:
            teacher_id = teacher.id

    achievements = crud.get_achievements(
        db=db,
        skip=skip,
        limit=limit,
        student_id=student_id,
        teacher_id=teacher_id
    )
    return achievements


@router.get("/{achievement_id}", response_model=schemas.AchievementResponse)
def get_achievement(
    achievement_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get a specific achievement by ID
    """
    achievement = crud.get_achievement(db, achievement_id)
    if achievement is None:
        raise HTTPException(status_code=404, detail="Achievement not found")

    # Authorization check
    if current_user.role == models.UserRole.STUDENT:
        student = db.query(models.Student).filter(
            models.Student.user_id == current_user.id
        ).first()
        if not student or achievement.student_id != student.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this achievement")

    return achievement


@router.put("/{achievement_id}", response_model=schemas.AchievementResponse)
def update_achievement(
    achievement_id: int,
    achievement: schemas.AchievementUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_teacher_user),
):
    """
    Update an achievement (Teacher/Admin only)
    """
    db_achievement = crud.get_achievement(db, achievement_id)
    if db_achievement is None:
        raise HTTPException(status_code=404, detail="Achievement not found")

    # Only the teacher who awarded it or admin can update
    if current_user.role == models.UserRole.TEACHER:
        teacher = db.query(models.Teacher).filter(
            models.Teacher.user_id == current_user.id
        ).first()
        if teacher and db_achievement.teacher_id != teacher.id:
            raise HTTPException(
                status_code=403,
                detail="You can only update achievements you awarded"
            )

    updated_achievement = crud.update_achievement(db, achievement_id, achievement)
    return updated_achievement


@router.delete("/{achievement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_achievement(
    achievement_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_teacher_user),
):
    """
    Delete an achievement (Teacher/Admin only)
    """
    db_achievement = crud.get_achievement(db, achievement_id)
    if db_achievement is None:
        raise HTTPException(status_code=404, detail="Achievement not found")

    # Only the teacher who awarded it or admin can delete
    if current_user.role == models.UserRole.TEACHER:
        teacher = db.query(models.Teacher).filter(
            models.Teacher.user_id == current_user.id
        ).first()
        if teacher and db_achievement.teacher_id != teacher.id:
            raise HTTPException(
                status_code=403,
                detail="You can only delete achievements you awarded"
            )

    success = crud.delete_achievement(db, achievement_id)
    if not success:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return None
