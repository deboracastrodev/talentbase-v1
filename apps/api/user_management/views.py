"""
Admin API views for user management.

Following Clean Architecture:
- Views are thin controllers
- Business logic in services
- Permissions enforced at view level
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model

from core.permissions import IsAdmin
from user_management.services.user_management import UserManagementService
from user_management.serializers import UserListSerializer, UserDetailSerializer

User = get_user_model()


class UserListPagination(PageNumberPagination):
    """
    Custom pagination for user list.

    Configured for 20 users per page as per AC9.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminUserListView(APIView):
    """
    Admin endpoint for listing users with filters.

    GET /api/v1/admin/users

    Query Parameters:
    - role: Filter by role (all, admin, candidate, company)
    - status: Filter by status (all, active, pending, inactive)
    - search: Search by name or email
    - page: Page number for pagination

    Permissions:
    - IsAdmin

    Acceptance Criteria:
    - AC2: Table with columns: name, email, role, status, created_at
    - AC3: Filter by role
    - AC4: Filter by status
    - AC5: Search by name or email
    - AC9: Pagination (20 users/page)
    """

    permission_classes = [IsAdmin]
    pagination_class = UserListPagination

    def get(self, request):
        """
        List users with filters and pagination.

        Returns paginated list of users matching filters.
        """
        # Extract query parameters
        role_filter = request.query_params.get("role", "all")
        status_filter = request.query_params.get("status", "all")
        search = request.query_params.get("search", None)

        # Get filtered queryset from service
        queryset = UserManagementService.get_users_queryset(
            role_filter=role_filter, status_filter=status_filter, search=search
        )

        # Apply pagination
        paginator = self.pagination_class()
        paginated_users = paginator.paginate_queryset(queryset, request)

        # Serialize and return
        serializer = UserListSerializer(paginated_users, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminUserDetailView(APIView):
    """
    Admin endpoint for user details and status updates.

    GET /api/v1/admin/users/:id - Get user details
    PATCH /api/v1/admin/users/:id - Update user status

    Permissions:
    - IsAdmin

    Acceptance Criteria:
    - AC6: View user details (used in modal)
    - AC7: Admin can change user status
    - AC8: Status change triggers email notification
    """

    permission_classes = [IsAdmin]

    def get(self, request, user_id):
        """
        Get detailed user information.

        Args:
            user_id: UUID of the user

        Returns:
            User details with profile data, or 404 if not found
        """
        user = UserManagementService.get_user_with_profile(user_id)

        if not user:
            return Response(
                {"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, user_id):
        """
        Update user status.

        Args:
            user_id: UUID of the user
            request.data: { "is_active": bool, "reason": str (optional) }

        Returns:
            Updated user details, or 404/400 on error

        AC7: Admin can alter user status (activate, deactivate, approve company)
        AC8: Status change triggers email notification
        """
        user = UserManagementService.get_user_with_profile(user_id)

        if not user:
            return Response(
                {"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

        # Get new status from request
        is_active = request.data.get("is_active")
        reason = request.data.get("reason", "")

        if is_active is None:
            return Response(
                {"detail": "Campo 'is_active' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update status using service
        try:
            updated_user = UserManagementService.update_user_status(
                user=user,
                is_active=is_active,
                admin_user=request.user,
                reason=reason,
            )

            serializer = UserDetailSerializer(updated_user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
