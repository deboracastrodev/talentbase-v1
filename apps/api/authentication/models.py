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


class UserStatusAudit(models.Model):
    """
    Audit log for user status changes.

    Tracks all status changes made by admins for compliance and audit purposes.
    Story 2.5 - AC9: Log de auditoria registra aprovação/rejeição.

    Attributes:
        user: User whose status was changed
        changed_by: Admin who made the change
        old_status: Previous is_active value
        new_status: New is_active value
        action_type: Type of action (approve, reject, activate, deactivate)
        reason: Optional reason for the change
        timestamp: When the change occurred
    """

    ACTION_CHOICES = [
        ("approve", "Approve"),
        ("reject", "Reject"),
        ("activate", "Activate"),
        ("deactivate", "Deactivate"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="status_audits",
        help_text="User whose status was changed",
    )
    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="status_changes_made",
        help_text="Admin who made the change",
    )
    old_status = models.BooleanField(help_text="Previous is_active value")
    new_status = models.BooleanField(help_text="New is_active value")
    action_type = models.CharField(
        max_length=20, choices=ACTION_CHOICES, help_text="Type of action performed"
    )
    reason = models.TextField(blank=True, default="", help_text="Reason for status change")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "user_status_audits"
        ordering = ["-timestamp"]
        verbose_name = "User Status Audit"
        verbose_name_plural = "User Status Audits"
        indexes = [
            models.Index(fields=["-timestamp"]),
            models.Index(fields=["user", "-timestamp"]),
        ]

    def __str__(self) -> str:
        """Return string representation of audit log."""
        return f"{self.user.email} - {self.action_type} by {self.changed_by.email if self.changed_by else 'System'} at {self.timestamp}"
