# AWS S3 Video Storage - TalentBase

**Architect:** Winston
**Date:** 2025-10-09
**Status:** 🎯 **CRITICAL - Must Prepare Now** (YouTube migration planned)
**Related:** [AWS-S3-SETUP.md](./AWS-S3-SETUP.md)

---

## 📋 EXECUTIVE SUMMARY

**Current State:**
- Candidates upload vídeos de apresentação para **YouTube** (own channel)
- TalentBase armazena apenas a `video_url` (YouTube link)
- Video embed via iframe: `https://youtube.com/embed/{video_id}`

**Future State (Epic 3+):**
- Candidates podem fazer **upload direto para S3** (opcional)
- Plataforma gerencia storage, transcoding, streaming
- Mantém suporte para YouTube URL (backward compatible)

**Why Prepare Now?**
✅ **Infrastructure ready** quando decidir migrar
✅ **Avoid rush** - video storage é complexo (transcoding, streaming, CDN)
✅ **Cost planning** - saber estimate de storage/bandwidth antes
✅ **Dual mode** - suportar YouTube + S3 simultaneamente

---

## 🎯 ARCHITECTURE DECISION

### Option Analysis

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **YouTube Only** | ✅ Free storage/bandwidth<br>✅ Global CDN<br>✅ Reliable player | ❌ Candidate precisa ter YouTube account<br>❌ Vídeo pode ser deletado<br>❌ Sem controle sobre analytics | ⚠️ Current (OK para MVP) |
| **S3 + CloudFront** | ✅ Full control<br>✅ Private videos<br>✅ Analytics detalhados<br>✅ Não depende de 3rd party | ❌ Storage cost (~$0.023/GB)<br>❌ Bandwidth cost (~$0.09/GB)<br>❌ Transcoding needed | ✅ **Future (Epic 4+)** |
| **Vimeo/Wistia** | ✅ Professional player<br>✅ Analytics<br>✅ Transcoding included | ❌ $7-19/month subscription<br>❌ Upload limits | ❌ Not cost-effective for MVP |
| **AWS MediaConvert + S3** | ✅ Auto transcoding<br>✅ HLS/DASH streaming<br>✅ Full control | ❌ Complex setup<br>❌ Transcoding cost ($0.0075/min) | ✅ **Best for Scale (Epic 5+)** |

**Decision:** Prepare S3 infrastructure now, migrate when:
- Candidates request direct upload feature
- YouTube dependency becomes blocker
- Analytics/control requirements increase

---

## 🏗️ DUAL-MODE ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│            VIDEO STORAGE - DUAL MODE (YouTube + S3)              │
└─────────────────────────────────────────────────────────────────┘

CURRENT (YouTube):
┌──────────┐                                        ┌──────────────┐
│ Candidate│─────1. Upload video to own YouTube ──>│   YouTube    │
│          │                                        │              │
│          │<────2. Get video URL ─────────────────│              │
│          │     https://youtube.com/watch?v=xyz   └──────────────┘
│          │
│          │     3. Save YouTube URL
│          │────────────────────────────────────>┌──────────────┐
│          │     POST /api/v1/candidates         │  Django API  │
│          │     { video_url: "youtube..." }     │              │
└──────────┘                                      └──────────────┘
                                                          │
                                                          v
                                                   ┌──────────────┐
                                                   │  PostgreSQL  │
                                                   │  video_url:  │
                                                   │  "youtube.." │
                                                   └──────────────┘

PUBLIC VIEW (YouTube):
┌──────────┐     Load public profile              ┌──────────────┐
│ Recruiter│────────────────────────────────────>│  Django API  │
│          │<───────────────────────────────────│  video_url   │
│          │     video_url: "youtube..."         └──────────────┘
│          │
│          │     Render iframe
│          │<iframe src="https://youtube.com/embed/xyz">
└──────────┘


═══════════════════════════════════════════════════════════════════

