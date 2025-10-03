import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

/**
 * ECS Stack - Fargate Cluster, Services, and Task Definitions
 * Creates containerized application infrastructure
 */
export class EcsStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly webService: ecs.FargateService;
  public readonly apiService: ecs.FargateService;
  public readonly webTargetGroup: elbv2.ApplicationTargetGroup;
  public readonly apiTargetGroup: elbv2.ApplicationTargetGroup;

  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    ecsSecurityGroup: ec2.SecurityGroup,
    alb: elbv2.ApplicationLoadBalancer,
    config: EnvironmentConfig,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Create ECS Cluster
    this.cluster = new ecs.Cluster(this, 'EcsCluster', {
      clusterName: config.ecs.clusterName,
      vpc,
      containerInsights: config.tags.Environment === 'production',
    });

    // Get ECR repositories (assume they already exist from Story 1.5)
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

    // Create Task Execution Role
    const executionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Create Task Role (for application permissions)
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Grant read access to ECR
    webRepository.grantPull(executionRole);
    apiRepository.grantPull(executionRole);

    // Create CloudWatch Log Groups
    const webLogGroup = new logs.LogGroup(this, 'WebLogGroup', {
      logGroupName: `/ecs/${config.ecs.webService.name}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const apiLogGroup = new logs.LogGroup(this, 'ApiLogGroup', {
      logGroupName: `/ecs/${config.ecs.apiService.name}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Web Service Task Definition
    const webTaskDefinition = new ecs.FargateTaskDefinition(this, 'WebTaskDefinition', {
      memoryLimitMiB: config.ecs.webService.memory,
      cpu: config.ecs.webService.cpu,
      executionRole,
      taskRole,
    });

    webTaskDefinition.addContainer('WebContainer', {
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
      environment: {
        NODE_ENV: config.tags.Environment === 'production' ? 'production' : 'development',
        PORT: config.ecs.webService.port.toString(),
      },
      healthCheck: {
        command: ['CMD-SHELL', `curl -f http://localhost:${config.ecs.webService.port}/ || exit 1`],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    // API Service Task Definition
    const apiTaskDefinition = new ecs.FargateTaskDefinition(this, 'ApiTaskDefinition', {
      memoryLimitMiB: config.ecs.apiService.memory,
      cpu: config.ecs.apiService.cpu,
      executionRole,
      taskRole,
    });

    apiTaskDefinition.addContainer('ApiContainer', {
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
      healthCheck: {
        command: ['CMD-SHELL', `curl -f http://localhost:${config.ecs.apiService.port}/health/ || exit 1`],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    // Create Target Groups
    this.webTargetGroup = new elbv2.ApplicationTargetGroup(this, 'WebTargetGroup', {
      vpc,
      port: config.ecs.webService.port,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      deregistrationDelay: cdk.Duration.seconds(30),
      healthCheck: {
        path: '/',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: '200-299',
      },
    });

    this.apiTargetGroup = new elbv2.ApplicationTargetGroup(this, 'ApiTargetGroup', {
      vpc,
      port: config.ecs.apiService.port,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      deregistrationDelay: cdk.Duration.seconds(30),
      healthCheck: {
        path: '/health/',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: '200-299',
      },
    });

    // Create Web Fargate Service
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
      enableExecuteCommand: true, // For debugging
      circuitBreaker: {
        rollback: true,
      },
    });

    // Create API Fargate Service
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
      circuitBreaker: {
        rollback: true,
      },
    });

    // Attach services to target groups
    this.webService.attachToApplicationTargetGroup(this.webTargetGroup);
    this.apiService.attachToApplicationTargetGroup(this.apiTargetGroup);

    // Auto-scaling
    const webScaling = this.webService.autoScaleTaskCount({
      minCapacity: config.ecs.webService.minCount,
      maxCapacity: config.ecs.webService.maxCount,
    });

    webScaling.scaleOnCpuUtilization('WebCpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    const apiScaling = this.apiService.autoScaleTaskCount({
      minCapacity: config.ecs.apiService.minCount,
      maxCapacity: config.ecs.apiService.maxCount,
    });

    apiScaling.scaleOnCpuUtilization('ApiCpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Add tags
    Object.entries(config.tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });

    // Outputs
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
  }
}
