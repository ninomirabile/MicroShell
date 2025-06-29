"""
Metrics schemas for dashboard data operations.
Pydantic models for metrics CRUD operations and responses.
"""

from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class MetricBase(BaseModel):
    """Base metric schema with common fields."""
    name: str
    type: str  # MetricType enum value
    value: float
    unit: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    tags: Optional[str] = None  # JSON string

class MetricCreate(MetricBase):
    """Schema for metric creation."""
    recorded_at: Optional[datetime] = None
    
    @validator('type')
    def validate_type(cls, v):
        allowed_types = ['performance', 'usage', 'revenue', 'users', 'system']
        if v not in allowed_types:
            raise ValueError(f'Type must be one of: {", ".join(allowed_types)}')
        return v

class MetricUpdate(BaseModel):
    """Schema for metric updates."""
    name: Optional[str] = None
    type: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    tags: Optional[str] = None
    
    @validator('type')
    def validate_type(cls, v):
        if v is not None:
            allowed_types = ['performance', 'usage', 'revenue', 'users', 'system']
            if v not in allowed_types:
                raise ValueError(f'Type must be one of: {", ".join(allowed_types)}')
        return v

class MetricResponse(MetricBase):
    """Schema for metric response."""
    id: int
    recorded_at: datetime
    created_at: datetime
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True

class MetricListResponse(BaseModel):
    """Schema for paginated metrics list response."""
    metrics: list[MetricResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

class DashboardSummary(BaseModel):
    """Schema for dashboard summary data."""
    total_users: int
    active_users: int
    total_revenue: float
    performance_score: float
    system_health: str
    recent_metrics: list[MetricResponse] 