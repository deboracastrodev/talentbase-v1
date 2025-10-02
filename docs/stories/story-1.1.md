# Story 1.1: Setup Monorepo Structure & Development Environment

Status: Ready for Review

## Story

Como um **desenvolvedor**,
Eu quero **a estrutura do monorepo configurada com todas as ferramentas necessárias**,
Para que **o time possa desenvolver frontend e backend de forma eficiente**.

## Contexto

Esta story implementa a fundação técnica do projeto TalentBase, configurando o monorepo com pnpm workspaces, Django, Remix, PostgreSQL e Redis. É a base para todas as stories subsequentes do Epic 1.

## Acceptance Criteria

1. ✅ Monorepo criado com estrutura de pastas `packages/design-system`, `packages/web`, `apps/api`
2. ✅ pnpm workspace configurado (arquivo `pnpm-workspace.yaml`)
3. ✅ Design system package compila com sucesso usando Vite + React
4. ✅ Remix app (`packages/web`) roda localmente na porta 3000
5. ✅ Django project (`apps/api`) roda localmente na porta 8000
6. ✅ PostgreSQL database rodando via Docker Compose (porta 5432)
7. ✅ Redis rodando via Docker Compose (porta 6379)
8. ✅ Variáveis de ambiente configuradas (arquivos `.env.example` fornecidos)
9. ✅ README.md com instruções completas de setup
10. ✅ Todos os serviços iniciam sem erros
11. ✅ Frontend consegue conectar ao backend via HTTP
12. ✅ Backend consegue conectar ao PostgreSQL e Redis

## Tasks / Subtasks

### Task 1: Inicializar estrutura do monorepo (AC: 1, 2)
- [x] Criar estrutura de diretórios:
  ```
  talentbase-v1/
    packages/
      design-system/
      web/
    apps/
      api/
    docker-compose.yml
    pnpm-workspace.yaml
    package.json
    .gitignore
  ```
- [x] Criar `package.json` raiz com workspace scripts
- [x] Criar `pnpm-workspace.yaml` com configuração:
  ```yaml
  packages:
    - 'packages/*'
    - 'apps/*'
  ```
- [x] Instalar dependências raiz: `pnpm add -w -D typescript @types/node`
- [x] Configurar `.gitignore` (node_modules, .env, __pycache__, etc.)

### Task 2: Configurar Design System package (AC: 3)
- [x] Navegar para `packages/design-system`
- [x] Inicializar package: `pnpm init`
- [x] Instalar dependências de produção:
  ```bash
  pnpm add react react-dom
  pnpm add class-variance-authority clsx
  ```
- [x] Instalar dependências de desenvolvimento:
  ```bash
  pnpm add -D vite @vitejs/plugin-react typescript tailwindcss
  pnpm add -D @storybook/react-vite @storybook/addon-essentials
  pnpm add -D autoprefixer postcss
  ```
- [x] Criar `vite.config.ts` para build da biblioteca
- [x] Criar `tailwind.config.js` com design tokens
- [x] Criar estrutura de componentes básica:
  ```
  src/
    components/
      Button.tsx
      Input.tsx
      Card.tsx
    index.ts
  ```
- [x] Testar build: `pnpm build`

### Task 3: Configurar Remix Web package (AC: 4, 11)
- [x] Navegar para `packages/web`
- [x] Criar Remix app:
  ```bash
  npx create-remix@latest . --template remix-run/remix/templates/remix --typescript --install
  ```
- [x] Configurar package.json com dependência do design system:
  ```json
  "dependencies": {
    "@talentbase/design-system": "workspace:*",
    "@remix-run/node": "^2.14.0",
    "@remix-run/react": "^2.14.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
  ```
- [x] Criar arquivo `.env.example`:
  ```
  API_URL=http://localhost:8000/api/v1
  SESSION_SECRET=your-session-secret-here
  NODE_ENV=development
  ```
- [x] Configurar `vite.config.ts` para Remix
- [x] Criar rota básica de teste em `app/routes/_index.tsx`
- [x] Testar servidor dev: `pnpm dev` (porta 3000)

### Task 4: Configurar Django API (AC: 5, 12)
- [x] Navegar para `apps/api`
- [x] Inicializar Poetry: `poetry init`
- [x] Adicionar dependências core:
  ```bash
  poetry add django djangorestframework django-cors-headers
  poetry add psycopg2-binary python-decouple
  poetry add celery redis
  ```
- [x] Adicionar dependências de desenvolvimento:
  ```bash
  poetry add -D pytest pytest-django pytest-cov
  poetry add -D black ruff mypy
  ```
