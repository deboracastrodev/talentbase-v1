import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

/**
 * ALB and DNS Stack - Application Load Balancer, HTTPS listeners, and Route53 records
 * Implements Story 1.6 - DNS & SSL Configuration
 */
export class AlbDnsStack extends cdk.Stack {
  public readonly alb: elbv2.ApplicationLoadBalancer;
  public readonly httpsListener: elbv2.ApplicationListener;
  public readonly httpListener: elbv2.ApplicationListener;

  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    albSecurityGroup: ec2.SecurityGroup,
    webTargetGroup: elbv2.ApplicationTargetGroup,
    apiTargetGroup: elbv2.ApplicationTargetGroup,
    config: EnvironmentConfig,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Create Application Load Balancer
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

    // Import existing certificate
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'SslCertificate',
      config.domain.certificateArn
    );

    // Import existing hosted zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: config.domain.hostedZoneId,
      zoneName: 'salesdog.click',
    });

    // Create HTTPS Listener with SSL certificate
    this.httpsListener = this.alb.addListener('HttpsListener', {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [certificate],
      sslPolicy: elbv2.SslPolicy.RECOMMENDED,
      defaultAction: elbv2.ListenerAction.fixedResponse(404, {
        contentType: 'text/plain',
        messageBody: 'Not Found',
      }),
    });

    // Create HTTP Listener with redirect to HTTPS
    this.httpListener = this.alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });

    // Add routing rules based on environment
    if (config.tags.Environment === 'development') {
      // Development: dev.salesdog.click -> web, api-dev.salesdog.click -> api

      // Web service routing (dev.salesdog.click)
      this.httpsListener.addAction('DevWebRouting', {
        priority: 10,
        conditions: [
          elbv2.ListenerCondition.hostHeaders(['dev.salesdog.click']),
        ],
        action: elbv2.ListenerAction.forward([webTargetGroup]),
      });

      // API service routing (api-dev.salesdog.click)
      this.httpsListener.addAction('DevApiRouting', {
        priority: 20,
        conditions: [
          elbv2.ListenerCondition.hostHeaders(['api-dev.salesdog.click']),
        ],
        action: elbv2.ListenerAction.forward([apiTargetGroup]),
      });

      // Create DNS records for development
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
      // Production: www.salesdog.click -> web, api.salesdog.click -> api, salesdog.click -> web (redirect)

      // Web service routing (www.salesdog.click and salesdog.click)
      this.httpsListener.addAction('ProdWebRouting', {
        priority: 10,
        conditions: [
          elbv2.ListenerCondition.hostHeaders(['www.salesdog.click', 'salesdog.click']),
        ],
        action: elbv2.ListenerAction.forward([webTargetGroup]),
      });

      // API service routing (api.salesdog.click)
      this.httpsListener.addAction('ProdApiRouting', {
        priority: 20,
        conditions: [
          elbv2.ListenerCondition.hostHeaders(['api.salesdog.click']),
        ],
        action: elbv2.ListenerAction.forward([apiTargetGroup]),
      });

      // Create DNS records for production
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

      // Apex domain (salesdog.click) points to ALB
      // Remix catch-all route will handle redirect to www
      new route53.ARecord(this, 'ProdApexARecord', {
        zone: hostedZone,
        recordName: '', // Empty string for apex domain
        target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(this.alb)),
      });
    }

    // Add tags
    Object.entries(config.tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });

    // Outputs
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: this.alb.loadBalancerDnsName,
      description: 'ALB DNS Name',
      exportName: `${id}-AlbDnsName`,
    });

    new cdk.CfnOutput(this, 'AlbArn', {
      value: this.alb.loadBalancerArn,
      description: 'ALB ARN',
      exportName: `${id}-AlbArn`,
    });

    new cdk.CfnOutput(this, 'AlbUrl', {
      value: `https://${config.domain.name}`,
      description: 'Application URL',
      exportName: `${id}-AlbUrl`,
    });
  }
}
