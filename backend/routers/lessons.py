"""
Lesson tracking API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database import get_db
from auth import get_current_teacher_user, get_current_user
import schemas
import crud
import models

router = APIRouter(prefix="/api/lessons", tags=["Lessons"])


@router.post("/start", response_model=schemas.LessonResponse, status_code=status.HTTP_201_CREATED)
def start_lesson(
    lesson_data: schemas.LessonStart,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Start a new lesson (Teacher/Admin/Student)
    """
    # Verify student exists
    student = crud.get_student(db, lesson_data.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Verify teacher exists
    teacher = crud.get_teacher(db, lesson_data.teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    return crud.start_lesson(db=db, student_id=lesson_data.student_id, teacher_id=lesson_data.teacher_id)


@router.post("/end", response_model=schemas.LessonResponse)
def end_lesson(
    lesson_data: schemas.LessonEnd,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_teacher_user),
):
    """
    End an ongoing lesson (Teacher/Admin)
    """
    db_lesson = crud.end_lesson(db=db, lesson_id=lesson_data.lesson_id)
    if db_lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found or already ended")
    return db_lesson


@router.post("/", response_model=schemas.LessonResponse, status_code=status.HTTP_201_CREATED)
def create_lesson(
    lesson: schemas.LessonCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_teacher_user),
):
    """
    Create a lesson manually (Teacher/Admin)
    """
    return crud.create_lesson(db=db, lesson=lesson)


@router.get("/", response_model=List[schemas.LessonWithDetails])
def list_lessons(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    student_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_teacher_user),
):
    """
    Get list of lessons with optional filtering (Teacher/Admin)
    """
    lessons = crud.get_lessons(
        db=db,
        skip=skip,
        limit=limit,
        student_id=student_id,
        teacher_id=teacher_id,
        start_date=start_date,
        end_date=end_date,
    )

    # Add student and teacher names
    result = []
    for lesson in lessons:
        lesson_dict = lesson.__dict__
        lesson_dict["student_name"] = lesson.student.name if lesson.student else "Unknown"
        lesson_dict["teacher_name"] = lesson.teacher.name if lesson.teacher else "Unknown"
        result.append(lesson_dict)

    return result


@router.get("/{lesson_id}", response_model=schemas.LessonWithDetails)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get a specific lesson by ID (Teacher/Admin/Student)
    """
    db_lesson = crud.get_lesson(db, lesson_id=lesson_id)
    if db_lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")

    lesson_dict = db_lesson.__dict__
    lesson_dict["student_name"] = db_lesson.student.name if db_lesson.student else "Unknown"
    lesson_dict["teacher_name"] = db_lesson.teacher.name if db_lesson.teacher else "Unknown"

    return lesson_dict
