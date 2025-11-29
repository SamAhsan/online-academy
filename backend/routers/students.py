"""
Student management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from auth import get_current_admin_user
import schemas
import crud
import models

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.post("/", response_model=schemas.StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Create a new student (Admin only)
    """
    return crud.create_student(db=db, student=student)


@router.get("/", response_model=List[schemas.StudentWithTeacher])
def list_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    teacher_id: Optional[int] = None,
    fee_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Get list of students with optional filtering (Admin only)
    """
    students = crud.get_students(
        db=db, skip=skip, limit=limit, teacher_id=teacher_id, fee_status=fee_status
    )

    # Add teacher name to response
    result = []
    for student in students:
        student_dict = student.__dict__
        if student.teacher:
            student_dict["teacher_name"] = student.teacher.name
        else:
            student_dict["teacher_name"] = None
        result.append(student_dict)

    return result


@router.get("/{student_id}", response_model=schemas.StudentWithTeacher)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Get a specific student by ID (Admin only)
    """
    db_student = crud.get_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    student_dict = db_student.__dict__
    if db_student.teacher:
        student_dict["teacher_name"] = db_student.teacher.name
    else:
        student_dict["teacher_name"] = None

    return student_dict


@router.put("/{student_id}", response_model=schemas.StudentResponse)
def update_student(
    student_id: int,
    student: schemas.StudentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Update a student (Admin only)
    """
    db_student = crud.update_student(db, student_id=student_id, student=student)
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return db_student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Delete a student (Admin only)
    """
    success = crud.delete_student(db, student_id=student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
    return None
