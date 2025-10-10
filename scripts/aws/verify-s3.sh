#!/bin/bash
#
# AWS S3 Verification Script - TalentBase
#
# Description: Verify S3 bucket setup and test functionality
# Author: Winston (Architect)
# Date: 2025-10-09
#
# Usage:
#   ./scripts/aws/verify-s3.sh [environment]
#
#   environment: dev | staging | prod (default: dev)
#

set -e
set -u

# ============================================================================
# CONFIGURATION
# ============================================================================

ENVIRONMENT="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Bucket name
case "$ENVIRONMENT" in
  dev)
    BUCKET_NAME="talentbase-dev-uploads"
    ;;
  staging)
    BUCKET_NAME="talentbase-staging-uploads"
    ;;
  prod)
    BUCKET_NAME="talentbase-prod-uploads"
    ;;
  *)
    echo -e "${RED}Error: Invalid environment${NC}"
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

test_bucket_exists() {
  log_info "Test 1: Bucket Existence"

  if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    test_pass "Bucket exists: $BUCKET_NAME"
    return 0
  else
    test_fail "Bucket not found: $BUCKET_NAME"
    return 1
  fi
}

test_bucket_encryption() {
  log_info "Test 2: Server-Side Encryption"

  local encryption=$(aws s3api get-bucket-encryption --bucket "$BUCKET_NAME" 2>/dev/null)

  if echo "$encryption" | grep -q "AES256"; then
    test_pass "Encryption enabled (AES256)"
    return 0
  else
    test_fail "Encryption not configured properly"
    return 1
  fi
}

test_cors_configuration() {
  log_info "Test 3: CORS Configuration"

  local cors=$(aws s3api get-bucket-cors --bucket "$BUCKET_NAME" 2>/dev/null)

  if [ -n "$cors" ]; then
    local methods=$(echo "$cors" | grep -o '"AllowedMethods": \[[^]]*\]')
    local origins=$(echo "$cors" | grep -o '"AllowedOrigins": \[[^]]*\]')

    if echo "$methods" | grep -q "POST" && echo "$methods" | grep -q "GET"; then
      test_pass "CORS allows GET and POST methods"
    else
      test_fail "CORS methods not configured correctly"
      return 1
    fi

    if [ -n "$origins" ]; then
      test_pass "CORS origins configured"
    else
      test_fail "CORS origins not configured"
      return 1
    fi

    return 0
  else
    test_fail "CORS not configured"
    return 1
  fi
}

test_public_access_block() {
  log_info "Test 4: Public Access Block"

  local pab=$(aws s3api get-public-access-block --bucket "$BUCKET_NAME" 2>/dev/null)

  if echo "$pab" | grep -q '"BlockPublicAcls": true' && \
     echo "$pab" | grep -q '"BlockPublicPolicy": true'; then
    test_pass "Public access properly blocked"
    return 0
  else
    test_fail "Public access not fully blocked"
    return 1
  fi
}

test_lifecycle_rules() {
  log_info "Test 5: Lifecycle Rules"

  local lifecycle=$(aws s3api get-bucket-lifecycle-configuration --bucket "$BUCKET_NAME" 2>/dev/null)

  if [ -n "$lifecycle" ]; then
    if echo "$lifecycle" | grep -q "CleanupIncompleteUploads"; then
      test_pass "Lifecycle rules configured (incomplete upload cleanup)"
    else
      test_fail "Lifecycle rules incomplete"
      return 1
    fi
    return 0
  else
    test_fail "Lifecycle rules not configured"
    return 1
  fi
}

test_folder_structure() {
  log_info "Test 6: Folder Structure"

  local folders=("candidate-photos/" "candidate-videos/raw/" "candidate-videos/hls/" "company-logos/" "job-attachments/")
  local all_exist=true

  for folder in "${folders[@]}"; do
    if aws s3 ls "s3://${BUCKET_NAME}/${folder}" &> /dev/null; then
      echo -e "  ${GREEN}✓${NC} Found: $folder"
    else
      echo -e "  ${RED}✗${NC} Missing: $folder"
      all_exist=false
    fi
  done

  if [ "$all_exist" = true ]; then
    test_pass "All expected folders exist"
    return 0
  else
    test_fail "Some folders are missing"
    return 1
  fi
}

