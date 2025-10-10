"""
Production settings for talentbase project.

Story 2.7: Email configuration for production (SendGrid/AWS SES)
"""

from decouple import config

from .base import *

DEBUG = False

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="salesdog.click,www.salesdog.click,api.salesdog.click",
    cast=lambda v: [s.strip() for s in v.split(",")],
)

# CORS Configuration
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS", default="https://salesdog.click,https://www.salesdog.click"
).split(",")

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS", default="https://salesdog.click,https://www.salesdog.click"
).split(",")

# Security
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# HSTS
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Email Configuration - Production (Story 2.7)
# Supports both SendGrid and AWS SES
# Set EMAIL_PROVIDER=sendgrid or EMAIL_PROVIDER=ses in environment

EMAIL_PROVIDER = config("EMAIL_PROVIDER", default="sendgrid")  # sendgrid or ses

if EMAIL_PROVIDER == "sendgrid":
    # SendGrid Configuration
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = "smtp.sendgrid.net"
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = "apikey"  # SendGrid always uses 'apikey' as username
    EMAIL_HOST_PASSWORD = config("SENDGRID_API_KEY")  # Your SendGrid API key
    DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="noreply@salesdog.click")

elif EMAIL_PROVIDER == "ses":
    # AWS SES Configuration
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = config("AWS_SES_HOST", default="email-smtp.us-east-1.amazonaws.com")
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = config("AWS_SES_USERNAME")  # AWS SES SMTP username
    EMAIL_HOST_PASSWORD = config("AWS_SES_PASSWORD")  # AWS SES SMTP password
    DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="noreply@salesdog.click")

else:
    raise ValueError(f"Invalid EMAIL_PROVIDER: {EMAIL_PROVIDER}. Must be 'sendgrid' or 'ses'")

# Celery Configuration - Production
# Don't use EAGER mode in production (emails should be truly async)
CELERY_TASK_ALWAYS_EAGER = False
CELERY_TASK_EAGER_PROPAGATES = False
