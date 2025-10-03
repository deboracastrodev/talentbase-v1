"""
Development settings for talentbase project.
"""

from decouple import config

from .base import *

DEBUG = True

# Parse ALLOWED_HOSTS from env or use default
_allowed_hosts = config(
    "ALLOWED_HOSTS",
    default="localhost,127.0.0.1,0.0.0.0,dev.salesdog.click,api-dev.salesdog.click",
    cast=lambda v: [s.strip() for s in v.split(",")],
)

# Custom ALLOWED_HOSTS class to support VPC private IPs (10.0.x.x)
class AllowPrivateIPs(list):
    def __contains__(self, item):
        # Allow any IP starting with 10.0 (VPC private IPs for ALB health checks)
        if isinstance(item, str) and item.startswith('10.0.'):
            return True
        return super().__contains__(item)

ALLOWED_HOSTS = AllowPrivateIPs(_allowed_hosts)

# CORS Configuration
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS", default="http://localhost:3000,https://dev.salesdog.click"
).split(",")

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS", default="http://localhost:3000,https://dev.salesdog.click"
).split(",")

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
# Usa MailHog para capturar emails localmente (não envia emails reais)
# MailHog UI: http://localhost:8025
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config("EMAIL_HOST", default="mailhog")  # "mailhog" no Docker, "localhost" se rodar local
EMAIL_PORT = config("EMAIL_PORT", default=1025, cast=int)  # MailHog SMTP port
EMAIL_USE_TLS = False  # MailHog não usa TLS
EMAIL_USE_SSL = False
EMAIL_HOST_USER = ""  # MailHog não requer autenticação
EMAIL_HOST_PASSWORD = ""
DEFAULT_FROM_EMAIL = "noreply@talentbase.local"

# Fallback: Se MailHog não estiver rodando, use console backend
# Para usar console: EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Cookie Configuration - Development
# In development, we allow non-HTTPS cookies (secure=False override in views if needed)
# SESSION_COOKIE_SECURE and CSRF_COOKIE_SECURE should be False in dev
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = 'Lax'  # More permissive for dev (Strict in production)
CSRF_COOKIE_SAMESITE = 'Lax'
