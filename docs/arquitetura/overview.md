# TalentBase - Arquitetura da Aplicação

> Plataforma de recrutamento e seleção especializada em profissionais de vendas (SDR/BDR, Account Executive/Closer, CSM).
>
> **Modelo de Negócio:** Headhunter de recolocação pessoal para área comercial, conectando empresas a profissionais qualificados de vendas.

---

## Stack Tecnológica

### Frontend
- **Framework:** Remix (React)
- **UI Library:** React 18+
- **Design System:** @talentbase/design-system (custom)
- **Styling:** Tailwind CSS 3.4+
- **State Management:** Remix loaders/actions + Context API
- **Forms:** Remix Forms + React Hook Form
- **HTTP Client:** Remix fetch (native)
- **Icons:** Lucide React
- **Build Tool:** Vite

### Backend
- **Framework:** Django 5.x + Django REST Framework (DRF)
- **Language:** Python 3.11+
- **Database:** PostgreSQL 15+
- **Authentication:** Django REST Framework JWT / Token Auth
- **API:** REST (JSON)
- **File Storage:** AWS S3
- **Task Queue:** Celery + Redis
- **Cache:** Redis

### Infrastructure
- **Hosting:** AWS (EC2 / ECS)
- **DNS:** salesdog.click
- **CI/CD:** GitHub Actions
- **Container:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt

---

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      USUÁRIOS                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Public  │  │  Admin   │  │Candidate │  │ Company  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼────────────┼─────────────┼─────────────┼──────────┘
        │            │             │             │
        ▼            ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Remix)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Landing     │  │  Dashboard   │  │  Profiles    │      │
│  │  Page        │  │  Admin/User  │  │  Shareable   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │         Design System Components                 │       │
│  └──────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Django + DRF)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │  Candidates  │  │   Companies  │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Jobs     │  │   Matching   │  │   Rankings   │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │    AWS S3    │      │
│  │   (Primary)  │  │   (Cache)    │  │   (Files)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Estrutura do Projeto (Monorepo)

```
talentbase-v1/
├── packages/
│   ├── design-system/          # Design System React Components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   └── web/                    # Frontend Remix App
│       ├── app/
│       │   ├── routes/
│       │   │   ├── _public/         # Public routes (landing)
│       │   │   ├── _auth/           # Auth routes (login, register)
│       │   │   ├── admin/           # Admin dashboard
│       │   │   ├── candidate/       # Candidate dashboard
│       │   │   ├── company/         # Company dashboard
│       │   │   └── share/           # Shareable profiles/jobs
│       │   │
│       │   ├── components/          # App-specific components
│       │   ├── lib/                 # Utilities, API client
│       │   ├── styles/              # Global styles
│       │   └── root.tsx
│       │
│       ├── public/
│       └── package.json
│
├── apps/
│   └── api/                    # Backend Django App
│       ├── config/                  # Django settings
│       ├── apps/
│       │   ├── authentication/
│       │   ├── candidates/
│       │   ├── companies/
│       │   ├── jobs/
│       │   ├── matching/
│       │   └── rankings/
│       │
│       ├── requirements/
│       │   ├── base.txt
│       │   ├── development.txt
│       │   └── production.txt
│       │
│       ├── manage.py
│       └── Dockerfile
│
├── docs/
│   ├── arquitetura/
│   ├── design-system/
│   └── planejamento/
│
├── infrastructure/
│   ├── docker-compose.yml
│   ├── nginx/
│   └── scripts/
│
└── .github/
    └── workflows/
```

---

## Áreas da Aplicação

### 1. **Public (Landing Page)**
- Homepage
- Sobre
- Como funciona
- Contato

**Rotas:**
- `/` - Home
- `/about` - Sobre
- `/how-it-works` - Como funciona
- `/contact` - Contato

---

### 2. **Admin Dashboard**
- Gerenciamento de candidatos
- Gerenciamento de vagas
- Gerenciamento de empresas
- Rankings e analytics
- Matching manual

