# GitHub Secrets Configuration

## Required Secrets

Configure the following secrets in GitHub repository settings (`Settings > Secrets and variables > Actions`):

### AWS Credentials

1. **AWS_ACCESS_KEY_ID**
   - AWS IAM access key ID for deployment
   - Required for: ECR push, ECS updates

2. **AWS_SECRET_ACCESS_KEY**
   - AWS IAM secret access key for deployment
   - Required for: ECR push, ECS updates

3. **AWS_ACCOUNT_ID**
   - Your AWS account ID (12 digits)
   - Used to construct ECR registry URL: `{AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com`

## IAM Permissions Required

The IAM user/role must have the following permissions:

### ECR (Elastic Container Registry)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```

### ECS (Elastic Container Service)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeTasks",
        "ecs:ListTasks"
      ],
      "Resource": "*"
    }
  ]
}
```

### CloudWatch Logs
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## Setup Instructions

1. Create IAM user in AWS Console
2. Attach the policies above
3. Generate access keys
4. Add secrets to GitHub:
   - Go to repository Settings
   - Navigate to Secrets and variables > Actions
   - Click "New repository secret"
   - Add each secret with exact names listed above

## Security Best Practices

- ✅ Never commit credentials to code
- ✅ Use least privilege principle for IAM permissions
- ✅ Rotate access keys regularly
- ✅ Enable MFA for IAM users with deployment permissions
- ✅ Monitor CloudTrail for deployment activities
