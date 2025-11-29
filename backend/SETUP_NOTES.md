# Backend Setup Notes

## Quick Setup (Recommended)

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux

# 5. Create admin user and database
python create_admin.py

# 6. Start server
python main.py
```

## Database

- **Type:** SQLite (no installation needed!)
- **File:** `academy.db` (created automatically)
- **Location:** `backend/academy.db`

## Default Admin Credentials

After running `create_admin.py`:
- **Username:** admin
- **Password:** admin123

⚠️ **Change this password after first login!**

## Troubleshooting

### Python version issues
If you have Python 3.13, all dependencies should work.
For older Python versions (3.9-3.12), you may need to adjust package versions.

### Missing packages
```bash
pip install -r requirements.txt
```

### Database already exists
Delete `academy.db` and run `python create_admin.py` again.

### Port 8000 already in use
```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill
```

## Files

- `create_admin.py` - Simple admin user creation (recommended)
- `setup.py` - Interactive setup (has Unicode issues on Windows)
- `quick_setup.py` - Non-interactive setup (backup option)
- `main.py` - FastAPI server entry point
- `academy.db` - SQLite database (created after setup)
- `.env` - Environment variables (create from .env.example)

## Environment Variables

The `.env` file should contain:
```env
DATABASE_URL=sqlite:///./academy.db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## API Documentation

Once the server is running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health
