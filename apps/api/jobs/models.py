"""
Jobs models module.
Provides JobPosting model for job opportunities.
"""

from django.db import models

from companies.models import CompanyProfile
from core.models import BaseModel


class JobPosting(BaseModel):
    """
    Job posting published by a company.

    Tracks job requirements, responsibilities, and details for sales positions.

    Attributes:
        company: ForeignKey to CompanyProfile
        title: Job title
        position_type: Type of sales position (SDR/BDR, AE/Closer, CSM)
        seniority: Seniority level (junior, pleno, senior)
        description: Full job description
        responsibilities: Job responsibilities
        required_skills: List of required skills (JSONB)
        required_tools: List of required tools (JSONB)
        sales_cycle: Company's sales cycle
        avg_ticket: Company's average ticket
        location: Job location
        is_remote: Whether job is remote
        salary_range: Salary range
    """

    POSITION_CHOICES = [
        ("SDR/BDR", "SDR/BDR"),
        ("AE/Closer", "Account Executive/Closer"),
        ("CSM", "Customer Success Manager"),
    ]

    SENIORITY_CHOICES = [
        ("junior", "Júnior"),
        ("pleno", "Pleno"),
        ("senior", "Sênior"),
    ]

    company = models.ForeignKey(
        CompanyProfile,
        on_delete=models.CASCADE,
        related_name="jobs",
        help_text="Empresa que publicou a vaga",
    )
    title = models.CharField(max_length=200, help_text="Título da vaga")
    position_type = models.CharField(
        max_length=50, choices=POSITION_CHOICES, db_index=True, help_text="Tipo de posição"
    )
    seniority = models.CharField(
        max_length=20, choices=SENIORITY_CHOICES, help_text="Nível de senioridade"
    )
    description = models.TextField(help_text="Descrição completa da vaga")
    responsibilities = models.TextField(help_text="Responsabilidades do cargo")
    required_skills = models.JSONField(
        default=list, help_text="Habilidades requeridas (ex: ['Outbound', 'HubSpot'])"
    )
    required_tools = models.JSONField(
        default=list, help_text="Ferramentas requeridas (ex: ['Salesforce'])"
    )
    sales_cycle = models.CharField(
        max_length=100, blank=True, help_text="Ciclo de vendas da empresa"
    )
    avg_ticket = models.CharField(max_length=100, blank=True, help_text="Ticket médio da empresa")
    location = models.CharField(max_length=100, help_text="Localização da vaga")
    is_remote = models.BooleanField(default=False, help_text="Trabalho remoto?")
    salary_range = models.CharField(
        max_length=100, blank=True, help_text="Faixa salarial (ex: R$ 5k-8k)"
    )

    class Meta:
        db_table = "job_postings"
        verbose_name = "Vaga de Emprego"
        verbose_name_plural = "Vagas de Emprego"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["position_type", "is_active"]),
            models.Index(fields=["company", "-created_at"]),
            models.Index(fields=["is_active", "-created_at"]),
        ]

    def __str__(self) -> str:
        """Return string representation of job posting."""
        return f"{self.title} - {self.company.company_name}"
