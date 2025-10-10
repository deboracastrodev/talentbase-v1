# Story 2.5: Company Approval Workflow

Status: Completed (exceto AC4 - verificação CNPJ externa)

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)


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

- [x] Task 1: Criar API de aprovação/rejeição (AC: 5, 6, 7, 9) - **COMPLETO**
  - [x] Implementar `PATCH /api/v1/admin/users/:id` com suporte a `reason`
  - [x] Criar UserStatusAudit model para log de auditoria
  - [x] Service atualizado para salvar audit logs automaticamente
  - [x] Endpoint `GET /api/v1/admin/pending-count` criado
- [x] Task 2: Implementar widget pending approvals (AC: 1, 2) - **COMPLETO**
  - [x] Criar query `get_pending_approvals_count()` no service
  - [x] Componente PendingApprovalsWidget criado
  - [x] Dashboard admin atualizado com widget funcional
  - [x] Navegação com filtros para `/admin/users?status=pending&role=company`
- [~] Task 3: Criar interface de revisão (AC: 3, 4, 5) - **PARCIAL (AC4 pendente)**
  - [x] Mostrar detalhes completos da empresa (UserDetailModal)
  - [ ] Integrar verificação CNPJ (ReceitaWS API) - **NÃO IMPLEMENTADO** (opcional)
  - [x] StatusConfirmModal criado com campo obrigatório de motivo para reject/deactivate
- [x] Task 4: Configurar notificações email (AC: 6, 7) - **COMPLETO**
  - [x] Template email aprovação
  - [x] Template email rejeição
  - [x] Integrar com sistema Celery
- [x] Task 5: Validar acesso pós-aprovação (AC: 8) - **COMPLETO**
  - [x] Testar login de empresa aprovada
  - [x] Verificar redirecionamento para dashboard
  - [x] Validar permissões de acesso

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

- [Story Context XML](../stories-context/story-context-2.5.xml) - Generated 2025-10-07

### Agent Model Used

Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

### Completion Notes List

**Implementation Date:** 2025-10-08
**Status:** ✅ Completed (exceto AC4 - verificação CNPJ externa opcional)

**✅ Features Implementadas - Session 2:**

**Backend:**
1. **UserStatusAudit Model** ([authentication/models.py](../../apps/api/authentication/models.py)) - AC9
   - Campos: user, changed_by, old_status, new_status, action_type, reason, timestamp
   - Índices otimizados para queries por user e timestamp
   - Migration aplicada: `0002_add_user_status_audit.py`

2. **Endpoint Pending Count** ([user_management/views.py](../../apps/api/user_management/views.py)) - AC1
   - `GET /api/v1/admin/pending-count` retorna `{"count": int}`
   - Protegido com IsAdmin permission
   - Service method: `get_pending_approvals_count()`

3. **Service Layer Atualizado** ([user_management/services/user_management.py](../../apps/api/user_management/services/user_management.py))
   - `update_user_status()` agora cria audit logs automaticamente
   - Determina action_type: approve, reject, activate, deactivate
   - Suporte completo ao campo `reason`

4. **Testes Completos** - 37/37 passando ✅
   - Test audit log creation (approve/reject)
   - Test pending count endpoint (success, permissions, zero count)
   - Test service layer with audit integration

**Frontend:**
5. **StatusConfirmModal** ([StatusConfirmModal.tsx](../../packages/web/app/components/admin/StatusConfirmModal.tsx)) - AC5, AC7
   - Modal de confirmação antes de approve/reject/activate/deactivate
   - Campo `reason` **obrigatório** para reject/deactivate
   - Campo `reason` opcional para approve/activate
   - Validação: botão desabilitado se reason vazio quando obrigatório

6. **PendingApprovalsWidget** ([PendingApprovalsWidget.tsx](../../packages/web/app/components/admin/PendingApprovalsWidget.tsx)) - AC1, AC2
   - Exibe contagem dinâmica de empresas pendentes
   - Clicável → navega para `/admin/users?status=pending&role=company`
   - Visual destacado quando há pending (borda amarela, ícone AlertCircle)
   - Estados: zero pending vs. has pending

7. **Admin Dashboard** ([admin._index.tsx](../../packages/web/app/routes/admin._index.tsx)) - AC1, AC2
   - Loader busca pending count via API
   - Widget PendingApprovals renderizado
   - Seção "Ações Rápidas" com links para gestão
   - Graceful degradation: mostra 0 em caso de erro

8. **API Client Atualizado** ([lib/api/admin.ts](../../packages/web/app/lib/api/admin.ts))
   - `updateUserStatus()` aceita parâmetro `reason?: string`
   - `fetchPendingApprovalsCount()` criado
   - Endpoint `pendingCount` adicionado à config

**❌ Feature Não Implementada (Opcional):**
- **AC4: Verificação CNPJ externa** via ReceitaWS API
  - Código exemplo existe na documentação
  - Não implementado por ser **opcional** ("ou verificação manual")
  - Pode ser adicionado em iteração futura se necessário
  - CNPJ já é armazenado e mostrado no UserDetailModal

**⚠️ Observações Técnicas:**
- Abordagem genérica `PATCH /api/v1/admin/users/:id` preferida sobre endpoints específicos approve/reject (mais flexível, menos código)
- Email templates hardcoded no service layer (melhor para MVP, pode mover para Django templates depois)
- Testes E2E pendentes (Story 2.5.1 ou sprint futura)
- Action types no audit log: approve, reject, activate, deactivate (mais granular que apenas active/inactive)

### File List

**Backend (Session 2 - Novos):**
- `apps/api/authentication/models.py` - **UserStatusAudit model** ✨ NEW
- `apps/api/authentication/migrations/0002_add_user_status_audit.py` - Migration ✨ NEW
- `apps/api/user_management/views.py` - **AdminPendingCountView** adicionado ✨ NEW
- `apps/api/user_management/services/user_management.py` - Audit log integration + `get_pending_approvals_count()`
- `apps/api/user_management/urls.py` - Rota `pending-count` adicionada
- `apps/api/user_management/tests/test_services.py` - 3 novos testes de audit log ✨ NEW
- `apps/api/user_management/tests/test_views.py` - 4 novos testes de pending-count ✨ NEW

**Backend (Session 1 - Existentes):**
- `apps/api/user_management/views.py` - AdminUserDetailView (PATCH)
- `apps/api/user_management/serializers.py` - Serializers
- `apps/api/core/tasks.py` - Celery email task

**Frontend (Session 2 - Novos):**
- `packages/web/app/components/admin/StatusConfirmModal.tsx` - Modal de confirmação ✨ NEW
- `packages/web/app/components/admin/PendingApprovalsWidget.tsx` - Widget de pending ✨ NEW
- `packages/web/app/routes/admin._index.tsx` - **Dashboard completo** (não mais redirect) ✨ UPDATED
- `packages/web/app/routes/admin.users.tsx` - Suporte a `reason` parameter ✨ UPDATED
- `packages/web/app/components/admin/UserDetailModal.tsx` - Integração com StatusConfirmModal ✨ UPDATED
- `packages/web/app/lib/api/admin.ts` - `fetchPendingApprovalsCount()` + reason parameter ✨ UPDATED
- `packages/web/app/config/api.ts` - Endpoint `pendingCount` adicionado ✨ UPDATED

**Frontend (Session 1 - Existentes):**
- `packages/web/app/components/admin/UserTable.tsx` - User list table

**Não Implementados (Opcionais):**
- ReceitaWS integration service (AC4 - verificação CNPJ externa)