"""
Test health check endpoint
"""
import pytest
from django.test import Client


@pytest.mark.django_db
def test_health_check_endpoint():
    """Test that health check endpoint returns healthy status"""
    client = Client()
    response = client.get("/health/")

    assert response.status_code == 200, "Health check should return 200 OK"

    data = response.json()
    assert data["status"] == "healthy", "Status should be healthy"
    assert data["database"] == "connected", "Database should be connected"
    assert data["cache"] == "connected", "Cache should be connected"
