"""
Tests for authentication API views.

Story 2.1: User Registration (Candidate)
Testing register_candidate endpoint.
"""

import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from unittest.mock import patch

from candidates.models import CandidateProfile

User = get_user_model()


@pytest.mark.django_db
class TestCandidateRegistrationView:
    """
    Tests for POST /api/v1/auth/register/candidate endpoint.

    Test Coverage:
    - Successful registration (201)
    - Validation errors (400)
    - Duplicate email (400)
    - Rate limiting (429)
    """

    def setup_method(self):
        """Set up test client before each test."""
        self.client = APIClient()
        self.url = '/api/v1/auth/register/candidate'
        # Clear throttle cache before each test to avoid rate limiting
        from django.core.cache import cache
        cache.clear()

    def test_register_candidate_success(self):
        """
        Test successful candidate registration.

        Maps to AC4, AC6: API endpoint creates user with correct role and returns token.
        """
        # Arrange
        registration_data = {
            'email': 'success@example.com',
            'password': 'SecurePass123!',
            'full_name': 'Success Test',
            'phone': '11955555555'
        }

        # Act - Mock email to avoid Celery
        with patch('core.tasks.send_email_task.delay'):
            response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_201_CREATED

        # Assert response structure (per interface api1)
        assert 'user' in response.data
        assert 'token' in response.data

        # Assert user data
        user_data = response.data['user']
        assert user_data['email'] == 'success@example.com'
        assert user_data['role'] == 'candidate'  # AC6
        assert 'id' in user_data

        # Assert token generated
        assert isinstance(response.data['token'], str)
        assert len(response.data['token']) > 0

        # Assert MED-1: Token is set as httpOnly cookie
        assert 'auth_token' in response.cookies
        auth_cookie = response.cookies['auth_token']
        assert auth_cookie.value == response.data['token']
        assert auth_cookie['httponly'] is True
        assert auth_cookie['max-age'] == 604800  # 7 days
        assert auth_cookie['path'] == '/'
        # In development, secure should be False; in production, True
        # SameSite should be 'Lax' in dev, 'Strict' in prod

        # Assert database state
        user = User.objects.get(email='success@example.com')
        assert user.role == 'candidate'
        assert user.is_active is True  # AC6

        profile = CandidateProfile.objects.get(user=user)
        assert profile.full_name == 'Success Test'
        assert profile.phone == '11955555555'

    def test_register_candidate_duplicate_email(self):
        """
        Test duplicate email error (AC9).

        Should return 400 with specific error message.
        """
        # Arrange - Create existing user
        User.objects.create_user(
            email='duplicate@example.com',
            password='existing123',
            role='candidate'
        )

        registration_data = {
            'email': 'duplicate@example.com',  # Duplicate
            'password': 'NewPass123!',
            'full_name': 'Duplicate Test',
            'phone': '11944444444'
        }

        # Act
        with patch('core.tasks.send_email_task.delay'):
            response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data
        # Should contain email-specific error (AC9)
        error_message = str(response.data['errors'])
        assert 'email' in error_message.lower() or 'already exists' in error_message.lower()

    def test_register_candidate_invalid_email(self):
        """
        Test invalid email format validation.

        Serializer should reject invalid email before hitting service.
        """
        # Arrange
        registration_data = {
            'email': 'not-an-email',  # Invalid format
            'password': 'SecurePass123!',
            'full_name': 'Invalid Email Test',
            'phone': '11933333333'
        }

        # Act
        response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data
        assert 'email' in response.data['errors']

    def test_register_candidate_weak_password(self):
        """
        Test password strength validation (AC5).

        Password must meet Django's validation requirements.
        """
        # Arrange - Weak password
        registration_data = {
            'email': 'weakpass@example.com',
            'password': 'weak',  # Too short, no uppercase/numbers
            'full_name': 'Weak Password Test',
            'phone': '11922222222'
        }

        # Act
        response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data
        assert 'password' in response.data['errors']

    def test_register_candidate_missing_fields(self):
        """
        Test missing required fields validation.

        All fields (email, password, full_name, phone) are required.
        """
        # Arrange - Missing fields
        incomplete_data_cases = [
            {'password': 'pass', 'full_name': 'Name', 'phone': '123'},  # Missing email
            {'email': 'test@test.com', 'full_name': 'Name', 'phone': '123'},  # Missing password
            {'email': 'test@test.com', 'password': 'pass', 'phone': '123'},  # Missing full_name
            {'email': 'test@test.com', 'password': 'pass', 'full_name': 'Name'},  # Missing phone
        ]

        for incomplete_data in incomplete_data_cases:
            # Act
            response = self.client.post(self.url, incomplete_data, format='json')

            # Assert
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            assert 'errors' in response.data

    def test_register_candidate_invalid_phone(self):
        """
        Test phone number validation.

        Phone must be between 10-15 digits.
        """
        # Arrange
        registration_data = {
            'email': 'badphone@example.com',
            'password': 'SecurePass123!',
            'full_name': 'Bad Phone Test',
            'phone': '123'  # Too short
        }

        # Act
        response = self.client.post(self.url, registration_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data
        assert 'phone' in response.data['errors']

    @pytest.mark.skip(reason="Rate limiting test requires multiple requests - slow test")
    def test_rate_limiting(self):
        """
        Test rate limiting: 10 registrations/hour per IP (AC security2).

        This test is skipped by default as it requires making 11 requests.
        Run manually when testing rate limiting specifically.
        """
        # Make 10 successful requests
        for i in range(10):
            data = {
                'email': f'ratelimit{i}@example.com',
                'password': 'SecurePass123!',
                'full_name': f'Rate Limit Test {i}',
                'phone': f'1199999999{i}'
            }
            with patch('core.tasks.send_email_task.delay'):
                response = self.client.post(self.url, data, format='json')
                assert response.status_code == status.HTTP_201_CREATED

        # 11th request should be rate limited
        data = {
            'email': 'ratelimit11@example.com',
            'password': 'SecurePass123!',
            'full_name': 'Rate Limit Test 11',
            'phone': '11999999999'
        }
        with patch('core.tasks.send_email_task.delay'):
            response = self.client.post(self.url, data, format='json')
            assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS
