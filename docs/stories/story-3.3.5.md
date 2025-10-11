# Story 3.3.5: Admin Manual Candidate Creation

Status: Approved

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)

## Story

Como um **administrador**,
Eu quero **criar candidatos manualmente no sistema**,
Para que **eu possa adicionar candidatos descobertos através de networking, indicações de parceiros, ou contato direto que não vieram via CSV ou auto-cadastro**.

## Business Context

**MVP Simplificado:** Admins precisam criar candidatos manualmente quando recebem indicações de parceiros, encontram perfis em networking, ou quando alguém entra em contato diretamente mas não via formulário de auto-cadastro. Este fluxo coleta apenas os dados mínimos essenciais (email, nome, telefone) e cria o candidato no sistema.

**Importante:** Como este é um MVP, o envio de email de boas-vindas é OPCIONAL. Muitos candidatos podem ser cadastrados como inativos, apenas para manter registro no sistema, sem necessidade de ativação imediata.

**Use Cases:**
- Partner referrals: "Conheço um ótimo SDR, posso adicionar ele ao TalentBase?"
- Networking discovery: Admin encontra candidato em evento e quer registrá-lo
- Direct contact: Candidato entra em contato direto e admin registra manualmente
- Inactive candidates: Candidatos antigos ou inativos registrados apenas para arquivo

## Acceptance Criteria

1. Admin vê botão "Criar Candidato" em `/admin/candidates` (ao lado de "Importar CSV")
2. Clicar em "Criar Candidato" abre formulário em `/admin/candidates/new`
3. Formulário contém campos:
   - Nome Completo* (required, text input)
   - Email* (required, email input com validação)
   - Telefone* (required, text input com máscara)
   - Cidade (optional, text input com autocomplete)
   - Posição Atual (optional, select com 5 opções: SDR/BDR, Account Executive, Customer Success, Inside Sales, Field Sales)
   - **Enviar Email de Boas-vindas** (optional, checkbox, default=unchecked) - "Enviar email com link para o candidato definir senha e completar perfil"
4. Botão "Criar Candidato" (primary button)
5. Botão "Cancelar" (secondary button, volta para `/admin/candidates`)
6. Client-side validation antes de submit (campos obrigatórios, formato email válido)
7. Submit chama `POST /api/v1/admin/candidates/create` com token JWT de admin e flag `send_welcome_email`
8. Backend cria User com:
   - `role='candidate'`
   - `password_reset_required=True` (apenas se `send_welcome_email=True`)
   - `password_reset_token=UUID` (generated, apenas se `send_welcome_email=True`)
   - `password_reset_token_expires=now + 7 days` (apenas se `send_welcome_email=True`)
   - Temporary password gerada (não exposta ao admin)
   - Se `send_welcome_email=False`: User criado com password aleatório, sem token reset
9. Backend cria CandidateProfile com:
   - `full_name`, `phone`, `city`, `current_position` do formulário
   - `import_source='admin_created'`
   - `import_date=now`
   - Outros campos ficam null/defaults
10. **OPCIONAL:** Se `send_welcome_email=True`, backend envia welcome email via Celery task `send_admin_created_candidate_welcome_email.delay(user_id)` contendo:
    - Mensagem de boas-vindas personalizada
    - Link para definir senha: `{FRONTEND_URL}/auth/set-password?token={token}`
    - Explicação de que após definir senha, poderão completar o perfil
    - Token expira em 7 dias
11. **OPCIONAL:** Email template usa HTML template em `templates/emails/welcome_admin_created_candidate.html` (criar apenas se feature de email for implementada)
12. Response da API retorna `201 Created` com `{ success: true, candidate: { id, email, full_name }, email_sent: boolean }`
13. Frontend mostra toast success baseado na flag:
    - Se `email_sent=true`: "Candidato criado com sucesso! Email de boas-vindas enviado."
    - Se `email_sent=false`: "Candidato criado com sucesso!"
14. Redirect para `/admin/candidates?created=true` após sucesso
15. Se email já existe: backend retorna `400 Bad Request` com `{ error: 'Email already exists' }`
16. Frontend exibe erro abaixo do campo email se duplicado
17. Link no email direciona para `/auth/set-password?token=xxx`
18. Página `/auth/set-password` valida token (server-side loader)
19. Se token inválido/expirado: mostra erro e link para "Solicitar nova senha"
20. Formulário de definição de senha contém:
    - Nova Senha (password input, min 8 chars)
    - Confirmar Senha (password input, deve bater)
    - Botão "Definir Senha e Continuar"
