import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

/**
 * Application Stack - Combines ALB, ECS, and DNS configuration
 * All resources in a single stack to avoid circular dependencies
 */
export class ApplicationStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly webService: ecs.FargateService;
  public readonly apiService: ecs.FargateService;
  public readonly alb: elbv2.ApplicationLoadBalancer;

  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    albSecurityGroup: ec2.SecurityGroup,
    ecsSecurityGroup: ec2.SecurityGroup,
    rdsSecret: secretsmanager.ISecret,
    config: EnvironmentConfig,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // ===== SECRETS & PARAMETERS =====
    // Use existing SESSION_SECRET from Secrets Manager
    // Using fromSecretCompleteArn to avoid permission issues with ECS
    const sessionSecret = secretsmanager.Secret.fromSecretCompleteArn(
      this,
      'SessionSecret',
      'arn:aws:secretsmanager:us-east-1:258993895334:secret:talentbase-dev/web/session-secret-6IZlMN'
    );

    // Store non-sensitive config in SSM Parameter Store
    const apiUrlParameter = new ssm.StringParameter(this, 'ApiUrlParameter', {
      parameterName: `/${config.ecs.clusterName}/web/api-url`,
      stringValue: `https://api-${config.domain.name}`,
      description: 'API URL for web application',
      tier: ssm.ParameterTier.STANDARD,
    });

    // ===== PART 1: ALB =====
    this.alb = new elbv2.ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      deletionProtection: config.tags.Environment === 'production',
      http2Enabled: true,
      idleTimeout: cdk.Duration.seconds(60),
    });

    // ===== PART 2: ECS CLUSTER =====
    this.cluster = new ecs.Cluster(this, 'EcsCluster', {
      clusterName: config.ecs.clusterName,
      vpc,
      // Enable Container Insights for better monitoring
      containerInsights: true,
    });

    // Get ECR repositories
    const webRepository = ecr.Repository.fromRepositoryName(
      this,
      'WebRepository',
      config.ecr.webRepository
    );

    const apiRepository = ecr.Repository.fromRepositoryName(
      this,
      'ApiRepository',
      config.ecr.apiRepository
    );

    // Execution Role (for ECS to pull images, logs, secrets)
    const executionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Grant permissions to read secrets and parameters
    sessionSecret.grantRead(executionRole);  // Now this works correctly with fromSecretCompleteArn
    apiUrlParameter.grantRead(executionRole);
    rdsSecret.grantRead(executionRole);

    // Task Role (for application runtime permissions)
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Runtime role for ECS tasks',
    });

    // Grant ECR pull permissions
    webRepository.grantPull(executionRole);
    apiRepository.grantPull(executionRole);

    // Log Groups with proper retention
    const webLogGroup = new logs.LogGroup(this, 'WebLogGroup', {
      logGroupName: `/ecs/${config.ecs.webService.name}`,
      retention: config.tags.Environment === 'production'
        ? logs.RetentionDays.ONE_MONTH
        : logs.RetentionDays.ONE_WEEK,
      removalPolicy: config.tags.Environment === 'production'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    const apiLogGroup = new logs.LogGroup(this, 'ApiLogGroup', {
      logGroupName: `/ecs/${config.ecs.apiService.name}`,
      retention: config.tags.Environment === 'production'
        ? logs.RetentionDays.ONE_MONTH
        : logs.RetentionDays.ONE_WEEK,
      removalPolicy: config.tags.Environment === 'production'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // ===== PART 3: TASK DEFINITIONS =====
    const webTaskDefinition = new ecs.FargateTaskDefinition(this, 'WebTaskDefinition', {
      memoryLimitMiB: config.ecs.webService.memory,
      cpu: config.ecs.webService.cpu,
      executionRole,
      taskRole,
    });

    const webContainer = webTaskDefinition.addContainer('WebContainer', {
      image: ecs.ContainerImage.fromEcrRepository(webRepository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'web',
        logGroup: webLogGroup,
      }),
      portMappings: [
        {
          containerPort: config.ecs.webService.port,
          protocol: ecs.Protocol.TCP,
        },
      ],
      // Runtime environment variables (non-sensitive)
      environment: {
        NODE_ENV: config.tags.Environment === 'production' ? 'production' : 'development',
        PORT: config.ecs.webService.port.toString(),
        // VITE_API_URL is now injected at build time via Docker build args
      },
      // Secrets from AWS Secrets Manager (sensitive data)
      secrets: {
        SESSION_SECRET: ecs.Secret.fromSecretsManager(sessionSecret, 'SESSION_SECRET'),
      },
      // Note: Container health check disabled - using ALB target group health check instead
      // This avoids issues with curl not being installed in the container
    });

    const apiTaskDefinition = new ecs.FargateTaskDefinition(this, 'ApiTaskDefinition', {
      memoryLimitMiB: config.ecs.apiService.memory,
      cpu: config.ecs.apiService.cpu,
      executionRole,
      taskRole,
    });

    const apiContainer = apiTaskDefinition.addContainer('ApiContainer', {
      image: ecs.ContainerImage.fromEcrRepository(apiRepository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'api',
        logGroup: apiLogGroup,
      }),
      portMappings: [
        {
          containerPort: config.ecs.apiService.port,
          protocol: ecs.Protocol.TCP,
        },
      ],
      environment: {
        DJANGO_SETTINGS_MODULE:
          config.tags.Environment === 'production'
            ? 'talentbase.settings.production'
            : 'talentbase.settings.development',
        PORT: config.ecs.apiService.port.toString(),
      },
      // Secrets from AWS Secrets Manager (sensitive data)
      secrets: {
        DB_NAME: ecs.Secret.fromSecretsManager(rdsSecret, 'dbname'),
        DB_USER: ecs.Secret.fromSecretsManager(rdsSecret, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(rdsSecret, 'password'),
        DB_HOST: ecs.Secret.fromSecretsManager(rdsSecret, 'host'),
        DB_PORT: ecs.Secret.fromSecretsManager(rdsSecret, 'port'),
      },
      // Note: Container health check disabled - using ALB target group health check instead
      // This avoids issues with curl not being installed in the container
    });

    // ===== PART 4: TARGET GROUPS =====
    const webTargetGroup = new elbv2.ApplicationTargetGroup(this, 'WebTargetGroup', {
      vpc,
      port: config.ecs.webService.port,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      deregistrationDelay: cdk.Duration.seconds(30),
      healthCheck: {
        path: '/',
        interval: cdk.Duration.seconds(60),
        timeout: cdk.Duration.seconds(30),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 5,
        healthyHttpCodes: '200-399',
      },
      // Enable sticky sessions for better UX
      stickinessCookieDuration: cdk.Duration.days(1),
      stickinessCookieName: 'TALENTBASE_LB_COOKIE',
    });

    const apiTargetGroup = new elbv2.ApplicationTargetGroup(this, 'ApiTargetGroup', {
      vpc,
      port: config.ecs.apiService.port,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      deregistrationDelay: cdk.Duration.seconds(30),
      healthCheck: {
        path: '/ping/',
        interval: cdk.Duration.seconds(60),
        timeout: cdk.Duration.seconds(30),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 5,
        healthyHttpCodes: '200-299',
      },
    });

    // ===== PART 5: ECS SERVICES =====
    this.webService = new ecs.FargateService(this, 'WebService', {
      cluster: this.cluster,
      serviceName: config.ecs.webService.name,
      taskDefinition: webTaskDefinition,
      desiredCount: config.ecs.webService.desiredCount,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      assignPublicIp: false,
      enableExecuteCommand: true,
      // Circuit breaker with rollback for failed deployments
      circuitBreaker: {
        rollback: true,
      },
      // Deployment configuration for zero-downtime updates
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      // Health check grace period - increased to allow for container startup
      healthCheckGracePeriod: cdk.Duration.seconds(300),
      // Platform version for latest features
      platformVersion: ecs.FargatePlatformVersion.LATEST,
    });

    this.apiService = new ecs.FargateService(this, 'ApiService', {
      cluster: this.cluster,
      serviceName: config.ecs.apiService.name,
      taskDefinition: apiTaskDefinition,
      desiredCount: config.ecs.apiService.desiredCount,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      assignPublicIp: false,
      enableExecuteCommand: true,
      // Circuit breaker with rollback for failed deployments
      circuitBreaker: {
        rollback: true,
      },
      // Deployment configuration for zero-downtime updates
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      // Health check grace period - increased to allow for migrations and startup
      healthCheckGracePeriod: cdk.Duration.seconds(300),
      // Platform version for latest features
      platformVersion: ecs.FargatePlatformVersion.LATEST,
    });

    // Attach to target groups
    this.webService.attachToApplicationTargetGroup(webTargetGroup);
    this.apiService.attachToApplicationTargetGroup(apiTargetGroup);

    // ===== PART 6: AUTO-SCALING =====
    const webScaling = this.webService.autoScaleTaskCount({
      minCapacity: config.ecs.webService.minCount,
      maxCapacity: config.ecs.webService.maxCount,
    });

    // CPU-based scaling
    webScaling.scaleOnCpuUtilization('WebCpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(300), // 5 minutes
      scaleOutCooldown: cdk.Duration.seconds(60), // 1 minute
    });

    // Memory-based scaling
    webScaling.scaleOnMemoryUtilization('WebMemoryScaling', {
      targetUtilizationPercent: 80,
      scaleInCooldown: cdk.Duration.seconds(300),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    const apiScaling = this.apiService.autoScaleTaskCount({
      minCapacity: config.ecs.apiService.minCount,
      maxCapacity: config.ecs.apiService.maxCount,
    });

    // CPU-based scaling
    apiScaling.scaleOnCpuUtilization('ApiCpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(300),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Memory-based scaling
    apiScaling.scaleOnMemoryUtilization('ApiMemoryScaling', {
      targetUtilizationPercent: 80,
      scaleInCooldown: cdk.Duration.seconds(300),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // ===== PART 7: ALB LISTENERS & DNS =====
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'SslCertificate',
      config.domain.certificateArn
    );

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: config.domain.hostedZoneId,
      zoneName: 'salesdog.click',
    });

    // HTTPS Listener
    const httpsListener = this.alb.addListener('HttpsListener', {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [certificate],
      sslPolicy: elbv2.SslPolicy.RECOMMENDED,
      defaultAction: elbv2.ListenerAction.fixedResponse(404, {
        contentType: 'text/plain',
        messageBody: 'Not Found',
      }),
    });

    // HTTP Listener (redirect to HTTPS)
    this.alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });

    // Routing rules based on environment
    if (config.tags.Environment === 'development') {
      httpsListener.addAction('DevWebRouting', {
        priority: 10,
        conditions: [
          elbv2.ListenerCondition.hostHeaders(['dev.salesdog.click']),
        ],
        action: elbv2.ListenerAction.forward([webTargetGroup]),
      });

      httpsListener.addAction('DevApiRouting', {
        priority: 20,
        conditions: [
          elbv2.ListenerCondition.hostHeaders(['api-dev.salesdog.click']),
        ],
        action: elbv2.ListenerAction.forward([apiTargetGroup]),
      });

      // DNS records
      new route53.ARecord(this, 'DevWebARecord', {
        zone: hostedZone,
        recordName: 'dev',
        target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(this.alb)),
      });

      new route53.ARecord(this, 'DevApiARecord', {
        zone: hostedZone,
        recordName: 'api-dev',
        target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(this.alb)),
      });

    } else {
      // Production
      httpsListener.addAction('ProdWebRouting', {
        priority: 10,
        conditions: [
          elbv2.ListenerCondition.hostHeaders(['www.salesdog.click', 'salesdog.click']),
        ],
        action: elbv2.ListenerAction.forward([webTargetGroup]),
      });

      httpsListener.addAction('ProdApiRouting', {
        priority: 20,
        conditions: [
          elbv2.ListenerCondition.hostHeaders(['api.salesdog.click']),
        ],
        action: elbv2.ListenerAction.forward([apiTargetGroup]),
      });

      // DNS records
      new route53.ARecord(this, 'ProdWwwARecord', {
        zone: hostedZone,
        recordName: 'www',
        target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(this.alb)),
      });

      new route53.ARecord(this, 'ProdApiARecord', {
        zone: hostedZone,
        recordName: 'api',
        target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(this.alb)),
      });

      new route53.ARecord(this, 'ProdApexARecord', {
        zone: hostedZone,
        recordName: '',
        target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(this.alb)),
      });
    }

    // Add tags
    Object.entries(config.tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApplicationUrl', {
      value: `https://${config.domain.name}`,
      description: 'Application URL',
      exportName: `${id}-ApplicationUrl`,
    });

    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: this.alb.loadBalancerDnsName,
      description: 'ALB DNS Name',
      exportName: `${id}-AlbDnsName`,
    });

    new cdk.CfnOutput(this, 'ClusterName', {
      value: this.cluster.clusterName,
      description: 'ECS Cluster Name',
      exportName: `${id}-ClusterName`,
    });

    new cdk.CfnOutput(this, 'WebServiceName', {
      value: this.webService.serviceName,
      description: 'Web Service Name',
      exportName: `${id}-WebServiceName`,
    });

    new cdk.CfnOutput(this, 'ApiServiceName', {
      value: this.apiService.serviceName,
      description: 'API Service Name',
      exportName: `${id}-ApiServiceName`,
    });

    new cdk.CfnOutput(this, 'SessionSecretArn', {
      value: sessionSecret.secretArn,
      description: 'Session Secret ARN (Secrets Manager)',
      exportName: `${id}-SessionSecretArn`,
    });

    new cdk.CfnOutput(this, 'ApiUrlParameterOutput', {
      value: apiUrlParameter.parameterName,
      description: 'API URL Parameter Name (SSM)',
      exportName: `${id}-ApiUrlParameter`,
    });

    new cdk.CfnOutput(this, 'WebLogGroupOutput', {
      value: webLogGroup.logGroupName,
      description: 'Web Service CloudWatch Log Group',
      exportName: `${id}-WebLogGroup`,
    });

    new cdk.CfnOutput(this, 'ApiLogGroupOutput', {
      value: apiLogGroup.logGroupName,
      description: 'API Service CloudWatch Log Group',
      exportName: `${id}-ApiLogGroup`,
    });
  }
}
