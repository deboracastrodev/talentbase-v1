"""
Tests for admin user management service layer.

Story 2.4 - Task 1: Service layer business logic
"""

import pytest
from django.contrib.auth import get_user_model

from candidates.models import CandidateProfile
from companies.models import CompanyProfile
from user_management.services.user_management import UserManagementService

User = get_user_model()


@pytest.fixture
def candidate_user(db):
    """Create candidate user with profile."""
    user = User.objects.create_user(
        email="candidate@test.com", password="pass123", role="candidate"
    )
    CandidateProfile.objects.create(user=user, full_name="John Candidate", phone="11999999999")
    return user


@pytest.fixture
def company_user(db):
    """Create active company user with profile."""
    user = User.objects.create_user(
        email="company@test.com",
        password="pass123",
        role="company",
        is_active=True,
    )
    CompanyProfile.objects.create(
        user=user,
        company_name="Acme Corporation",
        cnpj="12345678000190",
        website="https://acme.com",
        contact_person_name="Jane Doe",
        contact_person_email="jane@acme.com",
        contact_person_phone="11988888888",
    )
    return user


@pytest.fixture
def pending_company(db):
    """Create pending company user."""
    user = User.objects.create_user(
        email="pending@test.com",
        password="pass123",
        role="company",
        is_active=False,
    )
    CompanyProfile.objects.create(
        user=user,
        company_name="Pending Corp",
        cnpj="98765432000190",
        website="https://pending.com",
        contact_person_name="Pending Person",
        contact_person_email="pending@pending.com",
        contact_person_phone="11977777777",
    )
    return user


@pytest.fixture
def admin_user(db):
    """Create admin user."""
    return User.objects.create_user(email="admin@test.com", password="admin123", role="admin")


