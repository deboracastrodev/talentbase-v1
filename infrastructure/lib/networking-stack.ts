import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

/**
 * Networking Stack - VPC, Subnets, NAT Gateway, Security Groups
 * Creates the foundational network infrastructure for TalentBase
 */
export class NetworkingStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly albSecurityGroup: ec2.SecurityGroup;
  public readonly ecsSecurityGroup: ec2.SecurityGroup;
  public readonly rdsSecurityGroup: ec2.SecurityGroup;
  public readonly redisSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, config: EnvironmentConfig, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC with public and private subnets across multiple AZs
    this.vpc = new ec2.Vpc(this, 'TalentbaseVpc', {
      ipAddresses: ec2.IpAddresses.cidr(config.vpcCidr),
      maxAzs: config.maxAzs,
      natGateways: 1, // Single NAT gateway for cost optimization (use maxAzs for production HA)
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // ALB Security Group - Accepts HTTPS from internet
    this.albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    });

    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS from internet'
    );

    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP from internet (for redirect)'
    );

    // ECS Security Group - Accepts traffic from ALB
    this.ecsSecurityGroup = new ec2.SecurityGroup(this, 'EcsSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for ECS tasks',
      allowAllOutbound: true,
    });

    this.ecsSecurityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcp(config.ecs.webService.port),
      'Allow traffic from ALB to web service'
    );

    this.ecsSecurityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcp(config.ecs.apiService.port),
      'Allow traffic from ALB to API service'
    );

    // RDS Security Group - Accepts traffic from ECS
    this.rdsSecurityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for RDS PostgreSQL',
      allowAllOutbound: false,
    });

    this.rdsSecurityGroup.addIngressRule(
      this.ecsSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL from ECS tasks'
    );

    // Redis Security Group - Accepts traffic from ECS
    this.redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for ElastiCache Redis',
      allowAllOutbound: false,
    });

    this.redisSecurityGroup.addIngressRule(
      this.ecsSecurityGroup,
      ec2.Port.tcp(6379),
      'Allow Redis from ECS tasks'
    );

    // Add tags
    Object.entries(config.tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });

    // Outputs
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `${id}-VpcId`,
    });

    new cdk.CfnOutput(this, 'AlbSecurityGroupId', {
      value: this.albSecurityGroup.securityGroupId,
      description: 'ALB Security Group ID',
      exportName: `${id}-AlbSecurityGroupId`,
    });

    new cdk.CfnOutput(this, 'EcsSecurityGroupId', {
      value: this.ecsSecurityGroup.securityGroupId,
      description: 'ECS Security Group ID',
      exportName: `${id}-EcsSecurityGroupId`,
    });
  }
}
