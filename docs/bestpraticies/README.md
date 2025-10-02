# TalentBase Documentation

**Projeto:** TalentBase - Recruitment SaaS Platform
**Stack:** Python/Django + TypeScript/React/Remix
**Status:** Living Documentation

## 📋 Índice Geral

### ⚠️ LEIA ANTES DE COMEÇAR (OBRIGATÓRIO)

Antes de implementar QUALQUER story, você DEVE ler:

1. **[Pre-Implementation Checklist](./PRE_IMPLEMENTATION_CHECKLIST.md)** ⭐ START HERE
2. **[Code Quality Standards](./CODE_QUALITY.md)**
3. **[Backend Best Practices](./BACKEND_BEST_PRACTICES.md)** (se backend)
4. **[Frontend Best Practices](./FRONTEND_BEST_PRACTICES.md)** (se frontend)

### 📚 Documentação de Qualidade

- **[Code Quality Standards](./CODE_QUALITY.md)** - Padrões obrigatórios de qualidade
- **[Linting e Formatação](./LINTING.md)** - Ferramentas e configurações
- **[Backend Best Practices](./BACKEND_BEST_PRACTICES.md)** - Python/Django
- **[Frontend Best Practices](./FRONTEND_BEST_PRACTICES.md)** - TypeScript/React/Remix
- **[Pre-Implementation Checklist](./PRE_IMPLEMENTATION_CHECKLIST.md)** - Checklist antes de começar

### 🏗️ Arquitetura

- **[Solution Architecture](../epics/solution-architecture.md)** - Visão geral da arquitetura
- **[Tech Specs](../epics/)** - Especificações técnicas dos Epics

### 📖 Stories

- **[Stories](../stories/)** - User stories para implementação
  - [Story 1.0](../stories/story-1.0.md) - Django Project Setup ✅
  - [Story 1.1](../stories/story-1.1.md) - Remix Frontend Setup ✅
  - [Story 1.2](../stories/story-1.2.md) - Database Schema (Draft)

### 🔧 Setup e Desenvolvimento

- **[Docker Setup](../../DOCKER.md)** - Ambiente Docker
- **[Makefile Commands](../../Makefile)** - Comandos de desenvolvimento

## 🚀 Quick Start

### Para Novos Desenvolvedores

```bash
# 1. Clone o repositório
git clone <repo-url>
cd talentbase-v1

# 2. Configure ambiente
make setup

# 3. Suba os serviços
make up

# 4. Acesse
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin
```

### Antes de Implementar uma Story

1. ✅ Ler a [Story](../stories/) completa
2. ✅ Ler o [Pre-Implementation Checklist](./PRE_IMPLEMENTATION_CHECKLIST.md)
3. ✅ Ler os Best Practices relevantes
4. ✅ Configurar ambiente de desenvolvimento
5. ✅ Criar branch: `git checkout -b feature/story-X-Y`

### Workflow de Desenvolvimento

```bash
# Implementar feature
# - Seguir Best Practices
# - Escrever testes
# - Manter código limpo

# Validar código
make lint              # Linting
make format            # Formatação
make test              # Testes
make typecheck         # Type checking

# Commit
git add .
git commit -m "feat: implement feature X"

# Push e criar PR
git push origin feature/story-X-Y
gh pr create
```

## 📊 Code Quality

### Ferramentas

**Backend:**
- Black - Formatação
- Ruff - Linting
- mypy - Type checking
- pytest - Testes

**Frontend:**
- ESLint - Linting
- Prettier - Formatação
- TypeScript - Type checking
- Vitest - Testes

### Comandos Rápidos

```bash
# Validação completa
make lint              # Backend + Frontend
make format            # Formatar tudo
make test              # Rodar todos os testes

# Backend apenas
make lint-api
make format-api
make test-api
make coverage-api

# Frontend apenas
make lint-web
make format-web
make typecheck
make test-web
```

### Métricas Obrigatórias

