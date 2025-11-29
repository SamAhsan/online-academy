"""
Dashboard API endpoints for statistics and analytics
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from datetime import date, datetime
from database import get_db
from auth import get_current_admin_user, get_current_teacher_user, get_current_student_user
import schemas
import models
import crud

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Get dashboard statistics (Admin only)
    """
    # Total students
    total_students = db.query(models.Student).count()

    # Total teachers
    total_teachers = db.query(models.Teacher).count()

    # Active teachers
    active_teachers = (
        db.query(models.Teacher)
        .filter(models.Teacher.status == models.TeacherStatus.ACTIVE)
        .count()
    )

    # Students with unpaid fees
    unpaid_students = (
        db.query(models.Student)
        .filter(models.Student.fee_status == models.FeeStatus.UNPAID)
        .count()
    )

    # Students without Microsoft Teams ID
    students_without_teams_id = (
        db.query(models.Student)
        .filter(
            models.Student.teams_id.is_(None) | (models.Student.teams_id == "")
        )
        .count()
    )

    # Lessons today
    today = date.today()
    lessons_today = (
        db.query(models.Lesson)
        .filter(func.date(models.Lesson.date) == today)
        .count()
    )

    # Lessons this month
    current_year = today.year
    current_month = today.month
    lessons_this_month = (
        db.query(models.Lesson)
        .filter(
            and_(
                extract("year", models.Lesson.date) == current_year,
                extract("month", models.Lesson.date) == current_month,
            )
        )
        .count()
    )

    # Monthly revenue (current month)
    current_month_str = f"{current_year}-{current_month:02d}"

    # Total revenue (paid)
    total_revenue = (
        db.query(func.sum(models.Payment.amount))
        .filter(
            and_(
                models.Payment.month == current_month_str,
                models.Payment.status == models.FeeStatus.PAID,
            )
        )
        .scalar()
        or 0.0
    )

    # Pending revenue (unpaid)
    pending_revenue = (
        db.query(func.sum(models.Payment.amount))
        .filter(
            and_(
                models.Payment.month == current_month_str,
                models.Payment.status == models.FeeStatus.UNPAID,
            )
        )
        .scalar()
        or 0.0
    )

    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "active_teachers": active_teachers,
        "unpaid_students": unpaid_students,
        "students_without_teams_id": students_without_teams_id,
        "lessons_today": lessons_today,
        "lessons_this_month": lessons_this_month,
        "total_revenue_this_month": total_revenue,
        "pending_revenue_this_month": pending_revenue,
    }


