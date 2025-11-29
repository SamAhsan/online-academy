# Project File Structure

Complete file structure of the Online Academy Management System.

```
Online Acadmey/
│
├── 📄 README.md                    # Main documentation
├── 📄 QUICKSTART.md               # Quick setup guide
├── 📄 DEPLOYMENT.md               # Deployment instructions
├── 📄 PROJECT_SUMMARY.md          # Project overview
├── 📄 SETUP_CHECKLIST.md          # Setup verification checklist
├── 📄 FILE_STRUCTURE.md           # This file
├── 📄 .gitignore                  # Git ignore rules
│
├── 📁 backend/                    # FastAPI Backend
│   │
│   ├── 📄 main.py                 # Application entry point
│   ├── 📄 config.py               # Configuration settings
│   ├── 📄 database.py             # Database connection & session
│   ├── 📄 models.py               # SQLAlchemy database models
│   ├── 📄 schemas.py              # Pydantic request/response schemas
│   ├── 📄 crud.py                 # Database CRUD operations
│   ├── 📄 auth.py                 # Authentication utilities & JWT
│   ├── 📄 setup.py                # Initial setup script
│   ├── 📄 requirements.txt        # Python dependencies
│   ├── 📄 alembic.ini             # Alembic configuration
│   ├── 📄 .env.example            # Environment variables template
│   ├── 📄 .env                    # Environment variables (create this)
│   ├── 📄 README.md               # Backend documentation
│   │
│   ├── 📁 routers/                # API route handlers
│   │   ├── 📄 __init__.py
│   │   ├── 📄 auth.py             # Authentication endpoints
│   │   ├── 📄 students.py         # Student management endpoints
│   │   ├── 📄 teachers.py         # Teacher management endpoints
│   │   ├── 📄 lessons.py          # Lesson tracking endpoints
│   │   ├── 📄 payments.py         # Payment management endpoints
│   │   └── 📄 dashboard.py        # Dashboard analytics endpoints
│   │
│   ├── 📁 alembic/                # Database migrations
│   │   └── 📁 versions/           # Migration files
│   │
│   └── 📁 venv/                   # Virtual environment (create this)
│
├── 📁 frontend/                   # Next.js Frontend
│   │
│   ├── 📄 package.json            # Node dependencies
│   ├── 📄 package-lock.json       # Locked dependencies
│   ├── 📄 tsconfig.json           # TypeScript configuration
│   ├── 📄 next.config.js          # Next.js configuration
│   ├── 📄 tailwind.config.js      # Tailwind CSS configuration
│   ├── 📄 postcss.config.js       # PostCSS configuration
│   ├── 📄 .env.local.example      # Environment template
│   ├── 📄 .env.local              # Environment variables (create this)
│   ├── 📄 README.md               # Frontend documentation
│   │
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📄 layout.tsx          # Root layout
│   │   ├── 📄 page.tsx            # Home page (redirects)
│   │   ├── 📄 globals.css         # Global styles
│   │   │
│   │   ├── 📁 login/              # Login page
│   │   │   └── 📄 page.tsx
│   │   │
│   │   ├── 📁 dashboard/          # Dashboard page
│   │   │   └── 📄 page.tsx
│   │   │
│   │   ├── 📁 students/           # Student management
│   │   │   └── 📄 page.tsx
│   │   │
│   │   ├── 📁 teachers/           # Teacher management
│   │   │   └── 📄 page.tsx
│   │   │
│   │   ├── 📁 lessons/            # Lesson tracking
│   │   │   └── 📄 page.tsx
│   │   │
│   │   └── 📁 payments/           # Payment management
│   │       └── 📄 page.tsx
│   │
│   ├── 📁 components/             # Reusable React components
│   │   ├── 📄 Navbar.tsx          # Navigation bar
│   │   ├── 📄 Modal.tsx           # Modal dialog
│   │   └── 📄 Loading.tsx         # Loading spinner
│   │
│   ├── 📁 lib/                    # Utility functions & helpers
│   │   ├── 📄 api.ts              # API client with Axios
│   │   └── 📄 types.ts            # TypeScript type definitions
│   │
│   ├── 📁 public/                 # Static assets
│   │   └── (images, icons, etc.)
│   │
│   └── 📁 node_modules/           # Node dependencies (npm install)
│
└── (Generated files after build)
    ├── backend/__pycache__/       # Python cache
    ├── frontend/.next/            # Next.js build output
    └── frontend/out/              # Next.js static export
```

## File Descriptions

### Root Level Files

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation with setup instructions |
| `QUICKSTART.md` | 5-minute quick start guide for beginners |
| `DEPLOYMENT.md` | Production deployment guide for VPS/cloud |
| `PROJECT_SUMMARY.md` | Complete project overview and statistics |
| `SETUP_CHECKLIST.md` | Verification checklist for setup |
| `FILE_STRUCTURE.md` | This file - project structure overview |
| `.gitignore` | Files and folders to exclude from git |

### Backend Files

#### Core Application Files

| File | Purpose | Lines |
|------|---------|-------|
| `main.py` | FastAPI app, CORS, route registration | ~60 |
| `config.py` | Environment variable configuration | ~20 |
| `database.py` | SQLAlchemy setup and session management | ~30 |
| `models.py` | Database models (User, Teacher, Student, etc.) | ~150 |
| `schemas.py` | Pydantic schemas for validation | ~200 |
| `crud.py` | Database CRUD operations | ~350 |
| `auth.py` | JWT authentication and password hashing | ~100 |
| `setup.py` | Initial setup and admin user creation | ~150 |

#### Router Files

