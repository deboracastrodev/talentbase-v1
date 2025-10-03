# Story 2.5: Company Approval Workflow

Status: Draft

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)


## Story

Como um **admin**,
Eu quero **revisar registros de empresas pendentes e aprová-los/rejeitá-los**,
Para que **apenas empresas legítimas possam acessar a plataforma**.

## Acceptance Criteria

1. Admin vê widget "Pending Approvals" no dashboard com contagem
2. Clicar no widget → navega para `/admin/users?status=pending&role=company`
3. Admin pode visualizar detalhes da empresa: nome, CNPJ, website, info de contato
4. Admin pode verificar CNPJ (lookup externo ou verificação manual)
5. Admin pode clicar "Aprovar" ou "Rejeitar" com motivo opcional
6. Aprovação:
   - Status do usuário muda para "active"
   - Email enviado: "Sua empresa foi aprovada! Agora você pode fazer login."
7. Rejeição:
   - Status do usuário muda para "rejected"
   - Email enviado: "Seu registro não foi aprovado" + motivo
8. Empresas aprovadas podem imediatamente fazer login e acessar dashboard `/company`
9. Log de auditoria registra aprovação/rejeição (admin user, timestamp, motivo)

## Tasks / Subtasks

- [ ] Task 1: Criar API de aprovação/rejeição (AC: 5, 6, 7, 9)
  - [ ] Implementar `POST /api/v1/admin/users/:id/approve`
  - [ ] Implementar `POST /api/v1/admin/users/:id/reject`
  - [ ] Criar log de auditoria
- [ ] Task 2: Implementar widget pending approvals (AC: 1, 2)
  - [ ] Criar query para contar empresas pendentes
  - [ ] Adicionar widget ao admin dashboard
  - [ ] Implementar navegação com filtros
- [ ] Task 3: Criar interface de revisão (AC: 3, 4, 5)
  - [ ] Mostrar detalhes completos da empresa
  - [ ] Integrar verificação CNPJ (ReceitaWS API)
  - [ ] Criar botões aprovar/rejeitar com modal
- [ ] Task 4: Configurar notificações email (AC: 6, 7)
  - [ ] Template email aprovação
  - [ ] Template email rejeição
  - [ ] Integrar com sistema Celery
- [ ] Task 5: Validar acesso pós-aprovação (AC: 8)
  - [ ] Testar login de empresa aprovada
  - [ ] Verificar redirecionamento para dashboard
  - [ ] Validar permissões de acesso

## Dev Notes

### Approval Workflow Logic

**Approval Process:**
1. Admin reviews company details
2. Optional CNPJ verification via external API
3. Approve → User.is_active=True, send email
4. Reject → User.is_active=False, send email with reason

**Status Transitions:**
- pending_approval → active (approved)
- pending_approval → rejected (rejected)
- rejected → active (manual re-approval)

### External CNPJ Validation

**ReceitaWS Integration:**
```python
# Optional CNPJ lookup for verification
def verify_cnpj_external(cnpj):
    try:
        # Clean CNPJ string (remove special chars)
        cnpj_clean = re.sub(r'[^0-9]', '', cnpj)

        response = requests.get(
            f"https://receitaws.com.br/v1/cnpj/{cnpj_clean}",
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            return {
                'valid': data.get('status') == 'OK',
                'company_name': data.get('nome'),
                'activity': data.get('atividade_principal')[0]['text']
            }
    except Exception as e:
        logger.warning(f"CNPJ verification failed: {e}")
    return {'valid': False, 'error': 'Verification unavailable'}
```

### Audit Log Model

```python
class UserStatusAudit(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    old_status = models.CharField(max_length=50)
    new_status = models.CharField(max_length=50)
    reason = models.TextField(blank=True)
    action_type = models.CharField(max_length=20)  # approve, reject, activate, deactivate
    timestamp = models.DateTimeField(auto_now_add=True)
```

### API Endpoints

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/api/v1/admin/users/:id/approve` | IsAdmin | Approve company registration |
| POST | `/api/v1/admin/users/:id/reject` | IsAdmin | Reject company with reason |
| GET | `/api/v1/admin/pending-count` | IsAdmin | Get pending approvals count |

### Email Templates (Portuguese)

**Approval Email:**
```
Subject: Empresa Aprovada - Acesse Sua Conta

Olá [CONTACT_NAME],

Sua empresa [COMPANY_NAME] foi aprovada no TalentBase!

Agora você pode:
- Publicar vagas de vendas
- Buscar candidatos qualificados
- Gerenciar processos seletivos

Acesse sua conta: https://www.salesdog.click/company

Atenciosamente,
Equipe TalentBase
```

**Rejection Email:**
```
Subject: Cadastro Não Aprovado

Olá [CONTACT_NAME],

Infelizmente, não pudemos aprovar o cadastro da empresa [COMPANY_NAME].

Motivo: [REJECTION_REASON]

Se você acredita que houve um erro, entre em contato: contato@salesdog.click

Atenciosamente,
Equipe TalentBase
```

### Security Requirements

- Admin-only permission enforcement
- Audit trail for all approval actions
- Rate limiting on approval endpoints
- Input validation for rejection reasons

### Project Structure Notes

- Admin dashboard: `packages/web/app/routes/admin._index.tsx`
- Approval components: `packages/web/app/components/admin/CompanyApproval.tsx`
- API views: `apps/api/admin/views.py`
- Audit model: `apps/api/authentication/models.py`

### Testing Strategy

**Unit Tests:**
- Approval flow creates audit log
- Email notifications sent correctly
- Status changes update User.is_active
- Permission checks for admin-only access

**E2E Tests:**
- Admin approves company → company can login
- Admin rejects company → company receives email
- Pending count updates correctly

### References

- [Source: docs/epics/epics.md#Story-2.5]
- [Source: docs/epics/tech-spec-epic-2.md#Story-2.5]
- [Source: docs/epics/tech-spec-epic-2.md#Company-Approval-Workflow]

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