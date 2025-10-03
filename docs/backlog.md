# Engineering Backlog

This backlog collects cross-cutting or future action items that emerge from reviews and planning.

Routing guidance:

- Use this file for non-urgent optimizations, refactors, or follow-ups that span multiple stories/epics.
- Must-fix items to ship a story belong in that story's `Tasks / Subtasks`.
- Same-epic improvements may also be captured under the epic Tech Spec `Post-Review Follow-ups` section.

| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ | ----- |
| 2025-10-02 | 1.1 | 1 | Security | Medium | Dev Team | Open | Add security warnings to `.env.example` files (root, apps/api, packages/web) - prepend warnings about not using example secrets in production. Related: AC #8 |
| 2025-10-02 | 1.1 | 1 | Documentation | Medium | Dev Team | Open | Document test execution requirements in README.md or TESTING.md - add section for running backend (pytest) and frontend (vitest) tests with Docker prerequisites. Related: AC #10 |
| 2025-10-02 | 1.1 | 1 | Enhancement | Low | Dev Team | Open | Create test-specific Django settings (apps/api/talentbase/settings/test.py) for isolated test database. Defer to Story 1.2 or when test suite grows. |
| 2025-10-02 | 1.1 | 1 | Security | Low | DevOps/Dev Team | Open | Production settings hardening: Add SECURE_SSL_REDIRECT, SECURE_HSTS_SECONDS, SESSION_COOKIE_SECURE, CSRF_COOKIE_SECURE to apps/api/talentbase/settings/production.py. Defer to Story 1.6 (DNS & SSL). |
| 2025-10-02 | 1.1 | 1 | Enhancement | Low | Dev Team | Open | Consider adding Django admin model registration when models are created in Story 1.2. Create apps/api/core/admin.py if needed. |
| 2025-10-02 | 1.2 | 1 | Security | High | Dev Team + Security | Open | Implement PII encryption for production: Add django-encrypted-model-fields, convert CPF/CNPJ to EncryptedCharField, create data migration. Defer to pre-production security audit. Related: AC #2, AC #3, LGPD Compliance |
| 2025-10-02 | 1.2 | 1 | Testing | Medium | Dev Team | Open | Add model tests for CompanyProfile and JobPosting (10-15 tests total). Create apps/api/companies/tests/test_models.py and apps/api/jobs/tests/test_models.py. Target: maintain 92% or increase to 95% coverage. Related: AC #13 |
| 2025-10-02 | 1.2 | 1 | Testing | Medium | Dev Team | Open | Add model tests for Ranking (4-5 tests). Create apps/api/matching/tests/test_models.py to test score validation, OneToOne constraint, ordering. Related: AC #13 |
| 2025-10-02 | 1.2 | 1 | Enhancement | Low | Dev Team | Open | Add score validation to Ranking model using MinValueValidator(0) and MaxValueValidator(100). File: apps/api/matching/models.py:628 |
| 2025-10-02 | 1.2 | 1 | Enhancement | Low | Dev Team | Open | Add is_current_job property to Experience model for better code readability. File: apps/api/candidates/models.py:160 |
| 2025-10-02 | 1.3 | 1 | Security | Medium | Dev Team | Open | Add sandbox attribute to VideoPlayer iframe: sandbox="allow-scripts allow-same-origin allow-presentation". File: packages/design-system/src/components/VideoPlayer.tsx:24. Related: AC #5 |
| 2025-10-02 | 1.3 | 1 | Documentation | Medium | Dev Team | Open | Create VideoPlayer Storybook story (VideoPlayer.stories.tsx) with examples: Default (valid URL), InvalidURL error state, custom title. Related: AC #7 |
| 2025-10-02 | 1.3 | 1 | Testing | Low | Dev Team | Open | Add VideoPlayer edge case tests: short-form youtu.be URLs, URLs with timestamp parameters, empty string handling. File: packages/web/app/components/__tests__/DesignSystemImport.test.tsx |
| 2025-10-02 | 1.3 | 1 | Enhancement | Low | Dev Team | Open | Add Error Boundary to demo page wrapping each component section. File: packages/web/app/routes/dev.components.tsx |
| 2025-10-02 | 1.4 | 1 | Performance | High | QA Team | Open | Run Lighthouse performance audit: npx lighthouse http://localhost:3000 --view. Validate Performance >90, Accessibility >90, SEO >90, load <2s. Related: AC #9 |
| 2025-10-02 | 1.4 | 1 | Accessibility | Medium | Dev Team | Open | Add prefers-reduced-motion media query to disable animations for users with motion sensitivity. File: packages/web/app/globals.css. Related: WCAG 2.1 |
| 2025-10-02 | 1.4 | 1 | Testing | Medium | Dev Team | Open | Add FAQ accordion test to E2E suite validating expand/collapse functionality. File: packages/web/tests/e2e/landing-page.spec.ts |
| 2025-10-02 | 1.4 | 1 | SEO | Low | Dev Team | Open | Add schema.org structured data (JSON-LD) for Organization, WebPage, FAQPage. Benefits: Rich snippets in Google search. Defer to SEO optimization sprint. |
| 2025-10-02 | 1.4 | 1 | Enhancement | Low | Design Team + Dev | Open | Replace company text names with SVG logos in Hero social proof section. File: packages/web/app/components/landing/Hero.tsx:86-95. Use lazy loading. |
| 2025-10-03 | 2.1 | 2 | Security | High | Full-stack Dev | Done | ✅ Implement httpOnly cookie-based token storage: Backend sets Set-Cookie header (httpOnly; Secure; SameSite=Strict), frontend removes localStorage usage. Files: apps/api/authentication/views.py:111-120, packages/web/app/routes/auth.register.candidate.tsx:133-141. Completed 2025-10-03. Related: AC #8, MED-1 |
| 2025-10-03 | 2.1 | 2 | Code Quality | Medium | Backend Dev | Done | ✅ Use RegistrationResponseSerializer in view - Replace manual dict construction with serializer for type-safe response. File: apps/api/authentication/views.py:93-96. Completed 2025-10-03. Related: AC #6, MED-2 |
| 2025-10-03 | 2.1 | 2 | Enhancement | Low | Backend Dev | Open | Create HTML email templates (HTML+text versions) in apps/api/templates/emails/ per Tech Spec Epic 2. Use EmailMultiAlternatives. Related: AC #7, LOW-4 |
| 2025-10-03 | 2.1 | 2 | Enhancement | Low | Frontend Dev | Open | Centralize API URL configuration: Create packages/web/app/lib/api-client.ts with typed endpoints and environment validation. Prevents accidental misconfiguration. Related: LOW-2 |
| 2025-10-03 | 2.1 | 2 | DevOps | Low | DevOps/Frontend | Open | Implement production error tracking: Integrate Sentry or similar for frontend error tracking. Project-wide, not story-specific. Related: LOW-3 |
| 2025-10-03 | 2.1 | 2 | Code Quality | Low | Frontend Dev | Open | Add TypeScript return type annotation (: JSX.Element) to CandidateRegister component. File: packages/web/app/routes/auth.register.candidate.tsx:24. Related: LOW-1 |
| 2025-10-03 | 2.1 | 2 | Testing | Low | Backend Dev | Open | Add Celery integration test without mocks to validate full email flow end-to-end (requires Celery worker in CI). Create apps/api/authentication/tests/test_integration.py. Related: AC #7 |
| 2025-10-03 | 2.1 | 2 | Testing | Low | Frontend Dev | Open | Extract validateForm to packages/web/app/lib/validation.ts and add Vitest unit tests. Easier to test validation rules, reusable across forms. |
