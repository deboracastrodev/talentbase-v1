# Story 2.4: Admin User Management Dashboard

Status: Approved

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)


## Story

Como um **admin**,
Eu quero **visualizar e gerenciar todos os usuários (candidatos e empresas)**,
Para que **eu possa aprovar empresas, desativar usuários e manter a qualidade da plataforma**.

## Acceptance Criteria

1. Dashboard admin em `/admin/users`
2. Visualização em tabela de todos os usuários com colunas: nome, email, role, status, created_at
3. Filtrar por role (all, admin, candidate, company)
4. Filtrar por status (all, active, pending, inactive)
5. Buscar por nome ou email
6. Clicar na linha do usuário → abre modal de detalhes do usuário
7. Admin pode alterar status do usuário (ativar, desativar, aprovar empresa)
8. Mudança de status dispara notificação por email ao usuário
9. Paginação (20 usuários por página)
10. Admin pode criar usuários manualmente (candidate, company, admin)

## Tasks / Subtasks

- [x] Task 1: Criar API de listagem de usuários (AC: 2, 3, 4, 5, 9)
  - [x] Implementar endpoint `GET /api/v1/admin/users`
  - [x] Adicionar filtros por role e status
  - [x] Implementar busca por nome/email
  - [x] Configurar paginação Django REST
- [x] Task 2: Implementar permissões admin (AC: 1, 6, 7)
  - [x] Criar IsAdmin permission class
  - [x] Proteger todos os endpoints admin
  - [x] Implementar verificação de role no frontend
- [x] Task 3: Criar interface de gerenciamento (AC: 1, 2, 6)
  - [x] Criar route `/admin/users`
  - [x] Implementar tabela com design system
  - [x] Criar modal de detalhes do usuário
- [x] Task 4: Implementar alteração de status (AC: 7, 8)
  - [x] Criar endpoints PATCH para status
  - [x] Implementar notificações email
  - [x] Validar transições de status
- [ ] Task 5: Implementar criação manual (AC: 10)
  - [ ] Criar formulário de criação de usuário
  - [ ] Implementar criação por role
  - [ ] Validação e feedback de sucesso

## Dev Notes

### Architecture Context

**Admin Dashboard Features:**
- Table view com filtering e search
- Modal-based user details
- Bulk operations (future enhancement)
- Real-time status updates

**Permission Strategy:**
- IsAdmin permission class
- Role-based UI rendering
- API-level protection

### Database Queries

**Optimized User Listing:**
```python
# Efficient query with select_related
users = User.objects.select_related(
    'candidateprofile',
    'companyprofile'
).filter(
    role__in=role_filter,
    is_active__in=status_filter
).order_by('-created_at')
```

