"""
Admin API views for user management.

Following Clean Architecture:
- Views are thin controllers
- Business logic in services
- Permissions enforced at view level
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsAdmin
from user_management.serializers import (
    AdminStatsSerializer,
    UserDetailSerializer,
    UserListSerializer,
)
from user_management.services.user_management import UserManagementService

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
            return Response({"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

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
            return Response({"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

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
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminPendingCountView(APIView):
    """
    Admin endpoint for pending approvals count.

    GET /api/v1/admin/pending-count - Get count of pending company approvals

    Permissions:
    - IsAdmin

    Story 2.5 - AC1, AC2: Widget "Pending Approvals" com contagem
    """

    permission_classes = [IsAdmin]

    def get(self, request):
        """
        Get count of companies awaiting approval.

        Returns:
            {"count": int} - Number of companies with is_active=False
        """
        count = UserManagementService.get_pending_approvals_count()
        return Response({"count": count}, status=status.HTTP_200_OK)


class AdminStatsView(APIView):
    """
    Admin endpoint for dashboard statistics.

    GET /api/v1/admin/stats - Get admin dashboard stats

    Permissions:
    - IsAdmin

    Story 2.5.1 - AC16, AC17: Dashboard stats with user counts, pending approvals, etc.
    """

    permission_classes = [IsAdmin]

    def get(self, request):
        """
        Get admin dashboard statistics.

        Returns:
            {
                "total_users": int,
                "total_candidates": int,
                "total_companies": int,
                "total_admins": int,
                "pending_approvals": int,
                "active_jobs": int,  # Placeholder for Epic 4
                "recent_activity": []  # Last 5 user creations
            }
        """
        # Calculate stats
        total_users = User.objects.count()
        total_candidates = User.objects.filter(role="candidate").count()
        total_companies = User.objects.filter(role="company").count()
        total_admins = User.objects.filter(role="admin").count()
        pending_approvals = User.objects.filter(role="company", is_active=False).count()

        # Placeholder for Epic 4 - Jobs feature
        active_jobs = 0

        # Recent activity - last 5 user creations (MVP placeholder)
        recent_users = User.objects.order_by("-created_at")[:5]
        recent_activity = [
            {
                "id": str(user.id),
                "type": "user_registration",
                "user_email": user.email,
                "user_role": user.role,
                "timestamp": user.created_at.isoformat(),
            }
            for user in recent_users
        ]

        stats_data = {
            "total_users": total_users,
            "total_candidates": total_candidates,
            "total_companies": total_companies,
            "total_admins": total_admins,
            "pending_approvals": pending_approvals,
            "active_jobs": active_jobs,
            "recent_activity": recent_activity,
        }

        serializer = AdminStatsSerializer(stats_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
