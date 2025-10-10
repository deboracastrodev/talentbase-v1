import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

/**
 * Database Stack - RDS PostgreSQL and ElastiCache Redis
 * Creates managed database services for TalentBase
 */
export class DatabaseStack extends cdk.Stack {
  public readonly rdsInstance: rds.DatabaseInstance;
  public readonly rdsSecret: secretsmanager.Secret;
  public readonly redisCluster: elasticache.CfnCacheCluster;
  public readonly redisSubnetGroup: elasticache.CfnSubnetGroup;

  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    rdsSecurityGroup: ec2.SecurityGroup,
    redisSecurityGroup: ec2.SecurityGroup,
    config: EnvironmentConfig,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Create RDS credentials secret
    this.rdsSecret = new secretsmanager.Secret(this, 'RdsSecret', {
      secretName: `${config.ecs.clusterName}-rds-credentials`,
      description: 'PostgreSQL database credentials',
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

    // Create RDS PostgreSQL Instance
    this.rdsInstance = new rds.DatabaseInstance(this, 'PostgresInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_8,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        config.rds.instanceClass.split('.')[1] as ec2.InstanceSize
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [rdsSecurityGroup],
      credentials: rds.Credentials.fromSecret(this.rdsSecret),
      databaseName: config.rds.databaseName,
      allocatedStorage: config.rds.allocatedStorage,
      maxAllocatedStorage: config.rds.maxAllocatedStorage,
      storageType: rds.StorageType.GP3,
      storageEncrypted: true,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: config.tags.Environment === 'production',
      publiclyAccessible: false,
      autoMinorVersionUpgrade: true,
      enablePerformanceInsights: config.tags.Environment === 'production',
      performanceInsightRetention: config.tags.Environment === 'production'
        ? rds.PerformanceInsightRetention.DEFAULT
        : undefined,
    });

    // Create ElastiCache Subnet Group
    this.redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: 'Subnet group for ElastiCache Redis',
      subnetIds: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      }).subnetIds,
      cacheSubnetGroupName: `${config.ecs.clusterName}-redis-subnet-group`,
    });

    // Create ElastiCache Redis Cluster
    this.redisCluster = new elasticache.CfnCacheCluster(this, 'RedisCluster', {
      cacheNodeType: config.elasticache.nodeType,
      engine: 'redis',
      numCacheNodes: config.elasticache.numCacheNodes,
      cacheSubnetGroupName: this.redisSubnetGroup.ref,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
      autoMinorVersionUpgrade: true,
      engineVersion: '7.0',
      port: 6379,
      clusterName: `${config.ecs.clusterName}-redis`,
    });

    this.redisCluster.addDependency(this.redisSubnetGroup);

    // Add tags
    Object.entries(config.tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });

    // Outputs
    new cdk.CfnOutput(this, 'RdsEndpoint', {
      value: this.rdsInstance.dbInstanceEndpointAddress,
      description: 'RDS PostgreSQL endpoint',
      exportName: `${id}-RdsEndpoint`,
    });

    new cdk.CfnOutput(this, 'RdsPort', {
      value: this.rdsInstance.dbInstanceEndpointPort,
      description: 'RDS PostgreSQL port',
      exportName: `${id}-RdsPort`,
    });

    new cdk.CfnOutput(this, 'RdsSecretArn', {
      value: this.rdsSecret.secretArn,
      description: 'RDS credentials secret ARN',
      exportName: `${id}-RdsSecretArn`,
    });

    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: this.redisCluster.attrRedisEndpointAddress,
      description: 'Redis cluster endpoint',
      exportName: `${id}-RedisEndpoint`,
    });

    new cdk.CfnOutput(this, 'RedisPort', {
      value: this.redisCluster.attrRedisEndpointPort,
      description: 'Redis cluster port',
      exportName: `${id}-RedisPort`,
    });
  }
}
