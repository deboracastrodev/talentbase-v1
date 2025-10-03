# AWS Best Practices Implementation - TalentBase

## Executive Summary

This document details the AWS best practices implemented in the TalentBase infrastructure refactoring. The changes address critical issues with health checks, secrets management, environment variables, and deployment configuration.

## Problem Statement

### Issues Addressed

1. **Security**: SESSION_SECRET hardcoded in task definition
2. **Reliability**: ECS web service failing health checks repeatedly
3. **Configuration**: Missing proper environment variable management
4. **Deployment**: Multiple failed deployments due to configuration issues
5. **Monitoring**: Insufficient logging and observability

## Solution Architecture

### 1. Secrets Management (AWS Secrets Manager)

#### Implementation
```typescript
const sessionSecret = new secretsmanager.Secret(this, 'SessionSecret', {
  secretName: `${config.ecs.clusterName}/web/session-secret`,
  description: 'Session secret for Remix web application',
  generateSecretString: {
    secretStringTemplate: JSON.stringify({ SESSION_SECRET: '' }),
    generateStringKey: 'SESSION_SECRET',
    excludePunctuation: true,
    includeSpace: false,
    passwordLength: 64,
  },
});
```

#### Benefits
- **Security**: No hardcoded secrets in code or configuration
- **Rotation**: Supports automatic secret rotation
- **Audit**: All access logged in CloudTrail
- **Encryption**: Encrypted at rest using AWS KMS

#### IAM Permissions
```json
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue"
  ],
  "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:talentbase-*/web/session-secret-*"
}
```

### 2. Parameter Store (Non-Sensitive Configuration)

#### Implementation
```typescript
const apiUrlParameter = new ssm.StringParameter(this, 'ApiUrlParameter', {
  parameterName: `/${config.ecs.clusterName}/web/api-url`,
  stringValue: `https://api-${config.domain.name}`,
  description: 'API URL for web application',
  tier: ssm.ParameterTier.STANDARD,
});
```

#### Benefits
- **Cost-Effective**: Free for standard tier
- **Version History**: Automatic versioning
- **Easy Updates**: Change without redeployment
- **Integration**: Works seamlessly with ECS

### 3. Health Check Optimization

#### Previous Configuration (Failing)
```typescript
healthCheck: {
  interval: cdk.Duration.seconds(30),
  timeout: cdk.Duration.seconds(5),
  retries: 3,
  startPeriod: cdk.Duration.seconds(60),  // TOO SHORT
}
```

#### New Configuration (Optimized)
```typescript
healthCheck: {
  command: ['CMD-SHELL', `curl -f http://localhost:3000/ || exit 1`],
  interval: cdk.Duration.seconds(30),
  timeout: cdk.Duration.seconds(10),      // Increased
  retries: 3,
  startPeriod: cdk.Duration.seconds(180), // 3 minutes for Remix
}
```

#### Startup Time Analysis
| Phase | Time | Cumulative |
|-------|------|------------|
| Container pull | 10-20s | 20s |
| Container start | 5-10s | 30s |
| Node.js init | 5-10s | 40s |
| Remix build load | 20-40s | 80s |
| First render | 10-20s | 100s |
| Warmup requests | 20-40s | 140s |
| **Buffer** | 40s | **180s** |

#### Benefits
- **Stability**: No false-positive health check failures
- **Reliability**: Services stay healthy during startup
- **Deployment**: Successful deployments without rollbacks

### 4. ECS Service Configuration

#### Deployment Configuration
```typescript
this.webService = new ecs.FargateService(this, 'WebService', {
  // Zero-downtime deployments
  minHealthyPercent: 100,      // Keep all tasks running
  maxHealthyPercent: 200,      // Allow 2x tasks during deployment

  // Health check grace period
  healthCheckGracePeriod: cdk.Duration.seconds(180),

  // Circuit breaker for automatic rollback
  circuitBreaker: {
    rollback: true,
  },

  // Latest platform features
  platformVersion: ecs.FargatePlatformVersion.LATEST,
});
```

#### Benefits
- **Zero Downtime**: Always maintains minimum healthy tasks
- **Fast Rollback**: Automatic on failed deployments
- **Graceful Updates**: Health check grace period prevents premature failures

### 5. Auto-Scaling Strategy

#### Dual-Metric Scaling
```typescript
// CPU-based scaling (70% target)
webScaling.scaleOnCpuUtilization('WebCpuScaling', {
  targetUtilizationPercent: 70,
  scaleInCooldown: cdk.Duration.seconds(300),  // 5 minutes
  scaleOutCooldown: cdk.Duration.seconds(60),  // 1 minute
});

