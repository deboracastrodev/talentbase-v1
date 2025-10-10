"""
AWS S3 utility functions for file uploads.

Provides presigned URL generation, validation, and file deletion for S3 uploads.
Story 3.1: Profile photo and pitch video uploads.
"""

import logging
import mimetypes
import uuid
from typing import Dict, Optional

import boto3
from botocore.exceptions import ClientError
from django.conf import settings

logger = logging.getLogger(__name__)


def get_s3_client():
    """
    Get configured S3 client.

    Returns:
        boto3.client: Configured S3 client

    Note:
        Uses credentials from Django settings (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
    """
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
        config=boto3.session.Config(signature_version="s3v4"),
    )


def generate_presigned_url(
    filename: str, content_type: str, upload_type: str = "photo"
) -> Dict[str, any]:
    """
    Generate presigned POST URL for direct browser upload to S3.

    Args:
        filename: Original filename from user
        content_type: MIME type (must be allowed type for upload_type)
        upload_type: Type of upload - 'photo' or 'video'

    Returns:
        dict: {
            'url': S3 endpoint URL,
            'fields': Form fields for POST request,
            'file_url': Final URL of uploaded file
        }

    Raises:
        ValueError: If content_type not allowed for upload_type
        ClientError: If S3 operation fails

    Example:
        >>> result = generate_presigned_url('profile.jpg', 'image/jpeg', 'photo')
        >>> # Frontend POSTs to result['url'] with result['fields'] + file
        >>> # After upload, file is available at result['file_url']
    """
    # Validate content type based on upload type
    if upload_type == "photo":
        if content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise ValueError(
                f"Content type {content_type} not allowed. "
                f"Must be one of {settings.ALLOWED_IMAGE_TYPES}"
            )
        max_size = settings.MAX_UPLOAD_SIZE
        folder = "candidate-photos"
        expiry = settings.AWS_PRESIGNED_EXPIRY  # 5 minutes for photos
    elif upload_type == "video":
        if content_type not in settings.ALLOWED_VIDEO_TYPES:
            raise ValueError(
                f"Content type {content_type} not allowed. "
                f"Must be one of {settings.ALLOWED_VIDEO_TYPES}"
            )
        max_size = settings.MAX_VIDEO_SIZE
        folder = "pitch-videos"
        expiry = settings.VIDEO_PRESIGNED_EXPIRY  # 10 minutes for videos
    else:
        raise ValueError(f"Invalid upload_type: {upload_type}. Must be 'photo' or 'video'")

    # Generate unique filename to prevent collisions
    ext = mimetypes.guess_extension(content_type) or filename.split(".")[-1]
    if not ext.startswith("."):
        ext = f".{ext}"
    unique_filename = f"{folder}/{uuid.uuid4()}{ext}"

    # Get S3 client
    s3_client = get_s3_client()

    try:
        # Generate presigned POST
        response = s3_client.generate_presigned_post(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=unique_filename,
            Fields={
                "Content-Type": content_type,
                "x-amz-server-side-encryption": settings.AWS_S3_ENCRYPTION,
            },
            Conditions=[
                {"Content-Type": content_type},
                {"x-amz-server-side-encryption": settings.AWS_S3_ENCRYPTION},
                ["content-length-range", 0, max_size],
            ],
            ExpiresIn=expiry,
        )

        # Construct the final file URL
        file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{unique_filename}"

        logger.info(
            f"Generated presigned URL for {upload_type}: {unique_filename}",
            extra={"upload_type": upload_type, "content_type": content_type},
        )

        return {
            "url": response["url"],
            "fields": response["fields"],
            "file_url": file_url,
        }

    except ClientError as e:
        logger.error(
            f"Error generating presigned URL: {e}",
            extra={"upload_type": upload_type, "content_type": content_type},
        )
        raise


def validate_s3_url(url: str) -> bool:
    """
    Validate that URL is from our S3 bucket (prevent URL injection).

    Args:
        url: S3 URL to validate

    Returns:
        bool: True if valid, False otherwise

    Example:
        >>> validate_s3_url("https://talentbase-dev-uploads.s3.amazonaws.com/photo.jpg")
        True
        >>> validate_s3_url("https://evil.com/photo.jpg")
        False
    """
    if not url:
        return False

    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    region = settings.AWS_S3_REGION_NAME

    # Valid formats:
    # https://talentbase-dev-uploads.s3.amazonaws.com/...
    # https://talentbase-dev-uploads.s3.us-east-1.amazonaws.com/...
    # https://s3.us-east-1.amazonaws.com/talentbase-dev-uploads/...

    valid_prefixes = [
        f"https://{bucket_name}.s3.amazonaws.com/",
        f"https://{bucket_name}.s3.{region}.amazonaws.com/",
        f"https://s3.{region}.amazonaws.com/{bucket_name}/",
    ]

    return any(url.startswith(prefix) for prefix in valid_prefixes)


def delete_s3_object(url: str) -> bool:
    """
    Delete object from S3 given its URL.

    Args:
        url: S3 URL of object to delete

    Returns:
        bool: True if deleted, False if error

    Example:
        >>> delete_s3_object("https://bucket.s3.amazonaws.com/candidate-photos/abc.jpg")
        True
    """
    if not validate_s3_url(url):
        logger.warning(f"Attempted to delete invalid S3 URL: {url}")
        return False

    # Extract key from URL
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME

    try:
        if f"{bucket_name}.s3" in url:
            # Format: https://bucket.s3.region.amazonaws.com/key
            key = url.split(f"{bucket_name}.s3", 1)[1].split("/", 2)[-1]
        else:
            # Format: https://s3.region.amazonaws.com/bucket/key
            key = url.split(f"{bucket_name}/", 1)[1]

        s3_client = get_s3_client()
        s3_client.delete_object(Bucket=bucket_name, Key=key)

        logger.info(f"Deleted S3 object: {key}")
        return True

    except (IndexError, ClientError) as e:
        logger.error(f"Error deleting S3 object from URL {url}: {e}")
        return False


def get_s3_file_size(url: str) -> Optional[int]:
    """
    Get file size from S3 without downloading.

    Args:
        url: S3 URL

    Returns:
        int: File size in bytes, or None if error

    Example:
        >>> size = get_s3_file_size("https://bucket.s3.amazonaws.com/photo.jpg")
        >>> print(f"File size: {size / 1024 / 1024:.2f} MB")
    """
    if not validate_s3_url(url):
        return None

    # Extract key from URL (same logic as delete_s3_object)
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME

    try:
        if f"{bucket_name}.s3" in url:
            key = url.split(f"{bucket_name}.s3", 1)[1].split("/", 2)[-1]
        else:
            key = url.split(f"{bucket_name}/", 1)[1]

        s3_client = get_s3_client()
        response = s3_client.head_object(Bucket=bucket_name, Key=key)

        return response["ContentLength"]

    except (IndexError, ClientError) as e:
        logger.error(f"Error getting S3 object metadata for URL {url}: {e}")
        return None
