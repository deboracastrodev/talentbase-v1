# Email System Deployment Guide

**Story 2.7: Email Notification System**

This guide covers deploying the email notification system to AWS for both development and production environments.

---

## 📋 Overview

The email system uses:
- **Service**: SendGrid SMTP
- **Secrets Management**: AWS Secrets Manager
- **Async Processing**: Celery + Redis
- **Templates**: HTML + Plain Text multipart emails
- **Environments**: `dev.salesdog.click` (development) and `salesdog.click` (production/homologation)

---

## 🔐 Prerequisites

### 1. SendGrid Configuration (Already Completed ✅)

- **Domain Authentication**: `em943.salesdog.click` (verified)
- **Link Branding**: `url4769.salesdog.click` (verified)
- **API Key**: `SG.xxxxxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy` (stored in AWS Secrets Manager)
- **From Email**: `noreply@salesdog.click`

DNS records already added to Route 53:
```
MX:    em943.salesdog.click → mx.sendgrid.net (priority 10)
TXT:   em943.salesdog.click → SPF record
TXT:   m1._domainkey.salesdog.click → DKIM key
TXT:   _dmarc.salesdog.click → DMARC policy
CNAME: url4769.salesdog.click → sendgrid.net
CNAME: 56616386.salesdog.click → sendgrid.net
```

### 2. AWS Credentials

Ensure you have AWS credentials configured:
```bash
aws sts get-caller-identity
```

---

## 🚀 Deployment Steps

### Step 1: Deploy SecretsStack to AWS

The SecretsStack creates three secrets in AWS Secrets Manager:

1. **Django Secret Key** - Auto-generated 50-character key
2. **Field Encryption Key** - Auto-generated 44-character Fernet key
3. **SendGrid API Key** - Placeholder (to be updated manually)

Deploy to development:
```bash
cd infrastructure
npm run deploy:dev
```

This will create the stack: `talentbase-dev-secrets`

Deploy to production:
```bash
npm run deploy:prod
```

This will create the stack: `talentbase-prod-secrets`

### Step 2: Update SendGrid API Key Secret

After the SecretsStack is deployed, the SendGrid secret has a placeholder value. Update it with the real API key:

**For Development:**
```bash
aws secretsmanager update-secret \
  --secret-id talentbase/dev/sendgrid-api-key \
  --secret-string 'YOUR_SENDGRID_API_KEY_HERE'
```

**For Production:**
```bash
aws secretsmanager update-secret \
  --secret-id talentbase/production/sendgrid-api-key \
  --secret-string 'YOUR_SENDGRID_API_KEY_HERE'
```

### Step 3: Verify Secrets

**Check all secrets are created:**
```bash
# Development
aws secretsmanager list-secrets --filters Key=name,Values=talentbase/dev

# Production
aws secretsmanager list-secrets --filters Key=name,Values=talentbase/production
```

**Verify SendGrid secret value (development):**
```bash
aws secretsmanager get-secret-value \
  --secret-id talentbase/dev/sendgrid-api-key \
  --query SecretString \
  --output text
```

### Step 4: Deploy ApplicationStack

The ApplicationStack has been updated to:
- Accept the three secrets from SecretsStack
- Grant ECS execution role read access to secrets
- Wire secrets to API container environment variables
- Add `EMAIL_PROVIDER=sendgrid` and `DEFAULT_FROM_EMAIL=noreply@salesdog.click`

Deploy updated ApplicationStack:

**Development:**
```bash
cd infrastructure
npm run deploy:dev
```

This will update: `talentbase-dev-application`

**Production:**
```bash
npm run deploy:prod
```

This will update: `talentbase-prod-application`

### Step 5: Verify ECS Task Environment

After deployment, verify the API container has the correct environment variables:

```bash
# Get ECS task ARN
TASK_ARN=$(aws ecs list-tasks \
  --cluster talentbase-dev-cluster \
  --service-name talentbase-dev-api \
  --query 'taskArns[0]' \
  --output text)

# Describe task to see environment
aws ecs describe-tasks \
  --cluster talentbase-dev-cluster \
  --tasks $TASK_ARN \
  --query 'tasks[0].containers[0].environment'
```

Expected environment variables:
```json
{
  "EMAIL_PROVIDER": "sendgrid",
  "DEFAULT_FROM_EMAIL": "noreply@salesdog.click"
}
```

Expected secrets (ARNs):
```json
{
  "SENDGRID_API_KEY": "arn:aws:secretsmanager:...:secret:talentbase/dev/sendgrid-api-key-...",
  "DJANGO_SECRET_KEY": "arn:aws:secretsmanager:...:secret:talentbase/dev/django-secret-key-...",
  "FIELD_ENCRYPTION_KEY": "arn:aws:secretsmanager:...:secret:talentbase/dev/field-encryption-key-..."
}
```

### Step 6: Force New Deployment

Force ECS to pull new task definition and restart containers:

