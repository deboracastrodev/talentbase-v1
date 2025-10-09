#!/bin/bash
#
# AWS IAM Verification Script - TalentBase
#
# Description: Verify IAM user permissions and test S3 access
# Author: Winston (Architect)
# Date: 2025-10-09
#
# Usage:
#   ./scripts/aws/verify-iam.sh [environment]
#
#   environment: dev | staging | prod (default: dev)
#

set -e
set -u

# ============================================================================
# CONFIGURATION
# ============================================================================

ENVIRONMENT="${1:-dev}"

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
    echo -e "${RED}Error: Invalid environment${NC}"
    exit 1
    ;;
esac

POLICY_NAME="${IAM_USER_NAME}-s3-policy"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
  echo -e "${RED}[✗]${NC} $1"
}

test_pass() {
  echo -e "${GREEN}  ✓ PASS${NC}: $1"
}

test_fail() {
  echo -e "${RED}  ✗ FAIL${NC}: $1"
}

# ============================================================================
# TEST FUNCTIONS
# ============================================================================

test_user_exists() {
  log_info "Test 1: IAM User Existence"

  if aws iam get-user --user-name "$IAM_USER_NAME" &>/dev/null; then
    test_pass "User exists: $IAM_USER_NAME"
    return 0
  else
    test_fail "User not found: $IAM_USER_NAME"
    return 1
  fi
}

test_policy_attached() {
  log_info "Test 2: Policy Attachment"

  if aws iam list-attached-user-policies --user-name "$IAM_USER_NAME" | grep -q "$POLICY_NAME"; then
    test_pass "Policy attached: $POLICY_NAME"
    return 0
  else
    test_fail "Policy not attached to user"
    return 1
  fi
}

test_access_keys() {
  log_info "Test 3: Access Keys"

  local keys=$(aws iam list-access-keys --user-name "$IAM_USER_NAME" --query 'AccessKeyMetadata[].AccessKeyId' --output text)

  if [ -n "$keys" ]; then
    local key_count=$(echo "$keys" | wc -w | tr -d ' ')
    test_pass "Access keys exist: $key_count key(s)"

    # Check if any keys are active
    local active_keys=$(aws iam list-access-keys --user-name "$IAM_USER_NAME" --query 'AccessKeyMetadata[?Status==`Active`].AccessKeyId' --output text)
    if [ -n "$active_keys" ]; then
      test_pass "Active keys found"
    else
      test_fail "No active keys found"
      return 1
    fi

    return 0
  else
    test_fail "No access keys found"
    return 1
  fi
}

test_s3_list_bucket() {
  log_info "Test 4: S3 ListBucket Permission"

  # Try to list bucket as IAM user (requires switching to user credentials)
  # This test assumes we're running with admin creds that can simulate the user

  local account_id=$(aws sts get-caller-identity --query Account --output text)
  local policy_arn="arn:aws:iam::${account_id}:policy/${POLICY_NAME}"

  # Get policy document
  local policy_version=$(aws iam get-policy --policy-arn "$policy_arn" --query 'Policy.DefaultVersionId' --output text)
  local policy_doc=$(aws iam get-policy-version --policy-arn "$policy_arn" --version-id "$policy_version" --query 'PolicyVersion.Document' --output json)

  if echo "$policy_doc" | grep -q "s3:ListBucket"; then
    test_pass "Policy allows ListBucket action"
    return 0
  else
    test_fail "Policy does not allow ListBucket"
    return 1
  fi
}

test_s3_object_permissions() {
  log_info "Test 5: S3 Object Permissions"

  local account_id=$(aws sts get-caller-identity --query Account --output text)
  local policy_arn="arn:aws:iam::${account_id}:policy/${POLICY_NAME}"

  local policy_version=$(aws iam get-policy --policy-arn "$policy_arn" --query 'Policy.DefaultVersionId' --output text)
  local policy_doc=$(aws iam get-policy-version --policy-arn "$policy_arn" --version-id "$policy_version" --query 'PolicyVersion.Document' --output json)

  local required_actions=("s3:PutObject" "s3:GetObject" "s3:DeleteObject")
  local all_present=true

  for action in "${required_actions[@]}"; do
    if echo "$policy_doc" | grep -q "$action"; then
      echo -e "  ${GREEN}✓${NC} Permission granted: $action"
    else
      echo -e "  ${RED}✗${NC} Permission missing: $action"
      all_present=false
    fi
  done

  if [ "$all_present" = true ]; then
    test_pass "All required S3 object permissions present"
    return 0
  else
    test_fail "Some S3 object permissions missing"
    return 1
  fi
}

