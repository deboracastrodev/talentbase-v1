"""
Test settings for talentbase project.
"""

from .base import *

DEBUG = False

# Use in-memory SQLite for faster tests
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Disable password hashers for faster tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# Use console email backend for tests
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Simple secret key for tests
SECRET_KEY = "test-secret-key-for-ci-testing-only"

# Allowed hosts for tests
ALLOWED_HOSTS = ["*"]

# CORS settings for tests
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = True

# CSRF settings for tests
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000"]
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False

# Disable Celery during tests
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