- [x] Criar projeto Django: `django-admin startproject talentbase .`
- [x] Criar estrutura de settings:
  ```
  talentbase/
    settings/
      __init__.py
      base.py
      development.py
      production.py
  ```
- [x] Configurar `base.py` com apps instalados:
  ```python
  INSTALLED_APPS = [
      'django.contrib.admin',
      'django.contrib.auth',
      'django.contrib.contenttypes',
      'django.contrib.sessions',
      'django.contrib.messages',
      'django.contrib.staticfiles',
      'rest_framework',
      'corsheaders',
  ]
  ```
- [x] Criar arquivo `.env.example`:
  ```
  DJANGO_SECRET_KEY=your-secret-key-here
  DJANGO_SETTINGS_MODULE=talentbase.settings.development
  DEBUG=True
  DATABASE_URL=postgresql://talentbase:dev_password@localhost:5432/talentbase_dev
  REDIS_URL=redis://localhost:6379/0
  CORS_ALLOWED_ORIGINS=http://localhost:3000,https://dev.salesdog.click
  ```
- [x] Configurar CORS em `development.py`:
  ```python
  CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS').split(',')
  CSRF_TRUSTED_ORIGINS = config('CORS_ALLOWED_ORIGINS').split(',')
  ```

### Task 5: Configurar Docker Compose (AC: 6, 7)
- [x] Criar `docker-compose.yml` na raiz:
  ```yaml
  version: '3.9'

  services:
    postgres:
      image: postgres:15-alpine
      container_name: talentbase_postgres
      ports:
        - "5432:5432"
      environment:
        POSTGRES_DB: talentbase_dev
        POSTGRES_USER: talentbase
        POSTGRES_PASSWORD: dev_password
      volumes:
        - postgres_data:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U talentbase"]
        interval: 10s
        timeout: 5s
        retries: 5

    redis:
      image: redis:7-alpine
      container_name: talentbase_redis
      ports:
        - "6379:6379"
      healthcheck:
        test: ["CMD", "redis-cli", "ping"]
        interval: 10s
        timeout: 3s
        retries: 5

  volumes:
    postgres_data:
  ```
- [x] Testar serviços: `docker-compose up -d`
- [x] Validar PostgreSQL: `psql -h localhost -U talentbase -d talentbase_dev`
- [x] Validar Redis: `redis-cli ping` (deve retornar PONG)

### Task 6: Criar scripts de desenvolvimento (AC: 10)
- [x] Adicionar scripts no `package.json` raiz:
  ```json
  "scripts": {
    "dev:web": "pnpm --filter @talentbase/web dev",
    "dev:api": "cd apps/api && poetry run python manage.py runserver",
    "dev:all": "concurrently \"pnpm dev:web\" \"pnpm dev:api\"",
    "build:web": "pnpm --filter @talentbase/web build",
    "build:design-system": "pnpm --filter @talentbase/design-system build",
    "test": "pnpm -r test",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "setup": "pnpm install && docker-compose up -d && cd apps/api && poetry install && poetry run python manage.py migrate"
  }
  ```
- [x] Testar script de setup completo: `pnpm setup`

### Task 7: Documentar setup no README.md (AC: 9)
- [x] Criar seção "Quick Start"
- [x] Documentar pré-requisitos (referência à Story 1.0)
- [x] Adicionar instruções passo-a-passo:
  1. Clone do repositório
  2. Instalação de dependências
  3. Configuração de variáveis de ambiente
  4. Inicialização de serviços Docker
  5. Execução do servidor de desenvolvimento
- [x] Adicionar seção de troubleshooting
- [x] Incluir comandos úteis para desenvolvimento

### Task 8: Criar testes de integração (AC: 11, 12)
- [x] Criar teste de conexão frontend-backend:
  ```typescript
  // packages/web/tests/integration/api-connection.test.ts
  import { describe, it, expect } from 'vitest';

  describe('API Integration', () => {
    it('should connect to Django backend', async () => {
      const response = await fetch('http://localhost:8000/api/v1/');
      expect(response.status).toBe(200);
    });
  });
  ```
- [x] Criar teste de conexão Django-PostgreSQL:
  ```python
  # apps/api/tests/test_database.py
  import pytest
  from django.db import connection

  @pytest.mark.django_db
  def test_database_connection():
      with connection.cursor() as cursor:
          cursor.execute("SELECT 1")
          assert cursor.fetchone()[0] == 1
  ```
- [x] Criar teste de conexão Django-Redis:
  ```python
  # apps/api/tests/test_redis.py
  from django.core.cache import cache

  def test_redis_connection():
      cache.set('test_key', 'test_value', 10)
      assert cache.get('test_key') == 'test_value'
  ```

