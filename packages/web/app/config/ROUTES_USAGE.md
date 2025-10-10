# Routes Configuration Usage Guide

## 📋 Overview

This document explains how to use the centralized routes configuration system to avoid hardcoded URLs throughout the application.

## 🎯 Benefits

✅ **Type-safe** - TypeScript ensures routes exist
✅ **Maintainable** - Change once, update everywhere
✅ **Consistent** - Standardized query parameters
✅ **Discoverable** - Easy to find all available routes
✅ **Refactor-friendly** - Rename routes without breaking links

## 📍 Basic Usage

### Simple Routes

```tsx
import { ROUTES } from '~/config/routes';

// ❌ BAD - Hardcoded
<Link to="/admin/users">Users</Link>

// ✅ GOOD - Using constant
<Link to={ROUTES.admin.users}>Users</Link>
```

### Parameterized Routes

```tsx
import { ROUTES } from '~/config/routes';

// ❌ BAD - String interpolation
<Link to={`/share/candidate/${token}`}>Share</Link>

// ✅ GOOD - Using function
<Link to={ROUTES.share.candidate(token)}>Share</Link>
```

## 🔧 Route Builders

### Admin Users Route with Filters

```tsx
import { buildAdminUsersRoute } from '~/config/routes';

// All pending company approvals
const route = buildAdminUsersRoute({
  status: 'pending',
  role: 'company'
});
// => '/admin/users?status=pending&role=company'

// Search for a specific user
const route = buildAdminUsersRoute({
  search: 'john@example.com'
});
// => '/admin/users?search=john%40example.com'

// Page 2 of all users
const route = buildAdminUsersRoute({
  page: 2
});
// => '/admin/users?page=2'

// Just the base route
const route = buildAdminUsersRoute();
// => '/admin/users'
```

### Usage in Components

```tsx
import { buildAdminUsersRoute } from '~/config/routes';

function UserFilters() {
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    search: '',
  });

  const route = buildAdminUsersRoute(filters);

  return (
    <Link to={route}>
      Apply Filters
    </Link>
  );
}
```

## ⚡ Quick Routes

Pre-built common route combinations for convenience:

```tsx
import { QUICK_ROUTES } from '~/config/routes';

// Pending company approvals
<Link to={QUICK_ROUTES.pendingCompanyApprovals}>
  Review Companies
</Link>

// Pending candidate approvals
<Link to={QUICK_ROUTES.pendingCandidateApprovals}>
  Review Candidates
</Link>

// All pending approvals
<Link to={QUICK_ROUTES.allPendingApprovals}>
  Review All
</Link>

// Login with redirect
<Link to={QUICK_ROUTES.loginWithRedirect('/admin/dashboard')}>
  Login
</Link>
```

## 🛠️ Route Validation Helpers

```tsx
import {
  isAdminRoute,
  isCandidateRoute,
  isCompanyRoute,
  isAuthRoute,
  isPublicRoute,
} from '~/config/routes';

const path = useLocation().pathname;

if (isAdminRoute(path)) {
  // Show admin navigation
}

if (isAuthRoute(path)) {
  // Hide main navigation
}
```

## 📚 Available Routes

### Public Routes
- `ROUTES.home` - `/`

### Auth Routes
- `ROUTES.auth.login` - `/auth/login`
- `ROUTES.auth.register` - `/auth/register`
- `ROUTES.auth.candidateRegister` - `/auth/register/candidate`
- `ROUTES.auth.companyRegister` - `/auth/register/company`

### Admin Routes
- `ROUTES.admin.dashboard` - `/admin`
- `ROUTES.admin.users` - `/admin/users`
- `ROUTES.admin.companies` - `/admin/companies`
- `ROUTES.admin.candidates` - `/admin/candidates`
- `ROUTES.admin.jobs` - `/admin/jobs`
- `ROUTES.admin.applications` - `/admin/applications`
- `ROUTES.admin.matching` - `/admin/matching`
- `ROUTES.admin.importCandidates` - `/admin/import/candidates`

