"""
URL configuration for user_management module.

Routes for admin user management endpoints.
"""

from django.urls import path

from user_management.views import (
    AdminPendingCountView,
    AdminStatsView,
    AdminUserDetailView,
    AdminUserListView,
)

app_name = "user_management"

urlpatterns = [
    # User management endpoints
    path("users", AdminUserListView.as_view(), name="user-list"),
    path("users/<uuid:user_id>", AdminUserDetailView.as_view(), name="user-detail"),
    # Pending approvals count (Story 2.5)
    path("pending-count", AdminPendingCountView.as_view(), name="pending-count"),
    # Admin dashboard stats (Story 2.5.1)
    path("stats", AdminStatsView.as_view(), name="admin-stats"),
]
