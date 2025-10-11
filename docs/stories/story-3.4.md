# Story 3.4: Admin Candidate Curation & Editing

Status: 🎨 **UX Redesigned - Desktop First**

**📝 UPDATED 2025-10-10**: Story reescrita com melhorias de UX, Design System components, navegação otimizada e foco em Desktop First. Modal substituído por página dedicada para melhor experiência de edição.

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)

**⚠️ DEPENDÊNCIA:** Esta story **ESTENDE** a rota `/admin/candidates` criada na Story 3.3 (AC10). Não criar rota do zero!

## Story

Como um **admin**,
Eu quero **visualizar, filtrar, editar perfis de candidatos e gerenciar status**,
Para que **eu possa curar o banco de talentos, manter qualidade dos dados e controlar disponibilidade**.

## Acceptance Criteria

### **Listagem de Candidatos** (Extensão da Story 3.3)

1. **AC1:** Página `/admin/candidates` já existe (Story 3.3) - ESTENDER com filtros avançados
2. **AC2:** Tabela lista candidatos com colunas:
   - **Essenciais (sempre visíveis):** Avatar, Nome, Email, Posição, Cidade, Status, Data Cadastro, Ações
   - **Opcionais (preferências do usuário):** Salário, Modelo Trabalho, Aceita PJ, PCD, CNH, Idiomas
3. **AC3:** Filtros avançados na sidebar esquerda (desktop) ou card colapsável (mobile):
   - **Busca:** Nome ou email (text input)
   - **Posição:** Multi-select (SDR/BDR, AE, CSM, outros)
   - **Status:** Multi-select (Disponível, Inativo, Contratado)
   - **Verificado:** Toggle (Todos, Sim, Não)
   - **Cidade:** Autocomplete com lista de cidades cadastradas
   - **Modelo Trabalho:** Multi-select (Remoto, Híbrido, Presencial)
   - **Salário Mínimo:** Dual input (De: R$ ___ Até: R$ ___)
   - **Aceita PJ:** Toggle (Todos, Sim, Não)
   - **PCD:** Toggle (Todos, Sim, Não)
   - **CNH:** Toggle (Todos, Sim, Não)
   - **Disponibilidade Viagem:** Select (Qualquer, Baixa, Média, Alta, Disponível)
4. **AC4:** Bulk actions - Selecionar múltiplos candidatos e:
   - Alterar status em massa
   - Marcar como verificados
   - Exportar seleção para Excel/CSV
   - Enviar email personalizado (futuro)
5. **AC5:** Botão "Colunas" permite mostrar/ocultar colunas opcionais (preferência salva no localStorage)
6. **AC6:** Paginação: 20 candidatos por página (desktop) / 10 por página (mobile)
7. **AC7:** Sorting por qualquer coluna (ascendente/descendente)

### **Edição de Candidatos**

8. **AC8:** Clicar em linha do candidato → redireciona para `/admin/candidates/:id/edit` (página dedicada, não modal)
9. **AC9:** Página de edição com breadcrumbs:
   ```
   Dashboard > Candidatos > Editar: [Nome do Candidato]
   ```
10. **AC10:** Quick actions no topo da página:
    - Botão "Voltar para Lista"
    - Botão "Ver Perfil Público" (abre em nova aba)
    - Botão "Salvar Alterações" (fixo no topo ao scrollar)
    - Badge "Última edição: [data] por [admin]"
11. **AC11:** Tabs organizados (5 tabs):
    - **Tab 1: 📋 Perfil Básico** (nome, telefone, email, LinkedIn, CPF, foto, formação acadêmica, idiomas)
    - **Tab 2: 💼 Experiência Comercial** (posição atual, anos experiência, tipo vendas, ciclo, ticket médio, softwares, soluções vendidas, departamentos)
    - **Tab 3: 🎯 Experiência Detalhada** (prospecção ativa, qualificação inbound, retenção, expansão, carteira, inbound sales, outbound sales, field sales, inside sales)
    - **Tab 4: 🚗 Mobilidade & Preferências** (modelo trabalho, disponibilidade viagem, mudança, CNH, veículo, trabalho remoto)
    - **Tab 5: ⚙️ Admin & Auditoria** (status, verificado, categoria, salário mínimo, aceita PJ, observações remuneração, notas admin, audit log)
