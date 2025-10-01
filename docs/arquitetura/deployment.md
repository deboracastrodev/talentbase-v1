# Deployment Strategy

Estratégia de deploy para TalentBase na AWS com GitHub Actions.

---

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Route 53 DNS                              │
│                  salesdog.click                              │
│                                                              │
│  www.salesdog.click  →  Frontend (Remix)                    │
│  api.salesdog.click  →  Backend (Django)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
           ┌─────────────┴───────────────┐
           │                             │
           ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│  ALB/CloudFront  │          │  ALB             │
│  (Frontend)      │          │  (API)           │
└────────┬─────────┘          └────────┬─────────┘
         │                             │
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│  EC2/ECS         │          │  EC2/ECS         │
│  Remix App       │          │  Django API      │
│  (Docker)        │          │  (Docker)        │
└──────────────────┘          └────────┬─────────┘
                                       │
                         ┌─────────────┴──────────────┐
                         │                            │
                         ▼                            ▼
                  ┌─────────────┐           ┌─────────────┐
                  │  RDS        │           │  ElastiCache│
                  │  PostgreSQL │           │  Redis      │
                  └─────────────┘           └─────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  S3 Bucket  │
                  │  (Files)    │
                  └─────────────┘
```

---

## DNS Configuration (Route 53)

| Domain | Type | Target |
|--------|------|--------|
| salesdog.click | A | ALB for Frontend |
| www.salesdog.click | CNAME | salesdog.click |
| api.salesdog.click | A | ALB for Backend |
| storybook.salesdog.click | CNAME | GitHub Pages |

---

## AWS Resources

### 1. VPC & Networking
```
- VPC: 10.0.0.0/16
- Public Subnets: 10.0.1.0/24, 10.0.2.0/24 (2 AZs)
- Private Subnets: 10.0.10.0/24, 10.0.11.0/24 (2 AZs)
- Internet Gateway
- NAT Gateways (optional, for cost optimization can skip initially)
```

### 2. Security Groups

**Frontend SG:**
```
Inbound:
- Port 80 (HTTP) from 0.0.0.0/0
- Port 443 (HTTPS) from 0.0.0.0/0

Outbound:
- All traffic
```

**Backend SG:**
```
Inbound:
- Port 80 (HTTP) from ALB SG
- Port 443 (HTTPS) from ALB SG
- Port 8000 (Django) from ALB SG

Outbound:
- All traffic
```

**Database SG:**
```
Inbound:
- Port 5432 (PostgreSQL) from Backend SG

Outbound:
- All traffic
```

### 3. RDS PostgreSQL
```
- Engine: PostgreSQL 15
- Instance: db.t3.micro (Free tier) → db.t3.small (production)
- Storage: 20GB gp3 (auto-scaling até 100GB)
- Multi-AZ: No (dev) → Yes (production)
- Automated backups: 7 days retention
- Encryption: Enabled
```

### 4. ElastiCache Redis
```
- Engine: Redis 7.x
- Node type: cache.t3.micro (dev) → cache.t3.small (prod)
- Nodes: 1 (dev) → 2+ (prod with replica)
- Use case: Cache, session storage, Celery broker
```

### 5. S3 Buckets
```
talentbase-uploads/
├── avatars/
├── company-logos/
└── documents/

Bucket policy:
- Private bucket
- CloudFront OAI for public access
- Versioning enabled
- Lifecycle rules for old files
```

### 6. EC2 / ECS

**Option A: EC2 (Simpler, cheaper for MVP)**
```
- Instance type: t3.small (2 vCPU, 2GB RAM)
- AMI: Amazon Linux 2023
- Auto Scaling: Min 1, Desired 1, Max 3
- Load Balancer: Application Load Balancer
```

**Option B: ECS Fargate (Recommended for scale)**
```
- Service: talentbase-frontend, talentbase-backend
- Task definition: 0.5 vCPU, 1GB memory
- Desired count: 1 (dev) → 2+ (prod)
- Auto Scaling based on CPU/Memory
```

---

## Docker Setup

### Backend Dockerfile
```dockerfile
# apps/api/Dockerfile

FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install dependencies
COPY requirements/production.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run gunicorn
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]

EXPOSE 8000
```

### Frontend Dockerfile
```dockerfile
# packages/web/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN npm ci --production

CMD ["npm", "start"]

EXPOSE 3000
```

### docker-compose.yml (Development)
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: talentbase
      POSTGRES_USER: talentbase
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.dev
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./apps/api:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql://talentbase:dev_password@db:5432/talentbase
      - REDIS_URL=redis://redis:6379/0

  frontend:
    build:
      context: ./packages/web
      dockerfile: Dockerfile.dev
    command: npm run dev
    volumes:
      - ./packages/web:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://backend:8000

volumes:
  postgres_data:
```

