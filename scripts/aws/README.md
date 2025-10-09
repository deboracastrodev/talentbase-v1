# AWS Automation Scripts - TalentBase

**Author:** Winston (Architect)
**Date:** 2025-10-09
**Related Docs:**
- [AWS-S3-SETUP.md](../../docs/infrastructure/AWS-S3-SETUP.md)
- [AWS-S3-VIDEO-STORAGE.md](../../docs/infrastructure/AWS-S3-VIDEO-STORAGE.md)

---

## 📋 OVERVIEW

Automated scripts para setup, verificação e gerenciamento de AWS resources para TalentBase.

### Scripts Disponíveis

| Script | Purpose | Estimated Time |
|--------|---------|----------------|
| **S3 Scripts** |
| `setup-s3.sh` | Setup completo do S3 bucket | 2-3 minutos |
| `verify-s3.sh` | Verificação de setup e testes | 1-2 minutos |
| `cleanup-s3.sh` | Remover bucket e conteúdo | 1 minuto |
| **IAM Scripts** |
| `setup-iam.sh` | Criar IAM user e policies | 2-3 minutos |
| `verify-iam.sh` | Verificar IAM permissions | 1-2 minutos |

---

## 🚀 QUICK START

### Prerequisites

1. **AWS CLI installed and configured**
2. **Admin IAM permissions** (for initial setup)
3. **Project at root directory**

---

## S3 SETUP

### 1. Setup S3 Bucket (Development)

```bash
# Navigate to project root
cd /Users/debor/Documents/sistemas/talentbase-v1

# Run setup script
./scripts/aws/setup-s3.sh dev
```

**O que o script faz:**
- ✅ Cria bucket `talentbase-dev-uploads`
- ✅ Configura bucket policy (presigned uploads)
- ✅ Configura CORS (localhost + dev URLs)
- ✅ Enable encryption (AES256)
- ✅ Configura lifecycle rules (cleanup)
- ✅ Cria folder structure
- ✅ Bloqueia public access

**Output esperado:**
```
===================================================
AWS S3 SETUP - TalentBase
===================================================

Environment: dev
Bucket Name: talentbase-dev-uploads
Region: us-east-1

[INFO] Checking prerequisites...
[SUCCESS] AWS CLI found: aws-cli/2.13.0
[SUCCESS] AWS credentials valid
Account ID: 123456789012
User ARN: arn:aws:iam::123456789012:user/talentbase-backend

[INFO] Step 1/7: Creating S3 bucket: talentbase-dev-uploads
[SUCCESS] Bucket created: talentbase-dev-uploads

[INFO] Step 2/7: Configuring bucket policy
[SUCCESS] Bucket policy configured

[INFO] Step 3/7: Configuring CORS
[SUCCESS] CORS configured

[INFO] Step 4/7: Enabling server-side encryption
[SUCCESS] Encryption enabled (AES256)

[INFO] Step 5/7: Configuring lifecycle rules
[SUCCESS] Lifecycle rules configured

[INFO] Step 6/7: Creating folder structure
[SUCCESS] Folder structure created

[INFO] Step 7/7: Blocking public access
[SUCCESS] Public access blocked

===================================================
VERIFICATION RESULTS
===================================================

[SUCCESS] ✓ Bucket exists: talentbase-dev-uploads
[SUCCESS] ✓ Encryption enabled
[SUCCESS] ✓ CORS configured
[SUCCESS] ✓ Lifecycle rules configured
[SUCCESS] ✓ Public access blocked

[INFO] Bucket structure:
2025-10-09 10:30:00          0 candidate-photos/.keep
2025-10-09 10:30:00          0 candidate-videos/raw/.keep
2025-10-09 10:30:00          0 candidate-videos/hls/.keep
2025-10-09 10:30:00          0 company-logos/.keep
2025-10-09 10:30:00          0 job-attachments/.keep

===================================================
SETUP COMPLETE - SUMMARY
===================================================

Environment: dev
Bucket Name: talentbase-dev-uploads
Region: us-east-1

Bucket URL: https://talentbase-dev-uploads.s3.us-east-1.amazonaws.com

Folder Structure:
  - candidate-photos/     (Profile photos)
  - candidate-videos/     (Video uploads)
    - raw/                (Original videos)
    - hls/                (Transcoded videos)
  - company-logos/        (Company branding)
  - job-attachments/      (Job documents)

Next Steps:
  1. Update Django settings with bucket name:
     AWS_STORAGE_BUCKET_NAME='talentbase-dev-uploads'
     AWS_S3_REGION_NAME='us-east-1'

  2. Run verification script:
     ./scripts/aws/verify-s3.sh dev

  3. Test presigned URL generation:
     python manage.py shell
     >>> from core.utils.s3 import generate_presigned_url
     >>> generate_presigned_url('test.jpg', 'image/jpeg')

===================================================

[SUCCESS] S3 setup completed successfully!
```

