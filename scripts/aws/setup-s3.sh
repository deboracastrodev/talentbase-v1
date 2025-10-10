#!/bin/bash
#
# AWS S3 Setup Script - TalentBase
#
# Description: Automated setup of S3 buckets for TalentBase file storage
# Author: Winston (Architect)
# Date: 2025-10-09
#
# Prerequisites:
#   - AWS CLI installed and configured
#   - Appropriate IAM permissions
#
# Usage:
#   ./scripts/aws/setup-s3.sh [environment]
#
#   environment: dev | staging | prod (default: dev)
#
# Example:
#   ./scripts/aws/setup-s3.sh dev
#

set -e  # Exit on error
set -u  # Exit on undefined variable

# ============================================================================
# CONFIGURATION
# ============================================================================

ENVIRONMENT="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Bucket configuration
case "$ENVIRONMENT" in
  dev)
    BUCKET_NAME="talentbase-dev-uploads"
    REGION="us-east-1"
    ALLOWED_ORIGINS='["http://localhost:3000","http://localhost:8000","https://dev.salesdog.click"]'
    ;;
  staging)
    BUCKET_NAME="talentbase-staging-uploads"
    REGION="us-east-1"
    ALLOWED_ORIGINS='["https://staging.salesdog.click"]'
    ;;
  prod)
    BUCKET_NAME="talentbase-prod-uploads"
    REGION="us-east-1"
    ALLOWED_ORIGINS='["https://www.salesdog.click","https://salesdog.click"]'
    ;;
  *)
    echo -e "${RED}Error: Invalid environment '${ENVIRONMENT}'${NC}"
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
    ;;
esac

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

check_aws_cli() {
  if ! command -v aws &> /dev/null; then
    log_error "AWS CLI not found. Please install it first."
    echo "Install: https://aws.amazon.com/cli/"
    exit 1
  fi
  log_success "AWS CLI found: $(aws --version)"
}

check_aws_credentials() {
  if ! aws sts get-caller-identity &> /dev/null; then
    log_error "AWS credentials not configured or invalid."
    echo "Run: aws configure"
    exit 1
  fi

  local identity=$(aws sts get-caller-identity --output json)
  local account_id=$(echo "$identity" | grep -o '"Account": "[^"]*' | cut -d'"' -f4)
  local user_arn=$(echo "$identity" | grep -o '"Arn": "[^"]*' | cut -d'"' -f4)

  log_success "AWS credentials valid"
  log_info "Account ID: $account_id"
  log_info "User ARN: $user_arn"
}

bucket_exists() {
  aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null
  return $?
}

# ============================================================================
# MAIN SETUP FUNCTIONS
# ============================================================================

create_bucket() {
  log_info "Step 1/7: Creating S3 bucket: $BUCKET_NAME"

  if bucket_exists; then
    log_warning "Bucket $BUCKET_NAME already exists. Skipping creation."
    return 0
  fi

  if [ "$REGION" = "us-east-1" ]; then
    # us-east-1 doesn't need LocationConstraint
    aws s3api create-bucket \
      --bucket "$BUCKET_NAME" \
      --acl private
  else
    aws s3api create-bucket \
      --bucket "$BUCKET_NAME" \
      --region "$REGION" \
      --acl private \
      --create-bucket-configuration LocationConstraint="$REGION"
  fi

  log_success "Bucket created: $BUCKET_NAME"
}

configure_bucket_policy() {
  log_info "Step 2/7: Configuring bucket policy"

  local policy_file="$SCRIPT_DIR/configs/bucket-policy.json"

  # Generate policy dynamically
  cat > "$policy_file" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPresignedUploads",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*",
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
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
EOF

  aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file://"$policy_file"

  log_success "Bucket policy configured"
}

configure_cors() {
  log_info "Step 3/7: Configuring CORS"

  local cors_file="$SCRIPT_DIR/configs/cors-config.json"

  # Generate CORS config dynamically
  cat > "$cors_file" <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ${ALLOWED_ORIGINS},
      "AllowedMethods": ["GET", "POST", "PUT"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "Location", "Content-Length"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

  aws s3api put-bucket-cors \
    --bucket "$BUCKET_NAME" \
    --cors-configuration file://"$cors_file"

  log_success "CORS configured"
}

enable_encryption() {
  log_info "Step 4/7: Enabling server-side encryption"

  aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
      "Rules": [{
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }]
    }'

  log_success "Encryption enabled (AES256)"
}

configure_lifecycle() {
  log_info "Step 5/7: Configuring lifecycle rules"

  local lifecycle_file="$SCRIPT_DIR/configs/lifecycle-config.json"

  cat > "$lifecycle_file" <<EOF
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
      "Id": "DeleteOldVideos",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "candidate-videos/"
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
EOF

  aws s3api put-bucket-lifecycle-configuration \
    --bucket "$BUCKET_NAME" \
    --lifecycle-configuration file://"$lifecycle_file"

  log_success "Lifecycle rules configured"
}