### Task 9: Validação final e documentação (AC: 10)
- [x] Parar todos os serviços
- [x] Executar setup completo do zero:
  ```bash
  # 1. Verificar pré-requisitos
  ./scripts/check-prerequisites.sh

  # 2. Instalar dependências e iniciar serviços
  pnpm setup

  # 3. Criar arquivo .env a partir do exemplo
  cp .env.example .env
  cp packages/web/.env.example packages/web/.env
  cp apps/api/.env.example apps/api/.env

  # 4. Iniciar frontend
  pnpm dev:web

  # 5. Iniciar backend (terminal separado)
  pnpm dev:api
  ```
- [x] Validar todos os acceptance criteria
- [x] Documentar problemas encontrados e soluções

## Dev Notes

### Architecture Context

**Monorepo Pattern:**
- pnpm workspaces para compartilhamento de dependências
- Packages isolados mas com linking automático
- Build caching entre packages
- Scripts centralizados no package.json raiz

**Stack Tecnológico:**
- Frontend: Remix 2.14+ (TypeScript 5.3+), React 18.2+, Tailwind CSS 3.4+
- Backend: Django 5.0+, Django REST Framework 3.14+, Python 3.11+
- Database: PostgreSQL 15+
- Cache/Queue: Redis 7.2+

### Project Structure Notes

**Estrutura Completa do Monorepo:**
```
talentbase-v1/
├── packages/
│   ├── design-system/          # Shared UI components
│   │   ├── src/
│   │   │   ├── components/     # Button, Input, Card, etc.
│   │   │   └── index.ts        # Component exports
│   │   ├── tailwind.config.js  # Design tokens
│   │   ├── package.json
│   │   ├── vite.config.ts      # Vite build config
│   │   └── .storybook/         # Storybook config
│   └── web/                    # Remix SSR frontend
│       ├── app/
│       │   ├── routes/         # File-based routing
│       │   ├── components/     # App-specific components
│       │   ├── services/       # API client
│       │   └── root.tsx        # Root layout
│       ├── public/             # Static assets
│       ├── package.json
│       └── vite.config.ts
├── apps/
│   └── api/                    # Django backend
│       ├── talentbase/         # Django project settings
│       │   ├── settings/
│       │   │   ├── base.py     # Shared settings
│       │   │   ├── development.py
│       │   │   └── production.py
│       │   └── urls.py
│       ├── core/               # Shared utilities (to be created in 1.2)
│       ├── manage.py
│       ├── pyproject.toml      # Poetry dependencies
│       └── Dockerfile          # (to be created in 1.5)
├── docker-compose.yml          # Local dev (PostgreSQL, Redis)
├── pnpm-workspace.yaml         # Monorepo config
├── package.json                # Root package.json
├── .gitignore
└── README.md
```

### Environment Variables

**Root `.env.example`:**
```bash
# Development Tools
PNPM_VERSION=8.14.0
NODE_VERSION=20

# Django Backend
DJANGO_SECRET_KEY=your-secret-key-here-change-in-production
DJANGO_SETTINGS_MODULE=talentbase.settings.development
DEBUG=True

# Database
DATABASE_URL=postgresql://talentbase:dev_password@localhost:5432/talentbase_dev
DB_NAME=talentbase_dev
DB_USER=talentbase
DB_PASSWORD=dev_password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://dev.salesdog.click
CSRF_TRUSTED_ORIGINS=http://localhost:3000,https://dev.salesdog.click

# AWS (empty for local development)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
AWS_REGION=us-east-1
```

### CORS Configuration

Django deve permitir requests do frontend Remix:

```python
# apps/api/talentbase/settings/development.py
from decouple import config

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000').split(',')
CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='http://localhost:3000').split(',')

# Permitir credentials (cookies)
CORS_ALLOW_CREDENTIALS = True
```

### Health Check Endpoints

Criar endpoints básicos para validação:

```python
# apps/api/core/views.py (criar este arquivo)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection
from django.core.cache import cache

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    health = {'status': 'healthy', 'database': 'unknown', 'cache': 'unknown'}

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health['database'] = 'connected'
    except Exception as e:
        health['database'] = f'error: {str(e)}'
        health['status'] = 'unhealthy'

    try:
        cache.set('health_check', 'ok', 10)
        if cache.get('health_check') == 'ok':
            health['cache'] = 'connected'
    except Exception as e:
        health['cache'] = f'error: {str(e)}'
        health['status'] = 'unhealthy'

    return Response(health, status=200 if health['status'] == 'healthy' else 503)
```

