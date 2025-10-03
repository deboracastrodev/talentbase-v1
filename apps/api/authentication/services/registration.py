"""
Registration services for candidate and company users.
Implements Clean Architecture: business logic separated from presentation layer.
"""

from typing import Dict, Any
from django.db import transaction
from django.core.exceptions import ValidationError
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
    def register_candidate(data: Dict[str, Any], created_by_admin: bool = False) -> Dict[str, Any]:
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
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        phone = data.get('phone')

        # Validate required fields
        if not all([email, password, full_name, phone]):
            raise ValidationError("Missing required fields: email, password, full_name, phone")

        # Check email uniqueness (will raise IntegrityError if duplicate, caught by view)
        if User.objects.filter(email=email).exists():
            raise ValidationError(f"User with email {email} already exists")

        # Create User with role='candidate'
        # UserManager.create_user handles:
        # - Email normalization
        # - Password hashing (PBKDF2 per constraint security1)
        user = User.objects.create_user(
            email=email,
            password=password,
            role='candidate'
        )

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
        # Per constraint email3: Only send for self-service registration
        if not created_by_admin:
            # Import here to avoid circular dependency
            from core.tasks import send_email_task

            send_email_task.delay(
                subject="Bem-vindo ao TalentBase!",
                message=f"Olá {full_name},\n\nSua conta foi criada com sucesso!\n\nEmail: {email}\n\nPróximos passos: Complete seu perfil em /candidate/profile",
                recipient_list=[email]
            )

        return {
            'user': user,
            'profile': profile,
            'token': token.key
        }


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
    def register_company(data: Dict[str, Any], created_by_admin: bool = False) -> Dict[str, Any]:
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
        email = data.get('email')
        password = data.get('password')
        company_name = data.get('company_name')
        cnpj = data.get('cnpj')
        website = data.get('website')
        contact_person_name = data.get('contact_person_name')
        contact_person_email = data.get('contact_person_email')
        contact_person_phone = data.get('contact_person_phone')

        # Optional fields
        industry = data.get('industry', '')
        size = data.get('size', '')
        description = data.get('description', '')

        # Validate required fields (website and contact_person_email are optional per AC2)
        if not all([email, password, company_name, cnpj,
                    contact_person_name, contact_person_phone]):
            raise ValidationError("Missing required fields")

        # Check email uniqueness
        if User.objects.filter(email=email).exists():
            raise ValidationError(f"User with email {email} already exists")

        # Per constraint approval1: is_active=False for pending approval (unless created by admin)
        # Per constraint approval2: role='company'
        user = User.objects.create_user(
            email=email,
            password=password,
            role='company',
            is_active=created_by_admin  # False for self-registration, True if admin creates
        )

        # Create CompanyProfile with all fields
        # Per AC2: website and contact_person_email are optional, default to main email if not provided
        profile = CompanyProfile.objects.create(
            user=user,
            company_name=company_name,
            cnpj=cnpj,  # Already validated and cleaned by serializer
            website=website or '',
            contact_person_name=contact_person_name,
            contact_person_email=contact_person_email or email,  # Default to main email
            contact_person_phone=contact_person_phone,
            industry=industry,
            size=size,
            description=description,
            created_by_admin=created_by_admin
        )

        # Generate auth token
        token, _ = Token.objects.get_or_create(user=user)

        # Per constraint email1 & email2: Queue two async emails via Celery
        # Only send for self-service registration
        if not created_by_admin:
            from core.tasks import send_email_task

            # Email 1: Company notification (AC7)
            send_email_task.delay(
                subject="Cadastro Recebido - Aguardando Aprovacao",
                message=f"""Ola {contact_person_name},

Obrigado por registrar {company_name} no TalentBase!

Seu cadastro foi recebido com sucesso e esta aguardando aprovacao do nosso time.

Email: {email}
CNPJ: {cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}

Voce recebera um email de confirmacao dentro de 24 horas assim que sua conta for aprovada.

Atenciosamente,
Equipe TalentBase""",
                recipient_list=[email]
            )

            # Email 2: Admin notification (AC8)
            # TODO: Replace with actual admin email from settings
            admin_email = "admin@talentbase.com"
            send_email_task.delay(
                subject=f"Nova empresa cadastrada: {company_name}",
                message=f"""Nova empresa registrada e aguardando aprovação:

Empresa: {company_name}
CNPJ: {cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}
Website: {website}
Setor: {industry or 'Não informado'}
Tamanho: {size or 'Não informado'}

Contato:
Nome: {contact_person_name}
Email: {contact_person_email}
Telefone: {contact_person_phone}

Email do usuário: {email}
User ID: {user.id}

Acesse o painel administrativo para aprovar ou rejeitar este cadastro.
""",
                recipient_list=[admin_email]
            )

        return {
            'user': user,
            'profile': profile,
            'token': token.key
        }
