#!/bin/bash
#
# AWS ECS Superuser Creation Script - TalentBase
#
# Description: Create Django superuser in AWS ECS environment
# Author: BMad Master
# Date: 2025-10-10
#
# Prerequisites:
#   - AWS CLI installed and configured
#   - ECS Execute Command enabled on the task
#   - Appropriate IAM permissions
#
# Usage:
#   ./scripts/aws/create-superuser.sh [environment] [mode]
#
#   environment: dev | staging | prod (default: dev)
#   mode: interactive | auto (default: interactive)
#
# Examples:
#   ./scripts/aws/create-superuser.sh dev interactive
#   ./scripts/aws/create-superuser.sh dev auto
#

set -e
set -u

# ============================================================================
# CONFIGURATION
# ============================================================================

ENVIRONMENT="${1:-dev}"
MODE="${2:-interactive}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# AWS configuration
REGION="us-east-1"
case "$ENVIRONMENT" in
  dev)
    CLUSTER_NAME="talentbase-dev"
    SERVICE_NAME="talentbase-api-dev"
    ;;
  staging)
    CLUSTER_NAME="talentbase-staging"
    SERVICE_NAME="talentbase-api-staging"
    ;;
  prod)
    CLUSTER_NAME="talentbase-prod"
    SERVICE_NAME="talentbase-api-prod"
    ;;
  *)
    echo -e "${RED}Error: Invalid environment '${ENVIRONMENT}'${NC}"
    echo "Usage: $0 [dev|staging|prod] [interactive|auto]"
    exit 1
    ;;
esac

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1" >&2
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

# ============================================================================
# AWS FUNCTIONS
# ============================================================================

check_aws_access() {
  log_info "Checking AWS access..."

  if ! aws sts get-caller-identity &>/dev/null; then
    log_error "Cannot access AWS. Make sure you are logged in."
    exit 1
  fi

  log_success "AWS access confirmed"
}

get_task_arn() {
  log_info "Finding active ECS task..."

  local task_arn=$(aws ecs list-tasks \
    --cluster "$CLUSTER_NAME" \
    --service-name "$SERVICE_NAME" \
    --desired-status RUNNING \
    --region "$REGION" \
    --query 'taskArns[0]' \
    --output text)

  # Trim whitespace and newlines
  task_arn=$(echo "$task_arn" | tr -d '\n\r' | xargs)

  if [ "$task_arn" == "None" ] || [ -z "$task_arn" ]; then
    log_error "No running tasks found for service: $SERVICE_NAME"
    log_info "Make sure the service is running and healthy"
    exit 1
  fi

  log_success "Found active task: ${task_arn##*/}"
  echo "$task_arn"
}

check_exec_enabled() {
  local task_arn="$1"

  # Validate task ARN is not empty
  if [ -z "$task_arn" ]; then
    log_error "Task ARN is empty"
    exit 1
  fi

  log_info "Checking if ECS Exec is enabled..."
  log_info "Task: ${task_arn##*/}"
  log_info "Full ARN: $task_arn"
  log_info "ARN Length: ${#task_arn}"

  local exec_enabled=$(aws ecs describe-tasks \
    --cluster "$CLUSTER_NAME" \
    --tasks "$task_arn" \
    --region "$REGION" \
    --query 'tasks[0].enableExecuteCommand' \
    --output text)

  if [ "$exec_enabled" != "True" ]; then
    log_error "ECS Execute Command is not enabled on this task"
    log_info "Current value: $exec_enabled"
    log_info "To enable it, run: ./scripts/aws/enable-ecs-exec.sh $ENVIRONMENT"
    exit 1
  fi

  log_success "ECS Exec is enabled"
}

# ============================================================================
# SUPERUSER CREATION - INTERACTIVE MODE
# ============================================================================

create_superuser_interactive() {
  local task_arn="$1"

  log_info "Starting interactive superuser creation..."
  echo ""
  echo "==================================================="
  echo "INTERACTIVE SUPERUSER CREATION"
  echo "==================================================="
  echo ""
  echo "You will be prompted to enter:"
  echo "  - Username"
  echo "  - Email address"
  echo "  - Password (twice)"
  echo ""
  echo -e "${YELLOW}Note: Password input will be hidden${NC}"
  echo ""

  read -p "Press ENTER to continue or CTRL+C to cancel..."

  echo ""
  log_info "Connecting to ECS container..."
  echo ""

  aws ecs execute-command \
    --cluster "$CLUSTER_NAME" \
    --task "$task_arn" \
    --container ApiContainer \
    --interactive \
    --region "$REGION" \
    --command "/bin/sh -c 'cd /app && python3 manage.py createsuperuser'"

  local exit_code=$?

  if [ $exit_code -eq 0 ]; then
    echo ""
    log_success "Superuser created successfully!"
  else
    echo ""
    log_error "Failed to create superuser (exit code: $exit_code)"
    exit 1
  fi
}