| File | Endpoints | Purpose |
|------|-----------|---------|
| `routers/auth.py` | 3 | Authentication (register, login, me) |
| `routers/students.py` | 5 | Student CRUD operations |
| `routers/teachers.py` | 6 | Teacher CRUD + statistics |
| `routers/lessons.py` | 5 | Lesson tracking (start, end, list) |
| `routers/payments.py` | 6 | Payment CRUD + mark as paid |
| `routers/dashboard.py` | 3 | Dashboard analytics |

**Total API Endpoints: 28**

#### Configuration Files

| File | Purpose |
|------|---------|
| `requirements.txt` | Python package dependencies |
| `alembic.ini` | Database migration configuration |
| `.env.example` | Template for environment variables |
| `.env` | Actual environment variables (create manually) |

### Frontend Files

#### App Router Pages

| File | Route | Purpose |
|------|-------|---------|
| `app/page.tsx` | `/` | Home redirect page |
| `app/layout.tsx` | - | Root layout wrapper |
| `app/globals.css` | - | Global styles and Tailwind utilities |
| `app/login/page.tsx` | `/login` | Authentication page |
| `app/dashboard/page.tsx` | `/dashboard` | Dashboard with analytics |
| `app/students/page.tsx` | `/students` | Student management |
| `app/teachers/page.tsx` | `/teachers` | Teacher management |
| `app/lessons/page.tsx` | `/lessons` | Lesson tracking |
| `app/payments/page.tsx` | `/payments` | Payment management |

#### Components

| Component | Used In | Purpose |
|-----------|---------|---------|
| `Navbar.tsx` | All pages | Navigation menu with logout |
| `Modal.tsx` | Students, Teachers, Lessons, Payments | Reusable dialog for forms |
| `Loading.tsx` | All pages | Loading spinner component |

#### Library Files

| File | Purpose | Exports |
|------|---------|---------|
| `lib/api.ts` | API client | API functions for all endpoints |
| `lib/types.ts` | Type definitions | TypeScript interfaces |

#### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node dependencies and scripts |
| `tsconfig.json` | TypeScript compiler options |
| `next.config.js` | Next.js configuration |
| `tailwind.config.js` | Tailwind CSS customization |
| `postcss.config.js` | PostCSS plugins |
| `.env.local.example` | Environment template |
| `.env.local` | Frontend environment variables |

## File Sizes (Approximate)

### Backend
- Total: ~2,000 lines of Python code
- Models: 150 lines
- Schemas: 200 lines
- CRUD: 350 lines
- Routers: 800 lines
- Auth/Config: 200 lines
- Setup: 150 lines

### Frontend
- Total: ~3,000 lines of TypeScript/React code
- Pages: 2,000 lines
- Components: 400 lines
- API/Types: 400 lines
- Config: 200 lines

## Key Dependencies

### Backend (Python)
```
fastapi==0.104.1          # Web framework
uvicorn==0.24.0           # ASGI server
sqlalchemy==2.0.23        # ORM
psycopg2-binary==2.9.9    # PostgreSQL driver
pydantic==2.5.0           # Validation
python-jose==3.3.0        # JWT
passlib==4.7.4            # Password hashing
alembic==1.12.1           # Migrations
```

### Frontend (Node.js)
```
next==14.0.4              # React framework
react==18.2.0             # UI library
typescript==5.3.3         # Type safety
tailwindcss==3.3.6        # Styling
axios==1.6.2              # HTTP client
date-fns==2.30.0          # Date utilities
react-icons==4.12.0       # Icons
```

## Database Tables

```
users         → Authentication and roles
teachers      → Teacher information
students      → Student details and fees
lessons       → Lesson time tracking
payments      → Monthly payment records
```

## API Endpoints Summary

### Authentication (3)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Students (5)
- GET /api/students/
- POST /api/students/
- GET /api/students/{id}
- PUT /api/students/{id}
- DELETE /api/students/{id}

### Teachers (6)
- GET /api/teachers/
- POST /api/teachers/
- GET /api/teachers/{id}
- GET /api/teachers/{id}/stats
- PUT /api/teachers/{id}
- DELETE /api/teachers/{id}

### Lessons (5)
- GET /api/lessons/
- POST /api/lessons/start
- POST /api/lessons/end
- POST /api/lessons/
- GET /api/lessons/{id}

### Payments (6)
- GET /api/payments/
- POST /api/payments/
- GET /api/payments/{id}
- PUT /api/payments/{id}
- DELETE /api/payments/{id}
- POST /api/payments/{id}/mark-paid

### Dashboard (3)
- GET /api/dashboard/stats
- GET /api/dashboard/teacher-hours
- GET /api/dashboard/student-history

## Build Artifacts (Generated)

These are created during build/runtime:

```
backend/
├── __pycache__/          # Python bytecode cache
├── venv/                 # Virtual environment
└── alembic/versions/     # Migration files

frontend/
├── .next/                # Next.js build output
├── node_modules/         # Node dependencies
└── out/                  # Static export (if used)
```

## Environment Variables Required

### Backend (.env)
```
DATABASE_URL              # PostgreSQL connection string
SECRET_KEY                # JWT secret key
ALGORITHM                 # JWT algorithm (HS256)
ACCESS_TOKEN_EXPIRE_MINUTES  # Token expiration
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL       # Backend API URL
```

## File Permissions (Production)

```
backend/
├── *.py         (644)    # Python files
├── .env         (600)    # Environment (restricted)
└── venv/        (755)    # Virtual environment

frontend/
├── *.ts *.tsx   (644)    # TypeScript files
├── .env.local   (600)    # Environment (restricted)
└── node_modules (755)    # Dependencies
```

---

This structure provides a clean, organized, and scalable foundation for the Online Academy Management System.
