# Story 3.4: Admin Candidate Curation & Editing

Status: ContextReadyDraft

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)

## Story

Como um **admin**,
Eu quero **editar qualquer perfil de candidato e definir status**,
Para que **eu possa manter qualidade dos dados e marcar disponibilidade**.

## Acceptance Criteria

1. Página admin em `/admin/candidates`
2. Tabela lista todos candidatos: nome, posição, status, ranking score, created_at
3. Filtros: posição, status (available, inactive, under contract), verificado
4. Busca por nome ou email
5. Clicar linha do candidato → abre formulário de edição
6. Admin pode editar todos os campos (mesmo formulário de perfil do candidato)
7. Admin pode definir:
   - Status: Available, Inactive, Under Contract
   - Verified: Yes/No (badge no perfil público)
   - Category: SDR/BDR Specialist, AE/Closer, CSM Expert
8. Endpoint API `PATCH /api/v1/admin/candidates/:id`
9. Mudanças salvas com log de auditoria (admin user, timestamp)
10. Candidato recebe notificação por email se status mudar

## Tasks / Subtasks

- [ ] Task 1: Criar página de listagem de candidatos (AC: 1, 2, 3, 4)
  - [ ] Criar route `/admin/candidates`
  - [ ] Endpoint `GET /api/v1/admin/candidates` com filtros
  - [ ] Implementar tabela com colunas
  - [ ] Implementar filtros (posição, status, verificado)
  - [ ] Implementar busca por nome/email

- [ ] Task 2: Adicionar campos admin ao modelo (AC: 7, 9)
  - [ ] Adicionar campo `verified` (BooleanField)
  - [ ] Adicionar campo `category` (CharField)
  - [ ] Adicionar campo `admin_notes` (TextField)
  - [ ] Executar migrações

- [ ] Task 3: Implementar formulário de edição (AC: 5, 6, 7)
  - [ ] Modal/página de edição de candidato
  - [ ] Formulário pre-populado com dados atuais
  - [ ] Campos admin-only: status, verified, category, notes
  - [ ] Validação client-side

- [ ] Task 4: Implementar API de edição (AC: 8, 9)
  - [ ] Endpoint `PATCH /api/v1/admin/candidates/:id`
  - [ ] Permissão admin-only
  - [ ] Criar CandidateAudit model
  - [ ] Salvar audit log em cada mudança

- [ ] Task 5: Implementar notificações de mudança (AC: 10)
  - [ ] Email quando status muda
  - [ ] Email quando verified = true
  - [ ] Templates de email

## Dev Notes

### Database Changes

**CandidateProfile Model Update:**
```python
class CandidateProfile(models.Model):
    # ... existing fields ...

    # Admin-only fields
    status = models.CharField(
        max_length=20,
        choices=[
            ('available', 'Available'),
            ('inactive', 'Inactive'),
            ('under_contract', 'Under Contract'),
        ],
        default='available'
    )
    verified = models.BooleanField(default=False)
    category = models.CharField(
        max_length=50,
        choices=[
            ('sdr_bdr_specialist', 'SDR/BDR Specialist'),
            ('ae_closer', 'AE/Closer'),
            ('csm_expert', 'CSM Expert'),
        ],
        blank=True,
        null=True
    )
    admin_notes = models.TextField(blank=True)
```

**CandidateAudit Model (New):**
```python
class CandidateAudit(models.Model):
    candidate = models.ForeignKey(CandidateProfile, related_name='audit_logs')
    admin_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)  # 'status_change', 'verified', 'edited'
    field_changed = models.CharField(max_length=50)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
```

### API Endpoints

```
GET /api/v1/admin/candidates
- Lists all candidates with filters
- Auth: Required (admin role)
- Query params:
  - position: SDR/BDR, AE, CSM
  - status: available, inactive, under_contract
  - verified: true/false
  - search: name or email
  - page, page_size
- Response: { results: [...], count, next, previous }

PATCH /api/v1/admin/candidates/:id
- Updates candidate profile (admin-only)
- Auth: Required (admin role)
- Body: Any CandidateProfile fields
- Creates audit log entry
- Sends email notification if status changed
- Response: Updated candidate object

GET /api/v1/admin/candidates/:id/audit-log
- Returns audit history for candidate
- Auth: Required (admin role)
- Response: [{ action, admin_user, timestamp, changes }]
```

### Frontend Components

**Candidates List Page:**
```
┌─────────────────────────────────────────────────────────┐
│  Candidatos                                    [Importar]│
├─────────────────────────────────────────────────────────┤
│  Filtros:                                               │
│  Posição: [All ▾] Status: [All ▾] Verificado: [All ▾]  │
│  Busca: [_________________________] [🔍]                │
├─────────────────────────────────────────────────────────┤
│  Nome         Posição  Status      Score  Criado        │
│  João Silva   AE       Available   85     2025-01-15    │
│  Maria Santos SDR      Inactive    72     2025-01-14    │
│  ...                                                     │
├─────────────────────────────────────────────────────────┤
│  Mostrando 1-20 de 48          [◀] Página 1 [▶]        │
└─────────────────────────────────────────────────────────┘
```

