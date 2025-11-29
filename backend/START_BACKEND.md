# How to Start Backend Manually

## Quick Start (Every Time)

```bash
# 1. Navigate to backend folder
cd "c:\Users\Ahsan\Online Acadmey\backend"

# 2. Activate virtual environment
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# 3. Start the server
python main.py
```

That's it! The server will start on **http://localhost:8000**

---

## First Time Setup (One Time Only)

If you haven't set up yet:

```bash
# 1. Navigate to backend folder
cd "c:\Users\Ahsan\Online Acadmey\backend"

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create .env file
# Windows:
copy .env.example .env
# Mac/Linux:
cp .env.example .env

# 6. Create database and admin user
python create_admin.py

# 7. Start the server
python main.py
```

---

## Check if Server is Running

Open your browser and go to:
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

---

## Stop the Server

Press **Ctrl+C** in the terminal where the server is running

---

## Troubleshooting

### Virtual environment not activated?
You should see `(venv)` at the start of your command prompt:
```
(venv) PS C:\Users\Ahsan\Online Acadmey\backend>
```

If not, activate it:
```bash
venv\Scripts\activate
```

### Port 8000 already in use?
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (use PID from above)
taskkill /PID <PID> /F
```

### Module not found errors?
```bash
pip install -r requirements.txt
```

### Database file not found?
```bash
python create_admin.py
```

---

## Useful Commands

```bash
# Check Python version
python --version

# Check installed packages
pip list

# Update a specific package
pip install --upgrade <package-name>

# Check if server is responding
curl http://localhost:8000/health
```