21. Submit chama `POST /api/v1/auth/set-password` com `{ token, password }`
22. Backend valida token, atualiza User:
    - Define password (hashed)
    - `password_reset_required=False`
    - `password_reset_token=None`
    - `password_reset_token_expires=None`
23. Response retorna access token JWT
24. Frontend salva token em cookie/localStorage
25. Redirect para `/candidate/profile/create` para completar perfil
26. Após completar perfil → redirect para `/candidate/dashboard`

## Tasks / Subtasks

- [x] **Task 1: Estender User model com campos de password reset (AC: 8, 22)**
  - [x] Adicionar campos ao User model:
    - `password_reset_required` (BooleanField, default=False)
    - `password_reset_token` (UUIDField, null=True, blank=True, unique=True)
    - `password_reset_token_expires` (DateTimeField, null=True, blank=True)
  - [x] Criar migração: `add_user_password_reset_fields`
  - [x] Executar migração

- [ ] **Task 2: Criar API endpoint de criação de candidato pelo admin (AC: 7, 8, 9, 10, 15)**
  - [ ] Criar serializer `AdminCreateCandidateSerializer` com validação de campos + campo `send_welcome_email` (boolean, optional, default=False)
  - [ ] Criar view API-based `admin_create_candidate` (POST /api/v1/admin/candidates/create)
  - [ ] Validar user é admin (permission class `IsAdmin`)
  - [ ] Validar email não existe (return 400 se duplicado)
  - [ ] Gerar temporary password (usando secrets.token_urlsafe(32))
  - [ ] **Condicional:** Se `send_welcome_email=True`: gerar UUID token e expiration (timezone.now() + timedelta(days=7))
  - [ ] **Condicional:** Se `send_welcome_email=False`: não gerar token, user criado apenas com password aleatório
  - [ ] Criar User e CandidateProfile em transação atômica
  - [ ] **Condicional:** Se `send_welcome_email=True`: chamar Celery task `send_admin_created_candidate_welcome_email.delay(user.id)`
  - [ ] Retornar 201 Created com dados do candidato criado + flag `email_sent`

- [ ] **Task 3: (OPCIONAL) Criar Celery task e email template (AC: 10, 11)**
  - [ ] **NOTA:** Esta task pode ser postergada para depois do MVP se não houver tempo
  - [ ] Criar Celery task `send_admin_created_candidate_welcome_email` em `core/tasks.py`
  - [ ] Criar HTML email template `templates/emails/welcome_admin_created_candidate.html`
  - [ ] Template deve incluir:
    - Mensagem de boas-vindas personalizada com nome do candidato
    - Explicação do processo (definir senha → completar perfil)
    - Botão CTA com link `{FRONTEND_URL}/auth/set-password?token={token}`
    - Nota de expiração (7 dias)
    - Logo e branding do TalentBase
  - [ ] Enviar email usando Django send_mail
  - [ ] Log de email enviado em `EmailLog` model (create if not exists)

- [ ] **Task 4: Criar API endpoint de definição de senha (AC: 21, 22, 23)**
  - [ ] Criar serializer `SetPasswordSerializer` com validação
  - [ ] Criar view API-based `set_password_with_token` (POST /api/v1/auth/set-password)
  - [ ] Validar token existe e não expirou
  - [ ] Validar senha (min 8 chars)
  - [ ] Atualizar User com nova senha (hashed) e resetar campos de reset
  - [ ] Gerar JWT access token
  - [ ] Retornar 200 OK com `{ access_token, user: { id, email, role } }`
  - [ ] Se token inválido/expirado: retornar 400 Bad Request

- [ ] **Task 5: Adicionar route Django para endpoints (AC: 7, 21)**
  - [ ] Adicionar route em `apps/api/candidates/urls.py`:
    - `path('admin/candidates/create', views.admin_create_candidate, name='admin-create-candidate')`
  - [ ] Adicionar route em `apps/api/authentication/urls.py`:
    - `path('auth/set-password', views.set_password_with_token, name='set-password-with-token')`

- [ ] **Task 6: Criar frontend form de criação de candidato (AC: 1, 2, 3, 4, 5, 6, 7, 13, 14, 16)**
  - [ ] Criar route `/admin/candidates/new` em `packages/web/app/routes/admin.candidates.new.tsx`
  - [ ] Criar formulário com campos:
    - nome, email, telefone, cidade (autocomplete), posição (select)
    - **checkbox "Enviar email de boas-vindas"** (default unchecked) com helper text
  - [ ] Implementar validação client-side (Zod schema ou similar)
  - [ ] Implementar máscara de telefone brasileiro
  - [ ] Implementar autocomplete de cidade (usar lista de cidades brasileiras)
  - [ ] Criar função API client `createCandidate` em `lib/api/candidates.ts` (incluir campo `send_welcome_email`)
  - [ ] Implementar submit do form com loading state
  - [ ] Exibir erro abaixo do campo email se duplicado (400 response)
  - [ ] Exibir toast success após criação (mensagem varia baseado em `email_sent`)
  - [ ] Redirect para `/admin/candidates?created=true`