12. **AC12:** Todos os campos editáveis (36 campos do Notion + campos admin)
13. **AC13:** Campos admin-only (Tab 5):
    - **Status:** Radio buttons (Available, Inactive, Under Contract)
    - **Verificado:** Toggle com badge "✓ Perfil Verificado"
    - **Categoria:** Select (SDR/BDR Specialist, AE/Closer, CSM Expert, Multi-role)
    - **Notas Admin:** Textarea (visível apenas para admins, não enviado ao candidato)
14. **AC14:** Validação client-side:
    - Campos obrigatórios marcados com *
    - Email válido
    - CPF válido (formato brasileiro)
    - Telefone válido
    - LinkedIn URL válido
    - Salário numérico positivo
15. **AC15:** Auto-save draft a cada 30 segundos (opcional - armazenado localmente)

### **Backend & Auditoria**

16. **AC16:** Endpoint API `PATCH /api/v1/admin/candidates/:id` (admin-only)
17. **AC17:** Toda mudança cria registro em `CandidateAudit` com:
    - Admin user que fez a mudança
    - Timestamp
    - Campo alterado
    - Valor anterior e novo valor
    - Reason (opcional - futuro)
18. **AC18:** Audit log visível na Tab 5 (Admin & Auditoria):
    - Timeline component mostrando últimas 20 mudanças
    - Filtros: Tipo de ação, Admin user, Período
    - "Carregar mais" para histórico completo
    - Exportar audit log para CSV
19. **AC19:** Notificações por email:
    - Status mudou para "Inactive" → Email avisando candidato
    - Status mudou para "Under Contract" → Email de parabéns
    - Marcado como "Verified" → Email com badge de verificação
20. **AC20:** Permissões:
    - Admin: Edita todos os campos
    - Candidato: Não pode editar status, verified, category, admin_notes

## Tasks / Subtasks

### **Task 1: Design System - Novos Componentes** (AC: 5, 11, 13, 18)

- [ ] **Breadcrumbs Component**
  - [ ] Criar `packages/design-system/src/components/Breadcrumbs.tsx`
  - [ ] Props: items, separator (default: '>')
  - [ ] Suporte a links e item ativo
  - [ ] Responsive: collapsar itens intermediários em mobile
  - [ ] Story no Storybook

- [ ] **DataTable Component** (se não existir robusto)
  - [ ] Criar `packages/design-system/src/components/DataTable.tsx`
  - [ ] Features: sorting, column toggle, bulk selection, sticky header
  - [ ] Props: columns, data, onSort, onSelect, actions
  - [ ] Skeleton loading state
  - [ ] Empty state
  - [ ] Story no Storybook

- [ ] **RangeInput Component** (Dual Input para faixas)
  - [ ] Criar `packages/design-system/src/components/RangeInput.tsx`
  - [ ] Props: min, max, value, onChange, prefix (ex: 'R$')
  - [ ] Validação: min <= max
  - [ ] Story no Storybook

- [ ] **BulkActionsBar Component**
  - [ ] Criar `packages/design-system/src/components/BulkActionsBar.tsx`
  - [ ] Aparece quando items selecionados > 0
  - [ ] Props: selectedCount, actions, onCancel
  - [ ] Animação slide-up
  - [ ] Story no Storybook

- [ ] **FilterSidebar Component**
  - [ ] Criar `packages/design-system/src/components/FilterSidebar.tsx`
  - [ ] Layout: sidebar fixa em desktop, card colapsável em mobile
  - [ ] Props: filters, onApply, onReset
  - [ ] Badge mostrando número de filtros ativos
  - [ ] Story no Storybook

- [ ] **StatusBadge Component**
  - [ ] Estender `Badge` com variantes específicas:
    - `available` (verde)
    - `inactive` (cinza)
    - `under_contract` (azul)
    - `verified` (dourado com ✓)
  - [ ] Story no Storybook

- [ ] **Toggle Component** (se não existir)
  - [ ] Criar `packages/design-system/src/components/Toggle.tsx`
  - [ ] Switch visual (on/off)
  - [ ] Props: checked, onChange, label, disabled
  - [ ] Story no Storybook

- [ ] **QuickActions Component**
  - [ ] Criar `packages/design-system/src/components/QuickActions.tsx`
  - [ ] Barra de ações fixada no topo ao scrollar (sticky)
  - [ ] Props: actions (array de buttons)
  - [ ] Story no Storybook

