"""
Simple FastAPI backend for testing without database
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="MicroShell Backend API - Simple Version",
    description="Simplified backend for testing without database",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://localhost:4201",
        "http://localhost:4202",
        "http://localhost:4203"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "microshell-backend-simple",
        "version": "1.0.0"
    }

# Mock authentication endpoint
@app.post("/api/auth/login")
async def login():
    """Mock login endpoint."""
    return {
        "access_token": "mock-jwt-token",
        "token_type": "bearer",
        "refresh_token": "mock-refresh-token",
        "expires_in": 1800
    }

# Mock current user endpoint
@app.get("/api/auth/me")
async def get_current_user():
    """Mock current user endpoint."""
    return {
        "id": 1,
        "email": "admin@microshell.com",
        "username": "admin",
        "full_name": "Administrator",
        "role": {
            "id": 1,
            "name": "admin",
            "permissions": ["read", "write", "delete"]
        },
        "is_active": True,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }

# Mock users endpoint
@app.get("/api/users")
async def get_users():
    """Mock users endpoint."""
    return [
        {
            "id": 1,
            "email": "admin@microshell.com",
            "username": "admin",
            "fullName": "Administrator",
            "role": "admin",
            "isActive": True
        },
        {
            "id": 2,
            "email": "user@microshell.com",
            "username": "user",
            "fullName": "Test User",
            "role": "user",
            "isActive": True
        }
    ]

# Mock dashboard endpoint
@app.get("/api/dashboard/metrics")
async def get_dashboard_metrics():
    """Mock dashboard metrics endpoint."""
    return {
        "totalUsers": 1247,
        "activeSessions": 89,
        "revenue": 15420,
        "growth": 12.5
    }

# Mock reports endpoint
@app.get("/api/reports")
async def get_reports():
    """Mock reports endpoint."""
    return [
        {"name": "User Registrations", "value": 342, "percentage": 15.2},
        {"name": "Successful Logins", "value": 1567, "percentage": 8.3},
        {"name": "Active Sessions", "value": 89, "percentage": -5.1}
    ]

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "MicroShell Backend API - Simple Version",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
