# TalentBase

> Plataforma de recrutamento e seleção com foco em vagas de vendas no setor de tecnologia.

## 🔧 Pré-requisitos

Antes de iniciar o desenvolvimento, certifique-se de ter todas as ferramentas necessárias instaladas. Use o script de verificação automática:

```bash
./scripts/check-prerequisites.sh
```

### Ferramentas Requeridas

**Frontend / Build:**
- **Node.js 20+** ([Download](https://nodejs.org/))
- **pnpm 8.14+** ([Instalação](https://pnpm.io/installation))
  ```bash
  npm install -g pnpm
  ```

**Backend / Python:**
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Poetry 1.7+** ([Instalação](https://python-poetry.org/docs/#installation))
  ```bash
  curl -sSL https://install.python-poetry.org | python3 -
  ```

**Containers:**
- **Docker 24+** ([Docker Desktop](https://www.docker.com/products/docker-desktop/))
- **Docker Compose** (incluído no Docker Desktop)

**Cloud / Deploy:**
- **AWS CLI v2** ([Instalação](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))
- **AWS Credentials configuradas**
  ```bash
  aws configure
  # Você precisará de: Access Key ID, Secret Access Key, Region (us-east-1)
  ```

### Verificação Rápida

Execute o script de verificação para validar seu ambiente:

```bash
./scripts/check-prerequisites.sh
```

**Output esperado:**
```
✅ Node.js v20.x.x
✅ pnpm 8.x.x
✅ Python 3.11.x
✅ Poetry 1.7.x
✅ Docker 24.x.x
✅ Docker Compose 2.x.x
✅ AWS CLI 2.x.x
✅ AWS CLI configurado
✅ Domínio salesdog.click configurado no Route 53

✅ Todos os pré-requisitos essenciais atendidos! Pronto para Story 1.1
```

### Troubleshooting

**Node.js ou pnpm não encontrado:**
- Baixe Node.js LTS de https://nodejs.org/
- Instale pnpm globalmente: `npm install -g pnpm`

**Python ou Poetry não encontrado:**
- Baixe Python de https://www.python.org/downloads/
- Instale Poetry: `curl -sSL https://install.python-poetry.org | python3 -`

**Docker não encontrado:**
- Instale Docker Desktop: https://www.docker.com/products/docker-desktop/
- No Mac/Windows, Docker Compose já vem incluído

**AWS CLI não configurado:**
- Instale AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
- Configure credenciais: `aws configure`
- Entre em contato com admin do projeto para obter Access Keys

## 🚀 Quick Start

**Escolha uma das opções abaixo:**

### Opção 1: Docker (Recomendado) 🐳

**Desenvolvimento completo em containers - sem instalar dependências localmente!**

```bash
# 1. Clonar repositório
git clone <repo-url> talentbase-v1
cd talentbase-v1

# 2. Setup completo com um comando
make dev

# Pronto! Acesse:
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# Health:   http://localhost:8000/health/
```

**Comandos úteis do Makefile:**

```bash
make help              # Ver todos os comandos disponíveis
make up                # Iniciar serviços
make down              # Parar serviços
make logs              # Ver logs (CTRL+C para sair)
make logs-api          # Logs apenas do backend
make logs-web          # Logs apenas do frontend
make migrate           # Rodar migrations do Django
make test              # Rodar todos os testes
make shell-api         # Shell do container API
make shell-web         # Shell do container Web
make status            # Status dos serviços
make health            # Health check de todos os serviços
make restart           # Reiniciar todos os serviços
make clean             # Parar e remover containers
```

---

### Opção 2: Desenvolvimento Local

**Requer Node.js, Python, pnpm, Poetry, PostgreSQL e Redis instalados.**

#### 1. Clonar o Repositório

```bash
git clone <repo-url> talentbase-v1
cd talentbase-v1
```

#### 2. Setup Automático

```bash
# Executa instalação completa e inicia serviços
pnpm setup
```

Este comando irá:
- ✅ Instalar dependências Node (pnpm install)
- ✅ Iniciar Docker services (PostgreSQL + Redis)
- ✅ Instalar dependências Python (poetry install)
- ✅ Executar migrations do Django

#### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivos de exemplo
cp .env.example .env
cp packages/web/.env.example packages/web/.env
cp apps/api/.env.example apps/api/.env
```

#### 4. Iniciar Servidores de Desenvolvimento

```bash
# Terminal 1: Frontend (Remix)
pnpm dev:web
# Acesse: http://localhost:3000

# Terminal 2: Backend (Django)
pnpm dev:api
# Acesse: http://localhost:8000/health/
```

Ou inicie ambos simultaneamente:

```bash
pnpm dev:all
```

#### 5. Verificar Serviços

```bash
# Health check do backend
curl http://localhost:8000/health/

# Deve retornar:
# {"status": "healthy", "database": "connected", "cache": "connected"}
```

## 📦 Estrutura do Projeto

```
talentbase-v1/
├── packages/
│   ├── design-system/         # Shared UI components (React + Tailwind)
│   └── web/                   # Remix SSR frontend
├── apps/
│   └── api/                   # Django REST backend
├── docs/
│   ├── design-system/         # Documentação do DS
│   ├── epics/                 # Epic specs & architecture
│   ├── stories/               # User stories & tasks
│   └── site/                  # Assets da landing page
├── docker-compose.yml         # PostgreSQL + Redis
├── pnpm-workspace.yaml        # Monorepo config
└── bmad/                      # BMad framework
```

## 🎨 Design System

O Design System está em `packages/design-system/` e inclui:

### Componentes (11 total)
- **Button** - Botões com 6 variantes
- **Card** - Cards com sub-componentes
- **Input** - Inputs com validação
- **Badge** - Badges de status
- **Avatar** - Avatares circulares
- **CandidateCard** - Card profissional de candidato
- **SearchBar** - Busca com filtros
- **Select** - Dropdown
- **Textarea** - Área de texto
- **Checkbox** - Checkbox
- **Radio** - Radio button

### Rodar Localmente

```bash
cd packages/design-system
npm install
npm run dev
```

Acesse: http://localhost:6006

### Ver Online

🚀 **Storybook Deploy:** Em breve no GitHub Pages

## 🛠️ Stack Técnica

**Frontend:**
- **Framework:** Remix 2.14+ (SSR + client hydration)
- **UI Library:** React 18.2+
- **Styling:** Tailwind CSS 3.4+
- **Components:** Design System próprio (workspace dependency)
- **Build:** Vite 5.1+
- **Language:** TypeScript 5.1+

**Backend:**
- **Framework:** Django 5.0+
- **API:** Django REST Framework 3.14+
- **Language:** Python 3.11+
- **Package Manager:** Poetry 1.7+

**Database & Cache:**
- **Database:** PostgreSQL 15+ (Docker)
- **Cache:** Redis 7.2+ (Docker)
- **ORM:** Django ORM

**Development:**
- **Monorepo:** pnpm workspaces
- **Containerization:** Docker Compose
- **CI/CD:** GitHub Actions (to be configured)
- **Deploy:** AWS (planned)

## 📚 Comandos Úteis

### Desenvolvimento

```bash
# Frontend
pnpm dev:web                    # Inicia Remix dev server (porta 3000)
pnpm build:web                  # Build production do frontend
pnpm build:design-system        # Build do design system

# Backend
pnpm dev:api                    # Inicia Django dev server (porta 8000)
cd apps/api && poetry run python manage.py migrate    # Rodar migrations
cd apps/api && poetry run python manage.py createsuperuser    # Criar admin user

# Docker
pnpm docker:up                  # Inicia PostgreSQL + Redis
pnpm docker:down                # Para e remove containers

# Testes
pnpm test                       # Roda testes em todos os packages
```

### Troubleshooting

**Problema:** pnpm workspace dependency não resolve

```bash
# Solução: Reinstalar dependências
rm -rf node_modules packages/*/node_modules
pnpm install
```

**Problema:** PostgreSQL connection refused

```bash
# Verificar se container está rodando
docker-compose ps

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar serviço
docker-compose restart postgres
```

**Problema:** Django migrations fail

```bash
# Verificar conexão com database
psql -h localhost -U talentbase -d talentbase_dev

# Dropar e recriar database (cuidado!)
docker-compose down -v
docker-compose up -d
cd apps/api && poetry run python manage.py migrate
```

**Problema:** CORS errors no browser

```bash
# Verificar configuração CORS no Django
# Adicionar origem do frontend em CORS_ALLOWED_ORIGINS
# Reiniciar servidor Django
```

**Problema:** Remix build falha

```bash
# Verificar design system build
cd packages/design-system && pnpm build

# Reinstalar dependências
cd packages/web && pnpm install
```

## 📝 Planejamento

Veja [docs/planejamento/index.md](docs/planejamento/index.md) para detalhes completos.

## 🚀 Roadmap

- [x] Design System base
- [x] Componentes de formulário
- [x] Storybook configurado
- [x] GitHub Actions para deploy
- [ ] Aplicação principal (React)
- [ ] API REST (Backend)
- [ ] Deploy AWS
- [ ] Domínio salesdog.click

## 📄 Licença

MIT © TalentBase
