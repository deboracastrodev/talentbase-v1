# Storybook Troubleshooting

## 🔧 Problemas Comuns e Soluções

### Logo não aparece no Storybook

**Sintoma:** As logos aparecem como imagens quebradas no Storybook.

**Causa:** O Storybook precisa ser reiniciado quando arquivos estáticos são adicionados ou modificados na pasta `public/`.

**Solução 1: Reiniciar Storybook (Recomendado)**

```bash
# 1. Parar o Storybook (Ctrl+C no terminal)
# 2. Limpar cache e reiniciar:
cd packages/design-system
rm -rf node_modules/.cache
pnpm dev
```

**Solução 2: Usar LogoInline Component**

Se reiniciar não resolver, use o componente `LogoInline` que tem os SVGs embutidos:

```tsx
// Ao invés de:
import { Logo } from '@talentbase/design-system';

// Use:
import { LogoInline } from './components/Logo-inline';

<LogoInline variant="full" theme="primary" size="lg" />
```

**Solução 3: Hard Refresh do Browser**

1. Abra o DevTools (F12)
2. Clique com botão direito no botão Reload
3. Selecione "Empty Cache and Hard Reload"
4. Ou use: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows/Linux)

---

### Assets Estáticos Não Carregam

**Configuração do Storybook:**

O arquivo `.storybook/main.ts` deve conter:

```typescript
const config: StorybookConfig = {
  // ...
  staticDirs: ['../public'], // ← Isso serve arquivos de public/
};
```

**Como verificar se está funcionando:**

1. Acesse: http://localhost:6006/logos/logo-full-primary.svg
2. Se o SVG carregar, significa que os arquivos estáticos estão sendo servidos corretamente
3. Se não carregar, verifique se `staticDirs` está configurado

---

### Build do Storybook Falha

**Comando de build:**

```bash
cd packages/design-system
pnpm build-storybook
```

**Problemas comuns:**

1. **Erro de TypeScript:** Certifique-se que `pnpm build` funciona primeiro
2. **Memória insuficiente:** Aumente o limite de memória do Node:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" pnpm build-storybook
   ```

---

### Componentes Novos Não Aparecem

**Checklist:**

1. ✅ Componente criado em `src/components/`
2. ✅ Story criada em `src/components/*.stories.tsx`
3. ✅ Exportado em `src/index.ts`
4. ✅ Storybook reiniciado

**Exemplo de export correto:**

```typescript
// src/index.ts
export { Timeline } from './components/Timeline';
export type { TimelineProps, TimelineItem } from './components/Timeline';
```

---

### Hot Reload Não Funciona

**Solução:**

```bash
# Parar o Storybook
# Remover cache
rm -rf node_modules/.cache .storybook-cache
# Reiniciar
pnpm dev
```

---

## 📋 Comandos Úteis

### Desenvolvimento

```bash
# Rodar Storybook em modo dev
pnpm dev

# Rodar em outra porta
pnpm dev --port 6007
```

### Build

```bash
# Build do design system (componentes)
pnpm build

# Build do Storybook (documentação estática)
pnpm build-storybook

# Build completo (componentes + storybook)
pnpm build && pnpm build-storybook
```

### Limpeza

```bash
# Limpar cache do Storybook
rm -rf node_modules/.cache .storybook-cache

# Limpar builds
rm -rf dist storybook-static

# Limpar tudo e reinstalar
rm -rf node_modules dist storybook-static
pnpm install
```

---

## 🐛 Debug

### Verificar Configuração

```bash
# Verificar se arquivos estáticos existem
ls -la public/logos/

# Verificar se Storybook está servindo arquivos
curl http://localhost:6006/logos/logo-full-primary.svg
```

### Logs Detalhados

```bash
# Rodar Storybook com logs detalhados
DEBUG=storybook:* pnpm dev
```

### Verificar TypeScript

```bash
# Compilar TypeScript manualmente
npx tsc --noEmit
```

---

## 📚 Recursos

- [Storybook Docs](https://storybook.js.org/docs/react/get-started/introduction)
- [Storybook Static Files](https://storybook.js.org/docs/react/configure/images-and-assets#serving-static-files-via-storybook-configuration)
- [Vite + Storybook](https://storybook.js.org/docs/react/builders/vite)

---

## 🆘 Suporte

Se nenhuma solução funcionar:

1. Deletar `node_modules` e reinstalar:
   ```bash
   rm -rf node_modules package-lock.json
   pnpm install
   ```

2. Verificar versões:
   ```bash
   node --version  # Deve ser >= 18
   pnpm --version  # Deve ser >= 8
   ```

3. Criar issue no projeto com:
   - Versão do Node
   - Comando executado
   - Erro completo
   - Screenshot do problema
