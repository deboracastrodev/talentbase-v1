# Epic Alignment Matrix - TalentBase

**Data:** 2025-10-01
**Versão:** 1.0
**Gerado por:** Cohesion Check Workflow (Step 7)

---

## Visão Geral da Matriz

Esta matriz demonstra o alinhamento entre os 5 épicos do TalentBase e os componentes arquiteturais que os implementam.

**Prontidão Geral:** ✅ **97% Ready**

---

## Matriz Completa de Alinhamento

| Epic | Stories | Django Apps | Remix Routes | Modelos de Dados | Endpoints API | Serviços Externos | Prontidão | Notas |
|------|---------|-------------|--------------|------------------|---------------|-------------------|-----------|-------|
| **Epic 1: Foundation & Public Presence** | 6 | • `core`<br>• `authentication` | • `_index.tsx`<br>• `auth.login.tsx`<br>• `auth.register.tsx` | • User (base model) | • `POST /api/v1/auth/login`<br>• `POST /api/v1/auth/register`<br>• `GET /api/v1/auth/me` | • AWS S3<br>• CloudFront<br>• ACM<br>• Route 53<br>• GitHub Actions | ✅ **100%** | Infraestrutura e landing page completos |
| **Epic 2: Authentication & User Management** | 7 | • `authentication` | • `auth.login.tsx`<br>• `auth.register.tsx`<br>• `admin/users/index.tsx`<br>• `admin/users/[id].tsx` | • User (roles: admin, candidate, company)<br>• User status workflow | • `POST /api/v1/auth/register/candidate`<br>• `POST /api/v1/auth/register/company`<br>• `GET /api/v1/admin/users`<br>• `POST /api/v1/admin/users/:id/approve` | • SendGrid / AWS SES<br>• Email templates | ✅ **100%** | RBAC, company approval workflow completos |
| **Epic 3: Candidate Management System** | 7 | • `candidates` | • `candidate/index.tsx`<br>• `candidate/profile.tsx`<br>• `profile.$token.tsx`<br>• `admin/candidates/index.tsx`<br>• `admin/rankings/index.tsx`<br>• `admin/import/candidates.tsx` | • CandidateProfile<br>• Experience<br>• Skill<br>• Ranking | • `POST /api/v1/candidates`<br>• `PATCH /api/v1/candidates/:id`<br>• `GET /api/v1/candidates/profile/:token`<br>• `POST /api/v1/candidates/import-csv`<br>• `POST /api/v1/admin/rankings`<br>• `GET /api/v1/admin/rankings/top10` | • AWS S3 (fotos, CSV)<br>• YouTube (embed vídeo)<br>• SendGrid (notificações) | ⚠️ **95%** | CSV import: detalhar estratégia de duplicatas |
| **Epic 4: Company & Job Management** | 8 | • `companies`<br>• `jobs`<br>• `applications` | • `company/index.tsx`<br>• `company/profile.tsx`<br>• `company/jobs/index.tsx`<br>• `company/candidates/index.tsx`<br>• `company/favorites/index.tsx`<br>• `job.$token.tsx`<br>• `candidate/jobs/index.tsx`<br>• `candidate/applications/index.tsx` | • CompanyProfile<br>• JobPosting<br>• Application<br>• Favorite | • `POST /api/v1/companies`<br>• `PATCH /api/v1/companies/:id`<br>• `POST /api/v1/jobs`<br>• `GET /api/v1/jobs/:token`<br>• `GET /api/v1/candidates?filters`<br>• `POST /api/v1/favorites`<br>• `POST /api/v1/applications` | • AWS S3 (logos)<br>• SendGrid (application notifications) | ✅ **100%** | Search, favorites, application workflow completos |
| **Epic 5: Matching & Analytics** | 7 | • `matching`<br>• `core` (analytics) | • `admin/matching/index.tsx`<br>• `admin/dashboard/index.tsx`<br>• `admin/matches/index.tsx`<br>• `candidate/matches/index.tsx`<br>• `company/matches/index.tsx` | • Match<br>• MatchOutcome | • `POST /api/v1/matching/manual`<br>• `GET /api/v1/matching/suggestions/:job_id`<br>• `PATCH /api/v1/matches/:id`<br>• `GET /api/v1/admin/analytics` | • SendGrid (match notifications)<br>• Redis (analytics cache) | ⚠️ **90%** | Match notification templates podem ser detalhados |

