"""
Tests for custom permission classes.

Story 2.4 - Task 2: Implementar permissões admin
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory

from core.permissions import IsAdmin, IsCandidate, IsCompany, IsOwner

User = get_user_model()


@pytest.fixture
def request_factory():
    """Return API request factory."""
    return APIRequestFactory()


@pytest.fixture
def admin_user(db):
    """Create admin user."""
    return User.objects.create_user(email="admin@test.com", password="admin123", role="admin")


@pytest.fixture
def candidate_user(db):
    """Create candidate user."""
    return User.objects.create_user(
        email="candidate@test.com", password="pass123", role="candidate"
    )


@pytest.fixture
def company_user(db):
    """Create company user."""
    return User.objects.create_user(email="company@test.com", password="pass123", role="company")


@pytest.mark.django_db
class TestIsAdminPermission:
    """Tests for IsAdmin permission class."""

    def test_admin_has_permission(self, request_factory, admin_user):
        """Test that admin user has permission."""
        # Arrange
        permission = IsAdmin()
        request = request_factory.get("/")
        request.user = admin_user

        # Act
        has_permission = permission.has_permission(request, None)

        # Assert
        assert has_permission is True

    def test_candidate_no_permission(self, request_factory, candidate_user):
        """Test that candidate user does not have permission."""
        # Arrange
        permission = IsAdmin()
        request = request_factory.get("/")
        request.user = candidate_user

        # Act
        has_permission = permission.has_permission(request, None)

        # Assert
        assert has_permission is False

    def test_company_no_permission(self, request_factory, company_user):
        """Test that company user does not have permission."""
        # Arrange
        permission = IsAdmin()
        request = request_factory.get("/")
        request.user = company_user

        # Act
        has_permission = permission.has_permission(request, None)

        # Assert
        assert has_permission is False

    def test_unauthenticated_no_permission(self, request_factory):
        """Test that unauthenticated user does not have permission."""
        # Arrange
        from django.contrib.auth.models import AnonymousUser

        permission = IsAdmin()
        request = request_factory.get("/")
        request.user = AnonymousUser()

        # Act
        has_permission = permission.has_permission(request, None)

        # Assert
        assert has_permission is False


@pytest.mark.django_db
class TestIsCandidatePermission:
    """Tests for IsCandidate permission class."""

    def test_candidate_has_permission(self, request_factory, candidate_user):
        """Test that candidate user has permission."""
        # Arrange
        permission = IsCandidate()
        request = request_factory.get("/")
        request.user = candidate_user

        # Act
        has_permission = permission.has_permission(request, None)

        # Assert
        assert has_permission is True

    def test_admin_no_permission(self, request_factory, admin_user):
        """Test that admin user does not have permission."""
        # Arrange
        permission = IsCandidate()
        request = request_factory.get("/")
        request.user = admin_user

        # Act
        has_permission = permission.has_permission(request, None)

        # Assert
        assert has_permission is False


@pytest.mark.django_db
class TestIsCompanyPermission:
    """Tests for IsCompany permission class."""

    def test_company_has_permission(self, request_factory, company_user):
        """Test that company user has permission."""
        # Arrange
        permission = IsCompany()
        request = request_factory.get("/")
        request.user = company_user

        # Act
        has_permission = permission.has_permission(request, None)

        # Assert
        assert has_permission is True

    def test_admin_no_permission(self, request_factory, admin_user):
        """Test that admin user does not have permission."""
        # Arrange
        permission = IsCompany()
        request = request_factory.get("/")
        request.user = admin_user

        # Act
        has_permission = permission.has_permission(request, None)

        # Assert
        assert has_permission is False


@pytest.mark.django_db
class TestIsOwnerPermission:
    """Tests for IsOwner permission class."""

    def test_owner_has_permission(self, request_factory, candidate_user):
        """Test that resource owner has permission."""
        # Arrange
        permission = IsOwner()
        request = request_factory.get("/")
        request.user = candidate_user

        # Create mock object with user attribute
        class MockObject:
            def __init__(self, user):
                self.user = user

        obj = MockObject(user=candidate_user)

        # Act
        has_permission = permission.has_object_permission(request, None, obj)

        # Assert
        assert has_permission is True

    def test_non_owner_no_permission(self, request_factory, candidate_user, admin_user):
        """Test that non-owner does not have permission."""
        # Arrange
        permission = IsOwner()
        request = request_factory.get("/")
        request.user = admin_user

        # Create mock object owned by different user
        class MockObject:
            def __init__(self, user):
                self.user = user

        obj = MockObject(user=candidate_user)

        # Act
        has_permission = permission.has_object_permission(request, None, obj)

        # Assert
        assert has_permission is False
