# Code Quality Standards

**Status:** Living Document
**Última Atualização:** 2025-10-02
**Audiência:** Todos os desenvolvedores

## Visão Geral

Este documento define os padrões de qualidade de código obrigatórios para o projeto TalentBase. **Todas as implementações devem seguir estes padrões antes de serem consideradas completas.**

## 📋 Índice

- [Ferramentas de Code Quality](#ferramentas-de-code-quality)
- [Comandos Rápidos](#comandos-rápidos)
- [Padrões Gerais](#padrões-gerais)
- [Backend (Python/Django)](#backend-pythondjango)
- [Frontend (TypeScript/React)](#frontend-typescriptreact)
- [Processo de Validação](#processo-de-validação)
- [Métricas de Qualidade](#métricas-de-qualidade)

## Ferramentas de Code Quality

### Backend
- **Black** - Formatação automática de código
- **Ruff** - Linter rápido (substitui flake8, isort, pyflakes)
- **mypy** - Verificação de tipos estáticos
- **pytest** - Framework de testes
- **pytest-cov** - Cobertura de testes

### Frontend
- **ESLint** - Linter para TypeScript/JavaScript
- **Prettier** - Formatação automática de código
- **TypeScript** - Verificação de tipos
- **Vitest** - Framework de testes

## Comandos Rápidos

### Validação Completa (Backend + Frontend)

```bash
# Lint tudo
make lint

# Format tudo
make format

# Testes completos
make test

# Type checking
make typecheck
```

### Backend (Python/Django)

```bash
# Lint
make lint-api                    # Verifica
make format-api                  # Corrige automaticamente

# Testes
make test-api                    # Executa testes
make coverage-api                # Gera relatório de cobertura

# Comandos individuais
cd apps/api
poetry run black .               # Formata código
poetry run ruff check .          # Verifica linting
poetry run ruff check --fix .    # Corrige problemas
poetry run mypy .                # Verifica tipos
poetry run pytest -v             # Executa testes
```

### Frontend (TypeScript/React)

```bash
# Lint
make lint-web                    # Verifica
make format-web                  # Formata

# Testes e tipos
make typecheck                   # Type checking
make test-web                    # Executa testes

# Comandos individuais
cd packages/web
pnpm lint                        # ESLint
pnpm lint:fix                    # ESLint auto-fix
pnpm format                      # Prettier
pnpm typecheck                   # TypeScript
pnpm test                        # Vitest
```

## Padrões Gerais

### 1. Documentação de Código

**OBRIGATÓRIO:**
- Docstrings/JSDoc em todas as classes e funções públicas
- Comentários explicativos para lógica complexa
- README.md em cada módulo/package

**Exemplo Python:**
```python
def calculate_match_score(candidate: CandidateProfile, job: JobPosting) -> Decimal:
    """
    Calcula score de compatibilidade entre candidato e vaga.

    Args:
        candidate: Perfil do candidato
        job: Vaga de emprego

    Returns:
        Score de 0.00 a 100.00

    Raises:
        ValueError: Se candidate ou job forem inválidos
    """
    pass
```

**Exemplo TypeScript:**
```typescript
/**
 * Calcula score de compatibilidade entre candidato e vaga.
 *
 * @param candidate - Perfil do candidato
 * @param job - Vaga de emprego
 * @returns Score de 0 a 100
 * @throws {Error} Se candidate ou job forem inválidos
 */
function calculateMatchScore(candidate: CandidateProfile, job: JobPosting): number {
  // Implementation
}
```

### 2. Nomenclatura

**Backend (Python):**
- Classes: `PascalCase` → `CandidateProfile`, `JobPosting`
- Funções/Métodos: `snake_case` → `calculate_score`, `get_active_candidates`
- Constantes: `UPPER_SNAKE_CASE` → `MAX_SCORE`, `DEFAULT_STATUS`
- Variáveis: `snake_case` → `user_email`, `job_count`

**Frontend (TypeScript):**
- Componentes: `PascalCase` → `CandidateCard`, `JobList`
- Funções: `camelCase` → `calculateScore`, `getActiveCandidates`
- Constantes: `UPPER_SNAKE_CASE` → `MAX_SCORE`, `API_URL`
- Variáveis: `camelCase` → `userEmail`, `jobCount`
- Tipos/Interfaces: `PascalCase` → `CandidateProfile`, `JobPosting`

### 3. Organização de Imports

**Python:**
```python
# 1. Standard library
import uuid
from datetime import datetime
from typing import Optional

# 2. Third-party
from django.db import models
from rest_framework import serializers

# 3. Local
from core.models import BaseModel
from authentication.models import User
```

**TypeScript:**
```typescript
// 1. React/Next
import { useState, useEffect } from 'react';

// 2. Third-party
import { z } from 'zod';

// 3. Internal packages
import { Button } from '@talentbase/design-system';

// 4. Local
import { CandidateProfile } from '~/types';
import { api } from '~/lib/api';
```

### 4. Gestão de Complexidade

**Limites OBRIGATÓRIOS:**
- Funções: máximo 50 linhas
- Complexidade ciclomática: < 10
- Profundidade de aninhamento: < 4

**❌ Ruim:**
```python
def process_application(application):
    if application.status == 'pending':
        if application.candidate.is_active:
            if application.job.is_active:
                if application.candidate.years_of_experience >= application.job.min_experience:
                    # Muitos níveis de aninhamento
                    pass
```

**✅ Bom:**
```python
def process_application(application: Application) -> bool:
    """Processa candidatura validando elegibilidade."""
    if not _is_eligible(application):
        return False

    _update_status(application)
    _notify_parties(application)
    return True

def _is_eligible(application: Application) -> bool:
    """Valida se candidatura é elegível."""
    return (
        application.status == 'pending'
        and application.candidate.is_active
        and application.job.is_active
        and application.candidate.years_of_experience >= application.job.min_experience
    )
```

### 5. Type Hints (Obrigatório)

**Python:**
```python
from typing import Optional, List
from decimal import Decimal

def get_top_candidates(
    position: str,
    min_score: Decimal,
    limit: int = 10
) -> List[CandidateProfile]:
    """Retorna top candidatos para uma posição."""
    pass

def find_user_by_email(email: str) -> Optional[User]:
    """Busca usuário por email."""
    pass
```

**TypeScript:**
```typescript
interface CandidateProfile {
  id: string;
  fullName: string;
  score: number;
}

function getTopCandidates(
  position: string,
  minScore: number,
  limit: number = 10
): CandidateProfile[] {
  // Implementation
}
```

## Backend (Python/Django)

### Arquitetura em Camadas

**OBRIGATÓRIO: Seguir Clean Architecture**

```
┌─────────────────────────────────────────┐
│ Presentation Layer (Views/Serializers)  │
├─────────────────────────────────────────┤
│ Application Layer (Services/Use Cases)  │
├─────────────────────────────────────────┤
│ Domain Layer (Models/Business Rules)    │
├─────────────────────────────────────────┤
│ Infrastructure (ORM/External Services)  │
└─────────────────────────────────────────┘
```

**Regras:**
1. Models contêm apenas estrutura de dados e validações básicas
2. Lógica de negócio vai em Services
3. Views/Serializers apenas coordenam (thin controllers)
4. Nenhuma query complexa em views

**❌ Ruim (lógica no model):**
```python
class CandidateProfile(BaseModel):
    def calculate_match_with_all_jobs(self):
        # Lógica complexa no model
        jobs = JobPosting.objects.filter(is_active=True)
        for job in jobs:
            # Cálculo complexo...
```

**✅ Bom (lógica no service):**
```python
# models.py
class CandidateProfile(BaseModel):
    # Apenas estrutura de dados
    pass

# services/matching.py
class MatchingService:
    @staticmethod
    def calculate_candidate_matches(candidate: CandidateProfile) -> List[JobMatch]:
        """Calcula compatibilidade do candidato com vagas ativas."""
        jobs = JobPosting.objects.filter(is_active=True)
        return [
            JobMatch(job=job, score=_calculate_score(candidate, job))
            for job in jobs
        ]
```

### Validações

**Usar validadores do Django:**
```python
from django.core.exceptions import ValidationError

def validate_youtube_url(value: str) -> None:
    """Valida que URL é do YouTube."""
    if value and 'youtube.com' not in value and 'youtu.be' not in value:
        raise ValidationError('URL deve ser do YouTube')

class CandidateProfile(BaseModel):
    video_url = models.URLField(
        blank=True,
        validators=[validate_youtube_url]
    )
```

### Queries Eficientes

**Evitar N+1:**
```python
# ❌ Ruim (N+1 queries)
candidates = CandidateProfile.objects.all()
for candidate in candidates:
    print(candidate.user.email)  # Query adicional por candidato

# ✅ Bom (1 query)
candidates = CandidateProfile.objects.select_related('user').all()
for candidate in candidates:
    print(candidate.user.email)
```

## Frontend (TypeScript/React)

### Componentização

**OBRIGATÓRIO: Usar Design System**

**❌ Ruim:**
```tsx
// Criando componente do zero
function MyButton({ onClick, children }) {
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

**✅ Bom:**
```tsx
import { Button } from '@talentbase/design-system';

function CandidateActions() {
  return (
    <Button variant="primary" onClick={handleApply}>
      Candidatar-se
    </Button>
  );
}
```

### Estrutura de Componentes

**Single Responsibility:**
```tsx
// ❌ Ruim - componente faz muita coisa
function CandidatePage() {
  // Fetch data
  // Validação
  // Renderização
  // Lógica de negócio
}

// ✅ Bom - separar responsabilidades
function CandidatePage() {
  const { data, loading } = useCandidateData();

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <CandidateHeader candidate={data} />
      <CandidateProfile candidate={data} />
      <CandidateExperiences experiences={data.experiences} />
    </div>
  );
}
```

### Hooks Customizados

**Reutilização de lógica:**
```typescript
// hooks/useCandidateData.ts
export function useCandidateData(candidateId: string) {
  const [data, setData] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchCandidate(candidateId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [candidateId]);

  return { data, loading, error };
}
```

### Props Tipadas

**Sempre definir interfaces:**
```typescript
interface CandidateCardProps {
  candidate: CandidateProfile;
  onSelect?: (id: string) => void;
  variant?: 'compact' | 'detailed';
}

export function CandidateCard({
  candidate,
  onSelect,
  variant = 'compact'
}: CandidateCardProps) {
  // Implementation
}
```

## Processo de Validação

### Antes de Commit

```bash
# 1. Format código
make format

# 2. Lint
make lint

# 3. Type check
make typecheck

# 4. Testes
make test

# 5. Se tudo passar, commit
git add .
git commit -m "feat: add candidate matching algorithm"
```

### Antes de Pull Request

- [ ] Todos os linters passando sem warnings
- [ ] Todos os testes passando
- [ ] Cobertura de testes >= 50%
- [ ] TypeScript sem erros
- [ ] Documentação atualizada
- [ ] Nenhum console.log/print em produção
- [ ] Nenhum TODO sem issue

## Métricas de Qualidade

### Metas Obrigatórias

| Métrica | Meta | Crítico |
|---------|------|---------|
| Cobertura de Testes | >= 50% | >= 30% |
| Complexidade Ciclomática | < 10 | < 15 |
| Linhas por Função | < 50 | < 100 |
| Warnings de Linter | 0 | < 5 |
| Erros de Type Check | 0 | 0 |

### Ferramentas de Monitoramento

```bash
# Verificar métricas
poetry run pytest --cov=. --cov-report=term-missing
poetry run radon cc apps/api -a -nb  # Complexidade ciclomática
```

## Exceções e Casos Especiais

### Quando quebrar regras

Exceções devem ser:
1. Documentadas com comentário explicativo
2. Aprovadas em code review
3. Registradas como tech debt se necessário

```python
def legacy_integration():
    """
    EXCEÇÃO: Complexidade > 10 devido a integração com sistema legacy.
    TODO(TECH-123): Refatorar quando migrarmos para nova API.
    """
    # Código complexo justificado
    pass
```

## Referências

- [Linting e Formatação](./LINTING.md)
- [Backend Best Practices](./BACKEND_BEST_PRACTICES.md)
- [Frontend Best Practices](./FRONTEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](./PRE_IMPLEMENTATION_CHECKLIST.md)

## Recursos Externos

- [PEP 8 - Python Style Guide](https://pep8.org/)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Django Best Practices](https://django-best-practices.readthedocs.io/)
