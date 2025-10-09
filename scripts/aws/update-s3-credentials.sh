#!/bin/bash
#
# Update AWS S3 Credentials in Secrets Manager
# Story 3.1 - Profile Photo Uploads
#
# Usage:
#   ./scripts/aws/update-s3-credentials.sh dev
#   ./scripts/aws/update-s3-credentials.sh prod
#

set -e

ENVIRONMENT="${1:-dev}"

if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
  echo "❌ Error: Environment must be 'dev' or 'prod'"
  echo "Usage: $0 <dev|prod>"
  exit 1
fi

SECRET_NAME="talentbase/${ENVIRONMENT}/aws-s3-credentials"

echo "🔑 Updating AWS S3 Credentials in Secrets Manager"
echo "Environment: $ENVIRONMENT"
echo "Secret Name: $SECRET_NAME"
echo ""

# Get current AWS credentials from local AWS CLI config
AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)

if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" ]]; then
  echo "❌ Error: AWS credentials not found in ~/.aws/credentials"
  echo "Run: aws configure"
  exit 1
fi

echo "✅ Found AWS credentials in local config"
echo "Access Key ID: ${AWS_ACCESS_KEY_ID:0:10}..."
echo ""

# Create JSON payload
SECRET_JSON=$(cat <<EOF
{
  "AWS_ACCESS_KEY_ID": "$AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY": "$AWS_SECRET_ACCESS_KEY"
}
EOF
)

# Check if secret exists
if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" &>/dev/null; then
  echo "🔄 Updating existing secret..."
  aws secretsmanager put-secret-value \
    --secret-id "$SECRET_NAME" \
    --secret-string "$SECRET_JSON"
  echo "✅ Secret updated successfully!"
else
  echo "⚠️  Secret not found. Creating new secret..."
  aws secretsmanager create-secret \
    --name "$SECRET_NAME" \
    --description "AWS S3 credentials for TalentBase $ENVIRONMENT environment" \
    --secret-string "$SECRET_JSON"
  echo "✅ Secret created successfully!"
fi

echo ""
echo "📋 Verification:"
aws secretsmanager get-secret-value --secret-id "$SECRET_NAME" \
  | jq -r '.SecretString' \
  | jq 'with_entries(if .key == "AWS_SECRET_ACCESS_KEY" then .value = (.value[:10] + "...") else . end)'

echo ""
echo "✅ Done! AWS S3 credentials are now stored in Secrets Manager."
echo ""
echo "Next steps:"
echo "1. Deploy CDK stack: cd infrastructure && npm run deploy:dev"
echo "2. Verify ECS task has access to secrets"
echo "3. Test presigned URL generation from Django"