FUTURE (S3 + CloudFront):
┌──────────┐     1. Request presigned URL        ┌──────────────┐
│ Candidate│────────────────────────────────────>│  Django API  │
│          │     GET /api/v1/videos/upload-url   │              │
│          │<────────────────────────────────────│              │
│          │     2. Return presigned URL         │              │
│          │                                      └──────────────┘
│          │     3. Upload directly to S3
│          │─────────────────────────────────────────────────┐
│          │                                                  │
│          │                                                  v
│          │                                           ┌──────────────┐
│          │     4. S3 triggers Lambda                │   AWS S3     │
│          │        (transcoding job)                 │   Bucket     │
│          │                                          │ /videos/raw/ │
│          │                                          └──────────────┘
│          │                                                  │
│          │                                                  │ Lambda
│          │                                                  v trigger
│          │                                          ┌──────────────┐
│          │                                          │ MediaConvert │
│          │                                          │ (Transcoding)│
│          │                                          │              │
│          │                                          │ 1080p, 720p, │
│          │                                          │ 480p, 360p   │
│          │                                          └──────────────┘
│          │                                                  │
│          │                                                  v
│          │                                          ┌──────────────┐
│          │                                          │   AWS S3     │
│          │                                          │/videos/hls/  │
│          │                                          │ (transcoded) │
│          │     5. Save S3 URL                      └──────────────┘
│          │────────────────────────────────────>┌──────────────┐   │
│          │     POST /api/v1/candidates         │  Django API  │   │
│          │     { video_url: "s3://..." }       │              │   │
└──────────┘                                      └──────────────┘   │
                                                          │           │
                                                          v           │
                                                   ┌──────────────┐  │
                                                   │  PostgreSQL  │  │
                                                   │  video_url:  │  │
                                                   │  "s3://..."  │  │
                                                   └──────────────┘  │
                                                                     │
PUBLIC VIEW (CloudFront CDN):                                        │
┌──────────┐     Load public profile              ┌──────────────┐  │
│ Recruiter│────────────────────────────────────>│  Django API  │  │
│          │<───────────────────────────────────│  video_url   │  │
│          │     video_url: "s3://..."           └──────────────┘  │
│          │                                             │          │
│          │     Django generates CloudFront              │          │
│          │     signed URL (1 hour TTL)                 │          │
│          │<────────────────────────────────────────────┘          │
│          │     signed_url: "cloudfront.net/..."                   │
│          │                                                         │
│          │     Render HTML5 video player                          │
│          │     <video src="cloudfront signed URL">               │
│          │<───────────────────────────────────────────────────────┘
│          │     Stream via CloudFront CDN
└──────────┘     (HLS adaptive bitrate)
```

---

## 🔧 S3 BUCKET SETUP (Video Extension)

### Step 1: Extend Existing Bucket Structure

**Add to existing `talentbase-dev-uploads` bucket:**

```bash
# No new bucket needed - extend existing structure
aws s3api list-objects-v2 --bucket talentbase-dev-uploads

# Expected structure:
s3://talentbase-dev-uploads/
├── candidate-photos/    # Já existe (Epic 3)
│   └── {uuid}.jpg
├── candidate-videos/    # NOVO - para Epic 4+
│   ├── raw/             # Original uploads
│   │   └── {uuid}.mp4
│   └── hls/             # Transcoded (HLS format)
│       └── {uuid}/
│           ├── 1080p.m3u8
│           ├── 720p.m3u8
│           ├── 480p.m3u8
│           └── master.m3u8
├── company-logos/       # Futuro - Epic 4
└── job-attachments/     # Futuro - Epic 4
```

---

### Step 2: Update CORS for Video Uploads

**Extend existing `cors-config.json`:**

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://dev.salesdog.click",
        "https://www.salesdog.click"
      ],
      "AllowedMethods": ["GET", "POST", "PUT"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "Location", "Content-Length"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

**Apply:**
```bash
aws s3api put-bucket-cors \
  --bucket talentbase-dev-uploads \
  --cors-configuration file://cors-config.json
```

---

### Step 3: Configure Video File Constraints

**Add to Django settings:**

**File: `apps/api/talentbase/settings/base.py`**
```python
# Video Upload Configuration (Future - Epic 4+)
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB max
ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi']
VIDEO_PRESIGNED_EXPIRY = 600  # 10 minutes (videos take longer to upload)