```bash
# Development
aws ecs update-service \
  --cluster talentbase-dev-cluster \
  --service talentbase-dev-api \
  --force-new-deployment

# Production
aws ecs update-service \
  --cluster talentbase-prod-cluster \
  --service talentbase-prod-api \
  --force-new-deployment
```

Monitor deployment:
```bash
# Development
watch aws ecs describe-services \
  --cluster talentbase-dev-cluster \
  --services talentbase-dev-api \
  --query 'services[0].deployments'
```

---

## ✅ Verification

### 1. Check API Logs

Monitor CloudWatch logs for email sending:

```bash
# Development
aws logs tail /ecs/talentbase-dev-api --follow

# Look for:
# "Email sent successfully: candidate_registration to user@example.com"
```

### 2. Test Email Sending

Trigger a candidate registration to test email:

```bash
curl -X POST https://api-dev.salesdog.click/api/v1/auth/register/candidate/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "full_name": "Test User"
  }'
```

Check the user's inbox for the welcome email.

### 3. Check EmailLog Model

Access Django admin or shell to verify EmailLog entries:

```bash
# Connect to ECS task
aws ecs execute-command \
  --cluster talentbase-dev-cluster \
  --task <TASK_ID> \
  --container ApiContainer \
  --command "/bin/bash" \
  --interactive

# Inside container
python manage.py shell
from core.models import EmailLog
EmailLog.objects.filter(status='sent').count()
EmailLog.objects.latest('created_at')
```

---

## 🔧 Troubleshooting

### Issue: Email not sending

**Check 1: Verify secret value**
```bash
aws secretsmanager get-secret-value --secret-id talentbase/dev/sendgrid-api-key
```

**Check 2: Check CloudWatch logs for errors**
```bash
aws logs tail /ecs/talentbase-dev-api --since 10m
```

Common errors:
- `Authentication failed` → Wrong API key
- `Connection refused` → Network/security group issue
- `Template not found` → Missing email templates in Docker image

**Check 3: Test SendGrid API key directly**
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "noreply@salesdog.click"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'
```

### Issue: Secrets not accessible by ECS

**Check execution role permissions:**
```bash
# Get execution role ARN from task definition
aws ecs describe-task-definition \
  --task-definition talentbase-dev-api \
  --query 'taskDefinition.executionRoleArn'

# Check attached policies
aws iam list-attached-role-policies --role-name <ROLE_NAME>
```

The execution role should have `SecretsManagerReadWrite` or custom policy granting:
- `secretsmanager:GetSecretValue`
- `secretsmanager:DescribeSecret`

### Issue: Environment variables not set

Verify task definition:
```bash
aws ecs describe-task-definition \
  --task-definition talentbase-dev-api \
  --query 'taskDefinition.containerDefinitions[0].environment'
```

---

## 📊 Monitoring

### CloudWatch Metrics

Monitor these metrics in CloudWatch:
1. **Email Send Rate**: Custom metric from EmailLog model
2. **Email Failure Rate**: Count of failed status
3. **Celery Task Duration**: Time to send email

### Email Logs Dashboard

Access Django admin to view email logs:
- URL: `https://api-dev.salesdog.click/admin/core/emaillog/`
- Filter by status: sent, failed, pending, skipped
- Check error messages for failures

### SendGrid Dashboard

Monitor sending in SendGrid:
- URL: https://app.sendgrid.com/stats/overview
- Check: Delivered, Bounces, Spam Reports

---

## 🔒 Security Notes

1. **API Key Rotation**: Rotate SendGrid API key every 90 days
   - Generate new key in SendGrid
   - Update AWS Secrets Manager
   - Force ECS deployment

2. **Secrets Access**: Only ECS execution role has read access to secrets

3. **Email Rate Limiting**: SendGrid free tier allows 100 emails/day
   - Monitor usage in SendGrid dashboard
   - Consider upgrading plan for production

4. **Email Content**: Never log email content or recipient details in CloudWatch

---

## 📚 Related Documentation

- [Story 2.7 Specification](../stories/story-2.7.md)
- [Email Testing with MailHog](EMAIL_TESTING.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Tech Spec Epic 2](../epics/tech-spec-epic-2.md)

---

## 🎯 Summary

**What was deployed:**
- ✅ SecretsStack with Django, Field Encryption, and SendGrid secrets
- ✅ ApplicationStack updated to use secrets
- ✅ API container configured with EMAIL_PROVIDER and DEFAULT_FROM_EMAIL
- ✅ ECS task has access to all required secrets

**Environments:**
- **Development**: `dev.salesdog.click` → `talentbase-dev-*` stacks
- **Production**: `salesdog.click` → `talentbase-prod-*` stacks

**Email Templates Available:**
1. Candidate Registration (`candidate_registration.html/.txt`)
2. Company Registration Submitted (`company_registration_submitted.html/.txt`)
3. Company Approved (`company_approved.html/.txt`)
4. Company Rejected (`company_rejected.html/.txt`)

All emails sent asynchronously via Celery with retry logic and EmailLog tracking.