---

## Detalhamento por Epic

### Epic 1: Foundation & Public Presence (100% Ready)

**Componentes Arquiteturais:**

#### Backend (Django)
- **App:** `core` - Shared utilities, base models, middleware
- **App:** `authentication` - User model (base), login/register endpoints

#### Frontend (Remix)
- **Route:** `_index.tsx` - Landing page (público)
- **Route:** `auth.login.tsx` - Login form
- **Route:** `auth.register.tsx` - Registration (candidate/company)

#### Infraestrutura (AWS)
- **S3:** Static assets, uploads
- **CloudFront:** CDN global
- **ACM:** SSL certificates
- **Route 53:** DNS (salesdog.click)
- **ECS Fargate:** Container orchestration
- **GitHub Actions:** CI/CD pipeline

**Status:** ✅ Todos os componentes definidos, infraestrutura documentada

---

### Epic 2: Authentication & User Management (100% Ready)

**Componentes Arquiteturais:**

#### Backend (Django)
- **Models:** User (email, role: admin/candidate/company, status)
- **Permissions:** RBAC (IsAdminOrOwner, custom role checks)
- **Views:** Registration (candidate/company), approval workflow

#### Frontend (Remix)
- **Routes:** Login, register (candidate), register (company)
- **Admin Routes:** User management (`admin/users/index.tsx`, `admin/users/[id].tsx`)

#### Integrations
- **Email Service:** SendGrid / AWS SES
- **Templates:** Registration confirmation, approval/rejection, status changes

**Status:** ✅ RBAC completo, company approval workflow definido

---

### Epic 3: Candidate Management System (95% Ready)

**Componentes Arquiteturais:**

#### Backend (Django)
- **Models:**
  - CandidateProfile (name, position, experience, tools, video_url, public_token)
  - Experience (work history)
  - Skill (proficiencies)
  - Ranking (admin scoring 0-100)
- **Views:** CRUD, CSV import (Celery task), public profile endpoint

#### Frontend (Remix)
- **Candidate Routes:** Dashboard, profile (create/edit), profile view
- **Admin Routes:** Candidate list, edit, rankings, CSV import UI
- **Public Route:** `profile.$token.tsx` (shareable link, no auth)

#### Integrations
- **AWS S3:** Profile photos, CSV upload
- **YouTube:** Embedded video (iframe)
- **SendGrid:** Status change notifications

**Gap Menor:**
- ⚠️ **Story 3.3 (CSV Import):** Estratégia de duplicatas (skip vs update) não especificada
  - **Recomendação:** Adicionar em tech spec - Default: skip duplicates (log in report)

**Status:** ⚠️ 95% ready - Minor clarification needed

---

### Epic 4: Company & Job Management (100% Ready)

**Componentes Arquiteturais:**

#### Backend (Django)
- **Models:**
  - CompanyProfile (name, CNPJ, industry, logo)
  - JobPosting (title, position, seniority, salary, skills, share_token)
  - Application (job, candidate, status, cover_letter)
  - Favorite (company favorites candidates, notes)
- **Views:** CRUD jobs, advanced candidate search (filters), application workflow

#### Frontend (Remix)
- **Company Routes:**
  - Dashboard, profile, jobs (create/list/edit)
  - Candidate search (`company/candidates/index.tsx`)
  - Favorites (`company/favorites/index.tsx`)
- **Candidate Routes:**
  - Job browse, job detail, apply modal
  - Applications tracking (`candidate/applications/index.tsx`)
- **Public Route:** `job.$token.tsx` (shareable job link)

#### Integrations
- **AWS S3:** Company logos
- **SendGrid:** Application notifications (to company), status updates (to candidate)

**Status:** ✅ Search, favorites, application workflow completos

---

### Epic 5: Matching & Analytics (90% Ready)

