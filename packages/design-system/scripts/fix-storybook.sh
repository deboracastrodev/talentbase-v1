#!/bin/bash

# Script para corrigir problemas comuns do Storybook
# Uso: bash scripts/fix-storybook.sh

set -e

echo "🔧 Corrigindo Storybook..."
echo ""

# 1. Limpar caches
echo "📦 1. Limpando caches..."
rm -rf node_modules/.cache .storybook-cache
echo "✅ Caches limpos"
echo ""

# 2. Verificar arquivos estáticos
echo "📁 2. Verificando arquivos estáticos..."
if [ -d "public/logos" ]; then
  echo "✅ Pasta public/logos existe"
  echo "   Arquivos encontrados:"
  ls -1 public/logos/ | sed 's/^/   - /'
else
  echo "❌ Pasta public/logos não encontrada!"
  exit 1
fi
echo ""

# 3. Verificar exports
echo "📝 3. Verificando exports do design system..."
if grep -q "export.*Logo" src/index.ts; then
  echo "✅ Logo exportado em src/index.ts"
else
  echo "⚠️  Logo pode não estar exportado corretamente"
fi

if grep -q "export.*Timeline" src/index.ts; then
  echo "✅ Timeline exportado em src/index.ts"
else
  echo "⚠️  Timeline pode não estar exportado corretamente"
fi

if grep -q "export.*PublicProfileHero" src/index.ts; then
  echo "✅ PublicProfileHero exportado em src/index.ts"
else
  echo "⚠️  PublicProfileHero pode não estar exportado corretamente"
fi
echo ""

# 4. Build do design system
echo "🔨 4. Building design system..."
pnpm build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Design system build successful"
else
  echo "❌ Design system build failed!"
  exit 1
fi
echo ""

# 5. Verificar configuração do Storybook
echo "⚙️  5. Verificando configuração do Storybook..."
if grep -q "staticDirs.*public" .storybook/main.ts; then
  echo "✅ staticDirs configurado corretamente"
else
  echo "❌ staticDirs não está configurado!"
  exit 1
fi
echo ""

echo "✨ Tudo pronto!"
echo ""
echo "Para iniciar o Storybook, execute:"
echo "  pnpm dev"
echo ""
echo "Se as logos ainda não aparecerem:"
echo "1. Reinicie o Storybook (Ctrl+C e pnpm dev)"
echo "2. Faça Hard Refresh no browser (Cmd+Shift+R / Ctrl+Shift+R)"
echo "3. Acesse: http://localhost:6006/logos/logo-full-primary.svg"
echo "   (Se o SVG carregar, os arquivos estáticos estão OK)"
