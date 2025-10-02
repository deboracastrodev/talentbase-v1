"""Tests for authentication models."""

import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    """Tests for custom User model."""

    def test_create_user_with_email(self):
        """Test creating user with email as username."""
        user = User.objects.create_user(
            email="test@example.com", password="testpass123", role="candidate"
        )

        assert user.email == "test@example.com"
        assert user.role == "candidate"
        assert user.is_active is True
        assert user.is_staff is False
        assert user.check_password("testpass123")
        assert user.id is not None

    def test_create_user_without_email_raises_error(self):
        """Test creating user without email raises ValueError."""
        with pytest.raises(ValueError, match="Email é obrigatório"):
            User.objects.create_user(email="", password="testpass123", role="candidate")

    def test_create_superuser(self):
        """Test creating superuser with admin role."""
        superuser = User.objects.create_superuser(
            email="admin@example.com", password="adminpass123"
        )

        assert superuser.email == "admin@example.com"
        assert superuser.role == "admin"
        assert superuser.is_active is True
        assert superuser.is_staff is True
        assert superuser.is_superuser is True

    def test_user_roles(self):
        """Test all three user roles can be created."""
        admin = User.objects.create_user(email="admin@example.com", password="pass", role="admin")
        candidate = User.objects.create_user(
            email="candidate@example.com", password="pass", role="candidate"
        )
        company = User.objects.create_user(
            email="company@example.com", password="pass", role="company"
        )

        assert admin.role == "admin"
        assert candidate.role == "candidate"
        assert company.role == "company"

    def test_user_str_representation(self):
        """Test user string representation includes email and role."""
        user = User.objects.create_user(email="test@example.com", password="pass", role="candidate")

        assert str(user) == "test@example.com (Candidato)"

    def test_email_is_normalized(self):
        """Test email is normalized during user creation."""
        user = User.objects.create_user(email="TEST@EXAMPLE.COM", password="pass", role="candidate")

        assert user.email == "TEST@example.com"  # Domain lowercase