**Componentes Arquiteturais:**

#### Backend (Django)
- **Models:**
  - Match (job, candidate, created_by admin, status)
  - MatchOutcome (interview_scheduled, hired, rejected, dates)
- **Views:**
  - Manual matching endpoint
  - Suggestions algorithm (position + skills + seniority + ranking)
  - Analytics aggregation (candidates, companies, jobs, match rates)

#### Frontend (Remix)
- **Admin Routes:**
  - Matching dashboard (two-panel: job selector + candidate suggestions)
  - Match tracking (`admin/matches/index.tsx`)
  - Analytics dashboard (`admin/dashboard/index.tsx`)
- **Candidate Routes:** Matches view (`candidate/matches/index.tsx`)
- **Company Routes:** Matches view (`company/matches/index.tsx`)

#### Integrations
- **SendGrid:** Match notifications (candidate + company)
- **Redis:** Analytics cache (1h TTL)

**Gap Menor:**
- ⚠️ **Story 5.2 (Match Notifications):** Email template structure não detalhada
  - **Recomendação:** Adicionar em tech spec - Subject lines, body structure, CTAs

**Status:** ⚠️ 90% ready - Email template details recommended

---

## Requisitos Funcionais Mapeados

**Cobertura de FRs por Epic:**

| Epic | FRs Cobertos | Total FRs | Cobertura |
|------|--------------|-----------|-----------|
| **Epic 1** | FR1, FR2 (partial) | 2 | ✅ 100% |
| **Epic 2** | FR2 (complete), FR15 (partial) | 2 | ✅ 100% |
| **Epic 3** | FR3, FR4, FR5, FR13, FR16 | 5 | ⚠️ 95% (FR16 minor gap) |
| **Epic 4** | FR6, FR7, FR8, FR9, FR10, FR11 | 6 | ✅ 100% |
| **Epic 5** | FR12, FR14, FR15 (complete) | 3 | ⚠️ 90% (FR15 email templates) |

**Total FRs:** 16
**FRs Fully Covered:** 15 (93.75%)
**FRs Mostly Covered:** 1 (6.25%)

---

## Requisitos Não-Funcionais Atendidos

**Cobertura de NFRs pela Arquitetura:**

| NFR | Requirement | Soluções Arquiteturais | Epic Relacionado |
|-----|-------------|------------------------|------------------|
| **NFR1** | Performance (<2s page, <500ms API, <1s search) | Remix SSR, Redis cache, PostgreSQL indexes, `select_related` | Epic 1, 3, 4 |
| **NFR2** | Scalability (1000+ users, horizontal scaling) | AWS ECS auto-scaling, stateless backend, RDS Multi-AZ | Epic 1 |
| **NFR3** | Security (Token auth, RBAC, HTTPS, LGPD) | DRF Token + httpOnly cookie, RBAC permissions, CloudFront HTTPS, soft deletes | Epic 2 |
| **NFR4** | Reliability (99.5% uptime, backups) | ECS Multi-AZ, RDS daily backups (30-day), health checks | Epic 1 |
| **NFR5** | Usability (Responsive, WCAG 2.1 AA, validation) | Tailwind CSS, design system, Remix forms, DRF serializers | Todos os épicos |
| **NFR6** | Maintainability (Code standards, docs, type safety) | TypeScript, mypy, ESLint, OpenAPI docs, design system | Todos os épicos |
| **NFR7** | Deployment (CI/CD, env parity, rollback) | GitHub Actions, Docker, ECS task versioning, Django migrations | Epic 1 |
| **NFR8** | Data Integrity (Validation, FK constraints, audit) | DRF validation, PostgreSQL FK, timestamps, soft deletes | Todos os épicos |
| **NFR9** | i18n (Suporte PT-BR, BRL, ISO 8601) | Remix i18n (ready), conteúdo em português (MVP) | Todos os épicos |
| **NFR10** | SEO (Meta tags, OG, sitemap) | Remix meta export, semantic HTML, OG tags | Epic 1, 3, 4 |

**Total NFRs:** 10
**NFRs Fully Covered:** 10 (100%)

