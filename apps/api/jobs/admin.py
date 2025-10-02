"""Django admin configuration for jobs app."""

from django.contrib import admin

from jobs.models import JobPosting


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    """Admin configuration for JobPosting model."""

    list_display = [
        "title",
        "company",
        "position_type",
        "seniority",
        "location",
        "is_remote",
        "is_active",
        "created_at",
    ]
    list_filter = ["position_type", "seniority", "is_remote", "is_active"]
    search_fields = ["title", "company__company_name", "location"]
    readonly_fields = ["id", "created_at", "updated_at"]
    list_per_page = 25