- [ ] Adicionar exports ao `packages/design-system/src/index.ts`

### **Task 2: Estender Listagem de Candidatos** (AC: 1, 2, 3, 4, 5, 6, 7)

- [ ] **Atualizar `packages/web/app/routes/admin.candidates.tsx`**
  - [ ] IMPORTANTE: Não recriar! Estender rota existente (Story 3.3)
  - [ ] Substituir tabela básica por `DataTable` component
  - [ ] Adicionar `FilterSidebar` com 11 filtros
  - [ ] Implementar column toggle (salvar em localStorage)
  - [ ] Adicionar bulk selection (checkbox em cada row)
  - [ ] Implementar `BulkActionsBar` (alterar status, marcar verificados, exportar)
  - [ ] Adicionar sorting por coluna (passar para API)
  - [ ] Paginação: 20 itens desktop / 10 itens mobile
  - [ ] Responsive: tabela em desktop, cards em mobile

- [ ] **Atualizar backend `/api/v1/admin/candidates`**
  - [ ] Adicionar query params para 11 filtros
  - [ ] Implementar filtering no Django QuerySet
  - [ ] Adicionar sorting (order_by)
  - [ ] Otimizar queries (select_related, prefetch_related)
  - [ ] Pagination (PageNumberPagination)

- [ ] **Criar API para bulk actions**
  - [ ] Endpoint `POST /api/v1/admin/candidates/bulk-update`
  - [ ] Body: { candidate_ids: [...], action: 'status_change', data: {...} }
  - [ ] Criar audit log para cada candidato atualizado
  - [ ] Retornar summary: { success: 5, errors: 0 }

### **Task 3: Criar Página de Edição Dedicada** (AC: 8, 9, 10, 11, 12, 13, 14, 15)

- [ ] **Criar route `packages/web/app/routes/admin.candidates.$id.edit.tsx`**
  - [ ] Loader: Fetch candidate data via API
  - [ ] Implementar `<Breadcrumbs>` no topo
  - [ ] Implementar `<QuickActions>` (Voltar, Ver Público, Salvar)
  - [ ] Implementar 5 tabs com `<Tabs>` component
  - [ ] Tab 1: Perfil Básico (form fields)
  - [ ] Tab 2: Experiência Comercial (form fields)
  - [ ] Tab 3: Experiência Detalhada (form fields)
  - [ ] Tab 4: Mobilidade & Preferências (form fields)
  - [ ] Tab 5: Admin & Auditoria (admin fields + audit log timeline)
  - [ ] Validação client-side (email, CPF, telefone, LinkedIn, salário)
  - [ ] Auto-save draft a cada 30s (localStorage)
  - [ ] Loading states (skeleton)
  - [ ] Error handling (toast notifications)

- [ ] **Criar componentes de formulário reutilizáveis**
  - [ ] `CandidateProfileForm` (Tab 1)
  - [ ] `CandidateExperienceForm` (Tab 2)
  - [ ] `CandidateDetailedExperienceForm` (Tab 3)
  - [ ] `CandidateMobilityForm` (Tab 4)
  - [ ] `CandidateAdminForm` (Tab 5 - campos admin only)

### **Task 4: Adicionar Campos Admin ao Modelo** (AC: 13, 16, 17)

- [ ] **Atualizar `apps/api/candidates/models.py`**
  - [ ] Adicionar campo `status` (CharField com choices)
  - [ ] Adicionar campo `verified` (BooleanField)
  - [ ] Adicionar campo `category` (CharField com choices)
  - [ ] Adicionar campo `admin_notes` (TextField)
  - [ ] Executar `makemigrations` e `migrate`

- [ ] **Criar modelo `CandidateAudit`**
  - [ ] Arquivo: `apps/api/candidates/models.py`
  - [ ] Campos: candidate, admin_user, action, field_changed, old_value, new_value, reason, timestamp
  - [ ] Meta: ordering = ['-timestamp']
  - [ ] Executar migrations

- [ ] **Criar endpoint `PATCH /api/v1/admin/candidates/:id`**
  - [ ] Arquivo: `apps/api/candidates/views.py`
  - [ ] Permissão: admin-only
  - [ ] Service layer: `CandidateService.update_candidate_admin()`
  - [ ] Criar audit log para cada campo alterado
  - [ ] Trigger notificação email se status mudou
  - [ ] Retornar candidate atualizado + audit summary