# Video Storage Paths
VIDEO_RAW_PATH = 'candidate-videos/raw/'
VIDEO_HLS_PATH = 'candidate-videos/hls/'

# CloudFront Configuration (for video streaming)
CLOUDFRONT_DISTRIBUTION_ID = config('CLOUDFRONT_DISTRIBUTION_ID', default='')
CLOUDFRONT_DOMAIN = config('CLOUDFRONT_DOMAIN', default='')
CLOUDFRONT_KEY_PAIR_ID = config('CLOUDFRONT_KEY_PAIR_ID', default='')
CLOUDFRONT_PRIVATE_KEY_PATH = config('CLOUDFRONT_PRIVATE_KEY_PATH', default='')
```

---

## 💻 BACKEND IMPLEMENTATION (Dual Mode Support)

### 1. Database Schema - Flexible Video Storage

**File: `apps/api/candidates/models.py`**
```python
from django.db import models
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

def validate_video_url(value):
    """
    Validate video URL - supports YouTube OR S3

    Valid formats:
    - YouTube: https://youtube.com/watch?v=xyz
    - YouTube Short: https://youtu.be/xyz
    - S3: https://talentbase-dev-uploads.s3.amazonaws.com/candidate-videos/...
    - CloudFront: https://d111111abcdef8.cloudfront.net/candidate-videos/...
    """
    if not value:
        return

    # Check if YouTube URL
    if 'youtube.com' in value or 'youtu.be' in value:
        return  # Valid YouTube URL

    # Check if S3 URL (from our bucket)
    from django.conf import settings
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME

    valid_s3_patterns = [
        f'https://{bucket_name}.s3.amazonaws.com/candidate-videos/',
        f'https://{bucket_name}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/candidate-videos/',
        f'https://s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{bucket_name}/candidate-videos/'
    ]

    if any(value.startswith(pattern) for pattern in valid_s3_patterns):
        return  # Valid S3 URL

    # Check if CloudFront URL
    cloudfront_domain = settings.CLOUDFRONT_DOMAIN
    if cloudfront_domain and value.startswith(f'https://{cloudfront_domain}/candidate-videos/'):
        return  # Valid CloudFront URL

    raise ValidationError(
        'Video URL must be from YouTube, S3, or CloudFront',
        code='invalid_video_source'
    )

class CandidateProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # ... outros campos ...

    # Video URL - supports YouTube OR S3
    video_url = models.URLField(
        blank=True,
        null=True,
        validators=[validate_video_url],
        help_text='YouTube URL or S3/CloudFront URL for uploaded video'
    )

    # Video metadata (only for S3-hosted videos)
    video_duration_seconds = models.IntegerField(null=True, blank=True)
    video_size_bytes = models.BigIntegerField(null=True, blank=True)
    video_transcoded = models.BooleanField(default=False)
    video_uploaded_at = models.DateTimeField(null=True, blank=True)

    def is_youtube_video(self):
        """Check if video is hosted on YouTube"""
        if not self.video_url:
            return False
        return 'youtube.com' in self.video_url or 'youtu.be' in self.video_url

    def is_s3_video(self):
        """Check if video is hosted on S3/CloudFront"""
        if not self.video_url:
            return False
        return not self.is_youtube_video()

    def get_video_player_url(self):
        """Get appropriate player URL based on video source"""
        if not self.video_url:
            return None

        if self.is_youtube_video():
            # Extract YouTube video ID and return embed URL
            video_id = self._extract_youtube_id(self.video_url)
            if video_id:
                return f'https://youtube.com/embed/{video_id}'
            return self.video_url
        else:
            # For S3 videos, generate CloudFront signed URL
            from core.utils.cloudfront import generate_signed_url
            return generate_signed_url(self.video_url)

    def _extract_youtube_id(self, url):
        """Extract YouTube video ID from various URL formats"""
        import re
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
            r'youtube\.com\/embed\/([^&\n?#]+)',
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
```

---

### 2. Video Upload Utility (S3)

**File: `apps/api/core/utils/video.py`**
```python
import boto3
import uuid
from django.conf import settings
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

