"""
Tests for admin manual candidate creation (Story 3.3.5).

Test coverage:
- Admin creates candidate successfully (with and without email)
- Email already exists validation
- Non-admin cannot create candidate
- Set password with valid token
- Set password with expired token
- Set password with invalid token
"""

import uuid
from datetime import timedelta
from unittest.mock import patch

import pytest
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from authentication.models import User
from candidates.models import CandidateProfile


@pytest.mark.django_db
class TestAdminCreateCandidate:
    """Tests for admin manual candidate creation endpoint."""

    def setup_method(self):
        """Set up test fixtures."""
        self.client = APIClient()

        # Create admin user
        self.admin = User.objects.create_user(
            email="admin@test.com", password="admin123", role="admin"
        )

        # Create non-admin user
        self.candidate = User.objects.create_user(
            email="candidate@test.com", password="cand123", role="candidate"
        )

    def test_admin_creates_candidate_without_email(self):
        """
        Test: Admin creates candidate successfully without sending welcome email.
        Story 3.3.5 - AC 8, 9, 12: User and CandidateProfile created, no email sent.
        """
        self.client.force_authenticate(user=self.admin)

        data = {
            "email": "newcandidate@test.com",
            "full_name": "João Silva",
            "phone": "11999999999",
            "city": "São Paulo",
            "current_position": "SDR/BDR",
            "send_welcome_email": False,
        }

        response = self.client.post(
            "/api/v1/candidates/admin/candidates/create", data, format="json"
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert response.data["email_sent"] is False
        assert response.data["candidate"]["email"] == "newcandidate@test.com"

        # Verify User created
        user = User.objects.get(email="newcandidate@test.com")
        assert user.role == "candidate"
        assert user.password_reset_required is False
        assert user.password_reset_token is None

        # Verify CandidateProfile created
        profile = CandidateProfile.objects.get(user=user)
        assert profile.full_name == "João Silva"
        assert profile.phone == "11999999999"
        # Field import_source will be added in future migration

    @patch("core.tasks.send_admin_created_candidate_welcome_email")
    def test_admin_creates_candidate_with_email(self, mock_email_task):
        """
        Test: Admin creates candidate and sends welcome email.
        Story 3.3.5 - AC 8, 9, 10, 12: User created with reset token, email queued.
        """
        self.client.force_authenticate(user=self.admin)

        data = {
            "email": "newcandidate2@test.com",
            "full_name": "Maria Santos",
            "phone": "11988888888",
            "city": "Rio de Janeiro",
            "send_welcome_email": True,
        }

        response = self.client.post(
            "/api/v1/candidates/admin/candidates/create", data, format="json"
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert response.data["email_sent"] is True

        # Verify User created with reset fields
        user = User.objects.get(email="newcandidate2@test.com")
        assert user.password_reset_required is True
        assert user.password_reset_token is not None
        assert user.password_reset_token_expires is not None

        # Verify email task was called
        mock_email_task.delay.assert_called_once_with(str(user.id))

    def test_admin_creates_duplicate_email_fails(self):
        """
        Test: Creating candidate with existing email returns 400.
        Story 3.3.5 - AC 15: Duplicate email validation.
        """
        # Create existing user
        User.objects.create_user(
            email="existing@test.com", password="pass123", role="candidate"
        )

        self.client.force_authenticate(user=self.admin)

        data = {
            "email": "existing@test.com",
            "full_name": "Duplicate User",
            "phone": "11977777777",
        }

        response = self.client.post(
            "/api/v1/candidates/admin/candidates/create", data, format="json"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data
        assert "already exists" in str(response.data["email"]).lower()

    def test_non_admin_cannot_create_candidate(self):
        """
        Test: Non-admin user cannot create candidates.
        Story 3.3.5 - AC 7: IsAdmin permission required.
        """
        self.client.force_authenticate(user=self.candidate)

        data = {
            "email": "test@test.com",
            "full_name": "Test User",
            "phone": "11966666666",
        }

        response = self.client.post(
            "/api/v1/candidates/admin/candidates/create", data, format="json"
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_creates_candidate_with_all_fields(self):
        """
        Test: Admin can create candidate with ALL optional fields.
        Story 3.3.5 (Extended): Full profile creation with all CandidateProfile fields.
        """
        self.client.force_authenticate(user=self.admin)

        data = {
            # Required fields
            "email": "fullprofile@test.com",
            "full_name": "Candidato Completo",
            "phone": "11999999999",
            "city": "São Paulo",
            # Basic optional fields
            "linkedin": "https://linkedin.com/in/fullprofile",
            "cpf": "12345678901",
            "zip_code": "01310-100",
            "profile_photo_url": "https://s3.amazonaws.com/talentbase/photo.jpg",
            # Professional fields
            "current_position": "SDR/BDR",
            "years_of_experience": 5,
            "sales_type": "Outbound",
            "sales_cycle": "30-60 dias",
            "avg_ticket": "R$ 10k-50k MRR",
            "academic_degree": "Ensino Superior Completo",
            "bio": "Profissional de vendas com 5 anos de experiência em tech",
            # Skills (JSON fields)
            "top_skills": ["Negociação", "Prospecção", "Cold Call"],
            "tools_software": ["Salesforce", "HubSpot", "Apollo.io"],
            "solutions_sold": ["SaaS B2B", "Fintech"],
            "departments_sold_to": ["C-Level", "Marketing", "Vendas"],
            "languages": [
                {"name": "Português", "level": "Nativo"},
                {"name": "Inglês", "level": "Fluente"}
            ],
            # Work preferences
            "work_model": "remote",
            "relocation_availability": "Sim",
            "travel_availability": "Sim semanalmente",
            "accepts_pj": True,
            "pcd": False,
            "is_pcd": False,
            "position_interest": "Account Executive",
            "minimum_salary": "8000.00",
            "salary_notes": "Flexível para pacote completo",
            "has_drivers_license": True,
            "has_vehicle": False,
            # Video pitch
            "pitch_video_url": "https://youtube.com/watch?v=test",
            "pitch_video_type": "youtube",
            # Admin-specific fields
            "contract_signed": True,
            "interview_date": "2025-10-15",
            # CSV/Notion experience fields
            "active_prospecting_experience": "Entre 3 e 5 anos",
            "inbound_qualification_experience": "Entre 1 e 3 anos",
            "outbound_sales_experience": "Entre 3 e 5 anos",
            # Admin option
            "send_welcome_email": False
        }

        response = self.client.post(
            "/api/v1/candidates/admin/candidates/create", data, format="json"
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert response.data["email_sent"] is False

        # Verify User created
        user = User.objects.get(email="fullprofile@test.com")
        assert user.role == "candidate"

        # Verify CandidateProfile created with ALL fields
        profile = CandidateProfile.objects.get(user=user)

        # Basic fields
        assert profile.full_name == "Candidato Completo"
        assert profile.phone == "11999999999"
        assert profile.city == "São Paulo"
        assert profile.linkedin == "https://linkedin.com/in/fullprofile"
        assert profile.cpf == "12345678901"
        assert profile.zip_code == "01310-100"

        # Professional fields
        assert profile.current_position == "SDR/BDR"
        assert profile.years_of_experience == 5
        assert profile.sales_type == "Outbound"
        assert profile.sales_cycle == "30-60 dias"
        assert profile.academic_degree == "Ensino Superior Completo"
        assert "5 anos de experiência" in profile.bio

        # Skills
        assert "Negociação" in profile.top_skills
        assert "Salesforce" in profile.tools_software
        assert "SaaS B2B" in profile.solutions_sold
        assert "C-Level" in profile.departments_sold_to
        assert len(profile.languages) == 2
        assert profile.languages[0]["name"] == "Português"

        # Preferences
        assert profile.work_model == "remote"
        assert profile.accepts_pj is True
        assert profile.pcd is False
        assert profile.position_interest == "Account Executive"
        assert profile.minimum_salary == 8000.00
        assert profile.has_drivers_license is True
        assert profile.has_vehicle is False

        # Media
        assert "youtube.com" in profile.pitch_video_url
        assert profile.pitch_video_type == "youtube"

        # Admin fields
        assert profile.contract_signed is True
        assert str(profile.interview_date) == "2025-10-15"

        # Experience fields
        assert profile.active_prospecting_experience == "Entre 3 e 5 anos"
        assert profile.inbound_qualification_experience == "Entre 1 e 3 anos"
        assert profile.outbound_sales_experience == "Entre 3 e 5 anos"


@pytest.mark.django_db
class TestSetPasswordWithToken:
    """Tests for set password with token endpoint."""

    def setup_method(self):
        """Set up test fixtures."""
        self.client = APIClient()

    def test_set_password_with_valid_token(self):
        """
        Test: User can set password with valid token.
        Story 3.3.5 - AC 21, 22, 23: Password set, token cleared, JWT returned.
        """
        # Create user with reset token
        token = uuid.uuid4()
        user = User.objects.create_user(
            email="reset@test.com", password="temp123", role="candidate"
        )
        user.password_reset_token = token
        user.password_reset_token_expires = timezone.now() + timedelta(days=7)
        user.password_reset_required = True
        user.save()

        data = {"token": str(token), "password": "newsecurepass123"}

        response = self.client.post("/api/v1/auth/set-password", data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "access_token" in response.data
        assert response.data["user"]["email"] == "reset@test.com"

        # Verify password updated and token cleared
        user.refresh_from_db()
        assert user.check_password("newsecurepass123")
        assert user.password_reset_required is False
        assert user.password_reset_token is None
        assert user.password_reset_token_expires is None

    def test_set_password_with_expired_token(self):
        """
        Test: Expired token returns 400 error.
        Story 3.3.5 - AC 19: Token expiration validation.
        """
        # Create user with expired token
        token = uuid.uuid4()
        user = User.objects.create_user(
            email="expired@test.com", password="temp123", role="candidate"
        )
        user.password_reset_token = token
        user.password_reset_token_expires = timezone.now() - timedelta(days=1)  # Expired
        user.save()

        data = {"token": str(token), "password": "newpass123"}

        response = self.client.post("/api/v1/auth/set-password", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "invalid or expired" in str(response.data["error"]).lower()

        # Verify password NOT updated
        user.refresh_from_db()
        assert not user.check_password("newpass123")

    def test_set_password_with_invalid_token(self):
        """
        Test: Invalid token returns 400 error.
        Story 3.3.5 - AC 19: Invalid token validation.
        """
        invalid_token = uuid.uuid4()

        data = {"token": str(invalid_token), "password": "newpass123"}

        response = self.client.post("/api/v1/auth/set-password", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "invalid or expired" in str(response.data["error"]).lower()

    def test_set_password_short_password_fails(self):
        """
        Test: Password less than 8 characters fails validation.
        Story 3.3.5 - AC 20: Password minimum length validation.
        """
        token = uuid.uuid4()

        data = {"token": str(token), "password": "short"}

        response = self.client.post("/api/v1/auth/set-password", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in response.data