### **Task 5: Implementar Audit Log Tab** (AC: 18)

- [ ] **Criar endpoint `GET /api/v1/admin/candidates/:id/audit-log`**
  - [ ] Query params: action_type, admin_user, date_from, date_to, page
  - [ ] Retornar audit logs paginados (20 por página)
  - [ ] Incluir nome do admin user (join com User)

- [ ] **Implementar AuditLogTimeline component**
  - [ ] Usar `<Timeline>` do design system
  - [ ] Mostrar: timestamp, admin user, campo alterado, valores (old → new)
  - [ ] Filtros: action type, admin user, período
  - [ ] "Carregar mais" para paginação
  - [ ] Botão "Exportar para CSV"

### **Task 6: Implementar Notificações por Email** (AC: 19)

- [ ] **Criar Celery tasks**
  - [ ] `send_candidate_status_change_email.delay(candidate_id, new_status)`
  - [ ] `send_candidate_verified_email.delay(candidate_id)`

- [ ] **Criar templates de email**
  - [ ] `templates/email/candidate_status_inactive.html`
  - [ ] `templates/email/candidate_status_under_contract.html`
  - [ ] `templates/email/candidate_verified.html`
  - [ ] Usar design consistente com branding TalentBase

- [ ] **Testar envio de emails**
  - [ ] Unit test: task chamada quando status muda
  - [ ] Integration test: email enviado via MailHog/Mailtrap
  - [ ] Verificar rate limiting (max 10 emails por minuto)

### **Task 7: Testes e Qualidade** (AC: todos)

- [ ] **Unit Tests**
  - [ ] Test audit log creation
  - [ ] Test status change triggers email
  - [ ] Test admin-only permission
  - [ ] Test bulk update API
  - [ ] Test filters queryset

- [ ] **Integration Tests**
  - [ ] Test edit candidate flow completo
  - [ ] Test bulk actions flow
  - [ ] Test audit log filtering
  - [ ] Test email notifications

- [ ] **E2E Tests (Playwright)**
  - [ ] Test filtrar candidatos
  - [ ] Test editar candidato
  - [ ] Test bulk update status
  - [ ] Test column toggle

### **Task 8: Garantir Responsividade (Desktop First)** (AC: todos)

- [ ] **Desktop (>= 1024px) - Prioridade**
  - [ ] FilterSidebar fixa à esquerda
  - [ ] DataTable com todas colunas visíveis
  - [ ] Tabs horizontais visíveis
  - [ ] Formulários em 2 colunas
  - [ ] QuickActions sempre visível (sticky)

- [ ] **Tablet (768px - 1023px)**
  - [ ] FilterSidebar colapsável (botão "Filtros")
  - [ ] DataTable com scroll horizontal
  - [ ] Tabs horizontais com scroll se necessário
  - [ ] Formulários em 2 colunas

- [ ] **Mobile (< 768px)**
  - [ ] FilterSidebar em modal fullscreen
  - [ ] Cards ao invés de tabela
  - [ ] Tabs scrolláveis horizontalmente
  - [ ] Formulários em 1 coluna
  - [ ] QuickActions simplificadas (apenas Salvar)

- [ ] **Testar em navegadores**
  - [ ] Chrome (Desktop, Tablet, Mobile)
  - [ ] Firefox (Desktop)
  - [ ] Safari (Desktop, iPad)
  - [ ] Edge (Desktop)

### **Task 9: Acessibilidade** (AC: todos)

- [ ] **Keyboard Navigation**
  - [ ] Tab navega por filtros, tabela, bulk actions
  - [ ] Enter/Space para selecionar checkboxes
  - [ ] Escape fecha modais e dropdowns
  - [ ] Arrow keys navegam em tabela

- [ ] **Screen Reader**
  - [ ] ARIA labels em filtros ("Filtro por posição")
  - [ ] ARIA live regions para bulk actions ("3 candidatos selecionados")
  - [ ] ARIA describedby em campos de formulário
  - [ ] Role="table" em DataTable

- [ ] **Visual**
  - [ ] Contraste WCAG AA em todos badges
  - [ ] Focus indicators visíveis (ring-2 ring-primary-500)
  - [ ] Campos obrigatórios com asterisco vermelho
  - [ ] Mensagens de erro em vermelho com ícone

