"""
Candidate views module.
API endpoints for candidate profile management.
Story 3.1: Multi-step wizard profile creation with S3 uploads.
"""

import logging

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsCandidate
from core.utils.s3 import generate_presigned_url, validate_s3_url, delete_s3_object
from .models import CandidateProfile
from .serializers import (
    CandidateProfileSerializer,
    CandidateProfileDraftSerializer,
)

logger = logging.getLogger(__name__)


@api_view(['GET'])
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
    filename = request.query_params.get('filename')
    content_type = request.query_params.get('content_type')
    upload_type = request.query_params.get('type', 'photo')

    # Validate parameters
    if not filename or not content_type:
        return Response(
            {'error': 'filename and content_type are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if upload_type not in ['photo', 'video']:
        return Response(
            {'error': 'type must be "photo" or "video"'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate content type
    if upload_type == 'photo':
        if content_type not in settings.ALLOWED_IMAGE_TYPES:
            return Response(
                {'error': f'Content type must be one of {settings.ALLOWED_IMAGE_TYPES} for photos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        expiry = settings.AWS_PRESIGNED_EXPIRY
    else:  # video
        if content_type not in settings.ALLOWED_VIDEO_TYPES:
            return Response(
                {'error': f'Content type must be one of {settings.ALLOWED_VIDEO_TYPES} for videos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        expiry = settings.VIDEO_PRESIGNED_EXPIRY

    try:
        # Generate presigned URL
        presigned_data = generate_presigned_url(filename, content_type, upload_type)

        return Response({
            'url': presigned_data['url'],
            'fields': presigned_data['fields'],
            'file_url': presigned_data['file_url'],
            'expires_in': expiry
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        logger.warning(f"Invalid upload request: {e}", extra={
            'user': request.user.id,
            'filename': filename,
            'content_type': content_type
        })
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Error generating presigned URL: {e}", extra={
            'user': request.user.id,
            'filename': filename,
            'content_type': content_type
        })
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
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
    if hasattr(request.user, 'candidate_profile'):
        return Response(
            {'error': 'You already have a profile'},
            status=status.HTTP_409_CONFLICT
        )

    # Add user to data
    data = request.data.copy()
    data['user'] = request.user.id

    serializer = CandidateProfileSerializer(data=data)

    if serializer.is_valid():
        profile = serializer.save(user=request.user)

        logger.info(f"Created candidate profile for user {request.user.id}", extra={
            'profile_id': profile.id,
            'user_id': request.user.id
        })

        return Response(
            CandidateProfileSerializer(profile).data,
            status=status.HTTP_201_CREATED
        )

    logger.warning(f"Invalid profile data: {serializer.errors}", extra={
        'user_id': request.user.id
    })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
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
        return Response(
            {'error': 'Profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Check ownership
    if profile.user != request.user:
        return Response(
            {'error': 'You can only edit your own profile'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = CandidateProfileDraftSerializer(
        profile,
        data=request.data,
        partial=True,
        context={'is_draft': True}
    )

    if serializer.is_valid():
        serializer.save()

        logger.info(f"Saved draft for profile {pk}", extra={
            'profile_id': pk,
            'user_id': request.user.id
        })

        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
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
        return Response(
            {'error': 'Profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Check ownership
    if profile.user != request.user:
        return Response(
            {'error': 'You can only edit your own profile'},
            status=status.HTTP_403_FORBIDDEN
        )

    new_photo_url = request.data.get('profile_photo_url')

    if not new_photo_url:
        return Response(
            {'error': 'profile_photo_url is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate URL
    if not validate_s3_url(new_photo_url):
        return Response(
            {'error': 'Photo URL must be from TalentBase S3 bucket'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Delete old photo if exists
    if profile.profile_photo_url and profile.profile_photo_url != new_photo_url:
        delete_s3_object(profile.profile_photo_url)
        logger.info(f"Deleted old photo for profile {pk}")

    # Update photo URL
    profile.profile_photo_url = new_photo_url
    profile.save()

    logger.info(f"Updated photo for profile {pk}", extra={
        'profile_id': pk,
        'user_id': request.user.id
    })

    return Response(
        CandidateProfileSerializer(profile).data,
        status=status.HTTP_200_OK
    )


@api_view(['PUT'])
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
        return Response(
            {'error': 'Profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Check ownership
    if profile.user != request.user:
        return Response(
            {'error': 'You can only edit your own profile'},
            status=status.HTTP_403_FORBIDDEN
        )

    new_video_url = request.data.get('pitch_video_url')
    new_video_type = request.data.get('pitch_video_type')

    if not new_video_url or not new_video_type:
        return Response(
            {'error': 'pitch_video_url and pitch_video_type are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate based on type
    if new_video_type == 's3':
        if not validate_s3_url(new_video_url):
            return Response(
                {'error': 'Video URL must be from TalentBase S3 bucket'},
                status=status.HTTP_400_BAD_REQUEST
            )
    elif new_video_type == 'youtube':
        # Basic YouTube validation (serializer has full regex)
        if 'youtube.com' not in new_video_url and 'youtu.be' not in new_video_url:
            return Response(
                {'error': 'Invalid YouTube URL'},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        return Response(
            {'error': 'pitch_video_type must be "s3" or "youtube"'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Delete old video if it was S3
    if (profile.pitch_video_url and
        profile.pitch_video_type == 's3' and
        profile.pitch_video_url != new_video_url):
        delete_s3_object(profile.pitch_video_url)
        logger.info(f"Deleted old S3 video for profile {pk}")

    # Update video
    profile.pitch_video_url = new_video_url
    profile.pitch_video_type = new_video_type
    profile.save()

    logger.info(f"Updated pitch video for profile {pk}", extra={
        'profile_id': pk,
        'user_id': request.user.id,
        'video_type': new_video_type
    })

    return Response(
        CandidateProfileSerializer(profile).data,
        status=status.HTTP_200_OK
    )
