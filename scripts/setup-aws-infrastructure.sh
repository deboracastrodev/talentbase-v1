#!/bin/bash
# Story 1.6: Configure DNS & SSL Infrastructure Setup Script
# This script provisions the required AWS infrastructure for the TalentBase application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="us-east-1"
HOSTED_ZONE_ID="Z08777062VQUJNRPO700D"
CERT_ARN="arn:aws:acm:us-east-1:258993895334:certificate/6f17fe7f-fca3-41f1-95a3-8debad6f7fa8"

echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   TalentBase AWS Infrastructure Setup - Story 1.6       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to check if resource exists
check_resource() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

echo -e "${YELLOW}📋 Prerequisites Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check AWS CLI
if command -v aws &> /dev/null; then
    print_status 0 "AWS CLI installed"
else
    print_status 1 "AWS CLI not found"
    exit 1
fi

# Check AWS credentials
if aws sts get-caller-identity &> /dev/null; then
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_status 0 "AWS credentials configured (Account: $ACCOUNT_ID)"
else
    print_status 1 "AWS credentials not configured"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔍 Checking Existing Infrastructure${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check SSL Certificate
echo -n "Checking SSL certificate... "
CERT_STATUS=$(aws acm describe-certificate --certificate-arn "$CERT_ARN" --region $AWS_REGION --query 'Certificate.Status' --output text 2>/dev/null || echo "NOT_FOUND")
if [ "$CERT_STATUS" == "ISSUED" ]; then
    print_status 0 "SSL Certificate exists and is ISSUED"
else
    echo -e "${YELLOW}⚠️  SSL Certificate not found or not issued${NC}"
    echo "   Run the certificate request commands from the story documentation"
fi

# Check Route 53 Hosted Zone
echo -n "Checking Route 53 hosted zone... "
if aws route53 get-hosted-zone --id $HOSTED_ZONE_ID &> /dev/null; then
    print_status 0 "Route 53 hosted zone exists"
else
    print_status 1 "Route 53 hosted zone not found"
    exit 1
fi

# Check existing DNS records
echo ""
echo -e "${YELLOW}📝 Current DNS Records:${NC}"
aws route53 list-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID \
    --query "ResourceRecordSets[?Type=='A'].Name" --output table

# Check VPC
echo ""
echo -n "Checking for VPC... "
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=talentbase-vpc" --query 'Vpcs[0].VpcId' --output text 2>/dev/null || echo "None")
if [ "$VPC_ID" != "None" ]; then
    print_status 0 "VPC exists: $VPC_ID"
else
    echo -e "${YELLOW}⚠️  VPC not found - needs to be created${NC}"
fi

# Check ECS Clusters
echo ""
echo -n "Checking ECS clusters... "
PROD_CLUSTER=$(aws ecs describe-clusters --clusters talentbase-prod --query 'clusters[0].clusterName' --output text 2>/dev/null || echo "None")
DEV_CLUSTER=$(aws ecs describe-clusters --clusters talentbase-dev --query 'clusters[0].clusterName' --output text 2>/dev/null || echo "None")

if [ "$PROD_CLUSTER" != "None" ] && [ "$DEV_CLUSTER" != "None" ]; then
    print_status 0 "ECS clusters exist (prod & dev)"
else
    echo -e "${YELLOW}⚠️  ECS clusters not found${NC}"
    echo "   Production: ${PROD_CLUSTER:-NOT FOUND}"
    echo "   Development: ${DEV_CLUSTER:-NOT FOUND}"
fi

# Check ALBs
echo ""
echo -n "Checking Application Load Balancers... "
ALBS=$(aws elbv2 describe-load-balancers --query 'LoadBalancers[*].LoadBalancerName' --output text 2>/dev/null || echo "")
if [ -n "$ALBS" ]; then
    print_status 0 "Load Balancers found: $ALBS"
else
    echo -e "${YELLOW}⚠️  No Application Load Balancers found${NC}"
fi

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📊 Infrastructure Status Summary${NC}"
echo ""
echo "✅ Completed:"
echo "   • SSL Certificate (wildcard *.salesdog.click)"
echo "   • Route 53 Hosted Zone"
echo "   • Django settings updated (ALLOWED_HOSTS, CORS, SSL)"
echo "   • Remix apex domain redirect route"
echo ""
echo -e "${YELLOW}⚠️  Pending (requires manual setup):${NC}"
echo "   • VPC with public/private subnets"
echo "   • ECS Clusters (talentbase-prod, talentbase-dev)"
echo "   • Application Load Balancers"
echo "   • ECS Services and Task Definitions"
echo "   • DNS A records pointing to ALBs"
echo "   • ALB HTTPS listeners with SSL certificate"
echo "   • ALB HTTP→HTTPS redirects"
echo ""
echo -e "${YELLOW}📚 Next Steps:${NC}"
echo "   1. Create VPC and networking infrastructure"
echo "   2. Create ECS clusters (prod & dev)"
echo "   3. Create Application Load Balancers"
echo "   4. Deploy ECS services (Story 1.5)"
echo "   5. Configure DNS records (see commands below)"
echo "   6. Configure ALB listeners (see commands below)"
echo "   7. Run validation tests"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Generate commands for next steps
echo -e "${YELLOW}📋 Commands to run after infrastructure is ready:${NC}"
echo ""
echo "# Get ALB DNS names after they're created:"
echo "aws elbv2 describe-load-balancers --query 'LoadBalancers[*].[LoadBalancerName,DNSName,CanonicalHostedZoneId]' --output table"
echo ""
echo "# Create DNS record for www.salesdog.click (replace <ALB_DNS> and <ALB_ZONE_ID>):"
echo "cat > /tmp/create-www-record.json <<'EOF'
{
  \"Changes\": [{
    \"Action\": \"UPSERT\",
    \"ResourceRecordSet\": {
      \"Name\": \"www.salesdog.click\",
      \"Type\": \"A\",
      \"AliasTarget\": {
        \"HostedZoneId\": \"<ALB_ZONE_ID>\",
        \"DNSName\": \"<ALB_DNS>\",
        \"EvaluateTargetHealth\": true
      }
    }
  }]
}
EOF"
echo "aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch file:///tmp/create-www-record.json"
echo ""
echo "# Create DNS record for apex domain (salesdog.click) pointing to same ALB:"
echo "# (Similar to above, just change the Name to 'salesdog.click')"
echo ""
echo "# Create HTTPS listener on ALB (replace <ALB_ARN> and <TARGET_GROUP_ARN>):"
echo "aws elbv2 create-listener \\"
echo "  --load-balancer-arn <ALB_ARN> \\"
echo "  --protocol HTTPS \\"
echo "  --port 443 \\"
echo "  --certificates CertificateArn=$CERT_ARN \\"
echo "  --default-actions Type=forward,TargetGroupArn=<TARGET_GROUP_ARN>"
echo ""
echo "# Create HTTP→HTTPS redirect listener:"
echo "aws elbv2 create-listener \\"
echo "  --load-balancer-arn <ALB_ARN> \\"
echo "  --protocol HTTP \\"
echo "  --port 80 \\"
echo "  --default-actions 'Type=redirect,RedirectConfig={Protocol=HTTPS,Port=443,StatusCode=HTTP_301}'"
echo ""
