"""
Authentication views.
Thin controllers that coordinate serializers and services.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from django.conf import settings

from authentication.serializers import (
    CandidateRegistrationSerializer,
    CompanyRegistrationSerializer,
    RegistrationResponseSerializer
)
from authentication.services import CandidateRegistrationService, CompanyRegistrationService


class RegistrationRateThrottle(AnonRateThrottle):
    """
    Rate limiting for registration endpoints.

    Per constraint security2: 10 registrations/hour per IP
    """
    rate = '10/hour'


@api_view(['POST'])
@authentication_classes([])  # No authentication required - disables CSRF for this view
@permission_classes([AllowAny])
@throttle_classes([RegistrationRateThrottle])
def register_candidate(request):
    """
    Register a new candidate user.

    **Endpoint:** POST /api/v1/auth/register/candidate

    **Request Body:**
    ```json
    {
        "email": "candidate@example.com",
        "password": "SecurePass123!",
        "full_name": "João Silva",
        "phone": "11999999999"
    }
    ```

    **Response 201:**
    ```json
    {
        "user": {
            "id": "uuid",
            "email": "candidate@example.com",
            "role": "candidate"
        },
        "token": "auth_token_string"
    }
    ```

    **Error Responses:**
    - 400: Validation errors or duplicate email
    - 429: Rate limit exceeded (10 registrations/hour per IP)

    **AC Mapping:**
    - AC4: Endpoint API POST /api/v1/auth/register/candidate
    - AC5: Password hashed using Django default PBKDF2
    - AC6: User created with role='candidate', is_active=True
    - AC7: Email sent asynchronously (via Celery)
    - AC9: Duplicate email error handling

    **Architecture:**
    This is a thin controller per Clean Architecture (constraint arch1).
    Business logic is in CandidateRegistrationService.
    """
    # Validate input data
    serializer = CandidateRegistrationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Delegate to service layer (constraint arch1: thin controllers)
        result = CandidateRegistrationService.register_candidate(
            data=serializer.validated_data,
            created_by_admin=False  # Self-service registration
        )

        # Serialize response using RegistrationResponseSerializer for type-safe output
        # Fixes MED-2: Ensures consistent, safe serialization without manual dict construction
        response_serializer = RegistrationResponseSerializer({
            'user': result['user'],
            'token': result['token']
        })

        # Create response
        response = Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )

        # Fixes MED-1: Set token as httpOnly cookie for XSS protection
        # Per Tech Spec Epic 2: "Token stored in httpOnly cookie (XSS protection)"
        # Cookie attributes:
        # - httponly=True: Prevents JavaScript access (XSS protection)
        # - secure: True in production (HTTPS only), False in dev (HTTP allowed)
        # - samesite='Strict': CSRF protection (production), 'Lax' in dev for easier testing
        # - max_age=604800: 7 days (7 * 24 * 60 * 60 seconds)
        response.set_cookie(
            key='auth_token',
            value=result['token'],
            max_age=604800,  # 7 days
            httponly=True,
            secure=not settings.DEBUG,  # True in production, False in development
            samesite='Strict' if not settings.DEBUG else 'Lax',
            path='/'
        )

        return response

    except DjangoValidationError as e:
        # AC9: Handle duplicate email and validation errors
        return Response(
            {'errors': {'detail': str(e)}},
            status=status.HTTP_400_BAD_REQUEST
        )

    except IntegrityError as e:
        # AC9: Database integrity errors (e.g., duplicate email)
        if 'email' in str(e):
            return Response(
                {'errors': {'email': ['User with this email already exists']}},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Other integrity errors
        return Response(
            {'errors': {'detail': 'Database integrity error'}},
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        # Unexpected errors
        return Response(
            {'errors': {'detail': 'Internal server error'}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([])  # No authentication required - disables CSRF for this view
@permission_classes([AllowAny])
@throttle_classes([RegistrationRateThrottle])
def register_company(request):
    """
    Register a new company user.

    **Endpoint:** POST /api/v1/auth/register/company

    **Request Body:**
    ```json
    {
        "email": "company@example.com",
        "password": "SecurePass123!",
        "company_name": "Tech Corp LTDA",
        "cnpj": "12.345.678/0001-90",
        "website": "https://techcorp.com",
        "contact_person_name": "João Silva",
        "contact_person_email": "joao@techcorp.com",
        "contact_person_phone": "11999999999",
        "industry": "SaaS",
        "size": "11-50",
        "description": "Tech company"
    }
    ```

    **Response 201:**
    ```json
    {
        "user": {
            "id": "uuid",
            "email": "company@example.com",
            "role": "company"
        },
        "token": "auth_token_string",
        "message": "Registro enviado, você receberá aprovação em 24 horas"
    }
    ```

    **Error Responses:**
    - 400: Validation errors (invalid CNPJ, duplicate email, etc.)
    - 429: Rate limit exceeded (10 registrations/hour per IP)

    **AC Mapping:**
    - AC2: Form fields validated via serializer
    - AC3: CNPJ validation (format + check digits)
    - AC4: Endpoint API POST /api/v1/auth/register/company
    - AC5: User created with role='company', is_active=False (pending approval)
    - AC6: CompanyProfile created and linked to User
    - AC7: Email sent to company (registration received)
    - AC8: Email sent to admin (new company requires approval)
    - AC10: Success message returned

    **Architecture:**
    Thin controller per Clean Architecture (constraint arch1).
    Business logic is in CompanyRegistrationService.
    """
    # Validate input data
    serializer = CompanyRegistrationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Delegate to service layer (constraint arch1: thin controllers)
        result = CompanyRegistrationService.register_company(
            data=serializer.validated_data,
            created_by_admin=False  # Self-service registration
        )

        # Serialize response
        response_serializer = RegistrationResponseSerializer({
            'user': result['user'],
            'token': result['token']
        })

        # Per AC10: Add success message
        response_data = response_serializer.data
        response_data['message'] = "Registro enviado, voce recebera aprovacao em 24 horas"

        # Create response
        response = Response(
            response_data,
            status=status.HTTP_201_CREATED
        )

        # Set token as httpOnly cookie for XSS protection
        # Per constraint api1 and Tech Spec: Same pattern as candidate registration
        response.set_cookie(
            key='auth_token',
            value=result['token'],
            max_age=604800,  # 7 days
            httponly=True,
            secure=not settings.DEBUG,  # True in production, False in development
            samesite='Strict' if not settings.DEBUG else 'Lax',
            path='/'
        )

        return response

    except DjangoValidationError as e:
        # Handle validation errors (e.g., duplicate email)
        return Response(
            {'errors': {'detail': str(e)}},
            status=status.HTTP_400_BAD_REQUEST
        )

    except IntegrityError as e:
        # Database integrity errors (e.g., duplicate email)
        if 'email' in str(e):
            return Response(
                {'errors': {'email': ['User with this email already exists']}},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            {'errors': {'detail': 'Database integrity error'}},
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        # Unexpected errors
        return Response(
            {'errors': {'detail': 'Internal server error'}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
