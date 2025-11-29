# Quick Start with SQLite (2 Minutes!)

The **easiest way** to get started - no database installation required!

## ✅ Prerequisites

Just these two:
- ✅ Python 3.9+ (`python --version`)
- ✅ Node.js 18+ (`node --version`)

That's it! **No PostgreSQL needed!** 🎉

## ⚡ Super Quick Start (One-Click!)

**Windows users:**
```bash
start.bat
```

**Mac/Linux users:**
```bash
chmod +x start.sh
./start.sh
```

This will automatically set up everything and start both servers! 🚀

## 🚀 Manual Setup (2 Minutes)

If you prefer manual setup:

### Step 1: Backend (1 minute)

Open terminal in the project folder:

```bash
# Go to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies (SQLite is built into Python!)
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Mac/Linux: cp .env.example .env

# Run setup (creates database and admin user)
python setup.py
```

Follow the prompts to create your admin user!

### Step 2: Start Backend (10 seconds)

```bash
python main.py
```

✅ Backend running at http://localhost:8000

### Step 3: Frontend (1 minute)

Open **NEW terminal** (keep backend running):

```bash
# Go to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.local.example .env.local
# Mac/Linux: cp .env.local.example .env.local

# Start frontend
npm run dev
```

✅ Frontend running at http://localhost:3000

## 🎊 You're Done!

Open your browser to **http://localhost:3000** and login with the credentials you created!

## 📂 Your Database

Your database is now stored as a **single file**: `backend/academy.db`

- Easy to backup (just copy this file!)
- Easy to reset (delete this file and run `python setup.py` again)
- No database server needed!

## 🔄 Daily Usage

### Start the System

**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate
python main.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Stop the System

Press `Ctrl+C` in both terminals

## 📊 What's Included

✅ All features work exactly the same:
- Student management
- Teacher management
- Lesson tracking
- Payment management
- Dashboard analytics
- Authentication

The only difference is SQLite instead of PostgreSQL!

## 🔄 Backup Your Data

Your entire database is in one file: `backend/academy.db`

**Backup:**
```bash
# Just copy the file!
copy backend\academy.db backend\academy_backup.db
```

**Restore:**
```bash
# Copy it back
copy backend\academy_backup.db backend\academy.db
```

## 🚀 Upgrade to PostgreSQL Later (Optional)

If you grow and need PostgreSQL:

1. Install PostgreSQL
2. Update `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/academy_db
   ```
3. Run `python setup.py` again
4. Restart backend

## ❓ Troubleshooting

### Backend won't start?

```bash
# Make sure virtual environment is activated
# You should see (venv) in terminal

# Reinstall if needed
pip install -r requirements.txt
```

### Can't find python?

Try:
```bash
python3 -m venv venv
python3 main.py
```

### Port already in use?

Backend (port 8000):
```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill
```

Frontend (port 3000):
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

## 🎯 Next Steps

1. ✅ Login at http://localhost:3000
2. ✅ Add your first teacher
3. ✅ Add your first student
4. ✅ Track your first lesson
5. ✅ Explore the dashboard!

## 📖 Full Documentation

For more details, see:
- [README.md](README.md) - Complete documentation
- [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - Verification checklist
- API Docs: http://localhost:8000/docs

---

**That's it!** No complex database setup, just simple Python and Node.js! 🎉
