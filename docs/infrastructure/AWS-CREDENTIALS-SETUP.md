# AWS Credentials Configuration - TalentBase

**Date:** 2025-10-09
**Story:** 3.1 - Profile Photos Upload
**Status:** ✅ COMPLETE

---

## 📋 Overview

Este documento descreve como as credenciais AWS são gerenciadas no TalentBase para diferentes ambientes.

## 🔑 Estratégia de Credenciais

### Local Development (`.env`)

**Credenciais armazenadas em:** `apps/api/.env`

```bash
# AWS S3 Configuration (Story 3.1 - Profile Photos Upload)
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_STORAGE_BUCKET_NAME=talentbase-dev-uploads
AWS_S3_REGION_NAME=us-east-1
```

**Django Settings:** `apps/api/talentbase/settings/base.py`

```python
# AWS S3 Configuration (Story 3.1 - Profile Photos Upload)
AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_S3_REGION_NAME = config("AWS_S3_REGION_NAME", default="us-east-1")
AWS_S3_SIGNATURE_VERSION = "s3v4"
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None
AWS_S3_ENCRYPTION = "AES256"

# Presigned URL Configuration
AWS_PRESIGNED_EXPIRY = 300  # 5 minutes

# File Upload Constraints
MAX_UPLOAD_SIZE = 2 * 1024 * 1024  # 2MB
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"]
ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"]
```

---

### Production/Staging (AWS Secrets Manager)

**Credenciais armazenadas em:** AWS Secrets Manager

**Secret Name:** `talentbase/{environment}/aws-s3-credentials`

**Secret Format (JSON):**
```json
{
  "AWS_ACCESS_KEY_ID": "AKIA...",
  "AWS_SECRET_ACCESS_KEY": "..."
}
```

**ECS Task Definition:** `infrastructure/lib/application-stack.ts`

```typescript
// Environment variables (non-sensitive)
AWS_STORAGE_BUCKET_NAME: config.tags.Environment === 'production'
  ? 'talentbase-prod-uploads'
  : 'talentbase-dev-uploads',
AWS_S3_REGION_NAME: 'us-east-1',

// Secrets (sensitive - from Secrets Manager)
if (awsS3Credentials) {
  apiSecrets.AWS_ACCESS_KEY_ID = ecs.Secret.fromSecretsManager(
    awsS3Credentials,
    'AWS_ACCESS_KEY_ID'
  );
  apiSecrets.AWS_SECRET_ACCESS_KEY = ecs.Secret.fromSecretsManager(
    awsS3Credentials,
    'AWS_SECRET_ACCESS_KEY'
  );
}
```

---

## 🛠️ Setup Steps

### 1. Local Development

```bash
# Credenciais já estão no .env
cd apps/api
cat .env | grep AWS_
```

### 2. Production/Staging Setup

**Step 1: Create Secret in Secrets Manager**

```bash
# Automated script
./scripts/aws/update-s3-credentials.sh dev
./scripts/aws/update-s3-credentials.sh prod
```

**Or manually:**

```bash
aws secretsmanager create-secret \
  --name talentbase/dev/aws-s3-credentials \
  --description "AWS S3 credentials for TalentBase dev" \
  --secret-string '{
    "AWS_ACCESS_KEY_ID": "AKIA...",
    "AWS_SECRET_ACCESS_KEY": "..."
  }'
```

**Step 2: Deploy CDK Stack**

```bash
cd infrastructure
npm run build
npm run deploy:dev  # or deploy:prod
```

**Step 3: Verify ECS Task Has Access**

```bash
# Check ECS task definition
aws ecs describe-task-definition \
  --task-definition talentbase-dev-api \
  --query 'taskDefinition.containerDefinitions[0].secrets'

# Should show:
# [
#   {
#     "name": "AWS_ACCESS_KEY_ID",
#     "valueFrom": "arn:aws:secretsmanager:...:secret:talentbase/dev/aws-s3-credentials:AWS_ACCESS_KEY_ID::"
#   },
#   {
#     "name": "AWS_SECRET_ACCESS_KEY",
#     "valueFrom": "arn:aws:secretsmanager:...:secret:talentbase/dev/aws-s3-credentials:AWS_SECRET_ACCESS_KEY::"
#   }
# ]
```

---

## 🔒 Security Best Practices

### ✅ DO:

- ✅ Store credentials in `.env` for local development (`.env` is in `.gitignore`)
- ✅ Use AWS Secrets Manager for production/staging
- ✅ Use IAM roles with least privilege (only S3 permissions needed)
- ✅ Rotate credentials periodically
- ✅ Use presigned URLs (credentials never exposed to frontend)

### ❌ DON'T:

- ❌ Never commit `.env` to git
- ❌ Never hardcode credentials in code
- ❌ Never expose AWS credentials to frontend
- ❌ Never use root AWS account credentials
- ❌ Never share credentials between environments

---

## 🔄 Credential Rotation

When rotating AWS credentials:

**Step 1: Create new IAM access key**
```bash
aws iam create-access-key --user-name salesdog-dev
```

**Step 2: Update Secrets Manager**
```bash
./scripts/aws/update-s3-credentials.sh dev
```

**Step 3: Update local `.env`**
```bash
# Edit apps/api/.env with new credentials
```

