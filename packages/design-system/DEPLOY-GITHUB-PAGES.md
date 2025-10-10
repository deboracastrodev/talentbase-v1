# 🚀 Deploy do Storybook para GitHub Pages

## 📋 Pré-requisitos

1. ✅ Workflow criado em `.github/workflows/deploy-storybook.yml`
2. ✅ Build do Storybook funciona localmente (`pnpm build`)
3. ✅ Arquivos de logos estão em `public/logos/`

## 🔧 Configuração do GitHub (IMPORTANTE)

### Passo 1: Ativar GitHub Pages no Repositório

1. Vá para: https://github.com/deboracastrodev/talentbase-v1/settings/pages
2. Em **"Source"**, selecione: **GitHub Actions**
3. Salve as configurações

![GitHub Pages Settings](https://docs.github.com/assets/cb-47267/mw-1440/images/help/pages/publishing-source-drop-down.webp)

### Passo 2: Fazer Push do Workflow

```bash
# 1. Adicionar workflow ao git
git add .github/workflows/deploy-storybook.yml

# 2. Commit
git commit -m "ci: Add GitHub Pages deployment workflow for Storybook

- Auto-deploy on pushes to master/main
- Manual trigger via workflow_dispatch
- Builds and publishes design system documentation
"

# 3. Push para master ou main
git push origin master  # ou main
```

### Passo 3: Acionar Deploy

**Opção A: Push Automático**
- O workflow roda automaticamente quando você faz push para `master` ou `main`
- Apenas se houver mudanças em `packages/design-system/**`

**Opção B: Manual (Recomendado para primeira vez)**

1. Vá para: https://github.com/deboracastrodev/talentbase-v1/actions
2. Clique em **"Deploy Storybook"** na sidebar esquerda
3. Clique em **"Run workflow"** → Selecione branch → **"Run workflow"**

![Run Workflow](https://docs.github.com/assets/cb-33482/mw-1440/images/help/actions/manual-workflow-run.webp)

## 🔍 Verificar Deploy

### Acompanhar Progresso

1. Acesse: https://github.com/deboracastrodev/talentbase-v1/actions
2. Clique no workflow que está rodando
3. Aguarde conclusão (~2-5 minutos)

### Acessar Storybook Publicado

Após conclusão bem-sucedida:

```
https://deboracastrodev.github.io/talentbase-v1/
```

## ✅ Checklist de Deploy

- [ ] GitHub Pages ativado no repositório (Source: GitHub Actions)
- [ ] Workflow commitado e em push
- [ ] Workflow executado com sucesso
- [ ] Storybook acessível via GitHub Pages URL
- [ ] Logos aparecem corretamente no site publicado

## 🐛 Troubleshooting

### Erro: "Pages is not enabled"

**Solução:**
1. Vá para Settings → Pages
2. Ative GitHub Pages com source "GitHub Actions"

### Erro: "Permission denied"

**Solução:**
1. Vá para Settings → Actions → General
2. Em "Workflow permissions", selecione:
   - ☑️ Read and write permissions
3. Salve

### Logos Não Aparecem no GitHub Pages

**Causa:** Build foi feito sem os arquivos de logos.

**Solução:**
```bash
# 1. Verificar se logos existem localmente
ls -la packages/design-system/public/logos/

# 2. Build local
cd packages/design-system
pnpm build

# 3. Verificar se logos estão no build
ls -la storybook-static/logos/

# 4. Se estiver OK, commit e push
git add .
git commit -m "fix: Ensure logos are included in Storybook build"
git push origin master
```

### Workflow Não Roda Automaticamente

**Verificar:**
1. Push foi para branch `master` ou `main`?
2. Houve mudanças em `packages/design-system/**`?
3. Workflow está ativo? (Actions → Deploy Storybook → Enable)

## 🔄 Rebuild Manual

Se precisar fazer rebuild sem mudanças no código:

```bash
# 1. Via GitHub UI
# Actions → Deploy Storybook → Run workflow

# 2. Ou fazer commit vazio para acionar
git commit --allow-empty -m "ci: Trigger Storybook rebuild"
git push origin master
```

## 📊 Monitoramento

### Ver Logs do Build

1. https://github.com/deboracastrodev/talentbase-v1/actions
2. Clique no workflow
3. Expanda cada step para ver logs detalhados

### Verificar Arquivos Publicados

Após deploy, você pode ver os arquivos em:
```
https://deboracastrodev.github.io/talentbase-v1/logos/logo-full-primary.svg
```

## 🎯 Próximos Passos

1. **Fazer primeiro deploy:**
   ```bash
   git add .github/workflows/deploy-storybook.yml
   git commit -m "ci: Add Storybook deployment"
   git push origin master
   ```

2. **Ativar GitHub Pages:**
   - Settings → Pages → Source: GitHub Actions

3. **Executar workflow manualmente:**
   - Actions → Deploy Storybook → Run workflow

4. **Acessar Storybook:**
   - https://deboracastrodev.github.io/talentbase-v1/

## 📚 Recursos

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Storybook Deployment](https://storybook.js.org/docs/react/sharing/publish-storybook)

---

**Resumo Rápido:**

```bash
# 1. Commit workflow
git add .github/workflows/deploy-storybook.yml
git commit -m "ci: Add Storybook deployment"
git push origin master

# 2. Ativar Pages: Settings → Pages → Source: GitHub Actions

# 3. Run: Actions → Deploy Storybook → Run workflow

# 4. Acesse: https://deboracastrodev.github.io/talentbase-v1/
```
