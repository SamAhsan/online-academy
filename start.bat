@echo off
echo ========================================
echo Online Academy Management System
echo ========================================
echo.
echo Starting Backend Server...
echo.

cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate

echo Checking Python dependencies...
python -m pip install -q -r requirements.txt
echo.

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo Please edit backend\.env with your settings
    echo Then run this script again
    pause
    exit
)

if not exist academy.db (
    echo Setting up database and creating demo users...
    python create_demo_users.py
    echo.
    echo Dependencies installed and database created!
    echo.
) else (
    echo Database already exists, skipping setup
)

echo.
echo Starting backend on http://localhost:8000
echo.
start cmd /k "cd /d %CD% && venv\Scripts\activate && python main.py"

cd ..\frontend

if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)

if not exist .env.local (
    echo Creating .env.local file...
    copy .env.local.example .env.local
)

echo.
echo Starting frontend on http://localhost:3000
echo.
echo Both servers will open in new windows
echo Close those windows to stop the servers
echo.

start cmd /k "cd /d %CD% && npm run dev"

echo.
echo ========================================
echo System Started!
echo ========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
pause
