"""
Simple admin user creation using bcrypt directly
"""
from database import SessionLocal, Base, engine
import models
import bcrypt

# Create tables
Base.metadata.create_all(bind=engine)

# Create admin
db = SessionLocal()
try:
    # Check if exists
    existing = db.query(models.User).filter(models.User.username == "admin").first()

    if existing:
        print("Admin user already exists!")
        print("Username: admin")
    else:
        # Hash password using bcrypt directly
        password = b"admin123"
        hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')

        # Create user
        admin = models.User(
            username="admin",
            email="admin@academy.com",
            hashed_password=hashed,
            role=models.UserRole.ADMIN
        )

        db.add(admin)
        db.commit()

        print("=" * 60)
        print("ADMIN USER CREATED SUCCESSFULLY!")
        print("=" * 60)
        print("Username: admin")
        print("Password: admin123")
        print("=" * 60)
        print("\nYou can now start the server: python main.py")
        print("Then open: http://localhost:3000")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
