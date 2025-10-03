"""
Tests for company registration API.

Story 2.2: User Registration (Company)
Testing register_company endpoint and CompanyRegistrationService.
"""

import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from unittest.mock import patch

from companies.models import CompanyProfile

User = get_user_model()


@pytest.mark.django_db
class TestCompanyRegistrationView:
    """
    Tests for POST /api/v1/auth/register/company endpoint.

    Test Coverage:
    - Successful registration (201) - AC1, AC2, AC4
    - User created with role='company', is_active=False - AC5
    - CompanyProfile created and linked - AC6
    - CNPJ validation - AC3
    - Email notifications - AC7, AC8
    - Success message - AC10
    - Validation errors (400)
    - Duplicate email (400)
    """

    def setup_method(self):
        """Set up test client before each test."""
        self.client = APIClient()
        self.url = '/api/v1/auth/register/company'
        # Clear throttle cache before each test to avoid rate limiting
        from django.core.cache import cache
        cache.clear()

    def test_register_company_success(self):
        """
        Test successful company registration.

        Maps to AC4, AC5, AC6: API endpoint creates user and profile with correct settings.
        """
        # Arrange
        registration_data = {
            'email': 'company@example.com',
            'password': 'SecurePass123!',
            'company_name': 'Tech Corp LTDA',
            'cnpj': '11.222.333/0001-81',  # Valid CNPJ with check digits
            'website': 'https://techcorp.com',
            'contact_person_name': 'Joao Silva',
            'contact_person_email': 'joao@techcorp.com',
            'contact_person_phone': '11999999999',
            'industry': 'SaaS',
            'size': '11-50',
            'description': 'Tech company'
        }

        # Act - Mock email to avoid Celery
        with patch('core.tasks.send_email_task.delay'):
            response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_201_CREATED

        # Assert response structure
        assert 'user' in response.data
        assert 'token' in response.data
        assert 'message' in response.data

        # Assert user data
        user_data = response.data['user']
        assert user_data['email'] == 'company@example.com'
        assert user_data['role'] == 'company'  # AC5
        assert 'id' in user_data

        # Assert token generated
        assert isinstance(response.data['token'], str)
        assert len(response.data['token']) > 0

        # Assert AC10: Success message
        assert response.data['message'] == "Registro enviado, voce recebera aprovacao em 24 horas"

        # Assert httpOnly cookie set
        assert 'auth_token' in response.cookies
        auth_cookie = response.cookies['auth_token']
        assert auth_cookie.value == response.data['token']
        assert auth_cookie['httponly'] is True
        assert auth_cookie['max-age'] == 604800  # 7 days
        assert auth_cookie['path'] == '/'

        # Assert database state - AC5: User created with correct role and pending status
        user = User.objects.get(email='company@example.com')
        assert user.role == 'company'
        assert user.is_active is False  # AC5: Pending approval

        # Assert AC6: CompanyProfile created and linked to User
        profile = CompanyProfile.objects.get(user=user)
        assert profile.company_name == 'Tech Corp LTDA'
        assert profile.cnpj == '11222333000181'  # Stored without formatting
        assert profile.website == 'https://techcorp.com'
        assert profile.contact_person_name == 'Joao Silva'
        assert profile.contact_person_email == 'joao@techcorp.com'
        assert profile.contact_person_phone == '11999999999'
        assert profile.industry == 'SaaS'
        assert profile.size == '11-50'
        assert profile.description == 'Tech company'
        assert profile.created_by_admin is False

    def test_register_company_cnpj_validation_invalid_format(self):
        """
        Test CNPJ validation with invalid format (AC3).

        Should return 400 with specific error message.
        """
        # Arrange - Invalid CNPJ (wrong length)
        registration_data = {
            'email': 'company@example.com',
            'password': 'SecurePass123!',
            'company_name': 'Tech Corp LTDA',
            'cnpj': '123456789',  # Too short (invalid)
            'website': 'https://techcorp.com',
            'contact_person_name': 'Joao Silva',
            'contact_person_email': 'joao@techcorp.com',
            'contact_person_phone': '11999999999'
        }

        # Act
        response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data
        assert 'cnpj' in response.data['errors']

    def test_register_company_cnpj_validation_invalid_check_digits(self):
        """
        Test CNPJ validation with invalid check digits (AC3).

        Should return 400 with specific error message.
        """
        # Arrange - Invalid check digits
        registration_data = {
            'email': 'company@example.com',
            'password': 'SecurePass123!',
            'company_name': 'Tech Corp LTDA',
            'cnpj': '11.222.333/0001-99',  # Invalid check digits
            'website': 'https://techcorp.com',
            'contact_person_name': 'Joao Silva',
            'contact_person_email': 'joao@techcorp.com',
            'contact_person_phone': '11999999999'
        }

        # Act
        response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data
        assert 'cnpj' in response.data['errors']

    def test_register_company_duplicate_email(self):
        """
        Test duplicate email error.

        Should return 400 with specific error message.
        """
        # Arrange - Create existing user
        User.objects.create_user(
            email='duplicate@example.com',
            password='ExistingPass123!',
            role='candidate'
        )

        registration_data = {
            'email': 'duplicate@example.com',
            'password': 'SecurePass123!',
            'company_name': 'Tech Corp LTDA',
            'cnpj': '11.222.333/0001-81',
            'website': 'https://techcorp.com',
            'contact_person_name': 'Joao Silva',
            'contact_person_email': 'joao@techcorp.com',
            'contact_person_phone': '11999999999'
        }

        # Act
        with patch('core.tasks.send_email_task.delay'):
            response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data

    @patch('core.tasks.send_email_task.delay')
    def test_register_company_sends_two_emails(self, mock_send_email):
        """
        Test that two emails are queued: company notification and admin notification (AC7, AC8).

        Should call send_email_task.delay twice.
        """
        # Arrange
        registration_data = {
            'email': 'company@example.com',
            'password': 'SecurePass123!',
            'company_name': 'Tech Corp LTDA',
            'cnpj': '11.222.333/0001-81',
            'website': 'https://techcorp.com',
            'contact_person_name': 'Joao Silva',
            'contact_person_email': 'joao@techcorp.com',
            'contact_person_phone': '11999999999'
        }

        # Act
        response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_201_CREATED

        # Assert AC7, AC8: Two emails queued
        assert mock_send_email.call_count == 2

        # Verify first email (company notification - AC7)
        first_call = mock_send_email.call_args_list[0]
        assert first_call[1]['subject'] == "Cadastro Recebido - Aguardando Aprovacao"
        assert first_call[1]['recipient_list'] == ['company@example.com']

        # Verify second email (admin notification - AC8)
        second_call = mock_send_email.call_args_list[1]
        assert "Nova empresa cadastrada: Tech Corp LTDA" in second_call[1]['subject']

    def test_register_company_missing_required_fields(self):
        """
        Test validation error for missing required fields.

        Should return 400 with specific error messages.
        """
        # Arrange - Missing company_name
        registration_data = {
            'email': 'company@example.com',
            'password': 'SecurePass123!',
            'cnpj': '11.222.333/0001-81',
            'website': 'https://techcorp.com',
            'contact_person_name': 'Joao Silva',
            'contact_person_email': 'joao@techcorp.com',
            'contact_person_phone': '11999999999'
        }

        # Act
        response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data
        assert 'company_name' in response.data['errors']

    def test_register_company_weak_password(self):
        """
        Test password validation.

        Should return 400 for weak passwords.
        """
        # Arrange - Weak password
        registration_data = {
            'email': 'company@example.com',
            'password': '123',  # Too short
            'company_name': 'Tech Corp LTDA',
            'cnpj': '11.222.333/0001-81',
            'website': 'https://techcorp.com',
            'contact_person_name': 'Joao Silva',
            'contact_person_email': 'joao@techcorp.com',
            'contact_person_phone': '11999999999'
        }

        # Act
        response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data
        assert 'password' in response.data['errors']


