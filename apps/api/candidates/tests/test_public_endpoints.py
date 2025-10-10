"""
Integration tests for public sharing endpoints.
Story 3.2: Public shareable candidate profile.
"""

import pytest
from unittest.mock import patch
from rest_framework.test import APIClient
from rest_framework import status

from candidates.models import CandidateProfile, Experience
from candidates.services.sharing import SharingService
from authentication.models import User


@pytest.fixture
def api_client():
    """Create API client."""
    return APIClient()


@pytest.fixture
def candidate_user(db):
    """Create a candidate user."""
    return User.objects.create_user(
        email="candidate@test.com", password="testpass123", role="candidate"
    )


@pytest.fixture
def other_candidate_user(db):
    """Create another candidate user."""
    return User.objects.create_user(
        email="other@test.com", password="testpass123", role="candidate"
    )


@pytest.fixture
def complete_profile(candidate_user):
    """Create a complete candidate profile."""
    return CandidateProfile.objects.create(
        user=candidate_user,
        full_name="João Silva",
        phone="11999999999",
        cpf="12345678900",
        city="São Paulo",
        current_position="SDR/BDR",
        years_of_experience=3,
        pitch_video_url="https://youtube.com/watch?v=test123",
        pitch_video_type="youtube",
        bio="Experienced sales professional",
        top_skills=["Outbound", "Negociação"],
        tools_software=["Salesforce", "HubSpot"],
    )


@pytest.fixture
def profile_with_experiences(complete_profile):
    """Create profile with work experiences."""
    Experience.objects.create(
        candidate=complete_profile,
        company_name="Company A",
        company_logo_url="https://logo.com/a.png",
        position="SDR",
        start_date="2020-01-01",
        end_date="2022-01-01",
    )
    Experience.objects.create(
        candidate=complete_profile, company_name="Company B", position="AE", start_date="2022-02-01"
    )
    return complete_profile


