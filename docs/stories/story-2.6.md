# Story 2.6: Role-Based Access Control (RBAC)

Status: Draft

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)

## Story

Como um **sistema**,
Eu quero **impor permissões baseadas em roles em todos os endpoints da API**,
Para que **usuários possam acessar apenas recursos apropriados à sua role**.

## Acceptance Criteria

1. Todos os endpoints da API exigem autenticação (exceto rotas públicas)
2. Role admin tem acesso a todos os endpoints
3. Role candidate pode:
   - Ler/atualizar próprio perfil
   - Navegar vagas
   - Criar applications
   - Visualizar próprias applications
4. Role company pode:
   - Ler/atualizar próprio perfil da empresa
   - CRUD próprias vagas
   - Buscar candidatos (somente leitura)
   - Favoritar candidatos
   - Visualizar applications para próprias vagas
5. Acesso não autorizado retorna 403 Forbidden com mensagem clara
6. Decorator de permissão aplicado a todas as views Django
7. Rotas frontend protegidas (redirect para login se não autenticado)
8. Frontend esconde elementos de UI não permitidos para a role

## Tasks / Subtasks

- [ ] Task 1: Criar permission classes Django (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Implementar IsAdmin permission
  - [ ] Implementar IsCandidate permission
  - [ ] Implementar IsCompany permission
  - [ ] Implementar IsOwner permission (own resources)
- [ ] Task 2: Aplicar permissões aos endpoints (AC: 1, 6)
  - [ ] Decorar todas as views com permission_classes
  - [ ] Configurar IsAuthenticated como padrão
  - [ ] Mapear endpoints específicos por role
- [ ] Task 3: Implementar proteção frontend (AC: 7, 8)
  - [ ] Criar requireAuth utility para loaders
  - [ ] Implementar verificação de role em componentes
  - [ ] Configurar redirects para login
- [ ] Task 4: Configurar middleware de autenticação (AC: 1)
  - [ ] Configurar DRF authentication classes
  - [ ] Implementar token validation middleware
  - [ ] Configurar exception handling
- [ ] Task 5: Criar sistema de autorização granular (AC: 3, 4)
  - [ ] Implementar object-level permissions
  - [ ] Validar ownership de recursos
  - [ ] Implementar business rules por role

## Dev Notes

### Permission Architecture

**Django Permission Classes:**
```python
# core/permissions.py
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsCandidate(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'candidate'

class IsCompany(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'company'

class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
```

### Role-Based Endpoint Mapping

| Endpoint Pattern | Admin | Candidate | Company | Notes |
|------------------|-------|-----------|---------|-------|
| `/api/v1/auth/*` | ✅ | ✅ | ✅ | Public endpoints |
| `/api/v1/admin/*` | ✅ | ❌ | ❌ | Admin only |
| `/api/v1/candidates/me` | ✅ | ✅ | ❌ | Own profile only |
| `/api/v1/candidates` | ✅ | ❌ | ✅ | Company search |
| `/api/v1/jobs` | ✅ | ✅ | ✅ | Read: all, Write: company only |
| `/api/v1/applications` | ✅ | ✅ | ✅ | Filtered by ownership |

### Frontend Route Protection

**Remix Loader Protection:**
```typescript
// utils/auth.ts
export async function requireAuth(request: Request, requiredRole?: string) {
  const token = getTokenFromCookie(request);
  if (!token) {
    throw redirect('/auth/login');
  }

  const user = await validateToken(token);
  if (requiredRole && user.role !== requiredRole) {
    throw new Response('Forbidden', { status: 403 });
  }

  return user;
}

// Usage in loader
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request, 'admin');
  // Continue with admin-only logic
}
```

### Component-Level Authorization

**Conditional UI Rendering:**
```typescript
// components/ConditionalRender.tsx
interface Props {
  roles: string[];
  user: User;
  children: React.ReactNode;
}

export function RequireRole({ roles, user, children }: Props) {
  if (!roles.includes(user.role)) {
    return null;
  }
  return <>{children}</>;
}

// Usage
<RequireRole roles={['admin', 'company']} user={user}>
  <CreateJobButton />
</RequireRole>
```

### API Permission Configuration

**DRF Settings:**
```python
# settings/base.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler'
}
```

### Object-Level Permissions

**Ownership Validation:**
```python
# Example: Candidate can only edit own profile
class CandidateProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsCandidate, IsOwner]

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("You can only access your own profile")
        return obj
```

### Error Response Format

**403 Forbidden Response:**
```json
{
  "error": "Permission denied",
  "code": "PERMISSION_DENIED",
  "detail": "You do not have permission to perform this action",
  "required_role": "admin"
}
```

### Security Requirements

- All API endpoints require authentication by default
- Object-level permission checks for ownership
- Frontend route protection with redirects
- Role-based UI component rendering
- Audit logging for permission violations

### Project Structure Notes

- Permission classes: `apps/api/core/permissions.py`
- Auth utilities: `packages/web/app/utils/auth.ts`
- Protected routes: All admin routes under `/admin/*`
- Exception handling: `apps/api/core/exceptions.py`

### Testing Strategy

**Permission Tests:**
```python
def test_candidate_cannot_access_admin_endpoint(self):
    self.client.force_authenticate(user=self.candidate_user)
    response = self.client.get('/api/v1/admin/users/')
    self.assertEqual(response.status_code, 403)

def test_company_can_only_edit_own_jobs(self):
    self.client.force_authenticate(user=self.company_user)
    response = self.client.patch(f'/api/v1/jobs/{other_company_job.id}/')
    self.assertEqual(response.status_code, 403)

def test_admin_has_full_access(self):
    self.client.force_authenticate(user=self.admin_user)
    response = self.client.get('/api/v1/admin/users/')
    self.assertEqual(response.status_code, 200)
```

### References

- [Source: docs/epics/epics.md#Story-2.6]
- [Source: docs/epics/tech-spec-epic-2.md#Story-2.6]
- [Source: docs/epics/tech-spec-epic-2.md#Authorization-RBAC]

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