test_bucket_access() {
  log_info "Test 6: S3 Bucket Access (Integration)"

  # Check if bucket exists
  if ! aws s3api head-bucket --bucket "$S3_BUCKET_NAME" &>/dev/null; then
    test_fail "Bucket not found: $S3_BUCKET_NAME"
    echo "  Run: ./scripts/aws/setup-s3.sh $ENVIRONMENT"
    return 1
  fi

  test_pass "Bucket accessible: $S3_BUCKET_NAME"
  return 0
}

test_key_age() {
  log_info "Test 7: Access Key Age (Security)"

  local keys=$(aws iam list-access-keys --user-name "$IAM_USER_NAME" --query 'AccessKeyMetadata[]' --output json)

  local all_keys_ok=true

  echo "$keys" | grep -o '"AccessKeyId": "[^"]*' | cut -d'"' -f4 | while read -r key_id; do
    local create_date=$(echo "$keys" | grep -A 5 "$key_id" | grep -o '"CreateDate": "[^"]*' | cut -d'"' -f4)
    local age_days=$(( ($(date +%s) - $(date -j -f "%Y-%m-%dT%H:%M:%S" "${create_date%+*}" +%s 2>/dev/null || echo 0)) / 86400 ))

    if [ "$age_days" -gt 90 ]; then
      echo -e "  ${YELLOW}⚠${NC} Key $key_id is $age_days days old (>90 days - rotation recommended)"
      all_keys_ok=false
    else
      echo -e "  ${GREEN}✓${NC} Key $key_id is $age_days days old (<90 days)"
    fi
  done

  if [ "$all_keys_ok" = true ]; then
    test_pass "All keys are within recommended age"
  else
    test_fail "Some keys should be rotated"
  fi

  return 0
}

test_mfa_status() {
  log_info "Test 8: MFA Status (Security)"

  local mfa_devices=$(aws iam list-mfa-devices --user-name "$IAM_USER_NAME" --query 'MFADevices' --output json)

  if [ "$mfa_devices" = "[]" ]; then
    test_fail "MFA not enabled (recommended for production)"
    echo "  Consider enabling MFA for enhanced security"
    return 1
  else
    test_pass "MFA enabled"
    return 0
  fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  local total_tests=8
  local passed=0
  local failed=0

  echo ""
  echo "==================================================="
  echo "AWS IAM VERIFICATION - TalentBase"
  echo "==================================================="
  echo ""
  echo "Environment: $ENVIRONMENT"
  echo "IAM User: $IAM_USER_NAME"
  echo "S3 Bucket: $S3_BUCKET_NAME"
  echo ""
  echo "Running $total_tests tests..."
  echo ""

  # Run all tests
  test_user_exists && ((passed++)) || ((failed++))
  echo ""

  test_policy_attached && ((passed++)) || ((failed++))
  echo ""

  test_access_keys && ((passed++)) || ((failed++))
  echo ""

  test_s3_list_bucket && ((passed++)) || ((failed++))
  echo ""

  test_s3_object_permissions && ((passed++)) || ((failed++))
  echo ""

  test_bucket_access && ((passed++)) || ((failed++))
  echo ""

  test_key_age && ((passed++)) || ((failed++))
  echo ""

  test_mfa_status && ((passed++)) || ((failed++))
  echo ""

  # Summary
  echo "==================================================="
  echo "TEST RESULTS"
  echo "==================================================="
  echo ""
  echo "Total Tests: $total_tests"
  echo -e "Passed: ${GREEN}$passed${NC}"
  echo -e "Failed: ${RED}$failed${NC}"
  echo ""

  if [ $failed -eq 0 ]; then
    log_success "All tests passed! ✓"
    echo ""
    echo "IAM user is properly configured and ready for use."
    echo ""
    echo "Next Steps:"
    echo "  1. Add credentials to Django .env"
    echo "  2. Test from Django: python manage.py shell"
    echo "     >>> from core.utils.s3 import generate_presigned_url"
    echo "     >>> generate_presigned_url('test.jpg', 'image/jpeg')"
    echo ""
    exit 0
  else
    log_error "Some tests failed. Please review the output above."
    echo ""
    echo "Common Issues:"
    echo "  - Missing permissions: Check policy attachment"
    echo "  - No access keys: Run setup-iam.sh again"
    echo "  - Bucket not found: Run setup-s3.sh first"
    echo ""
    exit 1
  fi
}

# Run main
main
