#!/bin/bash
set -e

# Script para fazer push inicial das imagens Docker para ECR
# Este script deve ser rodado ANTES do primeiro deploy do CDK

AWS_ACCOUNT_ID="258993895334"
AWS_REGION="us-east-1"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "🔐 Fazendo login no ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

echo "🏗️  Building API Docker image for linux/amd64..."
cd apps/api
docker build \
  --platform linux/amd64 \
  --target production \
  -t ${ECR_REGISTRY}/talentbase-api:latest \
  -t ${ECR_REGISTRY}/talentbase-api:initial \
  .

echo "📤 Pushing API image to ECR..."
docker push ${ECR_REGISTRY}/talentbase-api:latest
docker push ${ECR_REGISTRY}/talentbase-api:initial

cd ../..

echo "🏗️  Building Web Docker image for linux/amd64..."
docker build \
  -f packages/web/Dockerfile \
  --platform linux/amd64 \
  --target production \
  --build-arg VITE_API_URL=https://api-dev.salesdog.click \
  --build-arg NODE_ENV=production \
  -t ${ECR_REGISTRY}/talentbase-web:latest \
  -t ${ECR_REGISTRY}/talentbase-web:initial \
  .

echo "📤 Pushing Web image to ECR..."
docker push ${ECR_REGISTRY}/talentbase-web:latest
docker push ${ECR_REGISTRY}/talentbase-web:initial

echo "✅ Imagens enviadas com sucesso!"
echo ""
echo "Próximo passo: executar o deploy do CDK"
echo "cd infrastructure && npm run deploy:dev"
