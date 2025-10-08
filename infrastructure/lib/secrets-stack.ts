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
  }
}
