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

# Configure CORS - allow frontend URL from settings
allowed_origins = [
    "http://localhost:5173",  # local dev
    settings.frontend_url,     # configured frontend URL
]

# Add any additional origins from environment (comma-separated)
import os
extra_origins = os.getenv("EXTRA_CORS_ORIGINS", "")
if extra_origins:
    allowed_origins.extend([origin.strip() for origin in extra_origins.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
from .routers import tasks, away_periods, auth

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(away_periods.router, prefix="/api/away-periods", tags=["away-periods"])

# TODO: Add more routers as they're implemented
# from .routers import streaks, calendar, gym, pomodoro
