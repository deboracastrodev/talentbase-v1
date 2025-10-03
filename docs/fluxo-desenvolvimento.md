Fluxo Ideal de Desenvolvimento com BMad
1. Preparação Inicial (Já Concluído ✅)
✅ PRD criado
✅ Épicos detalhados
✅ Arquitetura de solução
✅ Cohesion check (92% readiness)
✅ Tech specs por epic
2. Fluxo de Implementação por Epic
Para cada epic, siga este fluxo:
Fase 1: Pre-Development (Antes de Codificar)
A. Análise de Padrões e Dependências
# Use bmm-pattern-detector para entender padrões existentes
bmad run bmm-pattern-detector --epic epic-1

# Use bmm-dependency-mapper para mapear dependências
bmad run bmm-dependency-mapper --epic epic-1

# Use bmm-codebase-analyzer se for brownfield
bmad run bmm-codebase-analyzer --path apps/api
B. Análise Técnica
# Use bmm-technical-evaluator para validar decisões técnicas
bmad run bmm-technical-evaluator --spec docs/tech-spec-epic-1.md
Fase 2: Development (Codificação)
A. Implementação Story por Story Para cada story dentro do epic:
Ler o Tech Spec da Story
Claude, implemente a Story 1.1 do tech-spec-epic-1.md:
- Configure o monorepo com pnpm workspaces
- Crie a estrutura de pastas
- Configure Django e Remix
Implementar Backend (Django)
Claude, implemente:
- Models da Story 1.2
- Serializers
- Views/ViewSets
- URLs
- Migrations
Implementar Frontend (Remix)
Claude, implemente:
- Routes da Story 1.4
- Components necessários
- API client integration
Testes
Claude, implemente testes para Story 1.1:
- Unit tests (Django)
- E2E tests (Playwright)
Fase 3: Review & Validation (Após Codificação)
A. Review de Código
# Use bmm-document-reviewer para validar implementação
bmad run bmm-document-reviewer --type implementation --story story-1.1
B. Análise de Dívida Técnica
# Use bmm-tech-debt-auditor para identificar tech debt
bmad run bmm-tech-debt-auditor --path apps/api/authentication
C. Análise de Testes
# Use bmm-test-coverage-analyzer para validar cobertura
bmad run bmm-test-coverage-analyzer --path apps/api
D. Validação de APIs
# Use bmm-api-documenter para documentar APIs
bmad run bmm-api-documenter --path apps/api
Fluxo Recomendado Sequencial
Epic 1: Foundation & Public Presence (Semanas 1-2)
# Semana 1
1. Story 1.1: Monorepo Setup
   - Claude implementa estrutura
   - Validação: pnpm install, poetry install funcionam

2. Story 1.2: Database Schema
   - Claude cria todos os models Django
   - Migrations aplicadas
   - bmm-pattern-detector: analisa padrões de models

3. Story 1.3: Design System Integration
   - Claude integra @talentbase/design-system
   - Componentes renderizam corretamente

# Semana 2
4. Story 1.4: Landing Page
   - Claude implementa routes/_index.tsx
   - SEO otimizado
   - bmm-document-reviewer: valida implementação

5. Story 1.5: CI/CD Pipeline
   - Claude cria .github/workflows/deploy.yml
   - Deploy para dev.salesdog.click funciona

6. Story 1.6: DNS & SSL
   - Claude configura Route 53 + ACM
   - HTTPS funcionando
Epic 2: Authentication (Semanas 2-4)
# Semana 3
1. Story 2.1-2.3: Registration & Login
   - Claude implementa auth flows
   - Token em httpOnly cookie
   - bmm-api-documenter: documenta endpoints de auth

# Semana 4
2. Story 2.4-2.7: Admin, Approval, RBAC, Email
   - Claude implementa admin dashboard
   - Workflow de aprovação
   - bmm-test-coverage-analyzer: valida cobertura >80%
Epic 3: Candidate Management (Semanas 4-7)
# Semana 5
1. Story 3.1: Multi-Step Profile Creation
   - Claude implementa form wizard
   - S3 upload com presigned URLs
   - bmm-pattern-detector: valida padrões de forms

