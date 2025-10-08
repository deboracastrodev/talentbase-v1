"""
Tests for admin user management API views.

Story 2.4 - Task 1: Criar API de listagem de usuários
Testing AC2, AC3, AC4, AC5, AC9
"""

import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from candidates.models import CandidateProfile
from companies.models import CompanyProfile

User = get_user_model()


@pytest.fixture
def api_client():
    """Return API client."""
    return APIClient()


@pytest.fixture
def admin_user(db):
    """Create admin user for testing."""
    return User.objects.create_user(
        email="admin@test.com", password="admin123", role="admin"
    )


@pytest.fixture
def candidate_user(db):
    """Create candidate user with profile."""
    user = User.objects.create_user(
        email="candidate@test.com", password="pass123", role="candidate"
    )
    CandidateProfile.objects.create(
        user=user, full_name="Test Candidate", phone="11999999999"
    )
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
        company_name="Test Company",
        cnpj="12345678000190",
        website="https://test.com",
        contact_person_name="Contact Person",
        contact_person_email="contact@test.com",
        contact_person_phone="11988888888",
    )
    return user


@pytest.fixture
def pending_company_user(db):
    """Create pending company user (is_active=False)."""
    user = User.objects.create_user(
        email="pending@test.com",
        password="pass123",
        role="company",
        is_active=False,
    )
    CompanyProfile.objects.create(
        user=user,
        company_name="Pending Company",
        cnpj="98765432000190",
        website="https://pending.com",
        contact_person_name="Pending Contact",
        contact_person_email="pending@test.com",
        contact_person_phone="11977777777",
    )
    return user