@pytest.mark.django_db
class TestCompanyRegistrationService:
    """
    Tests for CompanyRegistrationService.

    Test Coverage:
    - Service layer business logic
    - Transaction atomicity
    - Email queuing
    """

    @patch('core.tasks.send_email_task.delay')
    def test_register_company_creates_user_and_profile(self, mock_send_email):
        """
        Test that service creates User and CompanyProfile in atomic transaction.
        """
        # Arrange
        from authentication.services.registration import CompanyRegistrationService

        data = {
            'email': 'test@company.com',
            'password': 'SecurePass123!',
            'company_name': 'Test Corp',
            'cnpj': '11222333000181',
            'website': 'https://test.com',
            'contact_person_name': 'Test User',
            'contact_person_email': 'test@test.com',
            'contact_person_phone': '11999999999'
        }

        # Act
        result = CompanyRegistrationService.register_company(data)

        # Assert
        assert 'user' in result
        assert 'profile' in result
        assert 'token' in result

        user = result['user']
        assert user.email == 'test@company.com'
        assert user.role == 'company'
        assert user.is_active is False  # Pending approval

        profile = result['profile']
        assert profile.user == user
        assert profile.company_name == 'Test Corp'

    @patch('core.tasks.send_email_task.delay')
    def test_register_company_created_by_admin_is_active(self, mock_send_email):
        """
        Test that companies created by admin are immediately active.
        """
        # Arrange
        from authentication.services.registration import CompanyRegistrationService

        data = {
            'email': 'admin-created@company.com',
            'password': 'SecurePass123!',
            'company_name': 'Admin Corp',
            'cnpj': '11222333000181',
            'website': 'https://admin.com',
            'contact_person_name': 'Admin User',
            'contact_person_email': 'admin@admin.com',
            'contact_person_phone': '11999999999'
        }

        # Act
        result = CompanyRegistrationService.register_company(data, created_by_admin=True)

        # Assert
        user = result['user']
        assert user.is_active is True  # Admin-created users are active immediately

        profile = result['profile']
        assert profile.created_by_admin is True

        # No emails sent for admin-created companies
        assert mock_send_email.call_count == 0
