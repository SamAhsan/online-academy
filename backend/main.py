"""
Main FastAPI application for Online Academy Management System
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, teachers, students, lessons, payments, dashboard, achievements, messages
from signaling_server import router as signaling_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Online Academy Management System",
    description="Backend API for managing students, teachers, lessons, and payments",
    version="1.0.0",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local network testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(teachers.router)
app.include_router(students.router)
app.include_router(lessons.router)
app.include_router(payments.router)
app.include_router(dashboard.router)
app.include_router(achievements.router)
app.include_router(messages.router)
app.include_router(signaling_router)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Online Academy Management System API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
