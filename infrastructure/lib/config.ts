/**
 * TalentBase Infrastructure Configuration
 * Centralizes all environment-specific settings
 */

export interface EnvironmentConfig {
  env: {
    account: string;
    region: string;
  };
  vpcCidr: string;
  maxAzs: number;
  domain: {
    name: string;
    hostedZoneId: string;
    certificateArn: string;
  };
  ecs: {
    clusterName: string;
    webService: {
      name: string;
      cpu: number;
      memory: number;
      desiredCount: number;
      minCount: number;
      maxCount: number;
      port: number;
    };
    apiService: {
      name: string;
      cpu: number;
      memory: number;
      desiredCount: number;
      minCount: number;
      maxCount: number;
      port: number;
    };
  };
  ecr: {
    webRepository: string;
    apiRepository: string;
  };
  rds: {
    instanceClass: string;
    allocatedStorage: number;
    maxAllocatedStorage: number;
    databaseName: string;
  };
  elasticache: {
    nodeType: string;
    numCacheNodes: number;
  };
  tags: Record<string, string>;
}

export const GLOBAL_CONFIG = {
  account: '258993895334',
  region: 'us-east-1',
  baseDomain: 'salesdog.click',
  hostedZoneId: 'Z08777062VQUJNRPO700D',
  certificateArn: 'arn:aws:acm:us-east-1:258993895334:certificate/6f17fe7f-fca3-41f1-95a3-8debad6f7fa8',
};

export const DEV_CONFIG: EnvironmentConfig = {
  env: {
    account: GLOBAL_CONFIG.account,
    region: GLOBAL_CONFIG.region,
  },
  vpcCidr: '10.0.0.0/16',
  maxAzs: 2,
  domain: {
    name: 'dev.salesdog.click',
    hostedZoneId: GLOBAL_CONFIG.hostedZoneId,
    certificateArn: GLOBAL_CONFIG.certificateArn,
  },
  ecs: {
    clusterName: 'talentbase-dev',
    webService: {
      name: 'talentbase-web-dev',
      cpu: 512,
      memory: 1024,
      desiredCount: 1,
      minCount: 1,
      maxCount: 3,
      port: 3000,
    },
    apiService: {
      name: 'talentbase-api-dev',
      cpu: 512,
      memory: 1024,
      desiredCount: 1,
      minCount: 1,
      maxCount: 3,
      port: 8000,
    },
  },
  ecr: {
    webRepository: 'talentbase-web',
    apiRepository: 'talentbase-api',
  },
  rds: {
    instanceClass: 't3.micro',
    allocatedStorage: 20,
    maxAllocatedStorage: 100,
    databaseName: 'talentbase_dev',
  },
  elasticache: {
    nodeType: 'cache.t3.micro',
    numCacheNodes: 1,
  },
  tags: {
    Environment: 'development',
    Project: 'TalentBase',
    ManagedBy: 'CDK',
    CostCenter: 'development',
  },
};

export const PROD_CONFIG: EnvironmentConfig = {
  env: {
    account: GLOBAL_CONFIG.account,
    region: GLOBAL_CONFIG.region,
  },
  vpcCidr: '10.1.0.0/16',
  maxAzs: 3,
  domain: {
    name: 'www.salesdog.click',
    hostedZoneId: GLOBAL_CONFIG.hostedZoneId,
    certificateArn: GLOBAL_CONFIG.certificateArn,
  },
  ecs: {
    clusterName: 'talentbase-prod',
    webService: {
      name: 'talentbase-web-prod',
      cpu: 1024,
      memory: 2048,
      desiredCount: 2,
      minCount: 2,
      maxCount: 10,
      port: 3000,
    },
    apiService: {
      name: 'talentbase-api-prod',
      cpu: 1024,
      memory: 2048,
      desiredCount: 2,
      minCount: 2,
      maxCount: 10,
      port: 8000,
    },
  },
  ecr: {
    webRepository: 'talentbase-web',
    apiRepository: 'talentbase-api',
  },
  rds: {
    instanceClass: 't3.small',
    allocatedStorage: 100,
    maxAllocatedStorage: 500,
    databaseName: 'talentbase_prod',
  },
  elasticache: {
    nodeType: 'cache.t3.small',
    numCacheNodes: 2,
  },
  tags: {
    Environment: 'production',
    Project: 'TalentBase',
    ManagedBy: 'CDK',
    CostCenter: 'production',
  },
};