**Edit Candidate Modal/Page:**
```
┌─────────────────────────────────────────────────────────┐
│  Editar Candidato - João Silva                     [×]  │
├─────────────────────────────────────────────────────────┤
│  [Tabs: Perfil | Status Admin | Histórico Auditoria]   │
│                                                         │
│  ── Perfil Tab ──                                       │
│  (Same fields as candidate profile creation)           │
│                                                         │
│  ── Status Admin Tab ──                                 │
│  Status:      ● Available                               │
│               ○ Inactive                                │
│               ○ Under Contract                          │
│                                                         │
│  Verificado:  ☑ Sim  ☐ Não                             │
│                                                         │
│  Categoria:   [SDR/BDR Specialist ▾]                    │
│                                                         │
│  Notas Admin:                                           │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ── Histórico Auditoria Tab ──                          │
│  • 2025-01-20 10:30 - Admin User alterou status        │
│    de "Available" para "Under Contract"                │
│  • 2025-01-15 14:00 - Admin User marcou como verificado│
│                                                         │
│  [Cancelar]  [Salvar Alterações]                       │
└─────────────────────────────────────────────────────────┘
```

### Audit Log Implementation

**Service Method:**
```python
from django.contrib.auth import get_user_model

User = get_user_model()

class CandidateService:
    @staticmethod
    def update_candidate_admin(candidate_id, data, admin_user):
        candidate = CandidateProfile.objects.get(id=candidate_id)

        # Track changes
        changes = []
        for field, new_value in data.items():
            old_value = getattr(candidate, field)
            if old_value != new_value:
                changes.append({
                    'field': field,
                    'old': old_value,
                    'new': new_value
                })

                # Create audit log
                CandidateAudit.objects.create(
                    candidate=candidate,
                    admin_user=admin_user,
                    action='field_updated',
                    field_changed=field,
                    old_value=str(old_value),
                    new_value=str(new_value)
                )

        # Update candidate
        for field, value in data.items():
            setattr(candidate, field, value)
        candidate.save()

        # Send notification if status changed
        if 'status' in data:
            send_candidate_status_change_email.delay(
                candidate.id,
                data['status']
            )

        return candidate, changes
```

### Email Notifications

**Status Change Email Templates:**

**Available → Inactive:**
```
Subject: Atualização do seu perfil TalentBase

Olá {candidate_name},

Seu perfil no TalentBase foi marcado como Inativo.

Se você deseja reativar seu perfil, acesse seu dashboard ou entre em contato conosco.

Atenciosamente,
Equipe TalentBase
```

**Available → Under Contract:**
```
Subject: Parabéns! Perfil marcado como Contratado

Olá {candidate_name},

Parabéns! Seu perfil foi marcado como "Under Contract".

Seu perfil ainda está visível no sistema, mas não será exibido em buscas ativas.

Atenciosamente,
Equipe TalentBase
```

**Verified Badge Granted:**
```
Subject: Seu perfil foi verificado! ✓

Olá {candidate_name},

Parabéns! Seu perfil foi verificado pela equipe TalentBase.

Perfis verificados recebem um badge especial e maior visibilidade para empresas.

Ver meu perfil: {profile_url}

Atenciosamente,
Equipe TalentBase
```

### Testing Considerations

**Unit Tests:**
- Audit log creation on field changes
- Status change triggers email
- Admin-only permission enforcement

**Integration Tests:**
- Edit candidate flow (admin edits → saves → audit log created)
- Filter and search functionality
- Bulk status updates (future: select multiple, change status)

**Edge Cases:**
- Candidate not found (404)
- Non-admin tries to edit (403)
- Invalid status value (validation error)
- Concurrent edits by multiple admins

### Permissions

**Admin Permissions:**
- Can view all candidates (regardless of status)
- Can edit all fields (including admin-only fields)
- Can view audit logs

**Candidate Permissions:**
- Cannot edit: status, verified, category, admin_notes
- Can only view own audit log (optional)

## Dependencies

- Story 3.1: CandidateProfile model complete
- Story 2.5.1: Admin dashboard layout
- Email notification system

## Definition of Done

- [ ] All 10 acceptance criteria validated
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Audit log tracking all changes
- [ ] Email notifications working
- [ ] Filters and search performant (<1s)
- [ ] Code reviewed and merged
- [ ] Deployed to staging
- [ ] QA sign-off

## Dev Agent Record

### Context Reference

- [Story Context XML](../stories-context/story-context-3.4.xml) - Generated 2025-10-09

### Agent Model Used

Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

### Completion Notes List

### File List