- [ ] **Testar com ferramentas**
  - [ ] axe DevTools (0 violations)
  - [ ] Lighthouse Accessibility (score >= 90)
  - [ ] NVDA/VoiceOver (testar fluxo completo)

## Dev Notes

### Database Schema

**CandidateProfile Model (Updated):**
```python
class CandidateProfile(models.Model):
    # ... existing 36 fields from Notion CSV ...

    # Admin-only fields (NEW)
    status = models.CharField(
        max_length=20,
        choices=[
            ('available', 'Disponível'),
            ('inactive', 'Inativo'),
            ('under_contract', 'Contratado'),
        ],
        default='available',
        db_index=True  # For filtering performance
    )
    verified = models.BooleanField(default=False, db_index=True)
    category = models.CharField(
        max_length=50,
        choices=[
            ('sdr_bdr_specialist', 'SDR/BDR Specialist'),
            ('ae_closer', 'AE/Closer'),
            ('csm_expert', 'CSM Expert'),
            ('multi_role', 'Multi-role'),
        ],
        blank=True,
        null=True
    )
    admin_notes = models.TextField(blank=True)
    last_edited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='edited_candidates'
    )
    last_edited_at = models.DateTimeField(auto_now=True)
```

**CandidateAudit Model (New):**
```python
class CandidateAudit(models.Model):
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='audit_logs'
    )
    admin_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='candidate_audits'
    )
    action = models.CharField(
        max_length=50,
        choices=[
            ('created', 'Perfil Criado'),
            ('edited', 'Perfil Editado'),
            ('status_changed', 'Status Alterado'),
            ('verified', 'Marcado como Verificado'),
            ('bulk_updated', 'Atualização em Massa'),
        ]
    )
    field_changed = models.CharField(max_length=50, blank=True)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    reason = models.TextField(blank=True)  # Future: require reason for status changes
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['candidate', '-timestamp']),
            models.Index(fields=['admin_user', '-timestamp']),
        ]
```

### API Endpoints

```python
# List candidates with advanced filters
GET /api/v1/admin/candidates
Query Params:
  - search: str (name or email)
  - position: list[str]
  - status: list[str]
  - verified: bool
  - city: str
  - work_model: list[str]
  - salary_min: int
  - salary_max: int
  - accepts_pj: bool
  - is_pcd: bool
  - has_drivers_license: bool
  - travel_availability: str
  - ordering: str (default: '-created_at')
  - page: int
  - page_size: int (default: 20)
Response: { results: [...], count, next, previous }

# Update candidate (admin-only)
PATCH /api/v1/admin/candidates/:id
Body: Any CandidateProfile fields (partial update)
Response: { candidate: {...}, audit_summary: { fields_changed: 3, audit_logs_created: 3 } }

# Bulk update candidates
POST /api/v1/admin/candidates/bulk-update
Body: {
  candidate_ids: ['uuid1', 'uuid2', ...],
  action: 'status_change' | 'mark_verified' | 'set_category',
  data: { status: 'inactive' } | { verified: true } | { category: 'ae_closer' }
}
Response: { success: 5, errors: 0, audit_logs_created: 5 }

# Get audit log
GET /api/v1/admin/candidates/:id/audit-log
Query Params:
  - action: str
  - admin_user_id: str
  - date_from: date
  - date_to: date
  - page: int
Response: { results: [...], count, next, previous }

# Export audit log to CSV
GET /api/v1/admin/candidates/:id/audit-log/export
Response: CSV file download
```

### Frontend Architecture

**Route Structure:**
```
/admin/candidates
  └─ List view (DataTable + FilterSidebar + BulkActions)

/admin/candidates/:id/edit
  └─ Edit view (Breadcrumbs + QuickActions + 5 Tabs)
      ├─ Tab 1: Perfil Básico
      ├─ Tab 2: Experiência Comercial
      ├─ Tab 3: Experiência Detalhada
      ├─ Tab 4: Mobilidade & Preferências
      └─ Tab 5: Admin & Auditoria (+ AuditLogTimeline)
```

