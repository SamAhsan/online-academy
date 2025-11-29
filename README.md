# Online Academy Management System

A comprehensive web-based management system for online academies, built with Next.js and FastAPI.

## 🚀 Quick Start (Choose One)

- **Easy Setup (Recommended)**: [QUICKSTART_SQLITE.md](QUICKSTART_SQLITE.md) - **No database installation required!** Uses SQLite (2 minutes)
- **Advanced Setup**: [README.md](#installation--setup) - Uses PostgreSQL (requires database installation)

## Features

### 1. Student Management
- Add, edit, and delete students
- Track student information including:
  - Name, parent contact
  - Microsoft Teams ID
  - Assigned teacher
  - Schedule
  - Fee amount and status
  - Notes
- Filter students by teacher, fee status, or schedule
- View student lesson history

### 2. Teacher Management
- Add, edit, and delete teachers
- Track teacher status (active/inactive)
- View teacher statistics:
  - Total assigned students
  - Daily teaching hours
  - Monthly teaching hours
- Monitor teacher performance

### 3. Lesson Tracking System
- Start and end lessons with automatic time tracking
- Default 30-minute duration if lesson not manually ended
- Real-time lesson progress indicator
- Complete lesson history with filtering
- Teacher and student lesson analytics

### 4. Attendance & Hours Logging
- Teacher-wise daily, weekly, and monthly hours
- Student lesson history and total hours
- Dashboard summaries and analytics

### 5. Fee Management
- Monthly fee tracking per student
- Mark fees as paid/unpaid
- Track payment dates
- Revenue summaries (paid vs pending)
- Monthly revenue reports

### 6. Dashboard
- Overview statistics:
  - Total students and teachers
  - Active teachers count
  - Unpaid students alert
  - Students without Teams ID alert
  - Lessons today and this month
  - Monthly revenue summary
- Teacher daily hours breakdown
- Student lesson history top 10

### 7. Authentication
- Admin login with secure JWT tokens
- Role-based access control
- Protected API endpoints

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (default) or PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **API Documentation**: Auto-generated with Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Date Handling**: date-fns

## Installation & Setup

> **💡 Tip**: For the easiest setup, see [QUICKSTART_SQLITE.md](QUICKSTART_SQLITE.md) - no database installation needed!

### Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher
- **Option 1 (Easy)**: Nothing else needed! (uses SQLite)
- **Option 2 (Advanced)**: PostgreSQL 12 or higher

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

6. Configure your database in `.env`:

**Option 1 - SQLite (Easy, No Setup Required):**
```env
DATABASE_URL=sqlite:///./academy.db
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Option 2 - PostgreSQL (Advanced):**
```bash
# First create the database
createdb academy_db
```
```env
DATABASE_URL=postgresql://username:password@localhost:5432/academy_db
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

7. Run the setup script to create the database and admin user:
```bash
python setup.py
```

8. Start the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Update the `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## First-Time Setup

### Create Admin User

After starting the backend, you need to create an admin user. You can do this via the API:

**Using curl:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@academy.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Using Python requests:**
```python
import requests

response = requests.post(
    "http://localhost:8000/api/auth/register",
    json={
        "username": "admin",
        "email": "admin@academy.com",
        "password": "admin123",
        "role": "admin"
    }
)
print(response.json())
```

### Default Login Credentials
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT: Change the default credentials after first login!**

## API Documentation

Once the backend is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

#### Students
- `GET /api/students/` - List all students (with filters)
- `POST /api/students/` - Create student
- `GET /api/students/{id}` - Get student details
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

#### Teachers
- `GET /api/teachers/` - List all teachers
- `POST /api/teachers/` - Create teacher
- `GET /api/teachers/{id}` - Get teacher details
- `GET /api/teachers/{id}/stats` - Get teacher statistics
- `PUT /api/teachers/{id}` - Update teacher
- `DELETE /api/teachers/{id}` - Delete teacher

#### Lessons
- `GET /api/lessons/` - List all lessons (with filters)
- `POST /api/lessons/start` - Start a new lesson
- `POST /api/lessons/end` - End an ongoing lesson
- `POST /api/lessons/` - Create lesson manually
- `GET /api/lessons/{id}` - Get lesson details

#### Payments
- `GET /api/payments/` - List all payments (with filters)
- `POST /api/payments/` - Create payment record
- `GET /api/payments/{id}` - Get payment details
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment
- `POST /api/payments/{id}/mark-paid` - Mark payment as paid

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/teacher-hours` - Get teacher daily hours
- `GET /api/dashboard/student-history` - Get student lesson history

## Database Schema

### Users
- id, username, email, hashed_password, role, teacher_id
- created_at, updated_at

### Teachers
- id, name, status
- created_at, updated_at

### Students
- id, name, parent_contact, teams_id
- assigned_teacher_id, schedule
- fee_amount, fee_status, notes
- created_at, updated_at

### Lessons
- id, student_id, teacher_id
- date, start_time, end_time, duration
- notes, created_at, updated_at

### Payments
- id, student_id, month, amount, status
- paid_date, notes
- created_at, updated_at

## Deployment

### Backend Deployment (VPS)

1. Install dependencies on your VPS:
```bash
sudo apt update
sudo apt install python3-pip postgresql nginx
```

2. Clone your repository and set up the backend as described above

3. Install Gunicorn:
```bash
pip install gunicorn
```

4. Create a systemd service file `/etc/systemd/system/academy-api.service`:
```ini
[Unit]
Description=Academy API
After=network.target

[Service]
User=your-user
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
ExecStart=/path/to/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

5. Start the service:
```bash
sudo systemctl start academy-api
sudo systemctl enable academy-api
```

6. Configure Nginx as reverse proxy

### Frontend Deployment

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

Or use PM2:
```bash
npm install -g pm2
pm2 start npm --name "academy-frontend" -- start
pm2 save
pm2 startup
```

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Secret key for JWT encoding
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Security Considerations

1. **Change default admin credentials** immediately after setup
2. Use strong `SECRET_KEY` in production
3. Enable HTTPS in production
4. Configure CORS properly for production domains
5. Use environment variables for sensitive data
6. Regularly backup your database
7. Keep dependencies updated

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

### CORS Error
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Verify CORS settings in `backend/main.py`

### Authentication Error
- Ensure token is being stored in localStorage
- Check token expiration time
- Verify user credentials

## License

MIT License - feel free to use this project for your academy!

## Support

For issues and questions, please create an issue in the repository.
