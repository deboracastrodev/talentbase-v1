"""
Celery tasks for async operations.

Story 2.7: Email Notification System
- Enhanced send_email_task with HTML template support
- Retry logic with exponential backoff
- EmailLog integration for monitoring
"""

import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_email_task(
    self,
    template_name: str,
    context: dict,
    recipient_email: str,
    subject: str,
) -> str:
    """
    Send HTML email asynchronously via Celery with retry logic.

    Story 2.7 - AC4, AC5:
    - Sends emails asynchronously via Celery + Redis queue
    - Implements retry logic with exponential backoff (max 3 retries)
    - Logs all failures for admin review
    - Supports HTML + plain text multipart emails

    In development: Emails are captured by MailHog (localhost:1025 SMTP, :8025 Web UI)
    In production: Emails are sent via SendGrid/AWS SES

    Args:
        template_name: Name of the email template (without .html/.txt extension)
                      e.g., 'candidate_registration', 'company_approved'
        context: Dictionary with template variables
                 Common vars: candidate_name, company_name, email, dashboard_url, etc.
        recipient_email: Single recipient email address
        subject: Email subject line

    Returns:
        str: Success message with recipient

    Raises:
        Exception: After 3 failed retries (celery will handle)

    Example:
        send_email_task.delay(
            template_name='candidate_registration',
            context={
                'candidate_name': 'João Silva',
                'email': 'joao@example.com',
                'dashboard_url': 'https://app.talentbase.com/candidate'
            },
            recipient_email='joao@example.com',
            subject='Bem-vindo ao TalentBase!'
        )
    """
    task_id = self.request.id
    log_entry = None

    try:
        # Import here to avoid circular dependency
        from core.models import EmailLog

        # Create email log entry
        log_entry = EmailLog.objects.create(
            recipient=recipient_email,
            subject=subject,
            template_name=template_name,
            status="pending",
            task_id=task_id,
        )

        # Render HTML and text versions from templates
        html_content = render_to_string(f"emails/{template_name}.html", context)
        text_content = render_to_string(f"emails/{template_name}.txt", context)

        # Create multipart email (HTML + plain text fallback)
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)

        # Update log entry as sent
        log_entry.status = "sent"
        log_entry.sent_at = timezone.now()
        log_entry.save()

        logger.info(
            f"Email sent successfully: {template_name} to {recipient_email} (task_id: {task_id})"
        )
        return f"Email sent to {recipient_email}"

    except Exception as e:
        error_message = str(e)
        logger.error(
            f"Email send failed: {template_name} to {recipient_email} - {error_message} (task_id: {task_id}, retry: {self.request.retries})"
        )

        # Update log entry with error
        if log_entry:
            log_entry.status = "failed"
            log_entry.error_message = error_message
            log_entry.save()

        # In development, if MailHog is not available, log and skip retry
        if settings.DEBUG:
            logger.warning(
                f"Email not sent (development mode, MailHog unavailable): {recipient_email}"
            )
            if log_entry:
                log_entry.status = "skipped"
                log_entry.error_message = "Development mode - MailHog unavailable"
                log_entry.save()
            return f"Email skipped (dev mode): {recipient_email}"

        # In production, retry with exponential backoff
        # Retry delays: 60s, 120s, 240s (1min, 2min, 4min)
        try:
            raise self.retry(countdown=60 * (2**self.request.retries), exc=e)
        except self.MaxRetriesExceededError:
            # Max retries exceeded - final failure
            logger.error(f"Email send failed after {self.max_retries} retries: {recipient_email}")
            if log_entry:
                log_entry.error_message = (
                    f"{error_message} (failed after {self.max_retries} retries)"
                )
                log_entry.save()
            raise


# Story 3.3.5: Admin Manual Candidate Creation


@shared_task(bind=True, max_retries=3)
def send_admin_created_candidate_welcome_email(self, user_id: str) -> str:
    """
    Send welcome email to candidate created by admin.

    Story 3.3.5 - AC10, AC11: Welcome email with password set link.

    This task is queued when an admin creates a candidate manually
    and chooses to send a welcome email.

    Email contains:
    - Welcome message personalized with candidate name
    - Link to set password: {FRONTEND_URL}/auth/set-password?token={token}
    - Token expiration notice (7 days)

    Args:
        user_id: UUID of the candidate user

    Returns:
        str: Success message

    Raises:
        Exception: After 3 failed retries
    """
    try:
        from authentication.models import User

        user = User.objects.get(id=user_id)

        # Get candidate profile for full name
        candidate_name = user.email.split("@")[0].title()
        if hasattr(user, "candidate_profile"):
            candidate_name = user.candidate_profile.full_name

        # Build password set URL
        frontend_url = settings.FRONTEND_URL or "http://localhost:3000"
        password_set_url = f"{frontend_url}/auth/set-password?token={user.password_reset_token}"

        context = {
            "candidate_name": candidate_name,
            "password_set_url": password_set_url,
            "expiration_days": 7,
        }

        # Use the existing send_email_task
        result = send_email_task(
            template_name="welcome_admin_created_candidate",
            context=context,
            recipient_email=user.email,
            subject="Bem-vindo ao TalentBase! Defina sua senha",
        )

        logger.info(
            f"Welcome email sent to admin-created candidate: {user.email} (user_id: {user_id})"
        )
        return result

    except User.DoesNotExist:
        logger.error(f"User not found for welcome email: {user_id}")
        raise

    except Exception as e:
        logger.error(f"Error sending welcome email to {user_id}: {e}")
        # Retry with exponential backoff
        if not settings.DEBUG:
            try:
                raise self.retry(countdown=60 * (2**self.request.retries), exc=e)
            except self.MaxRetriesExceededError:
                logger.error(
                    f"Welcome email failed after {self.max_retries} retries: {user_id}"
                )
                raise
        else:
            # In dev mode, log and skip
            logger.warning(f"Welcome email skipped (dev mode): {user_id}")
            return f"Email skipped (dev mode): {user_id}"
