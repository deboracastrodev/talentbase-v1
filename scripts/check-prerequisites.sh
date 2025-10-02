#!/bin/bash

# TalentBase - Verificação de Pré-requisitos
# Script automatizado para validar ambiente de desenvolvimento
# Author: Debora
# Date: 2025-10-02

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo "🔍 Verificando pré-requisitos do TalentBase..."
echo ""

# Function to check command existence and version
check_version() {
    local tool=$1
    local version_cmd=$2
    local min_version=$3
    local extract_pattern=$4

    if ! command -v $tool &> /dev/null; then
        echo -e "${RED}❌ $tool não encontrado${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi

    local current_version=$(eval "$version_cmd" | grep -oE "$extract_pattern" | head -1)

    if [ -z "$current_version" ]; then
        echo -e "${YELLOW}⚠️  $tool instalado mas versão não detectada${NC}"
        WARNINGS=$((WARNINGS + 1))
        return 0
    fi

    # Version comparison
    if [ "$(printf '%s\n' "$min_version" "$current_version" | sort -V | head -n1)" = "$min_version" ]; then
        echo -e "${GREEN}✅ $tool v$current_version${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ $tool v$current_version encontrado. Requer $tool $min_version+${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Check Node.js
echo "Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

    if [ "$NODE_MAJOR" -ge 20 ]; then
        echo -e "${GREEN}✅ Node.js v$NODE_VERSION${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ Node.js v$NODE_VERSION encontrado. Requer Node.js 20+${NC}"
        echo "   Instale em: https://nodejs.org/"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    echo "   Instale em: https://nodejs.org/"
    FAILED=$((FAILED + 1))
fi

# Check pnpm
echo "Verificando pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    PNPM_MAJOR=$(echo $PNPM_VERSION | cut -d'.' -f1)
    PNPM_MINOR=$(echo $PNPM_VERSION | cut -d'.' -f2)

    if [ "$PNPM_MAJOR" -gt 8 ] || ([ "$PNPM_MAJOR" -eq 8 ] && [ "$PNPM_MINOR" -ge 14 ]); then
        echo -e "${GREEN}✅ pnpm v$PNPM_VERSION${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ pnpm v$PNPM_VERSION encontrado. Requer pnpm 8.14+${NC}"
        echo "   Instale com: npm install -g pnpm"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${RED}❌ pnpm não encontrado${NC}"
    echo "   Instale com: npm install -g pnpm"
    echo "   Ou veja: https://pnpm.io/installation"
    FAILED=$((FAILED + 1))
fi

# Check Python
echo "Verificando Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

    if [ "$PYTHON_MAJOR" -gt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 11 ]); then
        echo -e "${GREEN}✅ Python v$PYTHON_VERSION${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ Python v$PYTHON_VERSION encontrado. Requer Python 3.11+${NC}"
        echo "   Instale em: https://www.python.org/downloads/"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${RED}❌ Python3 não encontrado${NC}"
    echo "   Instale em: https://www.python.org/downloads/"
    FAILED=$((FAILED + 1))
fi

