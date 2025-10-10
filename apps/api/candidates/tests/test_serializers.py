"""Tests for candidate serializers (Story 3.1)."""

from datetime import date
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from candidates.models import CandidateProfile, Experience
from candidates.serializers import (
    CandidateProfileDraftSerializer,
    CandidateProfileSerializer,
    ExperienceSerializer,
)

User = get_user_model()


@pytest.fixture
def candidate_user(db):
    """Create a candidate user."""
    return User.objects.create_user(
        email="candidate@example.com",
        password="testpass123",
        role="candidate"
    )


@pytest.fixture
def candidate_profile(candidate_user):
    """Create a candidate profile with video."""
    return CandidateProfile.objects.create(
        user=candidate_user,
        full_name="João Silva",
        phone="11999999999",
        city="São Paulo",
        current_position="SDR/BDR",
        years_of_experience=3,
        pitch_video_url="https://youtube.com/watch?v=existing123",
        pitch_video_type="youtube"
    )


@pytest.mark.django_db
class TestExperienceSerializer:
    """Tests for ExperienceSerializer."""

    def test_serialize_experience(self, candidate_profile):
        """Test serializing an experience object."""
        experience = Experience.objects.create(
            candidate=candidate_profile,
            company_name="Tech Corp",
            position="SDR",
            start_date=date(2020, 1, 1),
            end_date=date(2023, 6, 1),
            responsibilities="Cold calling and lead qualification"
        )

        serializer = ExperienceSerializer(experience)

        assert serializer.data["company_name"] == "Tech Corp"
        assert serializer.data["position"] == "SDR"
        assert serializer.data["start_date"] == "2020-01-01"
        assert serializer.data["end_date"] == "2023-06-01"
        assert serializer.data["responsibilities"] == "Cold calling and lead qualification"

    def test_deserialize_experience(self):
        """Test deserializing experience data."""
        data = {
            "company_name": "Startup Inc",
            "position": "AE",
            "start_date": "2021-03-15",
            "end_date": "2023-12-31",
            "responsibilities": "Closing deals"
        }

        serializer = ExperienceSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.validated_data["company_name"] == "Startup Inc"
        assert serializer.validated_data["position"] == "AE"

    def test_experience_without_end_date(self):
        """Test experience can be created without end_date (current job)."""
        data = {
            "company_name": "Current Company",
            "position": "CSM",
            "start_date": "2023-01-01",
            "end_date": None,
            "responsibilities": "Customer success"
        }

        serializer = ExperienceSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.validated_data["end_date"] is None

    def test_experience_missing_required_fields(self):
        """Test validation fails when required fields are missing."""
        data = {
            "company_name": "Test Company",
            # Missing: position, start_date
        }

        serializer = ExperienceSerializer(data=data)

        assert not serializer.is_valid()
        assert "position" in serializer.errors
        assert "start_date" in serializer.errors


