"""
User schemas for user management operations.
Pydantic models for user CRUD operations and responses.
"""

from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime


class RoleResponse(BaseModel):
    """Schema for role response."""
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    """Schema for user creation."""
    password: str
    role_id: Optional[int] = None  # If not provided, will default to 'user' role

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username must contain only alphanumeric '
                           'characters, hyphens, and underscores')
        return v


class UserUpdate(BaseModel):
    """Schema for user updates."""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[int] = None

    @validator('username')
    def validate_username(cls, v):
        if v is not None:
            if len(v) < 3:
                raise ValueError('Username must be at least 3 characters long')
            if not v.replace('_', '').replace('-', '').isalnum():
                raise ValueError('Username must contain only alphanumeric '
                               'characters, hyphens, and underscores')
        return v


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    is_verified: bool
    role: Optional[RoleResponse] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """Schema for paginated user list response."""
    users: list[UserResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool
