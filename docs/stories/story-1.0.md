# Story 1.0: Verificação de Pré-requisitos e Ambiente

Status: Draft

## Story

Como um **desenvolvedor do time TalentBase**,
Eu quero **verificar que todas as ferramentas e configurações necessárias estão instaladas e funcionando**,
Para que **possamos iniciar o desenvolvimento sem bloqueios técnicos**.

## Contexto

Esta é a story inicial do Epic 1, criada com base nas recomendações do documento `tech-spec-epic-1-review.md`. Ela garante que o ambiente de desenvolvimento está preparado antes de qualquer trabalho de implementação.

## Acceptance Criteria

1. ✅ Node.js versão 20+ instalado e acessível via `node --version`
2. ✅ pnpm versão 8.14+ instalado e acessível via `pnpm --version`
3. ✅ Python versão 3.11+ instalado e acessível via `python3 --version`
4. ✅ Poetry versão 1.7+ instalado e acessível via `poetry --version`
5. ✅ Docker versão 24+ instalado e acessível via `docker --version`
6. ✅ Docker Compose funcional (teste com `docker-compose version`)
7. ✅ AWS CLI v2 instalado e configurado (`aws --version` e `aws sts get-caller-identity`)
8. ✅ Domínio salesdog.click verificado no Route 53
9. ✅ Script de verificação criado em `scripts/check-prerequisites.sh`
10. ✅ Script executa sem erros e reporta status de todas as ferramentas
11. ✅ README.md atualizado com instruções de setup de pré-requisitos

## Tasks / Subtasks

### Task 1: Criar script de verificação de pré-requisitos (AC: 9, 10)
- [ ] Criar diretório `scripts/` na raiz do projeto
- [ ] Criar arquivo `scripts/check-prerequisites.sh`
- [ ] Implementar verificações:
  - [ ] Node.js 20+
  - [ ] pnpm 8.14+
  - [ ] Python 3.11+
  - [ ] Poetry 1.7+
  - [ ] Docker 24+
  - [ ] Docker Compose
  - [ ] AWS CLI v2
  - [ ] AWS credentials configuradas
  - [ ] Domínio Route 53
- [ ] Adicionar permissões de execução: `chmod +x scripts/check-prerequisites.sh`
- [ ] Testar script localmente

### Task 2: Validar ferramentas Core (AC: 1, 2, 3, 4, 5, 6)
- [ ] Executar verificação de Node.js
- [ ] Executar verificação de pnpm
- [ ] Executar verificação de Python
- [ ] Executar verificação de Poetry
- [ ] Executar verificação de Docker
- [ ] Executar verificação de Docker Compose
- [ ] Documentar versões confirmadas no README.md

### Task 3: Validar configuração AWS (AC: 7, 8)
- [ ] Verificar AWS CLI instalado
- [ ] Testar credenciais AWS com `aws sts get-caller-identity`
- [ ] Verificar domínio salesdog.click no Route 53
- [ ] Documentar zona hospedada ID
- [ ] Validar permissões necessárias (ECS, ECR, S3, RDS, etc.)

### Task 4: Documentar processo de setup (AC: 11)
- [ ] Atualizar README.md com seção "Pré-requisitos"
- [ ] Adicionar instruções de instalação para cada ferramenta
- [ ] Documentar como configurar AWS CLI
- [ ] Adicionar troubleshooting para problemas comuns
- [ ] Incluir comando de execução do script: `./scripts/check-prerequisites.sh`

## Dev Notes

### Ferramentas Requeridas e Versões Mínimas

**Frontend/Build:**
- Node.js: 20+ (LTS)
- pnpm: 8.14+ (workspace support)

**Backend/Python:**
- Python: 3.11+ (type hints, performance)
- Poetry: 1.7+ (dependency resolution)

**Containers:**
- Docker: 24+ (multi-stage builds)
- Docker Compose: 3.8+

**Cloud/Deploy:**
- AWS CLI: v2 (latest)
- Terraform/CDK: Opcional para Epic 1

### Script de Verificação

O script deve:
1. Verificar presença de cada ferramenta
2. Validar versões mínimas
3. Reportar status em formato legível (✅/❌)
4. Retornar exit code 0 em sucesso, 1 em falha
5. Incluir mensagens de ajuda para resolver problemas

### Exemplo de Output Esperado

```
🔍 Verificando pré-requisitos do TalentBase...

✅ Node.js v20.11.0
✅ pnpm 8.15.0
✅ Python 3.11.7
✅ Poetry 1.7.1
✅ Docker 24.0.7
✅ Docker Compose 2.23.0
✅ AWS CLI 2.15.10
✅ AWS CLI configurado (conta: 123456789012)
✅ Domínio salesdog.click configurado no Route 53

✅ Todos os pré-requisitos atendidos! Pronto para Story 1.1
```

### Project Structure Notes

**Novo diretório criado:**
```
talentbase-v1/
  scripts/
    check-prerequisites.sh   # Script de verificação
    README.md               # Documentação dos scripts
```

