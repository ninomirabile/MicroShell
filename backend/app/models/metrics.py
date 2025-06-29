"""
Metrics model for dashboard data and analytics.
Stores various metrics and KPIs for the dashboard microfrontend.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum

from ..database import Base

class MetricType(PyEnum):
    """Enum for different metric types."""
    PERFORMANCE = "performance"
    USAGE = "usage"
    REVENUE = "revenue"
    USERS = "users"
    SYSTEM = "system"

class Metric(Base):
    """Metric model for storing dashboard analytics data."""
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)  # MetricType enum value
    value = Column(Float, nullable=False)
    unit = Column(String(50))  # e.g., "users", "€", "%", "ms"
    description = Column(Text)
    
    # Metadata
    source = Column(String(100))  # Source system or service
    tags = Column(Text)  # JSON string for additional metadata
    
    # Timestamps
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Optional user tracking (who created this metric)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    def __repr__(self):
        return f"<Metric(id={self.id}, name='{self.name}', value={self.value}, type='{self.type}')>" 