---

### 2. Verify S3 Setup

```bash
./scripts/aws/verify-s3.sh dev
```

**O que o script verifica:**
- ✅ Bucket existence
- ✅ Server-side encryption (AES256)
- ✅ CORS configuration (origins, methods)
- ✅ Public access block
- ✅ Lifecycle rules
- ✅ Folder structure
- ✅ Upload/Download test (end-to-end)
- ✅ Bucket policy (presigned URLs, encryption enforcement)

**Output esperado:**
```
===================================================
AWS S3 VERIFICATION - TalentBase
===================================================

Environment: dev
Bucket: talentbase-dev-uploads

Running 8 tests...

[INFO] Test 1: Bucket Existence
  ✓ PASS: Bucket exists: talentbase-dev-uploads

[INFO] Test 2: Server-Side Encryption
  ✓ PASS: Encryption enabled (AES256)

[INFO] Test 3: CORS Configuration
  ✓ PASS: CORS allows GET and POST methods
  ✓ PASS: CORS origins configured

[INFO] Test 4: Public Access Block
  ✓ PASS: Public access properly blocked

[INFO] Test 5: Lifecycle Rules
  ✓ PASS: Lifecycle rules configured (incomplete upload cleanup)

[INFO] Test 6: Folder Structure
  ✓ Found: candidate-photos/
  ✓ Found: candidate-videos/raw/
  ✓ Found: candidate-videos/hls/
  ✓ Found: company-logos/
  ✓ Found: job-attachments/
  ✓ PASS: All expected folders exist

[INFO] Test 7: Upload/Download (End-to-End)
  ✓ PASS: Upload successful
  ✓ PASS: Download successful
  ✓ PASS: Content integrity verified

[INFO] Test 8: Bucket Policy
  ✓ PASS: Bucket policy allows presigned uploads
  ✓ PASS: Bucket policy enforces encryption

===================================================
TEST RESULTS
===================================================

Total Tests: 8
Passed: 8
Failed: 0

[✓] All tests passed! ✓

S3 bucket is properly configured and ready for use.

Next Steps:
  1. Update Django .env with:
     AWS_STORAGE_BUCKET_NAME=talentbase-dev-uploads
     AWS_S3_REGION_NAME=us-east-1

  2. Test presigned URL generation from Django:
     python manage.py shell
     >>> from core.utils.s3 import generate_presigned_url
     >>> result = generate_presigned_url('test.jpg', 'image/jpeg')
     >>> print(result['url'])
```

---

---

## IAM SETUP

### 1. Create IAM User and Policies (Development)

```bash
# Navigate to project root
cd /Users/debor/Documents/sistemas/talentbase-v1

# Run IAM setup script
./scripts/aws/setup-iam.sh dev
```

**O que o script faz:**
- ✅ Cria IAM user `talentbase-backend-dev`
- ✅ Cria S3 policy com permissions específicas
- ✅ Attach policy ao user
- ✅ Gera access keys
- ✅ Salva credentials em arquivo seguro

**IMPORTANTE:** O script gera credentials que devem ser:
1. Copiados para password manager
2. Adicionados ao Django `.env`
3. Arquivo de credentials deletado após uso

