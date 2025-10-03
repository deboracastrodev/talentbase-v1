#!/bin/bash

# TalentBase Secrets Management Script
# This script helps manage AWS Secrets Manager secrets for the application

set -e

REGION="us-east-1"
ACCOUNT_ID="258993895334"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function print_usage() {
    cat <<EOF
Usage: $0 <command> <environment>

Commands:
    create-session-secret   Create SESSION_SECRET in Secrets Manager
    rotate-session-secret   Rotate SESSION_SECRET (generate new value)
    view-secret             View current secret value
    update-secret           Update secret with custom value
    list-secrets            List all secrets for environment

Environments:
    dev                     Development environment
    prod                    Production environment

Examples:
    $0 create-session-secret dev
    $0 view-secret prod
    $0 rotate-session-secret dev

EOF
}

function generate_random_secret() {
    # Generate 64-character random string (alphanumeric)
    openssl rand -base64 48 | tr -d "=+/" | cut -c1-64
}

function create_session_secret() {
    local env=$1
    local cluster_name="talentbase-${env}"
    local secret_name="${cluster_name}/web/session-secret"

    echo -e "${YELLOW}Creating SESSION_SECRET for ${env} environment...${NC}"

    # Check if secret already exists
    if aws secretsmanager describe-secret \
        --secret-id "${secret_name}" \
        --region ${REGION} &> /dev/null; then
        echo -e "${RED}Secret already exists: ${secret_name}${NC}"
        echo -e "${YELLOW}Use 'rotate-session-secret' to update it${NC}"
        exit 1
    fi

    # Generate random secret
    local secret_value=$(generate_random_secret)

    # Create secret
    aws secretsmanager create-secret \
        --name "${secret_name}" \
        --description "Session secret for Remix web application (${env})" \
        --secret-string "{\"SESSION_SECRET\":\"${secret_value}\"}" \
        --region ${REGION} \
        --tags Key=Environment,Value=${env} Key=Project,Value=TalentBase Key=ManagedBy,Value=Script

    echo -e "${GREEN}Secret created successfully!${NC}"
    echo -e "Secret Name: ${secret_name}"
    echo -e "Secret ARN: $(aws secretsmanager describe-secret --secret-id ${secret_name} --region ${REGION} --query 'ARN' --output text)"
}

function rotate_session_secret() {
    local env=$1
    local cluster_name="talentbase-${env}"
    local secret_name="${cluster_name}/web/session-secret"

    echo -e "${YELLOW}Rotating SESSION_SECRET for ${env} environment...${NC}"

    # Generate new random secret
    local new_secret_value=$(generate_random_secret)

    # Update secret
    aws secretsmanager update-secret \
        --secret-id "${secret_name}" \
        --secret-string "{\"SESSION_SECRET\":\"${new_secret_value}\"}" \
        --region ${REGION}

    echo -e "${GREEN}Secret rotated successfully!${NC}"
    echo -e "${YELLOW}Note: You need to restart ECS tasks for changes to take effect${NC}"
    echo -e "\nRestart command:"
    echo -e "  aws ecs update-service --cluster ${cluster_name} --service ${cluster_name}-web --force-new-deployment --region ${REGION}"
}

function view_secret() {
    local env=$1
    local cluster_name="talentbase-${env}"
    local secret_name="${cluster_name}/web/session-secret"

    echo -e "${YELLOW}Retrieving secret for ${env} environment...${NC}"

    # Get secret value
    local secret_json=$(aws secretsmanager get-secret-value \
        --secret-id "${secret_name}" \
        --region ${REGION} \
        --query 'SecretString' \
        --output text)

    echo -e "${GREEN}Secret retrieved successfully!${NC}"
    echo -e "\nSecret Name: ${secret_name}"
    echo -e "Secret Value:"
    echo "${secret_json}" | jq .
}

function update_secret() {
    local env=$1
    local cluster_name="talentbase-${env}"
    local secret_name="${cluster_name}/web/session-secret"

    echo -e "${YELLOW}Update SESSION_SECRET for ${env} environment${NC}"
    echo -e "${RED}WARNING: This will replace the current secret value${NC}"
    echo -e "\nEnter new SESSION_SECRET value (or press Enter to generate random):"
    read -r new_value

    if [ -z "$new_value" ]; then
        new_value=$(generate_random_secret)
        echo -e "${GREEN}Generated random secret${NC}"
    fi

    # Confirm update
    echo -e "\n${YELLOW}Are you sure you want to update the secret? (yes/no)${NC}"
    read -r confirmation

    if [ "$confirmation" != "yes" ]; then
        echo -e "${RED}Update cancelled${NC}"
        exit 0
    fi

    # Update secret
    aws secretsmanager update-secret \
        --secret-id "${secret_name}" \
        --secret-string "{\"SESSION_SECRET\":\"${new_value}\"}" \
        --region ${REGION}

    echo -e "${GREEN}Secret updated successfully!${NC}"
    echo -e "${YELLOW}Note: You need to restart ECS tasks for changes to take effect${NC}"
}

function list_secrets() {
    local env=$1
    local cluster_name="talentbase-${env}"

    echo -e "${YELLOW}Listing secrets for ${env} environment...${NC}\n"

    aws secretsmanager list-secrets \
        --region ${REGION} \
        --filters Key=name,Values=${cluster_name}/ \
        --query 'SecretList[*].[Name,Description,LastChangedDate]' \
        --output table
}

# Main script
if [ $# -lt 2 ]; then
    print_usage
    exit 1
fi

COMMAND=$1
ENV=$2

# Validate environment
if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo -e "${RED}Invalid environment: ${ENV}${NC}"
    echo -e "Valid environments: dev, prod"
    exit 1
fi

# Execute command
case $COMMAND in
    create-session-secret)
        create_session_secret $ENV
        ;;
    rotate-session-secret)
        rotate_session_secret $ENV
        ;;
    view-secret)
        view_secret $ENV
        ;;
    update-secret)
        update_secret $ENV
        ;;
    list-secrets)
        list_secrets $ENV
        ;;
    *)
        echo -e "${RED}Unknown command: ${COMMAND}${NC}"
        print_usage
        exit 1
        ;;
esac
