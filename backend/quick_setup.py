"""
Quick setup script - creates admin user with default credentials
"""
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from auth import get_password_hash
import models

# Create tables
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("[OK] Tables created")

# Create admin user
db = SessionLocal()
try:
    # Check if admin exists
    existing = db.query(models.User).filter(models.User.username == "admin").first()

    if existing:
        print("[INFO] Admin user already exists")
        print("Username: admin")
        print("Use your existing password")
    else:
        # Create new admin
        password = "admin123"
        admin = models.User(
            username="admin",
            email="admin@academy.com",
            hashed_password=get_password_hash(password),
            role=models.UserRole.ADMIN
        )
        db.add(admin)
        db.commit()

        print("[OK] Admin user created!")
        print("=" * 50)
        print("LOGIN CREDENTIALS:")
        print("Username: admin")
        print("Password: admin123")
        print("=" * 50)
        print("\nIMPORTANT: Change this password after first login!")

except Exception as e:
    print(f"[ERROR] {e}")
    db.rollback()
finally:
    db.close()

print("\n[OK] Setup complete!")
print("Start the server: python main.py")
