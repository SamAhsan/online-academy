"""
Setup script to create initial admin user
"""
import sys
from getpass import getpass
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from auth import get_password_hash
import models

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created successfully")

def create_admin_user():
    """Create the initial admin user"""
    db: Session = SessionLocal()

    try:
        # Check if admin already exists
        existing_admin = db.query(models.User).filter(
            models.User.username == "admin"
        ).first()

        if existing_admin:
            print("\n[WARNING] Admin user already exists!")
            overwrite = input("Do you want to create a new admin? (yes/no): ")
            if overwrite.lower() != 'yes':
                print("Setup cancelled.")
                return

        print("\n=== Create Admin User ===")
        username = input("Enter admin username (default: admin): ").strip() or "admin"
        email = input("Enter admin email (default: admin@academy.com): ").strip() or "admin@academy.com"

        while True:
            password = getpass("Enter admin password: ")
            confirm_password = getpass("Confirm password: ")

            if password == confirm_password:
                if len(password) < 6:
                    print("[WARNING] Password must be at least 6 characters long")
                    continue
                break
            else:
                print("[WARNING] Passwords do not match. Try again.")

        # Create admin user
        admin_user = models.User(
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            role=models.UserRole.ADMIN
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print(f"\n[OK] Admin user created successfully!")
        print(f"  Username: {username}")
        print(f"  Email: {email}")
        print("\n[WARNING] IMPORTANT: Keep these credentials secure!")

    except Exception as e:
        print(f"\n[ERROR] Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

def create_sample_data():
    """Create sample data for testing"""
    db: Session = SessionLocal()

    try:
        print("\n=== Creating Sample Data ===")

        # Create sample teachers
        teacher1 = models.Teacher(name="John Smith", status=models.TeacherStatus.ACTIVE)
        teacher2 = models.Teacher(name="Jane Doe", status=models.TeacherStatus.ACTIVE)
        db.add_all([teacher1, teacher2])
        db.commit()

        # Create sample students
        student1 = models.Student(
            name="Alice Johnson",
            parent_contact="+1234567890",
            teams_id="alice.j@teams.com",
            assigned_teacher_id=teacher1.id,
            schedule="Mon-Wed-Fri 3:00 PM",
            fee_amount=100.00,
            fee_status=models.FeeStatus.PAID
        )

        student2 = models.Student(
            name="Bob Williams",
            parent_contact="+0987654321",
            teams_id="bob.w@teams.com",
            assigned_teacher_id=teacher1.id,
            schedule="Tue-Thu 4:00 PM",
            fee_amount=100.00,
            fee_status=models.FeeStatus.UNPAID
        )

        student3 = models.Student(
            name="Charlie Brown",
            parent_contact="+1122334455",
            assigned_teacher_id=teacher2.id,
            schedule="Mon-Wed 2:00 PM",
            fee_amount=150.00,
            fee_status=models.FeeStatus.UNPAID
        )

        db.add_all([student1, student2, student3])
        db.commit()

        print("[OK] Sample data created:")
        print("  - 2 Teachers")
        print("  - 3 Students")
        print("\nYou can now test the system with sample data!")

    except Exception as e:
        print(f"\n[ERROR] Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main setup function"""
    print("=" * 50)
    print("Online Academy Management System - Setup")
    print("=" * 50)

    # Create tables
    create_tables()

    # Create admin user
    create_admin_user()

    # Ask if user wants sample data
    create_sample = input("\nDo you want to create sample data for testing? (yes/no): ")
    if create_sample.lower() == 'yes':
        create_sample_data()

    print("\n" + "=" * 50)
    print("Setup completed successfully!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Start the backend server: python main.py")
    print("2. Access the API documentation: http://localhost:8000/docs")
    print("3. Set up the frontend")
    print("\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] Setup failed: {e}")
        sys.exit(1)
