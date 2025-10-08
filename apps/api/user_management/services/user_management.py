"""
User management service layer.

Implements business logic for admin user management operations.
Following Clean Architecture: Services contain business logic.
"""

from typing import Dict, Any, Optional
from django.db.models import Q, QuerySet
from django.contrib.auth import get_user_model

User = get_user_model()


class UserManagementService:
    """
    Service class for admin user management operations.

    Handles:
    - User listing with filters and search
    - User retrieval with related profiles
    - Query optimization with select_related
    """

    @staticmethod
    def get_users_queryset(
        role_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> QuerySet:
        """
        Get optimized user queryset with filters applied.

        Args:
            role_filter: Filter by role (admin, candidate, company, or all)
            status_filter: Filter by status (active, pending, inactive, or all)
            search: Search term for name or email

        Returns:
            QuerySet: Filtered and optimized user queryset

        Note:
            Uses select_related to optimize queries by fetching related profiles
            in a single query, avoiding N+1 query problems.
        """
        # Start with base queryset, optimized with select_related
        queryset = User.objects.select_related(
            "candidate_profile", "company_profile"
        ).order_by("-created_at")

        # Apply role filter
        if role_filter and role_filter != "all":
            queryset = queryset.filter(role=role_filter)

        # Apply status filter
        if status_filter and status_filter != "all":
            if status_filter == "active":
                queryset = queryset.filter(is_active=True)
            elif status_filter == "inactive":
                queryset = queryset.filter(is_active=False)
            elif status_filter == "pending":
                # Pending users: companies with is_active=False
                queryset = queryset.filter(role="company", is_active=False)

        # Apply search filter (email or name from profiles)
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search)
                | Q(candidate_profile__full_name__icontains=search)
                | Q(company_profile__company_name__icontains=search)
            )

        return queryset

    @staticmethod
    def get_user_with_profile(user_id: str) -> Optional[User]:
        """
        Get user by ID with related profile data.

        Args:
            user_id: UUID of the user

        Returns:
            User: User instance with related profile, or None if not found
        """
        try:
            return User.objects.select_related(
                "candidate_profile", "company_profile"
            ).get(id=user_id)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_user_display_name(user: User) -> str:
        """
        Get display name for user based on role.

        Args:
            user: User instance

        Returns:
            str: Display name (full_name for candidate, company_name for company, email for admin)
        """
        if user.role == "candidate" and hasattr(user, "candidate_profile"):
            return user.candidate_profile.full_name
        elif user.role == "company" and hasattr(user, "company_profile"):
            return user.company_profile.company_name
        else:
            return user.email
