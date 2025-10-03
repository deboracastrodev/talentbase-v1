"""
Serializers for authentication views.
Handles validation of input data and serialization of output.
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions


class CandidateRegistrationSerializer(serializers.Serializer):
    """
    Serializer for candidate registration endpoint.

    Validates input data and provides clean data for service layer.
    Per Clean Architecture: serializers handle data validation only,
    business logic is in services.
    """

    email = serializers.EmailField(
        required=True,
        help_text="Email address (will be username)"
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text="Password (min 8 characters)"
    )
    full_name = serializers.CharField(
        required=True,
        max_length=200,
        help_text="Full name"
    )
    phone = serializers.CharField(
        required=True,
        max_length=20,
        help_text="Contact phone number"
    )

    def validate_email(self, value):
        """Validate email format and lowercase domain."""
        return value.lower()

    def validate_password(self, value):
        """
        Validate password using Django's password validators.

        Checks:
        - Minimum length (8 characters)
        - Not too similar to user attributes
        - Not a common password
        - Not entirely numeric

        Per constraint security1: Uses Django default PBKDF2 hashing
        """
        try:
            validate_password(value)
        except django_exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate_phone(self, value):
        """Validate phone number format (basic check)."""
        # Remove common formatting characters
        cleaned = ''.join(filter(str.isdigit, value))

        if len(cleaned) < 10 or len(cleaned) > 15:
            raise serializers.ValidationError(
                "Phone number must be between 10 and 15 digits"
            )

        return value


class UserSerializer(serializers.Serializer):
    """Serializer for User data in responses."""

    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    role = serializers.CharField(read_only=True)


class RegistrationResponseSerializer(serializers.Serializer):
    """
    Serializer for registration response.

    Per AC6 and interface api1: Response includes user object and token.
    """

    user = UserSerializer(read_only=True)
    token = serializers.CharField(read_only=True)
