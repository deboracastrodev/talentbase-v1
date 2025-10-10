# 🔧 Como Corrigir as Logos no Storybook

## ✅ Status da Configuração

Executei um diagnóstico completo e **tudo está configurado corretamente**:

- ✅ Arquivos SVG existem em `public/logos/`
- ✅ `staticDirs` configurado no Storybook
- ✅ Todos os componentes exportados
- ✅ Build do design system funciona

## 🎯 Solução: Reiniciar o Storybook

O problema é que o **Storybook precisa ser reiniciado** quando arquivos estáticos são adicionados.

### Passo a Passo:

1. **Parar o Storybook atual**
   - No terminal onde o Storybook está rodando, pressione `Ctrl+C`

2. **Limpar cache e reiniciar**
   ```bash
   cd packages/design-system
   bash scripts/fix-storybook.sh  # Isso limpa caches automaticamente
   pnpm dev
   ```

3. **Hard Refresh no navegador**
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`
   - Ou: Abra DevTools (F12) → Clique direito no Reload → "Empty Cache and Hard Reload"

4. **Verificar se funcionou**
   - Acesse: http://localhost:6006
   - Vá para `Foundation > Logo`
   - As logos devem aparecer agora!

## 🔍 Como Testar se os Arquivos Estáticos Estão Sendo Servidos

Com o Storybook rodando, acesse no navegador:

```
http://localhost:6006/logos/logo-full-primary.svg
```

- ✅ **Se o SVG aparecer:** Os arquivos estáticos estão OK, problema é apenas cache do browser
- ❌ **Se der 404:** O Storybook não reiniciou corretamente

## 🆘 Se Ainda Não Funcionar

### Opção 1: Limpeza Completa

```bash
cd packages/design-system
rm -rf node_modules dist storybook-static node_modules/.cache
pnpm install
pnpm build
pnpm dev
```

### Opção 2: Usar Logo Inline (Temporário)

Se precisar continuar trabalhando enquanto resolve, use o componente `LogoInline`:

```tsx
// Ao invés de:
import { Logo } from './components/Logo';

// Use:
import { LogoInline } from './components/Logo-inline';

<LogoInline variant="full" theme="primary" size="lg" />
```

Este componente tem os SVGs embutidos e funciona sempre.

## 📋 Comandos Úteis

```bash
# Limpar cache do Storybook
rm -rf node_modules/.cache .storybook-cache

# Verificar se arquivos existem
ls -la public/logos/

# Rodar script de correção automática
bash scripts/fix-storybook.sh

# Build completo
pnpm build && pnpm build-storybook
```

## 🎉 Após Corrigir

Quando as logos aparecerem:

1. Acesse: http://localhost:6006
2. Navegue para `Foundation > Logo`
3. Você verá todas as variações:
   - Logo Primary (fundos claros)
   - Logo White (fundos escuros)
   - Logo Dark (fundos muito claros)
   - Símbolo apenas
   - Todos os tamanhos

## 📚 Mais Informações

- Ver: [STORYBOOK-TROUBLESHOOTING.md](./STORYBOOK-TROUBLESHOOTING.md) para mais problemas comuns
- Documentação: https://storybook.js.org/docs/react/configure/images-and-assets

---

**Resumo:** O problema é só cache. Reinicie o Storybook e faça hard refresh no browser que vai funcionar! 🚀
