"""
Registration services for candidate and company users.
Implements Clean Architecture: business logic separated from presentation layer.
"""

from typing import Any

from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework.authtoken.models import Token

from authentication.models import User
from candidates.models import CandidateProfile
from companies.models import CompanyProfile


class CandidateRegistrationService:
    """
    Service for candidate user registration.

    Handles the complete registration flow:
    - User creation with role='candidate'
    - CandidateProfile creation (minimal fields)
    - Token generation
    - Welcome email queuing (async via Celery)

    Per Story 2.1 constraint dev2: Only user, full_name, phone are set during registration.
    Extended fields (CPF, LinkedIn, video, skills) are filled in Epic 3 onboarding.
    """

    @staticmethod
    @transaction.atomic
    def register_candidate(data: dict[str, Any], created_by_admin: bool = False) -> dict[str, Any]:
        """
        Register a new candidate user with minimal profile.

        Args:
            data: Registration data containing:
                - email (str): User email (unique)
                - password (str): Password (will be hashed)
                - full_name (str): Candidate full name
                - phone (str): Contact phone number
            created_by_admin (bool): If True, skip automatic welcome email

        Returns:
            dict: {
                'user': User instance,
                'profile': CandidateProfile instance,
                'token': str (auth token)
            }

        Raises:
            ValidationError: If email already exists or data is invalid
        """
        email = data.get("email")
        password = data.get("password")
        full_name = data.get("full_name")
        phone = data.get("phone")

        # Validate required fields
        if not all([email, password, full_name, phone]):
            raise ValidationError(
                "Campos obrigatórios ausentes: email, senha, nome completo, telefone"
            )

        # Check email uniqueness (will raise IntegrityError if duplicate, caught by view)
        if User.objects.filter(email=email).exists():
            raise ValidationError(f"Usuário com email {email} já existe")

        # Create User with role='candidate'
        # UserManager.create_user handles:
        # - Email normalization
        # - Password hashing (PBKDF2 per constraint security1)
        user = User.objects.create_user(email=email, password=password, role="candidate")

        # Create minimal CandidateProfile
        # Per constraint dev2: only user, full_name, phone on registration
        profile = CandidateProfile.objects.create(
            user=user,
            full_name=full_name,
            phone=phone
            # Extended fields (cpf, linkedin, current_position, etc.) filled in onboarding
        )

        # Generate auth token
        token, _ = Token.objects.get_or_create(user=user)

        # Queue welcome email (async via Celery)
        # Story 2.7 - AC2: Email de confirmação de registro de candidato
        # Per constraint email3: Only send for self-service registration
        if not created_by_admin:
            # Import here to avoid circular dependency
            from core.tasks import send_email_task

            send_email_task.delay(
                template_name="candidate_registration",
                context={
                    "candidate_name": full_name,
                    "email": email,
                    "dashboard_url": "https://www.salesdog.click/candidate/profile",
                },
                recipient_email=email,
                subject="Bem-vindo ao TalentBase!",
            )

        return {"user": user, "profile": profile, "token": token.key}


class CompanyRegistrationService:
    """
    Service for company user registration.

    Handles the complete company registration flow:
    - User creation with role='company', is_active=False (pending approval)
    - CompanyProfile creation with all company details
    - Token generation
    - Two email notifications (company + admin) queued via Celery

    Per Story 2.2 constraints:
    - approval1: User.is_active=False until admin approves
    - approval2: User.role='company'
    - email1: Two emails (company notification + admin notification)
    - email2: Emails sent asynchronously via Celery
    """

    @staticmethod
    @transaction.atomic
    def register_company(data: dict[str, Any], created_by_admin: bool = False) -> dict[str, Any]:
        """
        Register a new company user with full profile.

        Args:
            data: Registration data containing:
                - email (str): User email (unique)
                - password (str): Password (will be hashed)
                - company_name (str): Company name
                - cnpj (str): Cleaned CNPJ (digits only)
                - website (str): Company website
                - contact_person_name (str): Contact person's name
                - contact_person_email (str): Contact person's email
                - contact_person_phone (str): Contact person's phone
                - industry (str, optional): Industry/sector
                - size (str, optional): Company size
                - description (str, optional): Company description
            created_by_admin (bool): If True, user is active immediately; else pending approval

        Returns:
            dict: {
                'user': User instance,
                'profile': CompanyProfile instance,
                'token': str (auth token)
            }

        Raises:
            ValidationError: If email already exists or data is invalid
        """
        email = data.get("email")
        password = data.get("password")
        company_name = data.get("company_name")
        cnpj = data.get("cnpj")
        website = data.get("website")
        contact_person_name = data.get("contact_person_name")
        contact_person_email = data.get("contact_person_email")
        contact_person_phone = data.get("contact_person_phone")

        # Optional fields
        industry = data.get("industry", "")
        size = data.get("size", "")
        description = data.get("description", "")

        # Validate required fields (website and contact_person_email are optional per AC2)
        if not all(
            [email, password, company_name, cnpj, contact_person_name, contact_person_phone]
        ):
            raise ValidationError("Campos obrigatórios ausentes")

        # Check email uniqueness
        if User.objects.filter(email=email).exists():
            raise ValidationError(f"Usuário com email {email} já existe")

        # Per constraint approval1: is_active=False for pending approval (unless created by admin)
        # Per constraint approval2: role='company'
        user = User.objects.create_user(
            email=email,
            password=password,
            role="company",
            is_active=created_by_admin,  # False for self-registration, True if admin creates
        )

        # Create CompanyProfile with all fields
        # Per AC2: website and contact_person_email are optional, default to main email if not provided
        profile = CompanyProfile.objects.create(
            user=user,
            company_name=company_name,
            cnpj=cnpj,  # Already validated and cleaned by serializer
            website=website or "",
            contact_person_name=contact_person_name,
            contact_person_email=contact_person_email or email,  # Default to main email
            contact_person_phone=contact_person_phone,
            industry=industry,
            size=size,
            description=description,
            created_by_admin=created_by_admin,
        )

        # Generate auth token
        token, _ = Token.objects.get_or_create(user=user)

        # Story 2.7 - AC2: Email de registro de empresa enviado
        # Per constraint email1 & email2: Queue async email via Celery
        # Only send for self-service registration
        if not created_by_admin:
            from core.tasks import send_email_task

            # Format CNPJ for display
            cnpj_formatted = (
                f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}"
                if cnpj and len(cnpj) == 14
                else cnpj
            )

            # Email 1: Company notification (AC7)
            send_email_task.delay(
                template_name="company_registration_submitted",
                context={
                    "contact_name": contact_person_name,
                    "company_name": company_name,
                    "email": email,
                    "cnpj": cnpj_formatted,
                },
                recipient_email=email,
                subject="Cadastro Recebido - Aguardando Aprovação",
            )

            # TODO: Email 2: Admin notification (AC8) - Implement in future story
            # Will require admin notification template and settings.ADMIN_EMAIL

        return {"user": user, "profile": profile, "token": token.key}
