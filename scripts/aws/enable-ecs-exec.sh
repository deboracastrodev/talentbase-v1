#!/bin/bash
#
# Enable ECS Execute Command - TalentBase
#
# Description: Enable ECS Exec on existing service for remote command execution
# Author: BMad Master
# Date: 2025-10-10
#
# Prerequisites:
#   - AWS CLI installed and configured
#   - Appropriate IAM permissions
#
# Usage:
#   ./scripts/aws/enable-ecs-exec.sh [environment]
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

# AWS configuration
REGION="us-east-1"
case "$ENVIRONMENT" in
  dev)
    CLUSTER_NAME="talentbase-dev"
    SERVICE_NAME="talentbase-web-dev"
    ;;
  staging)
    CLUSTER_NAME="talentbase-staging"
    SERVICE_NAME="talentbase-web-staging"
    ;;
  prod)
    CLUSTER_NAME="talentbase-prod"
    SERVICE_NAME="talentbase-web-prod"
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
# MAIN FUNCTIONS
# ============================================================================

check_aws_access() {
  log_info "Checking AWS access..."

  if ! aws sts get-caller-identity &>/dev/null; then
    log_error "Cannot access AWS. Make sure you are logged in."
    exit 1
  fi

  log_success "AWS access confirmed"
}

check_current_status() {
  log_info "Checking current ECS Exec status..."

  local exec_enabled=$(aws ecs describe-services \
    --cluster "$CLUSTER_NAME" \
    --services "$SERVICE_NAME" \
    --region "$REGION" \
    --query 'services[0].enableExecuteCommand' \
    --output text)

  if [ "$exec_enabled" == "True" ]; then
    log_warning "ECS Execute Command is already enabled"
    echo ""
    read -p "Do you want to force update? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log_info "Cancelled by user"
      exit 0
    fi
  else
    log_info "ECS Execute Command is currently disabled"
  fi
}

enable_ecs_exec() {
  log_info "Enabling ECS Execute Command..."
  echo ""

  log_warning "This will update the service and may cause a brief interruption"
  read -p "Continue? (y/N): " -n 1 -r
  echo ""

  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Cancelled by user"
    exit 0
  fi

  # Update service to enable execute command
  aws ecs update-service \
    --cluster "$CLUSTER_NAME" \
    --service "$SERVICE_NAME" \
    --enable-execute-command \
    --region "$REGION" \
    --force-new-deployment \
    --query 'service.{ServiceName:serviceName,Status:status,EnableExecuteCommand:enableExecuteCommand}' \
    --output table

  log_success "Service updated successfully"
}

wait_for_deployment() {
  log_info "Waiting for service to stabilize..."
  echo ""
  log_warning "This may take 2-5 minutes..."

  aws ecs wait services-stable \
    --cluster "$CLUSTER_NAME" \
    --services "$SERVICE_NAME" \
    --region "$REGION"

  log_success "Service is stable"
}

verify_setup() {
  log_info "Verifying ECS Exec is enabled..."

  local exec_enabled=$(aws ecs describe-services \
    --cluster "$CLUSTER_NAME" \
    --services "$SERVICE_NAME" \
    --region "$REGION" \
    --query 'services[0].enableExecuteCommand' \
    --output text)

  if [ "$exec_enabled" == "True" ]; then
    log_success "✓ ECS Execute Command is enabled"
  else
    log_error "✗ ECS Execute Command is still disabled"
    return 1
  fi

  # Check if task has exec enabled
  log_info "Checking active task..."

  local task_arn=$(aws ecs list-tasks \
    --cluster "$CLUSTER_NAME" \
    --service-name "$SERVICE_NAME" \
    --desired-status RUNNING \
    --region "$REGION" \
    --query 'taskArns[0]' \
    --output text)

  if [ "$task_arn" == "None" ] || [ -z "$task_arn" ]; then
    log_warning "No running tasks found yet"
    return 0
  fi

  local task_exec_enabled=$(aws ecs describe-tasks \
    --cluster "$CLUSTER_NAME" \
    --tasks "$task_arn" \
    --region "$REGION" \
    --query 'tasks[0].enableExecuteCommand' \
    --output text)

  if [ "$task_exec_enabled" == "True" ]; then
    log_success "✓ Active task has ECS Exec enabled"
  else
    log_warning "✗ Active task does not have ECS Exec enabled yet"
    log_info "Wait for the next deployment or restart the service"
  fi
}

print_summary() {
  echo ""
  echo "==================================================="
  echo "ECS EXEC SETUP COMPLETE"
  echo "==================================================="
  echo ""
  echo "Environment: $ENVIRONMENT"
  echo "Cluster: $CLUSTER_NAME"
  echo "Service: $SERVICE_NAME"
  echo ""
  echo "Next Steps:"
  echo ""
  echo "  1. Create a superuser:"
  echo "     ./scripts/aws/create-superuser.sh $ENVIRONMENT interactive"
  echo ""
  echo "  2. Or run any Django management command:"
  echo "     aws ecs execute-command \\"
  echo "       --cluster $CLUSTER_NAME \\"
  echo "       --task <TASK_ARN> \\"
  echo "       --container web \\"
  echo "       --interactive \\"
  echo "       --region $REGION \\"
  echo "       --command \"poetry run python manage.py <command>\""
  echo ""
  echo "  3. Or use the helper script:"
  echo "     ./scripts/aws/create-superuser.sh $ENVIRONMENT"
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
  echo "ENABLE ECS EXECUTE COMMAND - TalentBase"
  echo "==================================================="
  echo ""
  echo "Environment: $ENVIRONMENT"
  echo "Cluster: $CLUSTER_NAME"
  echo "Service: $SERVICE_NAME"
  echo ""

  check_aws_access
  check_current_status
  echo ""

  enable_ecs_exec
  echo ""

  wait_for_deployment
  echo ""

  verify_setup
  echo ""

  print_summary

  log_success "Done!"
  exit 0
}

# Run main function
main