**Rotas:**
- `/admin` - Dashboard overview
- `/admin/candidates` - Lista de candidatos
- `/admin/candidates/:id` - Perfil do candidato
- `/admin/companies` - Lista de empresas
- `/admin/companies/:id` - Perfil da empresa
- `/admin/jobs` - Lista de vagas
- `/admin/jobs/:id` - Detalhes da vaga
- `/admin/rankings` - Rankings de candidatos
- `/admin/matching` - Ferramenta de matching

---

### 3. **Candidate Dashboard**
- Perfil pessoal
- Minhas aplicações
- Vagas recomendadas
- Configurações

**Rotas:**
- `/candidate` - Dashboard
- `/candidate/profile` - Meu perfil
- `/candidate/applications` - Minhas aplicações
- `/candidate/jobs` - Vagas para mim
- `/candidate/settings` - Configurações

---

### 4. **Company Dashboard**
- Perfil da empresa
- Minhas vagas
- Candidatos recomendados
- Candidatos favoritos
- Configurações

**Rotas:**
- `/company` - Dashboard
- `/company/profile` - Perfil da empresa
- `/company/jobs` - Minhas vagas
- `/company/jobs/new` - Criar vaga
- `/company/jobs/:id/edit` - Editar vaga
- `/company/candidates` - Buscar candidatos
- `/company/favorites` - Candidatos favoritados
- `/company/settings` - Configurações

---

### 5. **Shareable Profiles**
- Perfil público do candidato
- Detalhes públicos da vaga

**Rotas:**
- `/share/candidate/:token` - Perfil público do candidato
- `/share/job/:token` - Vaga pública

---

## Roles e Permissões

| Role | Área | Permissões |
|------|------|------------|
| **Admin** | Admin Dashboard | Full access - CRUD tudo |
| **Candidate** | Candidate Dashboard | Ver vagas, aplicar, editar próprio perfil |
| **Company** | Company Dashboard | CRUD vagas próprias, ver candidatos, favoritar |
| **Public** | Landing Page | Visualização apenas |

---

## Fluxos Principais

### 1. Cadastro de Candidato
```
1. Candidato acessa /register
2. Preenche formulário (nome, email, senha, área, senioridade)
3. POST /api/auth/register
4. Email de confirmação enviado
5. Redirect para /candidate/profile (completar perfil)
6. Candidato preenche: skills, experiência, salário desejado, etc
7. Status inicial: "incomplete"
```

### 2. Cadastro de Empresa
```
1. Empresa acessa /register/company
2. Preenche dados (nome empresa, CNPJ, contato)
3. POST /api/auth/register/company
4. Admin aprova cadastro (status: "pending" → "active")
5. Empresa recebe acesso ao dashboard
```

### 3. Criar Vaga
```
1. Company acessa /company/jobs/new
2. Preenche: título, descrição, skills, salário, senioridade
3. POST /api/jobs
4. Vaga criada com status "active"
5. Sistema gera link compartilhável /share/job/:token
```

### 4. Buscar Candidatos
```
1. Company acessa /company/candidates
2. Aplica filtros (skills, senioridade, localização)
3. GET /api/candidates?skills=react,typescript&level=senior
4. Visualiza cards de candidatos
5. Clica em "Ver Perfil" → Detalhes completos
6. Pode favoritar candidato
```

### 5. Matching (Manual - Admin)
```
1. Admin acessa /admin/matching
2. Seleciona vaga
3. Sistema sugere candidatos baseado em:
   - Skills match
   - Senioridade match
   - Salário compatível
   - Ranking do candidato
4. Admin confirma match
5. Notificação enviada para candidato e empresa
```

---

## Próximos Passos

1. **Database Schema** - Modelar entidades e relacionamentos
2. **API Endpoints** - Definir contratos REST
3. **Authentication** - Implementar JWT/Token auth
4. **Setup Django Project** - Criar estrutura backend
5. **Setup Remix Project** - Criar estrutura frontend
6. **CI/CD Pipeline** - GitHub Actions para deploy
