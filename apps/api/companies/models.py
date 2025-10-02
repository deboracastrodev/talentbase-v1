"""
Companies models module.
Provides CompanyProfile model for hiring companies.
"""

from django.db import models

from authentication.models import User
from core.models import BaseModel


class CompanyProfile(BaseModel):
    """
    Company profile for hiring sales talent.

    Tracks company information including CNPJ, industry, size, and contact details.

    Attributes:
        user: OneToOne relationship to User (nullable if created by admin)
        company_name: Company's legal or trade name
        cnpj: Brazilian company tax ID (to be encrypted in future)
        website: Company website URL
        industry: Industry/sector (e.g., SaaS, Fintech)
        size: Company size by employee count
        description: Company description
        contact_person_name: Responsible person's name
        contact_person_email: Responsible person's email
        contact_person_phone: Responsible person's phone
        created_by_admin: Whether profile was created by admin
    """

    SIZE_CHOICES = [
        ("1-10", "1-10 funcionários"),
        ("11-50", "11-50 funcionários"),
        ("51-200", "51-200 funcionários"),
        ("201+", "Mais de 200 funcionários"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="company_profile",
        help_text="Usuário associado (null se criado por admin)",
    )
    company_name = models.CharField(max_length=200, help_text="Razão social ou nome fantasia")
    cnpj = models.CharField(
        max_length=255, help_text="CNPJ (será encriptado)"
    )  # TODO: Add encryption via django-encrypted-model-fields
    website = models.URLField(help_text="Site da empresa")
    industry = models.CharField(max_length=100, help_text="Setor/indústria (ex: SaaS, Fintech)")
    size = models.CharField(max_length=20, choices=SIZE_CHOICES, help_text="Tamanho da empresa")
    description = models.TextField(blank=True, help_text="Descrição da empresa")
    contact_person_name = models.CharField(max_length=200, help_text="Nome do responsável")
    contact_person_email = models.EmailField(help_text="Email do responsável")
    contact_person_phone = models.CharField(max_length=20, help_text="Telefone do responsável")
    created_by_admin = models.BooleanField(
        default=False, help_text="True se criado por admin, False se self-registered"
    )

    class Meta:
        db_table = "company_profiles"
        verbose_name = "Perfil de Empresa"
        verbose_name_plural = "Perfis de Empresas"
        indexes = [
            models.Index(fields=["industry"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self) -> str:
        """Return string representation of company profile."""
        return self.company_name
