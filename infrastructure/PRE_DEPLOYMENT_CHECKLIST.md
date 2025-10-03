# Pre-Deployment Checklist - TalentBase Infrastructure Refactoring

## 🎯 Objective
Deploy refactored AWS infrastructure with best practices for secrets management, health checks, and deployment reliability.

## 📋 Pre-Deployment Checklist

### 1. Environment Preparation

#### Local Environment
- [ ] AWS CLI installed and configured
  ```bash
  aws --version
  aws sts get-caller-identity
  ```
- [ ] AWS CDK CLI installed (v2.x)
  ```bash
  cdk --version
  ```
- [ ] Node.js 18+ installed
  ```bash
  node --version
  ```
- [ ] Git repository up to date
  ```bash
  git pull origin develop
  ```

#### AWS Account Verification
- [ ] Correct AWS account (258993895334)
- [ ] Correct region (us-east-1)
- [ ] Sufficient permissions (AdministratorAccess or equivalent)
- [ ] CDK bootstrapped
  ```bash
  cdk bootstrap aws://258993895334/us-east-1
  ```

### 2. Code Review

#### Infrastructure Code
- [ ] `application-stack.ts` changes reviewed
- [ ] No hardcoded secrets remain
- [ ] Health check timings appropriate
- [ ] IAM permissions are least privilege
- [ ] Auto-scaling configuration reviewed

#### Configuration
- [ ] Development config verified
- [ ] Production config verified
- [ ] Domain names correct
- [ ] Certificate ARNs valid

#### Build Verification
- [ ] Code compiles successfully
  ```bash
  cd infrastructure && npm run build
  ```
- [ ] No TypeScript errors
- [ ] CDK synth succeeds
  ```bash
  cdk synth TalentBaseDev-ApplicationStack
  ```

### 3. Docker Images

#### Web Service Image
- [ ] Latest image built with correct VITE_API_URL
  ```bash
  # Development
  docker build -f packages/web/Dockerfile \
    --build-arg VITE_API_URL=https://api-dev.salesdog.click \
    --build-arg NODE_ENV=production \
    --target production \
    -t 258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-web:latest \
    .
  ```
- [ ] Image pushed to ECR
  ```bash
  aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    258993895334.dkr.ecr.us-east-1.amazonaws.com

  docker push 258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-web:latest
  ```
- [ ] Image tested locally
  ```bash
  docker run -p 3000:3000 \
    -e SESSION_SECRET=test-secret-key \
    258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-web:latest
  ```

#### API Service Image
- [ ] Latest image exists in ECR
- [ ] Health check endpoint works (`/health/`)

### 4. Backup & Recovery

#### Current State Documentation
- [ ] Current task definition ARNs recorded
  ```bash
  aws ecs describe-services \
    --cluster talentbase-dev \
    --services talentbase-web-dev \
    --query 'services[0].taskDefinition'
  ```
- [ ] Current service configuration exported
- [ ] Current environment variables documented

#### Rollback Plan
- [ ] Rollback procedure documented
- [ ] Previous git commit hash noted
- [ ] Team notified of deployment window

### 5. Dependencies Check

#### Existing Infrastructure
- [ ] Networking stack healthy
  ```bash
  aws cloudformation describe-stacks \
    --stack-name TalentBaseDev-NetworkingStack \
    --query 'Stacks[0].StackStatus'
  ```
- [ ] Database stack healthy
  ```bash
  aws cloudformation describe-stacks \
    --stack-name TalentBaseDev-DatabaseStack \
    --query 'Stacks[0].StackStatus'
  ```
- [ ] RDS instance accessible
- [ ] Redis cluster accessible

#### ECR Repositories
- [ ] `talentbase-web` repository exists
- [ ] `talentbase-api` repository exists
- [ ] Latest images tagged

### 6. Secrets & Parameters

