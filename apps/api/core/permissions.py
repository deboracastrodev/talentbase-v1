"""
Custom permission classes for API access control.

Implements role-based access control (RBAC) for TalentBase.
"""

from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission class that allows access only to admin users.

    Checks:
    - User is authenticated
    - User role is 'admin'

    Usage:
        class AdminView(APIView):
            permission_classes = [IsAdmin]
    """

    def has_permission(self, request, view):
        """
        Check if user is authenticated and has admin role.

        Args:
            request: DRF request object
            view: View being accessed

        Returns:
            bool: True if user is admin, False otherwise
        """
        return request.user.is_authenticated and request.user.role == "admin"


class IsCandidate(permissions.BasePermission):
    """
    Permission class that allows access only to candidate users.

    Checks:
    - User is authenticated
    - User role is 'candidate'
    """

    def has_permission(self, request, view):
        """Check if user is authenticated and has candidate role."""
        return request.user.is_authenticated and request.user.role == "candidate"


class IsCompany(permissions.BasePermission):
    """
    Permission class that allows access only to company users.

    Checks:
    - User is authenticated
    - User role is 'company'
    """

    def has_permission(self, request, view):
        """Check if user is authenticated and has company role."""
        return request.user.is_authenticated and request.user.role == "company"


class IsOwner(permissions.BasePermission):
    """
    Permission class that allows access only to resource owners.

    Checks:
    - User is authenticated
    - User owns the resource (object.user == request.user)

    Requires the object to have a 'user' attribute.
    """

    def has_object_permission(self, request, view, obj):
        """
        Check if user owns the object.

        Args:
            request: DRF request object
            view: View being accessed
            obj: Object being accessed

        Returns:
            bool: True if user owns object, False otherwise
        """
        return request.user.is_authenticated and obj.user == request.user
