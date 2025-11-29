"""
Database models for the Online Academy Management System
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    """User roles enum"""
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"


class FeeStatus(str, enum.Enum):
    """Fee payment status enum"""
    PAID = "paid"
    UNPAID = "unpaid"


class TeacherStatus(str, enum.Enum):
    """Teacher status enum"""
    ACTIVE = "active"
    INACTIVE = "inactive"


class User(Base):
    """User model for authentication"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.TEACHER)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    teacher = relationship("Teacher", back_populates="user")


class Teacher(Base):
    """Teacher model"""
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    subject = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    status = Column(Enum(TeacherStatus), default=TeacherStatus.ACTIVE)
    user_id = Column(Integer, nullable=True)  # Link to User table
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    students = relationship("Student", back_populates="teacher")
    lessons = relationship("Lesson", back_populates="teacher")
    user = relationship("User", back_populates="teacher", uselist=False)
    achievements = relationship("Achievement", back_populates="teacher")


class Student(Base):
    """Student model"""
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    parent_contact = Column(String, nullable=True)
    teams_id = Column(String, nullable=True, index=True)
    assigned_teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    schedule = Column(String, nullable=True)  # e.g., "Mon-Wed-Fri 3:00 PM"
    fee_amount = Column(Float, default=0.0)
    fee_status = Column(Enum(FeeStatus), default=FeeStatus.UNPAID)
    notes = Column(Text, nullable=True)
    user_id = Column(Integer, nullable=True)  # Link to User table
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    teacher = relationship("Teacher", back_populates="students")
    lessons = relationship("Lesson", back_populates="student")
    payments = relationship("Payment", back_populates="student")
    achievements = relationship("Achievement", back_populates="student")


class Lesson(Base):
    """Lesson tracking model"""
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration = Column(Integer, default=30)  # Duration in minutes
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="lessons")
    teacher = relationship("Teacher", back_populates="lessons")


class Payment(Base):
    """Payment tracking model"""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    month = Column(String, nullable=False, index=True)  # Format: "2024-01"
    amount = Column(Float, nullable=False)
    status = Column(Enum(FeeStatus), default=FeeStatus.UNPAID)
    paid_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="payments")


class Achievement(Base):
    """Achievement/Award tracking model"""
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    title = Column(String, nullable=False)  # e.g., "Excellent Performance", "Perfect Attendance"
    description = Column(Text, nullable=True)  # Additional details
    icon = Column(String, default="trophy")  # Icon name for display (trophy, star, medal, etc.)
    color = Column(String, default="yellow")  # Color theme (yellow, blue, green, purple, etc.)
    awarded_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="achievements")
    teacher = relationship("Teacher", back_populates="achievements")


class Message(Base):
    """Chat message model for teacher-student communication"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)  # For filtering
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)  # For filtering
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
    student = relationship("Student")
    teacher = relationship("Teacher")