---

## Pontos de Integração Externa

**Serviços de Terceiros por Epic:**

| Serviço | Epic 1 | Epic 2 | Epic 3 | Epic 4 | Epic 5 | Configuração Necessária |
|---------|--------|--------|--------|--------|--------|------------------------|
| **AWS S3** | ✅ Static assets | - | ✅ Photos, CSV | ✅ Logos | - | Bucket, IAM, presigned URLs |
| **AWS RDS** | ✅ Database | ✅ User data | ✅ Candidates | ✅ Jobs | ✅ Matches | Multi-AZ, encryption, backups |
| **AWS ElastiCache** | ✅ Redis cache | - | - | ✅ Search cache | ✅ Analytics cache | Cluster, security groups |
| **AWS ECS** | ✅ Containers | - | - | - | - | Task definitions, auto-scaling |
| **AWS CloudFront** | ✅ CDN | - | - | - | - | Distribution, SSL |
| **AWS ACM** | ✅ SSL certs | - | - | - | - | Certificate for salesdog.click |
| **AWS Route 53** | ✅ DNS | - | - | - | - | Hosted zone |
| **AWS Secrets Manager** | ✅ Secrets | - | - | - | - | DB password, API keys |
| **SendGrid / AWS SES** | - | ✅ Auth emails | ✅ Status emails | ✅ Application emails | ✅ Match emails | API key, sender verification |
| **GitHub Actions** | ✅ CI/CD | - | - | - | - | Workflow, secrets |
| **YouTube** | - | - | ✅ Video embed | - | - | Iframe embed, URL validation |

**Total Serviços:** 11
**Documentados:** 11 (100%)

---

## Decisões Arquiteturais Críticas (ADRs)

**ADRs Relacionados aos Épicos:**

| ADR | Decisão | Epic Impactado | Status |
|-----|---------|----------------|--------|
| **ADR-001** | Modular Monolith over Microservices | Todos | ✅ Accepted |
| **ADR-002** | Remix SSR over SPA/Next.js | Epic 1, 3, 4 (UI) | ✅ Accepted |
| **ADR-003** | Token Auth in httpOnly Cookie | Epic 2 | ✅ Accepted |
| **ADR-004** | PostgreSQL JSONB for Skills/Requirements | Epic 3, 4 | ✅ Accepted |
| **ADR-005** | Manual Matching in MVP, AI Post-MVP | Epic 5 | ✅ Accepted |

---

## Resumo de Prontidão por Epic

```
Epic 1: Foundation & Public Presence          [████████████████████] 100%
Epic 2: Authentication & User Management       [████████████████████] 100%
Epic 3: Candidate Management System            [███████████████████░]  95%
Epic 4: Company & Job Management               [████████████████████] 100%
Epic 5: Matching & Analytics                   [██████████████████░░]  90%

PRONTIDÃO GERAL:                               [███████████████████░]  97%
```

---

## Próximos Passos (Step 9 - Tech Spec Generation)

**Tech Specs a Gerar:**

1. ✅ **tech-spec-epic-1.md** - Foundation & Public Presence (100% ready)
2. ✅ **tech-spec-epic-2.md** - Authentication & User Management (100% ready)
3. ⚠️ **tech-spec-epic-3.md** - Candidate Management (incluir: CSV duplicate strategy)
4. ✅ **tech-spec-epic-4.md** - Company & Job Management (100% ready)
5. ⚠️ **tech-spec-epic-5.md** - Matching & Analytics (incluir: Email template details)

**Adições Recomendadas nos Tech Specs:**

**tech-spec-epic-3.md:**
- ➕ Seção "CSV Import Duplicate Handling Strategy"
- ➕ Exemplos de validação de CSV (email format, required fields)

**tech-spec-epic-5.md:**
- ➕ Seção "Match Notification Email Templates"
- ➕ Subject lines, body structure, CTAs para candidate e company

---

**Matriz Gerada:** 2025-10-01
**Próximo Step:** Step 9 - Tech Spec Generation
**Status:** ✅ Aprovado para prosseguir
