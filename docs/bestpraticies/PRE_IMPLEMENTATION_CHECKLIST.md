# Pre-Implementation Checklist

**Status:** Mandatory - Read Before Starting ANY Story
**Última Atualização:** 2025-10-02

## ⚠️ IMPORTANTE

Este checklist DEVE ser lido e seguido antes de iniciar a implementação de qualquer story. Ignorar estas diretrizes resultará em retrabalho e code review negado.

## 📋 Antes de Começar

### 1. Documentação (OBRIGATÓRIO)

- [ ] Li a [Story](../stories/) completa
- [ ] Li o [Code Quality Standards](./CODE_QUALITY.md)
- [ ] Li o documento de Best Practices relevante:
  - [ ] [Backend Best Practices](./BACKEND_BEST_PRACTICES.md) se for backend
  - [ ] [Frontend Best Practices](./FRONTEND_BEST_PRACTICES.md) se for frontend
- [ ] Li o [Tech Spec](../epics/) relacionado
- [ ] Entendo a arquitetura e fluxo de dados

### 2. Ambiente de Desenvolvimento

- [ ] Docker está rodando: `docker-compose ps`
- [ ] Banco de dados está healthy: `make health`
- [ ] Consigo rodar testes: `make test`
- [ ] Linters configurados: `make lint`

### 3. Dependências

- [ ] Todas as stories dependentes foram completadas
- [ ] Migrations anteriores aplicadas (se backend)
- [ ] Design System atualizado (se frontend)

## 🎯 Durante a Implementação

### Backend (Python/Django)

#### Arquitetura

- [ ] **Lógica de negócio está em Services**, não em models ou views
- [ ] Models herdam de `BaseModel`
- [ ] Views são thin controllers (apenas coordenação)
- [ ] Seguindo Clean Architecture (camadas bem definidas)

#### Code Quality

- [ ] **Type hints** em todas as funções
  ```python
  def get_candidates(status: str) -> list[CandidateProfile]:
  ```

- [ ] **Docstrings** em classes e métodos públicos
  ```python
  """
  Calcula score de matching.

  Args:
      candidate: Perfil do candidato
      job: Vaga de emprego

  Returns:
      Score de 0.00 a 100.00
  ```

- [ ] **Complexidade ciclomática < 10**
  - Funções complexas foram quebradas em subfunções
  - Nenhuma função com mais de 50 linhas

- [ ] **Imports organizados** (stdlib → third-party → local)

- [ ] **Queries otimizadas**
  - Usando `select_related()` para ForeignKey/OneToOne
  - Usando `prefetch_related()` para ManyToMany/Reverse FK
  - Sem N+1 queries

#### Validações

- [ ] Validações de formato em **Serializers**
- [ ] Validações de negócio em **Services**
- [ ] Validadores customizados em **validators.py**
- [ ] Tratamento de erros apropriado

#### Database

- [ ] Índices em campos frequentemente filtrados
- [ ] `db_index=True` em campos de status/flags
- [ ] `unique_together` quando necessário
- [ ] Foreign keys com `on_delete` apropriado

#### Segurança

- [ ] **Nunca expor dados sensíveis** (CPF, senhas, etc)
- [ ] Permissões configuradas nas views
- [ ] Inputs validados antes de usar
- [ ] Nenhuma query raw SQL sem escape

#### Testes

- [ ] Testes de models criados
- [ ] Testes de services criados
- [ ] Testes de APIs criados
- [ ] Cobertura >= 80%: `make coverage-api`

### Frontend (TypeScript/React/Remix)

#### Componentização

- [ ] **Usando Design System** (@talentbase/design-system)
  - ❌ Não criar botões, inputs, cards do zero
  - ✅ Importar do design system

- [ ] **Componentes < 150 linhas**
  - Componentes grandes foram quebrados

- [ ] **Single Responsibility**
  - Cada componente faz uma coisa só

- [ ] **Hierarquia clara**
  ```
  routes/         # Páginas (coordenação)
  components/     # Componentes de negócio
  lib/           # Utilitários
  ```

#### Tipagem

- [ ] **Interfaces TypeScript** para todas as props
  ```typescript
  interface CandidateCardProps {
    candidate: CandidateProfile;
    onSelect?: (id: string) => void;
  }
  ```

- [ ] **Evitar `any`** (exceto casos justificados)

- [ ] **Type-safe data fetching** (Remix loaders)

#### Estado e Data

- [ ] **Remix loaders** para server-side data (preferido)
  ```typescript
  export async function loader({ params }: LoaderFunctionArgs) {
    const candidate = await api.candidates.get(params.id!);
    return json({ candidate });
  }
  ```

- [ ] **useState apenas para UI state** (modais, dropdowns)

- [ ] **Evitar prop drilling** (usar Context se necessário)

#### Performance

- [ ] Lazy loading de componentes pesados
- [ ] Memoization quando apropriado (useMemo, useCallback)
- [ ] Imagens com lazy loading

#### Acessibilidade

- [ ] Semântica HTML (`<nav>`, `<main>`, `<article>`)
- [ ] ARIA labels em ícones/botões sem texto
- [ ] Keyboard navigation funciona

#### Testes

- [ ] Testes de componentes criados
- [ ] Cobertura >= 80%
- [ ] Testing Library para testes de UI

## ✅ Antes de Commit

### 1. Executar Ferramentas (OBRIGATÓRIO)

```bash
# Backend
make lint-api          # Verifica linting
make format-api        # Formata código
make test-api          # Roda testes

# Frontend
make lint-web          # ESLint
make format-web        # Prettier
make typecheck         # TypeScript
make test-web          # Vitest

# Tudo
make lint
make format
make test
```

