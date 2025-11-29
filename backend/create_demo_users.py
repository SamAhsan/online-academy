"""
Create demo users: Admin, Teacher, and Student
"""
from database import SessionLocal, Base, engine
import models
import bcrypt

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    print("=" * 60)
    print("SETTING UP DEMO USERS")
    print("=" * 60)

    # 1. Create Admin User
    admin_existing = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_existing:
        password = b"admin123"
        hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
        admin = models.User(
            username="admin",
            email="admin@academy.com",
            hashed_password=hashed,
            role=models.UserRole.ADMIN
        )
        db.add(admin)
        db.commit()
        print("[OK] Admin user created")
    else:
        print("[EXISTS] Admin user already exists")

    # 2. Create Teacher User
    teacher_existing = db.query(models.User).filter(models.User.username == "teacher").first()
    if not teacher_existing:
        password = b"teacher123"
        hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
        teacher_user = models.User(
            username="teacher",
            email="teacher@academy.com",
            hashed_password=hashed,
            role=models.UserRole.TEACHER
        )
        db.add(teacher_user)
        db.commit()
        print("[OK] Teacher user created")

        # Create teacher profile
        teacher_profile = models.Teacher(
            name="John Doe",
            subject="Mathematics",
            phone="1234567890",
            email="teacher@academy.com",
            user_id=teacher_user.id
        )
        db.add(teacher_profile)
        db.commit()
        print("[OK] Teacher profile created")
    else:
        print("[EXISTS] Teacher user already exists")

    # 3. Create Student User
    student_existing = db.query(models.User).filter(models.User.username == "student").first()
    if not student_existing:
        password = b"student123"
        hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
        student_user = models.User(
            username="student",
            email="student@academy.com",
            hashed_password=hashed,
            role=models.UserRole.STUDENT
        )
        db.add(student_user)
        db.commit()
        print("[OK] Student user created")

        # Create student profile
        student_profile = models.Student(
            name="Jane Smith",
            parent_contact="9876543210",
            teams_id="student@teams.com",
            fee_status=models.FeeStatus.PAID,
            user_id=student_user.id
        )
        db.add(student_profile)
        db.commit()
        print("[OK] Student profile created")
    else:
        print("[EXISTS] Student user already exists")

    print("=" * 60)
    print("DEMO USERS SETUP COMPLETE!")
    print("=" * 60)
    print("\nLOGIN CREDENTIALS:")
    print("-" * 60)
    print("ADMIN:")
    print("  Username: admin")
    print("  Password: admin123")
    print("  Dashboard: /dashboard")
    print()
    print("TEACHER:")
    print("  Username: teacher")
    print("  Password: teacher123")
    print("  Dashboard: /teacher-dashboard")
    print()
    print("STUDENT:")
    print("  Username: student")
    print("  Password: student123")
    print("  Dashboard: /student-dashboard")
    print("=" * 60)
    print("\nYou can now start the server and login with any of these accounts!")

except Exception as e:
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()