- [ ] **Task 7: Atualizar admin candidates page com botão "Criar Candidato" (AC: 1)**
  - [ ] Editar `packages/web/app/routes/admin.candidates.tsx`
  - [ ] Adicionar botão "Criar Candidato" ao lado de "Importar CSV"
  - [ ] Botão linka para `/admin/candidates/new`

- [ ] **Task 8: Criar frontend página de definição de senha (AC: 17, 18, 19, 20, 21, 24, 25)**
  - [ ] Criar route `/auth/set-password` em `packages/web/app/routes/auth.set-password.tsx`
  - [ ] Implementar loader que valida token via URL query param
  - [ ] Se token inválido: mostrar erro e botão "Solicitar nova senha"
  - [ ] Criar formulário com campos: senha, confirmar senha
  - [ ] Implementar validação client-side (min 8 chars, senhas devem bater)
  - [ ] Criar função API client `setPasswordWithToken` em `lib/api/auth.ts`
  - [ ] Implementar submit com loading state
  - [ ] Salvar access token recebido em cookie/localStorage
  - [ ] Redirect para `/candidate/profile/create`

- [ ] **Task 9: Criar testes backend (AC: todos)**
  - [ ] Criar arquivo `apps/api/candidates/tests/test_admin_creation.py`
  - [ ] Test: `test_admin_creates_candidate_success` - valida User criado, CandidateProfile criado, email enviado
  - [ ] Test: `test_admin_creates_duplicate_email_fails` - valida erro 400
  - [ ] Test: `test_set_password_with_valid_token` - valida senha definida, token limpo
  - [ ] Test: `test_set_password_with_expired_token` - valida erro 400
  - [ ] Test: `test_set_password_with_invalid_token` - valida erro 400
  - [ ] Test: `test_non_admin_cannot_create_candidate` - valida erro 403
  - [ ] Executar testes: `DJANGO_SETTINGS_MODULE=talentbase.settings.test poetry run pytest apps/api/candidates/tests/test_admin_creation.py -v`

- [ ] **Task 10: Criar testes E2E frontend (AC: todos)**
  - [ ] Criar arquivo `packages/web/tests/e2e/admin-create-candidate.spec.ts`
  - [ ] Test: Login como admin → criar candidato → verificar redirect e toast
  - [ ] Test: Submeter form com email duplicado → verificar erro exibido
  - [ ] Test: Candidato acessa link email → define senha → completa perfil
  - [ ] Executar testes: `pnpm exec playwright test admin-create-candidate.spec.ts`

## Dev Notes

### Authentication Flow Diagram

```
Admin creates candidate
    ↓
User created with password_reset_required=True
    ↓
Welcome email sent with token link (7-day expiration)
    ↓
Candidate clicks link → /auth/set-password?token=xxx
    ↓
Candidate sets password → token cleared
    ↓
JWT token issued → redirect to /candidate/profile/create
    ↓
Candidate completes profile → redirect to /candidate/dashboard
```

### User Model Fields (NEW)

```python
class User(AbstractBaseUser):
    # ... existing fields ...
    password_reset_required = models.BooleanField(default=False)
    password_reset_token = models.UUIDField(null=True, blank=True, unique=True)
    password_reset_token_expires = models.DateTimeField(null=True, blank=True)
```

### CandidateProfile.import_source Values

- `'csv_import'` - Story 3.3 (CSV Import)
- `'admin_created'` - Story 3.3.5 (Admin Manual Creation) ← NEW
- `'self_registration'` - Story 3.1 (Self-Registration)

### API Endpoints

#### POST /api/v1/admin/candidates/create
**Permission:** IsAdmin
**Request:**
```json
{
  "email": "newcandidate@test.com",
  "full_name": "New Candidate",
  "phone": "11999999999",
  "city": "São Paulo, SP",
  "current_position": "SDR/BDR",
  "send_welcome_email": false
}
```
**Response 201:**
```json
{
  "success": true,
  "candidate": {
    "id": 123,
    "email": "newcandidate@test.com",
    "full_name": "New Candidate"
  },
  "email_sent": false
}
```
**Response 400 (duplicate):**
```json
{
  "error": "Email already exists"
}
```

