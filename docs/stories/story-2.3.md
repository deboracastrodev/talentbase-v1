# Story 2.3: Login & Token Authentication

Status: Draft

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)


## Story

Como um **usuário registrado**,
Eu quero **fazer login com meu email e senha**,
Para que **eu possa acessar meu dashboard**.

## Acceptance Criteria

1. Página de login em `/auth/login`
2. Formulário com campos: email, senha
3. Endpoint API `POST /api/v1/auth/login`
4. Token gerado na autenticação bem-sucedida (DRF Token Auth)
5. Token armazenado de forma segura em httpOnly cookie
6. Usuário redirecionado baseado na role:
   - admin → `/admin`
   - candidate → `/candidate`
   - company (active) → `/company`
   - company (pending) → `/auth/registration-pending`
7. Mensagem de erro para credenciais inválidas
8. Mensagem de erro para contas inativas/pendentes
9. Link "Esqueci minha senha" (placeholder para story futura)

## Tasks / Subtasks

- [ ] Task 1: Implementar API de login (AC: 3, 4, 7, 8)
  - [ ] Criar LoginSerializer com validação
  - [ ] Criar LoginView com token generation
  - [ ] Implementar verificação de status da conta
- [ ] Task 2: Configurar armazenamento de token (AC: 5)
  - [ ] Configurar httpOnly cookie settings
  - [ ] Implementar secure, sameSite flags
  - [ ] Configurar tempo de expiração (7 dias)
- [ ] Task 3: Implementar sistema de redirecionamento (AC: 6)
  - [ ] Criar utility function para role-based redirect
  - [ ] Implementar diferentes dashboards por role
  - [ ] Criar página pending approval
- [ ] Task 4: Criar página de login frontend (AC: 1, 2, 9)
  - [ ] Criar route `/auth/login`
  - [ ] Implementar formulário com validação
  - [ ] Integrar com design system
- [ ] Task 5: Implementar rate limiting (Segurança)
  - [ ] Configurar rate limiting (5 tentativas/minuto)
  - [ ] Implementar lockout temporário
  - [ ] Logs de tentativas de login

## Dev Notes

### Authentication Strategy

**Token Management:**
- Django REST Framework TokenAuthentication
- Token stored in httpOnly cookie (expires in 7 days)
- XSS protection via httpOnly flag
- CSRF protection via sameSite attribute

**Role-Based Redirects:**
```typescript
const getRedirectPath = (role: string, isActive: boolean) => {
  if (role === 'admin') return '/admin';
  if (role === 'candidate') return '/candidate';
  if (role === 'company') {
    return isActive ? '/company' : '/auth/registration-pending';
  }
  return '/';
};
```

### Security Requirements

- Rate limiting: 5 attempts per minute per IP
- Account lockout: temporary lock after multiple failures
- Secure cookie flags: secure, httpOnly, sameSite
- Invalid credential handling without user enumeration

### Database Changes

**No schema changes required** - using existing User model with role field.

### Cookie Configuration

**Secure Cookie Settings:**
```python
# settings/base.py
SESSION_COOKIE_SECURE = True  # HTTPS only in production
SESSION_COOKIE_HTTPONLY = True  # Prevent XSS
SESSION_COOKIE_SAMESITE = 'Strict'  # CSRF protection
SESSION_COOKIE_AGE = 604800  # 7 days in seconds
```

### API Response Format

**Success (200):**
```json
{
  "token": "abc123...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "candidate",
    "is_active": true
  },
  "redirect_url": "/candidate"
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

### Project Structure Notes

- Login route: `packages/web/app/routes/auth.login.tsx`
- API view: `apps/api/authentication/views.py`
- Utilities: `packages/web/app/utils/auth.ts`
- Pending page: `packages/web/app/routes/auth.registration-pending.tsx`

### Error Handling

- Invalid credentials: Generic message (prevent user enumeration)
- Pending approval: Specific message with instructions
- Account locked: Message with unlock time
- Rate limit exceeded: Message with retry time

### References

- [Source: docs/epics/epics.md#Story-2.3]
- [Source: docs/epics/tech-spec-epic-2.md#Story-2.3]
- [Source: docs/epics/tech-spec-epic-2.md#Authentication-Strategy]

## Change Log

| Date     | Version | Description   | Author        |
| -------- | ------- | ------------- | ------------- |
| 2025-10-02 | 0.1     | Initial draft | Debora |

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML/JSON will be added here by context workflow -->

### Agent Model Used

Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

### Completion Notes List

### File List