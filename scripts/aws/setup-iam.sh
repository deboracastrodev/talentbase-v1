#!/bin/bash
#
# AWS IAM Setup Script - TalentBase
#
# Description: Create IAM user and policies for TalentBase backend
# Author: Winston (Architect)
# Date: 2025-10-09
#
# Prerequisites:
#   - AWS CLI installed and configured with admin permissions
#   - Appropriate IAM permissions to create users and policies
#
# Usage:
#   ./scripts/aws/setup-iam.sh [environment]
#
#   environment: dev | staging | prod (default: dev)
#
# Example:
#   ./scripts/aws/setup-iam.sh dev
#

set -e
set -u

# ============================================================================
# CONFIGURATION
# ============================================================================

ENVIRONMENT="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# IAM configuration
case "$ENVIRONMENT" in
  dev)
    IAM_USER_NAME="talentbase-backend-dev"
    S3_BUCKET_NAME="talentbase-dev-uploads"
    ;;
  staging)
    IAM_USER_NAME="talentbase-backend-staging"
    S3_BUCKET_NAME="talentbase-staging-uploads"
    ;;
  prod)
    IAM_USER_NAME="talentbase-backend-prod"
    S3_BUCKET_NAME="talentbase-prod-uploads"
    ;;
  *)
    echo -e "${RED}Error: Invalid environment '${ENVIRONMENT}'${NC}"
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
    ;;
esac

POLICY_NAME="${IAM_USER_NAME}-s3-policy"
REGION="us-east-1"

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

check_admin_permissions() {
  log_info "Checking IAM permissions..."

  if ! aws iam get-user 2>/dev/null; then
    log_error "Cannot access IAM. Make sure you have administrator permissions."
    exit 1
  fi

  log_success "IAM access confirmed"
}

user_exists() {
  aws iam get-user --user-name "$IAM_USER_NAME" &>/dev/null
  return $?
}

policy_exists() {
  local account_id=$(aws sts get-caller-identity --query Account --output text)
  aws iam get-policy --policy-arn "arn:aws:iam::${account_id}:policy/${POLICY_NAME}" &>/dev/null
  return $?
}

# ============================================================================
# POLICY CREATION
# ============================================================================

