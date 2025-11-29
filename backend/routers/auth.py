"""
Authentication API endpoints
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from auth import authenticate_user, create_access_token, get_current_user, get_password_hash
from config import settings
import schemas
import crud
import models
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user (basic registration)
    """
    # Check if user already exists
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Create new user
    return crud.create_user(db=db, user=user)


@router.post("/signup")
def signup(request: schemas.SignupRequest, db: Session = Depends(get_db)):
    """
    Signup - Register a new teacher or student with profile
    Creates both user account and profile (teacher/student)
    Admin can see them in the dashboard after signup
    """
    # Check if username already exists
    db_user = crud.get_user_by_username(db, username=request.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Only allow teacher and student roles for signup
    if request.role not in [models.UserRole.TEACHER, models.UserRole.STUDENT]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only teachers and students can signup. Admins must be created by system administrator.",
        )

    # Create user account
    hashed_password = get_password_hash(request.password)
    db_user = models.User(
        username=request.username,
        email=request.email,
        hashed_password=hashed_password,
        role=request.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create profile based on role
    if request.role == models.UserRole.TEACHER:
        # Create teacher profile
        teacher_profile = models.Teacher(
            name=request.name,
            subject=request.subject,
            phone=request.phone,
            email=request.email,
            user_id=db_user.id
        )
        db.add(teacher_profile)
        db.commit()
        db.refresh(teacher_profile)

    elif request.role == models.UserRole.STUDENT:
        # Create student profile
        student_profile = models.Student(
            name=request.name,
            parent_contact=request.parent_contact,
            teams_id=request.teams_id,
            fee_status=models.FeeStatus.UNPAID,
            user_id=db_user.id
        )
        db.add(student_profile)
        db.commit()
        db.refresh(student_profile)

    return {
        "message": "Signup successful! You can now login.",
        "username": db_user.username,
        "role": db_user.role.value
    }


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Login with username and password to get access token
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}


@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: schemas.UserResponse = Depends(get_current_user)):
    """
    Get current user information
    """
    return current_user


class ForgotPasswordRequest(BaseModel):
    username: str


class ResetPasswordRequest(BaseModel):
    username: str
    new_password: str


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request password reset - checks if username exists
    In a real app, this would send a reset email with a token
    For demo purposes, we'll just confirm the user exists
    """
    user = crud.get_user_by_username(db, username=request.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # In production: send email with reset token
    # For demo: just return success
    return {
        "message": "Password reset instructions sent",
        "username": request.username,
        "email": user.email
    }


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset user password
    In production, this would verify a reset token
    For demo purposes, we allow direct password reset with username
    """
    user = crud.get_user_by_username(db, username=request.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()

    return {"message": "Password reset successful"}
