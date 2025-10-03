# 🐳 TalentBase - Docker Development Guide

Guia completo para desenvolvimento usando Docker e Makefile.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Quick Start](#quick-start)
- [Arquitetura](#arquitetura)
- [Comandos do Makefile](#comandos-do-makefile)
- [Desenvolvimento](#desenvolvimento)
- [Troubleshooting](#troubleshooting)

## Pré-requisitos

Apenas Docker é necessário!

- **Docker Desktop** 24+ ([Download](https://www.docker.com/products/docker-desktop/))
- **Make** (já vem com MacOS/Linux, no Windows use WSL2)

## Quick Start

```bash
# 1. Clone e entre no diretório
git clone <repo-url> talentbase-v1
cd talentbase-v1

# 2. Um comando para tudo
make dev

# Pronto! 🎉
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# Health:   http://localhost:8000/health/
```

## Arquitetura

### Serviços Docker

| Serviço | Container | Porta | Descrição |
|---------|-----------|-------|-----------|
| **web** | talentbase_web | 3000 | Remix frontend (Node 20 + pnpm) |
| **api** | talentbase_api | 8000 | Django backend (Python 3.11 + Poetry) |
| **postgres** | talentbase_postgres | 5432 | PostgreSQL 15 database |
| **redis** | talentbase_redis | 6379 | Redis 7 cache |

### Volumes

- `postgres_data` - Dados persistentes do PostgreSQL
- `api_static` - Arquivos estáticos do Django
- Bind mounts para hot reload (código local → container)

### Network

Todos os serviços estão na rede `talentbase_network` e podem se comunicar pelos nomes dos serviços:
- `api` → http://api:8000
- `postgres` → postgres:5432
- `redis` → redis:6379

## Comandos do Makefile

### 🎯 Essenciais

```bash
make help              # Lista todos os comandos disponíveis
make dev               # Setup completo + build + start + logs
make up                # Inicia todos os serviços
make down              # Para todos os serviços
make status            # Status de todos os containers
make logs              # Logs de todos os serviços (follow)
```

### 🔧 Desenvolvimento

```bash
make build             # Build das imagens Docker
make restart           # Restart todos os serviços
make restart-api       # Restart apenas API
make restart-web       # Restart apenas Web
make rebuild           # Clean rebuild completo
```

### 💾 Database

```bash
make migrate           # Rodar migrations do Django
make makemigrations    # Criar novas migrations
make createsuperuser   # Criar Django superuser
make db-shell          # Abrir psql shell
make db-reset          # Reset database (CUIDADO: apaga tudo)
```

### 📊 Logs & Monitoring

```bash
make logs              # Todos os logs
make logs-api          # Logs do backend
make logs-web          # Logs do frontend
make logs-postgres     # Logs do PostgreSQL
make logs-redis        # Logs do Redis
make health            # Health check de todos os serviços
```

### 🖥️ Shell Access

```bash
make shell-api         # Shell bash no container API
make shell-web         # Shell sh no container Web
make shell-postgres    # Shell no container PostgreSQL
make shell-redis       # Shell no container Redis
make db-shell          # PostgreSQL psql shell
```

### 🧪 Testing

```bash
make test              # Rodar todos os testes
make test-api          # Testes do backend (pytest)
make test-web          # Testes do frontend (vitest)
make test-integration  # Testes de integração
make coverage-api      # Coverage report do backend
make lint-api          # Lint do backend (ruff + black)
make lint-web          # Lint do frontend (TypeScript)
make format-api        # Format código do backend
```

### 🧹 Cleanup

```bash
make clean             # Para e remove containers
make clean-logs        # Limpar logs do Docker
make prune             # Remove todos os recursos não utilizados (CUIDADO)
```

### 🎨 Design System

```bash
make storybook         # Inicia Storybook (localmente)
make build-design-system  # Build do design system no container
```

## Desenvolvimento

### Workflow Típico

```bash
# 1. Iniciar ambiente
make dev

# 2. Trabalhar no código
# Os arquivos são sincronizados automaticamente (hot reload)

# 3. Ver logs em tempo real
make logs-api    # ou make logs-web

# 4. Criar migrations (se mudou models)
make makemigrations
make migrate

# 5. Rodar testes
make test-api

# 6. Parar ambiente
make down
```

### Hot Reload

**Frontend (Remix):**
- ✅ Arquivos `.tsx`, `.ts` em `packages/web/app/` → hot reload automático
- ✅ Design system em `packages/design-system/` → hot reload

**Backend (Django):**
- ✅ Arquivos `.py` → Django runserver detecta mudanças automaticamente
- ⚠️ Mudanças em `settings.py` → `make restart-api`

### Acessar Containers

```bash
# Executar comando único
docker compose exec api python manage.py shell

# Shell interativo
make shell-api
# Agora você está dentro do container!
> python manage.py dbshell
```

### Debug

**Backend (Django):**
```bash
# 1. Adicione breakpoint no código
import pdb; pdb.set_trace()

# 2. Anexe ao container
docker attach talentbase_api

# Agora você pode debugar!
```

**Frontend (Remix):**
```bash
# Logs do Vite mostram erros detalhados
make logs-web
```

### Variáveis de Ambiente

Cada serviço tem seu `.env`:
- `./apps/api/.env` - Backend
- `./packages/web/.env` - Frontend
- `./.env` - Root (opcional)

```bash
# Setup automático cria .env de .env.example
make setup
```

### Banco de Dados

**Reset Database:**
```bash
# CUIDADO: Apaga todos os dados!
make db-reset
```

**Backup:**
```bash
docker compose exec postgres pg_dump -U talentbase talentbase_dev > backup.sql
```

**Restore:**
```bash
docker compose exec -T postgres psql -U talentbase talentbase_dev < backup.sql
```

### Migrations

```bash
# Criar migration
make shell-api
> python manage.py makemigrations

# Aplicar migrations
make migrate

# Ver migrations aplicadas
make shell-api
> python manage.py showmigrations
```

## Troubleshooting

### Containers não iniciam

```bash
# Ver logs detalhados
docker compose logs api
docker compose logs web

# Reconstruir imagens
make rebuild
```

### Port Already in Use

```bash
# Verificar o que está usando a porta
lsof -ti:8000  # API
lsof -ti:3000  # Web

# Matar processo
kill -9 $(lsof -ti:8000)

# Ou mudar a porta no docker-compose.yml
```

### Banco de dados não conecta

```bash
# Verificar health do PostgreSQL
make health

# Ver logs do postgres
make logs-postgres

# Reiniciar apenas postgres
docker compose restart postgres

# Reset completo se necessário
make db-reset
```

### Mudanças no código não aparecem

```bash
# Frontend
make restart-web

# Backend
make restart-api

# Forçar rebuild
make rebuild
```

### Container fica travado

```bash
# Parar forçadamente
docker compose down --remove-orphans

# Limpar tudo e recomeçar
make clean
make build
make up
```

### Espaço em disco cheio

```bash
# Ver uso de espaço
docker system df

# Limpar recursos não utilizados
docker system prune -a --volumes

# Ou usar Makefile
make prune
```

### Erro "connection refused"

```bash
# Verificar se serviços estão rodando
make status

# Verificar network
docker network inspect talentbase-v1_talentbase_network

# Verificar health
make health
```

### Build falha

```bash
# Limpar cache do Docker
docker builder prune

# Build com cache limpo
docker compose build --no-cache

# Ver erros detalhados
docker compose build --progress=plain
```

## Comandos Úteis Docker

```bash
# Ver processos dentro de um container
docker compose top api

# Ver uso de recursos
docker stats

# Inspecionar container
docker inspect talentbase_api

# Ver rede
docker network ls
docker network inspect talentbase-v1_talentbase_network

# Ver volumes
docker volume ls
docker volume inspect talentbase-v1_postgres_data
```

## Production Build

```bash
# Build production images
make build-prod

# Ou manualmente
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## Dicas

1. **Use `make help`** - lista todos os comandos
2. **Use `make dev`** - setup completo de uma vez
3. **Use `make logs`** - para ver o que está acontecendo
4. **Use `make health`** - para verificar serviços
5. **Ctrl+C** sai dos logs mas NÃO para os containers
6. Use `make down` para realmente parar tudo
7. Mantenha os `.env` files atualizados
8. `make rebuild` resolve 90% dos problemas

## Recursos

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Makefile Tutorial](https://makefiletutorial.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Made with ❤️ for TalentBase Development**
