#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkingStack } from '../lib/networking-stack';
import { DatabaseStack } from '../lib/database-stack';
import { ApplicationStack } from '../lib/application-stack';
import { DEV_CONFIG, PROD_CONFIG } from '../lib/config';

const app = new cdk.App();

/**
 * Development Environment Infrastructure
 */
const devNetworking = new NetworkingStack(
  app,
  'TalentbaseDevNetworking',
  DEV_CONFIG,
  {
    env: DEV_CONFIG.env,
    description: 'TalentBase Development - VPC and Networking',
    stackName: 'talentbase-dev-networking',
  }
);

const devDatabase = new DatabaseStack(
  app,
  'TalentbaseDevDatabase',
  devNetworking.vpc,
  devNetworking.rdsSecurityGroup,
  devNetworking.redisSecurityGroup,
  DEV_CONFIG,
  {
    env: DEV_CONFIG.env,
    description: 'TalentBase Development - RDS PostgreSQL and ElastiCache Redis',
    stackName: 'talentbase-dev-database',
  }
);
devDatabase.addDependency(devNetworking);

const devApplication = new ApplicationStack(
  app,
  'TalentbaseDevApplication',
  devNetworking.vpc,
  devNetworking.albSecurityGroup,
  devNetworking.ecsSecurityGroup,
  DEV_CONFIG,
  {
    env: DEV_CONFIG.env,
    description: 'TalentBase Development - ECS, ALB, and DNS',
    stackName: 'talentbase-dev-application',
  }
);
devApplication.addDependency(devNetworking);

/**
 * Production Environment Infrastructure
 */
const prodNetworking = new NetworkingStack(
  app,
  'TalentbaseProdNetworking',
  PROD_CONFIG,
  {
    env: PROD_CONFIG.env,
    description: 'TalentBase Production - VPC and Networking',
    stackName: 'talentbase-prod-networking',
  }
);

const prodDatabase = new DatabaseStack(
  app,
  'TalentbaseProdDatabase',
  prodNetworking.vpc,
  prodNetworking.rdsSecurityGroup,
  prodNetworking.redisSecurityGroup,
  PROD_CONFIG,
  {
    env: PROD_CONFIG.env,
    description: 'TalentBase Production - RDS PostgreSQL and ElastiCache Redis',
    stackName: 'talentbase-prod-database',
  }
);
prodDatabase.addDependency(prodNetworking);

const prodApplication = new ApplicationStack(
  app,
  'TalentbaseProdApplication',
  prodNetworking.vpc,
  prodNetworking.albSecurityGroup,
  prodNetworking.ecsSecurityGroup,
  PROD_CONFIG,
  {
    env: PROD_CONFIG.env,
    description: 'TalentBase Production - ECS, ALB, and DNS',
    stackName: 'talentbase-prod-application',
  }
);
prodApplication.addDependency(prodNetworking);

app.synth();
