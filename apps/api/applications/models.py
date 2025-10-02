"""
Applications models module.
Provides Application model for candidate job applications.
"""

from django.db import models

from authentication.models import User
from candidates.models import CandidateProfile
from core.models import BaseModel
from jobs.models import JobPosting


class Application(BaseModel):
    """
    Job application linking candidate to job posting.

    Can be created by candidate (self-application) or admin (matching).

    Attributes:
        job: ForeignKey to JobPosting
        candidate: ForeignKey to CandidateProfile
        status: Application status (pending/matched/rejected)
        matched_by_admin: ForeignKey to admin User who made the match
        matched_at: Timestamp of admin match
        admin_notes: Internal notes from admin
    """

    STATUS_CHOICES = [
        ("pending", "Pendente"),
        ("matched", "Matched pelo Admin"),
        ("rejected", "Rejeitado"),
    ]

    job = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name="applications",
        help_text="Vaga para a qual se candidatou",
    )
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="applications",
        help_text="Candidato que se candidatou",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        db_index=True,
        help_text="Status da candidatura",
    )
    matched_by_admin = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="matched_applications",
        help_text="Admin que fez o match (se aplicável)",
    )
    matched_at = models.DateTimeField(
        null=True, blank=True, help_text="Data/hora do match pelo admin"
    )
    admin_notes = models.TextField(blank=True, help_text="Notas internas do admin")

    class Meta:
        db_table = "applications"
        verbose_name = "Candidatura"
        verbose_name_plural = "Candidaturas"
        unique_together = [["job", "candidate"]]  # Prevent duplicate applications
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["job", "status"]),
            models.Index(fields=["candidate", "-created_at"]),
        ]

    def __str__(self) -> str:
        """Return string representation of application."""
        return f"{self.candidate.full_name} -> {self.job.title} ({self.status})"
