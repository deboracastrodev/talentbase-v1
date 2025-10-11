"""
Authentication views.
Thin controllers that coordinate serializers and services.
"""

import logging

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

from authentication.serializers import (
    CandidateRegistrationSerializer,
    CompanyRegistrationSerializer,
    LoginResponseSerializer,
    LoginSerializer,
    RegistrationResponseSerializer,
)
from authentication.services import CandidateRegistrationService, CompanyRegistrationService


class RegistrationRateThrottle(AnonRateThrottle):
    """
    Rate limiting for registration endpoints.

    Per constraint security2: 10 registrations/hour per IP
    """

    rate = "10/hour"


class LoginRateThrottle(AnonRateThrottle):
    """
    Rate limiting for login endpoint.

    Per Story 2.3 security requirement: 5 login attempts per minute per IP
    """

    rate = "5/min"


@api_view(["POST"])
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
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Delegate to service layer (constraint arch1: thin controllers)
        result = CandidateRegistrationService.register_candidate(
            data=serializer.validated_data, created_by_admin=False  # Self-service registration
        )

        # Serialize response using RegistrationResponseSerializer for type-safe output
        # Fixes MED-2: Ensures consistent, safe serialization without manual dict construction
        response_serializer = RegistrationResponseSerializer(
            {"user": result["user"], "token": result["token"]}
        )

        # Create response
        response = Response(response_serializer.data, status=status.HTTP_201_CREATED)

        # Fixes MED-1: Set token as httpOnly cookie for XSS protection
        # Per Tech Spec Epic 2: "Token stored in httpOnly cookie (XSS protection)"
        # Cookie attributes:
        # - httponly=True: Prevents JavaScript access (XSS protection)
        # - secure: True in production (HTTPS only), False in dev (HTTP allowed)
        # - samesite='Strict': CSRF protection (production), 'Lax' in dev for easier testing
        # - max_age=604800: 7 days (7 * 24 * 60 * 60 seconds)
        response.set_cookie(
            key="auth_token",
            value=result["token"],
            max_age=604800,  # 7 days
            httponly=True,
            secure=not settings.DEBUG,  # True in production, False in development
            samesite="Strict" if not settings.DEBUG else "Lax",
            path="/",
        )

        return response

    except DjangoValidationError as e:
        # AC9: Handle duplicate email and validation errors
        # Extract message from ValidationError (handles both string and list formats)
        error_message = e.message if hasattr(e, "message") else str(e)
        if isinstance(error_message, list):
            error_message = error_message[0] if error_message else "Erro de validação"
        return Response({"errors": {"detail": error_message}}, status=status.HTTP_400_BAD_REQUEST)

    except IntegrityError as e:
        # AC9: Database integrity errors (e.g., duplicate email)
        if "email" in str(e):
            return Response(
                {"errors": {"email": "Usuário com este email já existe"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Other integrity errors
        return Response(
            {"errors": {"detail": "Erro de integridade no banco de dados"}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception:
        # Unexpected errors
        return Response(
            {"errors": {"detail": "Erro interno do servidor"}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
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
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Delegate to service layer (constraint arch1: thin controllers)
        result = CompanyRegistrationService.register_company(
            data=serializer.validated_data, created_by_admin=False  # Self-service registration
        )

        # Serialize response
        response_serializer = RegistrationResponseSerializer(
            {"user": result["user"], "token": result["token"]}
        )

        # Per AC10: Add success message
        response_data = response_serializer.data
        response_data["message"] = "Registro enviado, voce recebera aprovacao em 24 horas"

        # Create response
        response = Response(response_data, status=status.HTTP_201_CREATED)

        # Set token as httpOnly cookie for XSS protection
        # Per constraint api1 and Tech Spec: Same pattern as candidate registration
        response.set_cookie(
            key="auth_token",
            value=result["token"],
            max_age=604800,  # 7 days
            httponly=True,
            secure=not settings.DEBUG,  # True in production, False in development
            samesite="Strict" if not settings.DEBUG else "Lax",
            path="/",
        )

        return response

    except DjangoValidationError as e:
        # Handle validation errors (e.g., duplicate email)
        # Extract message from ValidationError (handles both string and list formats)
        error_message = e.message if hasattr(e, "message") else str(e)
        if isinstance(error_message, list):
            error_message = error_message[0] if error_message else "Erro de validação"
        return Response({"errors": {"detail": error_message}}, status=status.HTTP_400_BAD_REQUEST)

    except IntegrityError as e:
        # Database integrity errors (e.g., duplicate email)
        if "email" in str(e):
            return Response(
                {"errors": {"email": "Usuário com este email já existe"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {"errors": {"detail": "Erro de integridade no banco de dados"}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception:
        # Unexpected errors
        return Response(
            {"errors": {"detail": "Erro interno do servidor"}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@authentication_classes([])  # No authentication required - disables CSRF for this view
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login(request):
    """
    Login user with email and password.

    **Endpoint:** POST /api/v1/auth/login

    **Request Body:**
    ```json
    {
        "email": "user@example.com",
        "password": "SecurePass123!"
    }
    ```

    **Response 200:**
    ```json
    {
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "role": "candidate",
            "is_active": true
        },
        "token": "auth_token_string",
        "redirect_url": "/candidate"
    }
    ```

    **Error Responses:**
    - 401: Invalid credentials or inactive account
    - 429: Rate limit exceeded (5 attempts/minute per IP)

    **AC Mapping:**
    - AC3: Endpoint API POST /api/v1/auth/login
    - AC4: Token generated on authentication (DRF Token Auth)
    - AC5: Token stored in httpOnly cookie
    - AC6: Role-based redirect URL returned
    - AC7: Generic error message for invalid credentials
    - AC8: Error message for inactive/pending accounts

    **Architecture:**
    Thin controller per Clean Architecture.
    Uses Django's built-in authentication and DRF Token.
    """
    from rest_framework.authtoken.models import Token

    from authentication.models import User

    # Validate input data
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    try:
        # Get user by email (case-insensitive)
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # AC7: Generic error message (prevent user enumeration)
        return Response(
            {"error": "Credenciais inválidas", "code": "INVALID_CREDENTIALS"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Check password
    if not user.check_password(password):
        # AC7: Generic error message (prevent user enumeration)
        return Response(
            {"error": "Credenciais inválidas", "code": "INVALID_CREDENTIALS"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # AC8: Check if account is active
    if not user.is_active:
        # For company users, check if it's pending approval
        if user.role == "company":
            return Response(
                {
                    "error": "Sua conta está aguardando aprovação. Você será notificado em até 24 horas.",
                    "code": "ACCOUNT_PENDING",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        else:
            return Response(
                {
                    "error": "Sua conta está inativa. Entre em contato com o suporte.",
                    "code": "ACCOUNT_INACTIVE",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

    # AC4: Generate JWT tokens (access + refresh)
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # AC6: Determine redirect URL based on role and status
    redirect_url = get_redirect_url(user.role, user.is_active)

    # Prepare response data
    response_serializer = LoginResponseSerializer(
        {"user": user, "token": access_token, "redirect_url": redirect_url}
    )

    # Create response
    response = Response(response_serializer.data, status=status.HTTP_200_OK)

    # AC5: Set access token as httpOnly cookie
    # JWT has built-in expiration, so we use a shorter max_age
    response.set_cookie(
        key="auth_token",
        value=access_token,
        max_age=3600,  # 1 hour (matches JWT access token expiration)
        httponly=True,
        secure=not settings.DEBUG,  # True in production, False in development
        samesite="Strict" if not settings.DEBUG else "Lax",
        path="/",
    )

    # Also set refresh token as httpOnly cookie for token refresh
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=604800,  # 7 days (refresh token lives longer)
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Strict" if not settings.DEBUG else "Lax",
        path="/",
    )

    return response


def get_redirect_url(role: str, is_active: bool) -> str:
    """
    Determine redirect URL based on user role and status.

    Per Story 2.3 AC6: Role-based redirects
    - admin → /admin
    - candidate → /candidate
    - company (active) → /company
    - company (pending) → /auth/registration-pending

    Args:
        role: User's role (admin/candidate/company)
        is_active: Whether user account is active

    Returns:
        str: Redirect URL path
    """
    if role == "admin":
        return "/admin"
    elif role == "candidate":
        return "/candidate"
    elif role == "company":
        return "/company" if is_active else "/auth/registration-pending"
    else:
        return "/"


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current authenticated user information.

    **Endpoint:** GET /api/v1/auth/me

    **Headers:**
    ```
    Authorization: Bearer <jwt_token>
    ```

    **Response 200:**
    ```json
    {
        "id": "uuid",
        "email": "user@example.com",
        "role": "admin|candidate|company",
        "name": "User Name",
        "is_active": true
    }
    ```

    **Error Responses:**
    - 401: Unauthorized (invalid or missing token)

    **Purpose:**
    This endpoint is used by the frontend to validate JWT tokens
    and retrieve user information for role-based access control (RBAC).

    **Security:**
    - Requires valid JWT token in Authorization header
    - Token is validated by JWTAuthentication backend
    - Returns minimal user info needed for frontend auth
    """
    user = request.user

    # Build user data response
    user_data = {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }

    # Add name based on role
    if user.role == "candidate" and hasattr(user, "candidate_profile"):
        user_data["name"] = user.candidate_profile.full_name
    elif user.role == "company" and hasattr(user, "company_profile"):
        user_data["name"] = user.company_profile.company_name
    else:
        # Admin or no profile
        user_data["name"] = user.email.split("@")[0].title()

    return Response(user_data, status=status.HTTP_200_OK)


# Story 3.3.5: Admin Manual Candidate Creation


@api_view(["POST"])
@permission_classes([AllowAny])
def set_password_with_token(request):
    """
    Set password using password reset token.

    Story 3.3.5 - AC 21, 22, 23: Candidate sets password after admin creates account.

    POST /api/v1/auth/set-password
    Body: {
        token: str (UUID),
        password: str (min 8 chars)
    }

    Returns:
        200: {
            access_token: str (JWT),
            user: { id, email, role }
        }
        400: { error: 'Invalid or expired token' } or validation errors
    """
    from django.utils import timezone
    from rest_framework_simplejwt.tokens import RefreshToken

    from .models import User
    from .serializers import SetPasswordSerializer

    serializer = SetPasswordSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = serializer.validated_data["token"]
        password = serializer.validated_data["password"]

        # Find user with this token
        try:
            user = User.objects.get(password_reset_token=token)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if token is expired
        if not user.password_reset_token_expires:
            return Response(
                {"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST
            )

        if timezone.now() > user.password_reset_token_expires:
            return Response(
                {"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Set password and clear reset fields
        user.set_password(password)
        user.password_reset_required = False
        user.password_reset_token = None
        user.password_reset_token_expires = None
        user.save()

        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        logger.info(
            f"User {user.id} set password via token",
            extra={"user_id": str(user.id), "email": user.email},
        )

        return Response(
            {
                "access_token": access_token,
                "user": {"id": str(user.id), "email": user.email, "role": user.role},
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        logger.error(f"Error setting password with token: {e}")
        return Response(
            {"error": "Erro ao definir senha"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
