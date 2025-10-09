"""
Serializers for authentication views.
Handles validation of input data and serialization of output.
"""

from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions
from pycpfcnpj import cnpj as cnpj_validator
from rest_framework import serializers


class CandidateRegistrationSerializer(serializers.Serializer):
    """
    Serializer for candidate registration endpoint.

    Validates input data and provides clean data for service layer.
    Per Clean Architecture: serializers handle data validation only,
    business logic is in services.
    """

    email = serializers.EmailField(required=True, help_text="Email address (will be username)")
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
        help_text="Password (min 8 characters)",
    )
    full_name = serializers.CharField(required=True, max_length=200, help_text="Full name")
    phone = serializers.CharField(required=True, max_length=20, help_text="Contact phone number")

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
        cleaned = "".join(filter(str.isdigit, value))

        if len(cleaned) < 10 or len(cleaned) > 15:
            raise serializers.ValidationError("Phone number must be between 10 and 15 digits")

        return value


class UserSerializer(serializers.Serializer):
    """Serializer for User data in responses."""

    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    role = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)


class RegistrationResponseSerializer(serializers.Serializer):
    """
    Serializer for registration response.

    Per AC6 and interface api1: Response includes user object and token.
    """

    user = UserSerializer(read_only=True)
    token = serializers.CharField(read_only=True)


class LoginSerializer(serializers.Serializer):
    """
    Serializer for login endpoint.

    Validates login credentials (email and password).
    Per Story 2.3: Login & Token Authentication
    """

    email = serializers.EmailField(required=True, help_text="Email address")
    password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}, help_text="Password"
    )

    def validate_email(self, value):
        """Normalize email to lowercase."""
        return value.lower()


class LoginResponseSerializer(serializers.Serializer):
    """
    Serializer for login response.

    Per Story 2.3 AC4, AC6: Response includes user object, token, and redirect_url.
    """

    user = UserSerializer(read_only=True)
    token = serializers.CharField(read_only=True)
    redirect_url = serializers.CharField(read_only=True)


class CompanyRegistrationSerializer(serializers.Serializer):
    """
    Serializer for company registration endpoint.

    Validates company registration data including CNPJ validation.
    Per Story 2.2 AC3: CNPJ validation with format and digit check.
    Per constraint validation1: Format XX.XXX.XXX/XXXX-XX + pycpfcnpj digit validation.
    """

    email = serializers.EmailField(required=True, help_text="Email address (will be username)")
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
        help_text="Password (min 8 characters)",
    )
    company_name = serializers.CharField(
        required=True, max_length=200, help_text="Company legal or trade name"
    )
    cnpj = serializers.CharField(
        required=True,
        max_length=18,  # XX.XXX.XXX/XXXX-XX format
        help_text="Brazilian company tax ID (CNPJ)",
    )
    website = serializers.URLField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Company website URL (optional)",
    )
    contact_person_name = serializers.CharField(
        required=True, max_length=200, help_text="Responsible person's name"
    )
    contact_person_email = serializers.EmailField(
        required=False,
        allow_blank=True,
        help_text="Responsible person's email (optional, defaults to main email)",
    )
    contact_person_phone = serializers.CharField(
        required=True, max_length=20, help_text="Responsible person's phone"
    )
    industry = serializers.CharField(
        required=False, max_length=100, help_text="Industry/sector (optional)"
    )
    size = serializers.CharField(required=False, max_length=20, help_text="Company size (optional)")
    description = serializers.CharField(
        required=False, allow_blank=True, help_text="Company description (optional)"
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

        Per constraint security2: Uses Django default PBKDF2 hashing
        """
        try:
            validate_password(value)
        except django_exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate_cnpj(self, value):
        """
        Validate CNPJ format and check digits.

        Per AC3: Validação de CNPJ (formato brasileiro de ID fiscal)
        Per constraint validation1: Format XX.XXX.XXX/XXXX-XX + digit validation

        Args:
            value: CNPJ string (formatted or unformatted)

        Returns:
            str: Cleaned CNPJ (digits only) for storage

        Raises:
            ValidationError: If CNPJ format or check digits are invalid
        """
        # Remove formatting characters
        cleaned_cnpj = "".join(filter(str.isdigit, value))

        # Check length (CNPJ must have exactly 14 digits)
        if len(cleaned_cnpj) != 14:
            raise serializers.ValidationError("CNPJ deve conter exatamente 14 dígitos")

        # Validate check digits using pycpfcnpj library
        if not cnpj_validator.validate(cleaned_cnpj):
            raise serializers.ValidationError("CNPJ inválido. Verifique os dígitos verificadores.")

        # Return cleaned CNPJ (digits only) for storage
        return cleaned_cnpj

    def validate_contact_person_phone(self, value):
        """Validate phone number format (basic check)."""
        # Remove common formatting characters
        cleaned = "".join(filter(str.isdigit, value))

        if len(cleaned) < 10 or len(cleaned) > 15:
            raise serializers.ValidationError("Telefone deve conter entre 10 e 15 dígitos")

        return value
