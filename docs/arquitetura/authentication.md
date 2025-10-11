# Authentication & Authorization

Sistema de autenticação e autorização do TalentBase.

---

## Estratégia de Autenticação

**Method:** Token-based Authentication (DRF Token Auth + JWT)

- **Initial Auth:** Django REST Framework Token Authentication
- **Future:** Migrar para JWT quando necessário refresh tokens

---

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **admin** | Administrador do sistema | Full access a tudo |
| **candidate** | Candidato | CRUD próprio perfil, visualizar vagas, aplicar |
| **company** | Empresa | CRUD vagas próprias, visualizar candidatos, favoritar |

---

## Registration Flow

### Candidate Registration

```
1. POST /api/auth/register/candidate
   ↓
2. Create User (role='candidate')
   ↓
3. Create Candidate profile (status='incomplete')
   ↓
4. Generate auth token
   ↓
5. Send welcome email
   ↓
6. Return token + user data
```

### Company Registration

```
1. POST /api/auth/register/company
   ↓
2. Create User (role='company')
   ↓
3. Create Company profile (approved=false)
   ↓
4. Notify admin for approval
   ↓
5. Return success message (no token until approved)
   ↓
6. Admin approves → Send email with login instructions
```

---

## Login Flow

```
1. POST /api/auth/login
   {email, password}
   ↓
2. Validate credentials
   ↓
3. Check user.is_active
   ↓
4. If company → Check company.approved
   ↓
5. Generate/retrieve auth token
   ↓
6. Return token + user data
```

---

## Permission Classes (DRF)

### IsAdmin
```python
class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'
```

### IsCandidate
```python
class IsCandidate(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'candidate'
```

### IsCompany
```python
class IsCompany(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'company'
```

### IsOwnerOrAdmin
```python
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj.user == request.user
```

---

## Endpoint Permissions

| Endpoint | Method | Permission |
|----------|--------|------------|
| `/auth/register/*` | POST | AllowAny |
| `/auth/login` | POST | AllowAny |
| `/auth/logout` | POST | IsAuthenticated |
| `/candidates` | GET | IsAuthenticated |
| `/candidates/:id` | GET | IsAuthenticated (Company/Admin) OR IsOwner (Candidate) |
| `/candidates/:id` | PATCH | IsOwner OR IsAdmin |
| `/share/candidate/:token` | GET | AllowAny |
| `/companies/:id` | GET | IsAuthenticated |
| `/companies/:id` | PATCH | IsOwner OR IsAdmin |
| `/jobs` | GET | AllowAny (only active jobs) |
| `/jobs` | POST | IsCompany OR IsAdmin |
| `/jobs/:id` | PATCH | IsOwner (Company) OR IsAdmin |
| `/jobs/:id/apply` | POST | IsCandidate |
| `/applications` | GET | IsOwner OR IsAdmin |
| `/favorites` | POST | IsCompany |
| `/rankings` | GET | IsAdmin |

---

## Token Storage (Frontend)

### Cookie-based (Recommended for Remix)
```typescript
// On login success
document.cookie = `auth_token=${token}; path=/; secure; httpOnly; sameSite=strict`;

// Remix loader
export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const token = getCookie(cookieHeader, 'auth_token');

  if (!token) {
    throw redirect('/login');
  }

  // Fetch user data with token
  const user = await fetchUser(token);
  return json({ user });
}
```

---

## API Client (Frontend)

```typescript
// lib/api-client.ts

const API_BASE_URL = 'https://api.salesdog.click/v1';

class APIClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: RegisterData) {
    return this.request('/auth/register/candidate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Candidates
  async getCandidates(filters: CandidateFilters) {
    const params = new URLSearchParams(filters);
    return this.request(`/candidates?${params}`);
  }

  async getCandidate(id: string) {
    return this.request(`/candidates/${id}`);
  }

  // Jobs
  async getJobs(filters: JobFilters) {
    const params = new URLSearchParams(filters);
    return this.request(`/jobs?${params}`);
  }

  async createJob(data: CreateJobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new APIClient();
```

---

## Protected Routes (Remix)

```typescript
// app/routes/_auth.tsx (Auth Layout)

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await getAuthToken(request);

  if (!token) {
    throw redirect('/login');
  }

  const user = await fetchUser(token);

  if (!user) {
    throw redirect('/login');
  }

  return json({ user });
}

export default function AuthLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <Header user={user} />
      <Outlet />
    </div>
  );
}
```

### Role-based Protection

```typescript
// app/routes/admin.tsx

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireAuth(request);

  if (user.role !== 'admin') {
    throw new Response('Forbidden', { status: 403 });
  }

  return json({ user });
}
```

---

## Session Management

### Token Expiration
- **Token lifetime:** 7 days
- **Auto-refresh:** Not implemented initially (manual re-login)
- **Future:** JWT with refresh tokens (15min access + 7day refresh)

### Logout
```typescript
// Clear token from cookies
document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

// Redirect to login
navigate('/login');
```

---

## Security Best Practices

### Backend (Django)
```python
# settings.py

# CORS
CORS_ALLOWED_ORIGINS = [
    "https://salesdog.click",
    "https://www.salesdog.click",
    "https://dev.salesdog.click"
]

# CSRF
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Strict'

# Session
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8}
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Rate limiting
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

### Frontend (Remix)
```typescript
// Validate all inputs
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Never store sensitive data in localStorage
// Use httpOnly cookies for tokens
// Sanitize user inputs
// Validate API responses
```

---

## Email Verification (Future)

```
1. User registers
   ↓
2. Create user with is_active=False
   ↓
3. Generate verification token
   ↓
4. Send email with verification link
   ↓
5. User clicks link → /auth/verify/:token
   ↓
6. Set user.is_active=True
   ↓
7. Redirect to login or auto-login
```

---

## OAuth (Future Enhancement)

Suporte futuro para:
- Google OAuth
- LinkedIn OAuth
- GitHub OAuth

```python
# Using django-allauth or similar
INSTALLED_APPS += [
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.linkedin_oauth2',
]
```
