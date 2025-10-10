# TalentBase Infrastructure Deployment Guide

## Overview
This guide covers the refactored AWS infrastructure following best practices for:
- Secrets management with AWS Secrets Manager
- Environment variables with SSM Parameter Store
- Optimized health checks for ECS services
- Proper auto-scaling and deployment configuration
- Enhanced monitoring and logging

## What Changed

### 1. Secrets Management
- **SESSION_SECRET**: Moved from hardcoded value to AWS Secrets Manager
- **API_URL**: Stored in SSM Parameter Store for easy updates
- Proper IAM permissions for ECS tasks to read secrets

### 2. Health Check Improvements
- **Web Service**: Increased `startPeriod` to 180s (3 minutes) for Remix startup
- **API Service**: Increased `startPeriod` to 120s (2 minutes) for Django
- Increased timeout from 5s to 10s
- Better health check codes (200-399 for web, 200-299 for API)

### 3. ECS Service Configuration
- **Circuit Breaker**: Enabled with automatic rollback on failed deployments
- **Deployment Strategy**: Zero-downtime (minHealthyPercent: 100, maxHealthyPercent: 200)
- **Health Check Grace Period**: 180s for web, 120s for API
- **Platform Version**: Using LATEST for all features

### 4. Auto-Scaling
- Dual-metric scaling: CPU (70%) and Memory (80%)
- Longer scale-in cooldown (5 minutes) to prevent thrashing
- Shorter scale-out cooldown (1 minute) for quick response

### 5. Logging & Monitoring
- **Container Insights**: Enabled for all environments
- **Log Retention**: 1 month for production, 1 week for development
- **Removal Policy**: RETAIN for production logs, DESTROY for dev

### 6. Target Group Improvements
- **Sticky Sessions**: Enabled for web service (1-day cookie duration)
- Better timeout configuration

## Deployment Steps

### Prerequisites
1. Ensure AWS CLI is configured with proper credentials
2. Node.js and npm/pnpm installed
3. Docker installed for building images
4. CDK CLI installed: `npm install -g aws-cdk`

### Step 1: Build and Push Docker Images

For the web service, ensure you build with the correct API URL:

```bash
# Development
cd /Users/debor/Documents/sistemas/talentbase-v1
docker build -f packages/web/Dockerfile \
  --build-arg VITE_API_URL=https://api-dev.salesdog.click \
  --build-arg NODE_ENV=production \
  --target production \
  -t 258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-web:latest \
  .

# Production
docker build -f packages/web/Dockerfile \
  --build-arg VITE_API_URL=https://api.salesdog.click \
  --build-arg NODE_ENV=production \
  --target production \
  -t 258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-web:latest \
  .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 258993895334.dkr.ecr.us-east-1.amazonaws.com
docker push 258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-web:latest
```

### Step 2: Deploy Infrastructure

```bash
cd infrastructure

# Install dependencies
npm install

# Bootstrap CDK (first time only)
cdk bootstrap aws://258993895334/us-east-1

# Deploy development environment
cdk deploy TalentBaseDev-ApplicationStack --require-approval never

# Deploy production environment
cdk deploy TalentBaseProd-ApplicationStack --require-approval never
```

### Step 3: Verify Secrets Creation

After deployment, verify the secrets were created:

```bash
# Development
aws secretsmanager get-secret-value \
  --secret-id talentbase-dev/web/session-secret \
  --region us-east-1

# Production
aws secretsmanager get-secret-value \
  --secret-id talentbase-prod/web/session-secret \
  --region us-east-1
```

### Step 4: Monitor Deployment

```bash
# Watch ECS service deployment
aws ecs describe-services \
  --cluster talentbase-dev \
  --services talentbase-web-dev \
  --region us-east-1

# Check CloudWatch logs
aws logs tail /ecs/talentbase-web-dev --follow
```

### Step 5: Verify Health Checks

After deployment completes (wait ~3-5 minutes for web service to stabilize):

