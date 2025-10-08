# Story 2.5.1: Dashboard Layout Components & Admin Implementation

Status: Ready for Implementation

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)


## Story

Como um **desenvolvedor do TalentBase**,
Eu quero **componentes de layout dashboard reutilizáveis no design system e implementação do admin dashboard**,
Para que **todos os dashboards (admin, candidate, company) usem a mesma estrutura visual e o admin tenha navegação e widgets funcionais**.

## Context

Esta story foi criada para cobrir um **gap crítico identificado** nas Stories 2.4 e 2.5:
- Story 2.4 menciona página `/admin/users` mas não especifica layout geral do admin
- Story 2.5 refere-se a "widgets no dashboard" que nunca foram definidos
- **Nenhuma story anterior criou componentes de layout (Sidebar, Navbar) no design system**

Esta story segue a arquitetura correta:
1. **PRIMEIRO:** Criar componentes genéricos no design system
2. **DEPOIS:** Implementar admin dashboard usando esses componentes

## Acceptance Criteria

### Design System Components (AC 1-6)
1. **Sidebar component** criado em `packages/design-system/src/components/Sidebar.tsx`:
   - Props: `menuItems[]`, `activeItem`, `logo`, `onItemClick`
   - Menu items com ícone, label, href, badge (opcional)
   - Active item visualmente destacado (bg-blue-100, border-left)
   - Mobile: collapsible com overlay
   - Desktop: always visible (width 240px)
2. **Navbar component** criado em `packages/design-system/src/components/Navbar.tsx`:
   - Props: `pageTitle`, `user`, `onLogout`, `logo`
   - Header sticky (position: sticky, top: 0)
   - User menu dropdown (nome, email, profile link, logout)
   - Mobile: hamburger button para toggle sidebar
3. **DashboardLayout component** criado em `packages/design-system/src/components/DashboardLayout.tsx`:
   - Props: `sidebarConfig`, `user`, `pageTitle`, `children`
   - Combina Sidebar + Navbar + main content area
   - Mobile e desktop responsive
   - Exportado no `packages/design-system/src/index.ts`
4. Componentes usam Lucide React icons
5. Componentes têm variants e são totalmente tipados (TypeScript)
6. Storybook stories criadas para Sidebar, Navbar, DashboardLayout

### Admin Dashboard Homepage (AC 7-11)
7. Admin homepage route at `/admin` (dashboard landing page)
8. Dashboard exibe widgets overview:
   - **Total Users** com breakdown (X candidates, Y companies, Z admins)
   - **Pending Approvals** com contagem de empresas pendentes (clicável → `/admin/users?status=pending&role=company`)
   - **Active Jobs** com número de vagas ativas
   - **Total Candidates** com número de candidatos disponíveis
   - **Recent Activity** com últimas 5 ações (registros, aprovações)
9. Widgets usam Card component do design system
10. Widgets são clicáveis e navegam para páginas relevantes
11. Dashboard carrega em menos de 2 segundos

### Admin Layout Implementation (AC 12-15)
12. AdminLayout wrapper criado em `packages/web/app/components/layouts/AdminLayout.tsx`:
    - Usa `DashboardLayout` do design system
    - Configura menu items específicos do admin (Dashboard, Users, Companies, Candidates, Jobs, Applications, Matches)
    - Passa user info e handleLogout
13. Rota `/admin` protegida com `requireAuth(request, 'admin')`
14. Página `/admin/users` atualizada para usar AdminLayout
15. Navegação entre páginas admin funcional (sidebar active highlighting)

### API & Backend (AC 16-17)
16. Endpoint `GET /api/v1/admin/stats` criado retornando:
    - `total_users`, `total_candidates`, `total_companies`, `total_admins`
    - `pending_approvals`, `active_jobs`
    - `recent_activity[]` (últimas 5 ações)
17. Permissions: IsAdmin required para stats endpoint

## Tasks / Subtasks

### Task 1: Create Sidebar Component (Design System) (AC: 1, 4, 5)
- [ ] Create `packages/design-system/src/components/Sidebar.tsx`
  - [ ] Define TypeScript types: `SidebarProps`, `MenuItem`
  - [ ] Implement desktop layout (width 240px, fixed)
  - [ ] Implement active item highlighting
  - [ ] Add Lucide React icons support
  - [ ] Implement mobile collapsible behavior
  - [ ] Add overlay for mobile
