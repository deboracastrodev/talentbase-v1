# Story 2.1: User Registration (Candidate)

Status: Ready for Review

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)

## Story

Como um **profissional de vendas**,
Eu quero **me registrar para uma conta no TalentBase**,
Para que **eu possa criar meu perfil e me candidatar a vagas**.

## Acceptance Criteria

1. Página de registro em `/auth/register/candidate`
2. Formulário com campos: nome, email, senha, confirmar senha, telefone
3. Validação client-side (formato email, força da senha, senhas iguais)
4. Endpoint API `POST /api/v1/auth/register/candidate`
5. Senha criptografada usando algoritmo padrão do Django
6. Usuário criado com role="candidate", status="active"
7. Email de confirmação enviado com detalhes da conta
8. Mensagem de sucesso exibida, redirect para `/candidate/profile` (onboarding)
9. Tratamento de erro para email duplicado
10. Formulário acessível e compatível com WCAG 2.1 AA

## Tasks / Subtasks

- [x] Task 1: Criar modelo User estendido (AC: 4, 5, 6)
  - [x] Configurar User model com role field
  - [x] Criar CandidateProfile model básico
  - [x] Executar migrações Django
- [x] Task 2: Implementar API de registro (AC: 4, 5, 6, 9)
  - [x] Criar serializer de validação
  - [x] Criar view de registro candidate
  - [x] Configurar token generation no sucesso
- [x] Task 3: Criar página de registro frontend (AC: 1, 2, 3, 10)
  - [x] Criar route `/auth/register/candidate`
  - [x] Implementar formulário com validação client-side
  - [x] Integrar com design system
- [x] Task 4: Configurar sistema de email (AC: 7)
  - [x] Configurar SMTP settings (MailHog para DEV)
  - [x] Criar Celery task de email
  - [x] Integrar Celery para envio assíncrono
- [x] Task 5: Implementar redirect pós-registro (AC: 8)
  - [x] Implementar mensagem de sucesso
  - [x] Configurar redirect para onboarding
- [x] Task 6: Implementar testes automatizados
  - [x] Testes unitários para registro candidato
  - [x] Testes E2E para fluxo completo
  - [x] Teste de email duplicado

## Dev Notes

### Architecture Context

**Authentication Strategy:**
- Django REST Framework Token Authentication
- Token armazenado em httpOnly cookie (proteção XSS)
- Rate limiting: 10 registrations/hora por IP

**Database Schema:**
- User model estendido com campo role
- CandidateProfile linked via OneToOne

### Security Requirements

- Validação CNPJ não aplicável (apenas para companies)
- Password hashing: PBKDF2 (Django default)
- Email uniqueness enforcement
- Client-side + server-side validation

### Project Structure Notes

- Routes em `packages/web/app/routes/auth.register.candidate.tsx`
- API views em `apps/api/authentication/views.py`
- Models em `apps/api/authentication/models.py`
- Email templates em `apps/api/templates/emails/`

### References

- [Source: docs/epics/epics.md#Story-2.1]
- [Source: docs/epics/tech-spec-epic-2.md#Story-2.1]
- [Source: docs/epics/tech-spec-epic-2.md#Database-Schema-Changes]

## Change Log

| Date       | Version | Description                                      | Author        |
| ---------- | ------- | ------------------------------------------------ | ------------- |
| 2025-10-02 | 0.1     | Initial draft                                     | Debora        |
| 2025-10-03 | 1.0     | Implementation complete - all ACs satisfied       | Amelia (Dev Agent) |

## Dev Agent Record

### Context Reference

- [Story Context XML](../stories-context/story-context-2.1.xml) - Generated 2025-10-03

### Agent Model Used

Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

### Completion Notes List

**Implementation Summary (2025-10-03):**

Story 2.1 successfully implemented following Clean Architecture principles and all acceptance criteria.

**Key Decisions:**
1. Made CandidateProfile fields optional (cpf, linkedin, current_position, years_of_experience) via migration 0002 to enable minimal registration per constraint dev2
2. Implemented rate limiting using DRF's AnonRateThrottle (10 req/hour per IP)
3. Email system configured with MailHog for DEV (zero real emails), production uses SendGrid/AWS SES
4. Self-service registration triggers automatic welcome email; admin-created users do NOT auto-send (manual trigger available)

**Architecture Highlights:**
- Clean Architecture: Service layer (CandidateRegistrationService) contains all business logic
- Views are thin controllers (75 lines including docs)
- @transaction.atomic ensures User + CandidateProfile created atomically
- Celery task (send_email_task) handles async email delivery

**Test Coverage:**
- Service tests: 5 tests covering user creation, password hashing, duplicate email, validation, transaction rollback
- View tests: 7 tests covering API endpoint, validation, error handling, rate limiting
- E2E tests: 6 Playwright tests covering full flow, client validation, accessibility (WCAG 2.1 AA), duplicate email UI

**Next Steps:**
- Epic 3 will implement full profile onboarding (CPF, LinkedIn, video, skills)
- Story 2.2 will implement company registration with approval workflow
- Story 2.3 will implement login/token authentication

### File List

**Backend (Django):**
- `apps/api/authentication/services/__init__.py` (new)
- `apps/api/authentication/services/registration.py` (new) - CandidateRegistrationService
- `apps/api/authentication/serializers.py` (new) - CandidateRegistrationSerializer, UserSerializer
- `apps/api/authentication/views.py` (modified) - register_candidate view
- `apps/api/authentication/tests/test_services.py` (new) - 5 service tests
- `apps/api/authentication/tests/test_views.py` (new) - 7 API tests
- `apps/api/candidates/models.py` (modified) - Made fields optional for registration
- `apps/api/candidates/migrations/0002_make_fields_optional_for_registration.py` (new)
- `apps/api/core/tasks.py` (new) - send_email_task Celery task
- `apps/api/talentbase/celery.py` (new) - Celery app configuration
- `apps/api/talentbase/__init__.py` (modified) - Load Celery on Django start
- `apps/api/talentbase/urls.py` (modified) - Added /api/v1/auth/register/candidate route
- `apps/api/talentbase/settings/base.py` (modified) - Added rest_framework.authtoken
- `apps/api/talentbase/settings/development.py` (modified) - MailHog email config
- `apps/api/.env.example` (modified) - Email config variables

**Frontend (Remix):**
- `packages/web/app/routes/auth.register.candidate.tsx` (new) - Registration page with full validation
- `packages/web/app/routes/candidate.profile.tsx` (new) - Onboarding placeholder

**Infrastructure:**
- `docker-compose.yml` (modified) - Added MailHog service
- `docs/development/EMAIL_TESTING.md` (new) - MailHog usage guide

**Tests:**
- `tests/e2e/candidate-registration.spec.ts` (new) - 6 E2E Playwright tests

**Documentation:**
- `docs/stories-context/story-context-2.1.xml` (modified) - Updated with email constraints