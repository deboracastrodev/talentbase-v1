"""Django admin configuration for applications app."""

from django.contrib import admin

from applications.models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    """Admin configuration for Application model."""

    list_display = ["candidate", "job", "status", "matched_by_admin", "created_at"]
    list_filter = ["status", "matched_at", "is_active"]
    search_fields = ["candidate__full_name", "job__title", "job__company__company_name"]
    readonly_fields = ["id", "created_at", "updated_at"]
    list_per_page = 25