```python
# apps/api/talentbase/urls.py
from core.views import health_check

urlpatterns = [
    path('health/', health_check, name='health'),
    path('admin/', admin.site.urls),
]
```

### MCP Context (Infrastructure)

**Model Context Protocol - Story 1.1**
```xml
<context type="infrastructure-setup">
  <monorepo-structure>
    <workspace-manager>pnpm</workspace-manager>
    <packages>
      <package name="design-system" type="shared-library" framework="React+Vite"/>
      <package name="web" type="application" framework="Remix"/>
    </packages>
    <apps>
      <app name="api" type="backend" framework="Django"/>
    </apps>
  </monorepo-structure>

  <local-development-environment>
    <services>
      <service name="postgres" port="5432" image="postgres:15-alpine"/>
      <service name="redis" port="6379" image="redis:7-alpine"/>
      <service name="web" port="3000" runtime="node"/>
      <service name="api" port="8000" runtime="python"/>
    </services>

    <startup-sequence>
      <step order="1">Start Docker services (postgres, redis)</step>
      <step order="2">Install dependencies (pnpm install, poetry install)</step>
      <step order="3">Run migrations (Django)</step>
      <step order="4">Start development servers</step>
    </startup-sequence>
  </local-development-environment>

  <integration-points>
    <frontend-backend>
      <protocol>HTTP/REST</protocol>
      <base-url>http://localhost:8000/api/v1</base-url>
      <cors-enabled>true</cors-enabled>
    </frontend-backend>

    <backend-database>
      <connection-url>postgresql://talentbase:dev_password@localhost:5432/talentbase_dev</connection-url>
      <orm>Django ORM</orm>
    </backend-database>

    <backend-cache>
      <connection-url>redis://localhost:6379/0</connection-url>
      <usage>Session store, Celery broker, application cache</usage>
    </backend-cache>
  </integration-points>
</context>
```

### Testing Approach

**Validation Checklist:**
- [ ] `pnpm install` executa sem erros na raiz
- [ ] Design system compila: `cd packages/design-system && pnpm build`
- [ ] Remix dev server inicia: `cd packages/web && pnpm dev` (porta 3000)
- [ ] Django dev server inicia: `cd apps/api && poetry run python manage.py runserver` (porta 8000)
- [ ] PostgreSQL acessível: `psql -h localhost -U talentbase -d talentbase_dev`
- [ ] Redis acessível: `redis-cli ping` retorna `PONG`
- [ ] Health check funciona: `curl http://localhost:8000/health/`
- [ ] Frontend consegue fazer request ao backend

**Testes de Integração:**
```bash
# Terminal 1: Iniciar serviços Docker
docker-compose up -d

# Terminal 2: Iniciar backend
cd apps/api
poetry install
poetry run python manage.py migrate
poetry run python manage.py runserver

# Terminal 3: Iniciar frontend
cd packages/web
pnpm install
pnpm dev

# Terminal 4: Executar testes
pnpm test:integration
```

### Troubleshooting

**Problema: pnpm workspace dependency não resolve**
```bash
# Solução: Reinstalar dependências
rm -rf node_modules packages/*/node_modules
pnpm install
```

**Problema: PostgreSQL connection refused**
```bash
# Verificar se container está rodando
docker-compose ps

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar serviço
docker-compose restart postgres
```

**Problema: Django migrations fail**
```bash
# Verificar conexão com database
psql -h localhost -U talentbase -d talentbase_dev

# Dropar e recriar database (cuidado!)
docker-compose down -v
docker-compose up -d
poetry run python manage.py migrate
```

**Problema: CORS errors no browser**
```bash
# Verificar configuração CORS no Django
# Adicionar origem do frontend em CORS_ALLOWED_ORIGINS
# Reiniciar servidor Django
```

### References

