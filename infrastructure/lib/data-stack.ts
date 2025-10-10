import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

/**
 * Data Stack - RDS PostgreSQL and ElastiCache Redis
 * Creates database and cache infrastructure
 */
export class DataStack extends cdk.Stack {
  public readonly database: rds.DatabaseInstance;
  public readonly redisCluster: elasticache.CfnCacheCluster;
  public readonly databaseSecret: secretsmanager.Secret;
  public readonly dbSecurityGroup: ec2.SecurityGroup;
  public readonly redisSecurityGroup: ec2.SecurityGroup;

  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    config: EnvironmentConfig,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Create security group for RDS
    this.dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Security group for RDS PostgreSQL database',
      allowAllOutbound: true,
    });

    // Create security group for Redis
    this.redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc,
      description: 'Security group for ElastiCache Redis',
      allowAllOutbound: true,
    });

    // Create database credentials secret
    this.databaseSecret = new secretsmanager.Secret(this, 'DatabaseSecret', {
      secretName: `${config.projectName}/${config.tags.Environment}/db-credentials`,
      description: `Database credentials for ${config.projectName} ${config.tags.Environment}`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'talentbase_admin',
        }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 32,
      },
    });

    // Create RDS PostgreSQL instance
    this.database = new rds.DatabaseInstance(this, 'PostgresDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_3,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        config.tags.Environment === 'production' ? ec2.InstanceSize.SMALL : ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [this.dbSecurityGroup],
      credentials: rds.Credentials.fromSecret(this.databaseSecret),
      databaseName: 'talentbase',
      allocatedStorage: config.tags.Environment === 'production' ? 20 : 10,
      maxAllocatedStorage: config.tags.Environment === 'production' ? 100 : 20,
      storageEncrypted: true,
      backupRetention: config.tags.Environment === 'production' ? cdk.Duration.days(7) : cdk.Duration.days(1),
      deleteAutomatedBackups: config.tags.Environment !== 'production',
      removalPolicy: config.tags.Environment === 'production' ? cdk.RemovalPolicy.SNAPSHOT : cdk.RemovalPolicy.DESTROY,
      deletionProtection: config.tags.Environment === 'production',
      enablePerformanceInsights: config.tags.Environment === 'production',
      performanceInsightRetention: config.tags.Environment === 'production'
        ? rds.PerformanceInsightRetention.DEFAULT
        : undefined,
      multiAz: config.tags.Environment === 'production',
      publiclyAccessible: false,
    });

    // Create ElastiCache subnet group
    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: 'Subnet group for ElastiCache Redis',
      subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId),
      cacheSubnetGroupName: `${config.projectName}-${config.tags.Environment}-redis-subnet-group`,
    });

    // Create ElastiCache Redis cluster
    this.redisCluster = new elasticache.CfnCacheCluster(this, 'RedisCluster', {
      cacheNodeType: config.tags.Environment === 'production' ? 'cache.t3.small' : 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 1,
      cacheSubnetGroupName: redisSubnetGroup.cacheSubnetGroupName,
      vpcSecurityGroupIds: [this.redisSecurityGroup.securityGroupId],
      engineVersion: '7.0',
      port: 6379,
      clusterName: `${config.projectName}-${config.tags.Environment}-redis`,
      autoMinorVersionUpgrade: true,
      snapshotRetentionLimit: config.tags.Environment === 'production' ? 5 : 0,
    });

    this.redisCluster.addDependency(redisSubnetGroup);

    // Add tags
    Object.entries(config.tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });

    // Outputs
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.dbInstanceEndpointAddress,
      description: 'RDS PostgreSQL Endpoint',
      exportName: `${id}-DatabaseEndpoint`,
    });

    new cdk.CfnOutput(this, 'DatabasePort', {
      value: this.database.dbInstanceEndpointPort,
      description: 'RDS PostgreSQL Port',
      exportName: `${id}-DatabasePort`,
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.databaseSecret.secretArn,
      description: 'Database credentials secret ARN',
      exportName: `${id}-DatabaseSecretArn`,
    });

    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: this.redisCluster.attrRedisEndpointAddress,
      description: 'ElastiCache Redis Endpoint',
      exportName: `${id}-RedisEndpoint`,
    });

    new cdk.CfnOutput(this, 'RedisPort', {
      value: this.redisCluster.attrRedisEndpointPort,
      description: 'ElastiCache Redis Port',
      exportName: `${id}-RedisPort`,
    });
  }
}