@pytest.mark.django_db
class TestAdminUserListView:
    """
    Tests for GET /api/v1/admin/users endpoint.

    Coverage:
    - AC2: Visualização em tabela com colunas corretas
    - AC3: Filtrar por role
    - AC4: Filtrar por status
    - AC5: Buscar por nome ou email
    - AC9: Paginação (20 usuários por página)
    - Security: Apenas admins podem acessar
    """

    def test_list_users_requires_admin_permission(
        self, api_client, candidate_user
    ):
        """
        Test that non-admin users receive 403.

        Security test: validates IsAdmin permission class.
        """
        # Arrange
        api_client.force_authenticate(user=candidate_user)

        # Act
        response = api_client.get("/api/v1/admin/users")

        # Assert
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_list_users_unauthenticated_returns_401(self, api_client):
        """Test that unauthenticated requests receive 401."""
        response = api_client.get("/api/v1/admin/users")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_users_success(
        self, api_client, admin_user, candidate_user, company_user
    ):
        """
        Test successful user listing with all required columns.

        AC2: Table with columns: name, email, role, status, created_at
        """
        # Arrange
        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get("/api/v1/admin/users")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data
        assert len(response.data["results"]) == 3  # admin + candidate + company

        # Verify column structure (AC2)
        user_data = response.data["results"][0]
        assert "id" in user_data
        assert "name" in user_data
        assert "email" in user_data
        assert "role" in user_data
        assert "status" in user_data
        assert "created_at" in user_data

    def test_filter_by_role_candidate(
        self, api_client, admin_user, candidate_user, company_user
    ):
        """
        Test filtering users by role: candidate.

        AC3: Filtrar por role (all, admin, candidate, company)
        """
        # Arrange
        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get("/api/v1/admin/users?role=candidate")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["role"] == "candidate"

    def test_filter_by_role_company(
        self, api_client, admin_user, candidate_user, company_user
    ):
        """
        Test filtering users by role: company.

        AC3: Filtrar por role
        """
        # Arrange
        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get("/api/v1/admin/users?role=company")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["role"] == "company"

    def test_filter_by_role_admin(
        self, api_client, admin_user, candidate_user, company_user
    ):
        """Test filtering users by role: admin."""
        # Arrange
        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get("/api/v1/admin/users?role=admin")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["role"] == "admin"

    def test_filter_by_status_active(
        self, api_client, admin_user, candidate_user, pending_company_user
    ):
        """
        Test filtering users by status: active.

        AC4: Filtrar por status (all, active, pending, inactive)
        """
        # Arrange
        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get("/api/v1/admin/users?status=active")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        for user in response.data["results"]:
            assert user["status"] in ["active"]

    def test_filter_by_status_pending(
        self, api_client, admin_user, candidate_user, pending_company_user
    ):
        """
        Test filtering users by status: pending.

        AC4: Pending status = companies with is_active=False
        """
        # Arrange
        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get("/api/v1/admin/users?status=pending")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["status"] == "pending"
        assert response.data["results"][0]["role"] == "company"

    def test_search_by_email(
        self, api_client, admin_user, candidate_user, company_user
    ):
        """
        Test searching users by email.

        AC5: Buscar por nome ou email
        """
        # Arrange
        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get("/api/v1/admin/users?search=candidate@test.com")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["email"] == "candidate@test.com"

    def test_search_by_name(
        self, api_client, admin_user, candidate_user, company_user
    ):
        """
        Test searching users by name (from profile).

        AC5: Buscar por nome
        """
        # Arrange
        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get("/api/v1/admin/users?search=Test Candidate")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["name"] == "Test Candidate"

    def test_search_by_company_name(
        self, api_client, admin_user, candidate_user, company_user
    ):
        """Test searching users by company name (from profile)."""
        # Arrange
        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get("/api/v1/admin/users?search=Test Company")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["name"] == "Test Company"

    def test_pagination_default_page_size(self, api_client, admin_user, db):
        """
        Test pagination with default page size of 20.

        AC9: Paginação (20 usuários por página)
        """
        # Arrange: Create 25 users to test pagination
        for i in range(24):  # 24 + admin_user = 25 total
            User.objects.create_user(
                email=f"user{i}@test.com",
                password="pass123",
                role="candidate",
            )

        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get("/api/v1/admin/users")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 20  # First page
        assert "next" in response.data
        assert response.data["next"] is not None  # Has next page

    def test_pagination_second_page(self, api_client, admin_user, db):
        """Test accessing second page of paginated results."""
        # Arrange: Create 25 users
        for i in range(24):
            User.objects.create_user(
                email=f"user{i}@test.com",
                password="pass123",
                role="candidate",
            )

        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get("/api/v1/admin/users?page=2")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 5  # Remaining 5 users
        assert response.data["previous"] is not None  # Has previous page


@pytest.mark.django_db
class TestAdminUserDetailView:
    """
    Tests for GET /api/v1/admin/users/:id endpoint.

    Coverage:
    - AC6: Clicar na linha do usuário → abre modal de detalhes
    - Retrieves user with profile data
    - Security: Admin-only access
    """

    def test_get_user_detail_success(self, api_client, admin_user, candidate_user):
        """Test successfully retrieving user details."""
        # Arrange
        api_client.force_authenticate(user=admin_user)

        # Act
        response = api_client.get(f"/api/v1/admin/users/{candidate_user.id}")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == str(candidate_user.id)
        assert response.data["email"] == candidate_user.email
        assert response.data["role"] == "candidate"
        assert "profile" in response.data
        assert response.data["profile"]["full_name"] == "Test Candidate"

    def test_get_user_detail_not_found(self, api_client, admin_user):
        """Test 404 when user doesn't exist."""
        # Arrange
        import uuid

        api_client.force_authenticate(user=admin_user)
        fake_id = uuid.uuid4()

        # Act
        response = api_client.get(f"/api/v1/admin/users/{fake_id}")

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_user_detail_requires_admin(self, api_client, candidate_user):
        """Test that non-admin users receive 403."""
        # Arrange
        api_client.force_authenticate(user=candidate_user)

        # Act
        response = api_client.get(f"/api/v1/admin/users/{candidate_user.id}")

        # Assert
        assert response.status_code == status.HTTP_403_FORBIDDEN