```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <WEB_TARGET_GROUP_ARN> \
  --region us-east-1

# Test endpoints
curl -I https://dev.salesdog.click
curl -I https://api-dev.salesdog.click/health/
```

## Rollback Procedure

If deployment fails, the circuit breaker will automatically rollback. To manually rollback:

```bash
# Rollback infrastructure
cdk deploy TalentBaseDev-ApplicationStack --previous-parameters

# Or update service to previous task definition
aws ecs update-service \
  --cluster talentbase-dev \
  --service talentbase-web-dev \
  --task-definition <PREVIOUS_TASK_DEF_ARN> \
  --region us-east-1
```

## Monitoring & Troubleshooting

### CloudWatch Dashboards

Access Container Insights:
- Go to CloudWatch > Container Insights
- Select cluster: `talentbase-dev` or `talentbase-prod`

### Common Issues

#### 1. Health Check Failures
**Symptom**: Tasks starting and stopping repeatedly

**Solutions**:
- Check CloudWatch logs: `aws logs tail /ecs/talentbase-web-dev --follow`
- Verify environment variables are set correctly
- Ensure SESSION_SECRET is accessible
- Check network connectivity (security groups)

#### 2. Secrets Access Denied
**Symptom**: Task fails with permission errors

**Solutions**:
- Verify IAM execution role has `secretsmanager:GetSecretValue` permission
- Check secret ARN matches the one in code
- Ensure secret is in the same region

#### 3. Slow Startup Times
**Symptom**: Tasks take longer than 3 minutes to become healthy

**Solutions**:
- Increase `startPeriod` in health check configuration
- Check for slow dependencies (database connections, etc.)
- Review application startup logs

### Useful Commands

```bash
# View ECS service events
aws ecs describe-services \
  --cluster talentbase-dev \
  --services talentbase-web-dev \
  --query 'services[0].events[:10]'

# Execute command in running container
aws ecs execute-command \
  --cluster talentbase-dev \
  --task <TASK_ID> \
  --container WebContainer \
  --interactive \
  --command "/bin/sh"

# View current task definition
aws ecs describe-task-definition \
  --task-definition talentbase-web-dev

# Update secret value (if needed)
aws secretsmanager update-secret \
  --secret-id talentbase-dev/web/session-secret \
  --secret-string '{"SESSION_SECRET":"new-value-here"}'
```

## Security Best Practices Applied

1. **Least Privilege IAM**: Execution and task roles have minimal permissions
2. **Secrets Rotation**: Infrastructure supports rotation (configure separately)
3. **HTTPS Only**: All traffic redirected to HTTPS with TLS 1.2+
4. **Private Subnets**: ECS tasks run in private subnets
5. **Encrypted at Rest**: All secrets encrypted with AWS KMS
6. **Encrypted in Transit**: TLS for all connections

## Performance Optimizations

1. **Auto-Scaling**: Dual-metric (CPU + Memory) for responsive scaling
2. **Sticky Sessions**: Reduces session overhead for web service
3. **HTTP/2**: Enabled on ALB for better performance
4. **Connection Draining**: 30-second deregistration delay
5. **Container Insights**: Detailed metrics for performance tuning

## Cost Optimization

1. **Right-Sized Tasks**: 512 CPU / 1024 MB for dev (adjust per metrics)
2. **Log Retention**: Shorter retention in dev, longer in prod
3. **Conditional Features**: Production features only when needed
4. **Auto-Scaling**: Scales down during low usage

## Next Steps

1. **Enable Secrets Rotation**: Set up automatic rotation for SESSION_SECRET
2. **CloudWatch Alarms**: Create alarms for CPU, Memory, and Health Check failures
3. **X-Ray Tracing**: Enable AWS X-Ray for distributed tracing
4. **WAF**: Add AWS WAF for application-level protection
5. **Backup Strategy**: Implement automated backups for RDS and configurations

## Support

For issues or questions:
- Check CloudWatch Logs first
- Review ECS service events
- Consult AWS documentation
- Contact DevOps team

## References

- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [ECS Health Checks](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_healthcheck)
- [Auto Scaling for ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html)
