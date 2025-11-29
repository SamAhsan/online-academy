# Backend API - Online Academy Management System

FastAPI-based REST API for the Online Academy Management System.

## Quick Start

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up database:**
```bash
# Create PostgreSQL database
createdb academy_db

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials
```

4. **Run the server:**
```bash
python main.py
```

Server will start at: http://localhost:8000
API Documentation: http://localhost:8000/docs

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration settings
├── database.py          # Database connection
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── crud.py              # Database CRUD operations
├── auth.py              # Authentication utilities
├── routers/             # API route handlers
│   ├── auth.py          # Authentication endpoints
│   ├── students.py      # Student management
│   ├── teachers.py      # Teacher management
│   ├── lessons.py       # Lesson tracking
│   ├── payments.py      # Payment management
│   └── dashboard.py     # Dashboard analytics
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get token | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Students
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/students/` | List students | Admin |
| POST | `/api/students/` | Create student | Admin |
| GET | `/api/students/{id}` | Get student | Admin |
| PUT | `/api/students/{id}` | Update student | Admin |
| DELETE | `/api/students/{id}` | Delete student | Admin |

### Teachers
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/teachers/` | List teachers | Admin |
| POST | `/api/teachers/` | Create teacher | Admin |
| GET | `/api/teachers/{id}` | Get teacher | Admin |
| GET | `/api/teachers/{id}/stats` | Get statistics | Admin |
| PUT | `/api/teachers/{id}` | Update teacher | Admin |
| DELETE | `/api/teachers/{id}` | Delete teacher | Admin |

### Lessons
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/lessons/` | List lessons | Teacher/Admin |
| POST | `/api/lessons/start` | Start lesson | Teacher/Admin |
| POST | `/api/lessons/end` | End lesson | Teacher/Admin |
| POST | `/api/lessons/` | Create lesson | Teacher/Admin |
| GET | `/api/lessons/{id}` | Get lesson | Teacher/Admin |

### Payments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/payments/` | List payments | Admin |
| POST | `/api/payments/` | Create payment | Admin |
| GET | `/api/payments/{id}` | Get payment | Admin |
| PUT | `/api/payments/{id}` | Update payment | Admin |
| DELETE | `/api/payments/{id}` | Delete payment | Admin |
| POST | `/api/payments/{id}/mark-paid` | Mark as paid | Admin |

### Dashboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/stats` | Get statistics | Admin |
| GET | `/api/dashboard/teacher-hours` | Get teacher hours | Admin |
| GET | `/api/dashboard/student-history` | Get student history | Admin |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Getting a Token
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Using the Token
Include the token in the Authorization header:
```bash
curl -X GET "http://localhost:8000/api/students/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## Database Models

### User
- Stores user credentials and roles
- Roles: `admin`, `teacher`
- Linked to teacher record if role is teacher

### Teacher
- Teacher information and status
- Related to students and lessons

### Student
- Student details and fee information
- Linked to assigned teacher
- Related to lessons and payments

### Lesson
- Lesson tracking with start/end times
- Automatic duration calculation
- Linked to student and teacher

### Payment
- Monthly fee tracking
- Payment status and dates
- Linked to student

## Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## Production Deployment

### Using Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

### Using Docker
```bash
docker build -t academy-api .
docker run -p 8000:8000 academy-api
```

## Environment Variables

Required environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/academy_db

# JWT Settings
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Database Migrations

The application uses Alembic for database migrations.

```bash
# Initialize Alembic (already done)
alembic init alembic

# Create a migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "detail": "Error message here"
}
```

## Performance Considerations

- Database queries use SQLAlchemy ORM with lazy loading
- Pagination available on list endpoints (skip/limit parameters)
- Filtering supported on most endpoints
- Connection pooling enabled for database

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS middleware configured
- Input validation with Pydantic
- SQL injection protection via ORM
- Role-based access control

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request
