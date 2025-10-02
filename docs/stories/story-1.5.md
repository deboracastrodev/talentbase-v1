# Story 1.5: Implement CI/CD Pipeline (GitHub Actions)

Status: Draft

## Story

Como um **DevOps engineer**,
Eu quero **deployment automatizado para AWS a cada merge**,
Para que **o time possa entregar features continuamente**.

## Contexto

Esta story implementa pipeline CI/CD completo usando GitHub Actions. Deploy automatizado para dev (branch `develop`) e produção (branch `master`). Inclui testes, build Docker, push ECR e deploy ECS Fargate.

## Acceptance Criteria

1. ✅ GitHub Actions workflow criado (`.github/workflows/deploy.yml`)
2. ✅ Workflow executa em push para `develop` e `master`
3. ✅ Testes backend executam (Django pytest)
4. ✅ Testes frontend executam (Vitest)
5. ✅ Build Remix produção funciona
6. ✅ Docker images construídas para API e Web
7. ✅ Images enviadas para AWS ECR
8. ✅ ECS services atualizados com novas images
9. ✅ Deployment completa em <15 minutos
10. ✅ Health checks validam deployment bem-sucedido
11. ✅ Rollback workflow disponível
12. ✅ Notificações de deployment (sucesso/falha)

## Tasks / Subtasks

### Task 1: Criar Dockerfiles (AC: 6)
- [ ] Criar `apps/api/Dockerfile`:
  ```dockerfile
  FROM python:3.11-slim AS base

  WORKDIR /app

  RUN pip install poetry
  COPY pyproject.toml poetry.lock ./
  RUN poetry config virtualenvs.create false && poetry install --no-dev

  COPY . .
  RUN python manage.py collectstatic --noinput

  EXPOSE 8000

  CMD ["gunicorn", "talentbase.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
  ```

- [ ] Criar `packages/web/Dockerfile`:
  ```dockerfile
  FROM node:20-alpine AS base

  RUN npm install -g pnpm

  FROM base AS deps
  WORKDIR /app
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  COPY packages/design-system/package.json ./packages/design-system/
  COPY packages/web/package.json ./packages/web/
  RUN pnpm install --frozen-lockfile

  FROM base AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN pnpm --filter @talentbase/web build

  FROM base AS runner
  WORKDIR /app
  COPY --from=builder /app/packages/web/build ./build
  COPY --from=builder /app/packages/web/public ./public
  COPY --from=builder /app/packages/web/package.json ./

  EXPOSE 3000

  CMD ["pnpm", "start"]
  ```

