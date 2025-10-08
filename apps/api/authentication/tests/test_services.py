"""
Tests for authentication services.

Story 2.1: User Registration (Candidate)
Testing CandidateRegistrationService per test ideas from Story Context.
"""

import pytest
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock

from authentication.services import CandidateRegistrationService
from candidates.models import CandidateProfile

User = get_user_model()


@pytest.mark.django_db
class TestCandidateRegistrationService:
    """
    Tests for CandidateRegistrationService.

    Test Coverage:
    - test1: User + CandidateProfile created with correct fields, password hashed (AC4,AC5,AC6)
    - test2: Duplicate email validation (AC9)
    - test3: Invalid data validation (AC4)
    - test4: Welcome email queued (AC7)
    """

    def test_candidate_registration_creates_user_and_profile(self):
        """
        Test ID: test1 (maps to AC4, AC5, AC6)

        Validates that registration:
        - Creates User with role='candidate', is_active=True
        - Creates CandidateProfile with minimal fields (user, full_name, phone)
        - Password is hashed (not plain text)
        - Token is generated

        Per constraint dev2: Only user, full_name, phone set on registration.
        """
        # Arrange
        registration_data = {
            'email': 'newcandidate@example.com',
            'password': 'SecurePass123!',
            'full_name': 'Maria Santos',
            'phone': '11988888888'
        }

        # Act - Mock email task to avoid Celery dependency
        with patch('core.tasks.send_email_task.delay') as mock_email:
            result = CandidateRegistrationService.register_candidate(registration_data)

        # Assert - User created with correct role
        assert result['user'].email == 'newcandidate@example.com'
        assert result['user'].role == 'candidate'
        assert result['user'].is_active is True  # AC6

        # Assert - Password is hashed (not plain text) - AC5
        assert not result['user'].check_password('wrongpassword')
        assert result['user'].check_password('SecurePass123!')

        # Assert - CandidateProfile created with minimal fields
        profile = CandidateProfile.objects.get(user=result['user'])
        assert profile.full_name == 'Maria Santos'
        assert profile.phone == '11988888888'

        # Assert - Optional fields are empty (per constraint dev2)
        assert profile.cpf == ''
        assert profile.linkedin == ''
        assert profile.current_position == ''
        assert profile.years_of_experience is None

        # Assert - Token generated
        assert result['token'] is not None
        assert isinstance(result['token'], str)
        assert len(result['token']) > 0

        # Assert - Welcome email queued (AC7)
        mock_email.assert_called_once()
        call_args = mock_email.call_args[1]  # keyword arguments
        assert 'newcandidate@example.com' in call_args['recipient_list']
        assert 'Bem-vindo' in call_args['subject']

    def test_candidate_registration_duplicate_email(self):
        """
        Test ID: test2 (maps to AC9)

        Validates that attempting to register with existing email raises ValidationError.
        """
        # Arrange - Create existing user
        User.objects.create_user(
            email='existing@example.com',
            password='password123',
            role='candidate'
        )

        # Act & Assert - Duplicate email should raise ValidationError
        with pytest.raises(ValidationError, match='já existe'):
            with patch('core.tasks.send_email_task.delay'):
                CandidateRegistrationService.register_candidate({
                    'email': 'existing@example.com',  # Duplicate
                    'password': 'NewPass123!',
                    'full_name': 'Another User',
                    'phone': '11999999999'
                })

    def test_candidate_registration_invalid_data(self):
        """
        Test ID: test3 (maps to AC4)

        Validates that missing required fields raises ValidationError.
        """
        # Arrange - Missing required fields
        invalid_data_cases = [
            {'email': '', 'password': 'pass', 'full_name': 'Name', 'phone': '123'},  # Missing email
            {'email': 'test@test.com', 'password': '', 'full_name': 'Name', 'phone': '123'},  # Missing password
            {'email': 'test@test.com', 'password': 'pass', 'full_name': '', 'phone': '123'},  # Missing name
            {'email': 'test@test.com', 'password': 'pass', 'full_name': 'Name', 'phone': ''},  # Missing phone
        ]

        for invalid_data in invalid_data_cases:
            # Act & Assert
            with pytest.raises(ValidationError, match='Campos obrigatórios'):
                with patch('core.tasks.send_email_task.delay'):
                    CandidateRegistrationService.register_candidate(invalid_data)

    def test_candidate_registration_sends_welcome_email(self):
        """
        Test ID: test4 (maps to AC7)

        Validates that welcome email is queued with correct parameters.
        Tests both self-service and admin-created scenarios.
        """
        registration_data = {
            'email': 'emailtest@example.com',
            'password': 'SecurePass123!',
            'full_name': 'Email Test User',
            'phone': '11977777777'
        }

        # Test self-service registration (should send email)
        with patch('core.tasks.send_email_task.delay') as mock_email:
            CandidateRegistrationService.register_candidate(
                registration_data,
                created_by_admin=False  # Self-service
            )

            # Assert email was queued
            mock_email.assert_called_once()
            call_kwargs = mock_email.call_args[1]

            # Validate email content
            assert call_kwargs['subject'] == 'Bem-vindo ao TalentBase!'
            assert 'Email Test User' in call_kwargs['message']
            assert 'emailtest@example.com' in call_kwargs['message']
            assert call_kwargs['recipient_list'] == ['emailtest@example.com']

        # Test admin-created user (should NOT send email per constraint email3)
        User.objects.filter(email='emailtest@example.com').delete()  # Cleanup

        with patch('core.tasks.send_email_task.delay') as mock_email:
            CandidateRegistrationService.register_candidate(
                {**registration_data, 'email': 'admin_created@example.com'},
                created_by_admin=True  # Admin-created
            )

            # Assert email was NOT queued
            mock_email.assert_not_called()

    def test_transaction_rollback_on_error(self):
        """
        Test that @transaction.atomic rolls back User creation if CandidateProfile fails.

        Per constraint arch2: Use @transaction.atomic for registration.
        """
        # Arrange
        registration_data = {
            'email': 'rollback@example.com',
            'password': 'SecurePass123!',
            'full_name': 'Test Rollback',
            'phone': '11966666666'
        }

        # Act - Simulate CandidateProfile.objects.create failure
        with patch('candidates.models.CandidateProfile.objects.create', side_effect=Exception('Database error')):
            with pytest.raises(Exception, match='Database error'):
                with patch('core.tasks.send_email_task.delay'):
                    CandidateRegistrationService.register_candidate(registration_data)

        # Assert - User should NOT exist (transaction rolled back)
        assert not User.objects.filter(email='rollback@example.com').exists()
