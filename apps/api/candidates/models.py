"""
Candidates models module.
Provides CandidateProfile and Experience models for sales talent management.
"""

import uuid

from django.core.exceptions import ValidationError
from django.db import models

from authentication.models import User
from core.models import BaseModel


def validate_youtube_url(value: str) -> None:
    """
    Validate that URL is from YouTube.

    Args:
        value: URL string to validate

    Raises:
        ValidationError: If URL is not from YouTube (youtube.com or youtu.be)
    """
    if value and "youtube.com" not in value and "youtu.be" not in value:
        raise ValidationError(
            "URL deve ser do YouTube (youtube.com ou youtu.be)", code="invalid_youtube_url"
        )


class CandidateProfile(BaseModel):
    """
    Complete candidate profile with sales-specific data.

    Tracks comprehensive information about sales professionals including
    position, experience, skills, tools, and career history.

    Attributes:
        user: OneToOne relationship to User model
        full_name: Candidate's full name
        phone: Contact phone number
        cpf: Brazilian tax ID (to be encrypted in future)
        linkedin: LinkedIn profile URL
        video_url: YouTube presentation video URL
        current_position: Current sales position (SDR/BDR, AE/Closer, CSM)
        years_of_experience: Years in sales
        sales_type: Type of sales (Inbound, Outbound, Both)
        sales_cycle: Typical sales cycle duration
        avg_ticket: Average ticket size
        top_skills: List of key skills (JSONB)
        tools_software: List of mastered tools (JSONB)
        solutions_sold: List of solution types sold (JSONB)
        departments_sold_to: List of departments sold to (JSONB)
        bio: Professional bio/summary
        status: Availability status
        is_public: Whether profile is publicly visible
        public_token: UUID token for public profile URL
    """

    POSITION_CHOICES = [
        ("SDR/BDR", "SDR/BDR"),
        ("AE/Closer", "Account Executive/Closer"),
        ("CSM", "Customer Success Manager"),
    ]

    STATUS_CHOICES = [
        ("available", "Disponível"),
        ("inactive", "Inativo"),
        ("no_contract", "Sem Contrato"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="candidate_profile",
        help_text="Usuário associado ao perfil",
    )
    full_name = models.CharField(max_length=200, help_text="Nome completo do candidato")
    phone = models.CharField(max_length=20, help_text="Telefone de contato")
    # Fields below are optional on registration - filled during onboarding (Epic 3)
    cpf = models.CharField(
        max_length=255, blank=True, default="", help_text="CPF (será encriptado)"
    )  # TODO: Add encryption via django-encrypted-model-fields
    linkedin = models.URLField(blank=True, default="", help_text="URL do perfil LinkedIn")
    video_url = models.URLField(
        blank=True,
        validators=[validate_youtube_url],
        help_text="URL do vídeo de apresentação no YouTube",
    )
    current_position = models.CharField(
        max_length=50,
        choices=POSITION_CHOICES,
        db_index=True,
        blank=True,
        default="",
        help_text="Posição atual na carreira de vendas",
    )
    years_of_experience = models.PositiveIntegerField(
        null=True, blank=True, help_text="Anos de experiência em vendas"
    )
    sales_type = models.CharField(
        max_length=50, blank=True, help_text="Tipo de vendas: Inbound, Outbound, Both"
    )
    sales_cycle = models.CharField(
        max_length=100, blank=True, help_text="Ciclo de vendas típico (ex: 30-60 dias)"
    )
    avg_ticket = models.CharField(
        max_length=100, blank=True, help_text="Ticket médio (ex: R$ 10k-50k MRR)"
    )
    top_skills = models.JSONField(
        default=list, help_text="Lista de habilidades principais (ex: ['Outbound', 'Negociação'])"
    )
    tools_software = models.JSONField(
        default=list, help_text="Ferramentas dominadas (ex: ['Salesforce', 'HubSpot'])"
    )
    solutions_sold = models.JSONField(
        default=list, help_text="Soluções vendidas (ex: ['SaaS B2B', 'Fintech'])"
    )
    departments_sold_to = models.JSONField(
        default=list, help_text="Departamentos para quem vendeu (ex: ['C-Level', 'Marketing'])"
    )
    bio = models.TextField(blank=True, help_text="Bio/resumo profissional")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="available",
        db_index=True,
        help_text="Status de disponibilidade",
    )
    is_public = models.BooleanField(default=False, help_text="Perfil visível publicamente?")
    public_token = models.UUIDField(
        default=uuid.uuid4, unique=True, db_index=True, help_text="Token para URL pública do perfil"
    )

    class Meta:
        db_table = "candidate_profiles"
        verbose_name = "Perfil de Candidato"
        verbose_name_plural = "Perfis de Candidatos"
        indexes = [
            models.Index(fields=["current_position", "status"]),
            models.Index(fields=["status", "-created_at"]),
        ]

    def __str__(self) -> str:
        """Return string representation of candidate profile."""
        return f"{self.full_name} ({self.current_position})"


class Experience(BaseModel):
    """
    Professional experience history for candidates.

    Tracks work history with company details, position, dates, and responsibilities.

    Attributes:
        candidate: ForeignKey to CandidateProfile
        company_name: Name of the company
        position: Job title/position held
        start_date: Employment start date
        end_date: Employment end date (null if current job)
        responsibilities: Description of responsibilities and achievements
    """

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="experiences",
        help_text="Candidato dono desta experiência",
    )
    company_name = models.CharField(max_length=200, help_text="Nome da empresa")
    position = models.CharField(max_length=200, help_text="Cargo ocupado")
    start_date = models.DateField(help_text="Data de início")
    end_date = models.DateField(
        null=True, blank=True, help_text="Data de término (null se emprego atual)"
    )
    responsibilities = models.TextField(blank=True, help_text="Responsabilidades e conquistas")

    class Meta:
        db_table = "experiences"
        verbose_name = "Experiência Profissional"
        verbose_name_plural = "Experiências Profissionais"
        ordering = ["-start_date"]
        indexes = [
            models.Index(fields=["candidate", "-start_date"]),
        ]

    def __str__(self) -> str:
        """Return string representation of experience."""
        return f"{self.candidate.full_name} - {self.company_name} ({self.position})"