create_s3_policy() {
  log_info "Step 1/5: Creating S3 access policy"

  local account_id=$(aws sts get-caller-identity --query Account --output text)
  local policy_arn="arn:aws:iam::${account_id}:policy/${POLICY_NAME}"

  if policy_exists; then
    log_warning "Policy ${POLICY_NAME} already exists. Skipping creation."
    echo "$policy_arn"
    return 0
  fi

  local policy_file="$SCRIPT_DIR/configs/iam-s3-policy.json"

  # Create policy JSON
  cat > "$policy_file" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3ObjectOperations",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::${S3_BUCKET_NAME}/*"
      ]
    },
    {
      "Sid": "S3BucketOperations",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketCors",
        "s3:GetBucketPolicy"
      ],
      "Resource": [
        "arn:aws:s3:::${S3_BUCKET_NAME}"
      ]
    },
    {
      "Sid": "S3PresignedURLGeneration",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::${S3_BUCKET_NAME}/*"
      ]
    }
  ]
}
EOF

  # Create policy
  local result=$(aws iam create-policy \
    --policy-name "$POLICY_NAME" \
    --policy-document file://"$policy_file" \
    --description "S3 access policy for TalentBase backend (${ENVIRONMENT})" \
    --output json)

  policy_arn=$(echo "$result" | grep -o '"Arn": "[^"]*' | cut -d'"' -f4)

  log_success "Policy created: $POLICY_NAME"
  echo "$policy_arn"
}

# ============================================================================
# USER CREATION
# ============================================================================

create_iam_user() {
  log_info "Step 2/5: Creating IAM user"

  if user_exists; then
    log_warning "User ${IAM_USER_NAME} already exists. Skipping creation."
    return 0
  fi

  aws iam create-user \
    --user-name "$IAM_USER_NAME" \
    --tags "Key=Environment,Value=${ENVIRONMENT}" "Key=Project,Value=TalentBase" "Key=Purpose,Value=Backend-S3-Access"

  log_success "IAM user created: $IAM_USER_NAME"
}

attach_policy_to_user() {
  log_info "Step 3/5: Attaching policy to user"

  local account_id=$(aws sts get-caller-identity --query Account --output text)
  local policy_arn="arn:aws:iam::${account_id}:policy/${POLICY_NAME}"

  # Check if already attached
  if aws iam list-attached-user-policies --user-name "$IAM_USER_NAME" | grep -q "$POLICY_NAME"; then
    log_warning "Policy already attached to user. Skipping."
    return 0
  fi

  aws iam attach-user-policy \
    --user-name "$IAM_USER_NAME" \
    --policy-arn "$policy_arn"

  log_success "Policy attached to user"
}

create_access_key() {
  log_info "Step 4/5: Creating access key"

  # Check if user already has access keys
  local existing_keys=$(aws iam list-access-keys --user-name "$IAM_USER_NAME" --query 'AccessKeyMetadata[].AccessKeyId' --output text)

  if [ -n "$existing_keys" ]; then
    log_warning "User already has access keys:"
    echo "$existing_keys"
    log_warning "Skipping key creation. Use rotate-credentials.sh to rotate keys."
    return 0
  fi

  # Create new access key
  local result=$(aws iam create-access-key --user-name "$IAM_USER_NAME" --output json)

  local access_key_id=$(echo "$result" | grep -o '"AccessKeyId": "[^"]*' | cut -d'"' -f4)
  local secret_access_key=$(echo "$result" | grep -o '"SecretAccessKey": "[^"]*' | cut -d'"' -f4)

  # Save credentials securely
  local credentials_file="$SCRIPT_DIR/credentials/${ENVIRONMENT}-credentials.txt"
  mkdir -p "$SCRIPT_DIR/credentials"
  chmod 700 "$SCRIPT_DIR/credentials"

  cat > "$credentials_file" <<EOF
# TalentBase IAM Credentials
# Environment: ${ENVIRONMENT}
# User: ${IAM_USER_NAME}
# Created: $(date)
#
# ⚠️ IMPORTANT: Store these credentials securely!
# - Add to password manager (1Password, LastPass, etc.)
# - DO NOT commit to git
# - DO NOT share via email/Slack
# - Use AWS Secrets Manager in production

AWS_ACCESS_KEY_ID=${access_key_id}
AWS_SECRET_ACCESS_KEY=${secret_access_key}
AWS_STORAGE_BUCKET_NAME=${S3_BUCKET_NAME}
AWS_S3_REGION_NAME=${REGION}

# Django .env format:
AWS_ACCESS_KEY_ID=${access_key_id}
AWS_SECRET_ACCESS_KEY=${secret_access_key}
AWS_STORAGE_BUCKET_NAME=${S3_BUCKET_NAME}
AWS_S3_REGION_NAME=${REGION}
EOF

  chmod 600 "$credentials_file"

  log_success "Access key created"
  log_success "Credentials saved to: $credentials_file"

  echo ""
  echo "==================================================="
  echo "⚠️  CREDENTIALS GENERATED"
  echo "==================================================="
  echo ""
  echo "Access Key ID: $access_key_id"
  echo "Secret Access Key: $secret_access_key"
  echo ""
  echo "Credentials file: $credentials_file"
  echo ""
  echo -e "${YELLOW}IMPORTANT:${NC}"
  echo "  1. Copy these credentials to your password manager NOW"
  echo "  2. Add to Django .env file"
  echo "  3. Delete credentials file after copying: rm $credentials_file"
  echo "  4. In production, use AWS Secrets Manager instead"
  echo ""
  echo "==================================================="
  echo ""
}

# ============================================================================
# VERIFICATION
# ============================================================================

verify_setup() {
  log_info "Step 5/5: Verifying IAM setup"

  local account_id=$(aws sts get-caller-identity --query Account --output text)
  local policy_arn="arn:aws:iam::${account_id}:policy/${POLICY_NAME}"

  echo ""
  echo "==================================================="
  echo "VERIFICATION RESULTS"
  echo "==================================================="

  # Check user exists
  if user_exists; then
    log_success "✓ IAM user exists: $IAM_USER_NAME"
  else
    log_error "✗ IAM user not found: $IAM_USER_NAME"
    return 1
  fi

  # Check policy exists
  if policy_exists; then
    log_success "✓ Policy exists: $POLICY_NAME"
  else
    log_error "✗ Policy not found: $POLICY_NAME"
    return 1
  fi

  # Check policy attached to user
  if aws iam list-attached-user-policies --user-name "$IAM_USER_NAME" | grep -q "$POLICY_NAME"; then
    log_success "✓ Policy attached to user"
  else
    log_error "✗ Policy not attached to user"
    return 1
  fi

  # Check access keys
  local key_count=$(aws iam list-access-keys --user-name "$IAM_USER_NAME" --query 'AccessKeyMetadata[].AccessKeyId' --output text | wc -w | tr -d ' ')
  if [ "$key_count" -gt 0 ]; then
    log_success "✓ Access key(s) created: $key_count key(s)"
  else
    log_warning "✗ No access keys found"
  fi

  # Show user details
  echo ""
  log_info "User details:"
  aws iam get-user --user-name "$IAM_USER_NAME" --query 'User.{UserName:UserName,UserId:UserId,Arn:Arn,CreateDate:CreateDate}' --output table

  # Show attached policies
  echo ""
  log_info "Attached policies:"
  aws iam list-attached-user-policies --user-name "$IAM_USER_NAME" --output table

  echo ""
  echo "==================================================="
}

# ============================================================================
# SUMMARY
# ============================================================================

print_summary() {
  local account_id=$(aws sts get-caller-identity --query Account --output text)

  echo ""
  echo "==================================================="
  echo "IAM SETUP COMPLETE - SUMMARY"
  echo "==================================================="
  echo ""
  echo "Environment: $ENVIRONMENT"
  echo "IAM User: $IAM_USER_NAME"
  echo "Policy: $POLICY_NAME"
  echo "S3 Bucket: $S3_BUCKET_NAME"
  echo "Region: $REGION"
  echo ""
  echo "User ARN: arn:aws:iam::${account_id}:user/${IAM_USER_NAME}"
  echo "Policy ARN: arn:aws:iam::${account_id}:policy/${POLICY_NAME}"
  echo ""
  echo "Permissions Granted:"
  echo "  ✓ S3 PutObject, GetObject, DeleteObject"
  echo "  ✓ S3 ListBucket, GetBucketLocation"
  echo "  ✓ Generate presigned URLs"
  echo ""
  echo "Next Steps:"
  echo ""
  echo "  1. Copy credentials to password manager"
  echo ""
  echo "  2. Add to Django .env file:"
  echo "     AWS_ACCESS_KEY_ID=<from credentials file>"
  echo "     AWS_SECRET_ACCESS_KEY=<from credentials file>"
  echo "     AWS_STORAGE_BUCKET_NAME=${S3_BUCKET_NAME}"
  echo "     AWS_S3_REGION_NAME=${REGION}"
  echo ""
  echo "  3. Test IAM credentials:"
  echo "     ./scripts/aws/verify-iam.sh ${ENVIRONMENT}"
  echo ""
  echo "  4. Delete credentials file after copying:"
  echo "     rm scripts/aws/credentials/${ENVIRONMENT}-credentials.txt"
  echo ""
  echo "  5. For production, migrate to AWS Secrets Manager:"
  echo "     ./scripts/aws/setup-secrets-manager.sh prod"
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
  echo "AWS IAM SETUP - TalentBase"
  echo "==================================================="
  echo ""
  echo "Environment: $ENVIRONMENT"
  echo "IAM User: $IAM_USER_NAME"
  echo "S3 Bucket: $S3_BUCKET_NAME"
  echo ""

  # Create configs directory
  mkdir -p "$SCRIPT_DIR/configs"

  # Check permissions
  check_admin_permissions
  echo ""

  # Execute setup steps
  local policy_arn=$(create_s3_policy)
  create_iam_user
  attach_policy_to_user
  create_access_key

  echo ""

  # Verify
  verify_setup

  # Summary
  print_summary

  log_success "IAM setup completed successfully!"
  exit 0
}

# Run main function
main
