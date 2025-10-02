# TalentBase - Scripts

Esta pasta contém scripts utilitários para o projeto TalentBase.

## Scripts Disponíveis

### `check-prerequisites.sh`

Script de verificação de pré-requisitos do ambiente de desenvolvimento.

**Uso:**
```bash
./scripts/check-prerequisites.sh
```

**O que verifica:**
- ✅ Node.js 20+
- ✅ pnpm 8.14+
- ✅ Python 3.11+
- ✅ Poetry 1.7+
- ✅ Docker 24+
- ✅ Docker Compose
- ✅ AWS CLI v2
- ✅ AWS credentials configuradas
- ✅ Domínio salesdog.click no Route 53

**Exit Codes:**
- `0`: Todos os pré-requisitos essenciais atendidos
- `1`: Um ou mais pré-requisitos faltando

**Output de Exemplo:**

```
🔍 Verificando pré-requisitos do TalentBase...

✅ Node.js v20.11.0
✅ pnpm 8.15.0
✅ Python 3.11.7
✅ Poetry 1.7.1
✅ Docker 24.0.7
✅ Docker Compose 2.23.0
✅ AWS CLI 2.15.10
✅ AWS CLI configurado (Conta: 123456789012)
✅ Domínio salesdog.click configurado no Route 53

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Resumo da Verificação
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Aprovados: 10
❌ Falhas: 0
⚠️  Avisos: 0

✅ Todos os pré-requisitos essenciais atendidos! Pronto para Story 1.1
```

**Troubleshooting:**

Se você encontrar erros, o script fornecerá links de instalação para cada ferramenta. Recursos úteis:

- **Node.js**: https://nodejs.org/
- **pnpm**: https://pnpm.io/installation ou `npm install -g pnpm`
- **Python**: https://www.python.org/downloads/
- **Poetry**: https://python-poetry.org/docs/#installation ou `curl -sSL https://install.python-poetry.org | python3 -`
- **Docker Desktop**: https://www.docker.com/products/docker-desktop/
- **AWS CLI**: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
- **Configurar AWS**: `aws configure` (requer Access Key ID e Secret Access Key)

**Notas:**
- O domínio Route 53 gera apenas um aviso (⚠️) se não encontrado, pois será necessário apenas para Story 1.6
- Todas as outras verificações são obrigatórias para iniciar o desenvolvimento
