"""
Development settings for talentbase project.
"""

from decouple import config

from .base import *

DEBUG = True

# Allow all hosts in development (simplifies ALB health checks)
# TODO: Restrict this in production to specific domains only
ALLOWED_HOSTS = ["*"]

# CORS Configuration - Override base.py to include localhost:3001 for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://dev.salesdog.click",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://dev.salesdog.click",
]

# Development-specific apps
INSTALLED_APPS += [
    # Add development apps here if needed
]

# Enable browsable API in development
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
]

# Email Configuration - Development
# Story 2.7: Supports both MailHog (default) and SendGrid (if configured)
EMAIL_PROVIDER = config("EMAIL_PROVIDER", default="mailhog")

if EMAIL_PROVIDER == "sendgrid":
    # SendGrid configuration for testing real emails in development
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = "smtp.sendgrid.net"
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = "apikey"
    EMAIL_HOST_PASSWORD = config("SENDGRID_API_KEY")
    DEFAULT_FROM_EMAIL = config(
        "DEFAULT_FROM_EMAIL", default="noreply@salesdog.click"
    )
else:
    # MailHog (default) - Captura emails localmente sem enviar reais
    # MailHog UI: http://localhost:8025
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = config(
        "EMAIL_HOST", default="mailhog"
    )  # "mailhog" no Docker, "localhost" local
    EMAIL_PORT = config("EMAIL_PORT", default=1025, cast=int)
    EMAIL_USE_TLS = False
    EMAIL_USE_SSL = False
    EMAIL_HOST_USER = ""
    EMAIL_HOST_PASSWORD = ""
    DEFAULT_FROM_EMAIL = "noreply@talentbase.local"

# Celery Configuration - Development
# Run tasks synchronously in development (no need for Celery worker)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Cookie Configuration - Development
# In development, we allow non-HTTPS cookies (secure=False override in views if needed)
# SESSION_COOKIE_SECURE and CSRF_COOKIE_SECURE should be False in dev
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = "Lax"  # More permissive for dev (Strict in production)
CSRF_COOKIE_SAMESITE = "Lax"