def generate_video_presigned_url(filename, content_type):
    """
    Generate presigned POST URL for video upload to S3

    Args:
        filename (str): Original filename
        content_type (str): MIME type (video/mp4, video/quicktime, etc.)

    Returns:
        dict: { url, fields, key } for POST request

    Raises:
        ValueError: If content_type not allowed
    """
    # Validate content type
    if content_type not in settings.ALLOWED_VIDEO_TYPES:
        raise ValueError(
            f"Content type {content_type} not allowed. "
            f"Must be one of {settings.ALLOWED_VIDEO_TYPES}"
        )

    # Generate unique filename
    ext = filename.split('.')[-1] if '.' in filename else 'mp4'
    unique_filename = f"{settings.VIDEO_RAW_PATH}{uuid.uuid4()}.{ext}"

    # Get S3 client
    from core.utils.s3 import get_s3_client
    s3_client = get_s3_client()

    try:
        # Generate presigned POST with longer expiry (videos are large)
        response = s3_client.generate_presigned_post(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=unique_filename,
            Fields={
                'Content-Type': content_type,
                'x-amz-server-side-encryption': settings.AWS_S3_ENCRYPTION
            },
            Conditions=[
                {'Content-Type': content_type},
                {'x-amz-server-side-encryption': settings.AWS_S3_ENCRYPTION},
                ['content-length-range', 0, settings.MAX_VIDEO_SIZE]  # Max 100MB
            ],
            ExpiresIn=settings.VIDEO_PRESIGNED_EXPIRY  # 10 minutes
        )

        logger.info(f"Generated video presigned URL for {unique_filename}")

        # Add key to response for frontend reference
        response['key'] = unique_filename

        return response

    except ClientError as e:
        logger.error(f"Error generating video presigned URL: {e}")
        raise

def get_video_metadata(s3_url):
    """
    Get video file metadata from S3

    Args:
        s3_url (str): S3 URL of video

    Returns:
        dict: { size_bytes, content_type, last_modified }
    """
    from core.utils.s3 import get_s3_client, validate_s3_url

    if not validate_s3_url(s3_url):
        return None

    # Extract key from URL
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    if f"{bucket_name}.s3" in s3_url:
        key = s3_url.split(f"{bucket_name}.s3", 1)[1].split('/', 2)[-1]
    else:
        key = s3_url.split(f"{bucket_name}/", 1)[1]

    s3_client = get_s3_client()

    try:
        response = s3_client.head_object(Bucket=bucket_name, Key=key)
        return {
            'size_bytes': response['ContentLength'],
            'content_type': response.get('ContentType'),
            'last_modified': response.get('LastModified')
        }
    except ClientError as e:
        logger.error(f"Error getting video metadata {key}: {e}")
        return None
