"""
Core models module.
Provides abstract base model for all application models.

Story 2.7: Email Notification System
- EmailLog model for email monitoring and audit trail
"""

import uuid

from django.db import models


class BaseModel(models.Model):
    """
    Abstract base model com campos comuns a todos os models.

    Todos os models da aplicação (exceto User) devem herdar desta classe.
    Fornece: UUID PK, soft delete, timestamps automáticos.

    Attributes:
        id: UUID primary key (auto-generated, non-sequential for security)
        created_at: Timestamp de criação (auto-populated)
        updated_at: Timestamp de última atualização (auto-updated)
        is_active: Flag para soft delete (False = deleted)
    """

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, help_text="Identificador único UUID"
    )
    created_at = models.DateTimeField(auto_now_add=True, help_text="Data/hora de criação")
    updated_at = models.DateTimeField(auto_now=True, help_text="Data/hora da última atualização")
    is_active = models.BooleanField(
        default=True, db_index=True, help_text="Soft delete: False = deletado"
    )

    class Meta:
        abstract = True
        ordering = ["-created_at"]

    def soft_delete(self) -> None:
        """
        Perform soft delete by marking record as inactive.

        Sets is_active to False instead of deleting the record from database.
        This preserves data integrity and allows for audit trails.
        """
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])


class EmailLog(BaseModel):
    """
    Email log model for monitoring and auditing email sending.

    Story 2.7 - AC5: Falhas no envio de email logadas para revisão do admin

    Tracks all email sending attempts with status, errors, and metadata.
    Allows admins to review failures and retry if needed.

    Attributes:
        recipient: Email address of recipient
        subject: Email subject line
        template_name: Name of template used (e.g., 'candidate_registration')
        status: Current status (pending, sent, failed, skipped)
        error_message: Error details if sending failed
        sent_at: Timestamp when email was successfully sent
        task_id: Celery task ID for tracking async jobs
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("failed", "Failed"),
        ("skipped", "Skipped"),
    ]

    recipient = models.EmailField(
        max_length=255, db_index=True, help_text="Recipient email address"
    )
    subject = models.CharField(max_length=200, help_text="Email subject line")
    template_name = models.CharField(max_length=100, db_index=True, help_text="Template name used")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        db_index=True,
        help_text="Email sending status",
    )
    error_message = models.TextField(blank=True, help_text="Error message if sending failed")
    sent_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when email was sent")
    task_id = models.CharField(
        max_length=100, blank=True, db_index=True, help_text="Celery task ID"
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Email Log"
        verbose_name_plural = "Email Logs"
        indexes = [
            models.Index(fields=["-created_at", "status"]),
            models.Index(fields=["recipient", "-created_at"]),
            models.Index(fields=["template_name", "-created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.template_name} to {self.recipient} ({self.status})"
