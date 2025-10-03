# TalentBase AWS Infrastructure (CDK)

Esta pasta contém a infraestrutura como código (IaC) do TalentBase usando AWS CDK com TypeScript.

## 📋 Estrutura

```
infrastructure/
├── bin/
│   └── talentbase-infrastructure.ts  # Entry point do CDK
├── lib/
│   ├── config.ts                      # Configurações por ambiente
│   ├── networking-stack.ts            # VPC, Security Groups
│   ├── database-stack.ts              # RDS PostgreSQL, ElastiCache Redis
│   ├── ecs-stack.ts                   # ECS Fargate, Task Definitions
│   ├── alb-dns-stack.ts               # ALB, HTTPS Listeners, Route53
│   └── application-stack.ts           # Stack unificada (ECS + ALB + DNS)
├── package.json
├── tsconfig.json
└── cdk.json
```

## 🎯 O que este CDK provisiona

### Development Environment
- **VPC** com subnets públicas, privadas e isoladas (2 AZs)
- **Security Groups** para ALB, ECS, RDS e Redis
- **RDS PostgreSQL** (t3.micro, 20GB)
- **ElastiCache Redis** (t3.micro, 1 node)
- **ECS Fargate Cluster** (`talentbase-dev`)
- **ECS Services** para Web (Remix) e API (Django)
- **Application Load Balancer** com HTTPS
- **Route53 Records**:
  - `dev.salesdog.click` → Web Service
  - `api-dev.salesdog.click` → API Service

### Production Environment
- **VPC** com subnets públicas, privadas e isoladas (3 AZs)
- **Security Groups** para ALB, ECS, RDS e Redis
- **RDS PostgreSQL** (t3.small, 100GB)
- **ElastiCache Redis** (t3.small, 2 nodes)
- **ECS Fargate Cluster** (`talentbase-prod`)
- **ECS Services** para Web (Remix) e API (Django)
- **Application Load Balancer** com HTTPS
- **Route53 Records**:
  - `www.salesdog.click` → Web Service
  - `api.salesdog.click` → API Service
  - `salesdog.click` → Web Service (redirect via Remix)

## 🚀 Pré-requisitos

1. **Node.js 20+** e **pnpm** instalados
2. **AWS CLI v2** configurado com credenciais válidas
3. **Certificado SSL** já criado no ACM (ARN configurado em `lib/config.ts`)
4. **Route 53 Hosted Zone** para `salesdog.click` (ID configurado em `lib/config.ts`)
5. **ECR Repositories** já criados:
   - `talentbase-web`
   - `talentbase-api`

## 📦 Instalação

```bash
cd infrastructure
pnpm install
```

## 🔧 Bootstrap AWS CDK (primeira vez)

```bash
# Bootstrap da conta AWS (rode apenas uma vez)
pnpm bootstrap
```

## 🏗️ Deploy

### Deploy completo (dev + prod)

```bash
pnpm deploy
```

### Deploy apenas Development

```bash
pnpm deploy:dev
```

### Deploy apenas Production

```bash
pnpm deploy:prod
```

### Deploy de stacks individuais

```bash
# Apenas networking
pnpm cdk deploy TalentbaseDevNetworking

# Apenas database
pnpm cdk deploy TalentbaseDevDatabase

# Apenas application (ECS + ALB + DNS)
pnpm cdk deploy TalentbaseDevApplication
```

## 🔍 Comandos úteis

### Visualizar mudanças antes do deploy

```bash
pnpm diff
```

### Sintetizar CloudFormation templates

```bash
pnpm synth
```

### Destruir infraestrutura (⚠️ CUIDADO)

```bash
pnpm destroy
```

## 📊 Outputs do Deploy

Após o deploy, você receberá outputs importantes:

```
Development Environment:
  VpcId: vpc-xxxxx
  AlbDnsName: xxxx.us-east-1.elb.amazonaws.com
  ApplicationUrl: https://dev.salesdog.click
  RdsEndpoint: xxxxx.rds.amazonaws.com
  RedisEndpoint: xxxxx.cache.amazonaws.com
  ClusterName: talentbase-dev

Production Environment:
  VpcId: vpc-yyyyy
  AlbDnsName: yyyy.us-east-1.elb.amazonaws.com
  ApplicationUrl: https://www.salesdog.click
  RdsEndpoint: yyyyy.rds.amazonaws.com
  RedisEndpoint: yyyyy.cache.amazonaws.com
  ClusterName: talentbase-prod
```

