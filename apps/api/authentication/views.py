"""
Authentication views.
Thin controllers that coordinate serializers and services.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError

from authentication.serializers import (
    CandidateRegistrationSerializer,
    RegistrationResponseSerializer
)
from authentication.services import CandidateRegistrationService


class RegistrationRateThrottle(AnonRateThrottle):
    """
    Rate limiting for registration endpoints.

    Per constraint security2: 10 registrations/hour per IP
    """
    rate = '10/hour'


@api_view(['POST'])
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

        # Serialize response
        response_data = {
            'user': {
                'id': str(result['user'].id),
                'email': result['user'].email,
                'role': result['user'].role
            },
            'token': result['token']
        }

        return Response(
            response_data,
            status=status.HTTP_201_CREATED
        )

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
