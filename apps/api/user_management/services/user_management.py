"""
User management service layer.

Implements business logic for admin user management operations.
Following Clean Architecture: Services contain business logic.

Story 2.7: Enhanced email notifications for company approval/rejection
"""

import logging
from typing import Optional

from django.contrib.auth import get_user_model
from django.db.models import Q, QuerySet

User = get_user_model()
logger = logging.getLogger(__name__)


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
        queryset = User.objects.select_related("candidate_profile", "company_profile").order_by(
            "-created_at"
        )

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
            return User.objects.select_related("candidate_profile", "company_profile").get(
                id=user_id
            )
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

    @staticmethod
    def update_user_status(user: User, is_active: bool, admin_user: User, reason: str = "") -> User:
        """
        Update user status and send notification email.

        Args:
            user: User to update
            is_active: New active status
            admin_user: Admin performing the action
            reason: Optional reason for status change

        Returns:
            User: Updated user instance

        Raises:
            ValueError: If status transition is invalid

        AC7: Admin can change status (activate, deactivate, approve company)
        AC8: Status change triggers email notification
        AC9: Log de auditoria registra aprovação/rejeição
        """
        from authentication.models import UserStatusAudit
        from core.tasks import send_email_task

        old_status = user.is_active

        # Validate status transition
        if old_status == is_active:
            raise ValueError("Novo status é igual ao status atual")

        # Determine action type
        if is_active and not old_status:
            if user.role == "company":
                action_type = "approve"
            else:
                action_type = "activate"
        else:
            if user.role == "company" and old_status and not is_active:
                action_type = "reject"
            else:
                action_type = "deactivate"

        # Update status
        user.is_active = is_active
        user.save()

        # Create audit log (AC9 - Story 2.5)
        UserStatusAudit.objects.create(
            user=user,
            changed_by=admin_user,
            old_status=old_status,
            new_status=is_active,
            action_type=action_type,
            reason=reason,
        )

        # Story 2.7 - AC2: Email de aprovação/rejeição de empresa
        # Send email notification (AC8)
        user_display_name = UserManagementService.get_user_display_name(user)

        if is_active and not old_status:
            # User activated/approved
            if user.role == "company":
                # Company approved - Story 2.7 template
                company_name = getattr(user.company_profile, "company_name", user.email)
                send_email_task.delay(
                    template_name="company_approved",
                    context={
                        "contact_name": user_display_name,
                        "company_name": company_name,
                        "dashboard_url": "https://www.salesdog.click/company/dashboard",
                    },
                    recipient_email=user.email,
                    subject="Parabéns! Sua Empresa Foi Aprovada - TalentBase",
                )
            else:
                # TODO: Create candidate/generic activation template
                # For now, using plain text fallback
                send_email_task.delay(
                    template_name="candidate_registration",  # Temporary reuse
                    context={
                        "candidate_name": user_display_name,
                        "email": user.email,
                        "dashboard_url": "https://www.salesdog.click/candidate/profile",
                    },
                    recipient_email=user.email,
                    subject="Sua conta foi ativada - TalentBase",
                )
        else:
            # User deactivated/rejected
            if user.role == "company" and old_status and not is_active:
                # Company rejected - Story 2.7 template
                company_name = getattr(user.company_profile, "company_name", user.email)
                send_email_task.delay(
                    template_name="company_rejected",
                    context={
                        "contact_name": user_display_name,
                        "company_name": company_name,
                        "reason": reason or "",
                    },
                    recipient_email=user.email,
                    subject="Atualização sobre seu cadastro - TalentBase",
                )
            else:
                # TODO: Create generic deactivation template
                # For now, skip email for non-company deactivations
                logger.warning(
                    f"Email not sent for user deactivation: {user.email} (role: {user.role})"
                )

        return user

    @staticmethod
    def get_pending_approvals_count() -> int:
        """
        Get count of pending company approvals.

        Story 2.5 - AC1: Count empresas pendentes para widget

        Returns:
            int: Number of companies awaiting approval (is_active=False)
        """
        return User.objects.filter(role="company", is_active=False).count()
