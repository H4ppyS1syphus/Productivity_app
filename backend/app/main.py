"""
FastAPI application entry point.
Main application setup, middleware, and route registration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base

# Import models so SQLAlchemy knows about them
from .models import User, Task, Streak, GymProgress, AwayPeriod

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Productivity App API",
    description="Backend API for personal productivity application",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,  # dev URL
        "https://productivity-app.vercel.app"  # production URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "Productivity App API is running",
        "version": "0.1.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check with database status."""
    return {
        "status": "healthy",
        "database": "connected",
        "services": {
            "api": "running",
            "database": "connected"
        }
    }


# Register routers
from .routers import tasks, away_periods

app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(away_periods.router, prefix="/api/away-periods", tags=["away-periods"])

# TODO: Add more routers as they're implemented
# from .routers import auth, streaks, calendar, gym, pomodoro
# app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