**Component Hierarchy:**
```tsx
<AdminLayout>
  <Breadcrumbs items={[...]} />
  <QuickActions actions={[...]} />

  <Tabs defaultValue="profile">
    <TabsList>
      <TabsTrigger value="profile">📋 Perfil Básico</TabsTrigger>
      <TabsTrigger value="experience">💼 Experiência</TabsTrigger>
      <TabsTrigger value="detailed">🎯 Detalhado</TabsTrigger>
      <TabsTrigger value="mobility">🚗 Mobilidade</TabsTrigger>
      <TabsTrigger value="admin">⚙️ Admin</TabsTrigger>
    </TabsList>

    <TabsContent value="profile">
      <CandidateProfileForm data={candidate} onChange={handleChange} />
    </TabsContent>

    {/* ... outros tabs ... */}

    <TabsContent value="admin">
      <CandidateAdminForm data={candidate} onChange={handleChange} />
      <AuditLogTimeline candidateId={candidate.id} />
    </TabsContent>
  </Tabs>
</AdminLayout>
```

### Service Layer Pattern

```python
# apps/api/candidates/services/candidate_admin_service.py

class CandidateAdminService:
    @staticmethod
    def update_candidate(candidate_id: str, data: dict, admin_user: User):
        """
        Update candidate and create audit logs
        """
        candidate = CandidateProfile.objects.get(id=candidate_id)

        changes = []
        audit_logs = []

        # Track changes
        for field, new_value in data.items():
            old_value = getattr(candidate, field)
            if old_value != new_value:
                changes.append({
                    'field': field,
                    'old': old_value,
                    'new': new_value
                })

                # Create audit log
                audit_log = CandidateAudit.objects.create(
                    candidate=candidate,
                    admin_user=admin_user,
                    action='edited',
                    field_changed=field,
                    old_value=str(old_value),
                    new_value=str(new_value)
                )
                audit_logs.append(audit_log)

        # Update candidate
        for field, value in data.items():
            setattr(candidate, field, value)
        candidate.last_edited_by = admin_user
        candidate.save()

        # Send notifications if needed
        if 'status' in data:
            send_candidate_status_change_email.delay(
                candidate.id,
                data['status']
            )

        if 'verified' in data and data['verified']:
            send_candidate_verified_email.delay(candidate.id)

        return {
            'candidate': candidate,
            'audit_summary': {
                'fields_changed': len(changes),
                'audit_logs_created': len(audit_logs)
            }
        }

    @staticmethod
    def bulk_update_candidates(candidate_ids: list, action: str, data: dict, admin_user: User):
        """
        Bulk update multiple candidates
        """
        success = 0
        errors = 0

        for candidate_id in candidate_ids:
            try:
                CandidateAdminService.update_candidate(candidate_id, data, admin_user)
                success += 1
            except Exception as e:
                errors += 1
                logger.error(f"Bulk update failed for {candidate_id}: {e}")

        return {
            'success': success,
            'errors': errors,
            'audit_logs_created': success * len(data)
        }
```

### Email Templates

**Status Changed to Inactive:**
```html
<!-- templates/email/candidate_status_inactive.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Atualização do seu perfil TalentBase</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
    <h2 style="color: #333;">Olá {{ candidate.full_name }},</h2>

    <p>Seu perfil no TalentBase foi marcado como <strong>Inativo</strong>.</p>

    <p>Isso significa que seu perfil não será exibido em buscas ativas de recrutadores.</p>

    <p>Se você deseja <strong>reativar</strong> seu perfil, acesse seu dashboard:</p>

    <a href="{{ app_url }}/candidate/dashboard"
       style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
      Acessar Dashboard
    </a>

    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      Se você tiver dúvidas, entre em contato conosco respondendo este email.
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

    <p style="color: #999; font-size: 12px;">
      © {{ current_year }} TalentBase. Todos os direitos reservados.
    </p>
  </div>
</body>
</html>
```

**Verified Badge Granted:**
```html
<!-- templates/email/candidate_verified.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Seu perfil foi verificado! ✓</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 8px; color: white; text-align: center;">
    <h1 style="margin: 0; font-size: 32px;">🎉 Parabéns!</h1>
    <h2 style="margin: 10px 0;">Seu perfil foi verificado</h2>
  </div>

  <div style="padding: 20px;">
    <p>Olá {{ candidate.full_name }},</p>

    <p>Temos uma ótima notícia! Seu perfil foi <strong>verificado</strong> pela equipe TalentBase.</p>

    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
      <strong>O que isso significa?</strong>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>✓ Badge de verificação no seu perfil público</li>
        <li>✓ Maior visibilidade para recrutadores</li>
        <li>✓ Prioridade em matchings de vagas</li>
        <li>✓ Destaque em buscas</li>
      </ul>
    </div>

    <p>Veja como ficou seu perfil verificado:</p>

    <a href="{{ profile_url }}"
       style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
      Ver Meu Perfil Público
    </a>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      Continue mantendo seu perfil atualizado para maximizar suas oportunidades!
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

    <p style="color: #999; font-size: 12px;">
      © {{ current_year }} TalentBase. Todos os direitos reservados.
    </p>
  </div>
</body>
</html>
```