**Output esperado:**
```
===================================================
AWS IAM SETUP - TalentBase
===================================================

Environment: dev
IAM User: talentbase-backend-dev
S3 Bucket: talentbase-dev-uploads

[INFO] Checking IAM permissions...
[SUCCESS] IAM access confirmed

[INFO] Step 1/5: Creating S3 access policy
[SUCCESS] Policy created: talentbase-backend-dev-s3-policy

[INFO] Step 2/5: Creating IAM user
[SUCCESS] IAM user created: talentbase-backend-dev

[INFO] Step 3/5: Attaching policy to user
[SUCCESS] Policy attached to user

[INFO] Step 4/5: Creating access key
[SUCCESS] Access key created
[SUCCESS] Credentials saved to: scripts/aws/credentials/dev-credentials.txt

===================================================
⚠️  CREDENTIALS GENERATED
===================================================

Access Key ID: AKIAIOSFODNN7EXAMPLE
Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

Credentials file: scripts/aws/credentials/dev-credentials.txt

IMPORTANT:
  1. Copy these credentials to your password manager NOW
  2. Add to Django .env file
  3. Delete credentials file after copying: rm scripts/aws/credentials/dev-credentials.txt
  4. In production, use AWS Secrets Manager instead

===================================================

[INFO] Step 5/5: Verifying IAM setup

===================================================
VERIFICATION RESULTS
===================================================

[SUCCESS] ✓ IAM user exists: talentbase-backend-dev
[SUCCESS] ✓ Policy exists: talentbase-backend-dev-s3-policy
[SUCCESS] ✓ Policy attached to user
[SUCCESS] ✓ Access key(s) created: 1 key(s)

===================================================
IAM SETUP COMPLETE - SUMMARY
===================================================

Environment: dev
IAM User: talentbase-backend-dev
Policy: talentbase-backend-dev-s3-policy
S3 Bucket: talentbase-dev-uploads
Region: us-east-1

User ARN: arn:aws:iam::123456789012:user/talentbase-backend-dev
Policy ARN: arn:aws:iam::123456789012:policy/talentbase-backend-dev-s3-policy

Permissions Granted:
  ✓ S3 PutObject, GetObject, DeleteObject
  ✓ S3 ListBucket, GetBucketLocation
  ✓ Generate presigned URLs

Next Steps:

  1. Copy credentials to password manager

  2. Add to Django .env file:
     AWS_ACCESS_KEY_ID=<from credentials file>
     AWS_SECRET_ACCESS_KEY=<from credentials file>
     AWS_STORAGE_BUCKET_NAME=talentbase-dev-uploads
     AWS_S3_REGION_NAME=us-east-1

  3. Test IAM credentials:
     ./scripts/aws/verify-iam.sh dev

  4. Delete credentials file after copying:
     rm scripts/aws/credentials/dev-credentials.txt

  5. For production, migrate to AWS Secrets Manager:
     ./scripts/aws/setup-secrets-manager.sh prod

===================================================

[SUCCESS] IAM setup completed successfully!
```

---

### 2. Verify IAM Setup

```bash
./scripts/aws/verify-iam.sh dev
```

**O que o script verifica:**
- ✅ IAM user existence
- ✅ Policy attachment
- ✅ Access keys (existence and status)
- ✅ S3 ListBucket permission
- ✅ S3 object permissions (PutObject, GetObject, DeleteObject)
- ✅ Bucket access integration
- ✅ Access key age (security check)
- ✅ MFA status (security check)