| Métrica | Meta | Crítico |
|---------|------|---------|
| Cobertura de Testes | >= 80% | >= 60% |
| Complexidade Ciclomática | < 10 | < 15 |
| Linhas por Função | < 50 | < 100 |
| Warnings de Linter | 0 | < 5 |
| Erros de Type Check | 0 | 0 |

## 🎯 Princípios Fundamentais

### Backend

1. **Clean Architecture** - Camadas bem definidas
2. **Services para Lógica** - Models apenas estrutura de dados
3. **Thin Controllers** - Views apenas coordenam
4. **Type Hints** - Todas as funções
5. **Testes** - >= 80% cobertura

### Frontend

1. **Design System First** - Sempre usar @talentbase/design-system
2. **Componentização** - Single Responsibility
3. **TypeScript Strict** - Sem `any`
4. **Remix Patterns** - Server-side data fetching
5. **Acessibilidade** - Semântica e ARIA

## 📁 Estrutura do Projeto

```
talentbase-v1/
├── apps/
│   └── api/                    # Django backend
│       ├── core/              # BaseModel e utils
│       ├── authentication/    # User model
│       ├── candidates/        # Perfis de candidatos
│       ├── companies/         # Perfis de empresas
│       ├── jobs/              # Vagas
│       ├── applications/      # Candidaturas
│       └── matching/          # Ranking e matching
├── packages/
│   ├── design-system/         # Componentes reutilizáveis
│   └── web/                   # Remix frontend
│       ├── app/
│       │   ├── routes/       # Páginas (file-based routing)
│       │   ├── components/   # Componentes de negócio
│       │   └── lib/          # Utilitários
│       └── tests/
├── docs/                      # Esta documentação
│   ├── CODE_QUALITY.md
│   ├── BACKEND_BEST_PRACTICES.md
│   ├── FRONTEND_BEST_PRACTICES.md
│   ├── PRE_IMPLEMENTATION_CHECKLIST.md
│   ├── epics/                # Tech specs
│   └── stories/              # User stories
├── docker-compose.yml
├── Makefile                   # Comandos de desenvolvimento
└── .env                       # Variáveis de ambiente
```

## 🔗 Links Úteis

### Documentação Técnica

- [Django](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Remix](https://remix.run/docs)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Ferramentas

- [Black](https://black.readthedocs.io/)
- [Ruff](https://docs.astral.sh/ruff/)
- [ESLint](https://eslint.org/docs/)
- [Prettier](https://prettier.io/docs/)
- [pytest](https://docs.pytest.org/)
- [Vitest](https://vitest.dev/)

### Recursos

- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Two Scoops of Django](https://www.feldroy.com/books/two-scoops-of-django-3-x)

## 🤝 Contribuindo

### Code Review

PRs serão revisados com base em:
- ✅ Seguir Best Practices
- ✅ Testes passando (>= 50% cobertura)
- ✅ Linters sem warnings
- ✅ Type checking sem erros
- ✅ Arquitetura correta
- ✅ Documentação atualizada

### Padrões de Commit

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração de código
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

### Criando PRs

Incluir no PR:
- Link para a story
- Resumo das mudanças
- Screenshots (se UI)
- Passos para testar
- Checklist de validações

## 📞 Suporte

- **Dúvidas de código:** Code review no PR
- **Bugs:** Criar issue no GitHub
- **Dúvidas de arquitetura:** Consultar Tech Lead

## 📈 Status do Projeto

### Completed Stories

- ✅ Story 1.0 - Django Project Setup
- ✅ Story 1.1 - Remix Frontend Setup

### In Progress

- 🚧 Story 1.2 - Database Schema

### Próximas

- Epic 2 - Authentication & Authorization
- Epic 3 - Candidate Management
- Epic 4 - Company & Job Management
- Epic 5 - Matching & Ranking

---

**Última Atualização:** 2025-10-02
**Versão da Documentação:** 1.0
