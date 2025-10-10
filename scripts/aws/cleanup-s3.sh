#!/bin/bash
#
# AWS S3 Cleanup Script - TalentBase
#
# Description: Remove S3 bucket and all contents (USE WITH CAUTION!)
# Author: Winston (Architect)
# Date: 2025-10-09
#
# WARNING: This will DELETE the bucket and ALL files. Cannot be undone!
#
# Usage:
#   ./scripts/aws/cleanup-s3.sh [environment] [--force]
#
#   environment: dev | staging | prod (default: dev)
#   --force: Skip confirmation prompt (dangerous!)
#

set -e
set -u

# ============================================================================
# CONFIGURATION
# ============================================================================

ENVIRONMENT="${1:-dev}"
FORCE="${2:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

confirm_deletion() {
  if [ "$FORCE" = "--force" ]; then
    return 0
  fi

  echo ""
  echo -e "${RED}╔═══════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║                                                   ║${NC}"
  echo -e "${RED}║              ⚠️  DANGER ZONE  ⚠️                   ║${NC}"
  echo -e "${RED}║                                                   ║${NC}"
  echo -e "${RED}╚═══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${YELLOW}You are about to DELETE:${NC}"
  echo ""
  echo "  Bucket: $BUCKET_NAME"
  echo "  Environment: $ENVIRONMENT"
  echo ""
  echo "This will:"
  echo "  1. Delete ALL files in the bucket"
  echo "  2. Remove ALL folder structures"
  echo "  3. Delete the bucket itself"
  echo ""
  echo -e "${RED}THIS CANNOT BE UNDONE!${NC}"
  echo ""

  # Show bucket contents count
  local object_count=$(aws s3 ls "s3://${BUCKET_NAME}/" --recursive | wc -l | tr -d ' ')
  if [ "$object_count" -gt 0 ]; then
    echo -e "${YELLOW}Bucket contains $object_count objects${NC}"
    echo ""
  fi

  read -p "Type the bucket name to confirm deletion: " confirmation

  if [ "$confirmation" != "$BUCKET_NAME" ]; then
    log_error "Bucket name doesn't match. Aborting."
    exit 1
  fi

  read -p "Are you ABSOLUTELY sure? (yes/no): " final_confirm

  if [ "$final_confirm" != "yes" ]; then
    log_error "Deletion cancelled."
    exit 1
  fi

  return 0
}

empty_bucket() {
  log_warning "Emptying bucket: $BUCKET_NAME"

  # Delete all objects
  aws s3 rm "s3://${BUCKET_NAME}" --recursive

  # Delete all versions (if versioning enabled)
  aws s3api list-object-versions \
    --bucket "$BUCKET_NAME" \
    --query 'Versions[].{Key:Key,VersionId:VersionId}' \
    --output json 2>/dev/null | \
  jq -r '.[] | "--key \"\(.Key)\" --version-id \"\(.VersionId)\""' | \
  xargs -I {} aws s3api delete-object --bucket "$BUCKET_NAME" {} 2>/dev/null || true

  # Delete all delete markers
  aws s3api list-object-versions \
    --bucket "$BUCKET_NAME" \
    --query 'DeleteMarkers[].{Key:Key,VersionId:VersionId}' \
    --output json 2>/dev/null | \
  jq -r '.[] | "--key \"\(.Key)\" --version-id \"\(.VersionId)\""' | \
  xargs -I {} aws s3api delete-object --bucket "$BUCKET_NAME" {} 2>/dev/null || true

  log_success "Bucket emptied"
}

delete_bucket() {
  log_warning "Deleting bucket: $BUCKET_NAME"

  aws s3api delete-bucket --bucket "$BUCKET_NAME"

  log_success "Bucket deleted"
}

cleanup_local_configs() {
  log_warning "Cleaning up local config files"

  rm -f "$SCRIPT_DIR/configs/bucket-policy.json"
  rm -f "$SCRIPT_DIR/configs/cors-config.json"
  rm -f "$SCRIPT_DIR/configs/lifecycle-config.json"

  log_success "Local configs removed"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  echo ""
  echo "==================================================="
  echo "AWS S3 CLEANUP - TalentBase"
  echo "==================================================="
  echo ""

  # Check if bucket exists
  if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    log_error "Bucket $BUCKET_NAME does not exist. Nothing to delete."
    exit 0
  fi

  # Confirm deletion
  confirm_deletion

  echo ""
  echo "Starting deletion process..."
  echo ""

  # Empty bucket
  empty_bucket

  # Delete bucket
  delete_bucket

  # Cleanup local files
  cleanup_local_configs

  echo ""
  echo "==================================================="
  echo "CLEANUP COMPLETE"
  echo "==================================================="
  echo ""
  log_success "Bucket $BUCKET_NAME has been completely removed"
  echo ""
  echo "To recreate the bucket, run:"
  echo "  ./scripts/aws/setup-s3.sh $ENVIRONMENT"
  echo ""
}

# Run main
main
