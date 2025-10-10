#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Running Django Migrations on AWS RDS ===${NC}\n"

# Get AWS credentials
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"

# Get RDS credentials from Secrets Manager
echo -e "${YELLOW}Fetching RDS credentials...${NC}"
SECRET=$(aws secretsmanager get-secret-value --secret-id talentbase-dev-rds-credentials --query 'SecretString' --output text)
DB_HOST=$(echo $SECRET | jq -r '.host')
DB_NAME=$(echo $SECRET | jq -r '.dbname')
DB_USER=$(echo $SECRET | jq -r '.username')
DB_PASSWORD=$(echo $SECRET | jq -r '.password')
DB_PORT=$(echo $SECRET | jq -r '.port')

echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "User: $DB_USER"

# Get VPC and subnet information
echo -e "\n${YELLOW}Fetching VPC configuration...${NC}"
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=*talentbase*" --query 'Vpcs[0].VpcId' --output text)
SUBNET_ID=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*Private*" --query 'Subnets[0].SubnetId' --output text)
SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" "Name=group-name,Values=*EcsSecurityGroup*" --query 'SecurityGroups[0].GroupId' --output text)

echo "VPC: $VPC_ID"
echo "Subnet: $SUBNET_ID"
echo "Security Group: $SECURITY_GROUP_ID"

# Run migrations using ECS Fargate task
echo -e "\n${YELLOW}Running migrations via ECS Fargate...${NC}"

# Get cluster name
CLUSTER_NAME="talentbase-dev"

# Get task definition ARN
TASK_DEF_ARN=$(aws ecs list-task-definitions --family-prefix TalentbaseDevApplicationApiTaskDefinition --sort DESC --max-items 1 --query 'taskDefinitionArns[0]' --output text)

if [ -z "$TASK_DEF_ARN" ] || [ "$TASK_DEF_ARN" = "None" ]; then
  echo -e "${RED}Error: Task definition not found. Deploy the ApplicationStack first.${NC}"
  exit 1
fi

echo "Task Definition: $TASK_DEF_ARN"

# Run the migration task
echo -e "\n${YELLOW}Starting migration task...${NC}"
TASK_ARN=$(aws ecs run-task \
  --cluster $CLUSTER_NAME \
  --task-definition $TASK_DEF_ARN \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_ID],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=DISABLED}" \
  --overrides "{
    \"containerOverrides\": [{
      \"name\": \"ApiContainer\",
      \"command\": [\"python\", \"manage.py\", \"migrate\"]
    }]
  }" \
  --query 'tasks[0].taskArn' \
  --output text)

echo "Migration task started: $TASK_ARN"

# Wait for task to complete
echo -e "${YELLOW}Waiting for migrations to complete...${NC}"
aws ecs wait tasks-stopped --cluster $CLUSTER_NAME --tasks $TASK_ARN

# Check task exit code
EXIT_CODE=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --query 'tasks[0].containers[0].exitCode' --output text)

if [ "$EXIT_CODE" = "0" ]; then
  echo -e "\n${GREEN}✓ Migrations completed successfully!${NC}"
else
  echo -e "\n${RED}✗ Migrations failed with exit code $EXIT_CODE${NC}"
  echo -e "${YELLOW}Check CloudWatch logs for details:${NC}"
  echo "  aws logs tail /ecs/talentbase-api-dev --since 10m"
  exit 1
fi