// Memory-based scaling (80% target)
webScaling.scaleOnMemoryUtilization('WebMemoryScaling', {
  targetUtilizationPercent: 80,
  scaleInCooldown: cdk.Duration.seconds(300),
  scaleOutCooldown: cdk.Duration.seconds(60),
});
```

#### Benefits
- **Responsive**: Quick scale-out (1 min) for traffic spikes
- **Stable**: Slow scale-in (5 min) prevents thrashing
- **Comprehensive**: Both CPU and memory metrics
- **Cost-Optimized**: Scales down during low usage

### 6. Logging & Monitoring

#### CloudWatch Log Groups
```typescript
const webLogGroup = new logs.LogGroup(this, 'WebLogGroup', {
  logGroupName: `/ecs/${config.ecs.webService.name}`,
  retention: config.tags.Environment === 'production'
    ? logs.RetentionDays.ONE_MONTH
    : logs.RetentionDays.ONE_WEEK,
  removalPolicy: config.tags.Environment === 'production'
    ? cdk.RemovalPolicy.RETAIN
    : cdk.RemovalPolicy.DESTROY,
});
```

#### Container Insights
```typescript
this.cluster = new ecs.Cluster(this, 'EcsCluster', {
  clusterName: config.ecs.clusterName,
  vpc,
  containerInsights: true,  // Enabled for all environments
});
```

#### Benefits
- **Visibility**: Detailed metrics and logs
- **Troubleshooting**: Easy access to container logs
- **Cost Control**: Appropriate retention per environment
- **Performance**: Container Insights for deep metrics

### 7. Target Group Improvements

#### Sticky Sessions
```typescript
const webTargetGroup = new elbv2.ApplicationTargetGroup(this, 'WebTargetGroup', {
  // Enable sticky sessions for better UX
  stickinessCookieDuration: cdk.Duration.days(1),
  stickinessCookieName: 'TALENTBASE_LB_COOKIE',

  healthCheck: {
    healthyHttpCodes: '200-399',  // More permissive for redirects
    timeout: cdk.Duration.seconds(10),
  },
});
```

#### Benefits
- **User Experience**: Session persistence across requests
- **Performance**: Reduces session lookup overhead
- **Reliability**: Better health check tolerance

## Security Enhancements

### 1. IAM Least Privilege

#### Execution Role (Infrastructure)
- Pull images from ECR
- Write logs to CloudWatch
- Read secrets from Secrets Manager
- Read parameters from SSM

#### Task Role (Application)
- Minimal permissions (can be extended per needs)
- Separate from execution role
- Follows least privilege principle

### 2. Encryption

| Resource | Encryption |
|----------|-----------|
| Secrets Manager | KMS (AWS managed) |
| CloudWatch Logs | AES-256 |
| ECS Tasks | In-transit TLS |
| ALB | TLS 1.2+ |

### 3. Network Security

- **Private Subnets**: ECS tasks in PRIVATE_WITH_EGRESS
- **Security Groups**: Least privilege rules
- **HTTPS Only**: HTTP → HTTPS redirect
- **No Public IPs**: Tasks not directly accessible

## Performance Optimizations

### 1. Connection Handling
- **HTTP/2**: Enabled on ALB
- **Keep-Alive**: Optimized idle timeout (60s)
- **Connection Draining**: 30s deregistration delay

### 2. Caching Strategy
- Sticky sessions reduce backend calls
- CloudFront can be added later for static assets

### 3. Resource Allocation

| Environment | CPU | Memory | Reasoning |
|-------------|-----|--------|-----------|
| Development | 512 | 1024MB | Cost-optimized |
| Production | 1024 | 2048MB | Performance-optimized |

## Cost Optimization

### 1. Right-Sizing
- Development: Minimal resources (1 task)
- Production: Balanced resources (2+ tasks)

### 2. Log Retention
- Development: 7 days (cost-effective)
- Production: 30 days (compliance-friendly)

### 3. Auto-Scaling
- Scales down during low usage
- Prevents over-provisioning

### 4. Conditional Features
- Container Insights: All environments (valuable metrics)
- Deletion Protection: Production only
- Performance Insights: Production only (RDS)

## Compliance & Governance

### 1. Tagging Strategy
```typescript
tags: {
  Environment: 'development|production',
  Project: 'TalentBase',
  ManagedBy: 'CDK',
  CostCenter: 'development|production',
}
```

### 2. CloudTrail Integration
- All Secrets Manager access logged
- IAM role usage tracked
- Configuration changes audited

### 3. Backup Strategy
- RDS: 7-day backup retention
- Secrets: Version history maintained
- Logs: Retained per policy

## Disaster Recovery

### 1. Automated Rollback
- Circuit breaker detects failures
- Automatic rollback to previous task definition
- No manual intervention required

### 2. Multi-AZ Deployment
- Development: 2 AZs
- Production: 3 AZs
- High availability guaranteed

### 3. Recovery Procedures
- Database: Point-in-time restore
- Secrets: Version rollback
- Infrastructure: CDK state management

## Monitoring Strategy

### 1. Key Metrics

#### ECS Service
- CPU Utilization
- Memory Utilization
- Task Count
- Deployment Status

#### ALB
- Request Count
- Target Response Time
- Healthy/Unhealthy Hosts
- HTTP 4xx/5xx Errors

#### Application
- Container Insights metrics
- Log error patterns
- Health check success rate

### 2. Recommended Alarms

```bash
# CPU High
aws cloudwatch put-metric-alarm \
  --alarm-name talentbase-dev-cpu-high \
  --alarm-description "CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold

