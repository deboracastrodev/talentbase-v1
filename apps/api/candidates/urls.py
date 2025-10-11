"""
URL configuration for candidates app.
Story 3.1: Candidate profile creation and management endpoints.
Story 3.2: Public shareable profile endpoints.
Story 3.3: CSV bulk import endpoints (admin only).
"""

from django.urls import path

from . import views

app_name = "candidates"

urlpatterns = [
    # S3 Upload presigned URL
    path("upload-url", views.get_upload_url, name="upload-url"),
    # Profile CRUD
    path("", views.create_candidate_profile, name="create-profile"),
    path("<uuid:pk>/draft", views.save_draft, name="save-draft"),
    path("<uuid:pk>/photo", views.update_profile_photo, name="update-photo"),
    path("<uuid:pk>/video", views.update_pitch_video, name="update-video"),
    # Story 3.2: Public sharing
    path("<uuid:pk>/generate-share-token", views.generate_share_token, name="generate-share-token"),
    path("<uuid:pk>/toggle-sharing", views.toggle_sharing, name="toggle-sharing"),
    # Story 3.2: Public endpoints (no auth required)
    path("public/<uuid:token>", views.get_public_profile, name="public-profile"),
    path("public/<uuid:token>/contact", views.contact_candidate, name="contact-candidate"),
    # Story 3.3: CSV Import endpoints (admin only)
    path("admin/parse-csv", views.parse_csv, name="parse-csv"),
    path("admin/import", views.import_csv, name="import-csv"),
    path("admin/import/<str:task_id>/status", views.import_status, name="import-status"),
    path("admin/import/<str:task_id>/result", views.import_result, name="import-result"),
    path(
        "admin/import/<str:task_id>/error-log", views.download_error_log, name="download-error-log"
    ),
    # Story 3.3: List all candidates (admin only) - AC10
    path("admin/candidates", views.list_candidates, name="list-candidates"),
    # Story 3.3.5: Admin manual candidate creation
    path("admin/candidates/create", views.admin_create_candidate, name="admin-create-candidate"),
]