**Step 4: Test locally**
```bash
cd apps/api
poetry run python manage.py shell
>>> from core.utils.s3 import get_s3_client
>>> s3_client = get_s3_client()
>>> s3_client.list_buckets()
```

**Step 5: Deploy to production**
```bash
cd infrastructure
npm run deploy:dev
```

**Step 6: Delete old access key**
```bash
aws iam delete-access-key --user-name salesdog-dev --access-key-id OLD_KEY_ID
```

---

## 🧪 Testing Credentials

### Local Development

```bash
cd apps/api
DJANGO_SETTINGS_MODULE=talentbase.settings.development poetry run python manage.py shell
```

```python
from django.conf import settings
from core.utils.s3 import get_s3_client, generate_presigned_url

# Test S3 client
s3_client = get_s3_client()
print(s3_client.list_buckets())

# Test presigned URL generation
url = generate_presigned_url('test.jpg', 'image/jpeg')
print(url['url'])

# Expected output:
# {'url': 'https://talentbase-dev-uploads.s3.amazonaws.com/', 'fields': {...}}
```

### Production (via ECS Exec)

```bash
# Connect to running ECS task
aws ecs execute-command \
  --cluster talentbase-dev-cluster \
  --task <task-id> \
  --container ApiContainer \
  --interactive \
  --command "/bin/bash"

# Inside container:
python manage.py shell
>>> from django.conf import settings
>>> print(settings.AWS_ACCESS_KEY_ID[:10] + "...")
>>> print(settings.AWS_STORAGE_BUCKET_NAME)
```

---

## 📊 Current Configuration

### IAM User
- **User:** `salesdog-dev`
- **ARN:** `arn:aws:iam::258993895334:user/salesdog-dev`
- **Policies:**
  - `TalentBaseS3UploadPolicy` (custom)
  - `PowerUserAccess` (AWS managed)
  - `IAMFullAccess` (AWS managed)

### IAM Policy (TalentBaseS3UploadPolicy)
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
      "Action": ["s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::talentbase-dev-uploads",
        "arn:aws:s3:::talentbase-prod-uploads"
      ]
    }
  ]
}
```

### S3 Buckets
- **Dev:** `talentbase-dev-uploads`
- **Prod:** `talentbase-prod-uploads`
- **Region:** `us-east-1`

### Secrets Manager
- **Dev Secret:** `talentbase/dev/aws-s3-credentials`
  - ARN: `arn:aws:secretsmanager:us-east-1:258993895334:secret:talentbase/dev/aws-s3-credentials-maQttg`
- **Prod Secret:** (to be created when needed)

---

## 📝 Files Modified

### Backend Configuration
- ✅ `apps/api/.env` - Added AWS S3 credentials
- ✅ `apps/api/.env.example` - Added AWS S3 placeholders
- ✅ `apps/api/talentbase/settings/base.py` - Added AWS S3 settings

### Infrastructure (CDK)
- ✅ `infrastructure/lib/secrets-stack.ts` - Added `awsS3Credentials` secret
- ✅ `infrastructure/lib/application-stack.ts` - Added S3 environment variables and secrets
- ✅ `infrastructure/lib/ecs-stack.ts` - Added `AWS_STORAGE_BUCKET_NAME` and `AWS_S3_REGION_NAME`
- ✅ `infrastructure/bin/talentbase-infrastructure.ts` - Passed `awsS3Credentials` to stacks

### Scripts
- ✅ `scripts/aws/update-s3-credentials.sh` - Script to update Secrets Manager

---

## 🚀 Next Steps

1. **Install boto3:**
   ```bash
   cd apps/api
   poetry add boto3
   ```

2. **Implement S3 utilities:**
   - Create `apps/api/core/utils/s3.py`
   - Implement presigned URL generation
   - Implement URL validation

3. **Deploy infrastructure:**
   ```bash
   cd infrastructure
   npm run deploy:dev
   ```

4. **Test end-to-end:**
   - Generate presigned URL
   - Upload file from frontend
   - Verify file in S3
   - Save URL to database

---

## 🔍 Troubleshooting

### Issue: "NoCredentialsError: Unable to locate credentials"

**Solution:**
```bash
# Local development
cat apps/api/.env | grep AWS_

# Verify settings.py loads them
cd apps/api
poetry run python manage.py shell
>>> from django.conf import settings
>>> print(settings.AWS_ACCESS_KEY_ID)
```

### Issue: "AccessDenied" when generating presigned URL

**Solution:**
```bash
# Verify IAM policy is attached
aws iam list-attached-user-policies --user-name salesdog-dev

# Verify policy allows PutObject
aws iam get-policy-version \
  --policy-arn arn:aws:iam::258993895334:policy/TalentBaseS3UploadPolicy \
  --version-id v1
```

### Issue: ECS task can't access Secrets Manager

**Solution:**
```bash
# Check execution role has SecretsManager permissions
aws iam list-attached-role-policies \
  --role-name talentbase-dev-application-TaskExecutionRole...

# Check secret exists
aws secretsmanager get-secret-value \
  --secret-id talentbase/dev/aws-s3-credentials
```

---

**Status:** ✅ Configuration Complete
**Ready for:** Story 3.1 Implementation (S3 utilities + API endpoints)
