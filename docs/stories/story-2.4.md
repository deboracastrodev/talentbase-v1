# Story 2.4: Admin User Management Dashboard

Status: Draft

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)


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

- [ ] Task 1: Criar API de listagem de usuários (AC: 2, 3, 4, 5, 9)
  - [ ] Implementar endpoint `GET /api/v1/admin/users`
  - [ ] Adicionar filtros por role e status
  - [ ] Implementar busca por nome/email
  - [ ] Configurar paginação Django REST
- [ ] Task 2: Implementar permissões admin (AC: 1, 6, 7)
  - [ ] Criar IsAdmin permission class
  - [ ] Proteger todos os endpoints admin
  - [ ] Implementar verificação de role no frontend
- [ ] Task 3: Criar interface de gerenciamento (AC: 1, 2, 6)
  - [ ] Criar route `/admin/users`
  - [ ] Implementar tabela com design system
  - [ ] Criar modal de detalhes do usuário
- [ ] Task 4: Implementar alteração de status (AC: 7, 8)
  - [ ] Criar endpoints PATCH para status
  - [ ] Implementar notificações email
  - [ ] Validar transições de status
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

**UserDetailModal:**
- Read-only user information
- Status change dropdown
- Action history (future)

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

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML/JSON will be added here by context workflow -->

### Agent Model Used

Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

### Completion Notes List

### File List