**Output esperado:**
```
===================================================
AWS IAM VERIFICATION - TalentBase
===================================================

Environment: dev
IAM User: talentbase-backend-dev
S3 Bucket: talentbase-dev-uploads

Running 8 tests...

[INFO] Test 1: IAM User Existence
  ✓ PASS: User exists: talentbase-backend-dev

[INFO] Test 2: Policy Attachment
  ✓ PASS: Policy attached: talentbase-backend-dev-s3-policy

[INFO] Test 3: Access Keys
  ✓ PASS: Access keys exist: 1 key(s)
  ✓ PASS: Active keys found

[INFO] Test 4: S3 ListBucket Permission
  ✓ PASS: Policy allows ListBucket action

[INFO] Test 5: S3 Object Permissions
  ✓ Permission granted: s3:PutObject
  ✓ Permission granted: s3:GetObject
  ✓ Permission granted: s3:DeleteObject
  ✓ PASS: All required S3 object permissions present

[INFO] Test 6: S3 Bucket Access (Integration)
  ✓ PASS: Bucket accessible: talentbase-dev-uploads

[INFO] Test 7: Access Key Age (Security)
  ✓ Key AKIAIOSFODNN7EXAMPLE is 1 days old (<90 days)
  ✓ PASS: All keys are within recommended age

[INFO] Test 8: MFA Status (Security)
  ✗ FAIL: MFA not enabled (recommended for production)
  Consider enabling MFA for enhanced security

===================================================
TEST RESULTS
===================================================

Total Tests: 8
Passed: 7
Failed: 1

All tests passed! ✓

IAM user is properly configured and ready for use.

Next Steps:
  1. Add credentials to Django .env
  2. Test from Django: python manage.py shell
     >>> from core.utils.s3 import generate_presigned_url
     >>> generate_presigned_url('test.jpg', 'image/jpeg')
```

---

### 3. Update Django Settings

Após setup IAM e S3 bem-sucedido, adicione ao `.env`:

**File: `apps/api/.env.development`**
```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_STORAGE_BUCKET_NAME=talentbase-dev-uploads
AWS_S3_REGION_NAME=us-east-1
```

**⚠️ SECURITY:**
- Never commit `.env` to git
- Use AWS Secrets Manager in production
- Rotate keys every 90 days

---

## 📖 DETAILED USAGE

### S3 Script Options

```bash
# Development environment (default)
./scripts/aws/setup-s3.sh dev
./scripts/aws/verify-s3.sh dev
./scripts/aws/cleanup-s3.sh dev

# Staging environment
./scripts/aws/setup-s3.sh staging
./scripts/aws/verify-s3.sh staging
./scripts/aws/cleanup-s3.sh staging

# Production environment
./scripts/aws/setup-s3.sh prod
./scripts/aws/verify-s3.sh prod
./scripts/aws/cleanup-s3.sh prod
```

**⚠️ WARNING:** Cleanup script DELETES the bucket and ALL files. Cannot be undone!

---

### IAM Script Options

```bash
# Development environment (default)
./scripts/aws/setup-iam.sh dev
./scripts/aws/verify-iam.sh dev

# Staging environment
./scripts/aws/setup-iam.sh staging
./scripts/aws/verify-iam.sh staging

# Production environment
./scripts/aws/setup-iam.sh prod
./scripts/aws/verify-iam.sh prod
```

**⚠️ SECURITY:** IAM scripts generate credentials that must be:
1. Copied to password manager immediately
2. Added to `.env` file
3. Original file deleted after use

---

## 🔧 TROUBLESHOOTING

### Issue 1: AWS CLI Not Found

**Error:**
```
[ERROR] AWS CLI not found. Please install it first.
```

**Solution:**
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

---

### Issue 2: AWS Credentials Not Configured

**Error:**
```
[ERROR] AWS credentials not configured or invalid.
```

**Solution:**
```bash
# Configure AWS credentials
aws configure

# Enter when prompted:
AWS Access Key ID: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name: us-east-1
Default output format: json

# Verify credentials
aws sts get-caller-identity
```

---

### Issue 3: Bucket Already Exists

**Error:**
```
[WARNING] Bucket talentbase-dev-uploads already exists. Skipping creation.
```

**Solution:**
- This is normal if re-running setup
- Script will skip bucket creation and continue with configuration
- To start fresh, run cleanup first: `./scripts/aws/cleanup-s3.sh dev`

---

### Issue 4: Permission Denied (S3)

**Error:**
```
An error occurred (AccessDenied) when calling the CreateBucket operation
```

