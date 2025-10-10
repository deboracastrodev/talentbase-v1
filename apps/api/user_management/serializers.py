"""
Serializers for admin user management.

Handles data validation and representation for admin endpoints.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from user_management.services.user_management import UserManagementService

User = get_user_model()


class AdminStatsSerializer(serializers.Serializer):
    """
    Serializer for admin dashboard stats.

    Returns:
    - total_users: Total number of users
    - total_candidates: Number of candidate users
    - total_companies: Number of company users
    - total_admins: Number of admin users
    - pending_approvals: Number of pending company approvals
    - active_jobs: Number of active jobs (placeholder for Epic 4)
    - recent_activity: List of recent user creations
    """

    total_users = serializers.IntegerField()
    total_candidates = serializers.IntegerField()
    total_companies = serializers.IntegerField()
    total_admins = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    active_jobs = serializers.IntegerField()
    recent_activity = serializers.ListField(child=serializers.DictField())


class UserListSerializer(serializers.Serializer):
    """
    Serializer for user list view.

    Returns:
    - id: UUID
    - name: Display name (from profile or email)
    - email: User email
    - role: User role (admin/candidate/company)
    - status: Active/Inactive/Pending
    - created_at: Account creation date
    """

    id = serializers.UUIDField(read_only=True)
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(read_only=True)
    role = serializers.CharField(read_only=True)
    status = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)

    def get_name(self, obj: User) -> str:
        """
        Get display name from profile or email.

        For candidates: full_name from CandidateProfile
        For companies: company_name from CompanyProfile
        For admins: email
        """
        return UserManagementService.get_user_display_name(obj)

    def get_status(self, obj: User) -> str:
        """
        Get user status.

        Returns:
        - 'pending': Company with is_active=False
        - 'active': User with is_active=True
        - 'inactive': User with is_active=False (non-company)
        """
        if obj.role == "company" and not obj.is_active:
            return "pending"
        return "active" if obj.is_active else "inactive"


class UserDetailSerializer(serializers.Serializer):
    """
    Serializer for detailed user view.

    Includes all user fields plus profile data.
    """

    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    role = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    name = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()

    def get_name(self, obj: User) -> str:
        """Get display name from profile."""
        return UserManagementService.get_user_display_name(obj)

    def get_profile(self, obj: User) -> dict:
        """
        Get role-specific profile data.

        Returns different fields based on user role.
        """
        if obj.role == "candidate" and hasattr(obj, "candidate_profile"):
            profile = obj.candidate_profile
            return {
                "full_name": profile.full_name,
                "phone": profile.phone,
            }
        elif obj.role == "company" and hasattr(obj, "company_profile"):
            profile = obj.company_profile
            return {
                "company_name": profile.company_name,
                "website": profile.website,
                "contact_person_name": profile.contact_person_name,
                "contact_person_email": profile.contact_person_email,
                "contact_person_phone": profile.contact_person_phone,
            }
        return {}
