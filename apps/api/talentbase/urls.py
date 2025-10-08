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
from django.contrib import admin
from django.urls import path, include

from core.views import health_check, ping
from authentication.views import register_candidate, register_company, login

urlpatterns = [
    path("ping/", ping, name="ping"),  # Simple health check for ALB
    path("health/", health_check, name="health"),  # Comprehensive health check
    path("admin/", admin.site.urls),
    # Authentication endpoints
    path("api/v1/auth/register/candidate", register_candidate, name="register-candidate"),
    path("api/v1/auth/register/company", register_company, name="register-company"),
    path("api/v1/auth/login", login, name="login"),  # Story 2.3: Login endpoint
    # Admin endpoints (Story 2.4)
    path("api/v1/admin/", include("user_management.urls")),
]
