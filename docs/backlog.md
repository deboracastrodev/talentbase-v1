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
