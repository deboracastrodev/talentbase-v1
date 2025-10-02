# Story Context 1.3: Design System Integration & Component Library

## Story Overview
**Status:** Draft  
**Prioridade:** Alta  
**Tempo Estimado:** 2-3 horas

**Como um** frontend developer  
**Eu quero** o @talentbase/design-system package integrado no Remix  
**Para que** todos os componentes UI sejam consistentes e reutilizáveis

## Contexto Técnico
Esta story integra o design system existente (Storybook) como dependência workspace do app Remix. Inclui configuração de Tailwind, importação de componentes e criação do componente VideoPlayer (identificado como gap no review).

## Critérios de Aceitação Principais
1. ✅ Design system package linkado via pnpm workspace (`workspace:*`)
2. ✅ Tailwind CSS config importado do design system
3. ✅ Todos os design tokens acessíveis (colors, spacing, typography)
4. ✅ Componentes core renderizam no Remix: Button, Input, Card, Badge, Select, Checkbox
5. ✅ Componente VideoPlayer criado e funcionando (YouTube embeds)
6. ✅ Página de exemplos criada em `/dev/components`
7. ✅ Design system Storybook acessível localmente
8. ✅ Sem erros no console ao usar componentes
9. ✅ Testes de componente executando com sucesso
10. ✅ Build do design system funciona corretamente

## Dependências
**Depende de:**
- Story 1.1: Monorepo structure and pnpm workspaces configured

**Bloqueia:**
- Story 1.4: Landing page requires design system components

## Tarefas Principais
1. **Configurar dependência workspace** - Editar package.json e executar pnpm install
2. **Importar Tailwind config** - Configurar tailwind.config.ts para usar design system
3. **Criar componente VideoPlayer** - Implementar player de YouTube com extração de ID
4. **Criar página de exemplos** - Rota `/dev/components` para testar todos os componentes
5. **Criar testes de componente** - Testes unitários para componentes do design system
6. **Validação e documentação** - Verificar build, Storybook e funcionamento geral

## Gap Fix Implementado
**Gap Moderado 3:** Componente VideoPlayer
- Função `extractYouTubeId` para parsing de URLs
- Tratamento de erro para URLs inválidas
- Iframe com sandbox apropriado

## Arquivos Impactados
**Novos arquivos:**
- `packages/design-system/src/components/VideoPlayer.tsx`
- `packages/web/app/routes/dev.components.tsx`
- `packages/web/app/components/__tests__/DesignSystemImport.test.tsx`

**Modificados:**
- `packages/web/package.json` - Adicionar design system dependency
- `packages/web/tailwind.config.ts` - Importar design system config
- `packages/design-system/src/index.ts` - Exportar VideoPlayer

## Notas de Desenvolvimento
- Design tokens devem incluir cores primárias (50, 500, 900), success, warning, error
- Página de exemplos em `/dev/components` serve como playground para desenvolvimento
- Testes cobrem renderização básica e casos de erro do VideoPlayer
- Storybook deve permanecer acessível para documentação de componentes

## Validação Checklist
- [ ] `pnpm install` resolve design system corretamente
- [ ] `/dev/components` renderiza sem erros
- [ ] Todos componentes exibem corretamente
- [ ] Tailwind classes aplicam (colors, spacing)
- [ ] Sem warnings no console
- [ ] Storybook acessível

## Referências
- [Source: docs/epics/tech-spec-epic-1.md#Story-1.3]
- [Source: docs/epics/tech-spec-epic-1-review.md#Gap-Moderado-3]

---
*Contexto gerado em: 2025-10-02*