**Solution:**
```bash
# Check IAM permissions
aws iam get-user

# Required IAM permissions:
# - s3:CreateBucket
# - s3:PutBucketPolicy
# - s3:PutBucketCors
# - s3:PutBucketEncryption
# - s3:PutBucketLifecycle
# - s3:PutPublicAccessBlock

# Run IAM setup first:
./scripts/aws/setup-iam.sh dev
```

---

### Issue 5: Permission Denied (IAM)

**Error:**
```
An error occurred (AccessDenied) when calling the CreateUser operation
```

**Solution:**
- IAM setup requires **admin permissions** on your AWS account
- Ensure you're using admin credentials: `aws sts get-caller-identity`
- Check your IAM user has these permissions:
  - iam:CreateUser
  - iam:CreatePolicy
  - iam:AttachUserPolicy
  - iam:CreateAccessKey

```bash
# Verify you have admin access
aws iam get-user

# If using root account, this is fine for initial setup
# For production, use IAM user with appropriate permissions
```

---

### Issue 6: CORS Test Failing

**Error in verify script:**
```
[✗] FAIL: CORS not configured
```

**Solution:**
```bash
# Re-run CORS configuration step
aws s3api put-bucket-cors \
  --bucket talentbase-dev-uploads \
  --cors-configuration file://scripts/aws/configs/cors-config.json

# Verify CORS
aws s3api get-bucket-cors --bucket talentbase-dev-uploads
```

---

### Issue 7: IAM Verification Fails (Bucket Not Found)

**Error:**
```
[✗] FAIL: Bucket not found: talentbase-dev-uploads
Run: ./scripts/aws/setup-s3.sh dev
```

**Solution:**
- IAM verify checks if bucket exists
- Run S3 setup before IAM verification:

```bash
# Correct order:
./scripts/aws/setup-iam.sh dev    # Create IAM user/policy
./scripts/aws/setup-s3.sh dev     # Create S3 bucket
./scripts/aws/verify-iam.sh dev   # Verify IAM has access to bucket
```

---

## 📁 FILE STRUCTURE

```
scripts/aws/
├── README.md                     # This file
├── .gitignore                    # Excludes configs/ and credentials/
│
├── setup-s3.sh                   # S3 bucket setup
├── verify-s3.sh                  # S3 verification
├── cleanup-s3.sh                 # S3 cleanup
│
├── setup-iam.sh                  # IAM user/policy setup
├── verify-iam.sh                 # IAM verification
│
├── configs/                      # Generated configs (gitignored)
│   ├── bucket-policy.json        # Generated by setup-s3.sh
│   ├── cors-config.json          # Generated by setup-s3.sh
│   ├── lifecycle-config.json     # Generated by setup-s3.sh
│   └── iam-s3-policy.json        # Generated by setup-iam.sh
│
└── credentials/                  # Generated credentials (gitignored)
    ├── dev-credentials.txt       # Generated by setup-iam.sh
    ├── staging-credentials.txt   # Generated by setup-iam.sh
    └── prod-credentials.txt      # Generated by setup-iam.sh
```

**⚠️ IMPORTANT:**
- `configs/` and `credentials/` are auto-generated and gitignored
- **Delete credentials files after copying to password manager**
- Never commit credentials to git

---

## 🔐 SECURITY CHECKLIST

After running setup, verify security:

### S3 Security
- [ ] **Encryption Enabled:** AES256 server-side encryption
- [ ] **Public Access Blocked:** All 4 public access settings enabled
- [ ] **CORS Restrictive:** Only allowed origins (no wildcard *)
- [ ] **Bucket Policy Enforces Encryption:** Denies unencrypted uploads
- [ ] **Lifecycle Rules:** Cleanup incomplete uploads (1 day)
- [ ] **HTTPS Only:** All S3 URLs use https://

### IAM Security
- [ ] **Least Privilege:** IAM user has only necessary S3 permissions
- [ ] **No Console Access:** IAM user is programmatic access only
- [ ] **Key Rotation:** Access keys rotated every 90 days
- [ ] **MFA Enabled:** For production IAM users
- [ ] **Credentials Stored Securely:** In password manager or Secrets Manager
- [ ] **Credentials Not Committed:** `.env` files gitignored
- [ ] **Credentials File Deleted:** After copying to secure location