# Semana 6
2. Story 3.2-3.3: Public Profiles & CSV Import
   - Claude implementa shareable links
   - Celery task para CSV import
   - bmm-codebase-analyzer: analisa qualidade do código

# Semana 7
3. Story 3.4-3.7: Admin Curation & Dashboard
   - Claude implementa ranking system
   - Dashboard do candidato
   - bmm-tech-debt-auditor: identifica melhorias
Epic 4: Company & Jobs (Semanas 7-10)
# Semana 8
1. Story 4.1-4.3: Company Profile & Job Posting
   - Claude implementa CRUD de vagas
   - Public job links
   - bmm-api-documenter: documenta APIs de jobs

# Semana 9
2. Story 4.4-4.5: Candidate Search & Favorites
   - Claude implementa filtros avançados
   - Sistema de favoritos
   - bmm-pattern-detector: analisa queries PostgreSQL

# Semana 10
3. Story 4.6-4.8: Applications & Admin
   - Claude implementa application flow
   - Admin job management
   - bmm-test-coverage-analyzer: valida E2E tests
Epic 5: Matching & Analytics (Semanas 10-12)
# Semana 11
1. Story 5.1-5.3: Matching Dashboard
   - Claude implementa algoritmo de match score
   - Notifications
   - Outcome tracking
   - bmm-dependency-mapper: mapeia dependências de matching

# Semana 12
2. Story 5.4-5.7: Analytics & Dashboards
   - Claude implementa analytics API
   - Redis cache
   - Dashboards finais
   - bmm-document-reviewer: valida completeness
Comandos BMad Práticos
Durante Development:
# Antes de começar story
bmad run bmm-requirements-analyst --story "Story 1.1" --validate-clarity

# Durante implementação
bmad run bmm-pattern-detector --detect-conventions

# Após implementação
bmad run bmm-code-reviewer --path apps/api/authentication/views.py
bmad run bmm-test-coverage-analyzer --threshold 80
Review de Epic Completo:
# Após completar Epic 1
bmad run bmm-document-reviewer --epic epic-1 --validate-completeness
bmad run bmm-tech-debt-auditor --epic epic-1 --generate-report
bmad run bmm-api-documenter --epic epic-1 --format openapi
Fluxo Ideal Resumido
Para cada Story:
📖 Ler Tech Spec → Entender requisitos
🔍 Análise (BMad Agents) → Pattern detector, dependency mapper
💻 Implementar (Claude) → Backend + Frontend + Tests
✅ Validar (BMad Agents) → Document reviewer, test coverage analyzer
📝 Documentar (BMad Agents) → API documenter
🚀 Deploy → CI/CD automático (develop branch)
Para cada Epic:
Pre-Epic: Technical evaluator + Codebase analyzer
Durante Epic: Implementação story por story
Post-Epic: Document reviewer + Tech debt auditor + Cohesion check
Exemplo Prático: Como Começar Amanhã
# 1. Começar Epic 1, Story 1.1
"Claude, implemente a Story 1.1 do tech-spec-epic-1.md:
Setup Monorepo Structure & Development Environment"

# 2. Claude implementa estrutura

# 3. Validar com BMad
bmad run bmm-pattern-detector --path . --detect-monorepo-patterns
bmad run bmm-dependency-mapper --path package.json

# 4. Testar manualmente
pnpm install
cd apps/api && poetry install
docker-compose up -d

# 5. Story 1.1 completa → Commit
git add .
git commit -m "feat(epic-1): setup monorepo structure (Story 1.1)"

# 6. Próxima story
"Claude, implemente Story 1.2: Database Schema"
Resumo do Fluxo Ideal:
✅ Já temos: PRD, Epics, Arquitetura, Tech Specs
🎯 Próximo: Implementar Epic 1, Story por Story
🤖 BMad Agents: Usar para análise, review, validação (não para codificação)
💻 Claude Code: Usar para implementação de código
🔄 Iteração: Story → Implementar → Validar → Deploy → Próxima Story