- [ ] Create `packages/design-system/src/components/Sidebar.stories.tsx`
  - [ ] Story: Default sidebar with menu items
  - [ ] Story: Mobile collapsed
  - [ ] Story: Active item highlighted
- [ ] Export Sidebar in `packages/design-system/src/index.ts`

### Task 2: Create Navbar Component (Design System) (AC: 2, 4, 5)
- [ ] Create `packages/design-system/src/components/Navbar.tsx`
  - [ ] Define TypeScript types: `NavbarProps`, `UserMenuProps`
  - [ ] Implement sticky header (position: sticky)
  - [ ] Create user dropdown menu component
  - [ ] Add hamburger button for mobile
  - [ ] Add logo and page title
- [ ] Create `packages/design-system/src/components/Navbar.stories.tsx`
  - [ ] Story: Default navbar with user menu
  - [ ] Story: User menu open
  - [ ] Story: Mobile with hamburger
- [ ] Export Navbar in `packages/design-system/src/index.ts`

### Task 3: Create DashboardLayout Component (Design System) (AC: 3, 4, 5, 6)
- [ ] Create `packages/design-system/src/components/DashboardLayout.tsx`
  - [ ] Define TypeScript types: `DashboardLayoutProps`, `SidebarConfig`
  - [ ] Compose Sidebar + Navbar + main content area
  - [ ] Handle mobile/desktop responsive behavior
  - [ ] Pass through props to Sidebar and Navbar
  - [ ] Add proper TypeScript generics for flexible config
- [ ] Create `packages/design-system/src/components/DashboardLayout.stories.tsx`
  - [ ] Story: Full dashboard layout (desktop)
  - [ ] Story: Mobile layout with sidebar collapsed
  - [ ] Story: Different menu configurations
- [ ] Export DashboardLayout in `packages/design-system/src/index.ts`
- [ ] Update `packages/design-system/package.json` dependencies (add lucide-react if not present)

### Task 4: Create AdminLayout Wrapper (AC: 12)
- [ ] Create `packages/web/app/components/layouts/AdminLayout.tsx`
  - [ ] Import DashboardLayout from design system
  - [ ] Define admin menu items configuration:
    - Dashboard 🏠 → `/admin`
    - Users 👥 → `/admin/users`
    - Companies 🏢 → `/admin/companies` (future - disabled)
    - Candidates 👤 → `/admin/candidates` (future - disabled)
    - Jobs 💼 → `/admin/jobs` (future - disabled)
    - Applications 📋 → `/admin/applications` (future - disabled)
    - Matches 🎯 → `/admin/matching` (future - disabled)
  - [ ] Fetch current user from loader
  - [ ] Implement logout handler (POST /api/v1/auth/logout)
  - [ ] Pass config to DashboardLayout

### Task 5: Create Admin Stats API (AC: 16, 17)
- [ ] Create endpoint in `apps/api/user_management/views.py`
  - [ ] Implement `AdminStatsView` (APIView)
  - [ ] Add IsAdmin permission
  - [ ] Calculate stats:
    - `total_users = User.objects.count()`
    - `total_candidates = User.objects.filter(role='candidate').count()`
    - `total_companies = User.objects.filter(role='company').count()`
    - `total_admins = User.objects.filter(role='admin').count()`
    - `pending_approvals = User.objects.filter(role='company', is_active=False).count()`
    - `active_jobs = 0` (placeholder - Epic 4)
    - `recent_activity = []` (placeholder - return last 5 user creations for MVP)
- [ ] Create `AdminStatsSerializer` in `apps/api/user_management/serializers.py`
- [ ] Add route to `apps/api/user_management/urls.py`: `path('stats/', AdminStatsView.as_view())`
- [ ] Add tests in `apps/api/user_management/tests/test_views.py`

