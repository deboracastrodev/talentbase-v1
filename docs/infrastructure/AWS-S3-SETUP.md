# AWS S3 Setup Guide - TalentBase Epic 3

**Architect:** Winston
**Date:** 2025-10-09
**Epic:** 3 - Candidate Management System
**Critical Path:** Blocker for Story 3.1 (Profile Photos)

---

## 📋 OVERVIEW

Este documento descreve a arquitetura e setup completo de AWS S3 para suportar uploads de arquivos no TalentBase, especificamente para:
- **Story 3.1:** Profile photos de candidatos (max 2MB, JPG/PNG)
- **Futuro:** Company logos, job attachments, candidate video pitches

### Architecture Decision

**Strategy:** Presigned URL Upload (Browser → S3 Direct)

**Por quê?**
- ✅ **Performance:** Browser upload direto para S3 (não passa pelo backend)
- ✅ **Scalability:** Backend não processa bytes de arquivo (zero load)
- ✅ **Security:** Presigned URLs expiram em 5 minutos, limitam file type
- ✅ **Cost:** Transferência direta S3 (não dupla transferência via backend)

**Trade-offs:**
- ⚠️ Backend não vê bytes do arquivo (trust S3 + CORS validation)
- ⚠️ Precisa validar URL vem do nosso bucket (prevent URL injection)

---

## 🏗️ ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESIGNED URL UPLOAD FLOW                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐     1. Request presigned URL        ┌──────────────┐
│          │────────────────────────────────────>│              │
│  Browser │     GET /api/v1/candidates/         │  Django API  │
│          │     upload-url?filename=photo.jpg   │   (Backend)  │
│          │                                      │              │
│          │<────────────────────────────────────│              │
│          │     2. Return presigned URL + fields│              │
│          │        { url, fields: {...} }       │              │
│          │                                      │              │
│          │                                      │              │
│          │     3. POST directly to S3           │              │
│          │─────────────────────────────────────────────────┐  │
│          │     with file + presigned fields                 │  │
│          │                                                  v  │
│          │                                           ┌──────────────┐
│          │                                           │   AWS S3     │
│          │                                           │   Bucket     │
│          │                                           │              │
│          │     4. S3 returns uploaded URL           │              │
│          │<──────────────────────────────────────────│              │
│          │        Location: https://s3.../photo.jpg └──────────────┘
│          │                                                  │
│          │                                                  │
│          │     5. Submit profile with S3 URL       ┌──────────────┐│
│          │────────────────────────────────────────>│              ││
│          │     POST /api/v1/candidates             │  Django API  ││
│          │     { photo_url: "https://..." }        │              ││
│          │                                          │              ││
│          │                                          │ 6. Validate  ││
│          │                                          │    URL from  ││
│          │                                          │    our bucket││
│          │<────────────────────────────────────────│              ││
│          │     7. Profile created                  └──────────────┘│
└──────────┘                                                  │
                                                              │
                                                              v
                                                       ┌──────────────┐
                                                       │  PostgreSQL  │
                                                       │   Database   │
                                                       │              │
                                                       │ profile_photo│
                                                       │ _url saved   │
                                                       └──────────────┘
```

---

## 🔧 STEP-BY-STEP SETUP

### Prerequisites

- AWS Account com IAM user/role criado
- AWS CLI instalado e configurado: `aws configure`
- Python boto3 library: `pip install boto3`
- Django settings com AWS credentials

### Step 1: Create S3 Buckets

**Development Bucket:**
```bash
aws s3api create-bucket \
  --bucket talentbase-dev-uploads \
  --region us-east-1 \
  --acl private
```

**Production Bucket:**
```bash
aws s3api create-bucket \
  --bucket talentbase-prod-uploads \
  --region us-east-1 \
  --acl private