### Wireframes

**Desktop - Listagem de Candidatos:**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Admin > Candidatos                                      [Importar CSV]     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ┌─────────────────┐  ┌────────────────────────────────────────────────┐  │
│ │  Filtros        │  │  Candidatos (48)                   [Colunas ▾]│  │
│ │                 │  │                                                │  │
│ │ Busca:          │  │  ┌────────────────────────────────────────┐  │  │
│ │ [__________] 🔍 │  │  │ ☐ Candidato      Posição  Status   ...│  │  │
│ │                 │  │  ├────────────────────────────────────────┤  │  │
│ │ Posição:        │  │  │ ☐ 👤 João Silva  AE       ✅ Dispon  │  │  │
│ │ ☑ SDR/BDR       │  │  │    joao@...      5 anos   São Paulo  │  │  │
│ │ ☐ AE            │  │  ├────────────────────────────────────────┤  │  │
│ │ ☐ CSM           │  │  │ ☐ 👤 Maria...    SDR      ✅ Dispon  │  │  │
│ │                 │  │  └────────────────────────────────────────┘  │  │
│ │ Status:         │  │                                                │  │
│ │ ● Todos         │  │  [3 selecionados] Alterar Status ▾  Exportar│  │
│ │                 │  │                                                │  │
│ │ Verificado:     │  │  Mostrando 1-20 de 48    [◀] Pág 1 [▶]       │  │
│ │ ○ Todos         │  └────────────────────────────────────────────────┘  │
│ │ ○ Sim           │                                                        │
│ │ ○ Não           │                                                        │
│ │                 │                                                        │
│ │ Salário:        │                                                        │
│ │ De: [____]      │                                                        │
│ │ Até: [____]     │                                                        │
│ │                 │                                                        │
│ │ [Aplicar]       │                                                        │
│ │ [Limpar]        │                                                        │
│ └─────────────────┘                                                        │
└────────────────────────────────────────────────────────────────────────────┘
```

**Desktop - Edição de Candidato:**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Dashboard > Candidatos > Editar: João Silva                                │
├────────────────────────────────────────────────────────────────────────────┤
│ [← Voltar]  [Ver Perfil Público ↗]  Última edição: 2025-10-10  [Salvar]  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ [📋 Perfil] [💼 Experiência] [🎯 Detalhado] [🚗 Mobilidade] [⚙️ Admin]  │
│ ────────────────────────────────────────────────────────────────────────  │
│                                                                            │
│ Nome Completo *                  │  Telefone *                            │
│ [João Silva___________________]  │  [(11) 99999-9999_____________]        │
│                                  │                                         │
│ Email *                          │  LinkedIn                               │
│ [joao@email.com_______________]  │  [linkedin.com/in/joaosilva___]        │
│                                  │                                         │
│ CPF                              │  Cidade                                 │
│ [123.456.789-00_______________]  │  [São Paulo___________________]        │
│                                  │                                         │
│ Foto de Perfil                                                             │
│ ┌─────────────┐                                                            │
│ │   👤 150x150│ [Upload Nova Foto]                                        │
│ └─────────────┘                                                            │
│                                                                            │
│ Formação Acadêmica               │  Idiomas                                │
│ [Ensino Superior Completo____ ▾] │  [Português (Nativo)___________]       │
│                                  │  [+ Adicionar Idioma]                   │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                           [Cancelar]  [Salvar Alterações]  │
└────────────────────────────────────────────────────────────────────────────┘
```

**Desktop - Tab Admin & Auditoria:**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ [📋 Perfil] [💼 Experiência] [🎯 Detalhado] [🚗 Mobilidade] [⚙️ Admin]  │
│ ────────────────────────────────────────────────────────────────────────  │
│                                                                            │
│ ━━━ Campos Admin Only ━━━                                                 │
│                                                                            │
│ Status *                                                                   │
│ ● Disponível    ○ Inativo    ○ Contratado                                │
│                                                                            │
│ Verificado                   │  Categoria                                 │
│ [✓ Sim]                      │  [SDR/BDR Specialist__________ ▾]         │
│                                                                            │
│ Notas Admin (visível apenas para admins)                                  │
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │ Candidato muito qualificado, ótima comunicação.                    │   │
│ │ Recomendo priorizar em matchings de vagas premium.                 │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│ ━━━ Histórico de Auditoria ━━━                                            │
│                                                                            │
│ [Tipo: Todos ▾] [Admin: Todos ▾] [Período: 30 dias ▾] [Exportar CSV]    │
│                                                                            │
│ ⏱ Timeline:                                                               │
│                                                                            │
│ • 2025-10-10 15:30 - Admin User editou campo "status"                    │
│   De: "Disponível" → Para: "Contratado"                                   │
│                                                                            │
│ • 2025-10-05 10:15 - Admin User marcou como verificado                   │
│   De: "false" → Para: "true"                                              │
│                                                                            │
│ • 2025-10-01 09:00 - Admin User editou campo "salário mínimo"            │
│   De: "R$ 7.000" → Para: "R$ 8.500"                                       │
│                                                                            │
│ • 2025-09-28 14:45 - Sistema importou perfil via CSV                     │
│   Importado do arquivo: "candidatos_setembro.csv"                         │
│                                                                            │
│                                             [Carregar mais (20 de 48)]    │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## Dependencies

- ✅ **Story 3.1:** CandidateProfile model com 36 campos (COMPLETO)
- ✅ **Story 3.3:** Rota `/admin/candidates` com listagem básica (COMPLETO)
- ✅ **Story 2.5.1:** AdminLayout (COMPLETO)
- ⚠️ **Email system:** Celery + Redis configurados
- ⚠️ **Design System:** Tabs component (verificar se existe)

## Definition of Done

- [ ] Todos 20 acceptance criteria validados
- [ ] 8 novos componentes Design System criados e documentados (Storybook)
- [ ] Rota `/admin/candidates` estendida (não recriada)
- [ ] Rota `/admin/candidates/:id/edit` implementada
- [ ] Campos admin adicionados ao modelo (migrations executadas)
- [ ] Modelo CandidateAudit criado (migrations executadas)
- [ ] API endpoints implementados (list, update, bulk-update, audit-log)
- [ ] Service layer criado (CandidateAdminService)
- [ ] Audit log funcionando (toda mudança cria registro)
- [ ] Email notifications funcionando (status change, verified)
- [ ] Bulk actions implementadas (status, verified, export)
- [ ] Filtros avançados funcionando (11 filtros)
- [ ] Column toggle funcionando (preferências salvas)
- [ ] Auto-save draft implementado
- [ ] Validação client-side funcionando
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing (Playwright)
- [ ] Responsividade Desktop First validada (1024px+, 768px, <768px)
- [ ] Acessibilidade WCAG AA (axe DevTools 0 violations)
- [ ] Code reviewed e merged
- [ ] Deployed to staging
- [ ] QA sign-off

## Success Metrics

**Funcionalidade:**
- Admin pode filtrar 48 candidatos por 11 critérios e encontrar match em <2s
- Admin pode editar perfil completo (36 campos) e salvar em <3s
- Admin pode alterar status de 10 candidatos em batch em <5s
- Audit log carrega últimas 20 mudanças em <1s

**UX:**
- Desktop (1024px+): Todas features visíveis sem scroll horizontal
- Tablet (768px): FilterSidebar colapsável, DataTable com scroll horizontal funcional
- Mobile (<768px): Cards legíveis, filtros em modal fullscreen

**Performance:**
- Listagem com 1000 candidatos renderiza em <2s (lazy loading)
- Filtros aplicados retornam resultados em <1s
- Edit page carrega em <1.5s
- Audit log paginado carrega em <800ms

**Qualidade:**
- 0 critical bugs no staging após 1 semana
- 0 violations de acessibilidade (axe DevTools)
- 100% acceptance criteria atendidos
- >80% coverage em unit tests

---

**🎨 Story Redesigned by Sally (UX Expert) - Desktop First Architecture**
