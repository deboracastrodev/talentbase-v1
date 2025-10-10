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
    city = models.CharField(max_length=100, blank=True, default="", help_text="Cidade do candidato")
    profile_photo_url = models.URLField(
        blank=True, null=True, help_text="URL da foto de perfil (S3)"
    )
    # Pitch video (MANDATORY for profile completion - Story 3.1)
    pitch_video_url = models.URLField(
        blank=True,
        help_text="URL do vídeo pitch (S3 ou YouTube)",
    )
    pitch_video_type = models.CharField(
        max_length=10,
        choices=[("s3", "S3 Upload"), ("youtube", "YouTube")],
        blank=True,
        default="",
        help_text="Tipo de vídeo: upload direto (S3) ou YouTube",
    )
    # DEPRECATED: Use pitch_video_url instead
    video_url = models.URLField(
        blank=True,
        validators=[validate_youtube_url],
        help_text="URL do vídeo de apresentação no YouTube (DEPRECATED - use pitch_video_url)",
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

    # Story 3.2: Public sharing fields
    public_sharing_enabled = models.BooleanField(
        default=False,
        help_text="Compartilhamento público ativado?"
    )
    share_link_generated_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Data/hora da geração do link de compartilhamento"
    )

    # Story 3.2: Additional candidate information (from Notion layout)
    pcd = models.BooleanField(
        default=False,
        verbose_name="Pessoa com Deficiência",
        help_text="Indica se é PCD"
    )
    languages = models.JSONField(
        default=list,
        help_text="Lista de idiomas: [{'name': 'Português', 'level': 'Nativo'}, ...]"
    )
    accepts_pj = models.BooleanField(
        default=False,
        verbose_name="Aceita PJ",
        help_text="Aceita trabalhar como PJ"
    )
    travel_availability = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Disponibilidade para viagens (ex: 'Sim, semanalmente', 'Sim, eventualmente', 'Não')"
    )
    relocation = models.BooleanField(
        default=False,
        verbose_name="Disponível para mudança",
        help_text="Disponível para relocação"
    )
    work_model = models.CharField(
        max_length=20,
        choices=[
            ('remote', 'Remoto'),
            ('hybrid', 'Híbrido'),
            ('onsite', 'Presencial'),
        ],
        default='hybrid',
        help_text="Modelo de trabalho preferido"
    )
    position_interest = models.CharField(
        max_length=200,
        blank=True,
        default="",
        help_text="Posição de interesse (ex: 'Account Manager/CSM', 'SDR', 'AE')"
    )

    # Story 3.2: Experience summary (structured as per Notion layout)
    experience_summary = models.JSONField(
        default=dict,
        help_text="""
        Resumo estruturado de experiências:
        {
          "sdr": {
            "has_experience": false,
            "details": []
          },
          "sales": {
            "outbound_years": 10,
            "inbound_years": 10,
            "inside_sales_years": 10,
            "field_sales_years": 3,
            "arr_range": "60K-120K ARR",
            "sales_cycle": "1-3 meses"
          },
          "csm": {
            "retention_years": 10,
            "expansion_years": 10
          }
        }
        """
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
    company_logo_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL do logo da empresa (S3)"
    )
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