@pytest.mark.django_db
class TestGenerateShareTokenEndpoint:
    """Tests for POST /api/v1/candidates/:id/generate-share-token"""

    def test_generate_token_success(self, api_client, complete_profile, candidate_user):
        """Test successful token generation."""
        api_client.force_authenticate(user=candidate_user)

        url = f"/api/v1/candidates/{complete_profile.id}/generate-share-token"
        response = api_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert "share_token" in response.data
        assert "share_url" in response.data
        assert "generated_at" in response.data

    def test_generate_token_requires_auth(self, api_client, complete_profile):
        """Test that endpoint requires authentication."""
        url = f"/api/v1/candidates/{complete_profile.id}/generate-share-token"
        response = api_client.post(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_generate_token_ownership_check(
        self, api_client, complete_profile, other_candidate_user
    ):
        """Test that only profile owner can generate token."""
        api_client.force_authenticate(user=other_candidate_user)

        url = f"/api/v1/candidates/{complete_profile.id}/generate-share-token"
        response = api_client.post(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "your own profile" in response.data["error"].lower()

    def test_generate_token_profile_not_found(self, api_client, candidate_user):
        """Test 404 for non-existent profile."""
        api_client.force_authenticate(user=candidate_user)

        url = "/api/v1/candidates/99999/generate-share-token"
        response = api_client.post(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_generate_token_incomplete_profile(self, api_client, candidate_user):
        """Test error when profile is incomplete."""
        incomplete_profile = CandidateProfile.objects.create(
            user=candidate_user,
            full_name="Maria Santos",
            phone="11988888888",
            # Missing pitch_video_url
        )
        api_client.force_authenticate(user=candidate_user)

        url = f"/api/v1/candidates/{incomplete_profile.id}/generate-share-token"
        response = api_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "completo" in response.data["error"].lower()


@pytest.mark.django_db
class TestToggleSharingEndpoint:
    """Tests for PATCH /api/v1/candidates/:id/toggle-sharing"""

    def test_toggle_sharing_enable(self, api_client, complete_profile, candidate_user):
        """Test enabling sharing."""
        api_client.force_authenticate(user=candidate_user)

        url = f"/api/v1/candidates/{complete_profile.id}/toggle-sharing"
        response = api_client.patch(url, {"enabled": True}, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["public_sharing_enabled"] is True

    def test_toggle_sharing_disable(self, api_client, complete_profile, candidate_user):
        """Test disabling sharing."""
        # First enable it
        SharingService.generate_share_token(complete_profile)

        api_client.force_authenticate(user=candidate_user)

        url = f"/api/v1/candidates/{complete_profile.id}/toggle-sharing"
        response = api_client.patch(url, {"enabled": False}, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["public_sharing_enabled"] is False

    def test_toggle_sharing_requires_auth(self, api_client, complete_profile):
        """Test that endpoint requires authentication."""
        url = f"/api/v1/candidates/{complete_profile.id}/toggle-sharing"
        response = api_client.patch(url, {"enabled": True}, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_toggle_sharing_ownership_check(
        self, api_client, complete_profile, other_candidate_user
    ):
        """Test that only profile owner can toggle sharing."""
        api_client.force_authenticate(user=other_candidate_user)

        url = f"/api/v1/candidates/{complete_profile.id}/toggle-sharing"
        response = api_client.patch(url, {"enabled": True}, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_toggle_sharing_missing_enabled_field(
        self, api_client, complete_profile, candidate_user
    ):
        """Test error when 'enabled' field is missing."""
        api_client.force_authenticate(user=candidate_user)

        url = f"/api/v1/candidates/{complete_profile.id}/toggle-sharing"
        response = api_client.patch(url, {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "enabled field is required" in response.data["error"]


@pytest.mark.django_db
class TestGetPublicProfileEndpoint:
    """Tests for GET /api/v1/candidates/public/:token"""

    def test_get_public_profile_success(self, api_client, profile_with_experiences):
        """Test successful public profile retrieval."""
        result = SharingService.generate_share_token(profile_with_experiences)
        token = result["share_token"]

        url = f"/api/v1/candidates/public/{token}"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["full_name"] == "João Silva"
        assert response.data["city"] == "São Paulo"
        assert len(response.data["experiences"]) == 2

    def test_get_public_profile_no_auth_required(self, api_client, complete_profile):
        """Test that public endpoint does not require authentication."""
        result = SharingService.generate_share_token(complete_profile)
        token = result["share_token"]

        # No authentication
        url = f"/api/v1/candidates/public/{token}"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_get_public_profile_excludes_sensitive_data(self, api_client, complete_profile):
        """Test that sensitive data is not exposed."""
        result = SharingService.generate_share_token(complete_profile)
        token = result["share_token"]

        url = f"/api/v1/candidates/public/{token}"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # Should NOT include sensitive fields
        assert "cpf" not in response.data
        assert "phone" not in response.data
        assert "user" not in response.data
        assert "status" not in response.data

        # Should include public fields
        assert "full_name" in response.data
        assert "city" in response.data
        assert "bio" in response.data

    def test_get_public_profile_invalid_token(self, api_client):
        """Test 404 for invalid token."""
        url = "/api/v1/candidates/public/invalid-token-123"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_public_profile_sharing_disabled(self, api_client, complete_profile):
        """Test 404 when sharing is disabled."""
        result = SharingService.generate_share_token(complete_profile)
        token = result["share_token"]

        # Disable sharing
        SharingService.toggle_sharing(complete_profile, False)

        url = f"/api/v1/candidates/public/{token}"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_public_profile_includes_experiences(self, api_client, profile_with_experiences):
        """Test that experiences are included in public profile."""
        result = SharingService.generate_share_token(profile_with_experiences)
        token = result["share_token"]

        url = f"/api/v1/candidates/public/{token}"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "experiences" in response.data
        assert len(response.data["experiences"]) == 2

        # Check experience data
        exp = response.data["experiences"][0]
        assert "company_name" in exp
        assert "position" in exp
        assert "start_date" in exp
        assert "company_logo_url" in exp
        # Should NOT include responsibilities
        assert "responsibilities" not in exp


@pytest.mark.django_db
class TestContactCandidateEndpoint:
    """Tests for POST /api/v1/candidates/public/:token/contact"""

    @patch("candidates.services.sharing.send_email_task")
    def test_contact_candidate_success(self, mock_email, api_client, complete_profile):
        """Test successful contact request."""
        result = SharingService.generate_share_token(complete_profile)
        token = result["share_token"]

        url = f"/api/v1/candidates/public/{token}/contact"
        data = {
            "name": "João Recrutador",
            "email": "joao@empresa.com",
            "message": "Gostaria de conversar sobre uma oportunidade...",
        }
        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "success" in response.data["message"].lower()
        mock_email.delay.assert_called_once()

    def test_contact_candidate_no_auth_required(self, api_client, complete_profile):
        """Test that contact endpoint does not require authentication."""
        result = SharingService.generate_share_token(complete_profile)
        token = result["share_token"]

        url = f"/api/v1/candidates/public/{token}/contact"
        data = {"name": "Test User", "email": "test@test.com", "message": "Test message"}

        # No authentication
        with patch("candidates.services.sharing.send_email_task"):
            response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK

    def test_contact_candidate_validates_required_fields(self, api_client, complete_profile):
        """Test validation of required fields."""
        result = SharingService.generate_share_token(complete_profile)
        token = result["share_token"]

        url = f"/api/v1/candidates/public/{token}/contact"

        # Missing name
        response = api_client.post(
            url, {"email": "test@test.com", "message": "Test"}, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Missing email
        response = api_client.post(url, {"name": "Test", "message": "Test"}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Missing message
        response = api_client.post(url, {"name": "Test", "email": "test@test.com"}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_contact_candidate_validates_email_format(self, api_client, complete_profile):
        """Test email format validation."""
        result = SharingService.generate_share_token(complete_profile)
        token = result["share_token"]

        url = f"/api/v1/candidates/public/{token}/contact"
        data = {
            "name": "Test User",
            "email": "invalid-email",  # Invalid format
            "message": "Test message",
        }
        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_contact_candidate_invalid_token(self, api_client):
        """Test 404 for invalid token."""
        url = "/api/v1/candidates/public/invalid-token/contact"
        data = {"name": "Test", "email": "test@test.com", "message": "Test"}
        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_contact_candidate_sharing_disabled(self, api_client, complete_profile):
        """Test 404 when sharing is disabled."""
        result = SharingService.generate_share_token(complete_profile)
        token = result["share_token"]

        # Disable sharing
        SharingService.toggle_sharing(complete_profile, False)

        url = f"/api/v1/candidates/public/{token}/contact"
        data = {"name": "Test", "email": "test@test.com", "message": "Test"}
        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestPublicEndpointsIntegration:
    """Integration tests for complete public sharing flow."""

    @patch("candidates.services.sharing.send_email_task")
    def test_complete_public_flow(
        self, mock_email, api_client, candidate_user, profile_with_experiences
    ):
        """Test complete flow: generate → access → contact → disable → access."""
        # 1. Generate token (authenticated)
        api_client.force_authenticate(user=candidate_user)
        gen_url = f"/api/v1/candidates/{profile_with_experiences.id}/generate-share-token"
        gen_response = api_client.post(gen_url)
        assert gen_response.status_code == status.HTTP_200_OK
        token = gen_response.data["share_token"]

        # 2. Access public profile (no auth)
        api_client.force_authenticate(user=None)
        profile_url = f"/api/v1/candidates/public/{token}"
        profile_response = api_client.get(profile_url)
        assert profile_response.status_code == status.HTTP_200_OK
        assert profile_response.data["full_name"] == "João Silva"

        # 3. Send contact request (no auth)
        contact_url = f"/api/v1/candidates/public/{token}/contact"
        contact_data = {
            "name": "Recruiter",
            "email": "recruiter@company.com",
            "message": "Interested in your profile",
        }
        contact_response = api_client.post(contact_url, contact_data, format="json")
        assert contact_response.status_code == status.HTTP_200_OK
        mock_email.delay.assert_called_once()

        # 4. Disable sharing (authenticated)
        api_client.force_authenticate(user=candidate_user)
        toggle_url = f"/api/v1/candidates/{profile_with_experiences.id}/toggle-sharing"
        toggle_response = api_client.patch(toggle_url, {"enabled": False}, format="json")
        assert toggle_response.status_code == status.HTTP_200_OK

        # 5. Try to access public profile (should fail)
        api_client.force_authenticate(user=None)
        profile_response2 = api_client.get(profile_url)
        assert profile_response2.status_code == status.HTTP_404_NOT_FOUND
