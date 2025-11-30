"""
Application configuration using Pydantic settings.
Loads environment variables from .env file.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Google OAuth2
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_redirect_uri: str | None = None


    # Application URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
