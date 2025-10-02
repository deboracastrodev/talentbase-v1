"""
Authentication models module.
Provides custom User model with role-based access.
"""

import uuid
from typing import Optional

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """
    Custom manager for User model.

    Handles user creation with email as the primary identifier.
    """

    def create_user(self, email: str, password: Optional[str] = None, **extra_fields):
        """
        Create and return a regular user with email and password.

        Args:
            email: User's email address (used as username)
            password: User's password (will be hashed)
            **extra_fields: Additional user fields

        Returns:
            User: Created user instance

        Raises:
            ValueError: If email is not provided
        """
        if not email:
            raise ValueError("Email é obrigatório")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: Optional[str] = None, **extra_fields):
        """
        Create and return a superuser with admin privileges.

        Args:
            email: Superuser's email address
            password: Superuser's password
            **extra_fields: Additional user fields

        Returns:
            User: Created superuser instance
        """
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model using email as the unique identifier.

    Supports three roles: admin, candidate, company.
    Extends Django's AbstractBaseUser for authentication.

    Attributes:
        id: UUID primary key
        email: Unique email address (used for login)
        role: User's role in the system (admin/candidate/company)
        is_active: Whether user can log in
        is_staff: Whether user can access Django admin
        created_at: Account creation timestamp
        updated_at: Last update timestamp
    """

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("candidate", "Candidato"),
        ("company", "Empresa"),
    ]

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, help_text="Identificador único UUID"
    )
    email = models.EmailField(unique=True, db_index=True, help_text="Email único do usuário")
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, help_text="Papel do usuário no sistema"
    )
    is_active = models.BooleanField(default=True, help_text="Usuário pode fazer login?")
    is_staff = models.BooleanField(default=False, help_text="Acesso ao Django Admin")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["role"]

    objects = UserManager()

    class Meta:
        db_table = "users"
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"

    def __str__(self) -> str:
        """Return string representation of user."""
        return f"{self.email} ({self.get_role_display()})"
