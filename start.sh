#!/bin/bash

echo "========================================"
echo "Online Academy Management System"
echo "========================================"
echo ""
echo "Starting Backend Server..."
echo ""

cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Checking Python dependencies..."
python -m pip install -q -r requirements.txt
echo ""

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo ""
    echo "Please edit backend/.env with your settings"
    echo "Then run this script again"
    exit 1
fi

if [ ! -f "academy.db" ]; then
    echo "Setting up database and creating demo users..."
    python create_demo_users.py
    echo ""
    echo "Dependencies installed and database created!"
    echo ""
else
    echo "Database already exists, skipping setup"
fi

echo ""
echo "Starting backend on http://localhost:8000"
echo ""

# Start backend in background
python main.py &
BACKEND_PID=$!

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cp .env.local.example .env.local
fi

echo ""
echo "Starting frontend on http://localhost:3000"
echo ""

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "System Started!"
echo "========================================"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
