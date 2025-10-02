"""Django admin configuration for candidates app."""

from django.contrib import admin

from candidates.models import CandidateProfile, Experience


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    """Admin configuration for CandidateProfile model."""

    list_display = [
        "full_name",
        "current_position",
        "status",
        "is_public",
        "years_of_experience",
        "created_at",
    ]
    list_filter = ["current_position", "status", "is_public", "is_active"]
    search_fields = ["full_name", "user__email", "phone"]
    readonly_fields = ["id", "public_token", "created_at", "updated_at"]
    list_per_page = 25

    fieldsets = (
        ("User Info", {"fields": ("user", "full_name", "phone", "cpf", "linkedin", "video_url")}),
        (
            "Professional Info",
            {
                "fields": (
                    "current_position",
                    "years_of_experience",
                    "sales_type",
                    "sales_cycle",
                    "avg_ticket",
                )
            },
        ),
        (
            "Skills & Experience",
            {
                "fields": (
                    "top_skills",
                    "tools_software",
                    "solutions_sold",
                    "departments_sold_to",
                    "bio",
                )
            },
        ),
        ("Status & Visibility", {"fields": ("status", "is_public", "public_token", "is_active")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    """Admin configuration for Experience model."""

    list_display = ["candidate", "company_name", "position", "start_date", "end_date"]
    list_filter = ["start_date", "end_date"]
    search_fields = ["candidate__full_name", "company_name", "position"]
    readonly_fields = ["id", "created_at", "updated_at"]
    list_per_page = 25

    fieldsets = (
        ("Candidate", {"fields": ("candidate",)}),
        (
            "Employment Details",
            {"fields": ("company_name", "position", "start_date", "end_date", "responsibilities")},
        ),
        (
            "Metadata",
            {"fields": ("id", "is_active", "created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
