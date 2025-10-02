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
