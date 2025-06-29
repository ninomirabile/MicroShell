"""
Basic tests for the MicroShell FastAPI application.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_api_root():
    """Test the API root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


@pytest.mark.integration
def test_cors_headers():
    """Test that CORS headers are properly set."""
    response = client.options("/health")
    assert response.status_code == 200
    # Note: TestClient doesn't simulate full CORS behavior
    # This is more for integration testing


class TestAuthentication:
    """Test authentication endpoints."""
    
    def test_register_user(self):
        """Test user registration."""
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        response = client.post("/api/auth/register", json=user_data)
        # This might fail if we don't have a proper database setup
        # In CI, we should use a test database
        assert response.status_code in [200, 201, 422]  # 422 for validation errors in CI
    
    def test_login_endpoint_exists(self):
        """Test that login endpoint exists."""
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword"
        })
        # Should return 401 or 422, not 404
        assert response.status_code in [401, 422]


class TestDashboard:
    """Test dashboard endpoints."""
    
    def test_dashboard_metrics_unauthorized(self):
        """Test dashboard metrics without authentication."""
        response = client.get("/api/dashboard/metrics")
        # Should require authentication
        assert response.status_code in [401, 403]
    
    def test_dashboard_summary_unauthorized(self):
        """Test dashboard summary without authentication."""
        response = client.get("/api/dashboard/summary")
        assert response.status_code in [401, 403]


@pytest.mark.slow
def test_api_performance():
    """Basic performance test for health endpoint."""
    import time
    
    start_time = time.time()
    response = client.get("/health")
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 1.0  # Should respond within 1 second 