@pytest.mark.django_db
class TestUserManagementService:
    """Tests for UserManagementService class."""

    def test_get_users_queryset_all(self, candidate_user, company_user, admin_user):
        """Test getting all users without filters."""
        # Act
        queryset = UserManagementService.get_users_queryset()

        # Assert
        assert queryset.count() == 3
        assert queryset.filter(role="candidate").exists()
        assert queryset.filter(role="company").exists()
        assert queryset.filter(role="admin").exists()

    def test_get_users_queryset_filter_by_role_candidate(self, candidate_user, company_user):
        """Test filtering by role: candidate."""
        # Act
        queryset = UserManagementService.get_users_queryset(role_filter="candidate")

        # Assert
        assert queryset.count() == 1
        assert queryset.first().role == "candidate"

    def test_get_users_queryset_filter_by_role_company(self, candidate_user, company_user):
        """Test filtering by role: company."""
        # Act
        queryset = UserManagementService.get_users_queryset(role_filter="company")

        # Assert
        assert queryset.count() == 1
        assert queryset.first().role == "company"

    def test_get_users_queryset_filter_by_status_active(self, candidate_user, pending_company):
        """Test filtering by status: active."""
        # Act
        queryset = UserManagementService.get_users_queryset(status_filter="active")

        # Assert
        assert queryset.count() == 1
        assert queryset.first().is_active is True

    def test_get_users_queryset_filter_by_status_pending(self, candidate_user, pending_company):
        """Test filtering by status: pending (company with is_active=False)."""
        # Act
        queryset = UserManagementService.get_users_queryset(status_filter="pending")

        # Assert
        assert queryset.count() == 1
        user = queryset.first()
        assert user.role == "company"
        assert user.is_active is False

    def test_get_users_queryset_search_by_email(self, candidate_user, company_user):
        """Test searching by email."""
        # Act
        queryset = UserManagementService.get_users_queryset(search="candidate@test.com")

        # Assert
        assert queryset.count() == 1
        assert queryset.first().email == "candidate@test.com"

    def test_get_users_queryset_search_by_candidate_name(self, candidate_user):
        """Test searching by candidate name."""
        # Act
        queryset = UserManagementService.get_users_queryset(search="John")

        # Assert
        assert queryset.count() == 1
        assert queryset.first().candidate_profile.full_name == "John Candidate"

    def test_get_users_queryset_search_by_company_name(self, company_user):
        """Test searching by company name."""
        # Act
        queryset = UserManagementService.get_users_queryset(search="Acme")

        # Assert
        assert queryset.count() == 1
        assert queryset.first().company_profile.company_name == "Acme Corporation"

    def test_get_users_queryset_combined_filters(
        self, candidate_user, company_user, pending_company
    ):
        """Test combining role and status filters."""
        # Act
        queryset = UserManagementService.get_users_queryset(
            role_filter="company", status_filter="pending"
        )

        # Assert
        assert queryset.count() == 1
        user = queryset.first()
        assert user.role == "company"
        assert user.is_active is False

    def test_get_user_with_profile_success(self, candidate_user):
        """Test retrieving user with profile."""
        # Act
        user = UserManagementService.get_user_with_profile(candidate_user.id)

        # Assert
        assert user is not None
        assert user.id == candidate_user.id
        assert hasattr(user, "candidate_profile")

    def test_get_user_with_profile_not_found(self):
        """Test retrieving non-existent user returns None."""
        # Arrange
        import uuid

        fake_id = uuid.uuid4()

        # Act
        user = UserManagementService.get_user_with_profile(fake_id)

        # Assert
        assert user is None

    def test_get_user_display_name_candidate(self, candidate_user):
        """Test display name for candidate shows full_name."""
        # Act
        name = UserManagementService.get_user_display_name(candidate_user)

        # Assert
        assert name == "John Candidate"

    def test_get_user_display_name_company(self, company_user):
        """Test display name for company shows company_name."""
        # Act
        name = UserManagementService.get_user_display_name(company_user)

        # Assert
        assert name == "Acme Corporation"

    def test_get_user_display_name_admin(self, admin_user):
        """Test display name for admin shows email."""
        # Act
        name = UserManagementService.get_user_display_name(admin_user)

        # Assert
        assert name == "admin@test.com"

    def test_update_user_status_creates_audit_log(self, pending_company, admin_user, db):
        """
        Test that updating user status creates an audit log entry.

        Story 2.5 - AC9: Log de auditoria registra aprovação/rejeição
        """
        from authentication.models import UserStatusAudit

        # Arrange
        assert pending_company.is_active is False
        initial_audit_count = UserStatusAudit.objects.count()

        # Act
        UserManagementService.update_user_status(
            user=pending_company,
            is_active=True,
            admin_user=admin_user,
            reason="Company verified",
        )

        # Assert
        assert UserStatusAudit.objects.count() == initial_audit_count + 1

        audit_log = UserStatusAudit.objects.first()
        assert audit_log.user == pending_company
        assert audit_log.changed_by == admin_user
        assert audit_log.old_status is False
        assert audit_log.new_status is True
        assert audit_log.action_type == "approve"
        assert audit_log.reason == "Company verified"

    def test_update_user_status_reject_creates_audit_log(self, company_user, admin_user, db):
        """Test that rejecting a company creates audit log with 'reject' action type."""
        from authentication.models import UserStatusAudit

        # Arrange - company_user is active by default
        assert company_user.is_active is True

        # Act - deactivate active company
        UserManagementService.update_user_status(
            user=company_user,
            is_active=False,
            admin_user=admin_user,
            reason="Invalid CNPJ",
        )

        # Assert
        audit_log = UserStatusAudit.objects.first()
        assert audit_log.action_type == "reject"
        assert audit_log.reason == "Invalid CNPJ"

    def test_get_pending_approvals_count(self, pending_company, company_user, candidate_user, db):
        """
        Test getting count of pending company approvals.

        Story 2.5 - AC1: Count empresas pendentes
        """
        # Arrange
        # pending_company: is_active=False
        # company_user: is_active=True
        # candidate_user: is_active=True (but role=candidate)

        # Act
        count = UserManagementService.get_pending_approvals_count()

        # Assert
        assert count == 1  # Only pending_company