# ============================================================================
# SUPERUSER CREATION - AUTOMATIC MODE
# ============================================================================

create_superuser_auto() {
  local task_arn="$1"

  log_info "Starting automatic superuser creation..."
  echo ""
  echo "==================================================="
  echo "AUTOMATIC SUPERUSER CREATION"
  echo "==================================================="
  echo ""

  # Get credentials from environment or prompt
  if [ -z "${DJANGO_SUPERUSER_USERNAME:-}" ]; then
    read -p "Enter username: " DJANGO_SUPERUSER_USERNAME
  fi

  if [ -z "${DJANGO_SUPERUSER_EMAIL:-}" ]; then
    read -p "Enter email: " DJANGO_SUPERUSER_EMAIL
  fi

  if [ -z "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
    read -s -p "Enter password: " DJANGO_SUPERUSER_PASSWORD
    echo ""
  fi

  echo ""
  log_info "Creating superuser: $DJANGO_SUPERUSER_USERNAME"
  echo ""

  # Create superuser using environment variables
  aws ecs execute-command \
    --cluster "$CLUSTER_NAME" \
    --task "$task_arn" \
    --container ApiContainer \
    --interactive \
    --region "$REGION" \
    --command "/bin/sh -c 'cd /app && export DJANGO_SUPERUSER_USERNAME=\"$DJANGO_SUPERUSER_USERNAME\" && export DJANGO_SUPERUSER_EMAIL=\"$DJANGO_SUPERUSER_EMAIL\" && export DJANGO_SUPERUSER_PASSWORD=\"$DJANGO_SUPERUSER_PASSWORD\" && python3 manage.py createsuperuser --noinput'"

  local exit_code=$?

  if [ $exit_code -eq 0 ]; then
    echo ""
    log_success "Superuser created successfully!"
    echo ""
    echo "Credentials:"
    echo "  Username: $DJANGO_SUPERUSER_USERNAME"
    echo "  Email: $DJANGO_SUPERUSER_EMAIL"
    echo ""
    log_warning "Store these credentials securely!"
  else
    echo ""
    log_error "Failed to create superuser (exit code: $exit_code)"

    if grep -q "already exists" <<< "$output" 2>/dev/null; then
      log_warning "User may already exist. Try a different username."
    fi

    exit 1
  fi
}

# ============================================================================
# VERIFICATION
# ============================================================================

verify_superuser() {
  local task_arn="$1"
  local username="${2:-}"

  if [ -z "$username" ]; then
    log_info "Skipping verification (no username provided)"
    return 0
  fi

  log_info "Verifying superuser creation..."

  aws ecs execute-command \
    --cluster "$CLUSTER_NAME" \
    --task "$task_arn" \
    --container ApiContainer \
    --interactive \
    --region "$REGION" \
    --command "/bin/sh -c 'cd /app && python3 manage.py shell -c \"from authentication.models import User; u = User.objects.get(username='$username'); print(f'User: {u.username}'); print(f'Email: {u.email}'); print(f'Is superuser: {u.is_superuser}'); print(f'Is staff: {u.is_staff}')\"'"

  log_success "Verification complete"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

print_header() {
  echo ""
  echo "==================================================="
  echo "AWS ECS SUPERUSER CREATION - TalentBase"
  echo "==================================================="
  echo ""
  echo "Environment: $ENVIRONMENT"
  echo "Cluster: $CLUSTER_NAME"
  echo "Service: $SERVICE_NAME"
  echo "Mode: $MODE"
  echo ""
}

print_summary() {
  echo ""
  echo "==================================================="
  echo "SUMMARY"
  echo "==================================================="
  echo ""
  echo "Environment: $ENVIRONMENT"
  echo "Cluster: $CLUSTER_NAME"
  echo ""
  echo "Next Steps:"
  echo ""
  echo "  1. Test login at:"
  echo "     https://dev.salesdog.click/admin/"
  echo ""
  echo "  2. If you need to create additional users:"
  echo "     ./scripts/aws/create-superuser.sh $ENVIRONMENT"
  echo ""
  echo "  3. To reset password (if needed):"
  echo "     Run this script again in interactive mode"
  echo ""
  echo "==================================================="
  echo ""
}

main() {
  print_header

  # Check AWS access
  check_aws_access

  # Get active task
  local task_arn=$(get_task_arn)

  # Check if exec is enabled
  check_exec_enabled "$task_arn"

  echo ""

  # Create superuser based on mode
  case "$MODE" in
    interactive)
      create_superuser_interactive "$task_arn"
      ;;
    auto)
      create_superuser_auto "$task_arn"
      ;;
    *)
      log_error "Invalid mode: $MODE"
      echo "Usage: $0 [dev|staging|prod] [interactive|auto]"
      exit 1
      ;;
  esac

  # Print summary
  print_summary

  log_success "Done!"
  exit 0
}

# Run main function
main