# Check Poetry
echo "Verificando Poetry..."
if command -v poetry &> /dev/null; then
    POETRY_VERSION=$(poetry --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    POETRY_MAJOR=$(echo $POETRY_VERSION | cut -d'.' -f1)
    POETRY_MINOR=$(echo $POETRY_VERSION | cut -d'.' -f2)

    if [ "$POETRY_MAJOR" -gt 1 ] || ([ "$POETRY_MAJOR" -eq 1 ] && [ "$POETRY_MINOR" -ge 7 ]); then
        echo -e "${GREEN}✅ Poetry v$POETRY_VERSION${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ Poetry v$POETRY_VERSION encontrado. Requer Poetry 1.7+${NC}"
        echo "   Instale com: curl -sSL https://install.python-poetry.org | python3 -"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${RED}❌ Poetry não encontrado${NC}"
    echo "   Instale com: curl -sSL https://install.python-poetry.org | python3 -"
    echo "   Ou veja: https://python-poetry.org/docs/#installation"
    FAILED=$((FAILED + 1))
fi

# Check Docker
echo "Verificando Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    DOCKER_MAJOR=$(echo $DOCKER_VERSION | cut -d'.' -f1)

    if [ "$DOCKER_MAJOR" -ge 24 ]; then
        echo -e "${GREEN}✅ Docker v$DOCKER_VERSION${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ Docker v$DOCKER_VERSION encontrado. Requer Docker 24+${NC}"
        echo "   Instale Docker Desktop: https://www.docker.com/products/docker-desktop/"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${RED}❌ Docker não encontrado${NC}"
    echo "   Instale Docker Desktop: https://www.docker.com/products/docker-desktop/"
    FAILED=$((FAILED + 1))
fi

# Check Docker Compose
echo "Verificando Docker Compose..."
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    echo -e "${GREEN}✅ Docker Compose v$COMPOSE_VERSION${NC}"
    PASSED=$((PASSED + 1))
elif command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    echo -e "${GREEN}✅ Docker Compose v$COMPOSE_VERSION (standalone)${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ Docker Compose não encontrado${NC}"
    echo "   Normalmente incluído com Docker Desktop"
    FAILED=$((FAILED + 1))
fi

# Check AWS CLI
echo "Verificando AWS CLI..."
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    AWS_MAJOR=$(echo $AWS_VERSION | cut -d'.' -f1)

    if [ "$AWS_MAJOR" -ge 2 ]; then
        echo -e "${GREEN}✅ AWS CLI v$AWS_VERSION${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ AWS CLI v$AWS_VERSION encontrado. Requer AWS CLI v2${NC}"
        echo "   Instale em: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${RED}❌ AWS CLI não encontrado${NC}"
    echo "   Instale em: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    FAILED=$((FAILED + 1))
fi

# Check AWS Configuration
echo "Verificando configuração AWS CLI..."
if command -v aws &> /dev/null; then
    if aws sts get-caller-identity &> /dev/null; then
        AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
        AWS_USER=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null | cut -d'/' -f2)
        echo -e "${GREEN}✅ AWS CLI configurado (Conta: $AWS_ACCOUNT)${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ AWS CLI não configurado${NC}"
        echo "   Execute: aws configure"
        echo "   Você precisará de AWS Access Key ID e Secret Access Key"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Pulando verificação de configuração (AWS CLI não instalado)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check Route 53 Domain
echo "Verificando domínio Route 53..."
if command -v aws &> /dev/null && aws sts get-caller-identity &> /dev/null; then
    HOSTED_ZONE=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='salesdog.click.'].Id" --output text 2>/dev/null)

    if [ -n "$HOSTED_ZONE" ]; then
        ZONE_ID=$(echo $HOSTED_ZONE | cut -d'/' -f3)
        echo -e "${GREEN}✅ Domínio salesdog.click configurado no Route 53 (Zone: $ZONE_ID)${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  Domínio salesdog.click não encontrado no Route 53${NC}"
        echo "   Você precisará configurar o domínio antes da Story 1.6"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Pulando verificação Route 53 (AWS CLI não configurado)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumo da Verificação"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Aprovados: $PASSED${NC}"
echo -e "${RED}❌ Falhas: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Avisos: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os pré-requisitos essenciais atendidos! Pronto para Story 1.1${NC}"
    exit 0
else
    echo -e "${RED}❌ Alguns pré-requisitos não foram atendidos.${NC}"
    echo "Por favor, instale as ferramentas faltantes antes de continuar."
    echo ""
    echo "Recursos:"
    echo "  - Node.js: https://nodejs.org/"
    echo "  - pnpm: https://pnpm.io/installation"
    echo "  - Python: https://www.python.org/downloads/"
    echo "  - Poetry: https://python-poetry.org/docs/#installation"
    echo "  - Docker: https://www.docker.com/products/docker-desktop/"
    echo "  - AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi
