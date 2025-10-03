# Story 2.1: User Registration (Candidate)

Status: Draft

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

- [ ] Task 1: Criar modelo User estendido (AC: 4, 5, 6)
  - [ ] Configurar User model com role field
  - [ ] Criar CandidateProfile model básico
  - [ ] Executar migrações Django
- [ ] Task 2: Implementar API de registro (AC: 4, 5, 6, 9)
  - [ ] Criar serializer de validação
  - [ ] Criar view de registro candidate
  - [ ] Configurar token generation no sucesso
- [ ] Task 3: Criar página de registro frontend (AC: 1, 2, 3, 10)
  - [ ] Criar route `/auth/register/candidate`
  - [ ] Implementar formulário com validação client-side
  - [ ] Integrar com design system
- [ ] Task 4: Configurar sistema de email (AC: 7)
  - [ ] Configurar SMTP settings (SendGrid/AWS SES)
  - [ ] Criar template de email de confirmação
  - [ ] Integrar Celery para envio assíncrono
- [ ] Task 5: Implementar redirect pós-registro (AC: 8)
  - [ ] Implementar mensagem de sucesso
  - [ ] Configurar redirect para onboarding
- [ ] Task 6: Implementar testes automatizados
  - [ ] Testes unitários para registro candidato
  - [ ] Testes E2E para fluxo completo
  - [ ] Teste de email duplicado

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