### Task 6: Create Admin Dashboard Homepage (AC: 7-11, 13)
- [ ] Create route `packages/web/app/routes/admin._index.tsx`
  - [ ] Implement loader:
    - Check auth with `requireAuth(request, 'admin')`
    - Fetch stats from `GET /api/v1/admin/stats`
    - Return stats data
  - [ ] Create dashboard grid layout (responsive 2x3)
  - [ ] Create widget components:
    - `StatCard.tsx` (reusable widget wrapper)
    - Render Total Users widget with breakdown
    - Render Pending Approvals widget (clickable Link)
    - Render Active Jobs widget
    - Render Total Candidates widget
    - Render Recent Activity widget (list)
  - [ ] Wrap page with AdminLayout
  - [ ] Add error boundary for stats fetch failures

### Task 7: Update Admin Users Page (AC: 14, 15)
- [ ] Update `packages/web/app/routes/admin.users.tsx`
  - [ ] Import and use AdminLayout wrapper
  - [ ] Remove any custom header/nav if present
  - [ ] Pass pageTitle="User Management" to AdminLayout
  - [ ] Test navigation from sidebar works
  - [ ] Verify active menu item highlights correctly

### Task 8: Create API Client Helper (AC: 16)
- [ ] Add to `packages/web/app/lib/api/admin.ts`
  - [ ] Implement `getAdminStats()` function
  - [ ] Add TypeScript types for stats response
  - [ ] Handle errors and return typed response

### Task 9: Add Tests
- [ ] Design System Component Tests:
  - [ ] `Sidebar.test.tsx`: renders menu items, active highlighting, mobile collapse
  - [ ] `Navbar.test.tsx`: renders user menu, dropdown toggle, hamburger
  - [ ] `DashboardLayout.test.tsx`: composes Sidebar + Navbar, passes props
- [ ] Backend Tests:
  - [ ] `test_admin_stats_view`: returns correct counts
  - [ ] `test_admin_stats_permission`: non-admin gets 403
  - [ ] `test_admin_stats_structure`: response has all fields
- [ ] Frontend Tests:
  - [ ] AdminLayout renders correctly
  - [ ] Dashboard widgets display stats
  - [ ] Widget navigation links work
  - [ ] Sidebar active item highlights
- [ ] E2E Tests:
  - [ ] Admin login → lands on /admin dashboard
  - [ ] Dashboard shows stats widgets
  - [ ] Click "Pending Approvals" → navigates to /admin/users?status=pending
  - [ ] Sidebar navigation to /admin/users works
  - [ ] Logout from user menu redirects to /auth/login

## Dev Notes

### Design System Architecture

**Component Hierarchy:**
```
DashboardLayout (generic, reusable)
├── Sidebar (generic)
│   ├── Logo
│   ├── MenuItem[]
│   └── Mobile overlay
├── Navbar (generic)
│   ├── Page title
│   ├── Hamburger (mobile)
│   └── UserMenu dropdown
└── Main content area
    └── {children}
```

**Props Design (TypeScript):**
```typescript
// Sidebar.tsx
interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
}

interface SidebarProps {
  menuItems: MenuItem[];
  activeItemId: string;
  logo: React.ReactNode;
  onItemClick?: (item: MenuItem) => void;
  isCollapsed?: boolean; // Mobile state
  onToggle?: () => void;
}

// Navbar.tsx
interface NavbarProps {
  pageTitle: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  logo: React.ReactNode;
  onLogout: () => void;
  onMenuToggle?: () => void; // Mobile hamburger
}

// DashboardLayout.tsx
interface DashboardLayoutProps {
  sidebarConfig: {
    menuItems: MenuItem[];
    activeItemId: string;
    logo: React.ReactNode;
  };
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  pageTitle: string;
  onLogout: () => void;
  children: React.ReactNode;
}
```

### Admin Implementation