### 2. Code Review Manual

- [ ] **Nenhum código comentado** (remover ou justificar)
- [ ] **Nenhum console.log / print** em código de produção
- [ ] **Nenhum TODO** sem issue/ticket associado
- [ ] **Imports não utilizados removidos**
- [ ] **Variáveis descritivas** (não `x`, `temp`, `data`)

### 3. Documentação

- [ ] Docstrings/JSDoc adicionadas
- [ ] README atualizado se necessário
- [ ] Comentários explicativos em lógica complexa

### 4. Segurança

- [ ] **Nenhuma senha/chave em hardcode**
- [ ] **Nenhum dado sensível em logs**
- [ ] Validação de inputs externos
- [ ] Permissões verificadas

### 5. Performance

- [ ] Queries otimizadas (backend)
- [ ] Componentes memoizados quando necessário (frontend)
- [ ] Nenhum loop excessivamente aninhado

## 📝 Antes de Pull Request

### Validação Completa

```bash
# Rodar validação completa
make lint              # Tudo deve passar sem warnings
make test              # Todos os testes devem passar
make typecheck         # TypeScript sem erros
```

### Checklist Final

- [ ] ✅ Todos os linters passando (0 warnings)
- [ ] ✅ Todos os testes passando
- [ ] ✅ Cobertura de testes >= 80%
- [ ] ✅ TypeScript sem erros (frontend)
- [ ] ✅ mypy sem erros (backend)
- [ ] ✅ Documentação atualizada
- [ ] ✅ Migrations criadas e testadas (backend)
- [ ] ✅ Design System usado corretamente (frontend)

### Descrição do PR

Incluir:
- [ ] Link para a story
- [ ] Resumo das mudanças
- [ ] Screenshots (se UI)
- [ ] Passos para testar
- [ ] Checklist de validações

## 🚨 Red Flags (Nunca Fazer)

### Backend

- ❌ Lógica de negócio em models
- ❌ Queries complexas em views
- ❌ Código sem type hints
- ❌ Funções com complexidade > 10
- ❌ Dados sensíveis sem proteção
- ❌ Migrations que não rodam
- ❌ Código sem testes

### Frontend

- ❌ Criar componentes básicos (botões, inputs) do zero
- ❌ Usar `any` no TypeScript
- ❌ Componentes com 300+ linhas
- ❌ Lógica de negócio em componentes de UI
- ❌ Cores hardcoded (não usar tokens)
- ❌ Fetch de dados direto em componentes (usar Remix loaders)
- ❌ Código sem testes

### Geral

- ❌ Código comentado extensivamente
- ❌ console.log / print em produção
- ❌ TODOs sem issue
- ❌ Commits com "WIP" ou "test"
- ❌ Quebrar build
- ❌ Ignorar warnings de linters

## 🎓 Recursos de Aprendizado

### Leitura Obrigatória

1. [Code Quality Standards](./CODE_QUALITY.md)
2. [Backend Best Practices](./BACKEND_BEST_PRACTICES.md)
3. [Frontend Best Practices](./FRONTEND_BEST_PRACTICES.md)
4. [Linting e Formatação](./LINTING.md)

### Ferramentas

- **Backend:** Black, Ruff, mypy, pytest
- **Frontend:** ESLint, Prettier, TypeScript, Vitest
- **Comandos:** Ver [Makefile](../Makefile) e [LINTING.md](./LINTING.md)

### Code Review

Espere que o reviewer verifique:
- Arquitetura correta (camadas, responsabilidades)
- Code quality (complexidade, tipos, docstrings)
- Testes e cobertura
- Performance e segurança
- Design System usage (frontend)

## ❓ Dúvidas Frequentes

**Q: Posso pular os testes por enquanto?**
A: Não. Cobertura >= 80% é obrigatória.

**Q: Minha função tem complexidade 12, mas funciona bem. Está ok?**
A: Não. Refatore em subfunções. Complexidade > 10 não passa.

**Q: Posso criar um botão customizado? O do design system não serve.**
A: Não. Adicione variações no design system ou use o que existe.

**Q: Type hints são realmente necessários?**
A: Sim. Todas as funções devem ter type hints.

**Q: Posso fazer lógica de negócio no model Django?**
A: Não. Lógica de negócio vai em Services.

**Q: Preciso realmente fazer docstrings?**
A: Sim. Classes e métodos públicos devem ter docstrings.

## 🔄 Workflow Recomendado

```bash
# 1. Criar branch
git checkout -b feature/story-1-2

# 2. Ler documentação (este checklist)

# 3. Implementar com TDD
# - Escrever teste
# - Implementar feature
# - Refatorar

# 4. Validar localmente
make lint
make test
make typecheck

# 5. Commit
git add .
git commit -m "feat: implement candidate profile models"

# 6. Push e criar PR
git push origin feature/story-1-2
gh pr create

# 7. Aguardar review
```

## 📊 Métricas de Qualidade

Seu código será avaliado por:

| Métrica | Meta | Crítico |
|---------|------|---------|
| Cobertura de Testes | >= 80% | >= 60% |
| Complexidade Ciclomática | < 10 | < 15 |
| Linhas por Função | < 50 | < 100 |
| Warnings de Linter | 0 | < 5 |
| Erros de Type Check | 0 | 0 |
| Erros de Testes | 0 | 0 |

## 📞 Suporte

- **Dúvidas de arquitetura:** Consultar Tech Lead
- **Dúvidas de código:** Code review no PR
- **Bugs de ferramentas:** Criar issue no GitHub
- **Documentação:** Este checklist + docs linkados

---

**Lembre-se:** Qualidade > Velocidade. Código bem escrito economiza tempo no futuro.