### Task 2: Criar GitHub Actions workflow (AC: 1, 2, 3, 4, 5)
- [ ] Criar `.github/workflows/deploy.yml`:
  ```yaml
  name: Deploy to AWS ECS

  on:
    push:
      branches:
        - master
        - develop

  env:
    AWS_REGION: us-east-1
    ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com

  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        - name: Setup Python
          uses: actions/setup-python@v5
          with:
            python-version: '3.11'

        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '20'

        - name: Install pnpm
          run: npm install -g pnpm

        - name: Set Django Environment
          run: |
            if [ "${{ github.ref }}" == "refs/heads/master" ]; then
              echo "DJANGO_SETTINGS_MODULE=talentbase.settings.production" >> $GITHUB_ENV
            else
              echo "DJANGO_SETTINGS_MODULE=talentbase.settings.development" >> $GITHUB_ENV
            fi

        - name: Install Backend Dependencies
          run: |
            cd apps/api
            pip install poetry
            poetry install

        - name: Run Backend Tests
          env:
            DJANGO_SETTINGS_MODULE: talentbase.settings.test
          run: |
            cd apps/api
            poetry run pytest --cov=. --cov-report=xml

        - name: Install Frontend Dependencies
          run: pnpm install

        - name: Run Frontend Tests
          run: |
            cd packages/web
            pnpm test

        - name: Run E2E Tests
          run: |
            cd packages/web
            pnpm playwright install
            pnpm playwright test

    build-and-deploy:
      needs: test
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        - name: Configure AWS credentials
          uses: aws-actions/configure-aws-credentials@v4
          with:
            aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
            aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
            aws-region: ${{ env.AWS_REGION }}

        - name: Login to Amazon ECR
          id: login-ecr
          uses: aws-actions/amazon-ecr-login@v2

        - name: Determine Environment
          id: env
          run: |
            if [ "${{ github.ref }}" == "refs/heads/master" ]; then
              echo "CLUSTER=talentbase-prod" >> $GITHUB_OUTPUT
              echo "WEB_SERVICE=talentbase-web-prod" >> $GITHUB_OUTPUT
              echo "API_SERVICE=talentbase-api-prod" >> $GITHUB_OUTPUT
            else
              echo "CLUSTER=talentbase-dev" >> $GITHUB_OUTPUT
              echo "WEB_SERVICE=talentbase-web-dev" >> $GITHUB_OUTPUT
              echo "API_SERVICE=talentbase-api-dev" >> $GITHUB_OUTPUT
            fi

        - name: Build and Push API Docker Image
          run: |
            cd apps/api
            docker build -t ${{ env.ECR_REGISTRY }}/talentbase-api:${{ github.sha }} .
            docker push ${{ env.ECR_REGISTRY }}/talentbase-api:${{ github.sha }}

        - name: Build and Push Web Docker Image
          run: |
            docker build -f packages/web/Dockerfile -t ${{ env.ECR_REGISTRY }}/talentbase-web:${{ github.sha }} .
            docker push ${{ env.ECR_REGISTRY }}/talentbase-web:${{ github.sha }}

        - name: Update ECS Service - API
          run: |
            aws ecs update-service \
              --cluster ${{ steps.env.outputs.CLUSTER }} \
              --service ${{ steps.env.outputs.API_SERVICE }} \
              --force-new-deployment

        - name: Update ECS Service - Web
          run: |
            aws ecs update-service \
              --cluster ${{ steps.env.outputs.CLUSTER }} \
              --service ${{ steps.env.outputs.WEB_SERVICE }} \
              --force-new-deployment

        - name: Wait for API Deployment
          run: |
            aws ecs wait services-stable \
              --cluster ${{ steps.env.outputs.CLUSTER }} \
              --services ${{ steps.env.outputs.API_SERVICE }}

        - name: Wait for Web Deployment
          run: |
            aws ecs wait services-stable \
              --cluster ${{ steps.env.outputs.CLUSTER }} \
              --services ${{ steps.env.outputs.WEB_SERVICE }}
  ```