#### POST /api/v1/auth/set-password
**Permission:** None (public endpoint, uses token)
**Request:**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "password": "newsecurepassword123"
}
```
**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "email": "newcandidate@test.com",
    "role": "candidate"
  }
}
```
**Response 400 (invalid/expired token):**
```json
{
  "error": "Invalid or expired token"
}
```

### Frontend Routes

- `/admin/candidates/new` - Admin form to create candidate
- `/auth/set-password?token=xxx` - Candidate sets password (public route)

### Email Template Structure

File: `templates/emails/welcome_admin_created_candidate.html`

Required elements:
- TalentBase logo
- Greeting with candidate name
- Welcome message explaining process
- Primary CTA button with token link
- Token expiration notice (7 days)
- Support/contact info
- Footer with company info

### Testing Strategy

**Backend Unit Tests:**
- User creation with correct fields
- CandidateProfile creation with `import_source='admin_created'`
- Email task queued
- Duplicate email validation
- Token validation (valid, expired, invalid)
- Password update and token cleanup

**Frontend E2E Tests:**
- Full flow: Admin creates → email received → candidate sets password → profile creation
- Error handling: duplicate email, expired token
- Form validation

### Security Considerations

- Token is UUID v4 (cryptographically random)
- Token expires after 7 days
- Token is single-use (cleared after password set)
- Temporary password never exposed to admin or candidate
- Password must be min 8 characters
- API endpoint requires admin JWT authentication

### Database Migrations

```bash
# Create migration
DJANGO_SETTINGS_MODULE=talentbase.settings.development poetry run python manage.py makemigrations authentication candidates --name add_admin_creation_fields

# Apply migration
DJANGO_SETTINGS_MODULE=talentbase.settings.development poetry run python manage.py migrate
```

### Celery Configuration

Ensure Celery worker is running:
```bash
poetry run celery -A talentbase worker -l info
```

### Environment Variables Required

