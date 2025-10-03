#!/bin/bash

# TalentBase Infrastructure Deployment Script
# Simplified deployment process with validation

set -e

REGION="us-east-1"
ACCOUNT_ID="258993895334"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

function print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

function print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

function print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

function print_error() {
    echo -e "${RED}✗ $1${NC}"
}

function check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not found. Please install it first."
        exit 1
    fi
    print_success "AWS CLI installed"

    # Check CDK
    if ! command -v cdk &> /dev/null; then
        print_error "AWS CDK not found. Install with: npm install -g aws-cdk"
        exit 1
    fi
    print_success "AWS CDK installed"

    # Check jq
    if ! command -v jq &> /dev/null; then
        print_warning "jq not found. Install for better JSON handling: brew install jq"
    else
        print_success "jq installed"
    fi

    # Verify AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        exit 1
    fi
    print_success "AWS credentials configured"

    local current_account=$(aws sts get-caller-identity --query 'Account' --output text)
    if [ "$current_account" != "$ACCOUNT_ID" ]; then
        print_error "Wrong AWS account. Expected: $ACCOUNT_ID, Got: $current_account"
        exit 1
    fi
    print_success "AWS account verified: $ACCOUNT_ID"
}

function install_dependencies() {
    print_header "Installing Dependencies"

    cd "$(dirname "$0")/.."

    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found. Running npm install..."
        npm install
    else
        print_success "Dependencies already installed"
    fi
}

function synthesize_stack() {
    local env=$1
    local stack_name="TalentBase${env^}-ApplicationStack"

    print_header "Synthesizing Stack: $stack_name"

    cdk synth "$stack_name"

    print_success "Stack synthesized successfully"
}

function deploy_stack() {
    local env=$1
    local stack_name="TalentBase${env^}-ApplicationStack"

    print_header "Deploying Stack: $stack_name"

    echo -e "${YELLOW}This will deploy the following stack:${NC}"
    echo -e "  Stack: $stack_name"
    echo -e "  Environment: $env"
    echo -e "  Region: $REGION"
    echo -e "\n${YELLOW}Do you want to continue? (yes/no)${NC}"
    read -r confirmation

    if [ "$confirmation" != "yes" ]; then
        print_error "Deployment cancelled"
        exit 0
    fi

    # Deploy with progress
    cdk deploy "$stack_name" \
        --require-approval never \
        --progress events \
        --outputs-file "./outputs-${env}.json"

    print_success "Stack deployed successfully"
}

function verify_deployment() {
    local env=$1
    local cluster_name="talentbase-${env}"

    print_header "Verifying Deployment"

    # Check ECS cluster
    echo -e "${YELLOW}Checking ECS cluster...${NC}"
    if aws ecs describe-clusters \
        --clusters "$cluster_name" \
        --region $REGION \
        --query 'clusters[0].status' \
        --output text | grep -q "ACTIVE"; then
        print_success "ECS cluster is active"
    else
        print_error "ECS cluster is not active"
    fi

    # Check ECS services
    echo -e "\n${YELLOW}Checking ECS services...${NC}"
    local web_service="${cluster_name}-web"
    local api_service="${cluster_name}-api"

    for service in $web_service $api_service; do
        local desired=$(aws ecs describe-services \
            --cluster "$cluster_name" \
            --services "$service" \
            --region $REGION \
            --query 'services[0].desiredCount' \
            --output text)

        local running=$(aws ecs describe-services \
            --cluster "$cluster_name" \
            --services "$service" \
            --region $REGION \
            --query 'services[0].runningCount' \
            --output text)

        echo -e "  $service: $running/$desired running"

        if [ "$running" -eq "$desired" ]; then
            print_success "$service is healthy"
        else
            print_warning "$service is still starting ($running/$desired)"
        fi
    done

    # Check secrets
    echo -e "\n${YELLOW}Checking secrets...${NC}"
    local secret_name="${cluster_name}/web/session-secret"

    if aws secretsmanager describe-secret \
        --secret-id "$secret_name" \
        --region $REGION &> /dev/null; then
        print_success "SESSION_SECRET exists"
    else
        print_error "SESSION_SECRET not found"
        echo -e "${YELLOW}Create it with: ./scripts/manage-secrets.sh create-session-secret $env${NC}"
    fi
}

function show_outputs() {
    local env=$1
    local outputs_file="./outputs-${env}.json"

    print_header "Deployment Outputs"

    if [ -f "$outputs_file" ]; then
        if command -v jq &> /dev/null; then
            cat "$outputs_file" | jq .
        else
            cat "$outputs_file"
        fi
    else
        print_warning "Outputs file not found: $outputs_file"
    fi
}

function tail_logs() {
    local env=$1
    local cluster_name="talentbase-${env}"
    local log_group="/ecs/${cluster_name}-web"

    print_header "Tailing Logs"

    echo -e "${YELLOW}Following logs from: $log_group${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

    aws logs tail "$log_group" \
        --follow \
        --region $REGION \
        --format short
}

function show_service_events() {
    local env=$1
    local cluster_name="talentbase-${env}"
    local service_name="${cluster_name}-web"

    print_header "Recent Service Events"

    aws ecs describe-services \
        --cluster "$cluster_name" \
        --services "$service_name" \
        --region $REGION \
        --query 'services[0].events[:10]' \
        --output table
}

function print_usage() {
    cat <<EOF
TalentBase Infrastructure Deployment Script

Usage: $0 <command> <environment>

Commands:
    deploy              Full deployment (deps + synth + deploy + verify)
    synth               Synthesize CloudFormation template
    verify              Verify existing deployment
    outputs             Show deployment outputs
    logs                Tail CloudWatch logs
    events              Show recent ECS service events
    help                Show this help message

Environments:
    dev                 Development environment
    prod                Production environment

Examples:
    $0 deploy dev       Deploy to development
    $0 verify prod      Verify production deployment
    $0 logs dev         Tail development logs

EOF
}

# Main script
if [ $# -lt 1 ]; then
    print_usage
    exit 1
fi

COMMAND=$1
ENV=${2:-dev}

# Validate environment
if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    print_error "Invalid environment: $ENV"
    echo "Valid environments: dev, prod"
    exit 1
fi

case $COMMAND in
    deploy)
        check_prerequisites
        install_dependencies
        synthesize_stack $ENV
        deploy_stack $ENV
        verify_deployment $ENV
        show_outputs $ENV
        echo -e "\n${GREEN}Deployment completed!${NC}"
        echo -e "${YELLOW}View logs with: $0 logs $ENV${NC}"
        ;;
    synth)
        check_prerequisites
        install_dependencies
        synthesize_stack $ENV
        ;;
    verify)
        check_prerequisites
        verify_deployment $ENV
        ;;
    outputs)
        show_outputs $ENV
        ;;
    logs)
        tail_logs $ENV
        ;;
    events)
        show_service_events $ENV
        ;;
    help)
        print_usage
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        print_usage
        exit 1
        ;;
esac