@pytest.mark.django_db
class TestCandidateProfileSerializer:
    """Tests for CandidateProfileSerializer."""

    def test_serialize_candidate_profile(self, candidate_profile):
        """Test serializing a candidate profile."""
        serializer = CandidateProfileSerializer(candidate_profile)

        assert serializer.data["full_name"] == "João Silva"
        assert serializer.data["phone"] == "11999999999"
        assert serializer.data["city"] == "São Paulo"
        assert serializer.data["current_position"] == "SDR/BDR"
        assert serializer.data["years_of_experience"] == 3
        assert "id" in serializer.data
        assert "created_at" in serializer.data

    def test_deserialize_candidate_profile_basic(self):
        """Test deserializing basic candidate profile data."""
        data = {
            "full_name": "Maria Santos",
            "phone": "11988888888",
            "city": "Rio de Janeiro",
            "current_position": "AE/Closer",
            "years_of_experience": 5,
            "sales_type": "Inbound",
            "bio": "Experienced AE",
            "pitch_video_url": "https://youtube.com/watch?v=abc123",
            "pitch_video_type": "youtube"
        }

        serializer = CandidateProfileSerializer(data=data)

        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["full_name"] == "Maria Santos"
        assert serializer.validated_data["years_of_experience"] == 5

    def test_create_profile_with_experiences(self, candidate_user):
        """Test creating profile with nested experiences."""
        data = {
            "full_name": "Pedro Oliveira",
            "phone": "11977777777",
            "city": "Belo Horizonte",
            "current_position": "CSM",
            "years_of_experience": 4,
            "pitch_video_url": "https://youtube.com/watch?v=def456",
            "pitch_video_type": "youtube",
            "experiences": [
                {
                    "company_name": "Company A",
                    "position": "SDR",
                    "start_date": "2019-01-01",
                    "end_date": "2021-06-01",
                    "responsibilities": "Prospecting"
                },
                {
                    "company_name": "Company B",
                    "position": "CSM",
                    "start_date": "2021-07-01",
                    "end_date": None,
                    "responsibilities": "Account management"
                }
            ]
        }

        serializer = CandidateProfileSerializer(data=data)

        assert serializer.is_valid(), serializer.errors

        # Create with user context
        profile = serializer.save(user=candidate_user)

        assert profile.full_name == "Pedro Oliveira"
        assert profile.experiences.count() == 2
        assert profile.experiences.first().company_name in ["Company A", "Company B"]

    def test_profile_with_arrays(self):
        """Test profile with JSONB array fields."""
        data = {
            "full_name": "Ana Costa",
            "phone": "11966666666",
            "current_position": "SDR/BDR",
            "years_of_experience": 2,
            "tools_software": ["Salesforce", "HubSpot", "Outreach"],
            "solutions_sold": ["SaaS B2B", "Fintech"],
            "departments_sold_to": ["Marketing", "C-Level"],
            "pitch_video_url": "https://youtube.com/watch?v=ghi789",
            "pitch_video_type": "youtube"
        }

        serializer = CandidateProfileSerializer(data=data)

        assert serializer.is_valid(), serializer.errors
        assert len(serializer.validated_data["tools_software"]) == 3
        assert "Salesforce" in serializer.validated_data["tools_software"]

    @patch('candidates.serializers.validate_s3_url')
    @patch('candidates.serializers.get_s3_file_size')
    def test_profile_with_video_s3(self, mock_file_size, mock_validate_s3):
        """Test profile with S3 video."""
        # Mock S3 validation
        mock_validate_s3.return_value = True
        mock_file_size.return_value = 10 * 1024 * 1024  # 10MB

        data = {
            "full_name": "Carlos Pereira",
            "phone": "11955555555",
            "current_position": "AE/Closer",
            "years_of_experience": 6,
            "pitch_video_url": "https://talentbase-dev-uploads.s3.amazonaws.com/pitch-videos/test.mp4",
            "pitch_video_type": "s3"
        }

        serializer = CandidateProfileSerializer(data=data)

        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["pitch_video_type"] == "s3"

    def test_profile_with_video_youtube(self):
        """Test profile with YouTube video."""
        data = {
            "full_name": "Fernanda Lima",
            "phone": "11944444444",
            "current_position": "CSM",
            "years_of_experience": 3,
            "pitch_video_url": "https://youtube.com/watch?v=abc123",
            "pitch_video_type": "youtube"
        }

        serializer = CandidateProfileSerializer(data=data)

        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["pitch_video_type"] == "youtube"

    def test_profile_invalid_youtube_url(self):
        """Test validation fails for non-YouTube URL when type is youtube."""
        data = {
            "full_name": "Test User",
            "phone": "11933333333",
            "current_position": "SDR/BDR",
            "years_of_experience": 1,
            "pitch_video_url": "https://vimeo.com/123456",
            "pitch_video_type": "youtube"
        }

        serializer = CandidateProfileSerializer(data=data)

        # Should fail validation
        assert not serializer.is_valid()

    def test_profile_missing_required_fields(self):
        """Test validation fails when required fields are missing."""
        data = {
            "full_name": "Test User",
            # Missing: phone, current_position, years_of_experience
        }

        serializer = CandidateProfileSerializer(data=data)

        assert not serializer.is_valid()
        # At least one required field should be in errors
        assert "phone" in serializer.errors or "current_position" in serializer.errors

    def test_update_existing_profile(self, candidate_profile):
        """Test updating an existing profile."""
        # candidate_profile fixture already has video
        data = {
            "bio": "Updated bio with more information",
            "tools_software": ["Pipedrive", "Apollo.io"]
        }

        serializer = CandidateProfileSerializer(
            candidate_profile,
            data=data,
            partial=True
        )

        assert serializer.is_valid(), serializer.errors

        updated_profile = serializer.save()

        assert updated_profile.bio == "Updated bio with more information"
        assert "Pipedrive" in updated_profile.tools_software


@pytest.mark.django_db
class TestCandidateProfileDraftSerializer:
    """Tests for CandidateProfileDraftSerializer."""

    def test_serialize_draft_data(self):
        """Test serializing partial draft data without pitch video."""
        draft_data = {
            "full_name": "Draft User",
            "phone": "11999999999",
            "tools_software": ["Salesforce"]
            # No pitch_video - should be valid for draft
        }

        serializer = CandidateProfileDraftSerializer(data=draft_data)

        # Should be valid even without video since it's a draft
        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["full_name"] == "Draft User"

    def test_draft_with_partial_data(self):
        """Test draft can contain partial profile data."""
        draft_data = {
            "full_name": "Partial Draft",
            "phone": "11988888888",
            # Incomplete - missing video and other fields
        }

        serializer = CandidateProfileDraftSerializer(data=draft_data)

        # Should be valid since it's just a draft
        assert serializer.is_valid(), serializer.errors

    def test_draft_with_nested_experiences(self):
        """Test draft can include experiences without video."""
        draft_data = {
            "full_name": "Draft with Experiences",
            "phone": "11977777777",
            "experiences": [
                {
                    "company_name": "Draft Company",
                    "position": "Draft Position",
                    "start_date": "2020-01-01"
                }
            ]
            # No pitch_video - should still be valid for draft
        }

        serializer = CandidateProfileDraftSerializer(data=draft_data)

        assert serializer.is_valid(), serializer.errors
        assert len(serializer.validated_data["experiences"]) == 1