---

## GitHub Actions CI/CD

### Backend Pipeline
```.yaml
# .github/workflows/deploy-backend.yml

name: Deploy Backend

on:
  push:
    branches: [master]
    paths:
      - 'apps/api/**'
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd apps/api
          pip install -r requirements/development.txt

      - name: Run tests
        run: |
          cd apps/api
          python manage.py test

      - name: Run linter
        run: |
          cd apps/api
          flake8 .

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: talentbase-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd apps/api
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster talentbase-cluster \
            --service talentbase-backend \
            --force-new-deployment
```

### Frontend Pipeline
```yaml
# .github/workflows/deploy-frontend.yml

name: Deploy Frontend

on:
  push:
    branches: [master]
    paths:
      - 'packages/web/**'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd packages/web
          npm ci

      - name: Build
        run: |
          cd packages/web
          npm run build
        env:
          API_URL: https://api.salesdog.click

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3 + CloudFront (or ECS)
        run: |
          # Option A: S3 + CloudFront
          aws s3 sync packages/web/build s3://talentbase-frontend
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} --paths "/*"

          # Option B: ECS (Docker)
          # Similar to backend deployment
```

---

## Environment Variables

### Backend (.env)
```bash
# Django
SECRET_KEY=<random-secret-key>
DEBUG=False
ALLOWED_HOSTS=api.salesdog.click

# Database
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/talentbase

# Redis
REDIS_URL=redis://elasticache-endpoint:6379/0

# AWS S3
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_STORAGE_BUCKET_NAME=talentbase-uploads
AWS_S3_REGION_NAME=us-east-1

# Email (SES)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True

# CORS
CORS_ALLOWED_ORIGINS=https://salesdog.click,https://www.salesdog.click
```

### Frontend (.env)
```bash
# API
API_URL=https://api.salesdog.click/v1

# Environment
NODE_ENV=production
```

---

## SSL Certificates

**Option A: AWS Certificate Manager (ACM)** ✅
- Free SSL certificates
- Auto-renewal
- Attach to ALB

**Option B: Let's Encrypt (if using EC2 directly)**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d salesdog.click -d www.salesdog.click

# Auto-renewal cron
0 0 * * * certbot renew --quiet
```

---

## Monitoring & Logging

### CloudWatch
```
- Application logs (Django, Remix)
- Access logs (ALB)
- Database logs (RDS)
- Custom metrics (API latency, error rates)
- Alarms (CPU > 80%, 5xx errors)
```

### Sentry (Error Tracking)
```python
# Backend
import sentry_sdk
sentry_sdk.init(dsn="https://...", environment="production")
```

```typescript
// Frontend
import * as Sentry from "@sentry/remix";
Sentry.init({ dsn: "https://..." });
```

---

## Deployment Checklist

### Initial Setup
- [ ] Configure AWS CLI locally
- [ ] Create RDS PostgreSQL instance
- [ ] Create ElastiCache Redis instance
- [ ] Create S3 bucket for uploads
- [ ] Create ECR repositories
- [ ] Set up VPC, subnets, security groups
- [ ] Configure Route 53 DNS
- [ ] Request SSL certificates (ACM)
- [ ] Create ECS cluster or EC2 instances
- [ ] Set up ALB

### CI/CD
- [ ] Add AWS credentials to GitHub Secrets
- [ ] Test GitHub Actions workflows
- [ ] Configure deployment environments (staging, production)

### Application
- [ ] Run database migrations
- [ ] Create Django superuser
- [ ] Load initial data (skills, etc.)
- [ ] Test API endpoints
- [ ] Test frontend deployment

### Security
- [ ] Enable WAF on ALB
- [ ] Configure Security Groups
- [ ] Enable CloudTrail logging
- [ ] Set up backup policies
- [ ] Configure Rate Limiting

---

## Cost Estimation (AWS)

**MVP (Monthly):**
- EC2 t3.small × 2: ~$30
- RDS db.t3.micro: ~$15
- ElastiCache t3.micro: ~$12
- S3 + Data Transfer: ~$5
- Route 53: ~$1
- **Total: ~$63/month**

**Production (Monthly):**
- ECS Fargate: ~$50
- RDS db.t3.small (Multi-AZ): ~$60
- ElastiCache (Replica): ~$25
- S3 + CloudFront: ~$20
- ALB: ~$20
- **Total: ~$175/month**
