# Story 1.7: Security & Quality Improvements

Status: Ready for Implementation

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)


## Story

Como **desenvolvedor do TalentBase**,
Eu quero **implementar melhorias críticas de segurança e qualidade identificadas no backlog**,
Para que **o sistema tenha maior robustez, segurança e manutenibilidade**.

## Acceptance Criteria

### Security & Configuration (High/Medium Priority)
1. ✅ Arquivos `.env.example` contêm warnings de segurança sobre não usar secrets de exemplo em produção
2. ✅ VideoPlayer iframe possui atributo `sandbox` com permissões explícitas (`allow-scripts allow-same-origin allow-presentation`)
3. ✅ Documentação de execução de testes (README.md ou TESTING.md) com instruções para pytest e vitest

### Accessibility & Performance (Medium Priority)
4. ✅ Media query `prefers-reduced-motion` implementada para desabilitar animações quando necessário (WCAG 2.1)
5. ✅ Lighthouse audit executado com métricas: Performance >90, Accessibility >90, SEO >90, load <2s

### Testing & Code Quality (Medium Priority)
6. ✅ Testes de modelo para CompanyProfile e JobPosting (apps/api/companies/tests/test_models.py, apps/api/jobs/tests/test_models.py)
7. ✅ Testes de modelo para Ranking (apps/api/matching/tests/test_models.py)
8. ✅ Teste E2E para FAQ accordion (packages/web/tests/e2e/landing-page.spec.ts)
9. ✅ Storybook story para VideoPlayer (VideoPlayer.stories.tsx)

## Tasks / Subtasks

### Task 1: Security Warnings & Documentation (AC: 1, 3)
- [ ] Adicionar security warnings em `.env.example` (root, apps/api, packages/web)
  - [ ] Prepend warning: "⚠️ SECURITY: Never use these example values in production. Generate secure secrets."
  - [ ] Documentar geração de SECRET_KEY Django
  - [ ] Atualizar 3 arquivos: root/.env.example, apps/api/.env.example, packages/web/.env.example
- [ ] Criar/Atualizar documentação de testes
  - [ ] Criar TESTING.md ou adicionar seção em README.md
  - [ ] Documentar execução pytest: `docker compose exec api pytest`
  - [ ] Documentar execução vitest: `docker compose exec web npm run test`
  - [ ] Incluir pré-requisitos (Docker running)

### Task 2: VideoPlayer Security & Docs (AC: 2, 9)
- [ ] Adicionar sandbox attribute ao VideoPlayer
  - [ ] Arquivo: packages/design-system/src/components/VideoPlayer.tsx:24
  - [ ] Atributo: `sandbox="allow-scripts allow-same-origin allow-presentation"`
  - [ ] Testar com URLs YouTube válidas
- [ ] Criar Storybook story
  - [ ] Arquivo: packages/design-system/src/components/VideoPlayer.stories.tsx
  - [ ] Stories: Default (valid URL), InvalidURL error state, custom title
  - [ ] Validar rendering no Storybook

### Task 3: Accessibility Implementation (AC: 4)
- [ ] Implementar prefers-reduced-motion
  - [ ] Arquivo: packages/web/app/globals.css
  - [ ] Media query: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`
  - [ ] Testar com emulação do Chrome DevTools

### Task 4: Performance Audit (AC: 5)
- [ ] Executar Lighthouse audit
  - [ ] Comando: `npx lighthouse http://localhost:3000 --view`
  - [ ] Validar métricas: Performance >90, Accessibility >90, SEO >90
  - [ ] Validar load time <2s
  - [ ] Documentar resultados em issue/PR
- [ ] Corrigir issues identificados se houver

### Task 5: Backend Model Tests (AC: 6, 7)
- [ ] Criar testes CompanyProfile e JobPosting
  - [ ] Arquivo: apps/api/companies/tests/test_models.py
  - [ ] 10-15 testes: validação, relacionamentos, métodos
  - [ ] Manter coverage >92%
- [ ] Criar testes Ranking
  - [ ] Arquivo: apps/api/matching/tests/test_models.py
  - [ ] 4-5 testes: score validation, OneToOne constraint, ordering
  - [ ] Validar score range 0-100

### Task 6: E2E Testing (AC: 8)
- [ ] Adicionar teste FAQ accordion
  - [ ] Arquivo: packages/web/tests/e2e/landing-page.spec.ts
  - [ ] Validar expand/collapse functionality
  - [ ] Validar accessibility (ARIA attributes)
  - [ ] Executar: `npm run test:e2e`

## Definition of Done

- [ ] Todos os ACs implementados e testados
- [ ] Warnings de segurança adicionados aos 3 arquivos .env.example
- [ ] VideoPlayer com sandbox attribute funcional
- [ ] Prefers-reduced-motion implementado e testado
- [ ] Lighthouse audit >90 em todas métricas
- [ ] Testes de modelo criados com coverage >92%
- [ ] Teste E2E FAQ accordion passando
- [ ] Storybook story VideoPlayer funcional
- [ ] Documentação de testes atualizada
- [ ] Code review aprovado
- [ ] CI/CD pipeline verde

## Technical Notes

### Referencias do Backlog
- **Story 1.1**: Items #13, #14 (Security warnings, test docs)
- **Story 1.2**: Items #19, #20 (Model tests)
- **Story 1.3**: Items #23, #24 (VideoPlayer sandbox, Storybook)
- **Story 1.4**: Items #27, #28, #29 (Performance, a11y, E2E)

### Security Context
- Sandbox attribute previne execução de scripts maliciosos em iframes
- .env.example warnings previnem vazamento de secrets em produção
- Prefers-reduced-motion é requisito WCAG 2.1 Level AA

### Testing Strategy
- Model tests focam em validação, constraints, e relacionamentos
- E2E tests validam user interaction flows
- Storybook stories servem como testes visuais e documentação

### Performance Targets
- **Performance**: >90 (LCP, FID, CLS)
- **Accessibility**: >90 (ARIA, contrast, keyboard nav)
- **SEO**: >90 (meta tags, structured data)
- **Load Time**: <2s (TTI, FCP)

## Dependencies

- ✅ Story 1.3 (VideoPlayer component) - Completed
- ✅ Story 1.4 (Landing page) - Completed
- ✅ Story 1.2 (Models) - Completed

## Follow-up Items

Items de baixa prioridade para futuro:
- PII encryption (Story 1.2, High severity) - Defer to pre-production audit
- Production settings hardening (Story 1.1) - Defer to Story 1.6
- HTML email templates (Story 2.1) - Defer to Email Epic
- Error tracking Sentry (Story 2.1) - Project-wide initiative

## Backlog Items Covered

| Item | Type | Severity | Status |
|------|------|----------|--------|
| #13 | Security | Medium | ✅ Task 1 |
| #14 | Documentation | Medium | ✅ Task 1 |
| #19 | Testing | Medium | ✅ Task 5 |
| #20 | Testing | Medium | ✅ Task 5 |
| #23 | Security | Medium | ✅ Task 2 |
| #24 | Documentation | Medium | ✅ Task 2 |
| #27 | Performance | High | ✅ Task 4 |
| #28 | Accessibility | Medium | ✅ Task 3 |
| #29 | Testing | Medium | ✅ Task 6 |