#### Secrets Manager
- [ ] Understand that SESSION_SECRET will be auto-created
- [ ] Know how to verify secret creation
  ```bash
  aws secretsmanager describe-secret \
    --secret-id talentbase-dev/web/session-secret
  ```
- [ ] Have script ready for manual creation if needed
  ```bash
  ./scripts/manage-secrets.sh create-session-secret dev
  ```

#### SSM Parameter Store
- [ ] Understand that API_URL parameter will be auto-created
- [ ] Know parameter naming convention

### 7. Monitoring Setup

#### CloudWatch
- [ ] Know log group names
  - `/ecs/talentbase-web-dev`
  - `/ecs/talentbase-api-dev`
- [ ] CloudWatch console access ready
- [ ] Log streaming command ready
  ```bash
  ./scripts/deploy.sh logs dev
  ```

#### ECS Console
- [ ] ECS console bookmarked
- [ ] Know how to view service events
  ```bash
  ./scripts/deploy.sh events dev
  ```

### 8. Team Communication

#### Notifications
- [ ] Team notified of deployment
- [ ] Deployment window scheduled
- [ ] On-call engineer available
- [ ] Stakeholders informed

#### Documentation
- [ ] DEPLOYMENT_GUIDE.md reviewed
- [ ] AWS_BEST_PRACTICES.md reviewed
- [ ] Team has access to documentation

## 🚀 Deployment Steps

### Development Environment

#### Step 1: Pre-Flight Check
```bash
cd /Users/debor/Documents/sistemas/talentbase-v1/infrastructure

# Run prerequisites check
./scripts/deploy.sh deploy dev
```

#### Step 2: Monitor Deployment
```bash
# In another terminal, tail logs
./scripts/deploy.sh logs dev
```

#### Step 3: Verify Deployment
```bash
# Check services
./scripts/deploy.sh verify dev

# Check service events
./scripts/deploy.sh events dev
```

#### Step 4: Functional Testing
```bash
# Test web endpoint
curl -I https://dev.salesdog.click

# Test API endpoint
curl -I https://api-dev.salesdog.click/health/

# Check health check status
aws elbv2 describe-target-health \
  --target-group-arn <from-outputs>
```

#### Step 5: Wait and Monitor
- [ ] Wait 10 minutes minimum
- [ ] Verify tasks stay healthy
- [ ] Check CloudWatch metrics
- [ ] Review logs for errors

### Production Environment

⚠️ **Only proceed if development deployment is successful**

#### Step 1: Pre-Production Checklist
- [ ] Development deployment successful for 24+ hours
- [ ] No errors in development logs
- [ ] Performance metrics acceptable
- [ ] Team approval received

#### Step 2: Production Images
```bash
# Build production image with production API URL
docker build -f packages/web/Dockerfile \
  --build-arg VITE_API_URL=https://api.salesdog.click \
  --build-arg NODE_ENV=production \
  --target production \
  -t 258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-web:latest \
  .

# Push to ECR
docker push 258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-web:latest
```

#### Step 3: Deploy to Production
```bash
# Deploy
./scripts/deploy.sh deploy prod

# Monitor in separate terminal
./scripts/deploy.sh logs prod
```

#### Step 4: Production Verification
```bash
# Verify deployment
./scripts/deploy.sh verify prod

# Test endpoints
curl -I https://www.salesdog.click
curl -I https://api.salesdog.click/health/
```

## 🔍 Post-Deployment Verification

### Immediate Verification (0-10 minutes)

- [ ] All ECS tasks running
  ```bash
  aws ecs describe-services \
    --cluster talentbase-dev \
    --services talentbase-web-dev talentbase-api-dev \
    --query 'services[*].[serviceName,runningCount,desiredCount]'
  ```
- [ ] Health checks passing
  ```bash
  aws elbv2 describe-target-health \
    --target-group-arn <web-tg-arn>
  ```
- [ ] No error logs in CloudWatch
  ```bash
  aws logs tail /ecs/talentbase-web-dev --since 10m
  ```
