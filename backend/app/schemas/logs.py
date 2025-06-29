"""
Logs schemas for system logging operations.
Pydantic models for log creation and responses.
"""

from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class LogBase(BaseModel):
    """Base log schema with common fields."""
    level: str  # LogLevel enum value
    category: str  # LogCategory enum value
    message: str
    source: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Optional[str] = None  # JSON string
    stack_trace: Optional[str] = None

class LogCreate(LogBase):
    """Schema for log creation."""
    user_id: Optional[int] = None
    
    @validator('level')
    def validate_level(cls, v):
        allowed_levels = ['debug', 'info', 'warning', 'error', 'critical']
        if v.lower() not in allowed_levels:
            raise ValueError(f'Level must be one of: {", ".join(allowed_levels)}')
        return v.lower()
    
    @validator('category')
    def validate_category(cls, v):
        allowed_categories = ['auth', 'user', 'system', 'api', 'security', 'performance']
        if v.lower() not in allowed_categories:
            raise ValueError(f'Category must be one of: {", ".join(allowed_categories)}')
        return v.lower()

class LogResponse(LogBase):
    """Schema for log response."""
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class LogListResponse(BaseModel):
    """Schema for paginated logs list response."""
    logs: list[LogResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

class LogStats(BaseModel):
    """Schema for log statistics."""
    total_logs: int
    error_count: int
    warning_count: int
    info_count: int
    debug_count: int
    critical_count: int
    recent_errors: list[LogResponse] 