```

**Verification:**
```bash
aws s3 ls
# Expected output:
# 2025-10-09 10:00:00 talentbase-dev-uploads
# 2025-10-09 10:01:00 talentbase-prod-uploads
```

---

### Step 2: Configure Bucket Policies

**File: `bucket-policy-dev.json`**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPresignedUploads",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::talentbase-dev-uploads/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    },
    {
      "Sid": "DenyUnencryptedUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::talentbase-dev-uploads/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

**Apply Policy:**
```bash
aws s3api put-bucket-policy \
  --bucket talentbase-dev-uploads \
  --policy file://bucket-policy-dev.json

# Repeat for production bucket (change bucket name)
```

**Verification:**
```bash
aws s3api get-bucket-policy --bucket talentbase-dev-uploads
```

---

### Step 3: Configure CORS

**Why CORS?** Browser uploads to S3 são cross-origin (www.salesdog.click → s3.amazonaws.com)

**File: `cors-config.json`**
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
      "ExposeHeaders": ["ETag", "Location"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

**Apply CORS:**
```bash
aws s3api put-bucket-cors \
  --bucket talentbase-dev-uploads \
  --cors-configuration file://cors-config.json

# Repeat for production bucket
```

**Verification:**
```bash
aws s3api get-bucket-cors --bucket talentbase-dev-uploads
```

---

### Step 4: Enable Server-Side Encryption

**Why?** PII data (profile photos podem conter rostos) devem ser encrypted at rest

```bash
aws s3api put-bucket-encryption \
  --bucket talentbase-dev-uploads \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Repeat for production bucket
```

**Verification:**
```bash
aws s3api get-bucket-encryption --bucket talentbase-dev-uploads
```

---

### Step 5: Configure Lifecycle Rules (Optional - Cost Optimization)

**Purpose:** Delete old profile photos após X dias (se usuário deletou conta)

**File: `lifecycle-config.json`**
```json
{
  "Rules": [
    {
      "Id": "DeleteOldPhotos",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "candidate-photos/"
      },
      "Expiration": {
        "Days": 365
      }
    },
    {
      "Id": "CleanupIncompleteUploads",
      "Status": "Enabled",
      "Filter": {},
      "AbortIncompleteMultipartUpload": {
        "DaysAfterInitiation": 1
      }
    }
  ]
}
```

**Apply Lifecycle:**
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket talentbase-dev-uploads \
  --lifecycle-configuration file://lifecycle-config.json
```

---

### Step 6: Create IAM Policy for Backend

**Backend precisa de permissões para:**
- Generate presigned URLs
- Delete objects (quando user atualiza foto)
- List objects (cleanup jobs)

