"""
URL configuration for candidates app.
Story 3.1: Candidate profile creation and management endpoints.
Story 3.2: Public shareable profile endpoints.
"""

from django.urls import path

from . import views

app_name = 'candidates'

urlpatterns = [
    # S3 Upload presigned URL
    path('upload-url', views.get_upload_url, name='upload-url'),

    # Profile CRUD
    path('', views.create_candidate_profile, name='create-profile'),
    path('<int:pk>/draft', views.save_draft, name='save-draft'),
    path('<int:pk>/photo', views.update_profile_photo, name='update-photo'),
    path('<int:pk>/video', views.update_pitch_video, name='update-video'),

    # Story 3.2: Public sharing
    path('<int:pk>/generate-share-token', views.generate_share_token, name='generate-share-token'),
    path('<int:pk>/toggle-sharing', views.toggle_sharing, name='toggle-sharing'),

    # Story 3.2: Public endpoints (no auth required)
    path('public/<uuid:token>', views.get_public_profile, name='public-profile'),
    path('public/<uuid:token>/contact', views.contact_candidate, name='contact-candidate'),
]