test_upload_download() {
  log_info "Test 7: Upload/Download (End-to-End)"

  local test_file="/tmp/s3-test-${RANDOM}.txt"
  local s3_key="test/upload-test-${RANDOM}.txt"

  # Create test file
  echo "TalentBase S3 Test - $(date)" > "$test_file"

  # Upload
  if aws s3 cp "$test_file" "s3://${BUCKET_NAME}/${s3_key}" --sse AES256 &> /dev/null; then
    test_pass "Upload successful"
  else
    test_fail "Upload failed"
    rm -f "$test_file"
    return 1
  fi

  # Download
  local download_file="/tmp/s3-download-${RANDOM}.txt"
  if aws s3 cp "s3://${BUCKET_NAME}/${s3_key}" "$download_file" &> /dev/null; then
    test_pass "Download successful"

    # Verify content
    if diff "$test_file" "$download_file" &> /dev/null; then
      test_pass "Content integrity verified"
    else
      test_fail "Downloaded content doesn't match"
    fi
  else
    test_fail "Download failed"
  fi

  # Cleanup
  aws s3 rm "s3://${BUCKET_NAME}/${s3_key}" &> /dev/null
  rm -f "$test_file" "$download_file"

  return 0
}

test_bucket_policy() {
  log_info "Test 8: Bucket Policy"

  local policy=$(aws s3api get-bucket-policy --bucket "$BUCKET_NAME" 2>/dev/null)

  if [ -n "$policy" ]; then
    if echo "$policy" | grep -q "AllowPresignedUploads"; then
      test_pass "Bucket policy allows presigned uploads"
    else
      test_fail "Bucket policy doesn't allow presigned uploads"
      return 1
    fi

    if echo "$policy" | grep -q "DenyUnencryptedUploads"; then
      test_pass "Bucket policy enforces encryption"
    else
      test_fail "Bucket policy doesn't enforce encryption"
      return 1
    fi

    return 0
  else
    test_fail "Bucket policy not configured"
    return 1
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
  echo "AWS S3 VERIFICATION - TalentBase"
  echo "==================================================="
  echo ""
  echo "Environment: $ENVIRONMENT"
  echo "Bucket: $BUCKET_NAME"
  echo ""
  echo "Running $total_tests tests..."
  echo ""

  # Run all tests
  test_bucket_exists && ((passed++)) || ((failed++))
  echo ""

  test_bucket_encryption && ((passed++)) || ((failed++))
  echo ""

  test_cors_configuration && ((passed++)) || ((failed++))
  echo ""

  test_public_access_block && ((passed++)) || ((failed++))
  echo ""

  test_lifecycle_rules && ((passed++)) || ((failed++))
  echo ""

  test_folder_structure && ((passed++)) || ((failed++))
  echo ""

  test_upload_download && ((passed++)) || ((failed++))
  echo ""

  test_bucket_policy && ((passed++)) || ((failed++))
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
    echo "S3 bucket is properly configured and ready for use."
    echo ""
    echo "Next Steps:"
    echo "  1. Update Django .env with:"
    echo "     AWS_STORAGE_BUCKET_NAME=$BUCKET_NAME"
    echo "     AWS_S3_REGION_NAME=$(aws s3api get-bucket-location --bucket $BUCKET_NAME --query LocationConstraint --output text | sed 's/None/us-east-1/')"
    echo ""
    echo "  2. Test presigned URL generation from Django:"
    echo "     python manage.py shell"
    echo "     >>> from core.utils.s3 import generate_presigned_url"
    echo "     >>> result = generate_presigned_url('test.jpg', 'image/jpeg')"
    echo "     >>> print(result['url'])"
    echo ""
    exit 0
  else
    log_error "Some tests failed. Please review the output above."
    echo ""
    echo "Common Issues:"
    echo "  - CORS: Check allowed origins match your frontend URLs"
    echo "  - Encryption: Ensure SSE-S3 (AES256) is enabled"
    echo "  - Permissions: Verify IAM user has s3:* permissions"
    echo ""
    exit 1
  fi
}

# Run main
main