### Production Additional Requirements
- [ ] **AWS Secrets Manager:** Credentials stored in Secrets Manager (not .env)
- [ ] **CloudTrail Enabled:** Audit logging for S3 and IAM actions
- [ ] **IAM User Tags:** Environment, Project, Purpose tags set
- [ ] **Access Review:** Regular review of IAM permissions

---

## 💰 COST MONITORING

After setup, monitor costs:

```bash
# Check bucket size
aws s3 ls s3://talentbase-dev-uploads --recursive --summarize

# Example output:
# Total Objects: 500
# Total Size: 250000000 bytes (238 MB)

# Estimated monthly cost:
# Storage: 238 MB × $0.023/GB = $0.005/month
# Uploads: 500 × $0.005/1000 = $0.0025/month
# Total: ~$0.008/month (negligible)
```

---

## 🚀 NEXT STEPS

### Complete Setup Workflow

**Recommended order for first-time setup:**

1. **Setup IAM User** (run with admin credentials)
   ```bash
   ./scripts/aws/setup-iam.sh dev
   # Save credentials to password manager
   # Delete credentials file after copying
   ```

2. **Setup S3 Bucket** (can use admin OR IAM user credentials)
   ```bash
   ./scripts/aws/setup-s3.sh dev
   ```

3. **Verify Everything**
   ```bash
   ./scripts/aws/verify-iam.sh dev
   ./scripts/aws/verify-s3.sh dev
   ```

4. **Update Django Settings**
   - Add credentials to `apps/api/.env.development`
   - Test presigned URL generation

5. **Implementation** (Amelia)
   - Backend: `apps/api/core/utils/s3.py`
   - Views: `apps/api/candidates/views.py`
   - Frontend: `packages/web/app/hooks/useS3Upload.ts`

6. **Testing** (Murat)
   - Unit tests: presigned URL generation
   - Integration tests: Full upload flow
   - E2E tests: Upload via UI

7. **Deploy to Staging**
   ```bash
   ./scripts/aws/setup-iam.sh staging
   ./scripts/aws/setup-s3.sh staging
   ./scripts/aws/verify-iam.sh staging
   ./scripts/aws/verify-s3.sh staging
   ```

8. **Deploy to Production**
   ```bash
   ./scripts/aws/setup-iam.sh prod
   ./scripts/aws/setup-s3.sh prod
   ./scripts/aws/verify-iam.sh prod
   ./scripts/aws/verify-s3.sh prod
   ```

### Django Integration

After setup, test from Django:

```python
python manage.py shell

>>> from core.utils.s3 import generate_presigned_url
>>> result = generate_presigned_url('test.jpg', 'image/jpeg')
>>> print(result['url'])
>>> print(result['fields'])
```

---

## 📞 SUPPORT

**Issues or Questions?**
- Check [AWS-S3-SETUP.md](../../docs/infrastructure/AWS-S3-SETUP.md) for S3 detailed documentation
- Check [AWS-S3-VIDEO-STORAGE.md](../../docs/infrastructure/AWS-S3-VIDEO-STORAGE.md) for video storage
- Check [S3-SETUP-SUMMARY.md](../../docs/infrastructure/S3-SETUP-SUMMARY.md) for executive summary
- Review troubleshooting section above
- Contact: Winston (Architect)

---

## 📊 EXECUTION TIME ESTIMATES

| Task | Manual Time | Automated Time | Time Saved |
|------|-------------|----------------|------------|
| S3 Setup | 45-60 minutes | 2-3 minutes | ~55 minutes |
| IAM Setup | 30-45 minutes | 2-3 minutes | ~40 minutes |
| Verification | 20-30 minutes | 2-4 minutes | ~25 minutes |
| **Total** | **95-135 minutes** | **6-10 minutes** | **~120 minutes** |

**ROI:** Automation saves ~2 hours per environment setup.

---

**Last Updated:** 2025-10-09
**Status:** ✅ Ready for Use
**Scripts:** 5 total (3 S3 + 2 IAM)