### Candidate Routes
- `ROUTES.candidate.dashboard` - `/candidate/dashboard`
- `ROUTES.candidate.profile` - `/candidate/profile`
- `ROUTES.candidate.profileCreate` - `/candidate/profile/create`

### Company Routes
- `ROUTES.company.dashboard` - `/company/dashboard`
- `ROUTES.company.profile` - `/company/profile`
- `ROUTES.company.jobs` - `/company/jobs`

### Share Routes
- `ROUTES.share.candidate(token)` - `/share/candidate/${token}`

## 🔄 Migration Guide

### Before
```tsx
// components/UserList.tsx
<Link to="/admin/users?status=pending&role=company">
  Pending Companies
</Link>

// routes/admin.dashboard.tsx
<a href="/auth/register">Register</a>

// components/Navbar.tsx
<Link to="/candidate/dashboard">Dashboard</Link>
```

### After
```tsx
// components/UserList.tsx
import { QUICK_ROUTES } from '~/config/routes';

<Link to={QUICK_ROUTES.pendingCompanyApprovals}>
  Pending Companies
</Link>

// routes/admin.dashboard.tsx
import { ROUTES } from '~/config/routes';

<Link to={ROUTES.auth.register}>Register</Link>

// components/Navbar.tsx
import { ROUTES } from '~/config/routes';

<Link to={ROUTES.candidate.dashboard}>Dashboard</Link>
```

## 🚀 Adding New Routes

1. **Add to `ROUTES` constant:**
```tsx
// config/routes.ts
export const ROUTES = {
  // ... existing routes

  newFeature: {
    list: '/new-feature',
    detail: (id: string) => `/new-feature/${id}`,
  },
} as const;
```

2. **Add builder if needed:**
```tsx
export function buildNewFeatureRoute(params?: {
  filter?: string;
  page?: number;
}): string {
  // Implementation
}
```

3. **Add to quick routes if common:**
```tsx
export const QUICK_ROUTES = {
  // ... existing routes

  activeFeatures: buildNewFeatureRoute({ filter: 'active' }),
} as const;
```

## 💡 Best Practices

1. **Always import from `~/config/routes`**
   ```tsx
   import { ROUTES, QUICK_ROUTES, buildAdminUsersRoute } from '~/config/routes';
   ```

2. **Use QUICK_ROUTES for common combinations**
   ```tsx
   // Good
   <Link to={QUICK_ROUTES.pendingCompanyApprovals} />

   // Less ideal (but still ok)
   <Link to={buildAdminUsersRoute({ status: 'pending', role: 'company' })} />
   ```

3. **Use builders for dynamic routes**
   ```tsx
   const filters = useSearchParams();
   const route = buildAdminUsersRoute(filters);
   ```

4. **Never hardcode URLs**
   ```tsx
   // ❌ Never do this
   <Link to="/admin/users?status=pending" />

   // ✅ Always do this
   <Link to={buildAdminUsersRoute({ status: 'pending' })} />
   ```

## 🧪 Testing

Routes are easy to test since they're just functions:

```tsx
import { buildAdminUsersRoute, QUICK_ROUTES } from '~/config/routes';

describe('Route builders', () => {
  it('builds correct URL with filters', () => {
    const route = buildAdminUsersRoute({
      status: 'pending',
      role: 'company'
    });

    expect(route).toBe('/admin/users?status=pending&role=company');
  });

  it('has correct quick route', () => {
    expect(QUICK_ROUTES.pendingCompanyApprovals)
      .toBe('/admin/users?status=pending&role=company');
  });
});
```

## 📞 Questions?

If you have questions about routes or need to add new ones, check:
1. This documentation
2. The `config/routes.ts` file for all available routes
3. Ask the team in #frontend channel

---

**Remember:** Centralized routes = maintainable code! 🎉
