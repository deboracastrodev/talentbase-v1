"""
Sharing service for candidate profiles.

Handles public profile sharing, token generation, and contact requests.
Story 3.2: Shareable public candidate profile.
"""

import uuid
from datetime import datetime
from typing import Optional

from django.conf import settings
from django.core import exceptions
from django.db import transaction
from django.utils import timezone

from candidates.models import CandidateProfile
from core.tasks import send_email_task


class SharingService:
    """Service for public profile sharing operations."""

    @staticmethod
    @transaction.atomic
    def generate_share_token(candidate: CandidateProfile) -> dict:
        """
        Generate or regenerate share token for candidate profile.

        Creates new UUID token, enables public sharing, and records generation time.
        Old token is automatically invalidated when new one is generated.

        Args:
            candidate: CandidateProfile instance

        Returns:
            dict: {
                'share_token': UUID string,
                'share_url': Full public URL,
                'generated_at': ISO timestamp
            }

        Raises:
            ValidationError: If profile is not complete
        """
        # Validate profile is complete (has required fields)
        if not candidate.pitch_video_url:
            raise exceptions.ValidationError(
                "Perfil deve estar completo para gerar link público. " "Vídeo pitch é obrigatório."
            )

        # Generate new token (invalidates old one)
        candidate.public_token = uuid.uuid4()
        candidate.public_sharing_enabled = True
        candidate.share_link_generated_at = timezone.now()
        candidate.save(
            update_fields=[
                "public_token",
                "public_sharing_enabled",
                "share_link_generated_at",
                "updated_at",
            ]
        )

        # Build share URL using environment variable
        base_url = settings.FRONTEND_URL or settings.BASE_URL
        share_url = f"{base_url}/share/candidate/{candidate.public_token}"

        return {
            "share_token": str(candidate.public_token),
            "share_url": share_url,
            "generated_at": candidate.share_link_generated_at.isoformat(),
        }

    @staticmethod
    @transaction.atomic
    def toggle_sharing(candidate: CandidateProfile, enabled: bool) -> bool:
        """
        Enable or disable public sharing for candidate profile.

        When disabled, public URL returns 404.
        Token remains the same, can be re-enabled anytime.

        Args:
            candidate: CandidateProfile instance
            enabled: True to enable, False to disable

        Returns:
            bool: New enabled status
        """
        candidate.public_sharing_enabled = enabled
        candidate.save(update_fields=["public_sharing_enabled", "updated_at"])

        return candidate.public_sharing_enabled

    @staticmethod
    def get_public_profile(token: str) -> Optional[CandidateProfile]:
        """
        Retrieve public candidate profile by share token.

        Returns None if token invalid or sharing disabled.

        Args:
            token: UUID share token

        Returns:
            CandidateProfile or None
        """
        try:
            candidate = (
                CandidateProfile.objects.select_related("user")
                .prefetch_related("experiences")
                .get(public_token=token, public_sharing_enabled=True, is_active=True)
            )
            return candidate
        except (CandidateProfile.DoesNotExist, ValueError, exceptions.ValidationError):
            # ValueError/ValidationError is raised when token is not a valid UUID
            return None

    @staticmethod
    def send_contact_request(
        candidate: CandidateProfile, contact_name: str, contact_email: str, message: str
    ) -> None:
        """
        Send contact request email to admin.

        Notifies admin that someone wants to contact the candidate.

        Args:
            candidate: CandidateProfile being contacted
            contact_name: Name of person making contact
            contact_email: Email of person making contact
            message: Contact message

        Raises:
            ValidationError: If email sending fails
        """
        # Get admin email from settings
        admin_email = settings.ADMIN_EMAIL

        # Email subject
        subject = f"Contato via Perfil Público: {candidate.full_name}"

        # Email context
        context = {
            "candidate_name": candidate.full_name,
            "candidate_position": candidate.current_position,
            "contact_name": contact_name,
            "contact_email": contact_email,
            "message": message,
            "profile_admin_url": f"{settings.BASE_URL}/admin/candidate/{candidate.id}",
        }

        # Send email (async via Celery)
        send_email_task.delay(
            to_email=admin_email,
            subject=subject,
            template_name="emails/candidate_contact_request.html",
            context=context,
        )
