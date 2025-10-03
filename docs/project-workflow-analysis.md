# Project Workflow Analysis

**Date:** 2025-10-01
**Project:** talentbase
**Analyst:** Debora

## Assessment Results

### Project Classification

- **Project Type:** Web application (SaaS Platform)
- **Project Level:** Level 3 (Full Product)
- **Instruction Set:** instructions-lg.md

### Scope Summary

- **Brief Description:** Plataforma de recrutamento e seleção especializada em profissionais de vendas (SDR/BDR, AE/Closer, CSM) para empresas de tecnologia. Modelo headhunter de recolocação pessoal com 3 áreas (Admin, Candidato, Empresa), perfis compartilháveis, rankings e matching.
- **Estimated Stories:** 25-35 stories
- **Estimated Epics:** 4-5 epics
- **Timeline:** 3-4 months MVP

### Context

- **Greenfield/Brownfield:** Greenfield (novo projeto) com dados existentes no Notion para migração
- **Existing Documentation:**
  - ✅ Product Brief (docs/planejamento/index.md)
  - ✅ Architecture Overview (docs/arquitetura/)
  - ✅ Design System (completo, em Storybook)
  - ✅ Database Schema definido
  - ✅ API Endpoints documentados
  - ✅ CSV de dados reais (docs/basedados/)
- **Team Size:** Small team (1-2 desenvolvedores)
- **Deployment Intent:** AWS (EC2/ECS) com GitHub Actions CI/CD, DNS salesdog.click já configurado

## Recommended Workflow Path

### Primary Outputs

1. **Product Requirements Document (PRD.md)** - Comprehensive PRD with:
   - Executive Summary
   - Problem Statement & Market Context
   - User Personas (Admin, Candidate, Company)
   - Product Vision & Goals
   - Features by Epic
   - User Stories
   - Success Metrics
   - Technical Requirements
   - Constraints & Assumptions

2. **Epic Breakdown (epics.md)** - Detailed epic planning:
   - Epic 1: Design System & Landing Page
   - Epic 2: Authentication & User Management
   - Epic 3: Candidate Management System
   - Epic 4: Company & Job Management
   - Epic 5: Rankings & Matching Engine

3. **Handoff to Solution Architecture Workflow** - After PRD completion, route to:
   - `bmad/bmm/workflows/3-solutioning/workflow.yaml` for detailed architecture
   - Technical specification generation
   - Implementation planning

### Workflow Sequence

1. ✅ **Assessment Complete** (this document)
2. **Generate PRD** using instructions-lg.md
   - Leverage existing architecture docs
   - Reference real data from CSV files
   - Incorporate design system context
3. **Generate Epic Breakdown**
   - Map features to epics
   - Define story outlines
   - Estimate effort
4. **Route to Solution Architecture**
   - Detailed technical specification
   - API design validation
   - Database optimization
   - Deployment architecture

### Next Actions

1. Load `instructions-lg.md` for Level 3 PRD generation
2. Use existing docs as input sources:
   - docs/planejamento/index.md (product vision)
   - docs/arquitetura/overview.md (technical context)
   - docs/arquitetura/database-schema.md (data models)
   - docs/basedados/*.csv (real candidate/job data)
3. Generate comprehensive PRD with all sections
4. Create epic breakdown aligned with MVP priorities
5. Validate against checklist
6. Hand off to architecture workflow

## Special Considerations

### Business Model Context
- **Headhunter de recolocação pessoal** para vendas em tech
- Inspirado em tryrefer.com (modelo de negócio)
- Foco em **3 posições principais**: SDR/BDR, Account Executive/Closer, CSM
- **Dados reais** já coletados no Notion (precisa migração)

### MVP Urgência Crítica
1. Design System (✅ já completo)
2. Landing Page
3. Sistema de cadastro (substituir Notion)
4. 3 áreas: Admin, Candidato, Empresa
5. Perfis compartilháveis (candidato + vaga)
6. Status de candidatos (disponível, inativo, sem contrato)
7. Rankings de candidatos
8. Busca/filtro de candidatos

### Evitar Over-Engineering
- MVP simples e funcional primeiro
- Matching **manual** no início (admin faz o match)
- Automação de matching vem depois
- Foco: substituir Notion rapidamente

### LGPD Compliance
- Dados reais sensíveis em docs/basedados/
- CPF deve ser criptografado
- Implementar consentimento e privacidade

## Technical Preferences Captured

### Stack Definida
**Frontend:**
- Remix (React framework)
- Tailwind CSS 3.4+
- @talentbase/design-system (custom, já criado)
- Lucide React (ícones)
- Vite (build tool)

**Backend:**
- Django 5.x + Django REST Framework
- Python 3.11+
- PostgreSQL 15+
- Redis (cache + Celery)
- AWS S3 (file storage)

**Infrastructure:**
- AWS (EC2/ECS)
- GitHub Actions (CI/CD)
- Docker + Docker Compose
- Nginx
- DNS: salesdog.click

### Architecture Pattern
- **Monorepo** structure
- REST API (JSON)
- Token-based authentication (DRF)
- 3 roles: admin, candidate, company
- Shareable public links (token-based)

### Design System
- ✅ Já completo em Storybook
- Componentes React reutilizáveis
- Design tokens definidos
- Paleta de cores da landing page
- Grid system e spacing
- Inspirado em Vert Capital design system

### API Design
- RESTful conventions
- Nomenclatura em inglês
- Frontend-first API design
- Filtros avançados (skills, seniority, position)
- Shareable links com tokens

### Deployment
- AWS CLI já configurado
- DNS salesdog.click pronto
- GitHub Actions para CI/CD
- Ambientes: staging + production

---

_This analysis serves as the routing decision for the adaptive PRD workflow and will be referenced by future orchestration workflows._
