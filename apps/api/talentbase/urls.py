"""
URL configuration for talentbase project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from authentication.views import (
    get_current_user,
    login,
    register_candidate,
    register_company,
    set_password_with_token,
)
from core.views import health_check, ping

urlpatterns = [
    path("ping/", ping, name="ping"),  # Simple health check for ALB
    path("health/", health_check, name="health"),  # Comprehensive health check
    path("admin/", admin.site.urls),
    # Authentication endpoints
    path("api/v1/auth/register/candidate", register_candidate, name="register-candidate"),
    path("api/v1/auth/register/company", register_company, name="register-company"),
    path("api/v1/auth/login", login, name="login"),  # Story 2.3: Login endpoint
    path("api/v1/auth/me", get_current_user, name="current-user"),  # Get current user info
    path(
        "api/v1/auth/set-password", set_password_with_token, name="set-password"
    ),  # Story 3.3.5
    # Admin endpoints (Story 2.4)
    path("api/v1/admin/", include("user_management.urls")),
    # Candidate endpoints (Story 3.1)
    path("api/v1/candidates/", include("candidates.urls")),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
