"""
Candidate serializers module.
Provides serialization for CandidateProfile and Experience models.
Story 3.1: Profile creation with photo and video uploads.
"""

import re
from typing import Dict, Any

import bleach
from django.conf import settings
from rest_framework import serializers

from core.utils.s3 import validate_s3_url, get_s3_file_size, delete_s3_object
from .models import CandidateProfile, Experience


class ExperienceSerializer(serializers.ModelSerializer):
    """
    Serializer for Experience model (work history).

    Validates:
    - start_date < end_date (if end_date provided)
    - company_name and position are required
    """

    class Meta:
        model = Experience
        fields = [
            'id',
            'company_name',
            'position',
            'start_date',
            'end_date',
            'responsibilities',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate that start_date is before end_date."""
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError(
                "Data de início deve ser anterior à data de término"
            )

        return data


class CandidateProfileSerializer(serializers.ModelSerializer):
    """
    Complete serializer for CandidateProfile with validation.

    Validates:
    - Profile photo URL is from our S3 bucket
    - Pitch video is required and validated based on type
    - Bio is sanitized (XSS prevention)
    - User can only have one profile

    Story 3.1: Multi-step wizard profile creation.
    """

    experiences = ExperienceSerializer(many=True, required=False)

    class Meta:
        model = CandidateProfile
        fields = [
            'id',
            'user',
            'full_name',
            'phone',
            'city',
            'cpf',
            'linkedin',
            'profile_photo_url',
            'pitch_video_url',
            'pitch_video_type',
            'current_position',
            'years_of_experience',
            'sales_type',
            'sales_cycle',
            'avg_ticket',
            'top_skills',
            'tools_software',
            'solutions_sold',
            'departments_sold_to',
            'bio',
            'status',
            'is_public',
            'public_token',
            'experiences',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'public_token', 'created_at', 'updated_at']

    def validate_profile_photo_url(self, value: str) -> str:
        """
        Validate photo URL is from our S3 bucket.

        Args:
            value: Photo URL to validate

        Returns:
            str: Validated URL

        Raises:
            ValidationError: If URL is not from our bucket or file too large
        """
        if not value:
            return value

        # Validate URL is from our bucket
        if not validate_s3_url(value):
            raise serializers.ValidationError(
                "URL da foto deve ser do bucket S3 do TalentBase"
            )

        # Validate file size (optional - presigned URL already limits)
        file_size = get_s3_file_size(value)
        if file_size and file_size > settings.MAX_UPLOAD_SIZE:
            raise serializers.ValidationError(
                f"Foto deve ser menor que {settings.MAX_UPLOAD_SIZE / (1024*1024):.0f}MB"
            )

        return value

    def validate_pitch_video_url(self, value: str) -> str:
        """
        Validate pitch video URL based on type.

        Args:
            value: Video URL to validate

        Returns:
            str: Validated URL

        Raises:
            ValidationError: If URL format is invalid
        """
        if not value:
            return value

        # Get pitch_video_type from initial_data (set in validate())
        video_type = self.initial_data.get('pitch_video_type', '')

        if video_type == 's3':
            # Validate S3 URL
            if not validate_s3_url(value):
                raise serializers.ValidationError(
                    "URL do vídeo deve ser do bucket S3 do TalentBase"
                )

            # Validate file size
            file_size = get_s3_file_size(value)
            if file_size and file_size > settings.MAX_VIDEO_SIZE:
                raise serializers.ValidationError(
                    f"Vídeo deve ser menor que {settings.MAX_VIDEO_SIZE / (1024*1024):.0f}MB"
                )

        elif video_type == 'youtube':
            # Validate YouTube URL format
            youtube_patterns = [
                r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=[\w-]+',
                r'(?:https?://)?(?:www\.)?youtu\.be/[\w-]+',
                r'(?:https?://)?(?:www\.)?youtube\.com/embed/[\w-]+',
            ]

            if not any(re.match(pattern, value) for pattern in youtube_patterns):
                raise serializers.ValidationError(
                    "URL do YouTube inválida. Use formato: https://www.youtube.com/watch?v=VIDEO_ID ou https://youtu.be/VIDEO_ID"
                )

        return value

    def validate_bio(self, value: str) -> str:
        """
        Sanitize bio to prevent XSS attacks.

        Args:
            value: Bio text to sanitize

        Returns:
            str: Sanitized bio
        """
        if not value:
            return value

        # Strip all HTML tags and JavaScript
        sanitized = bleach.clean(value, tags=[], strip=True)

        return sanitized

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate complete profile data.

        Validates:
        - Pitch video is required (unless draft)
        - Pitch video type matches URL

        Args:
            data: Profile data to validate

        Returns:
            dict: Validated data

        Raises:
            ValidationError: If validation fails
        """
        # Check if this is a draft save (no validation required)
        is_draft = self.context.get('is_draft', False)

        if not is_draft:
            # Pitch video is REQUIRED for complete profile
            pitch_video_url = data.get('pitch_video_url')
            pitch_video_type = data.get('pitch_video_type')

            # For partial updates, check if instance already has video
            if self.instance and self.partial:
                if not pitch_video_url:
                    pitch_video_url = self.instance.pitch_video_url
                if not pitch_video_type:
                    pitch_video_type = self.instance.pitch_video_type

            if not pitch_video_url:
                raise serializers.ValidationError({
                    'pitch_video_url': 'Vídeo pitch é obrigatório. Escolha upload de arquivo ou URL do YouTube'
                })

            if not pitch_video_type:
                raise serializers.ValidationError({
                    'pitch_video_type': 'Tipo de vídeo é obrigatório (s3 ou youtube)'
                })

        return data

    def create(self, validated_data: Dict[str, Any]) -> CandidateProfile:
        """
        Create CandidateProfile with nested experiences.

        Args:
            validated_data: Validated profile data

        Returns:
            CandidateProfile: Created profile
        """
        experiences_data = validated_data.pop('experiences', [])
        profile = CandidateProfile.objects.create(**validated_data)

        # Create experiences
        for experience_data in experiences_data:
            Experience.objects.create(candidate=profile, **experience_data)

        return profile

    def update(self, instance: CandidateProfile, validated_data: Dict[str, Any]) -> CandidateProfile:
        """
        Update CandidateProfile and handle old file deletion.

        If photo or video is updated, deletes old file from S3.

        Args:
            instance: Existing profile
            validated_data: New data

        Returns:
            CandidateProfile: Updated profile
        """
        # Handle profile photo update (delete old)
        new_photo = validated_data.get('profile_photo_url')
        if new_photo and instance.profile_photo_url and new_photo != instance.profile_photo_url:
            delete_s3_object(instance.profile_photo_url)

        # Handle pitch video update (delete old if S3)
        new_video = validated_data.get('pitch_video_url')
        if new_video and instance.pitch_video_url and new_video != instance.pitch_video_url:
            # Only delete if old video was S3 (not YouTube)
            if instance.pitch_video_type == 's3':
                delete_s3_object(instance.pitch_video_url)

        # Handle experiences update
        experiences_data = validated_data.pop('experiences', None)

        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update experiences if provided
        if experiences_data is not None:
            # Delete old experiences and create new ones
            instance.experiences.all().delete()
            for experience_data in experiences_data:
                Experience.objects.create(candidate=instance, **experience_data)

        return instance


class CandidateProfileDraftSerializer(CandidateProfileSerializer):
    """
    Serializer for draft profile saves (partial data allowed).

    Inherits from CandidateProfileSerializer but skips required field validation.
    Story 3.1: "Save Draft" functionality.
    """

    def __init__(self, *args, **kwargs):
        """Initialize with is_draft context."""
        # Set is_draft in kwargs context before calling super
        if 'context' not in kwargs:
            kwargs['context'] = {}
        kwargs['context']['is_draft'] = True
        super().__init__(*args, **kwargs)

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Skip required field validation for drafts."""
        # Call parent validate with is_draft=True
        return super().validate(data)
