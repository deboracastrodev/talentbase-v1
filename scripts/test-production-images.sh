#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Testing Production Docker Images Locally ===${NC}\n"

# Get AWS account and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo -e "${YELLOW}Building API production image...${NC}"
docker build \
  --target production \
  --platform linux/amd64 \
  -t talentbase-api:test \
  -t ${ECR_REGISTRY}/talentbase-api:latest \
  ./apps/api

echo -e "${YELLOW}Building Web production image...${NC}"
docker build \
  --target production \
  --build-arg VITE_API_URL=https://api-dev.salesdog.click \
  --build-arg NODE_ENV=production \
  --platform linux/amd64 \
  -t talentbase-web:test \
  -t ${ECR_REGISTRY}/talentbase-web:latest \
  -f ./packages/web/Dockerfile \
  .

echo -e "\n${GREEN}✓ Images built successfully${NC}\n"

# Test API image
echo -e "${YELLOW}Testing API image...${NC}"
docker run --rm -d \
  --name talentbase-api-test \
  -p 8001:8000 \
  -e DB_NAME=test \
  -e DB_USER=test \
  -e DB_PASSWORD=test \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DJANGO_SETTINGS_MODULE=talentbase.settings.development \
  -e SECRET_KEY=test-secret-key-for-testing-only \
  talentbase-api:test

echo "Waiting for API to start..."
sleep 10

# Check if API is responding
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health/ || echo "000")
docker logs talentbase-api-test

if [ "$API_HEALTH" = "200" ]; then
  echo -e "${GREEN}✓ API health check passed${NC}"
else
  echo -e "${RED}✗ API health check failed (HTTP $API_HEALTH)${NC}"
  echo "API logs:"
  docker logs talentbase-api-test
  docker stop talentbase-api-test
  exit 1
fi

docker stop talentbase-api-test

# Test Web image
echo -e "\n${YELLOW}Testing Web image...${NC}"
docker run --rm -d \
  --name talentbase-web-test \
  -p 3001:3000 \
  -e SESSION_SECRET=test-session-secret-for-testing-only \
  talentbase-web:test

echo "Waiting for Web to start..."
sleep 15

# Check if Web is responding
WEB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ || echo "000")
docker logs talentbase-web-test

if [ "$WEB_HEALTH" = "200" ]; then
  echo -e "${GREEN}✓ Web health check passed${NC}"
else
  echo -e "${RED}✗ Web health check failed (HTTP $WEB_HEALTH)${NC}"
  echo "Web logs:"
  docker logs talentbase-web-test
  docker stop talentbase-web-test
  exit 1
fi

docker stop talentbase-web-test

echo -e "\n${GREEN}=== All tests passed! ===${NC}"
echo -e "${YELLOW}Images are ready to be pushed to ECR${NC}\n"
echo "To push images, run:"
echo "  ./scripts/push-tested-images.sh"