- [ ] Secrets accessible
  ```bash
  ./scripts/manage-secrets.sh view-secret dev
  ```

### Short-term Verification (10-60 minutes)

- [ ] Tasks remain stable (no restarts)
- [ ] Response times acceptable
- [ ] No 5xx errors
- [ ] Auto-scaling responds correctly
- [ ] Memory/CPU metrics normal

### Long-term Verification (1-24 hours)

- [ ] No unexpected restarts
- [ ] Performance consistent
- [ ] Cost metrics as expected
- [ ] Logs show no errors
- [ ] User reports no issues

## ⚠️ Rollback Triggers

Rollback immediately if:

1. **Critical Failures**
   - [ ] Tasks repeatedly failing health checks
   - [ ] High error rate (>5% 5xx errors)
   - [ ] Complete service outage
   - [ ] Data loss or corruption

2. **Performance Issues**
   - [ ] Response time >10x baseline
   - [ ] Memory leaks detected
   - [ ] CPU consistently >95%

3. **Business Impact**
   - [ ] Users unable to access service
   - [ ] Critical features broken
   - [ ] Security vulnerability introduced

## 🔄 Rollback Procedure

### Automatic Rollback
Circuit breaker will automatically rollback on failed deployments.

### Manual Rollback
```bash
# Option 1: Redeploy previous version
git checkout <previous-commit>
cd infrastructure
cdk deploy TalentBaseDev-ApplicationStack

# Option 2: Update to previous task definition
aws ecs update-service \
  --cluster talentbase-dev \
  --service talentbase-web-dev \
  --task-definition <previous-task-def-arn>
```

## 📊 Success Criteria

### Deployment Success
- [x] Code compiles without errors
- [ ] Deployment completes without errors
- [ ] All tasks reach RUNNING state
- [ ] Health checks pass within 5 minutes
- [ ] No rollbacks triggered

### Functional Success
- [ ] Web UI accessible
- [ ] API endpoints respond
- [ ] Session management works
- [ ] SSL certificates valid
- [ ] Logs flowing correctly

### Performance Success
- [ ] Response time <3s (p95)
- [ ] CPU utilization <70%
- [ ] Memory utilization <80%
- [ ] No memory leaks

### Security Success
- [ ] No hardcoded secrets
- [ ] Secrets encrypted at rest
- [ ] IAM permissions correct
- [ ] HTTPS enforced

## 📝 Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Create CloudWatch alarms
  ```bash
  # Example: CPU high alarm
  aws cloudwatch put-metric-alarm \
    --alarm-name talentbase-dev-cpu-high \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold
  ```
- [ ] Document any issues encountered
- [ ] Update team documentation
- [ ] Send deployment summary to team

### Week 1
- [ ] Review CloudWatch metrics
- [ ] Optimize resource allocation if needed
- [ ] Fine-tune auto-scaling thresholds
- [ ] Schedule production deployment

### Month 1
- [ ] Set up secrets rotation
- [ ] Review costs
- [ ] Performance tuning
- [ ] Document lessons learned

## 🆘 Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| DevOps Lead | TBD | TBD |
| AWS Account Owner | TBD | TBD |
| On-Call Engineer | TBD | TBD |

## 📚 Reference Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [AWS_BEST_PRACTICES.md](./AWS_BEST_PRACTICES.md) - Implementation details
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - What changed
- [scripts/manage-secrets.sh](./scripts/manage-secrets.sh) - Secrets management
- [scripts/deploy.sh](./scripts/deploy.sh) - Deployment automation

---

**Checklist Version**: 1.0
**Last Updated**: 2025-10-03
**Status**: Ready for Use

### Final Sign-Off

- [ ] All checklist items completed
- [ ] Team approval received
- [ ] Deployment window confirmed
- [ ] Ready to deploy

**Approved by**: _________________ **Date**: _________