create_folder_structure() {
  log_info "Step 6/7: Creating folder structure"

  # S3 doesn't have folders, but we can create empty objects as markers
  echo "" | aws s3 cp - "s3://${BUCKET_NAME}/candidate-photos/.keep" --content-type "text/plain"
  echo "" | aws s3 cp - "s3://${BUCKET_NAME}/candidate-videos/raw/.keep" --content-type "text/plain"
  echo "" | aws s3 cp - "s3://${BUCKET_NAME}/candidate-videos/hls/.keep" --content-type "text/plain"
  echo "" | aws s3 cp - "s3://${BUCKET_NAME}/company-logos/.keep" --content-type "text/plain"
  echo "" | aws s3 cp - "s3://${BUCKET_NAME}/job-attachments/.keep" --content-type "text/plain"

  log_success "Folder structure created"
}

block_public_access() {
  log_info "Step 7/7: Blocking public access"

  aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
      "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

  log_success "Public access blocked"
}

verify_setup() {
  log_info "Verifying setup..."

  echo ""
  echo "==================================================="
  echo "VERIFICATION RESULTS"
  echo "==================================================="

  # Check bucket exists
  if bucket_exists; then
    log_success "✓ Bucket exists: $BUCKET_NAME"
  else
    log_error "✗ Bucket not found: $BUCKET_NAME"
    return 1
  fi

  # Check encryption
  if aws s3api get-bucket-encryption --bucket "$BUCKET_NAME" &> /dev/null; then
    log_success "✓ Encryption enabled"
  else
    log_warning "✗ Encryption not configured"
  fi

  # Check CORS
  if aws s3api get-bucket-cors --bucket "$BUCKET_NAME" &> /dev/null; then
    log_success "✓ CORS configured"
  else
    log_warning "✗ CORS not configured"
  fi

  # Check lifecycle
  if aws s3api get-bucket-lifecycle-configuration --bucket "$BUCKET_NAME" &> /dev/null; then
    log_success "✓ Lifecycle rules configured"
  else
    log_warning "✗ Lifecycle rules not configured"
  fi

  # Check public access block
  if aws s3api get-public-access-block --bucket "$BUCKET_NAME" &> /dev/null; then
    log_success "✓ Public access blocked"
  else
    log_warning "✗ Public access not blocked"
  fi

  # List bucket structure
  echo ""
  log_info "Bucket structure:"
  aws s3 ls "s3://${BUCKET_NAME}/" --recursive | head -10

  echo ""
  echo "==================================================="
}

print_summary() {
  echo ""
  echo "==================================================="
  echo "SETUP COMPLETE - SUMMARY"
  echo "==================================================="
  echo ""
  echo "Environment: $ENVIRONMENT"
  echo "Bucket Name: $BUCKET_NAME"
  echo "Region: $REGION"
  echo ""
  echo "Bucket URL: https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com"
  echo ""
  echo "Folder Structure:"
  echo "  - candidate-photos/     (Profile photos)"
  echo "  - candidate-videos/     (Video uploads)"
  echo "    - raw/                (Original videos)"
  echo "    - hls/                (Transcoded videos)"
  echo "  - company-logos/        (Company branding)"
  echo "  - job-attachments/      (Job documents)"
  echo ""
  echo "Next Steps:"
  echo "  1. Update Django settings with bucket name:"
  echo "     AWS_STORAGE_BUCKET_NAME='${BUCKET_NAME}'"
  echo "     AWS_S3_REGION_NAME='${REGION}'"
  echo ""
  echo "  2. Run verification script:"
  echo "     ./scripts/aws/verify-s3.sh ${ENVIRONMENT}"
  echo ""
  echo "  3. Test presigned URL generation:"
  echo "     python manage.py shell"
  echo "     >>> from core.utils.s3 import generate_presigned_url"
  echo "     >>> generate_presigned_url('test.jpg', 'image/jpeg')"
  echo ""
  echo "==================================================="
  echo ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  echo ""
  echo "==================================================="
  echo "AWS S3 SETUP - TalentBase"
  echo "==================================================="
  echo ""
  echo "Environment: $ENVIRONMENT"
  echo "Bucket Name: $BUCKET_NAME"
  echo "Region: $REGION"
  echo ""

  # Create configs directory
  mkdir -p "$SCRIPT_DIR/configs"

  # Prerequisites check
  log_info "Checking prerequisites..."
  check_aws_cli
  check_aws_credentials
  echo ""

  # Execute setup steps
  create_bucket
  configure_bucket_policy
  configure_cors
  enable_encryption
  configure_lifecycle
  create_folder_structure
  block_public_access

  echo ""

  # Verify
  verify_setup

  # Summary
  print_summary

  log_success "S3 setup completed successfully!"
  exit 0
}

# Run main function
main
