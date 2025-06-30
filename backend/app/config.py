"""
Configuration settings for the MicroShell Backend API
Uses Pydantic Settings for environment-based configuration management.
"""

from pydantic_settings import BaseSettings
from typing import List
import os
import secrets

class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./microshell.db"
    
    # JWT settings - NEVER hardcode in production!
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS settings for microfrontend communication
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:4200",  # Shell app
        "http://localhost:4201",  # Dashboard
        "http://localhost:4202",  # Utenti
        "http://localhost:4203",  # Report
        "http://localhost:3000",  # Alternative ports
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
    ]
    
    # Admin user creation - USE ENVIRONMENT VARIABLES IN PRODUCTION!
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@microshell.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "changeme123!")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings() 