**File: `iam-policy-backend.json`**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::talentbase-dev-uploads/*",
        "arn:aws:s3:::talentbase-prod-uploads/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::talentbase-dev-uploads",
        "arn:aws:s3:::talentbase-prod-uploads"
      ]
    }
  ]
}
```

**Create Policy:**
```bash
aws iam create-policy \
  --policy-name TalentBaseS3UploadPolicy \
  --policy-document file://iam-policy-backend.json
```

**Attach to IAM User/Role:**
```bash
# For IAM User:
aws iam attach-user-policy \
  --user-name talentbase-backend \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/TalentBaseS3UploadPolicy

# For IAM Role (if using EC2/ECS):
aws iam attach-role-policy \
  --role-name talentbase-backend-role \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/TalentBaseS3UploadPolicy
```

---

### Step 7: Configure Django Settings

**File: `apps/api/talentbase/settings/base.py`**
```python
# AWS S3 Configuration
AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')  # 'talentbase-dev-uploads' or 'talentbase-prod-uploads'
AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
AWS_S3_SIGNATURE_VERSION = 's3v4'
AWS_S3_FILE_OVERWRITE = False  # Prevent accidental overwrites
AWS_DEFAULT_ACL = None  # Use bucket ACL (private)
AWS_S3_ENCRYPTION = 'AES256'  # Server-side encryption

# Presigned URL Configuration
AWS_PRESIGNED_EXPIRY = 300  # 5 minutes (in seconds)

# File Upload Constraints
MAX_UPLOAD_SIZE = 2 * 1024 * 1024  # 2MB in bytes
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png']
ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png']
```

**File: `.env.development`**
```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_STORAGE_BUCKET_NAME=talentbase-dev-uploads
AWS_S3_REGION_NAME=us-east-1
```

**File: `.env.production`**
```bash
# Use AWS Secrets Manager or environment variables in ECS/EC2
AWS_ACCESS_KEY_ID=${SECRETS_MANAGER:talentbase/aws:access_key_id}
AWS_SECRET_ACCESS_KEY=${SECRETS_MANAGER:talentbase/aws:secret_access_key}
AWS_STORAGE_BUCKET_NAME=talentbase-prod-uploads
AWS_S3_REGION_NAME=us-east-1
```

---

## 💻 BACKEND IMPLEMENTATION

### 1. S3 Utility Functions

**File: `apps/api/core/utils/s3.py`**
```python
import boto3
import uuid
import mimetypes
from django.conf import settings
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

def get_s3_client():
    """Get configured S3 client"""
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
        config=boto3.session.Config(signature_version=settings.AWS_S3_SIGNATURE_VERSION)
    )

def generate_presigned_url(filename, content_type, folder='candidate-photos'):
    """
    Generate presigned POST URL for direct browser upload to S3

    Args:
        filename (str): Original filename from user
        content_type (str): MIME type (must be image/jpeg or image/png)
        folder (str): S3 folder path (default: candidate-photos)

    Returns:
        dict: { url, fields } for POST request

    Raises:
        ValueError: If content_type not allowed
    """
    # Validate content type
    if content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise ValueError(f"Content type {content_type} not allowed. Must be one of {settings.ALLOWED_IMAGE_TYPES}")

    # Generate unique filename to prevent collisions
    ext = mimetypes.guess_extension(content_type) or '.jpg'
    unique_filename = f"{folder}/{uuid.uuid4()}{ext}"

    # Get S3 client
    s3_client = get_s3_client()

    try:
        # Generate presigned POST
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
                ['content-length-range', 0, settings.MAX_UPLOAD_SIZE]  # Max 2MB
            ],
            ExpiresIn=settings.AWS_PRESIGNED_EXPIRY  # 5 minutes
        )

        logger.info(f"Generated presigned URL for {unique_filename}")
        return response

    except ClientError as e:
        logger.error(f"Error generating presigned URL: {e}")
        raise

def validate_s3_url(url):
    """
    Validate that URL is from our S3 bucket (prevent URL injection)

    Args:
        url (str): S3 URL to validate

    Returns:
        bool: True if valid, False otherwise
    """
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    region = settings.AWS_S3_REGION_NAME

    # Valid formats:
    # https://talentbase-dev-uploads.s3.amazonaws.com/...
    # https://talentbase-dev-uploads.s3.us-east-1.amazonaws.com/...
    # https://s3.us-east-1.amazonaws.com/talentbase-dev-uploads/...

    valid_prefixes = [
        f"https://{bucket_name}.s3.amazonaws.com/",
        f"https://{bucket_name}.s3.{region}.amazonaws.com/",
        f"https://s3.{region}.amazonaws.com/{bucket_name}/"
    ]

    return any(url.startswith(prefix) for prefix in valid_prefixes)

def delete_s3_object(url):
    """
    Delete object from S3 given its URL

    Args:
        url (str): S3 URL of object to delete

    Returns:
        bool: True if deleted, False if error
    """
    if not validate_s3_url(url):
        logger.warning(f"Attempted to delete invalid S3 URL: {url}")
        return False

    # Extract key from URL
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    if f"{bucket_name}.s3" in url:
        # Format: https://bucket.s3.region.amazonaws.com/key
        key = url.split(f"{bucket_name}.s3", 1)[1].split('/', 2)[-1]
    else:
        # Format: https://s3.region.amazonaws.com/bucket/key
        key = url.split(f"{bucket_name}/", 1)[1]

    s3_client = get_s3_client()

    try:
        s3_client.delete_object(Bucket=bucket_name, Key=key)
        logger.info(f"Deleted S3 object: {key}")
        return True
    except ClientError as e:
        logger.error(f"Error deleting S3 object {key}: {e}")
        return False

def get_s3_file_size(url):
    """
    Get file size from S3 without downloading

    Args:
        url (str): S3 URL

    Returns:
        int: File size in bytes, or None if error
    """
    if not validate_s3_url(url):
        return None

    # Extract key from URL (same logic as delete_s3_object)
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    if f"{bucket_name}.s3" in url:
        key = url.split(f"{bucket_name}.s3", 1)[1].split('/', 2)[-1]
    else:
        key = url.split(f"{bucket_name}/", 1)[1]

    s3_client = get_s3_client()

    try:
        response = s3_client.head_object(Bucket=bucket_name, Key=key)
        return response['ContentLength']
    except ClientError as e:
        logger.error(f"Error getting S3 object metadata {key}: {e}")
        return None
```

---

### 2. API Endpoints

**File: `apps/api/candidates/views.py`**
```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from core.utils.s3 import generate_presigned_url, validate_s3_url, delete_s3_object
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_upload_url(request):
    """
    Generate presigned URL for S3 upload

    Query params:
        filename (str): Original filename (used to detect MIME type)
        content_type (str): MIME type (image/jpeg or image/png)

    Returns:
        200: { url, fields, expires_in }
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
    if content_type not in settings.ALLOWED_IMAGE_TYPES:
        return Response(
            {'error': f'Content type must be one of {settings.ALLOWED_IMAGE_TYPES}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Generate presigned URL
        presigned_data = generate_presigned_url(filename, content_type)

        return Response({
            'url': presigned_data['url'],
            'fields': presigned_data['fields'],
            'expires_in': settings.AWS_PRESIGNED_EXPIRY
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error generating presigned URL: {e}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

**Add to `apps/api/talentbase/urls.py`:**
```python
urlpatterns = [
    # ... existing patterns
    path('api/v1/candidates/upload-url', get_upload_url, name='get_upload_url'),
]
```

---

### 3. Serializer Validation

**File: `apps/api/candidates/serializers.py`**
```python
from rest_framework import serializers
from .models import CandidateProfile
from core.utils.s3 import validate_s3_url, get_s3_file_size
from django.conf import settings

class CandidateProfileSerializer(serializers.ModelSerializer):
    profile_photo_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user', 'phone', 'location', 'profile_photo_url',
            'position', 'years_experience', 'sales_type', 'sales_model',
            'sales_cycle', 'ticket_size', 'tools', 'solutions', 'departments',
            'bio', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_profile_photo_url(self, value):
        """Validate photo URL is from our S3 bucket"""
        if not value:
            return value

        # Validate URL is from our bucket
        if not validate_s3_url(value):
            raise serializers.ValidationError(
                "Photo URL must be from TalentBase S3 bucket"
            )

        # Validate file size (optional - presigned URL already limits to 2MB)
        file_size = get_s3_file_size(value)
        if file_size and file_size > settings.MAX_UPLOAD_SIZE:
            raise serializers.ValidationError(
                f"Photo size must be less than {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB"
            )

        return value

    def update(self, instance, validated_data):
        """Override update to delete old photo when new photo is uploaded"""
        old_photo_url = instance.profile_photo_url
        new_photo_url = validated_data.get('profile_photo_url')

        # If photo changed and old photo exists, delete it from S3
        if new_photo_url and old_photo_url and new_photo_url != old_photo_url:
            delete_s3_object(old_photo_url)

        return super().update(instance, validated_data)
```

---

## 🌐 FRONTEND IMPLEMENTATION

### File Upload Hook

**File: `packages/web/app/hooks/useS3Upload.ts`**
```typescript
import { useState } from 'react';

interface PresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
  expires_in: number;
}

interface UseS3UploadReturn {
  uploadFile: (file: File) => Promise<string>;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useS3Upload(): UseS3UploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Step 1: Get presigned URL from backend
      const presignedResponse = await fetch(
        `/api/v1/candidates/upload-url?filename=${encodeURIComponent(file.name)}&content_type=${encodeURIComponent(file.type)}`
      );

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const presignedData: PresignedUrlResponse = await presignedResponse.json();

      // Step 2: Upload directly to S3 using presigned URL
      const formData = new FormData();

      // Add presigned fields
      Object.entries(presignedData.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add file (must be last)
      formData.append('file', file);

      const uploadResponse = await fetch(presignedData.url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      // Step 3: Extract S3 URL from response
      const s3Url = uploadResponse.headers.get('Location') ||
                    `${presignedData.url}/${presignedData.fields.key}`;

      setProgress(100);
      setUploading(false);

      return s3Url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setUploading(false);
      throw err;
    }
  };

  return { uploadFile, uploading, progress, error };
}
```

**Usage Example:**
```typescript
// In your component
import { useS3Upload } from '~/hooks/useS3Upload';

export default function ProfilePhotoUpload() {
  const { uploadFile, uploading, progress, error } = useS3Upload();
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    if (file.size > 2 * 1024 * 1024) {
      alert('File must be less than 2MB');
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('File must be JPG or PNG');
      return;
    }

    try {
      const url = await uploadFile(file);
      setPhotoUrl(url);
      console.log('Uploaded to:', url);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  return (
    <div>
      <input type="file" accept="image/jpeg,image/png" onChange={handleFileChange} />
      {uploading && <p>Uploading... {progress}%</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {photoUrl && <img src={photoUrl} alt="Profile" width={200} />}
    </div>
  );
}
```

---

## ✅ VERIFICATION CHECKLIST

### Pre-Deployment Verification

- [ ] **1. Buckets Created**
  ```bash
  aws s3 ls | grep talentbase
  # Should show: talentbase-dev-uploads, talentbase-prod-uploads
  ```

- [ ] **2. CORS Configured**
  ```bash
  aws s3api get-bucket-cors --bucket talentbase-dev-uploads
  # Should return CORS rules with allowed origins
  ```

- [ ] **3. Encryption Enabled**
  ```bash
  aws s3api get-bucket-encryption --bucket talentbase-dev-uploads
  # Should show AES256 encryption
  ```

- [ ] **4. IAM Policy Attached**
  ```bash
  aws iam list-attached-user-policies --user-name talentbase-backend
  # Should show TalentBaseS3UploadPolicy
  ```

- [ ] **5. Django Settings Configured**
  ```python
  # Test in Django shell:
  from django.conf import settings
  print(settings.AWS_STORAGE_BUCKET_NAME)
  print(settings.AWS_PRESIGNED_EXPIRY)
  ```

- [ ] **6. Backend Test - Generate Presigned URL**
  ```python
  # Django shell:
  from core.utils.s3 import generate_presigned_url
  result = generate_presigned_url('test.jpg', 'image/jpeg')
  print(result['url'])  # Should print S3 URL
  ```

- [ ] **7. Frontend Test - Upload File**
  ```bash
  # Run dev server, open browser console:
  # Upload a test image via UI
  # Check Network tab for POST to S3
  # Verify response 204 (success)
  ```

- [ ] **8. End-to-End Test**
  ```bash
  # Complete flow:
  # 1. Register candidate
  # 2. Upload profile photo
  # 3. Create profile
  # 4. Verify photo URL saved in DB
  # 5. View profile (photo should display)
  ```

---

## 🔒 SECURITY CHECKLIST

- [ ] **Bucket Private:** ACL set to private (no public read)
- [ ] **Encryption Enabled:** Server-side encryption AES256
- [ ] **CORS Restrictive:** Only allowed origins (not wildcard *)
- [ ] **Presigned URL Short TTL:** 5 minutes expiry
- [ ] **File Type Validation:** Backend validates MIME type
- [ ] **File Size Limit:** Max 2MB enforced in presigned conditions
- [ ] **URL Validation:** Backend validates URL is from our bucket
- [ ] **IAM Principle of Least Privilege:** Only necessary S3 permissions
- [ ] **Credentials in Secrets Manager:** Not in .env (production)
- [ ] **HTTPS Only:** All S3 URLs use https://

---

## 📊 MONITORING & TROUBLESHOOTING

### CloudWatch Metrics to Monitor

1. **S3 Bucket Metrics:**
   - NumberOfObjects
   - BucketSizeBytes
   - AllRequests
   - GetRequests
   - PutRequests

2. **Error Rates:**
   - 4xxErrors (client errors - often CORS issues)
   - 5xxErrors (server errors)

### Common Issues & Solutions

**Issue 1: CORS Error in Browser**
```
Access to fetch at 'https://talentbase-dev-uploads.s3.amazonaws.com/...'
from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution:**
- Verify CORS config includes your origin
- Check AllowedMethods includes POST
- Verify AllowedHeaders includes *

**Issue 2: 403 Forbidden on Upload**
```
<Error><Code>AccessDenied</Code><Message>...</Message></Error>
```
**Solution:**
- Verify IAM policy attached to user/role
- Check bucket policy allows PutObject
- Verify presigned URL not expired (5 min TTL)

**Issue 3: Backend Cannot Generate Presigned URL**
```
botocore.exceptions.NoCredentialsError: Unable to locate credentials
```
**Solution:**
- Verify AWS_ACCESS_KEY_ID in .env
- Verify AWS_SECRET_ACCESS_KEY in .env
- Check `aws configure list` shows credentials

**Issue 4: File Upload Succeeds but URL Not Saved**
```
ValidationError: Photo URL must be from TalentBase S3 bucket
```
**Solution:**
- Check validate_s3_url() logic includes correct bucket name
- Verify URL format matches expected patterns
- Log the URL being validated for debugging

---

## 🚀 NEXT STEPS

### After S3 Setup Complete

1. **Create File Upload Utilities** (Amelia - 4h)
   - Implement hooks/useS3Upload.ts
   - Add client-side validation
   - Add progress indicators

2. **Implement Story 3.1 Backend** (Amelia - 1 day)
   - CandidateProfile serializer with photo validation
   - API endpoints for profile creation
   - Delete old photo logic on update

3. **Implement Story 3.1 Frontend** (Amelia - 1 day)
   - Multi-step form wizard
   - Photo upload component
   - Save draft functionality

4. **Testing** (Murat - 4h)
   - Unit tests: presigned URL generation, validation
   - Integration tests: Full upload flow with LocalStack
   - E2E tests: Upload via UI, verify in DB

---

## 📎 APPENDIX

### A. Bucket Structure

```
s3://talentbase-dev-uploads/
├── candidate-photos/
│   ├── {uuid}.jpg
│   ├── {uuid}.png
│   └── ...
├── company-logos/          # Future: Epic 4
│   └── {uuid}.png
└── job-attachments/        # Future: Epic 4
    └── {uuid}.pdf
```

### B. Environment Variables Reference

```bash
# Development
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=talentbase-dev-uploads
AWS_S3_REGION_NAME=us-east-1

# Production (use AWS Secrets Manager)
AWS_ACCESS_KEY_ID=${SECRETS_MANAGER:talentbase/aws:access_key_id}
AWS_SECRET_ACCESS_KEY=${SECRETS_MANAGER:talentbase/aws:secret_access_key}
AWS_STORAGE_BUCKET_NAME=talentbase-prod-uploads
AWS_S3_REGION_NAME=us-east-1
```

### C. Estimated Costs

**S3 Storage:**
- 1000 candidates × 500KB/photo = 500MB
- $0.023/GB/month = ~$0.01/month

**S3 Requests:**
- 1000 uploads/month = 1000 PUT requests
- $0.005/1000 PUT = $0.005/month

**Data Transfer:**
- Uploads are free (data IN)
- Downloads (photo views): 1000 views × 500KB = 500MB
- $0.09/GB = ~$0.045/month

**Total Estimated:** ~$0.06/month for 1000 candidates (negligible)

---

**Document Owner:** Winston (Architect)
**Last Updated:** 2025-10-09
**Status:** ✅ Ready for Implementation
**Estimated Setup Time:** 2-3 horas
