"""
Matching models module.
Provides Ranking model for admin-assigned candidate scores.
"""

from django.db import models

from authentication.models import User
from candidates.models import CandidateProfile
from core.models import BaseModel


class Ranking(BaseModel):
    """
    Admin-assigned ranking/score for candidates.

    Tracks candidate scores and positions assigned by admin for matching purposes.

    Attributes:
        candidate: OneToOne relationship to CandidateProfile
        score: Decimal score from 0.00 to 100.00
        rank_position: Optional overall ranking position
        ranked_by: ForeignKey to admin User who assigned ranking
        ranking_notes: Notes about ranking criteria and justification
    """

    candidate = models.OneToOneField(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="ranking",
        help_text="Candidato sendo ranqueado",
    )
    score = models.DecimalField(max_digits=5, decimal_places=2, help_text="Score de 0.00 a 100.00")
    rank_position = models.PositiveIntegerField(
        null=True, blank=True, help_text="Posição geral no ranking (opcional)"
    )
    ranked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Admin que atribuiu o ranking",
    )
    ranking_notes = models.TextField(
        blank=True, help_text="Notas sobre o ranking (critérios, justificativa)"
    )

    class Meta:
        db_table = "rankings"
        verbose_name = "Ranking de Candidato"
        verbose_name_plural = "Rankings de Candidatos"
        ordering = ["-score", "rank_position"]
        indexes = [
            models.Index(fields=["-score"]),
            models.Index(fields=["rank_position"]),
        ]

    def __str__(self) -> str:
        """Return string representation of ranking."""
        return f"{self.candidate.full_name} - Score: {self.score}"
