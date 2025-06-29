"""
Authentication schemas for JWT tokens and user authentication.
Pydantic models for login, registration, and token management.
"""

from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class UserLogin(BaseModel):
    """Schema for user login request."""
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    """Schema for user registration request."""
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if not v.isalnum():
            raise ValueError('Username must contain only alphanumeric characters')
        return v

class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds

class TokenData(BaseModel):
    """Schema for token data extraction."""
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str

class PasswordChangeRequest(BaseModel):
    """Schema for password change request."""
    current_password: str
    new_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError('New password must be at least 6 characters long')
        return v 