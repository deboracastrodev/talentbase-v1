"""Django admin configuration for matching app."""

from django.contrib import admin

from matching.models import Ranking


@admin.register(Ranking)
class RankingAdmin(admin.ModelAdmin):
    """Admin configuration for Ranking model."""

    list_display = ["candidate", "score", "rank_position", "ranked_by", "created_at"]
    list_filter = ["rank_position", "is_active"]
    search_fields = ["candidate__full_name", "ranked_by__email"]
    readonly_fields = ["id", "created_at", "updated_at"]
    list_per_page = 25