### Task 3: Configurar AWS Secrets no GitHub (AC: 7, 8)
- [ ] Adicionar secrets no GitHub repository:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_ACCOUNT_ID`
- [ ] Verificar permissões IAM necessárias:
  - ECR: push/pull images
  - ECS: update services, describe services
  - Logs: create log groups/streams

### Task 4: Criar workflow de rollback (AC: 11)
- [ ] Criar `.github/workflows/rollback.yml`:
  ```yaml
  name: Rollback Deployment

  on:
    workflow_dispatch:
      inputs:
        environment:
          description: 'Environment to rollback (dev/prod)'
          required: true
          type: choice
          options:
            - dev
            - prod

  jobs:
    rollback:
      runs-on: ubuntu-latest
      steps:
        - name: Configure AWS credentials
          uses: aws-actions/configure-aws-credentials@v4
          with:
            aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
            aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
            aws-region: us-east-1

        - name: Rollback ECS Services
          run: |
            CLUSTER="talentbase-${{ inputs.environment }}"
            aws ecs update-service --cluster $CLUSTER --service talentbase-api-${{ inputs.environment }} --force-new-deployment
            aws ecs update-service --cluster $CLUSTER --service talentbase-web-${{ inputs.environment }} --force-new-deployment
  ```

### Task 5: Health checks e validação (AC: 10, 12)
- [ ] Adicionar step de health check no workflow após deployment
- [ ] Configurar notificações Slack/email (opcional)

## Dev Notes

### Gap Fix from Review

Esta story incorpora o **Gap Menor 4** do review:
- Configuração de `DJANGO_SETTINGS_MODULE` baseada no branch
- Override para testes (`talentbase.settings.test`)
- Variáveis de ambiente corretas por environment

### Environments

| Environment | Branch | Cluster | URLs |
|-------------|--------|---------|------|
| Development | develop | talentbase-dev | dev.salesdog.click, api-dev.salesdog.click |
| Production | master | talentbase-prod | www.salesdog.click, api.salesdog.click |

### Docker Multi-Stage Builds

**Benefits:**
- Imagens menores (production sem dev dependencies)
- Build cache otimizado
- Security (sem código/ferramentas de build em produção)

### MCP Context (Infrastructure)

**Model Context Protocol - Story 1.5**
```xml
<context type="infrastructure-cicd">
  <pipeline-orchestration>
    <tool>GitHub Actions</tool>
    <trigger-branches>
      <branch name="develop" environment="development"/>
      <branch name="master" environment="production"/>
    </trigger-branches>
  </pipeline-orchestration>

  <pipeline-stages>
    <stage name="test" parallel="true">
      <backend-tests framework="pytest" coverage="true"/>
      <frontend-tests framework="vitest"/>
      <e2e-tests framework="playwright"/>
    </stage>

    <stage name="build" depends-on="test">
      <docker-build>
        <image name="talentbase-api" dockerfile="apps/api/Dockerfile"/>
        <image name="talentbase-web" dockerfile="packages/web/Dockerfile"/>
      </docker-build>
      <registry>AWS ECR</registry>
      <tagging-strategy>git-sha</tagging-strategy>
    </stage>

    <stage name="deploy" depends-on="build">
      <target-platform>AWS ECS Fargate</target-platform>
      <deployment-strategy>rolling-update</deployment-strategy>
      <health-checks enabled="true" endpoint="/health/"/>
      <timeout>15-minutes</timeout>
    </stage>
  </pipeline-stages>

  <environments>
    <environment name="development">
      <cluster>talentbase-dev</cluster>
      <services>
        <service name="talentbase-web-dev" port="3000"/>
        <service name="talentbase-api-dev" port="8000"/>
      </services>
      <domains>
        <domain>dev.salesdog.click</domain>
        <domain>api-dev.salesdog.click</domain>
      </domains>
    </environment>

    <environment name="production">
      <cluster>talentbase-prod</cluster>
      <services>
        <service name="talentbase-web-prod" port="3000"/>
        <service name="talentbase-api-prod" port="8000"/>
      </services>
      <domains>
        <domain>www.salesdog.click</domain>
        <domain>api.salesdog.click</domain>
      </domains>
    </environment>
  </environments>

  <secrets-management>
    <provider>GitHub Secrets</provider>
    <required-secrets>
      <secret name="AWS_ACCESS_KEY_ID" scope="deployment"/>
      <secret name="AWS_SECRET_ACCESS_KEY" scope="deployment"/>
      <secret name="AWS_ACCOUNT_ID" scope="ecr-registry"/>
    </required-secrets>
  </secrets-management>

  <rollback-strategy>
    <manual-trigger>workflow_dispatch</manual-trigger>
    <approach>force-new-deployment with previous image</approach>
  </rollback-strategy>
</context>
```

### Testing Strategy

**Validation Checklist:**
- [ ] Push to develop triggers deployment to dev
- [ ] Push to master triggers deployment to prod
- [ ] All tests pass before deployment
- [ ] Docker images build successfully
- [ ] ECS services update without downtime
- [ ] Health checks pass após deployment
- [ ] Rollback workflow funciona

### References

- [Source: docs/epics/tech-spec-epic-1.md#Story-1.5]
- [Source: docs/epics/tech-spec-epic-1-review.md#Gap-Menor-4]
- [Source: docs/epics/tech-spec-epic-1-review.md#Melhoria-2-Health-Check-Endpoints]

## Change Log

| Date       | Version | Description | Author |
| ---------- | ------- | ----------- | ------ |
| 2025-10-02 | 0.1     | Initial draft - CI/CD pipeline with MCP context | Debora |

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes

- Tempo estimado: 4-6 horas
- Inclui correção do Gap Menor 4 (Django settings por branch)
- Inclui MCP context (infrastructure story)
- Bloqueia: Story 1.6 (DNS precisa de ECS deployado)

### Dependencies

**Depends On:**
- Story 1.1: Dockerfiles and project structure
- Story 1.2: Database migrations to run in CI
- Story 1.3: Design system to build
- Story 1.4: Landing page to build and deploy

**Blocks:**
- Story 1.6: DNS configuration requires ECS services deployed

### File List

**To be created:**
- `.github/workflows/deploy.yml` - Main CI/CD pipeline
- `.github/workflows/rollback.yml` - Rollback workflow
- `apps/api/Dockerfile` - Django production Dockerfile
- `packages/web/Dockerfile` - Remix production Dockerfile
