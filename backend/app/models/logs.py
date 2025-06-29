"""
Log model for system logging and audit trails.
Stores application logs, user actions, and system events.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum

from ..database import Base

class LogLevel(PyEnum):
    """Enum for log levels."""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class LogCategory(PyEnum):
    """Enum for log categories."""
    AUTH = "auth"
    USER = "user"
    SYSTEM = "system"
    API = "api"
    SECURITY = "security"
    PERFORMANCE = "performance"

class Log(Base):
    """Log model for storing application logs and audit trails."""
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(20), nullable=False, index=True)  # LogLevel enum value
    category = Column(String(50), nullable=False, index=True)  # LogCategory enum value
    message = Column(Text, nullable=False)
    
    # Context information
    source = Column(String(100))  # Source service/module
    user_id = Column(Integer, ForeignKey("users.id"))  # Optional user context
    session_id = Column(String(100))  # Session identifier
    ip_address = Column(String(45))  # IPv4/IPv6 address
    user_agent = Column(String(500))  # Browser/client info
    
    # Additional metadata
    extra_data = Column(Text)  # JSON string for additional context
    stack_trace = Column(Text)  # For error logs
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with user
    user = relationship("User")
    
    def __repr__(self):
        return f"<Log(id={self.id}, level='{self.level}', category='{self.category}', message='{self.message[:50]}...')>" 