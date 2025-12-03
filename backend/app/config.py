"""
Application configuration using Pydantic settings.
Loads environment variables from .env file.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "sqlite:///./productivity_app.db"

    # Security
    secret_key: str = "temporary-dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days (7 * 24 * 60)

    # Google OAuth2 (optional - will use dummy values if not provided)
    google_client_id: Optional[str] = "placeholder"
    google_client_secret: Optional[str] = "placeholder"
    google_redirect_uri: Optional[str] = "http://localhost:3000/auth/callback"


    # Application URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"

    # LLM Configuration
    llm_provider: str = "openai"  # "openai" or "anthropic"
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    llm_model: str = "gpt-4o-mini"  # or "claude-3-5-sonnet-20241022"
    llm_temperature: float = 0.7
    llm_max_tokens: int = 1000

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