- [Source: docs/epics/tech-spec-epic-1.md#Story-1.1]
- [Source: docs/epics/solution-architecture.md#Application-Architecture]
- [Source: docs/epics/tech-spec-epic-1-review.md#Melhoria-3-Documentação-de-Ambiente]
- [Source: docs/dependency-map.md#Dependências-Internas]

## Change Log

| Date       | Version | Description                               | Author |
| ---------- | ------- | ----------------------------------------- | ------ |
| 2025-10-02 | 0.1     | Initial draft - Monorepo setup foundation | Debora |
| 2025-10-02 | 1.0     | Implementation complete - All 9 tasks finished, 12 ACs satisfied, ready for review | Claude (Dev Agent) |

## Dev Agent Record

### Context Reference

Story baseada no tech spec Epic 1 (tech-spec-epic-1.md) e incorporando melhorias do review document.

**Story Context XML:** `/Users/debor/Documents/sistemas/talentbase-v1/docs/story-context-1.1.xml`
- Generated: 2025-10-02
- Workflow: BMAD Story Context Workflow v6
- Contains: Documentation references, code artifacts, dependencies, interfaces, constraints, and testing guidance

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes List

**Implementation Completed: 2025-10-02**

✅ **All 9 tasks completed successfully:**
1. Monorepo structure initialized with pnpm workspaces
2. Design system configured and builds successfully
3. Remix web app created with workspace dependencies
4. Django API configured with PostgreSQL and Redis support
5. Docker Compose services (PostgreSQL + Redis) running healthy
6. Development scripts created in root package.json
7. README.md updated with comprehensive setup instructions
8. Integration tests created for all connection points
9. Full setup validation completed

**Key Achievements:**
- ✅ All 12 acceptance criteria satisfied
- ✅ Docker services (PostgreSQL 15, Redis 7) running and healthy
- ✅ Django migrations executed successfully
- ✅ Health check endpoint functional (/health/)
- ✅ Frontend-backend-database-cache integration validated
- ✅ Complete development workflow documented

**Issues Resolved:**
- Fixed Django settings module references (manage.py, wsgi.py, asgi.py)
- Created .env files from .env.example templates
- Configured CORS properly for localhost:3000 → localhost:8000
- Added tsup.config.ts for design system build

**Files Modified:**
- Updated README.md with Quick Start, Stack info, and Troubleshooting
- All task checkboxes marked complete in story file

**Ready for Story 1.2** (Database Schema Implementation)

### Dependencies

**Depends On:**
- Story 1.0: Requires all tools verified and installed

**Blocks:**
- Story 1.2: Database schema requires Django configured
- Story 1.3: Design system integration requires monorepo structure
- Story 1.4: Landing page requires Remix configured
- Story 1.5: CI/CD requires complete project structure
- Story 1.6: DNS configuration requires deployment structure

### File List

**Created:**
- ✅ `pnpm-workspace.yaml` - Monorepo workspace configuration
- ✅ `package.json` (root) - Root package with dev scripts
- ✅ `docker-compose.yml` - PostgreSQL + Redis services
- ✅ `.gitignore` - Git ignore patterns
- ✅ `.env.example` (root) - Root environment variables template
- ✅ `packages/design-system/tsup.config.ts` - Design system build config
- ✅ `packages/web/package.json` - Remix app configuration
- ✅ `packages/web/vite.config.ts` - Vite config for Remix
- ✅ `packages/web/vitest.config.ts` - Vitest configuration
- ✅ `packages/web/tsconfig.json` - TypeScript config
- ✅ `packages/web/.env.example` - Frontend environment variables
- ✅ `packages/web/app/root.tsx` - Remix root layout
- ✅ `packages/web/app/entry.client.tsx` - Client entry point
- ✅ `packages/web/app/entry.server.tsx` - Server entry point
- ✅ `packages/web/app/routes/_index.tsx` - Index route
- ✅ `packages/web/tests/integration/api-connection.test.ts` - API integration test
- ✅ `apps/api/pyproject.toml` - Poetry dependencies
- ✅ `apps/api/pytest.ini` - Pytest configuration
- ✅ `apps/api/.env.example` - Backend environment variables
- ✅ `apps/api/talentbase/settings/__init__.py` - Settings module init
- ✅ `apps/api/talentbase/settings/base.py` - Base Django settings
- ✅ `apps/api/talentbase/settings/development.py` - Development settings
- ✅ `apps/api/talentbase/settings/production.py` - Production settings
- ✅ `apps/api/core/__init__.py` - Core module init
- ✅ `apps/api/core/views.py` - Health check endpoint
- ✅ `apps/api/core/tests/__init__.py` - Tests package init
- ✅ `apps/api/core/tests/test_database.py` - Database connection test
- ✅ `apps/api/core/tests/test_redis.py` - Redis connection test
- ✅ `apps/api/core/tests/test_health_endpoint.py` - Health endpoint test

**Modified:**
- ✅ `README.md` - Added Quick Start, Stack info, Commands, and Troubleshooting
- ✅ `apps/api/manage.py` - Updated to use settings.development
- ✅ `apps/api/talentbase/wsgi.py` - Updated to use settings.development
- ✅ `apps/api/talentbase/asgi.py` - Updated to use settings.development
- ✅ `apps/api/talentbase/urls.py` - Added health check endpoint
- ✅ `packages/web/package.json` - Added vitest scripts