## 🔐 Secrets e Configurações

### RDS Credentials

As credenciais do RDS são armazenadas automaticamente no **AWS Secrets Manager**:

```bash
# Development
aws secretsmanager get-secret-value --secret-id talentbase-dev-rds-credentials

# Production
aws secretsmanager get-secret-value --secret-id talentbase-prod-rds-credentials
```

### Environment Variables para ECS

Você precisará atualizar as Task Definitions para adicionar variáveis de ambiente adicionais:

```typescript
// Em lib/ecs-stack.ts, adicione ao container:
secrets: {
  DATABASE_URL: ecs.Secret.fromSecretsManager(rdsSecret),
  REDIS_URL: ecs.Secret.fromSecretsManager(redisSecret),
}
```

## 🎯 Próximos Passos após Deploy

1. **Push das Docker images para ECR**:
   ```bash
   # Build e push da API
   cd apps/api
   docker build -t 258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-api:latest .
   docker push 258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-api:latest

   # Build e push da Web
   docker build -f packages/web/Dockerfile -t 258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-web:latest .
   docker push 258993895334.dkr.ecr.us-east-1.amazonaws.com/talentbase-web:latest
   ```

2. **Force new deployment dos ECS services**:
   ```bash
   aws ecs update-service --cluster talentbase-dev --service talentbase-web-dev --force-new-deployment
   aws ecs update-service --cluster talentbase-dev --service talentbase-api-dev --force-new-deployment
   ```

3. **Rodar migrations do Django**:
   ```bash
   # Via ECS Exec
   aws ecs execute-command \
     --cluster talentbase-dev \
     --task <task-id> \
     --container ApiContainer \
     --interactive \
     --command "/bin/bash"

   # Dentro do container
   poetry run python manage.py migrate
   poetry run python manage.py createsuperuser
   ```

4. **Validar DNS propagation**:
   ```bash
   # Verificar registros DNS
   dig dev.salesdog.click
   dig api-dev.salesdog.click
   dig www.salesdog.click
   dig api.salesdog.click

   # Testar HTTPS
   curl -I https://dev.salesdog.click
   curl -I https://api-dev.salesdog.click/api/v1/
   ```

5. **Testar redirects**:
   ```bash
   # HTTP → HTTPS redirect
   curl -I http://www.salesdog.click  # Deve retornar 301 → https://

   # Apex → www redirect (via Remix)
   curl -I https://salesdog.click     # Deve retornar 301 → https://www.salesdog.click
   ```

## 💰 Custos Estimados

### Development (~$50-80/mês)
- VPC: gratuito (dentro do free tier)
- NAT Gateway: ~$32/mês
- RDS t3.micro: ~$13/mês
- ElastiCache t3.micro: ~$12/mês
- ECS Fargate (2 tasks): ~$15-20/mês
- ALB: ~$16/mês
- Data Transfer: variável

### Production (~$200-300/mês)
- VPC: gratuito
- NAT Gateway (3 AZs): ~$96/mês
- RDS t3.small: ~$26/mês
- ElastiCache t3.small (2 nodes): ~$48/mês
- ECS Fargate (4+ tasks): ~$60-120/mês
- ALB: ~$16/mês
- Data Transfer: variável

## 🔧 Troubleshooting

### Erro: "Stack already exists"

```bash
# Delete a stack existente
aws cloudformation delete-stack --stack-name talentbase-dev-networking
```

### Erro: "Certificate not found"

Verifique se o ARN do certificado em `lib/config.ts` está correto:

```bash
aws acm list-certificates --region us-east-1
```

### Erro: "Hosted Zone not found"

Verifique se o Hosted Zone ID em `lib/config.ts` está correto:

```bash
aws route53 list-hosted-zones
```

### ECS Tasks não iniciam

```bash
# Ver logs do ECS
aws logs tail /ecs/talentbase-web-dev --follow

# Ver eventos do service
aws ecs describe-services --cluster talentbase-dev --services talentbase-web-dev
```

## 📚 Referências

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html)
- [Story 1.6: DNS & SSL Configuration](../docs/stories/story-1.6.md)
- [Tech Spec Epic 1](../docs/epics/tech-spec-epic-1.md)

## 🆘 Suporte

- **Issues**: Reporte problemas no repositório do projeto
- **AWS Support**: Para issues específicos da AWS
- **CDK Slack**: [cdk.dev](https://cdk.dev)