**AdminLayout Wrapper:**
```typescript
// packages/web/app/components/layouts/AdminLayout.tsx
import { DashboardLayout } from '@talentbase/design-system';
import { Home, Users, Building2, User, Briefcase, FileText, Target } from 'lucide-react';

const adminMenuItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: Home },
  { id: 'users', label: 'Users', href: '/admin/users', icon: Users },
  { id: 'companies', label: 'Companies', href: '/admin/companies', icon: Building2, disabled: true },
  { id: 'candidates', label: 'Candidates', href: '/admin/candidates', icon: User, disabled: true },
  { id: 'jobs', label: 'Jobs', href: '/admin/jobs', icon: Briefcase, disabled: true },
  { id: 'applications', label: 'Applications', href: '/admin/applications', icon: FileText, disabled: true },
  { id: 'matching', label: 'Matching', href: '/admin/matching', icon: Target, disabled: true },
];

export function AdminLayout({ children, pageTitle, activeItem }: AdminLayoutProps) {
  const user = useUser(); // Get from loader
  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    window.location.href = '/auth/login';
  };

  return (
    <DashboardLayout
      sidebarConfig={{
        menuItems: adminMenuItems,
        activeItemId: activeItem,
        logo: <span className="text-xl font-bold">TalentBase</span>
      }}
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }}
      pageTitle={pageTitle}
      onLogout={handleLogout}
    >
      {children}
    </DashboardLayout>
  );
}
```

### Future Reusability (Epic 3, 4)

**CandidateLayout (Epic 3):**
```typescript
const candidateMenuItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/candidate', icon: Home },
  { id: 'profile', label: 'My Profile', href: '/candidate/profile', icon: User },
  { id: 'jobs', label: 'Browse Jobs', href: '/candidate/jobs', icon: Briefcase },
  { id: 'applications', label: 'My Applications', href: '/candidate/applications', icon: FileText },
];
```

**CompanyLayout (Epic 4):**
```typescript
const companyMenuItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/company', icon: Home },
  { id: 'profile', label: 'Company Profile', href: '/company/profile', icon: Building2 },
  { id: 'jobs', label: 'My Jobs', href: '/company/jobs', icon: Briefcase },
  { id: 'candidates', label: 'Search Candidates', href: '/company/candidates', icon: Users },
];
```

### Project Structure

```
packages/design-system/src/components/
├── Sidebar.tsx                    # NEW - Generic sidebar
├── Sidebar.stories.tsx            # NEW
├── Navbar.tsx                     # NEW - Generic navbar
├── Navbar.stories.tsx             # NEW
├── DashboardLayout.tsx            # NEW - Generic dashboard wrapper
└── DashboardLayout.stories.tsx    # NEW

packages/web/app/
├── components/
│   ├── layouts/
│   │   └── AdminLayout.tsx        # NEW - Admin-specific wrapper
│   └── admin/
│       ├── StatCard.tsx           # NEW - Widget card
│       └── [other widgets...]     # NEW
├── routes/
│   ├── admin._index.tsx           # NEW - Dashboard homepage
│   └── admin.users.tsx            # UPDATED - Use AdminLayout
└── lib/api/admin.ts               # UPDATED - Add getAdminStats()

apps/api/user_management/
├── views.py                       # UPDATED - Add AdminStatsView
├── serializers.py                 # UPDATED - Add AdminStatsSerializer
└── urls.py                        # UPDATED - Add stats route
```

## References

- [Source: docs/epics/epics.md#Epic-2]
- [Gap Analysis: docs/epics/gap-analysis-epic-2-admin-layout.md]
- [Design System: packages/design-system/README.md]

## Dependencies

- ✅ Story 2.3 (Login & Token Authentication) - Completed
- ✅ Story 2.4 (Admin User Management Dashboard) - Mostly Complete
- ✅ Design System base components (Card, Button, Badge) - Available

## Change Log

| Date | Version | Description | Author |
| ---- | ------- | ----------- | ------ |
| 2025-10-08 | 0.1 | Initial draft - Gap coverage | Sally (UX Expert) |
| 2025-10-08 | 1.0 | **Design System First approach** | Sally (UX Expert) |

## Dev Agent Record

### Context Reference
- Story created to address gap identified in Epic 2 review
- **Updated to follow Design System First architecture**
- Sidebar, Navbar, DashboardLayout now in design system for reusability
- **Story Context XML generated:** [docs/stories-context/story-context-2.5.1.xml](../stories-context/story-context-2.5.1.xml)
  - Generated: 2025-10-08
  - Includes: Tasks, ACs, 5 docs, 8 code artifacts, dependencies, constraints, interfaces, 27 test ideas

### Agent Model Used
Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