@router.get("/teacher-hours", response_model=list[schemas.TeacherDailyHours])
def get_teacher_daily_hours(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Get daily hours for all teachers (today) (Admin only)
    """
    today = date.today()
    teachers = crud.get_teachers(db)

    result = []
    for teacher in teachers:
        daily_hours = crud.get_teacher_daily_hours(db, teacher.id, today)
        result.append(
            {
                "teacher_id": teacher.id,
                "teacher_name": teacher.name,
                "date": str(today),
                "total_hours": daily_hours,
            }
        )

    return result


@router.get("/student-history", response_model=list[schemas.StudentLessonHistory])
def get_student_lesson_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """
    Get lesson history for all students (Admin only)
    """
    students = crud.get_students(db)

    result = []
    for student in students:
        total_lessons = crud.count_lessons(db, student_id=student.id)
        lessons = crud.get_lessons(db, student_id=student.id, limit=1000)
        total_minutes = sum(lesson.duration for lesson in lessons)
        total_hours = total_minutes / 60.0

        result.append(
            {
                "student_id": student.id,
                "student_name": student.name,
                "total_lessons": total_lessons,
                "total_hours": total_hours,
            }
        )

    return result


@router.get("/teacher/me")
def get_teacher_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_teacher_user),
):
    """
    Get teacher's own dashboard data
    Returns students, lessons, and hours for the logged-in teacher
    """
    from fastapi import HTTPException

    # Find teacher profile by user_id
    teacher_profile = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()

    if not teacher_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher profile not found"
        )

    teacher_id = teacher_profile.id

    # Get teacher's students
    students = crud.get_students(db, teacher_id=teacher_id, limit=100)
    students_list = []
    for student in students:
        students_list.append({
            "id": student.id,
            "name": student.name,
            "parent_contact": student.parent_contact,
            "teams_id": student.teams_id,
            "fee_status": student.fee_status.value,
            "user_id": student.user_id,
        })

    # Get teacher's lessons
    lessons = crud.get_lessons(db, teacher_id=teacher_id, limit=100)
    lessons_list = []
    for lesson in lessons:
        student = crud.get_student(db, lesson.student_id)
        lessons_list.append({
            "id": lesson.id,
            "student_id": lesson.student_id,
            "student_name": student.name if student else "Unknown",
            "start_time": lesson.start_time.isoformat(),
            "end_time": lesson.end_time.isoformat() if lesson.end_time else None,
            "duration": lesson.duration,
        })

    # Calculate hours
    today = date.today()
    daily_hours = crud.get_teacher_daily_hours(db, teacher_id, today)
    monthly_hours = crud.get_teacher_monthly_hours(db, teacher_id, today.year, today.month)

    # Calculate weekly hours
    from datetime import timedelta
    week_ago = today - timedelta(days=7)
    weekly_lessons = crud.get_lessons(db, teacher_id=teacher_id, start_date=week_ago, end_date=today)
    weekly_minutes = sum(lesson.duration for lesson in weekly_lessons)
    weekly_hours = weekly_minutes / 60.0

    return {
        "teacher_id": teacher_id,
        "teacher_name": teacher_profile.name,
        "students": students_list,
        "lessons": lessons_list,
        "daily_hours": daily_hours,
        "weekly_hours": weekly_hours,
        "monthly_hours": monthly_hours,
    }


@router.get("/student/me")
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_student_user),
):
    """
    Get student's own dashboard data
    Returns lessons, payments, and statistics for the logged-in student
    """
    from fastapi import HTTPException

    # Find student profile by user_id
    student_profile = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()

    if not student_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    student_id = student_profile.id

    # Get student's lessons
    lessons = crud.get_lessons(db, student_id=student_id, limit=100)
    lessons_list = []
    total_minutes = 0
    for lesson in lessons:
        teacher = crud.get_teacher(db, lesson.teacher_id)
        lessons_list.append({
            "id": lesson.id,
            "teacher_id": lesson.teacher_id,
            "teacher_name": teacher.name if teacher else "Unknown",
            "start_time": lesson.start_time.isoformat(),
            "end_time": lesson.end_time.isoformat() if lesson.end_time else None,
            "duration": lesson.duration,
        })
        if lesson.duration:
            total_minutes += lesson.duration

    total_hours = total_minutes / 60.0
    total_lessons = len(lessons)

    # Calculate attendance rate (completed lessons / total lessons)
    completed_lessons = sum(1 for lesson in lessons if lesson.end_time)
    attendance_rate = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0

    # Get student's payments
    payments = crud.get_payments(db, student_id=student_id, limit=100)
    payments_list = []
    for payment in payments:
        payments_list.append({
            "id": payment.id,
            "month": payment.month,
            "amount": payment.amount,
            "status": payment.status.value,
            "paid_date": payment.paid_date.isoformat() if payment.paid_date else None,
        })

    # Get assigned teacher info
    assigned_teacher_name = None
    assigned_teacher_id = None
    teacher_user_id = None
    if student_profile.assigned_teacher_id:
        teacher = crud.get_teacher(db, student_profile.assigned_teacher_id)
        if teacher:
            assigned_teacher_name = teacher.name
            assigned_teacher_id = teacher.id
            teacher_user_id = teacher.user_id

    return {
        "student_id": student_id,
        "student_name": student_profile.name,
        "total_lessons": total_lessons,
        "total_hours": total_hours,
        "attendance_rate": attendance_rate,
        "fee_status": student_profile.fee_status.value,
        "assigned_teacher_name": assigned_teacher_name,
        "assigned_teacher_id": assigned_teacher_id,
        "teacher_user_id": teacher_user_id,
        "lessons": lessons_list,
        "payments": payments_list,
    }