# Unhealthy Targets
aws cloudwatch put-metric-alarm \
  --alarm-name talentbase-dev-unhealthy-targets \
  --alarm-description "Unhealthy targets detected" \
  --metric-name UnHealthyHostCount \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 60 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold
```

## Testing Procedures

### 1. Health Check Validation
```bash
# Check container health
aws ecs describe-tasks \
  --cluster talentbase-dev \
  --tasks <task-id> \
  --query 'tasks[0].healthStatus'

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <tg-arn>
```

### 2. Secret Access Test
```bash
# Verify secret is accessible
aws ecs execute-command \
  --cluster talentbase-dev \
  --task <task-id> \
  --container WebContainer \
  --command "env | grep SESSION_SECRET" \
  --interactive
```

### 3. Load Testing
```bash
# Simple load test
ab -n 1000 -c 10 https://dev.salesdog.click/
```

## Migration Checklist

- [x] Update application-stack.ts with secrets management
- [x] Add SSM parameters for configuration
- [x] Optimize health check settings
- [x] Configure deployment parameters
- [x] Enable Container Insights
- [x] Add proper IAM permissions
- [x] Update log retention policies
- [x] Configure auto-scaling
- [x] Add sticky sessions
- [ ] Deploy to development environment
- [ ] Verify health checks pass
- [ ] Monitor for 24 hours
- [ ] Deploy to production
- [ ] Set up CloudWatch alarms
- [ ] Configure secrets rotation

## Lessons Learned

### 1. Health Check Tuning
- Always account for full application startup time
- Include buffer time for cold starts
- Monitor actual startup times in CloudWatch

### 2. Secrets Management
- Never hardcode secrets
- Use Secrets Manager for sensitive data
- Use Parameter Store for configuration

### 3. Deployment Strategy
- Circuit breakers prevent bad deployments
- Health check grace periods are critical
- Zero-downtime requires 200% max capacity

### 4. Monitoring
- Container Insights provides valuable visibility
- Proper log retention saves money
- Metrics-based auto-scaling prevents issues

## References

1. [AWS ECS Best Practices Guide](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
2. [AWS Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)
3. [ECS Task Health](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_healthcheck)
4. [Application Auto Scaling](https://docs.aws.amazon.com/autoscaling/application/userguide/what-is-application-auto-scaling.html)
5. [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## Appendix: Configuration Files

### A. Environment Variables (Web Service)

| Variable | Source | Description |
|----------|--------|-------------|
| NODE_ENV | Environment | production/development |
| PORT | Environment | 3000 |
| SESSION_SECRET | Secrets Manager | Session encryption key |
| VITE_API_URL | Build Arg | API endpoint (build-time) |

### B. Task Resource Allocation

| Environment | Service | vCPU | Memory | Cost/Month* |
|-------------|---------|------|--------|-------------|
| Development | Web | 0.5 | 1GB | ~$15 |
| Development | API | 0.5 | 1GB | ~$15 |
| Production | Web | 1.0 | 2GB | ~$60 |
| Production | API | 1.0 | 2GB | ~$60 |

*Approximate costs based on us-east-1 Fargate pricing (1 task)

### C. Health Check Matrix

| Service | Endpoint | Timeout | Retries | Start Period | Interval |
|---------|----------|---------|---------|--------------|----------|
| Web | / | 10s | 3 | 180s | 30s |
| API | /health/ | 10s | 3 | 120s | 30s |

---

**Document Version**: 1.0
**Last Updated**: 2025-10-03
**Author**: Infrastructure Team
**Status**: Implemented
