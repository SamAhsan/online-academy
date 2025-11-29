"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import UserRole, FeeStatus, TeacherStatus


# ============= Auth Schemas =============
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[UserRole] = None


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.TEACHER
    teacher_id: Optional[int] = None


class SignupRequest(BaseModel):
    """Schema for user signup with profile information"""
    username: str
    email: EmailStr
    password: str
    role: UserRole  # teacher or student
    name: str  # Full name for profile
    phone: Optional[str] = None
    subject: Optional[str] = None  # For teachers
    parent_contact: Optional[str] = None  # For students
    teams_id: Optional[str] = None  # For students


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    teacher_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Teacher Schemas =============
class TeacherBase(BaseModel):
    name: str
    status: TeacherStatus = TeacherStatus.ACTIVE


class TeacherCreate(TeacherBase):
    subject: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    username: str  # Login username for teacher
    password: str  # Login password for teacher


class TeacherUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[TeacherStatus] = None


class TeacherResponse(TeacherBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class TeacherWithStats(TeacherResponse):
    total_students: int
    daily_hours: float
    monthly_hours: float


# ============= Student Schemas =============
class StudentBase(BaseModel):
    name: str
    parent_contact: Optional[str] = None
    teams_id: Optional[str] = None
    assigned_teacher_id: Optional[int] = None
    schedule: Optional[str] = None
    fee_amount: float = 0.0
    fee_status: FeeStatus = FeeStatus.UNPAID
    notes: Optional[str] = None


class StudentCreate(StudentBase):
    username: str  # Login username for student
    password: str  # Login password for student


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    parent_contact: Optional[str] = None
    teams_id: Optional[str] = None
    assigned_teacher_id: Optional[int] = None
    schedule: Optional[str] = None
    fee_amount: Optional[float] = None
    fee_status: Optional[FeeStatus] = None
    notes: Optional[str] = None


class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class StudentWithTeacher(StudentResponse):
    teacher_name: Optional[str] = None


# ============= Lesson Schemas =============
class LessonBase(BaseModel):
    student_id: int
    teacher_id: int
    notes: Optional[str] = None


class LessonStart(BaseModel):
    student_id: int
    teacher_id: int


class LessonEnd(BaseModel):
    lesson_id: int


class LessonCreate(LessonBase):
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: int = 30


class LessonUpdate(BaseModel):
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    notes: Optional[str] = None


class LessonResponse(BaseModel):
    id: int
    student_id: int
    teacher_id: int
    date: datetime
    start_time: datetime
    end_time: Optional[datetime]
    duration: int
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class LessonWithDetails(LessonResponse):
    student_name: str
    teacher_name: str


# ============= Payment Schemas =============
class PaymentBase(BaseModel):
    student_id: int
    month: str  # Format: "2024-01"
    amount: float
    status: FeeStatus = FeeStatus.UNPAID
    notes: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    status: Optional[FeeStatus] = None
    paid_date: Optional[datetime] = None
    notes: Optional[str] = None


class PaymentResponse(PaymentBase):
    id: int
    paid_date: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class PaymentWithStudent(PaymentResponse):
    student_name: str


# ============= Achievement Schemas =============
class AchievementBase(BaseModel):
    title: str
    description: Optional[str] = None
    icon: str = "trophy"  # trophy, star, medal, award, crown, gem
    color: str = "yellow"  # yellow, blue, green, purple, red, pink


class AchievementCreate(AchievementBase):
    student_id: int


class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class AchievementResponse(AchievementBase):
    id: int
    student_id: int
    teacher_id: int
    awarded_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class AchievementWithDetails(AchievementResponse):
    student_name: str
    teacher_name: str


# ============= Message/Chat Schemas =============
class MessageBase(BaseModel):
    message: str


class MessageCreate(MessageBase):
    receiver_id: int


class MessageResponse(MessageBase):
    id: int
    sender_id: int
    receiver_id: int
    student_id: Optional[int]
    teacher_id: Optional[int]
    is_read: bool
    sent_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class MessageWithDetails(MessageResponse):
    sender_name: str
    receiver_name: str


class ConversationSummary(BaseModel):
    """Summary of a conversation with another user"""
    user_id: int
    user_name: str
    user_role: str
    last_message: str
    last_message_time: datetime
    unread_count: int


# ============= Dashboard Schemas =============
class DashboardStats(BaseModel):
    total_students: int
    total_teachers: int
    active_teachers: int
    unpaid_students: int
    students_without_teams_id: int
    lessons_today: int
    lessons_this_month: int
    total_revenue_this_month: float
    pending_revenue_this_month: float


class TeacherDailyHours(BaseModel):
    teacher_id: int
    teacher_name: str
    date: str
    total_hours: float


class StudentLessonHistory(BaseModel):
    student_id: int
    student_name: str
    total_lessons: int
    total_hours: float


# ============= Pagination =============
class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int
