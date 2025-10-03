"""
Development settings for talentbase project.
"""

from decouple import config

from .base import *

DEBUG = True

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="localhost,127.0.0.1,0.0.0.0,dev.salesdog.click,api-dev.salesdog.click",
    cast=lambda v: [s.strip() for s in v.split(",")],
)

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
