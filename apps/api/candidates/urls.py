"""
URL configuration for candidates app.
Story 3.1: Candidate profile creation and management endpoints.
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
]
