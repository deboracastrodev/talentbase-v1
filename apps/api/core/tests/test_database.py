"""
Test Django-PostgreSQL connection
"""
import pytest
from django.db import connection


@pytest.mark.django_db
def test_database_connection():
    """Test that Django can successfully connect to PostgreSQL and execute queries"""
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        assert result[0] == 1, "Database query should return 1"
