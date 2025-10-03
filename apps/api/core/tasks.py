"""
Celery tasks for async operations.
"""

from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@shared_task
def send_email_task(subject: str, message: str, recipient_list: list[str]) -> str:
    """
    Send email asynchronously via Celery.

    In development: Emails are captured by MailHog (localhost:1025 SMTP, :8025 Web UI)
    In production: Emails are sent via SendGrid/AWS SES

    Per Story 2.1 constraints:
    - email1: Development uses MailHog - ZERO real emails sent in DEV
    - email2: Production uses SendGrid/AWS SES - Only production sends real emails

    Args:
        subject: Email subject line
        message: Email body (plain text)
        recipient_list: List of recipient email addresses

    Returns:
        str: Success message with recipient list

    Raises:
        Exception: If email sending fails
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info(f"Email sent successfully to {recipient_list}")
        return f"Email sent to {recipient_list}"
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        raise
