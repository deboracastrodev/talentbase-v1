"""
Candidate views module.
API endpoints for candidate profile management.
Story 3.1: Multi-step wizard profile creation with S3 uploads.
Story 3.2: Public shareable profile with token-based access.
Story 3.3: CSV bulk import for admin users (Notion migration).
"""

import logging

from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsCandidate
from core.utils.s3 import delete_s3_object, generate_presigned_url, validate_s3_url

from .models import CandidateProfile
from .serializers import (
    CandidateProfileDraftSerializer,
    CandidateProfileSerializer,
    ContactCandidateSerializer,
    PublicCandidateProfileSerializer,
)
from .services.sharing import SharingService

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsCandidate])
def get_upload_url(request):
    """
    Generate presigned URL for S3 upload (photo or video).

    Query params:
        filename (str): Original filename
        content_type (str): MIME type (image/jpeg, image/png, video/mp4, etc.)
        type (str): Upload type - 'photo' or 'video'

    Returns:
        200: {
            'url': S3 POST endpoint,
            'fields': Form fields for upload,
            'file_url': Final URL of uploaded file,
            'expires_in': Seconds until URL expires
        }
        400: { 'error': 'message' }

    Example:
        GET /api/v1/candidates/upload-url?filename=photo.jpg&content_type=image/jpeg&type=photo
    """
    filename = request.query_params.get("filename")
    content_type = request.query_params.get("content_type")
    upload_type = request.query_params.get("type", "photo")

    # Validate parameters
    if not filename or not content_type:
        return Response(
            {"error": "filename and content_type are required"}, status=status.HTTP_400_BAD_REQUEST
        )

    if upload_type not in ["photo", "video"]:
        return Response(
            {"error": 'type must be "photo" or "video"'}, status=status.HTTP_400_BAD_REQUEST
        )

    # Validate content type
    if upload_type == "photo":
        if content_type not in settings.ALLOWED_IMAGE_TYPES:
            return Response(
                {"error": f"Content type must be one of {settings.ALLOWED_IMAGE_TYPES} for photos"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        expiry = settings.AWS_PRESIGNED_EXPIRY
    else:  # video
        if content_type not in settings.ALLOWED_VIDEO_TYPES:
            return Response(
                {"error": f"Content type must be one of {settings.ALLOWED_VIDEO_TYPES} for videos"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        expiry = settings.VIDEO_PRESIGNED_EXPIRY

    try:
        # Generate presigned URL
        presigned_data = generate_presigned_url(filename, content_type, upload_type)

        return Response(
            {
                "url": presigned_data["url"],
                "fields": presigned_data["fields"],
                "file_url": presigned_data["file_url"],
                "expires_in": expiry,
            },
            status=status.HTTP_200_OK,
        )

    except ValueError as e:
        logger.warning(
            f"Invalid upload request: {e}",
            extra={"user": request.user.id, "filename": filename, "content_type": content_type},
        )
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(
            f"Error generating presigned URL: {e}",
            extra={"user": request.user.id, "filename": filename, "content_type": content_type},
        )
        return Response(
            {"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsCandidate])
def create_candidate_profile(request):
    """
    Create complete candidate profile with experiences.

    Auth: Required (candidate role)
    Body: Full CandidateProfile data + experiences array

    Validations:
    - Check if user already has a CandidateProfile (409 Conflict)
    - Validate pitch_video_url is required
    - Validate pitch_video_type matches URL (s3 or youtube)
    - Sanitize bio field (XSS prevention)
    - Validate S3 URLs are from our bucket

    Returns:
        201: { id, public_token, ...profile data }
        409: { 'error': 'You already have a profile' }
        400: { 'error': { field: ['message'] } }

    Example:
        POST /api/v1/candidates
        {
            "full_name": "João Silva",
            "phone": "(11) 98765-4321",
            "city": "São Paulo",
            "profile_photo_url": "https://...",
            "pitch_video_url": "https://...",
            "pitch_video_type": "s3",
            "current_position": "SDR/BDR",
            "years_of_experience": 3,
            ...
            "experiences": [...]
        }
    """
    # Check if user already has a profile
    if hasattr(request.user, "candidate_profile"):
        return Response({"error": "You already have a profile"}, status=status.HTTP_409_CONFLICT)

    # Add user to data
    data = request.data.copy()
    data["user"] = request.user.id

    serializer = CandidateProfileSerializer(data=data)

    if serializer.is_valid():
        profile = serializer.save(user=request.user)

        logger.info(
            f"Created candidate profile for user {request.user.id}",
            extra={"profile_id": profile.id, "user_id": request.user.id},
        )

        return Response(CandidateProfileSerializer(profile).data, status=status.HTTP_201_CREATED)

    logger.warning(f"Invalid profile data: {serializer.errors}", extra={"user_id": request.user.id})

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsCandidate])
def save_draft(request, pk):
    """
    Save partial profile data as draft (no validation).

    Auth: Required (candidate role, owner only)
    Body: Partial CandidateProfile data

    No validation - allows incomplete data including missing pitch video.

    Returns:
        200: { ...updated profile data }
        404: { 'error': 'Profile not found' }
        403: { 'error': 'You can only edit your own profile' }

    Example:
        PATCH /api/v1/candidates/123/draft
        {
            "bio": "Updated bio...",
            "tools_software": ["Salesforce", "HubSpot"]
        }
    """
    try:
        profile = CandidateProfile.objects.get(pk=pk)
    except CandidateProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check ownership
    if profile.user != request.user:
        return Response(
            {"error": "You can only edit your own profile"}, status=status.HTTP_403_FORBIDDEN
        )

    serializer = CandidateProfileDraftSerializer(
        profile, data=request.data, partial=True, context={"is_draft": True}
    )

    if serializer.is_valid():
        serializer.save()

        logger.info(
            f"Saved draft for profile {pk}", extra={"profile_id": pk, "user_id": request.user.id}
        )

        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsCandidate])
def update_profile_photo(request, pk):
    """
    Update profile photo (deletes old photo from S3).

    Auth: Required (candidate role, owner only)
    Body: { 'profile_photo_url': 'https://...' }

    Side effect: Deletes previous photo from S3

    Returns:
        200: { ...updated profile data }
        404: { 'error': 'Profile not found' }
        403: { 'error': 'You can only edit your own profile' }
        400: { 'error': 'Invalid photo URL' }

    Example:
        PUT /api/v1/candidates/123/photo
        {
            "profile_photo_url": "https://talentbase-dev-uploads.s3.amazonaws.com/candidate-photos/abc.jpg"
        }
    """
    try:
        profile = CandidateProfile.objects.get(pk=pk)
    except CandidateProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check ownership
    if profile.user != request.user:
        return Response(
            {"error": "You can only edit your own profile"}, status=status.HTTP_403_FORBIDDEN
        )

    new_photo_url = request.data.get("profile_photo_url")

    if not new_photo_url:
        return Response(
            {"error": "profile_photo_url is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Validate URL
    if not validate_s3_url(new_photo_url):
        return Response(
            {"error": "Photo URL must be from TalentBase S3 bucket"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Delete old photo if exists
    if profile.profile_photo_url and profile.profile_photo_url != new_photo_url:
        delete_s3_object(profile.profile_photo_url)
        logger.info(f"Deleted old photo for profile {pk}")

    # Update photo URL
    profile.profile_photo_url = new_photo_url
    profile.save()

    logger.info(
        f"Updated photo for profile {pk}", extra={"profile_id": pk, "user_id": request.user.id}
    )

    return Response(CandidateProfileSerializer(profile).data, status=status.HTTP_200_OK)


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsCandidate])
def update_pitch_video(request, pk):
    """
    Update pitch video (deletes old video from S3 if type='s3').

    Auth: Required (candidate role, owner only)
    Body: {
        'pitch_video_url': 'https://...',
        'pitch_video_type': 's3' or 'youtube'
    }

    Side effect: If old video was S3, deletes it from S3

    Returns:
        200: { ...updated profile data }
        404: { 'error': 'Profile not found' }
        403: { 'error': 'You can only edit your own profile' }
        400: { 'error': 'Invalid video URL' }

    Example:
        PUT /api/v1/candidates/123/video
        {
            "pitch_video_url": "https://youtube.com/watch?v=abc123",
            "pitch_video_type": "youtube"
        }
    """
    try:
        profile = CandidateProfile.objects.get(pk=pk)
    except CandidateProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check ownership
    if profile.user != request.user:
        return Response(
            {"error": "You can only edit your own profile"}, status=status.HTTP_403_FORBIDDEN
        )

    new_video_url = request.data.get("pitch_video_url")
    new_video_type = request.data.get("pitch_video_type")

    if not new_video_url or not new_video_type:
        return Response(
            {"error": "pitch_video_url and pitch_video_type are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate based on type
    if new_video_type == "s3":
        if not validate_s3_url(new_video_url):
            return Response(
                {"error": "Video URL must be from TalentBase S3 bucket"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    elif new_video_type == "youtube":
        # Basic YouTube validation (serializer has full regex)
        if "youtube.com" not in new_video_url and "youtu.be" not in new_video_url:
            return Response({"error": "Invalid YouTube URL"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(
            {"error": 'pitch_video_type must be "s3" or "youtube"'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Delete old video if it was S3
    if (
        profile.pitch_video_url
        and profile.pitch_video_type == "s3"
        and profile.pitch_video_url != new_video_url
    ):
        delete_s3_object(profile.pitch_video_url)
        logger.info(f"Deleted old S3 video for profile {pk}")

    # Update video
    profile.pitch_video_url = new_video_url
    profile.pitch_video_type = new_video_type
    profile.save()

    logger.info(
        f"Updated pitch video for profile {pk}",
        extra={"profile_id": pk, "user_id": request.user.id, "video_type": new_video_type},
    )

    return Response(CandidateProfileSerializer(profile).data, status=status.HTTP_200_OK)


# Story 3.2: Public sharing endpoints


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsCandidate])
def generate_share_token(request, pk):
    """
    Generate or regenerate public share token for candidate profile.

    Creates a unique UUID token and enables public sharing.
    Previous token is automatically invalidated.

    Auth: Required (candidate role, owner only)

    Returns:
        200: {
            'share_token': 'uuid-string',
            'share_url': 'https://domain.com/share/candidate/uuid',
            'generated_at': '2025-01-01T00:00:00Z'
        }
        404: { 'error': 'Profile not found' }
        403: { 'error': 'You can only generate token for your own profile' }
        400: { 'error': 'Profile must be complete to generate public link' }

    Example:
        POST /api/v1/candidates/123/generate-share-token
    """
    try:
        profile = CandidateProfile.objects.get(pk=pk)
    except CandidateProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check ownership
    if profile.user != request.user:
        return Response(
            {"error": "You can only generate token for your own profile"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        share_data = SharingService.generate_share_token(profile)

        logger.info(
            f"Generated share token for profile {pk}",
            extra={
                "profile_id": pk,
                "user_id": request.user.id,
                "share_token": share_data["share_token"],
            },
        )

        return Response(share_data, status=status.HTTP_200_OK)

    except ValidationError as e:
        logger.warning(
            f"Cannot generate share token: {e}",
            extra={"profile_id": pk, "user_id": request.user.id},
        )
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsCandidate])
def toggle_sharing(request, pk):
    """
    Enable or disable public sharing for candidate profile.

    When disabled, public URL returns 404.
    Token remains the same, can be re-enabled anytime.

    Auth: Required (candidate role, owner only)
    Body: { 'enabled': true/false }

    Returns:
        200: { 'public_sharing_enabled': true/false }
        404: { 'error': 'Profile not found' }
        403: { 'error': 'You can only toggle sharing for your own profile' }
        400: { 'error': 'enabled field is required' }

    Example:
        PATCH /api/v1/candidates/123/toggle-sharing
        { "enabled": false }
    """
    try:
        profile = CandidateProfile.objects.get(pk=pk)
    except CandidateProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check ownership
    if profile.user != request.user:
        return Response(
            {"error": "You can only toggle sharing for your own profile"},
            status=status.HTTP_403_FORBIDDEN,
        )

    enabled = request.data.get("enabled")

    if enabled is None:
        return Response(
            {"error": "enabled field is required (true or false)"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    new_status = SharingService.toggle_sharing(profile, bool(enabled))

    logger.info(
        f"Toggled sharing for profile {pk}: {new_status}",
        extra={"profile_id": pk, "user_id": request.user.id, "enabled": new_status},
    )

    return Response({"public_sharing_enabled": new_status}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_public_profile(request, token):
    """
    Get public candidate profile by share token.

    No authentication required - public endpoint.

    Returns:
        200: Public profile data (excludes CPF, phone, email, etc.)
        404: { 'error': 'Profile not found or sharing is disabled' }

    Example:
        GET /api/v1/public/candidates/550e8400-e29b-41d4-a716-446655440000
    """
    profile = SharingService.get_public_profile(token)

    if not profile:
        logger.warning(f"Public profile not found for token: {token}")
        return Response(
            {"error": "Profile not found or sharing is disabled"}, status=status.HTTP_404_NOT_FOUND
        )

    logger.info("Public profile accessed", extra={"profile_id": profile.id, "token": token})

    serializer = PublicCandidateProfileSerializer(profile)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def contact_candidate(request, token):
    """
    Send contact request for candidate profile.

    No authentication required - public endpoint.

    Body: {
        'name': 'Nome do interessado',
        'email': 'email@example.com',
        'message': 'Mensagem de contato'
    }

    Sends email to admin with contact details.

    Returns:
        200: { 'message': 'Contact request sent successfully' }
        404: { 'error': 'Profile not found or sharing is disabled' }
        400: { 'error': { field: ['message'] } }

    Example:
        POST /api/v1/public/candidates/550e8400-e29b-41d4-a716-446655440000/contact
        {
            "name": "João Recrutador",
            "email": "joao@empresa.com",
            "message": "Gostaria de conversar sobre uma oportunidade..."
        }
    """
    profile = SharingService.get_public_profile(token)

    if not profile:
        return Response(
            {"error": "Profile not found or sharing is disabled"}, status=status.HTTP_404_NOT_FOUND
        )

    serializer = ContactCandidateSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        SharingService.send_contact_request(
            candidate=profile,
            contact_name=serializer.validated_data["name"],
            contact_email=serializer.validated_data["email"],
            message=serializer.validated_data["message"],
        )

        logger.info(
            f"Contact request sent for profile {profile.id}",
            extra={"profile_id": profile.id, "contact_email": serializer.validated_data["email"]},
        )

        return Response({"message": "Contact request sent successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error sending contact request: {e}", extra={"profile_id": profile.id})
        return Response(
            {"error": "Failed to send contact request"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Story 3.3: CSV Import Views (Admin Only)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def parse_csv(request):
    """
    Parse uploaded CSV file and return column mapping suggestions.

    Story 3.3 - AC 3, 4: Upload CSV and show column mapping interface.

    POST /api/v1/admin/candidates/parse-csv
    Body: multipart/form-data with 'file' field

    Returns:
        200: {
            columns: [...],
            preview_rows: [...],
            suggested_mapping: {...},
            total_rows: int,
            file_id: str
        }
        400: Validation error
        403: Not admin user
    """
    import os
    import uuid

    from candidates.serializers import CSVUploadSerializer
    from candidates.services.csv_import import CSVImportService

    # Check admin permission
    if not request.user.is_staff and request.user.role != "admin":
        return Response(
            {"error": "Apenas administradores podem importar CSV"}, status=status.HTTP_403_FORBIDDEN
        )

    serializer = CSVUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        uploaded_file = serializer.validated_data["file"]

        # Parse CSV
        parse_result = CSVImportService.parse_csv_file(uploaded_file)

        # Save file temporarily for import
        file_id = str(uuid.uuid4())
        temp_dir = os.path.join(settings.MEDIA_ROOT or "/tmp", "csv_imports")
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, f"{file_id}.csv")

        # Reset file pointer and save
        uploaded_file.seek(0)
        with open(temp_path, "wb") as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)

        parse_result["file_id"] = file_id

        logger.info(
            f"CSV parsed successfully by admin {request.user.id}: "
            f"{parse_result['total_rows']} rows, {len(parse_result['columns'])} columns"
        )

        return Response(parse_result, status=status.HTTP_200_OK)

    except ValueError as e:
        logger.warning(f"CSV parse error for admin {request.user.id}: {e}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Unexpected error parsing CSV for admin {request.user.id}: {e}")
        return Response(
            {"error": "Erro ao processar CSV"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def import_csv(request):
    """
    Trigger async CSV import task.

    Story 3.3 - AC 5, 6: Import CSV with column mapping and duplicate handling.

    POST /api/v1/admin/candidates/import
    Body: {
        file_id: str,
        column_mapping: {csv_col: model_field, ...},
        duplicate_strategy: 'skip' | 'update' | 'error'
    }

    Returns:
        202: {task_id: str}
        400: Validation error
        403: Not admin user
    """
    import os

    from candidates.serializers import CSVImportSerializer
    from candidates.tasks import process_csv_import

    # Check admin permission
    if not request.user.is_staff and request.user.role != "admin":
        return Response(
            {"error": "Apenas administradores podem importar CSV"}, status=status.HTTP_403_FORBIDDEN
        )

    serializer = CSVImportSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        file_id = serializer.validated_data["file_id"]
        column_mapping = serializer.validated_data["column_mapping"]
        duplicate_strategy = serializer.validated_data["duplicate_strategy"]

        # Get file path
        temp_dir = os.path.join(settings.MEDIA_ROOT or "/tmp", "csv_imports")
        file_path = os.path.join(temp_dir, f"{file_id}.csv")

        if not os.path.exists(file_path):
            return Response(
                {"error": "Arquivo CSV não encontrado. Faça upload novamente."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Trigger async task
        task = process_csv_import.delay(
            file_path=file_path,
            column_mapping=column_mapping,
            duplicate_strategy=duplicate_strategy,
            admin_user_id=str(request.user.id),
        )

        logger.info(
            f"CSV import task {task.id} started by admin {request.user.id}: "
            f"{len(column_mapping)} columns mapped, strategy={duplicate_strategy}"
        )

        return Response({"task_id": task.id}, status=status.HTTP_202_ACCEPTED)

    except Exception as e:
        logger.error(f"Error starting CSV import for admin {request.user.id}: {e}")
        return Response(
            {"error": "Erro ao iniciar importação"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def import_status(request, task_id):
    """
    Get import task status and progress.

    Story 3.3 - AC 7: Progress indicator (X de Y candidatos processados).

    GET /api/v1/admin/candidates/import/<task_id>/status

    Returns:
        200: {
            task_id: str,
            status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE',
            progress: int (0-100),
            current: int,
            total: int,
            success: int,
            errors: int
        }
        403: Not admin user
        404: Task not found
    """
    from celery.result import AsyncResult

    # Check admin permission
    if not request.user.is_staff and request.user.role != "admin":
        return Response(
            {"error": "Apenas administradores podem ver status de importação"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        task = AsyncResult(task_id)

        response_data = {
            "task_id": task_id,
            "status": task.state,
        }

        if task.state == "PROGRESS":
            info = task.info
            response_data.update(
                {
                    "progress": info.get("progress", 0),
                    "current": info.get("current", 0),
                    "total": info.get("total", 0),
                    "success": info.get("success", 0),
                    "errors": info.get("errors", 0),
                }
            )
        elif task.state == "SUCCESS":
            response_data.update({"progress": 100, "result": task.result})

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error fetching task status {task_id}: {e}")
        return Response(
            {"error": "Erro ao buscar status da importação"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def import_result(request, task_id):
    """
    Get final import results.

    Story 3.3 - AC 8, 9: Import summary and error details.

    GET /api/v1/admin/candidates/import/<task_id>/result

    Returns:
        200: {
            total: int,
            success: int,
            skipped: int,
            errors: [{row, nome, email, error}, ...],
            error_file_url: str | null
        }
        403: Not admin user
        404: Task not found or not completed
    """
    from celery.result import AsyncResult

    # Check admin permission
    if not request.user.is_staff and request.user.role != "admin":
        return Response(
            {"error": "Apenas administradores podem ver resultados de importação"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        task = AsyncResult(task_id)

        if task.state != "SUCCESS":
            return Response(
                {"error": "Importação ainda não foi concluída"}, status=status.HTTP_404_NOT_FOUND
            )

        result = task.result

        # Generate error file URL if errors exist
        error_file_url = None
        if result.get("error_file_path"):
            error_file_url = request.build_absolute_uri(
                f"/api/v1/admin/candidates/import/{task_id}/error-log"
            )

        response_data = {
            "total": result.get("total", 0),
            "success": result.get("success", 0),
            "skipped": result.get("skipped", 0),
            "errors": result.get("errors", []),
            "error_file_url": error_file_url,
        }

        logger.info(
            f"Import results fetched for task {task_id}: "
            f"{response_data['success']} success, {len(response_data['errors'])} errors"
        )

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error fetching import result {task_id}: {e}")
        return Response(
            {"error": "Erro ao buscar resultado da importação"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_error_log(request, task_id):
    """
    Download error log CSV file.

    Story 3.3 - AC 9: Download de log de erros CSV (linhas que falharam com motivo).

    GET /api/v1/admin/candidates/import/<task_id>/error-log

    Returns:
        200: CSV file download
        403: Not admin user
        404: Task not found or no errors
    """
    import os

    from celery.result import AsyncResult
    from django.http import FileResponse, Http404

    # Check admin permission
    if not request.user.is_staff and request.user.role != "admin":
        return Response(
            {"error": "Apenas administradores podem baixar log de erros"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        task = AsyncResult(task_id)

        if task.state != "SUCCESS":
            raise Http404("Importação ainda não foi concluída")

        result = task.result
        error_file_path = result.get("error_file_path")

        if not error_file_path or not os.path.exists(error_file_path):
            raise Http404("Nenhum erro encontrado para esta importação")

        logger.info(f"Error log downloaded for task {task_id} by admin {request.user.id}")

        return FileResponse(
            open(error_file_path, "rb"),
            as_attachment=True,
            filename=f"import_errors_{task_id}.csv",
            content_type="text/csv",
        )

    except Http404:
        raise
    except Exception as e:
        logger.error(f"Error downloading error log {task_id}: {e}")
        return Response(
            {"error": "Erro ao baixar log de erros"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_candidates(request):
    """
    List all candidates with pagination and filters (admin only).
    Story 3.3 - AC10: Candidatos importados visíveis na lista admin.

    Query params:
        search (str): Search by name, email, or city
        status (str): Filter by status (available, hired, inactive)
        page (int): Page number (default: 1)
        page_size (int): Items per page (default: 20, max: 100)

    Returns:
        200: {
            'count': Total number of candidates,
            'next': URL to next page,
            'previous': URL to previous page,
            'results': List of candidates
        }
    """
    from django.db.models import Q
    from django.core.paginator import Paginator

    # Check if user is admin
    if request.user.role != "admin":
        return Response(
            {"error": "Acesso negado. Apenas administradores podem listar candidatos."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        # Get query params
        search = request.query_params.get("search", "").strip()
        status_filter = request.query_params.get("status", "").strip()
        page_number = int(request.query_params.get("page", 1))
        page_size = min(int(request.query_params.get("page_size", 20)), 100)

        # Build queryset
        queryset = CandidateProfile.objects.select_related("user").all()

        # Apply search filter
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(city__icontains=search)
            )

        # Apply status filter
        if status_filter and status_filter != "all":
            queryset = queryset.filter(status=status_filter)

        # Order by creation date (newest first)
        queryset = queryset.order_by("-created_at")

        # Paginate
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page_number)

        # Serialize results
        results = []
        for candidate in page_obj.object_list:
            results.append(
                {
                    "id": str(candidate.user.id),
                    "full_name": candidate.full_name,
                    "email": candidate.user.email if candidate.user else None,
                    "phone": candidate.phone,
                    "city": candidate.city,
                    "current_position": candidate.current_position,
                    "years_of_experience": candidate.years_of_experience,
                    "status": candidate.status,
                    "profile_photo_url": candidate.profile_photo_url,
                    "created_at": candidate.created_at.isoformat(),
                    "import_source": getattr(candidate, "import_source", None),
                }
            )

        # Build response
        base_url = request.build_absolute_uri(request.path)
        response_data = {
            "count": paginator.count,
            "next": (
                f"{base_url}?page={page_obj.next_page_number()}&page_size={page_size}"
                if page_obj.has_next()
                else None
            ),
            "previous": (
                f"{base_url}?page={page_obj.previous_page_number()}&page_size={page_size}"
                if page_obj.has_previous()
                else None
            ),
            "results": results,
        }

        logger.info(
            f"Admin {request.user.id} listed {len(results)} candidates (page {page_number})"
        )

        return Response(response_data, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response(
            {"error": "Parâmetros inválidos"}, status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error listing candidates: {e}")
        return Response(
            {"error": "Erro ao listar candidatos"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Story 3.3.5: Admin Manual Candidate Creation


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_create_candidate(request):
    """
    Create candidate manually with complete profile (admin only).

    Story 3.3.5 (Extended): Admin creates candidate with ALL CandidateProfile fields.

    POST /api/v1/admin/candidates/create
    Body: {
        # Required fields
        email: str (required),
        full_name: str (required),
        phone: str (required),
        city: str (required),

        # All other CandidateProfile fields (optional):
        # - Basic: linkedin, cpf, zip_code, profile_photo_url
        # - Professional: current_position, years_of_experience, sales_type, sales_cycle,
        #                 avg_ticket, academic_degree, bio
        # - Skills: top_skills[], tools_software[], solutions_sold[], departments_sold_to[], languages[]
        # - Preferences: work_model, relocation_availability, travel_availability, accepts_pj,
        #                pcd, is_pcd, position_interest, minimum_salary, salary_notes,
        #                has_drivers_license, has_vehicle
        # - Media: pitch_video_url, pitch_video_type
        # - Admin: contract_signed, interview_date
        # - Experience fields: active_prospecting_experience, inbound_qualification_experience, etc.

        send_welcome_email: bool (optional, default=False)
    }

    Returns:
        201: {
            success: true,
            candidate: { id, email, full_name },
            email_sent: bool
        }
        400: { error: 'Email already exists' } or validation errors
        403: Not admin user
    """
    import secrets
    import uuid
    from datetime import timedelta

    from django.db import transaction
    from django.utils import timezone

    from authentication.models import User
    from core.permissions import IsAdmin

    # Check admin permission
    if not (request.user.is_authenticated and request.user.role == "admin"):
        return Response(
            {"error": "Apenas administradores podem criar candidatos"},
            status=status.HTTP_403_FORBIDDEN,
        )

    from candidates.serializers import AdminCreateCandidateSerializer

    serializer = AdminCreateCandidateSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        validated_data = serializer.validated_data

        # Extract required fields
        email = validated_data["email"]
        full_name = validated_data["full_name"]
        phone = validated_data["phone"]
        city = validated_data["city"]
        send_welcome_email = validated_data.get("send_welcome_email", False)

        # Generate temporary password
        temp_password = secrets.token_urlsafe(32)

        # Prepare token fields
        password_reset_token = None
        password_reset_token_expires = None
        password_reset_required = False

        if send_welcome_email:
            # Generate password reset token and expiration
            password_reset_token = uuid.uuid4()
            password_reset_token_expires = timezone.now() + timedelta(days=7)
            password_reset_required = True

        with transaction.atomic():
            # Create User
            user = User.objects.create_user(
                email=email,
                password=temp_password,
                role="candidate",
            )

            # Set password reset fields if email will be sent
            if send_welcome_email:
                user.password_reset_required = password_reset_required
                user.password_reset_token = password_reset_token
                user.password_reset_token_expires = password_reset_token_expires
                user.save()

            # Create CandidateProfile with ALL fields from validated_data
            profile = CandidateProfile.objects.create(
                user=user,
                # Required fields
                full_name=full_name,
                phone=phone,
                city=city,
                # Basic optional fields
                linkedin=validated_data.get("linkedin", ""),
                cpf=validated_data.get("cpf", ""),
                zip_code=validated_data.get("zip_code", ""),
                profile_photo_url=validated_data.get("profile_photo_url", ""),
                # Professional fields
                current_position=validated_data.get("current_position", ""),
                years_of_experience=validated_data.get("years_of_experience"),
                sales_type=validated_data.get("sales_type", ""),
                sales_cycle=validated_data.get("sales_cycle", ""),
                avg_ticket=validated_data.get("avg_ticket", ""),
                academic_degree=validated_data.get("academic_degree", ""),
                bio=validated_data.get("bio", ""),
                # Skills (JSON fields)
                top_skills=validated_data.get("top_skills", []),
                tools_software=validated_data.get("tools_software", []),
                solutions_sold=validated_data.get("solutions_sold", []),
                departments_sold_to=validated_data.get("departments_sold_to", []),
                languages=validated_data.get("languages", []),
                # Work preferences
                work_model=validated_data.get("work_model", "hybrid"),
                relocation_availability=validated_data.get("relocation_availability", ""),
                travel_availability=validated_data.get("travel_availability", ""),
                accepts_pj=validated_data.get("accepts_pj", False),
                pcd=validated_data.get("pcd", False),
                is_pcd=validated_data.get("is_pcd", False),
                position_interest=validated_data.get("position_interest", ""),
                minimum_salary=validated_data.get("minimum_salary"),
                salary_notes=validated_data.get("salary_notes", ""),
                has_drivers_license=validated_data.get("has_drivers_license", False),
                has_vehicle=validated_data.get("has_vehicle", False),
                # Video pitch
                pitch_video_url=validated_data.get("pitch_video_url", ""),
                pitch_video_type=validated_data.get("pitch_video_type", ""),
                # Admin-specific fields
                contract_signed=validated_data.get("contract_signed", False),
                interview_date=validated_data.get("interview_date"),
                # CSV/Notion experience fields
                active_prospecting_experience=validated_data.get("active_prospecting_experience", ""),
                inbound_qualification_experience=validated_data.get("inbound_qualification_experience", ""),
                portfolio_retention_experience=validated_data.get("portfolio_retention_experience", ""),
                portfolio_expansion_experience=validated_data.get("portfolio_expansion_experience", ""),
                portfolio_size=validated_data.get("portfolio_size", ""),
                inbound_sales_experience=validated_data.get("inbound_sales_experience", ""),
                outbound_sales_experience=validated_data.get("outbound_sales_experience", ""),
                field_sales_experience=validated_data.get("field_sales_experience", ""),
                inside_sales_experience=validated_data.get("inside_sales_experience", ""),
            )

            # Queue welcome email if requested
            email_sent = False
            if send_welcome_email:
                try:
                    from core.tasks import send_admin_created_candidate_welcome_email

                    send_admin_created_candidate_welcome_email.delay(str(user.id))
                    email_sent = True
                except Exception as e:
                    logger.warning(
                        f"Failed to queue welcome email for user {user.id}: {e}",
                        extra={"user_id": str(user.id)},
                    )
                    # Don't fail the request if email fails to queue

            logger.info(
                f"Admin {request.user.id} created candidate {user.id} (email_sent={email_sent})",
                extra={
                    "admin_id": str(request.user.id),
                    "candidate_id": str(user.id),
                    "email_sent": email_sent,
                },
            )

            return Response(
                {
                    "success": True,
                    "candidate": {
                        "id": str(user.id),
                        "email": user.email,
                        "full_name": full_name,
                    },
                    "email_sent": email_sent,
                },
                status=status.HTTP_201_CREATED,
            )

    except Exception as e:
        logger.error(
            f"Error creating candidate by admin {request.user.id}: {e}",
            extra={"admin_id": str(request.user.id)},
        )
        return Response(
            {"error": "Erro ao criar candidato"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