**Arquivos modificados:**
```
talentbase-v1/
  README.md                  # Adicionar seção de pré-requisitos
```

### Tratamento de Erros

Se alguma verificação falhar, o script deve:
1. Exibir ❌ para a ferramenta faltante
2. Mostrar versão esperada vs. versão encontrada (se aplicável)
3. Fornecer link/comando de instalação
4. Continuar verificando outras ferramentas (não abortar imediatamente)
5. Ao final, exibir resumo de problemas encontrados

### Referências de Instalação

Incluir no README.md links para:
- Node.js: https://nodejs.org/
- pnpm: https://pnpm.io/installation
- Python: https://www.python.org/downloads/
- Poetry: https://python-poetry.org/docs/#installation
- Docker Desktop: https://www.docker.com/products/docker-desktop/
- AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

### Critérios de Validação

**Node.js:**
```bash
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js $NODE_VERSION encontrado. Requer Node.js 20+"
    exit 1
fi
```

**AWS CLI:**
```bash
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ AWS CLI não configurado. Execute: aws configure"
    exit 1
fi
```

**Route 53:**
```bash
HOSTED_ZONE=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='salesdog.click.'].Id" --output text)
if [ -z "$HOSTED_ZONE" ]; then
    echo "⚠️  Domínio salesdog.click não encontrado no Route 53"
fi
```

### MCP Context (Infrastructure)

Esta story estabelece a base para todas as próximas stories de infraestrutura. O contexto MCP para setup de ambiente inclui:

**Model Context Protocol - Story 1.0**
```xml
<context type="infrastructure-prerequisites">
  <verification-scope>
    <tools>
      <frontend>
        <node version="20+" required="true"/>
        <pnpm version="8.14+" required="true"/>
      </frontend>
      <backend>
        <python version="3.11+" required="true"/>
        <poetry version="1.7+" required="true"/>
      </backend>
      <containers>
        <docker version="24+" required="true"/>
        <docker-compose version="3.8+" required="true"/>
      </containers>
      <cloud>
        <aws-cli version="2+" required="true"/>
        <aws-credentials configured="true" required="true"/>
        <route53-domain name="salesdog.click" required="true"/>
      </cloud>
    </tools>
  </verification-scope>

  <validation-strategy>
    <approach>Script-based automated verification</approach>
    <failure-mode>Continue on error, report all issues</failure-mode>
    <success-criteria>All tools present and versions valid</success-criteria>
  </validation-strategy>

  <dependencies>
    <blocks>
      <story id="1.1">Monorepo setup requires all tools</story>
      <story id="1.2">Database requires Docker</story>
      <story id="1.5">CI/CD requires AWS CLI</story>
      <story id="1.6">DNS requires Route 53 access</story>
    </blocks>
  </dependencies>
</context>
```

### Testing Strategy

**Execução do Script:**
```bash
# Na raiz do projeto
./scripts/check-prerequisites.sh

# Expected output: Exit code 0, todas verificações ✅
```

**Validação Manual:**
1. Executar cada comando individualmente
2. Confirmar versões corretas
3. Testar conectividade AWS
4. Verificar acesso ao Route 53

**Checklist de Validação:**
- [ ] Script executa sem erros de sintaxe
- [ ] Todas as ferramentas são detectadas corretamente
- [ ] Versões mínimas são validadas
- [ ] AWS CLI está configurado e funcional
- [ ] Domínio Route 53 é detectado
- [ ] README.md contém instruções claras

### References

- [Source: docs/epics/tech-spec-epic-1-review.md#Melhoria-1-Adicionar-Story-1.0]
- [Source: docs/epics/tech-spec-epic-1.md#Story-1.1-Implementation-Steps]
- [Source: docs/epics/solution-architecture.md#Technology-Stack]

## Change Log

| Date       | Version | Description                              | Author |
| ---------- | ------- | ---------------------------------------- | ------ |
| 2025-10-02 | 0.1     | Initial draft - Prerequisites validation | Debora |

## Dev Agent Record

### Context Reference

Story criada conforme recomendação do documento de review (tech-spec-epic-1-review.md, Melhoria 1).

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes List

- Esta é uma story de preparação (Story 1.0), criada antes das 6 stories originais do Epic 1
- Tempo estimado: 1 hora
- Bloqueia: Stories 1.1, 1.2, 1.5, 1.6
- Nenhuma dependência (primeira story do epic)

### Dependencies

**Blocks:**
- Story 1.1: Monorepo setup requires all tools verified
- Story 1.2: Database schema requires Docker
- Story 1.5: CI/CD requires AWS CLI and credentials
- Story 1.6: DNS configuration requires Route 53 access

**Depends On:**
- None (first story of Epic 1)

### File List

**To be created:**
- `scripts/check-prerequisites.sh` - Verification script
- `scripts/README.md` - Scripts documentation

**To be modified:**
- `README.md` - Add prerequisites section