```

---

### 3. CloudFront Signed URL (For Private Video Streaming)

**File: `apps/api/core/utils/cloudfront.py`**
```python
from datetime import datetime, timedelta
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
import base64
import json
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def generate_signed_url(s3_url, expires_in_hours=1):
    """
    Generate CloudFront signed URL for private video streaming

    Args:
        s3_url (str): Original S3 URL
        expires_in_hours (int): Hours until URL expires

    Returns:
        str: CloudFront signed URL

    Note:
        Requires CloudFront distribution configured with S3 origin
        and trusted key group for signed URLs
    """
    if not settings.CLOUDFRONT_DOMAIN or not settings.CLOUDFRONT_KEY_PAIR_ID:
        logger.warning("CloudFront not configured, returning S3 URL directly")
        return s3_url

    # Convert S3 URL to CloudFront URL
    # s3://bucket/candidate-videos/xyz.mp4 -> https://cloudfront.net/candidate-videos/xyz.mp4
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    if f"{bucket_name}.s3" in s3_url:
        key = s3_url.split(f"{bucket_name}.s3", 1)[1].split('/', 2)[-1]
    else:
        key = s3_url.split(f"{bucket_name}/", 1)[1]

    cloudfront_url = f"https://{settings.CLOUDFRONT_DOMAIN}/{key}"

    # Set expiration time
    expire_time = datetime.utcnow() + timedelta(hours=expires_in_hours)
    expire_timestamp = int(expire_time.timestamp())

    # Create policy
    policy = {
        "Statement": [{
            "Resource": cloudfront_url,
            "Condition": {
                "DateLessThan": {
                    "AWS:EpochTime": expire_timestamp
                }
            }
        }]
    }

    policy_json = json.dumps(policy, separators=(',', ':'))
    policy_b64 = base64.b64encode(policy_json.encode()).decode()
    policy_b64 = policy_b64.replace('+', '-').replace('=', '_').replace('/', '~')

    # Load private key
    try:
        with open(settings.CLOUDFRONT_PRIVATE_KEY_PATH, 'rb') as key_file:
            private_key = serialization.load_pem_private_key(
                key_file.read(),
                password=None,
                backend=default_backend()
            )
    except FileNotFoundError:
        logger.error(f"CloudFront private key not found at {settings.CLOUDFRONT_PRIVATE_KEY_PATH}")
        return s3_url

    # Sign policy
    signature = private_key.sign(
        policy_json.encode(),
        padding.PKCS1v15(),
        hashes.SHA1()
    )

    signature_b64 = base64.b64encode(signature).decode()
    signature_b64 = signature_b64.replace('+', '-').replace('=', '_').replace('/', '~')

    # Construct signed URL
    signed_url = (
        f"{cloudfront_url}"
        f"?Policy={policy_b64}"
        f"&Signature={signature_b64}"
        f"&Key-Pair-Id={settings.CLOUDFRONT_KEY_PAIR_ID}"
    )

    return signed_url
