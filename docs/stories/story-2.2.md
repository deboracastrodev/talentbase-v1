# Story 2.2: User Registration (Company)

Status: Draft

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)


## Story

Como um **gerente de contratação**,
Eu quero **registrar minha empresa no TalentBase**,
Para que **eu possa publicar vagas e buscar candidatos (após aprovação do admin)**.

## Acceptance Criteria

1. Página de registro em `/auth/register/company`
2. Formulário com campos: nome da empresa, CNPJ, email, senha, nome do contato, telefone, website
3. Validação de CNPJ (formato brasileiro de ID fiscal)
4. Endpoint API `POST /api/v1/auth/register/company`
5. Usuário criado com role="company", status="pending_approval"
6. Perfil da empresa criado linkado ao usuário
7. Email enviado ao usuário: "Registro recebido, aguardando aprovação do admin"
8. Email enviado ao admin: "Novo registro de empresa requer aprovação"
9. Usuário não pode fazer login até status="active"
10. Mensagem de sucesso: "Registro enviado, você receberá aprovação em 24 horas"

## Tasks / Subtasks

- [ ] Task 1: Criar CompanyProfile model (AC: 5, 6)
  - [ ] Criar model CompanyProfile com campos necessários
  - [ ] Configurar OneToOne relationship com User
  - [ ] Executar migrações Django
- [ ] Task 2: Implementar validação CNPJ (AC: 3)
  - [ ] Instalar biblioteca pycpfcnpj
  - [ ] Criar serializer com validação CNPJ
  - [ ] Implementar verificação de formato e dígito
- [ ] Task 3: Implementar API de registro company (AC: 4, 5, 6)
  - [ ] Criar view de registro company
  - [ ] Configurar criação de User + CompanyProfile
  - [ ] Configurar status pending_approval
- [ ] Task 4: Criar página de registro frontend (AC: 1, 2)
  - [ ] Criar route `/auth/register/company`
  - [ ] Implementar formulário com campos específicos
  - [ ] Integrar validação CNPJ client-side
- [ ] Task 5: Configurar notificações email (AC: 7, 8, 10)
  - [ ] Criar template email para empresa (registro recebido)
  - [ ] Criar template email para admin (nova empresa)
  - [ ] Implementar envio via Celery
- [ ] Task 6: Implementar encriptação de CNPJ
  - [ ] Configurar Django Encrypted Fields
  - [ ] Implementar encriptação para campo CNPJ
  - [ ] Garantir decriptação apenas quando necessário

## Dev Notes

### Architecture Context

**Company Approval Workflow:**
- Companies register with status="pending_approval"
- User.is_active=False until admin approves
- CompanyProfile created immediately but access blocked

**CNPJ Validation:**
- Format: XX.XXX.XXX/XXXX-XX
- Library: pycpfcnpj for digit validation
- Client-side format validation

### Database Schema

**CompanyProfile Fields:**
```python
company_name = models.CharField(max_length=200)
cnpj = models.CharField(max_length=255)  # Encrypted
website = models.URLField()
contact_person_name = models.CharField(max_length=200)
contact_person_email = models.EmailField()
contact_person_phone = models.CharField(max_length=20)
created_by_admin = models.BooleanField(default=False)
```

### Security Requirements

- CNPJ encryption for PII protection
- Admin notification system for approval workflow
- Prevent login until approval

### Project Structure Notes

- Routes em `packages/web/app/routes/auth.register.company.tsx`
- Models em `apps/api/companies/models.py`
- Views em `apps/api/authentication/views.py`
- CNPJ validation utility em `apps/api/core/utils.py`

### Email Templates

**Company Registration (Portuguese):**
- Subject: "Cadastro Recebido - Aguardando Aprovação"
- Template: Empresa cadastrada, aguardando aprovação em 24h

**Admin Notification:**
- Subject: "Nova empresa cadastrada: [COMPANY_NAME]"
- Include: CNPJ, contact info, link to approval page

### References

- [Source: docs/epics/epics.md#Story-2.2]
- [Source: docs/epics/tech-spec-epic-2.md#Story-2.2]
- [Source: docs/epics/tech-spec-epic-2.md#CompanyProfile-Fields]

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