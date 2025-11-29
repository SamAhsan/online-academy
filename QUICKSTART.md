# Quick Start Guide

Get the Online Academy Management System up and running in minutes!

## Prerequisites

Before you begin, ensure you have:
- ✅ Python 3.9+ installed
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 12+ installed and running
- ✅ Git (optional, for cloning)

## 5-Minute Setup

### Step 1: Database Setup (2 minutes)

```bash
# Create PostgreSQL database
createdb academy_db

# Or using PostgreSQL command line:
psql -U postgres
CREATE DATABASE academy_db;
\q
```

### Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Edit .env file with your database credentials
# For example:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/academy_db
# SECRET_KEY=your-secret-key-here

# Run setup script to create admin user
python setup.py

# Start the server
python main.py
```

Backend is now running at **http://localhost:8000** 🎉

### Step 3: Frontend Setup (1 minute)

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local

# The default settings should work:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the development server
npm run dev
```

Frontend is now running at **http://localhost:3000** 🚀

## First Login

1. Open http://localhost:3000 in your browser
2. You'll be redirected to the login page
3. Use the credentials you created during setup
   - Default: username `admin`, password `admin123` (if you used defaults)
4. You're in! 🎊

## What's Next?

### Add Your First Teacher
1. Click "Teachers" in the navigation
2. Click "Add Teacher"
3. Enter teacher name and save

### Add Your First Student
1. Click "Students" in the navigation
2. Click "Add Student"
3. Fill in student details:
   - Name (required)
   - Parent Contact
   - Microsoft Teams ID
   - Assign a teacher
   - Set fee amount
4. Save

### Track Your First Lesson
1. Click "Lessons" in the navigation
2. Click "Start Lesson"
3. Select student and teacher
4. Click "Start Lesson"
5. When done, click "End Lesson"

The system automatically calculates the duration!

### Manage Payments
1. Click "Payments" in the navigation
2. Click "Add Payment"
3. Select student, month, and amount
4. Save
5. Mark as paid when payment is received

### View Dashboard
1. Click "Dashboard" to see:
   - Total students and teachers
   - Today's lessons
   - Revenue statistics
   - Unpaid fees alerts
   - Teacher hours

## Troubleshooting

### Backend won't start?

**Database connection error:**
```bash
# Check PostgreSQL is running
# Windows:
pg_ctl status

# Mac:
brew services list | grep postgresql

# Linux:
systemctl status postgresql
```

**Import errors:**
```bash
# Make sure virtual environment is activated
# You should see (venv) in your terminal

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend won't start?

**Port 3000 already in use:**
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

**Module not found errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't login?

1. Check backend is running (http://localhost:8000)
2. Check browser console for errors
3. Try creating a new admin user:
   ```bash
   cd backend
   python setup.py
   ```
4. Clear browser localStorage and try again

### API not connecting?

1. Verify backend URL in frontend `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
2. Check CORS settings in `backend/main.py`
3. Restart both servers

## Common Commands

### Backend
```bash
# Start server
python main.py

# Run setup
python setup.py

# Access API docs
# Open http://localhost:8000/docs
```

### Frontend
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run lint
```

## Project Structure Overview

```
Online Acadmey/
├── backend/              # FastAPI backend
│   ├── main.py          # Entry point
│   ├── models.py        # Database models
│   ├── routers/         # API endpoints
│   └── setup.py         # Setup script
├── frontend/            # Next.js frontend
│   ├── app/            # Pages
│   ├── components/     # UI components
│   └── lib/            # Utilities
└── README.md           # Documentation
```

## Next Steps

- 📖 Read the full [README.md](README.md) for detailed information
- 🔐 Change default admin password
- 👥 Add more teachers and students
- 📊 Explore the dashboard
- 💰 Set up payment tracking
- ⏱️ Start tracking lessons

## Getting Help

- Check the [README.md](README.md) for detailed docs
- Look at [backend/README.md](backend/README.md) for API docs
- Review [frontend/README.md](frontend/README.md) for UI details
- Check the API documentation at http://localhost:8000/docs

## Production Deployment

When you're ready to deploy:
1. Read [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide
2. Set up proper environment variables
3. Use production database
4. Enable HTTPS
5. Configure proper CORS

Happy teaching! 🎓