```

---

### 4. API Endpoint for Video Upload URL

**File: `apps/api/candidates/views.py`**
```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from core.utils.video import generate_video_presigned_url
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_video_upload_url(request):
    """
    Generate presigned URL for video upload to S3

    Query params:
        filename (str): Original filename
        content_type (str): MIME type (video/mp4, video/quicktime, etc.)

    Returns:
        200: { url, fields, key, expires_in }
        400: { error: "message" }
    """
    filename = request.query_params.get('filename')
    content_type = request.query_params.get('content_type')

    if not filename or not content_type:
        return Response(
            {'error': 'filename and content_type are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate content type
    if content_type not in settings.ALLOWED_VIDEO_TYPES:
        return Response(
            {'error': f'Content type must be one of {settings.ALLOWED_VIDEO_TYPES}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Generate presigned URL
        presigned_data = generate_video_presigned_url(filename, content_type)

        return Response({
            'url': presigned_data['url'],
            'fields': presigned_data['fields'],
            'key': presigned_data['key'],
            'expires_in': settings.VIDEO_PRESIGNED_EXPIRY
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error generating video presigned URL: {e}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

**Add to URLs:**
```python
# apps/api/talentbase/urls.py
urlpatterns = [
    # ... existing patterns
    path('api/v1/candidates/upload-url', get_upload_url, name='get_upload_url'),  # Photos
    path('api/v1/candidates/video-upload-url', get_video_upload_url, name='get_video_upload_url'),  # Videos
]
```

---

## 🌐 FRONTEND IMPLEMENTATION (Dual Mode)

### Video Upload Hook with YouTube Fallback

**File: `packages/web/app/hooks/useVideoUpload.ts`**
```typescript
import { useState } from 'react';

export type VideoSource = 'youtube' | 's3';

interface UseVideoUploadReturn {
  uploadVideo: (file: File) => Promise<string>;
  setYouTubeUrl: (url: string) => void;
  videoUrl: string | null;
  videoSource: VideoSource | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useVideoUpload(): UseVideoUploadReturn {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = async (file: File): Promise<string> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('Video file must be less than 100MB');
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Video must be MP4, MOV, or AVI format');
      }

      // Step 1: Get presigned URL from backend
      const presignedResponse = await fetch(
        `/api/v1/candidates/video-upload-url?filename=${encodeURIComponent(file.name)}&content_type=${encodeURIComponent(file.type)}`
      );

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const presignedData = await presignedResponse.json();

      // Step 2: Upload to S3 with progress tracking
      const formData = new FormData();

      Object.entries(presignedData.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const s3Url = xhr.getResponseHeader('Location') ||
                          `${presignedData.url}/${presignedData.key}`;

            setVideoUrl(s3Url);
            setVideoSource('s3');
            setProgress(100);
            setUploading(false);
            resolve(s3Url);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', presignedData.url);
        xhr.send(formData);
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setUploading(false);
      throw err;
    }
  };

  const setYouTubeUrl = (url: string) => {
    // Validate YouTube URL
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setError('URL must be from YouTube');
      return;
    }

    setVideoUrl(url);
    setVideoSource('youtube');
    setError(null);
  };

  return {
    uploadVideo,
    setYouTubeUrl,
    videoUrl,
    videoSource,
    uploading,
    progress,
    error
  };
}
```

### Video Input Component (Dual Mode)

**File: `packages/web/app/components/VideoInput.tsx`**
```typescript
import React, { useState } from 'react';
import { useVideoUpload } from '~/hooks/useVideoUpload';

interface VideoInputProps {
  value?: string;
  onChange: (url: string, source: 'youtube' | 's3') => void;
  label?: string;
}

export function VideoInput({ value, onChange, label = 'Video' }: VideoInputProps) {
  const [mode, setMode] = useState<'youtube' | 'upload'>('youtube');
  const { uploadVideo, setYouTubeUrl, uploading, progress, error } = useVideoUpload();
  const [youtubeInput, setYoutubeInput] = useState(value || '');

  const handleYouTubeSubmit = () => {
    setYouTubeUrl(youtubeInput);
    onChange(youtubeInput, 'youtube');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadVideo(file);
      onChange(url, 's3');
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('youtube')}
          className={`px-4 py-2 rounded ${
            mode === 'youtube'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          YouTube URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-4 py-2 rounded ${
            mode === 'upload'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Upload Video
        </button>
      </div>

      {/* YouTube Mode */}
      {mode === 'youtube' && (
        <div className="space-y-2">
          <input
            type="url"
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="button"
            onClick={handleYouTubeSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Set YouTube URL
          </button>
          <p className="text-sm text-gray-500">
            Upload your video to YouTube first, then paste the link here
          </p>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div className="space-y-2">
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo"
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full"
          />
          <p className="text-sm text-gray-500">
            Max 100MB • MP4, MOV, or AVI format
          </p>

          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {uploading && <p className="text-sm text-gray-600">Uploading... {progress}%</p>}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Video Preview */}
      {value && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Current video:</p>
          {value.includes('youtube') || value.includes('youtu.be') ? (
            <div className="aspect-video">
              <iframe
                src={value.replace('watch?v=', 'embed/')}
                className="w-full h-full rounded"
                allowFullScreen
              />
            </div>
          ) : (
            <video src={value} controls className="w-full rounded" />
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 📊 COST ESTIMATION

### YouTube (Current - FREE)
- Storage: $0
- Bandwidth: $0
- Transcoding: $0
- **Total: $0/month**

### S3 + CloudFront (Future)

**Assumptions:**
- 1000 candidates
- 50% upload videos (~500 videos)
- Average video: 50MB, 2 minutes
- Average views: 10 views/video/month = 5000 total views

**Costs:**

**Storage (S3):**
- 500 videos × 50MB = 25GB
- $0.023/GB/month = **$0.58/month**

**Uploads (S3 PUT):**
- 500 uploads/month
- $0.005/1000 PUT = **$0.0025/month**

**Streaming (CloudFront):**
- 5000 views × 50MB = 250GB/month
- $0.085/GB (first 10TB) = **$21.25/month**

**Transcoding (MediaConvert) - Optional:**
- 500 videos × 2 min = 1000 minutes
- $0.0075/min = **$7.50/month**

**Total Estimated: ~$30/month** for 500 videos with 5000 views

**Break-even Analysis:**
- S3 makes sense when: Need control, analytics, or private videos
- YouTube makes sense when: Cost is priority and public videos acceptable

---

## ✅ VERIFICATION CHECKLIST

- [ ] **S3 Bucket Structure Extended**
  ```bash
  aws s3 ls s3://talentbase-dev-uploads/candidate-videos/
  # Should show: raw/ and hls/ folders
  ```

- [ ] **Video Upload URL Generation**
  ```python
  from core.utils.video import generate_video_presigned_url
  result = generate_video_presigned_url('test.mp4', 'video/mp4')
  print(result['url'])
  ```

- [ ] **Dual Mode Support in Database**
  ```python
  # Django shell:
  profile = CandidateProfile.objects.first()

  # Test YouTube
  profile.video_url = 'https://youtube.com/watch?v=xyz'
  profile.save()
  print(profile.is_youtube_video())  # True

  # Test S3
  profile.video_url = 'https://talentbase-dev-uploads.s3.amazonaws.com/candidate-videos/raw/abc.mp4'
  profile.save()
  print(profile.is_s3_video())  # True
  ```

- [ ] **Frontend Dual Mode UI**
  - Toggle between YouTube URL and Upload
  - YouTube URL validation
  - Upload progress indicator
  - Video preview for both sources

---

## 🚀 MIGRATION STRATEGY (YouTube → S3)

### Phase 1: Prepare Infrastructure (NOW - Epic 3)
- ✅ Extend S3 bucket structure
- ✅ Update CORS configuration
- ✅ Add video validation in models
- ✅ Create presigned URL utilities
- Status: **All documentation ready**

### Phase 2: Dual Mode Support (Epic 4)
- Implement upload UI with YouTube fallback
- Test end-to-end upload flow
- Monitor storage costs
- Status: **Ready to implement**

### Phase 3: Optional - Transcoding (Epic 5+)
- Setup AWS MediaConvert
- Lambda trigger for auto-transcoding
- HLS/DASH streaming
- Status: **Future enhancement**

### Phase 4: Optional - Migration (When needed)
- Offer candidates option to migrate YouTube videos to S3
- Download from YouTube → Upload to S3 (with permission)
- Update video_url in database
- Status: **On-demand based on business need**

---

## 📎 APPENDIX

### A. Video File Constraints

| Constraint | Value | Reason |
|-----------|-------|--------|
| Max Size | 100MB | Balance between quality and upload time |
| Formats | MP4, MOV, AVI | Industry standard, wide browser support |
| Max Duration | 5 minutes | Keeps attention, reduces storage cost |
| Resolution | Up to 1080p | Professional quality without excessive size |

### B. Environment Variables

```bash
# Add to .env.development
MAX_VIDEO_SIZE=104857600  # 100MB in bytes
VIDEO_PRESIGNED_EXPIRY=600  # 10 minutes

# Add to .env.production (when enabling S3 videos)
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
CLOUDFRONT_DOMAIN=d111111abcdef8.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=K2JCJMDEHXQW5F
CLOUDFRONT_PRIVATE_KEY_PATH=/etc/secrets/cloudfront-private-key.pem
```

### C. Decision Matrix: When to Migrate from YouTube

| Scenario | Stick with YouTube | Migrate to S3 |
|----------|-------------------|---------------|
| Candidates complain about YouTube requirement | ❌ | ✅ |
| Need private videos (not public) | ❌ | ✅ |
| Need detailed analytics | ❌ | ✅ |
| Videos being deleted by candidates | ❌ | ✅ |
| Storage costs acceptable (~$30/month) | ❌ | ✅ |
| Cost is critical constraint | ✅ | ❌ |
| Public profiles acceptable | ✅ | ❌ |

---

**Document Owner:** Winston (Architect)
**Last Updated:** 2025-10-09
**Status:** ✅ Ready for Epic 3 Preparation
**Recommendation:** **Implement dual-mode support in Epic 4**, maintain YouTube as default for cost savings in MVP