### API Endpoints

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/v1/admin/users` | IsAdmin | List users with filters |
| GET | `/api/v1/admin/users/:id` | IsAdmin | Get user details |
| PATCH | `/api/v1/admin/users/:id` | IsAdmin | Update user status |
| POST | `/api/v1/admin/users` | IsAdmin | Create user manually |

### Frontend Components

**UserManagementTable:**
- Filterable columns
- Search functionality
- Sortable headers
- Status badges with colors
- Bulk selection for future operations

**UserDetailModal:**
- Read-only user information
- Status change dropdown
- Action history (future)
- Audit trail display

### Email Notifications

**Status Change Notifications:**
- User activation: "Sua conta foi ativada"
- User deactivation: "Sua conta foi suspensa"
- Company approval: "Empresa aprovada"
- Company rejection: "Empresa rejeitada"

### Security Requirements

- Admin-only access to all endpoints
- Audit logging for status changes
- Input validation for manual user creation
- Rate limiting on admin actions

### Project Structure Notes

- Dashboard route: `packages/web/app/routes/admin.users.tsx`
- API views: `apps/api/admin/views.py`
- Permission classes: `apps/api/core/permissions.py`
- Components: `packages/web/app/components/admin/`

### Error Handling

- Unauthorized access: Redirect to login
- Invalid status transitions: Clear error messages
- Email send failures: Log for admin review
- Validation errors: Field-specific feedback

### References

- [Source: docs/epics/epics.md#Story-2.4]
- [Source: docs/epics/tech-spec-epic-2.md#Story-2.4]
- [Source: docs/epics/tech-spec-epic-2.md#Role-Based-Access-Control]

## Change Log

| Date     | Version | Description   | Author        |
| -------- | ------- | ------------- | ------------- |
| 2025-10-02 | 0.1     | Initial draft | Debora |
| 2025-10-07 | 0.2     | Task 1 & 2 completed - Backend API + permissions | Claude Dev Agent (Amelia) |
| 2025-10-08 | 0.3     | Task 3 completed - Frontend interface with filters and modal | Claude Dev Agent (Amelia) |
| 2025-10-08 | 0.4     | Task 4 completed - Status change with email notifications | Claude Dev Agent (Amelia) |

## Dev Agent Record

### Context Reference

- [story-context-2.4.xml](../stories-context/story-context-2.4.xml) - Gerado em 2025-10-07

### Agent Model Used

Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

- 2025-10-07: Task 1 - Implementação da API de listagem de usuários com Clean Architecture
  - Created user_management module (renamed from admin to avoid Django conflict)
  - Implemented service layer with optimized queries (select_related)
  - Added comprehensive test coverage (40 tests, 100% pass rate)

### Completion Notes List

**Task 1 - API de Listagem de Usuários (COMPLETA)**
- ✅ Endpoint GET /api/v1/admin/users implementado com paginação (20/página)
- ✅ Filtros por role (admin/candidate/company/all) e status (active/pending/inactive/all)
- ✅ Busca por nome ou email funcionando
- ✅ select_related para queries otimizadas (evita N+1)
- ✅ Clean Architecture: Views → Services → Models
- ✅ IsAdmin permission class criada e aplicada
- ✅ 40 testes criados, todos passando

**Task 2 - Permissões Admin (COMPLETA)**
- ✅ IsAdmin, IsCandidate, IsCompany, IsOwner permission classes criadas
- ✅ Endpoints admin protegidos com IsAdmin
- ✅ Frontend verification implementada no loader da rota

**Task 3 - Interface de Gerenciamento (COMPLETA)**
- ✅ Rota /admin/users criada com Remix loader
- ✅ UserTable component com design system (Table, Badge)
- ✅ UserDetailModal component para detalhes do usuário (AC6)
- ✅ Filtros por role e status funcionando (AC3, AC4)
- ✅ Busca por nome ou email (AC5)
- ✅ Paginação 20/página com navegação (AC9)
- ✅ Click na linha abre modal de detalhes (AC6)
- ✅ Auth check no loader (redirect se não autenticado)

**Task 4 - Alteração de Status (COMPLETA)**
- ✅ PATCH endpoint implementado em AdminUserDetailView
- ✅ update_user_status method no service layer com validação de transições
- ✅ Email notifications via Celery task (AC8):
  - Empresa aprovada: "Sua empresa foi aprovada - TalentBase"
  - Conta ativada: "Sua conta foi ativada - TalentBase"
  - Conta suspensa: "Sua conta foi suspensa - TalentBase"
- ✅ Frontend UI: Botões de ativar/desativar no UserDetailModal
- ✅ Feedback visual de sucesso/erro
- ✅ Texto contextual baseado em role (Aprovar Empresa vs Ativar Usuário)
- ✅ Loading state durante atualização
- ✅ Refresh automático da lista após mudança de status

**Observações Técnicas:**
- Module renomeado de "admin" para "user_management" para evitar conflito com Django Admin
- Relacionamentos usam underscore: candidate_profile, company_profile (Django naming convention)
- GET /api/v1/admin/users/:id implementado para detalhes (usado no modal - AC6)
- Design System: Criados componentes Table e Modal reutilizáveis
- Frontend segue FRONTEND_BEST_PRACTICES.md: componentes separados, design system first

### File List

**Backend:**
- apps/api/user_management/__init__.py
- apps/api/user_management/services/__init__.py
- apps/api/user_management/services/user_management.py
- apps/api/user_management/serializers.py
- apps/api/user_management/views.py
- apps/api/user_management/urls.py
- apps/api/user_management/tests/__init__.py
- apps/api/user_management/tests/test_views.py
- apps/api/user_management/tests/test_services.py
- apps/api/core/permissions.py
- apps/api/core/tests/test_permissions.py

**Frontend:**
- packages/web/app/routes/admin.users.tsx (Rota principal)
- packages/web/app/components/admin/UserTable.tsx
- packages/web/app/components/admin/UserDetailModal.tsx
- packages/web/app/lib/api/admin.ts (API client)

**Design System:**
- packages/design-system/src/components/Table.tsx
- packages/design-system/src/components/Modal.tsx

**Modificados (Task 4):**
- packages/web/app/components/admin/UserDetailModal.tsx (added status change buttons)
- packages/web/app/routes/admin.users.tsx (added status change handler and feedback)
- packages/web/app/lib/api/admin.ts (already had updateUserStatus function)

**Modificados (Tasks 1-3):**
- apps/api/talentbase/settings/base.py (added user_management to INSTALLED_APPS)
- apps/api/talentbase/urls.py (added user_management URLs)
- packages/design-system/src/index.ts (export Table and Modal)