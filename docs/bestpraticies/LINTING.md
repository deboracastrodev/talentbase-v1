# Linting e Formatação de Código

Este documento descreve as ferramentas e configurações de linting e formatação utilizadas no projeto TalentBase.

## Backend (Python/Django)

### Ferramentas

- **Black**: Formatador de código Python opinativo
- **Ruff**: Linter Python extremamente rápido (substitui flake8, isort, e mais)
- **mypy**: Verificador de tipos estáticos para Python

### Configuração

Todas as configurações estão em `apps/api/pyproject.toml`:

- **Black**: Line length de 100 caracteres
- **Ruff**: Múltiplas regras incluindo pycodestyle, pyflakes, isort, flake8-bugbear, etc.
- **mypy**: Verificação de tipos com configurações estritas

### Comandos

```bash
# Via Make (recomendado - executa no Docker)
make lint-api          # Verifica linting
make format-api        # Formata código

# Via Poetry (local)
cd apps/api
poetry run black .
poetry run ruff check .
poetry run mypy .
```

## Frontend (TypeScript/React/Remix)

### Ferramentas

- **ESLint**: Linter para JavaScript/TypeScript
- **Prettier**: Formatador de código opinativo
- **TypeScript**: Verificador de tipos

### Configuração

#### ESLint (`packages/web/.eslintrc.cjs`)

Plugins habilitados:
- `@typescript-eslint`: Regras específicas para TypeScript
- `react`: Regras para React
- `react-hooks`: Regras para React Hooks
- `jsx-a11y`: Regras de acessibilidade
- `import`: Regras de ordenação de imports

#### Prettier (`packages/web/.prettierrc`)

- Semi-colons: Sim
- Single quotes: Sim
- Trailing commas: ES5
- Tab width: 2 espaços
- Print width: 100 caracteres

### Comandos

```bash
# Via Make (recomendado - executa no Docker)
make lint-web          # Verifica linting
make format-web        # Formata código
make typecheck         # Verifica tipos TypeScript

# Via pnpm (local)
cd packages/web
pnpm lint              # ESLint
pnpm lint:fix          # ESLint com auto-fix
pnpm format            # Prettier (write)
pnpm format:check      # Prettier (check only)
pnpm typecheck         # TypeScript
```

## Comandos Globais

Execute linting/formatação em todo o projeto:

```bash
# Via Make (recomendado)
make lint              # Lint backend + frontend
make format            # Format backend + frontend
make format-check      # Check formatting sem modificar
make lint-fix          # Auto-fix todos os problemas possíveis

# Via pnpm (local - apenas frontend)
pnpm lint              # Lint todos os workspaces
pnpm format            # Format todos os workspaces
```

## Integração com Editor

### VS Code

Instale as extensões recomendadas:

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "charliermarsh.ruff",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

Configuração (`.vscode/settings.json`):

```json
{
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": true
    }
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  }
}
```

## CI/CD Integration

Para adicionar ao pipeline de CI/CD:

```yaml
# Exemplo para GitHub Actions
- name: Lint Backend
  run: |
    cd apps/api
    poetry run black --check .
    poetry run ruff check .
    poetry run mypy .

- name: Lint Frontend
  run: |
    pnpm lint
    pnpm typecheck
    pnpm format:check
```

## Pre-commit Hooks (Opcional)

Para configurar hooks de pre-commit:

```bash
# Instalar pre-commit
pip install pre-commit

# Criar .pre-commit-config.yaml
# Ver exemplo em: https://pre-commit.com/
```

## Troubleshooting

### Conflitos entre ESLint e Prettier

Use `eslint-config-prettier` (já configurado) para desabilitar regras do ESLint que conflitam com o Prettier.

### Erros de import no ESLint

Verifique se o `tsconfig.json` está configurado corretamente e se o plugin `eslint-import-resolver-typescript` está instalado.

### Black vs Ruff formatting

Black tem prioridade. Ruff não deve modificar formatação que o Black já gerencia. Use `ruff check --fix` apenas para imports e outras regras não-formatação.
