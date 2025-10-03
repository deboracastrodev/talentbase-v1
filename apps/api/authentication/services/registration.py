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
