"""Tests for application models."""

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from applications.models import Application
from candidates.models import CandidateProfile
from companies.models import CompanyProfile
from jobs.models import JobPosting

User = get_user_model()


@pytest.mark.django_db
class TestApplicationModel:
    """Tests for Application model."""

    def test_create_application(self):
        """Test creating job application."""
        # Create user and candidate
        candidate_user = User.objects.create_user(
            email="candidate@example.com", password="pass", role="candidate"
        )
        candidate = CandidateProfile.objects.create(
            user=candidate_user,
            full_name="Test Candidate",
            phone="11999999999",
            cpf="12345678900",
            linkedin="https://linkedin.com/in/test",
            current_position="SDR/BDR",
            years_of_experience=3,
        )

        # Create company and job
        company_user = User.objects.create_user(
            email="company@example.com", password="pass", role="company"
        )
        company = CompanyProfile.objects.create(
            user=company_user,
            company_name="Tech Company",
            cnpj="12345678000190",
            website="https://techcompany.com",
            industry="SaaS",
            size="11-50",
            contact_person_name="John Doe",
            contact_person_email="john@techcompany.com",
            contact_person_phone="11988888888",
        )
        job = JobPosting.objects.create(
            company=company,
            title="SDR Position",
            position_type="SDR/BDR",
            seniority="junior",
            description="Sales Development Representative role",
            responsibilities="Cold calling, lead qualification",
            location="São Paulo",
            required_skills=["Outbound", "Communication"],
        )

        # Create application
        application = Application.objects.create(job=job, candidate=candidate, status="pending")

        assert application.id is not None
        assert application.status == "pending"
        assert application.job == job
        assert application.candidate == candidate
        assert application.matched_by_admin is None

    def test_unique_together_constraint(self):
        """Test candidate cannot apply to same job twice."""
        # Setup
        candidate_user = User.objects.create_user(
            email="candidate@example.com", password="pass", role="candidate"
        )
        candidate = CandidateProfile.objects.create(
            user=candidate_user,
            full_name="Test Candidate",
            phone="11999999999",
            cpf="12345678900",
            linkedin="https://linkedin.com/in/test",
            current_position="SDR/BDR",
            years_of_experience=3,
        )
        company_user = User.objects.create_user(
            email="company@example.com", password="pass", role="company"
        )
        company = CompanyProfile.objects.create(
            user=company_user,
            company_name="Tech Company",
            cnpj="12345678000190",
            website="https://techcompany.com",
            industry="SaaS",
            size="11-50",
            contact_person_name="John Doe",
            contact_person_email="john@techcompany.com",
            contact_person_phone="11988888888",
        )
        job = JobPosting.objects.create(
            company=company,
            title="SDR Position",
            position_type="SDR/BDR",
            seniority="junior",
            description="Sales Development Representative role",
            responsibilities="Cold calling",
            location="São Paulo",
        )

        # First application succeeds
        Application.objects.create(job=job, candidate=candidate, status="pending")

        # Second application to same job fails
        with pytest.raises(IntegrityError):
            Application.objects.create(job=job, candidate=candidate, status="pending")

    def test_cascade_delete_on_job_deletion(self):
        """Test applications are deleted when job is deleted."""
        # Setup
        candidate_user = User.objects.create_user(
            email="candidate@example.com", password="pass", role="candidate"
        )
        candidate = CandidateProfile.objects.create(
            user=candidate_user,
            full_name="Test Candidate",
            phone="11999999999",
            cpf="12345678900",
            linkedin="https://linkedin.com/in/test",
            current_position="SDR/BDR",
            years_of_experience=3,
        )
        company_user = User.objects.create_user(
            email="company@example.com", password="pass", role="company"
        )
        company = CompanyProfile.objects.create(
            user=company_user,
            company_name="Tech Company",
            cnpj="12345678000190",
            website="https://techcompany.com",
            industry="SaaS",
            size="11-50",
            contact_person_name="John Doe",
            contact_person_email="john@techcompany.com",
            contact_person_phone="11988888888",
        )
        job = JobPosting.objects.create(
            company=company,
            title="SDR Position",
            position_type="SDR/BDR",
            seniority="junior",
            description="Sales Development Representative role",
            responsibilities="Cold calling",
            location="São Paulo",
        )
        application = Application.objects.create(job=job, candidate=candidate)

        application_id = application.id

        # Delete job
        job.delete()

        # Application should be deleted (CASCADE)
        assert not Application.objects.filter(id=application_id).exists()

    def test_set_null_on_admin_deletion(self):
        """Test matched_by_admin is set to NULL when admin is deleted."""
        # Setup
        admin_user = User.objects.create_user(
            email="admin@example.com", password="pass", role="admin"
        )
        candidate_user = User.objects.create_user(
            email="candidate@example.com", password="pass", role="candidate"
        )
        candidate = CandidateProfile.objects.create(
            user=candidate_user,
            full_name="Test Candidate",
            phone="11999999999",
            cpf="12345678900",
            linkedin="https://linkedin.com/in/test",
            current_position="SDR/BDR",
            years_of_experience=3,
        )
        company_user = User.objects.create_user(
            email="company@example.com", password="pass", role="company"
        )
        company = CompanyProfile.objects.create(
            user=company_user,
            company_name="Tech Company",
            cnpj="12345678000190",
            website="https://techcompany.com",
            industry="SaaS",
            size="11-50",
            contact_person_name="John Doe",
            contact_person_email="john@techcompany.com",
            contact_person_phone="11988888888",
        )
        job = JobPosting.objects.create(
            company=company,
            title="SDR Position",
            position_type="SDR/BDR",
            seniority="junior",
            description="Sales Development Representative role",
            responsibilities="Cold calling",
            location="São Paulo",
        )
        application = Application.objects.create(
            job=job, candidate=candidate, matched_by_admin=admin_user, status="matched"
        )

        # Delete admin
        admin_user.delete()

        # Refresh application from database
        application.refresh_from_db()

        # matched_by_admin should be NULL (SET_NULL)
        assert application.matched_by_admin is None
        assert application.status == "matched"  # Status preserved