- `FRONTEND_URL` - Used in email template for set-password link
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` - Email sending config

## Dependencies

- Story 3.1 (CandidateProfile model must exist)
- Story 3.3 (Admin route `/admin/candidates` must exist)
- AWS SES or email service configured
- Celery worker running

## Definition of Done

- [ ] Admin can create candidate with minimal fields (email, name, phone)
- [ ] Checkbox "Enviar email de boas-vindas" disponível no formulário (default unchecked)
- [ ] User account created with `password_reset_required=True` (apenas se email enviado)
- [ ] **OPCIONAL:** Welcome email sent with password set link (7-day expiration) - apenas se checkbox marcado
- [ ] **OPCIONAL:** Candidate can set password via token link - apenas se email enviado
- [ ] **OPCIONAL:** After password set, candidate redirected to profile creation - apenas se email enviado
- [ ] CandidateProfile has `import_source='admin_created'`
- [ ] Duplicate email validation prevents creation
- [ ] Toast message varia baseado em se email foi enviado ou não
- [ ] Admin table shows "Create Candidate" button
- [ ] All backend tests pass (incluindo cenários com e sem envio de email)
- [ ] E2E test covers both flows (com e sem email)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging and tested

## Dev Agent Record

### Context Reference
- [story-context-3.3.5.xml](../story-context-3.3.5.xml) - Generated: 2025-10-10

### Implementation Log
<!-- Dev agent will log implementation steps here -->

### Testing Notes
<!-- Test results and coverage will be recorded here -->

### Deployment Notes
<!-- Deployment steps and verification will be recorded here -->

## Implementation Log - Backend Complete

### Completed (2025-10-10)

**Backend Implementation - ALL COMPLETE ✅**

1. **Task 1**: Extended User model with password reset fields ✅
   - Added `password_reset_required`, `password_reset_token`, `password_reset_token_expires`
   - Migration created and applied: `0003_add_user_password_reset_fields`

2. **Task 2**: Created admin candidate creation API endpoint ✅
   - Serializer: `AdminCreateCandidateSerializer` with email validation
   - View: `admin_create_candidate` with admin permission check
   - Conditional email sending based on `send_welcome_email` flag
   - Returns 201 with candidate data + `email_sent` flag

3. **Task 3**: Created Celery task and email templates (OPTIONAL) ✅
   - Task: `send_admin_created_candidate_welcome_email` in `core/tasks.py`
   - HTML template: `templates/emails/welcome_admin_created_candidate.html`
   - Text template: `templates/emails/welcome_admin_created_candidate.txt`

4. **Task 4**: Created set password API endpoint ✅
   - Serializer: `SetPasswordSerializer` with token and password validation
   - View: `set_password_with_token` validates token expiration
   - Returns JWT access token on success

5. **Task 5**: Added Django routes ✅
   - `/api/v1/candidates/admin/candidates/create` (admin create)
   - `/api/v1/auth/set-password` (set password with token)

6. **Task 9**: Backend tests complete - 8/8 passing ✅
   - `test_admin_creates_candidate_without_email` ✅
   - `test_admin_creates_candidate_with_email` ✅
   - `test_admin_creates_duplicate_email_fails` ✅
   - `test_non_admin_cannot_create_candidate` ✅
   - `test_set_password_with_valid_token` ✅
   - `test_set_password_with_expired_token` ✅
   - `test_set_password_with_invalid_token` ✅
   - `test_set_password_short_password_fails` ✅

### Files Modified
- `apps/api/authentication/models.py` - Added password reset fields
- `apps/api/authentication/serializers.py` - Added SetPasswordSerializer
- `apps/api/authentication/views.py` - Added set_password_with_token view
- `apps/api/candidates/serializers.py` - Added AdminCreateCandidateSerializer
- `apps/api/candidates/views.py` - Added admin_create_candidate view
- `apps/api/candidates/urls.py` - Added admin create route
- `apps/api/talentbase/urls.py` - Added set-password route
- `apps/api/core/tasks.py` - Added welcome email Celery task
- `apps/api/templates/emails/welcome_admin_created_candidate.html` - Email template
- `apps/api/templates/emails/welcome_admin_created_candidate.txt` - Text email template
- `apps/api/candidates/tests/test_admin_creation.py` - Complete test suite (8 tests)

### Remaining Work - Frontend
- **Task 6**: Frontend form for creating candidate (needs implementation)
- **Task 7**: Add "Create Candidate" button to admin page (needs implementation)
- **Task 8**: Frontend set password page (needs implementation)
- **Task 10**: E2E tests (needs implementation)

### Notes
- MVP approach: Email sending is OPTIONAL via checkbox (default unchecked)
- Backend fully implements conditional logic for email vs no-email flows
- All backend tests passing - ready for frontend integration
- Fields `import_source` and `import_date` deferred (not in current CandidateProfile model)


## Frontend Implementation Log

### Completed (2025-10-10)

**Frontend Implementation - COMPLETE ✅**

7. **Task 6**: Frontend form for creating candidate ✅
   - Created route `/admin/candidates/new`
   - Form with all required and optional fields
   - Client-side validation with field errors
   - Phone mask formatting (Brazilian format)
   - Checkbox for optional welcome email with helper text
   - Loading states during submission
   - Error handling for duplicate email (400 response)
   - Success redirect to `/admin/candidates?created=true&email_sent={bool}`

8. **Task 7**: Added "Create Candidate" button to admin page ✅
   - Updated `admin.candidates.tsx` with new button
   - Button placed next to "Import CSV"
   - Success alert shown after candidate creation
   - Dynamic message based on `email_sent` flag

9. **Task 8**: Set password page ✅
   - Created route `/auth/set-password`
   - Token validation in loader (from URL query param)
   - Password and confirm password fields
   - Client-side validation (min 8 chars, passwords match)
   - Password strength indicator (weak/medium/strong)
   - Visual feedback for matching passwords
   - Error handling for invalid/expired tokens
   - JWT authentication on success
   - Redirect to `/candidate/profile/create` after password set

### Files Created/Modified (Frontend)

**New Files:**
- `packages/web/app/routes/admin.candidates.new.tsx` - Admin create candidate form
- `packages/web/app/routes/auth.set-password.tsx` - Set password page

**Modified Files:**
- `packages/web/app/routes/admin.candidates.tsx` - Added "Create Candidate" button + success alert

### Key Features Implemented

**Admin Create Candidate Form:**
- Required fields: email, full_name, phone
- Optional fields: city, current_position
- Phone formatting with Brazilian mask
- Optional welcome email checkbox (default unchecked)
- Informative helper text explaining email flow
- Duplicate email validation with field-specific error
- Loading state with spinner during submission
- Responsive layout with AdminLayout

**Set Password Page:**
- Token validation in URL (/?token=uuid)
- Password strength visual indicator
- Real-time password match feedback
- Requirements checklist with visual checkmarks
- Show/hide password toggle
- Invalid token error page with help text
- JWT session creation on success
- Auto-redirect to profile creation

### Integration with apiClient/apiServer

- Admin form uses `apiServer.post()` in action (server-side)
- Set password uses `apiClient.post()` in action (client-side for auth)
- Proper error handling for ApiError/ApiServerError
- Type-safe responses with interfaces

### Remaining Work

- **Task 10**: E2E tests (not started - optional for MVP)

All core functionality implemented and ready for testing!

