import * as cdk from 'aws-cdk-lib';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

/**
 * Secrets Stack - AWS Secrets Manager for sensitive configuration
 * Creates and manages application secrets
 */
export class SecretsStack extends cdk.Stack {
  public readonly djangoSecret: secretsmanager.Secret;
  public readonly fieldEncryptionSecret: secretsmanager.Secret;
  public readonly sendgridApiKey: secretsmanager.Secret;
  public readonly awsS3Credentials: secretsmanager.Secret;

  constructor(
    scope: Construct,
    id: string,
    config: EnvironmentConfig,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Create Django secret key
    this.djangoSecret = new secretsmanager.Secret(this, 'DjangoSecretKey', {
      secretName: `${config.projectName}/${config.tags.Environment}/django-secret-key`,
      description: `Django secret key for ${config.projectName} ${config.tags.Environment}`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'DJANGO_SECRET_KEY',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 50,
      },
    });

    // Create Field Encryption Key (Fernet key for django-encrypted-model-fields)
    this.fieldEncryptionSecret = new secretsmanager.Secret(this, 'FieldEncryptionKey', {
      secretName: `${config.projectName}/${config.tags.Environment}/field-encryption-key`,
      description: `Field encryption key for ${config.projectName} ${config.tags.Environment}`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'FIELD_ENCRYPTION_KEY',
        excludePunctuation: true,
        excludeLowercase: false,
        excludeUppercase: false,
        includeSpace: false,
        requireEachIncludedType: false,
        passwordLength: 44, // Fernet key is 32 bytes base64 encoded = 44 characters
      },
    });

    // Story 2.7: Create SendGrid API Key secret
    this.sendgridApiKey = new secretsmanager.Secret(this, 'SendGridApiKey', {
      secretName: `${config.projectName}/${config.tags.Environment}/sendgrid-api-key`,
      description: `SendGrid API key for ${config.projectName} ${config.tags.Environment}`,
      secretStringValue: cdk.SecretValue.unsafePlainText('PLACEHOLDER'), // Will be updated manually
    });

    // Story 3.1: Create AWS S3 Credentials secret (for profile photo uploads)
    this.awsS3Credentials = new secretsmanager.Secret(this, 'AwsS3Credentials', {
      secretName: `${config.projectName}/${config.tags.Environment}/aws-s3-credentials`,
      description: `AWS S3 credentials for ${config.projectName} ${config.tags.Environment}`,
      secretStringValue: cdk.SecretValue.unsafePlainText(
        JSON.stringify({
          AWS_ACCESS_KEY_ID: 'PLACEHOLDER',
          AWS_SECRET_ACCESS_KEY: 'PLACEHOLDER',
        })
      ),
    });

    // Add tags
    Object.entries(config.tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });

    // Outputs
    new cdk.CfnOutput(this, 'DjangoSecretArn', {
      value: this.djangoSecret.secretArn,
      description: 'Django Secret Key ARN',
      exportName: `${id}-DjangoSecretArn`,
    });

    new cdk.CfnOutput(this, 'FieldEncryptionSecretArn', {
      value: this.fieldEncryptionSecret.secretArn,
      description: 'Field Encryption Key ARN',
      exportName: `${id}-FieldEncryptionSecretArn`,
    });

    new cdk.CfnOutput(this, 'SendGridApiKeyArn', {
      value: this.sendgridApiKey.secretArn,
      description: 'SendGrid API Key ARN',
      exportName: `${id}-SendGridApiKeyArn`,
    });

    new cdk.CfnOutput(this, 'AwsS3CredentialsArn', {
      value: this.awsS3Credentials.secretArn,
      description: 'AWS S3 Credentials ARN',
      exportName: `${id}-AwsS3CredentialsArn`,
    });
  }
}
