"""Tests for candidate models."""

from datetime import date

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from candidates.models import CandidateProfile, Experience, validate_youtube_url

User = get_user_model()


@pytest.mark.django_db
class TestCandidateProfileModel:
    """Tests for CandidateProfile model."""

    def test_create_candidate_profile(self):
        """Test creating candidate profile with all required fields."""
        user = User.objects.create_user(
            email="joao@example.com", password="test123", role="candidate"
        )
        candidate = CandidateProfile.objects.create(
            user=user,
            full_name="João Silva",
            phone="11999999999",
            cpf="12345678900",
            linkedin="https://linkedin.com/in/joaosilva",
            current_position="SDR/BDR",
            years_of_experience=3,
            top_skills=["Outbound", "HubSpot"],
        )

        assert candidate.id is not None
        assert candidate.full_name == "João Silva"
        assert candidate.current_position == "SDR/BDR"
        assert candidate.years_of_experience == 3
        assert candidate.status == "available"
        assert candidate.is_public is False
        assert candidate.public_token is not None
        assert candidate.top_skills == ["Outbound", "HubSpot"]

    def test_candidate_profile_soft_delete(self):
        """Test soft delete marks profile as inactive."""
        user = User.objects.create_user(
            email="test@example.com", password="test123", role="candidate"
        )
        candidate = CandidateProfile.objects.create(
            user=user,
            full_name="Test User",
            phone="11999999999",
            cpf="12345678900",
            linkedin="https://linkedin.com/in/test",
            current_position="SDR/BDR",
            years_of_experience=2,
        )

        candidate.soft_delete()

        assert candidate.is_active is False
        # Record still exists in database
        assert CandidateProfile.objects.filter(id=candidate.id).exists()

    def test_candidate_profile_jsonb_fields(self):
        """Test JSONB fields accept lists."""
        user = User.objects.create_user(
            email="maria@example.com", password="test123", role="candidate"
        )
        candidate = CandidateProfile.objects.create(
            user=user,
            full_name="Maria Santos",
            phone="11988888888",
            cpf="98765432100",
            linkedin="https://linkedin.com/in/maria",
            current_position="AE/Closer",
            years_of_experience=5,
            top_skills=["Negotiation", "Closing"],
            tools_software=["Salesforce", "HubSpot", "Outreach"],
            solutions_sold=["SaaS B2B", "Fintech"],
            departments_sold_to=["C-Level", "Marketing", "Sales"],
        )

        assert isinstance(candidate.top_skills, list)
        assert "Negotiation" in candidate.top_skills
        assert len(candidate.tools_software) == 3
        assert candidate.solutions_sold == ["SaaS B2B", "Fintech"]

    def test_candidate_profile_str_representation(self):
        """Test string representation of candidate profile."""
        user = User.objects.create_user(
            email="test@example.com", password="test123", role="candidate"
        )
        candidate = CandidateProfile.objects.create(
            user=user,
            full_name="Pedro Oliveira",
            phone="11999999999",
            cpf="12345678900",
            linkedin="https://linkedin.com/in/pedro",
            current_position="CSM",
            years_of_experience=4,
        )

        assert str(candidate) == "Pedro Oliveira (CSM)"


@pytest.mark.django_db
class TestExperienceModel:
    """Tests for Experience model."""

    def test_create_experience(self):
        """Test creating professional experience."""
        user = User.objects.create_user(
            email="candidate@example.com", password="test123", role="candidate"
        )
        candidate = CandidateProfile.objects.create(
            user=user,
            full_name="Test Candidate",
            phone="11999999999",
            cpf="12345678900",
            linkedin="https://linkedin.com/in/test",
            current_position="SDR/BDR",
            years_of_experience=3,
        )

        experience = Experience.objects.create(
            candidate=candidate,
            company_name="Tech Company",
            position="SDR",
            start_date=date(2020, 1, 1),
            end_date=date(2022, 6, 1),
            responsibilities="Cold calling, lead qualification",
        )

        assert experience.id is not None
        assert experience.company_name == "Tech Company"
        assert experience.position == "SDR"
        assert experience.start_date == date(2020, 1, 1)
        assert experience.end_date == date(2022, 6, 1)

    def test_experience_ordering(self):
        """Test experiences are ordered by most recent first."""
        user = User.objects.create_user(
            email="candidate@example.com", password="test123", role="candidate"
        )
        candidate = CandidateProfile.objects.create(
            user=user,
            full_name="Test Candidate",
            phone="11999999999",
            cpf="12345678900",
            linkedin="https://linkedin.com/in/test",
            current_position="AE/Closer",
            years_of_experience=5,
        )

        exp1 = Experience.objects.create(
            candidate=candidate,
            company_name="Company A",
            position="SDR",
            start_date=date(2020, 1, 1),
            end_date=date(2022, 1, 1),
        )
        exp2 = Experience.objects.create(
            candidate=candidate,
            company_name="Company B",
            position="AE",
            start_date=date(2022, 2, 1),  # Most recent, no end_date
        )

        experiences = candidate.experiences.all()
        assert experiences[0] == exp2  # Most recent first
        assert experiences[1] == exp1

    def test_experience_end_date_can_be_null(self):
        """Test end_date can be null for current jobs."""
        user = User.objects.create_user(
            email="candidate@example.com", password="test123", role="candidate"
        )
        candidate = CandidateProfile.objects.create(
            user=user,
            full_name="Test Candidate",
            phone="11999999999",
            cpf="12345678900",
            linkedin="https://linkedin.com/in/test",
            current_position="AE/Closer",
            years_of_experience=3,
        )

        current_job = Experience.objects.create(
            candidate=candidate,
            company_name="Current Company",
            position="AE",
            start_date=date(2023, 1, 1),
            end_date=None,  # Current job
        )

        assert current_job.end_date is None


class TestYouTubeURLValidator:
    """Tests for YouTube URL validator."""

    def test_valid_youtube_url(self):
        """Test valid YouTube URLs pass validation."""
        validate_youtube_url("https://youtube.com/watch?v=abc123")
        validate_youtube_url("https://www.youtube.com/watch?v=xyz456")
        validate_youtube_url("https://youtu.be/abc123")
        # Should not raise any exception

    def test_invalid_youtube_url_raises_error(self):
        """Test non-YouTube URLs raise ValidationError."""
        with pytest.raises(ValidationError, match="URL deve ser do YouTube"):
            validate_youtube_url("https://vimeo.com/123456")

        with pytest.raises(ValidationError, match="URL deve ser do YouTube"):
            validate_youtube_url("https://example.com/video")

    def test_empty_url_passes_validation(self):
        """Test empty/blank URLs pass validation (field is optional)."""
        validate_youtube_url("")
        validate_youtube_url(None)
        # Should not raise any exception
