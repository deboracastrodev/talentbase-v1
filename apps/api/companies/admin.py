"""Django admin configuration for companies app."""

from django.contrib import admin

from companies.models import CompanyProfile


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    """Admin configuration for CompanyProfile model."""

    list_display = [
        "company_name",
        "industry",
        "size",
        "created_by_admin",
        "is_active",
        "created_at",
    ]
    list_filter = ["industry", "size", "created_by_admin", "is_active"]
    search_fields = ["company_name", "cnpj", "contact_person_email"]
    readonly_fields = ["id", "created_at", "updated_at"]
    list_per_page = 25
