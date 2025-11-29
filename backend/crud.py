"""
CRUD (Create, Read, Update, Delete) operations for database models
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, date, timedelta
from typing import List, Optional
import models
import schemas
from auth import get_password_hash


# ============= User CRUD =============
def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Create a new user"""
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        teacher_id=user.teacher_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """Get user by username"""
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """Get user by ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()


# ============= Teacher CRUD =============
def create_teacher(db: Session, teacher: schemas.TeacherCreate) -> models.Teacher:
    """Create a new teacher and associated user account"""
    # Extract username and password from request
    username = teacher.username
    password = teacher.password

    # Check if username already exists
    existing_user = get_user_by_username(db, username)
    if existing_user:
        raise ValueError(f"Username '{username}' is already taken")

    # Create teacher profile (exclude username and password from teacher model)
    teacher_data = teacher.dict(exclude={'username', 'password'})
    db_teacher = models.Teacher(**teacher_data)
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)

    # Create user account for teacher
    email = db_teacher.email if db_teacher.email else f"{username}@academy.com"
    hashed_password = get_password_hash(password)
    db_user = models.User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        role=models.UserRole.TEACHER,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Link teacher to user
    db_teacher.user_id = db_user.id
    db.commit()
    db.refresh(db_teacher)

    return db_teacher


def get_teachers(
    db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None
) -> List[models.Teacher]:
    """Get list of teachers with optional filtering"""
    query = db.query(models.Teacher)
    if status:
        query = query.filter(models.Teacher.status == status)
    return query.offset(skip).limit(limit).all()


def get_teacher(db: Session, teacher_id: int) -> Optional[models.Teacher]:
    """Get a specific teacher by ID"""
    return db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()


def update_teacher(
    db: Session, teacher_id: int, teacher: schemas.TeacherUpdate
) -> Optional[models.Teacher]:
    """Update a teacher"""
    db_teacher = get_teacher(db, teacher_id)
    if db_teacher:
        update_data = teacher.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_teacher, key, value)
        db.commit()
        db.refresh(db_teacher)
    return db_teacher


def delete_teacher(db: Session, teacher_id: int) -> bool:
    """Delete a teacher"""
    db_teacher = get_teacher(db, teacher_id)
    if db_teacher:
        db.delete(db_teacher)
        db.commit()
        return True
    return False


def get_teacher_daily_hours(db: Session, teacher_id: int, target_date: date) -> float:
    """Get total hours taught by a teacher on a specific day"""
    lessons = (
        db.query(models.Lesson)
        .filter(
            and_(
                models.Lesson.teacher_id == teacher_id,
                func.date(models.Lesson.date) == target_date,
            )
        )
        .all()
    )
    total_minutes = sum(lesson.duration for lesson in lessons)
    return total_minutes / 60.0


def get_teacher_monthly_hours(db: Session, teacher_id: int, year: int, month: int) -> float:
    """Get total hours taught by a teacher in a specific month"""
    lessons = (
        db.query(models.Lesson)
        .filter(
            and_(
                models.Lesson.teacher_id == teacher_id,
                extract("year", models.Lesson.date) == year,
                extract("month", models.Lesson.date) == month,
            )
        )
        .all()
    )
    total_minutes = sum(lesson.duration for lesson in lessons)
    return total_minutes / 60.0


# ============= Student CRUD =============
def create_student(db: Session, student: schemas.StudentCreate) -> models.Student:
    """Create a new student and associated user account"""
    # Extract username and password from request
    username = student.username
    password = student.password

    # Check if username already exists
    existing_user = get_user_by_username(db, username)
    if existing_user:
        raise ValueError(f"Username '{username}' is already taken")

    # Create student profile (exclude username and password from student model)
    student_data = student.dict(exclude={'username', 'password'})
    db_student = models.Student(**student_data)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    # Create user account for student
    email = f"{username}@academy.com"
    hashed_password = get_password_hash(password)
    db_user = models.User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        role=models.UserRole.STUDENT,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Link student to user
    db_student.user_id = db_user.id
    db.commit()
    db.refresh(db_student)

    return db_student


def get_students(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    teacher_id: Optional[int] = None,
    fee_status: Optional[str] = None,
) -> List[models.Student]:
    """Get list of students with optional filtering"""
    query = db.query(models.Student)
    if teacher_id:
        query = query.filter(models.Student.assigned_teacher_id == teacher_id)
    if fee_status:
        query = query.filter(models.Student.fee_status == fee_status)
    return query.offset(skip).limit(limit).all()


def get_student(db: Session, student_id: int) -> Optional[models.Student]:
    """Get a specific student by ID"""
    return db.query(models.Student).filter(models.Student.id == student_id).first()


def update_student(
    db: Session, student_id: int, student: schemas.StudentUpdate
) -> Optional[models.Student]:
    """Update a student"""
    db_student = get_student(db, student_id)
    if db_student:
        update_data = student.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_student, key, value)
        db.commit()
        db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: int) -> bool:
    """Delete a student"""
    db_student = get_student(db, student_id)
    if db_student:
        db.delete(db_student)
        db.commit()
        return True
    return False


def count_students(
    db: Session, teacher_id: Optional[int] = None, fee_status: Optional[str] = None
) -> int:
    """Count students with optional filtering"""
    query = db.query(models.Student)
    if teacher_id:
        query = query.filter(models.Student.assigned_teacher_id == teacher_id)
    if fee_status:
        query = query.filter(models.Student.fee_status == fee_status)
    return query.count()


# ============= Lesson CRUD =============
def create_lesson(db: Session, lesson: schemas.LessonCreate) -> models.Lesson:
    """Create a new lesson"""
    db_lesson = models.Lesson(**lesson.dict())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson


def start_lesson(db: Session, student_id: int, teacher_id: int) -> models.Lesson:
    """Start a new lesson"""
    db_lesson = models.Lesson(
        student_id=student_id, teacher_id=teacher_id, start_time=datetime.utcnow()
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson


def end_lesson(db: Session, lesson_id: int) -> Optional[models.Lesson]:
    """End a lesson and calculate duration"""
    db_lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if db_lesson and not db_lesson.end_time:
        db_lesson.end_time = datetime.utcnow()
        duration = (db_lesson.end_time - db_lesson.start_time).total_seconds() / 60
        db_lesson.duration = int(duration)
        db.commit()
        db.refresh(db_lesson)
    return db_lesson


def get_lessons(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    student_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> List[models.Lesson]:
    """Get list of lessons with optional filtering"""
    query = db.query(models.Lesson)
    if student_id:
        query = query.filter(models.Lesson.student_id == student_id)
    if teacher_id:
        query = query.filter(models.Lesson.teacher_id == teacher_id)
    if start_date:
        query = query.filter(func.date(models.Lesson.date) >= start_date)
    if end_date:
        query = query.filter(func.date(models.Lesson.date) <= end_date)
    return query.order_by(models.Lesson.date.desc()).offset(skip).limit(limit).all()


def get_lesson(db: Session, lesson_id: int) -> Optional[models.Lesson]:
    """Get a specific lesson by ID"""
    return db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()


def count_lessons(
    db: Session,
    student_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> int:
    """Count lessons with optional filtering"""
    query = db.query(models.Lesson)
    if student_id:
        query = query.filter(models.Lesson.student_id == student_id)
    if teacher_id:
        query = query.filter(models.Lesson.teacher_id == teacher_id)
    if start_date:
        query = query.filter(func.date(models.Lesson.date) >= start_date)
    if end_date:
        query = query.filter(func.date(models.Lesson.date) <= end_date)
    return query.count()


# ============= Payment CRUD =============
def create_payment(db: Session, payment: schemas.PaymentCreate) -> models.Payment:
    """Create a new payment record"""
    db_payment = models.Payment(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def get_payments(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    student_id: Optional[int] = None,
    status: Optional[str] = None,
    month: Optional[str] = None,
) -> List[models.Payment]:
    """Get list of payments with optional filtering"""
    query = db.query(models.Payment)
    if student_id:
        query = query.filter(models.Payment.student_id == student_id)
    if status:
        query = query.filter(models.Payment.status == status)
    if month:
        query = query.filter(models.Payment.month == month)
    return query.order_by(models.Payment.month.desc()).offset(skip).limit(limit).all()


def get_payment(db: Session, payment_id: int) -> Optional[models.Payment]:
    """Get a specific payment by ID"""
    return db.query(models.Payment).filter(models.Payment.id == payment_id).first()


def update_payment(
    db: Session, payment_id: int, payment: schemas.PaymentUpdate
) -> Optional[models.Payment]:
    """Update a payment"""
    db_payment = get_payment(db, payment_id)
    if db_payment:
        update_data = payment.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_payment, key, value)
        if payment.status == models.FeeStatus.PAID and not db_payment.paid_date:
            db_payment.paid_date = datetime.utcnow()
        db.commit()
        db.refresh(db_payment)
    return db_payment


def delete_payment(db: Session, payment_id: int) -> bool:
    """Delete a payment"""
    db_payment = get_payment(db, payment_id)
    if db_payment:
        db.delete(db_payment)
        db.commit()
        return True
    return False


def count_payments(
    db: Session, student_id: Optional[int] = None, status: Optional[str] = None
) -> int:
    """Count payments with optional filtering"""
    query = db.query(models.Payment)
    if student_id:
        query = query.filter(models.Payment.student_id == student_id)
    if status:
        query = query.filter(models.Payment.status == status)
    return query.count()


# ============= Achievement CRUD =============
def create_achievement(
    db: Session, achievement: schemas.AchievementCreate, teacher_id: int
) -> models.Achievement:
    """Create a new achievement/award for a student"""
    db_achievement = models.Achievement(
        **achievement.dict(),
        teacher_id=teacher_id
    )
    db.add(db_achievement)
    db.commit()
    db.refresh(db_achievement)
    return db_achievement


def get_achievements(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    student_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
) -> List[models.Achievement]:
    """Get achievements with optional filtering"""
    query = db.query(models.Achievement)
    if student_id:
        query = query.filter(models.Achievement.student_id == student_id)
    if teacher_id:
        query = query.filter(models.Achievement.teacher_id == teacher_id)
    return query.order_by(models.Achievement.awarded_date.desc()).offset(skip).limit(limit).all()


def get_achievement(db: Session, achievement_id: int) -> Optional[models.Achievement]:
    """Get a specific achievement by ID"""
    return db.query(models.Achievement).filter(models.Achievement.id == achievement_id).first()


def update_achievement(
    db: Session, achievement_id: int, achievement: schemas.AchievementUpdate
) -> Optional[models.Achievement]:
    """Update an achievement"""
    db_achievement = get_achievement(db, achievement_id)
    if db_achievement:
        update_data = achievement.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_achievement, key, value)
        db.commit()
        db.refresh(db_achievement)
    return db_achievement


def delete_achievement(db: Session, achievement_id: int) -> bool:
    """Delete an achievement"""
    db_achievement = get_achievement(db, achievement_id)
    if db_achievement:
        db.delete(db_achievement)
        db.commit()
        return True
    return False


def count_achievements(
    db: Session, student_id: Optional[int] = None, teacher_id: Optional[int] = None
) -> int:
    """Count achievements with optional filtering"""
    query = db.query(models.Achievement)
    if student_id:
        query = query.filter(models.Achievement.student_id == student_id)
    if teacher_id:
        query = query.filter(models.Achievement.teacher_id == teacher_id)
    return query.count()


# ============= Message/Chat CRUD =============
def create_message(
    db: Session, sender_id: int, receiver_id: int, message: str
) -> models.Message:
    """Create a new message"""
    # Get sender and receiver info to populate student_id and teacher_id
    sender = db.query(models.User).filter(models.User.id == sender_id).first()
    receiver = db.query(models.User).filter(models.User.id == receiver_id).first()

    student_id = None
    teacher_id = None

    # Determine student_id and teacher_id based on roles
    if sender.role == models.UserRole.STUDENT:
        student_profile = db.query(models.Student).filter(models.Student.user_id == sender_id).first()
        if student_profile:
            student_id = student_profile.id
    elif sender.role == models.UserRole.TEACHER:
        teacher_profile = db.query(models.Teacher).filter(models.Teacher.user_id == sender_id).first()
        if teacher_profile:
            teacher_id = teacher_profile.id

    if receiver.role == models.UserRole.STUDENT:
        student_profile = db.query(models.Student).filter(models.Student.user_id == receiver_id).first()
        if student_profile:
            student_id = student_profile.id
    elif receiver.role == models.UserRole.TEACHER:
        teacher_profile = db.query(models.Teacher).filter(models.Teacher.user_id == receiver_id).first()
        if teacher_profile:
            teacher_id = teacher_profile.id

    db_message = models.Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        student_id=student_id,
        teacher_id=teacher_id,
        message=message
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_messages(
    db: Session,
    user1_id: int,
    user2_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[models.Message]:
    """Get messages between two users"""
    query = db.query(models.Message).filter(
        ((models.Message.sender_id == user1_id) & (models.Message.receiver_id == user2_id)) |
        ((models.Message.sender_id == user2_id) & (models.Message.receiver_id == user1_id))
    )
    return query.order_by(models.Message.sent_at.asc()).offset(skip).limit(limit).all()


def get_conversations(db: Session, user_id: int) -> List[dict]:
    """Get all conversations for a user with summary info"""
    from sqlalchemy import func, case
    from datetime import datetime

    # Get unique conversation partners
    sent_to = db.query(models.Message.receiver_id).filter(
        models.Message.sender_id == user_id
    ).distinct()

    received_from = db.query(models.Message.sender_id).filter(
        models.Message.receiver_id == user_id
    ).distinct()

    # Combine and get unique user IDs
    partner_ids = set()
    for (partner_id,) in sent_to:
        partner_ids.add(partner_id)
    for (partner_id,) in received_from:
        partner_ids.add(partner_id)

    conversations = []
    for partner_id in partner_ids:
        # Get last message
        last_message = db.query(models.Message).filter(
            ((models.Message.sender_id == user_id) & (models.Message.receiver_id == partner_id)) |
            ((models.Message.sender_id == partner_id) & (models.Message.receiver_id == user_id))
        ).order_by(models.Message.sent_at.desc()).first()

        # Get unread count
        unread_count = db.query(models.Message).filter(
            models.Message.sender_id == partner_id,
            models.Message.receiver_id == user_id,
            models.Message.is_read == False
        ).count()

        # Get partner info
        partner = db.query(models.User).filter(models.User.id == partner_id).first()
        if partner:
            partner_name = partner.username
            # Try to get actual name from teacher/student profile
            if partner.role == models.UserRole.TEACHER:
                teacher = db.query(models.Teacher).filter(models.Teacher.user_id == partner_id).first()
                if teacher:
                    partner_name = teacher.name
            elif partner.role == models.UserRole.STUDENT:
                student = db.query(models.Student).filter(models.Student.user_id == partner_id).first()
                if student:
                    partner_name = student.name

            conversations.append({
                'user_id': partner_id,
                'user_name': partner_name,
                'user_role': partner.role.value,
                'last_message': last_message.message if last_message else '',
                'last_message_time': last_message.sent_at if last_message else None,
                'unread_count': unread_count
            })

    # Sort by last message time
    conversations.sort(key=lambda x: x['last_message_time'] if x['last_message_time'] else datetime.min, reverse=True)
    return conversations


def mark_messages_as_read(db: Session, user_id: int, partner_id: int) -> int:
    """Mark all messages from partner_id to user_id as read"""
    updated = db.query(models.Message).filter(
        models.Message.sender_id == partner_id,
        models.Message.receiver_id == user_id,
        models.Message.is_read == False
    ).update({'is_read': True})
    db.commit()
    return updated


def get_unread_count(db: Session, user_id: int) -> int:
    """Get total unread message count for a user"""
    return db.query(models.Message).filter(
        models.Message.receiver_id == user_id,
        models.Message.is_read == False
    ).count()
