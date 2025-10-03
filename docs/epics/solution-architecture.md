# Solution Architecture - TalentBase

## 1. Executive Summary

TalentBase is a recruitment SaaS platform connecting tech sales professionals (SDRs, AEs, CSMs) with companies. The architecture implements a **modular monolith** using Django REST Framework (backend) and Remix SSR (frontend) in a monorepo structure.

**Key Architectural Decisions:**
- **Pattern**: Modular monolith (7 Django apps) over microservices for rapid development
- **Stack**: Remix 2.5+ (TypeScript) + Django 5.0+ (Python) + PostgreSQL 15 + Redis 7.2
- **Deployment**: AWS ECS Fargate with GitHub Actions CI/CD
- **Auth**: Token-based (DRF) stored in httpOnly cookies, RBAC (admin/candidate/company)
- **Matching**: Manual admin-driven in MVP, AI automation post-MVP

**Performance Targets**: <3s page load, <200ms API latency, 1000 concurrent users, 99.5% uptime

---

## 2. Technology Stack and Decisions

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| **Frontend Framework** | Remix | 2.5+ | SSR for SEO, nested routing, progressive enhancement, form actions |
| **UI Library** | React | 18.2+ | Ecosystem, design system compatibility |
| **Language (FE)** | TypeScript | 5.3+ | Type safety, refactoring confidence |
| **Styling** | Tailwind CSS | 3.4+ | Rapid UI development, existing design system uses Tailwind |
| **Build Tool** | Vite | 5.0+ | Fast HMR, optimized bundling |
| **Design System** | @talentbase/design-system | 1.0+ | Pre-built components in Storybook |
| **Backend Framework** | Django | 5.0+ | Rapid development, batteries-included, robust ORM |
| **API Framework** | Django REST Framework | 3.14+ | Serialization, authentication, browsable API |
| **Language (BE)** | Python | 3.11+ | Type hints, performance improvements |
| **Database** | PostgreSQL | 15+ | JSONB support, full-text search, ACID compliance |
| **Cache + Queue Broker** | Redis | 7.2+ | Session store, Celery broker, application cache |
| **Task Queue** | Celery | 5.3+ | Async tasks (email, notifications, CSV imports) |
| **Container Runtime** | Docker | 24+ | Consistent environments, deployment |
| **Orchestration** | AWS ECS (Fargate) | - | Serverless containers, auto-scaling |
| **Database Hosting** | AWS RDS (PostgreSQL) | - | Managed backups, multi-AZ, read replicas |
| **Cache Hosting** | AWS ElastiCache (Redis) | - | Managed Redis, automatic failover |
| **Storage** | AWS S3 | - | Static assets, CSV imports (pre-signed URLs) |
| **CDN** | AWS CloudFront | - | Global content delivery, HTTPS |
| **CI/CD** | GitHub Actions | - | Automation, matrix builds, secrets management |
| **Monitoring** | Django Admin + CloudWatch | - | Admin panel for operations, logs/metrics in CloudWatch |
| **Testing (FE)** | Vitest + Testing Library | 1.2+ / 14+ | Fast unit tests, component testing |
| **Testing (BE)** | pytest + pytest-django | 8.0+ / 4.7+ | Fixtures, parametrization, DRF test client |
| **E2E Testing** | Playwright | 1.40+ | Cross-browser testing, visual regression |
| **Type Checking (BE)** | mypy | 1.8+ | Static type checking for Python |
| **Code Quality** | ESLint + Ruff | 8.56+ / 0.1+ | Linting for TS and Python |
| **Package Manager (FE)** | pnpm | 8.14+ | Fast, efficient, monorepo support |
| **Package Manager (BE)** | Poetry | 1.7+ | Dependency resolution, lockfile |
| **DNS + SSL** | Route 53 + ACM | - | Domain management, free SSL certificates |

---

## 3. Application Architecture

### 3.1 Architecture Pattern

**Modular Monolith** with clear domain boundaries:

```
apps/api/                       # Django Backend
├── authentication/             # User model, login, registration, permissions
├── candidates/                 # Candidate profiles, skills, experience, videos
├── companies/                  # Company profiles, job postings
├── jobs/                       # Job listings, filters, search
├── applications/               # Application workflow, status tracking
├── matching/                   # Manual matching logic (admin-driven)
├── core/                       # Shared utilities, base models, middleware
└── talentbase/                 # Django project settings, URLs, WSGI

packages/web/                   # Remix Frontend
├── app/
│   ├── routes/                 # File-based routing
│   │   ├── _index.tsx          # Landing page
│   │   ├── auth.login.tsx      # Login
│   │   ├── auth.register.tsx   # Registration (candidate/company)
│   │   ├── admin/              # Admin dashboard
│   │   ├── candidate/          # Candidate dashboard
│   │   ├── company/            # Company dashboard
│   │   └── profile.$token.tsx  # Public shareable profile
│   ├── components/             # App-specific components
│   ├── services/               # API client, auth helpers
│   ├── hooks/                  # Custom React hooks
│   └── utils/                  # Shared utilities
└── public/                     # Static assets

packages/design-system/         # Shared UI Components
├── src/components/             # Button, Input, Select, Card, etc.
└── .storybook/                 # Component documentation
```

### 3.2 Frontend Architecture (Remix SSR)

**Rendering Strategy:**
- **SSR (Server-Side Rendering)**: All routes render on server for SEO and fast FCP
- **Client Hydration**: React takes over after initial load for interactivity
- **Progressive Enhancement**: Forms work without JS (Remix form actions)

**Data Flow:**
1. **Loader Functions**: Fetch data server-side, pass to components as props
2. **Action Functions**: Handle form submissions, mutations, redirects
3. **API Client**: Services layer wraps fetch calls to Django REST API
4. **Cookie-Based Auth**: httpOnly cookie sent with every request

**Example Route Structure:**
```typescript
// packages/web/app/routes/candidate.dashboard.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request, 'candidate'); // Check cookie
  const profile = await api.candidates.getProfile(user.id);
  return json({ user, profile });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await api.candidates.updateProfile(formData);
  return redirect('/candidate/dashboard');
}

export default function CandidateDashboard() {
  const { user, profile } = useLoaderData<typeof loader>();
  return <DashboardLayout user={user}>...</DashboardLayout>;
}
```

### 3.3 Backend Architecture (Django REST)

**Django Apps (Domain-Driven):**

1. **authentication**: Custom User model (email login, roles: admin/candidate/company), DRF Token, permissions
2. **candidates**: CandidateProfile, Skill, Experience, Education models; CSV import; search/filter
3. **companies**: CompanyProfile, contact info, admin can create
4. **jobs**: JobPosting, requirements (position, cycle, ticket, tech stack), filters
5. **applications**: Application workflow, status (pending/accepted/rejected), admin matching
6. **matching**: Manual matching logic, compatibility scoring (future AI hook)
7. **core**: BaseModel (UUID PK, timestamps), custom middleware, utilities

**API Design Principles:**
- RESTful resources (`/api/candidates/`, `/api/jobs/{id}/`)
- Token authentication in `Authorization: Token <token>` header
- Pagination (100 items/page), filtering, ordering via query params
- Versioning: `/api/v1/` prefix (future-proof)

---

## 4. Data Architecture

### 4.1 Database Schema

**Core Models:**

```python
# authentication/models.py
class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    email = models.EmailField(unique=True)
    role = models.CharField(choices=[('admin', 'Admin'), ('candidate', 'Candidate'), ('company', 'Company')])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

# candidates/models.py
class CandidateProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    linkedin = models.URLField()
    video_url = models.URLField(blank=True)  # YouTube URL
    current_position = models.CharField(choices=[('SDR/BDR', 'SDR/BDR'), ('AE/Closer', 'AE/Closer'), ('CSM', 'CSM')])
    sales_cycle = models.CharField(max_length=50, blank=True)  # Ex: "30-60 dias"
    avg_ticket = models.CharField(max_length=50, blank=True)  # Ex: "R$ 10k-50k MRR"
    top_skills = models.JSONField(default=list)  # ["Outbound", "Negociação", "HubSpot"]
    is_public = models.BooleanField(default=False)
    public_token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Experience(models.Model):
    candidate = models.ForeignKey(CandidateProfile, related_name='experiences', on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    responsibilities = models.TextField()

# companies/models.py
class CompanyProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)  # Nullable if admin creates
    company_name = models.CharField(max_length=200)
    website = models.URLField()
    industry = models.CharField(max_length=100)
    size = models.CharField(choices=[('1-10', '1-10'), ('11-50', '11-50'), ('51-200', '51-200'), ('201+', '201+')])
    created_by_admin = models.BooleanField(default=False)

# jobs/models.py
class JobPosting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    company = models.ForeignKey(CompanyProfile, related_name='jobs', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    position_type = models.CharField(choices=[('SDR/BDR', 'SDR/BDR'), ('AE/Closer', 'AE/Closer'), ('CSM', 'CSM')])
    sales_cycle = models.CharField(max_length=50, blank=True)
    avg_ticket = models.CharField(max_length=50, blank=True)
    required_skills = models.JSONField(default=list)
    location = models.CharField(max_length=100)
    is_remote = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

# applications/models.py
class Application(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE)
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE)
    status = models.CharField(choices=[('pending', 'Pending'), ('matched', 'Matched'), ('rejected', 'Rejected')])
    matched_by_admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    matched_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 4.2 Data Migration Strategy

**Notion → PostgreSQL (CSV Import):**

1. **Export Notion databases** to CSV (candidates, companies, jobs)
2. **Celery task** (`import_candidates_csv`, `import_companies_csv`, `import_jobs_csv`)
3. **Django management command**: `python manage.py import_notion_data --file candidates.csv --type candidate`
4. **Validation**: Check for duplicates (email), normalize fields, create User accounts
5. **Progress tracking**: Admin UI shows import status, errors logged

---

## 5. API Design

### 5.1 REST Endpoints

**Authentication:**
```
POST   /api/v1/auth/register/          # Create user + profile (candidate or company)
POST   /api/v1/auth/login/             # Returns token
POST   /api/v1/auth/logout/            # Invalidate token
GET    /api/v1/auth/me/                # Current user info
```

**Candidates:**
```
GET    /api/v1/candidates/             # List candidates (admin only, with filters)
POST   /api/v1/candidates/             # Create candidate (admin or self-registration)
GET    /api/v1/candidates/{id}/        # Get candidate profile
PATCH  /api/v1/candidates/{id}/        # Update profile (owner or admin)
DELETE /api/v1/candidates/{id}/        # Delete profile (admin only)
GET    /api/v1/candidates/profile/{token}/  # Public profile (shareable link)
POST   /api/v1/candidates/import-csv/  # CSV import (admin only)
```

**Companies:**
```
GET    /api/v1/companies/              # List companies (admin + companies)
POST   /api/v1/companies/              # Create company (admin or self-registration)
GET    /api/v1/companies/{id}/         # Get company profile
PATCH  /api/v1/companies/{id}/         # Update profile (owner or admin)
```

**Jobs:**
```
GET    /api/v1/jobs/                   # List jobs (public, with filters)
POST   /api/v1/jobs/                   # Create job (company or admin)
GET    /api/v1/jobs/{id}/              # Get job details
PATCH  /api/v1/jobs/{id}/              # Update job (owner or admin)
DELETE /api/v1/jobs/{id}/              # Delete job (owner or admin)
```

**Applications:**
```
GET    /api/v1/applications/           # List applications (filtered by user role)
POST   /api/v1/applications/           # Create application (candidate)
PATCH  /api/v1/applications/{id}/      # Update status (admin only for matching)
```

**Matching (Admin):**
```
POST   /api/v1/matching/manual/        # Manual match: {job_id, candidate_id} → creates Application
GET    /api/v1/matching/suggestions/{job_id}/  # Get candidate suggestions for job (filtered by criteria)
```

### 5.2 Request/Response Examples

**POST /api/v1/auth/login/**
```json
// Request
{
  "email": "joao@example.com",
  "password": "senha123"
}

// Response
{
  "token": "dj39fj29fj2f9j2f9j2f9j2f9j2f",
  "user": {
    "id": "uuid-here",
    "email": "joao@example.com",
    "role": "candidate"
  }
}
```

**GET /api/v1/candidates/?position=SDR/BDR&sales_cycle=30-60%20dias**
```json
// Response
{
  "count": 15,
  "next": "/api/v1/candidates/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid-1",
      "full_name": "João Silva",
      "current_position": "SDR/BDR",
      "sales_cycle": "30-60 dias",
      "avg_ticket": "R$ 10k-50k MRR",
      "top_skills": ["Outbound", "HubSpot"],
      "video_url": "https://youtube.com/watch?v=xyz",
      "linkedin": "https://linkedin.com/in/joaosilva"
    }
  ]
}
```

---

## 6. Authentication and Authorization

### 6.1 Authentication Flow

**Token-Based Auth (DRF Token + httpOnly Cookie):**

1. **User logs in** → POST `/api/v1/auth/login/` with email/password
2. **Django validates credentials** → Generates DRF Token
3. **Backend returns token** in response body
4. **Remix action stores token** in httpOnly cookie (secure, sameSite=lax)
5. **Subsequent requests** include cookie → Django validates token
6. **Logout** → DELETE `/api/v1/auth/logout/` → Token deleted from DB and cookie cleared

**Cookie Configuration (Remix):**
```typescript
// packages/web/app/services/auth.server.ts
export async function createUserSession(token: string, redirectTo: string) {
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(
        await sessionStorage.getSession(),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        }
      ),
    },
  });
}
```

### 6.2 Authorization (RBAC)

**Roles:**
- **admin**: Full access, create/edit all resources, manual matching
- **candidate**: View/edit own profile, apply to jobs, view public jobs
- **company**: View/edit own profile, create jobs, view matched candidates

**Django Permissions (DRF):**
```python
# core/permissions.py
class IsAdminOrOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj.user == request.user

# candidates/views.py
class CandidateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminOrOwner]
```

**Remix Route Protection:**
```typescript
// packages/web/app/routes/admin.dashboard.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request, 'admin'); // Throws redirect if not admin
  // ...
}
```

---

## 7. State Management

**Server State (Primary):**
- **Remix loaders**: Fetch data server-side, pass to components
- **No client-side global state** (Redux, Zustand) needed for most features
- **Forms use Remix actions**: Server mutations, automatic revalidation

**Client State (Minimal):**
- **React useState**: Local UI state (modals, dropdowns, form inputs)
- **useOptimistic (future)**: Optimistic UI updates for better UX

**Data Fetching Pattern:**
```typescript
// Server-side loader
export async function loader({ request, params }: LoaderFunctionArgs) {
  const candidate = await api.candidates.get(params.id);
  return json({ candidate });
}

// Component uses loader data
export default function CandidateProfile() {
  const { candidate } = useLoaderData<typeof loader>();
  return <ProfileCard candidate={candidate} />;
}
```

---

## 8. Component Architecture

### 8.1 Design System Integration

**@talentbase/design-system** (existing Storybook components):
- **Atomic components**: Button, Input, Select, Checkbox, Radio, Textarea
- **Layout components**: Card, Container, Grid
- **Tailwind CSS**: Pre-configured theme, color palette, spacing scale

**Usage in Remix:**
```typescript
import { Button, Input, Card } from '@talentbase/design-system';

export default function LoginForm() {
  return (
    <Card>
      <Form method="post">
        <Input name="email" label="Email" type="email" required />
        <Input name="password" label="Senha" type="password" required />
        <Button type="submit">Entrar</Button>
      </Form>
    </Card>
  );
}
```

### 8.2 Component Organization

**Shared Components (Design System):**
- `packages/design-system/src/components/`

**App-Specific Components:**
```
packages/web/app/components/
├── layouts/
│   ├── DashboardLayout.tsx      # Shared dashboard shell (sidebar, header)
│   ├── PublicLayout.tsx         # Landing page, public profiles
├── candidate/
│   ├── ProfileForm.tsx          # Candidate profile editing
│   ├── ExperienceList.tsx       # Experience timeline
│   ├── VideoPlayer.tsx          # Embedded YouTube player
├── company/
│   ├── JobPostingForm.tsx       # Job creation form
│   ├── CandidateCard.tsx        # Candidate preview in matching UI
├── admin/
│   ├── MatchingInterface.tsx    # Drag-and-drop matching UI
│   ├── CSVImportModal.tsx       # CSV upload modal
```

---

## 9. Cross-Cutting Concerns

### 9.1 Error Handling

**Backend (Django):**
- **DRF Exception Handler**: Returns JSON errors with status codes
- **Validation Errors**: 400 Bad Request with field-specific errors
- **Auth Errors**: 401 Unauthorized, 403 Forbidden
- **Server Errors**: 500 Internal Server Error (logged to CloudWatch)

**Frontend (Remix):**
- **ErrorBoundary**: Catch render errors, show fallback UI
- **CatchBoundary**: Handle HTTP errors (404, 500), custom error pages
- **Form Errors**: Display validation errors from action responses

```typescript
// packages/web/app/routes/candidate.profile.tsx
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div>
      <h1>Erro ao carregar perfil</h1>
      <p>{error.message}</p>
    </div>
  );
}
```

### 9.2 Logging and Monitoring

**Backend:**
- **Django Logging**: Console (dev), CloudWatch (prod)
- **Request Logging**: Middleware logs all API requests with timing
- **Error Tracking**: Django errors sent to CloudWatch Logs

**Frontend:**
- **Browser Errors**: Caught by ErrorBoundary, sent to backend `/api/v1/logs/frontend/`
- **Performance**: Web Vitals (LCP, FID, CLS) tracked via RUM

**Metrics (CloudWatch):**
- API latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- ECS CPU/memory usage
- RDS connections, query time

### 9.3 Performance Optimization

**Frontend:**
- **SSR**: Fast FCP, SEO-friendly
- **Code Splitting**: Remix auto-splits routes
- **Asset Optimization**: Images via CloudFront CDN, lazy loading
- **Prefetching**: `<Link prefetch="intent">` for instant navigation

**Backend:**
- **Database Indexing**: Indexes on `email`, `public_token`, `position_type`, `is_active`
- **Query Optimization**: `select_related`, `prefetch_related` to avoid N+1 queries
- **Redis Caching**: Cache candidate lists (TTL 5min), job listings (TTL 10min)
- **Pagination**: Limit to 100 items per page

**Example Optimized Query:**
```python
# candidates/views.py
def get_queryset(self):
    return CandidateProfile.objects.select_related('user') \
        .prefetch_related('experiences', 'skills') \
        .filter(is_public=True)
```

### 9.4 Security

**Application Security:**
- **HTTPS Only**: Enforced via CloudFront + ACM
- **CSRF Protection**: Django CSRF middleware, Remix forms include token
- **XSS Protection**: React escapes by default, YouTube embeds via iframe sandbox
- **SQL Injection**: Django ORM parameterized queries
- **Secret Management**: AWS Secrets Manager (DB password, API keys)

**API Security:**
- **Rate Limiting**: DRF throttling (100 req/min per user)
- **CORS**: Whitelist frontend domain only
- **Input Validation**: DRF serializers validate all inputs
- **File Upload**: CSV files validated (max 10MB, CSV only), S3 pre-signed URLs

**Data Security:**
- **Encryption at Rest**: RDS encrypted, S3 encrypted
- **Encryption in Transit**: TLS 1.3
- **PII Protection**: Candidate phone/email visible only to admin/owner

---

## 10. Deployment Architecture

### 10.1 Infrastructure (AWS)

```
┌─────────────────────────────────────────────────────────┐
│                      CloudFront (CDN)                   │
│                  salesdog.click                         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Application Load Balancer              │
│         (HTTPS termination, health checks)              │
└─────────────────────────────────────────────────────────┘
           │                                  │
           ▼                                  ▼
  ┌──────────────────┐              ┌──────────────────┐
  │  ECS Fargate     │              │  ECS Fargate     │
  │  (Remix SSR)     │              │  (Django API)    │
  │  packages/web    │              │  apps/api        │
  │  Port 3000       │              │  Port 8000       │
  └──────────────────┘              └──────────────────┘
           │                                  │
           └──────────────┬───────────────────┘
                          ▼
            ┌──────────────────────────┐
            │  RDS PostgreSQL (15)     │
            │  Multi-AZ, Encrypted     │
            └──────────────────────────┘
                          │
            ┌──────────────────────────┐
            │  ElastiCache (Redis 7)   │
            │  Sessions + Celery       │
            └──────────────────────────┘
                          │
            ┌──────────────────────────┐
            │  S3 Bucket               │
            │  CSV imports, assets     │
            └──────────────────────────┘
```

**ECS Services:**
1. **talentbase-web** (Remix): 2 tasks (min), 10 tasks (max), CPU 512, Memory 1GB
2. **talentbase-api** (Django): 2 tasks (min), 20 tasks (max), CPU 1024, Memory 2GB
3. **talentbase-worker** (Celery): 1 task (min), 5 tasks (max), CPU 512, Memory 1GB

**Auto-Scaling:**
- **CPU Threshold**: Scale up at 70% CPU, scale down at 30%
- **Request Count**: Scale up at 1000 req/min per task

### 10.2 CI/CD Pipeline (GitHub Actions)

**Workflow: `.github/workflows/deploy.yml`**

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches:
      - master    # Production deploy
      - develop   # Development deploy

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Backend Tests
        run: |
          cd apps/api
          poetry install
          poetry run pytest --cov=. --cov-report=xml
      - name: Run Frontend Tests
        run: |
          cd packages/web
          pnpm install
          pnpm test
      - name: E2E Tests
        run: pnpm playwright test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker Images
        run: |
          docker build -t talentbase-api:${{ github.sha }} apps/api
          docker build -t talentbase-web:${{ github.sha }} packages/web
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin
          docker push talentbase-api:${{ github.sha }}
          docker push talentbase-web:${{ github.sha }}
      - name: Deploy to ECS
        run: |
          # Determine cluster based on branch
          if [ "${{ github.ref }}" == "refs/heads/master" ]; then
            CLUSTER="talentbase-prod"
          else
            CLUSTER="talentbase-dev"
          fi

          aws ecs update-service --cluster $CLUSTER --service talentbase-api --force-new-deployment
          aws ecs update-service --cluster $CLUSTER --service talentbase-web --force-new-deployment
```

**Deployment Steps:**
1. **Commit to `main`** → Triggers GitHub Actions
2. **Run Tests** (pytest, Vitest, Playwright)
3. **Build Docker Images** (api, web, worker)
4. **Push to ECR** (Elastic Container Registry)
5. **Update ECS Services** (rolling deployment, zero downtime)
6. **Health Checks** (ALB checks `/health` endpoint)

**Environments:**

| Environment | Branch | URLs | ECS Cluster | Database |
|-------------|--------|------|-------------|----------|
| **Development** | `develop` | `dev.salesdog.click` (web)<br>`api-dev.salesdog.click` (api) | `talentbase-dev` | RDS Dev instance |
| **Production** | `master` | `www.salesdog.click` (web)<br>`api.salesdog.click` (api) | `talentbase-prod` | RDS Prod (Multi-AZ) |

**Route 53 DNS Configuration:**
- `www.salesdog.click` → ALB Production (Frontend)
- `api.salesdog.click` → ALB Production (Backend)
- `dev.salesdog.click` → ALB Development (Frontend)
- `api-dev.salesdog.click` → ALB Development (Backend)

### 10.3 Environment Configuration

**Secrets (AWS Secrets Manager):**
```json
{
  "DJANGO_SECRET_KEY": "...",
  "DATABASE_URL": "postgresql://user:pass@rds-endpoint/talentbase",
  "REDIS_URL": "redis://elasticache-endpoint:6379",
  "AWS_ACCESS_KEY_ID": "...",
  "AWS_SECRET_ACCESS_KEY": "..."
}
```

**Environment Variables (ECS Task Definition):**

**Production (master branch):**
```json
{
  "environment": [
    {"name": "DJANGO_SETTINGS_MODULE", "value": "talentbase.settings.production"},
    {"name": "ALLOWED_HOSTS", "value": "api.salesdog.click"},
    {"name": "CORS_ALLOWED_ORIGINS", "value": "https://www.salesdog.click"},
    {"name": "FRONTEND_URL", "value": "https://www.salesdog.click"}
  ],
  "secrets": [
    {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:talentbase/prod/db"},
    {"name": "DJANGO_SECRET_KEY", "valueFrom": "arn:aws:secretsmanager:talentbase/prod/secret"}
  ]
}
```

**Development (develop branch):**
```json
{
  "environment": [
    {"name": "DJANGO_SETTINGS_MODULE", "value": "talentbase.settings.development"},
    {"name": "ALLOWED_HOSTS", "value": "api-dev.salesdog.click"},
    {"name": "CORS_ALLOWED_ORIGINS", "value": "https://dev.salesdog.click"},
    {"name": "FRONTEND_URL", "value": "https://dev.salesdog.click"}
  ],
  "secrets": [
    {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:talentbase/dev/db"},
    {"name": "DJANGO_SECRET_KEY", "valueFrom": "arn:aws:secretsmanager:talentbase/dev/secret"}
  ]
}
```

---

## 11. Testing Strategy

### 11.1 Backend Testing (Django + pytest)

**Unit Tests:**
```python
# apps/api/candidates/tests/test_models.py
import pytest
from candidates.models import CandidateProfile

@pytest.mark.django_db
def test_candidate_profile_creation(candidate_user):
    profile = CandidateProfile.objects.create(
        user=candidate_user,
        full_name="João Silva",
        current_position="SDR/BDR"
    )
    assert profile.public_token is not None
    assert str(profile.id) in str(profile.public_token)
```

**API Tests:**
```python
# apps/api/candidates/tests/test_api.py
import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_candidate_list_requires_auth(api_client):
    response = api_client.get('/api/v1/candidates/')
    assert response.status_code == 401

@pytest.mark.django_db
def test_admin_can_create_candidate(admin_client):
    response = admin_client.post('/api/v1/candidates/', {
        'full_name': 'Maria Santos',
        'email': 'maria@example.com',
        'current_position': 'AE/Closer'
    })
    assert response.status_code == 201
    assert response.data['full_name'] == 'Maria Santos'
```

**Coverage Target**: 80% line coverage

### 11.2 Frontend Testing (Vitest + Testing Library)

**Component Tests:**
```typescript
// packages/web/app/components/candidate/ProfileForm.test.tsx
import { render, screen } from '@testing-library/react';
import { ProfileForm } from './ProfileForm';

describe('ProfileForm', () => {
  it('renders all required fields', () => {
    render(<ProfileForm candidate={mockCandidate} />);
    expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Posição Atual')).toBeInTheDocument();
  });

  it('validates YouTube URL format', async () => {
    const { user } = render(<ProfileForm candidate={mockCandidate} />);
    const videoInput = screen.getByLabelText('Vídeo de Apresentação (YouTube)');
    await user.type(videoInput, 'invalid-url');
    await user.click(screen.getByText('Salvar'));
    expect(screen.getByText('URL do YouTube inválida')).toBeInTheDocument();
  });
});
```

**Coverage Target**: 70% line coverage

### 11.3 E2E Testing (Playwright)

**Critical Flows:**
```typescript
// packages/web/tests/e2e/candidate-registration.spec.ts
import { test, expect } from '@playwright/test';

test('candidate can register and create profile', async ({ page }) => {
  await page.goto('/auth/register');
  await page.getByLabel('Email').fill('joao@example.com');
  await page.getByLabel('Senha').fill('senha123');
  await page.getByLabel('Tipo de Conta').selectOption('candidate');
  await page.getByRole('button', { name: 'Criar Conta' }).click();

  // Should redirect to profile setup
  await expect(page).toHaveURL('/candidate/onboarding');
  await page.getByLabel('Nome Completo').fill('João Silva');
  await page.getByLabel('Posição Atual').selectOption('SDR/BDR');
  await page.getByRole('button', { name: 'Concluir' }).click();

  // Should redirect to dashboard
  await expect(page).toHaveURL('/candidate/dashboard');
  await expect(page.getByText('Bem-vindo, João Silva')).toBeVisible();
});
```

**Test Scenarios:**
- Candidate registration → profile setup → dashboard
- Company registration → job posting → candidate search
- Admin login → candidate import CSV → manual matching
- Public profile share (anonymous access)

---

## 12. Implementation Guidance

### 12.1 Development Workflow

**Local Development:**
```bash
# 1. Start infrastructure
docker-compose up -d postgres redis

# 2. Run Django API
cd apps/api
poetry install
poetry run python manage.py migrate
poetry run python manage.py runserver 0.0.0.0:8000

# 3. Run Remix Web (separate terminal)
cd packages/web
pnpm install
pnpm dev  # Runs on port 3000

# 4. Run Celery Worker (separate terminal)
cd apps/api
poetry run celery -A talentbase worker -l info
```

**Environment Setup:**
- `.env.local` for local development (DATABASE_URL, REDIS_URL)
- `.env.test` for test environment (SQLite, mock Redis)

### 12.2 Code Organization Best Practices

**Django (apps/api):**
- **Thin views**: Business logic in services/managers
- **Serializers for validation**: All input validation in DRF serializers
- **Custom permissions**: Reusable permission classes in `core/permissions.py`
- **Signals for side effects**: Email notifications, Celery tasks triggered via signals

**Remix (packages/web):**
- **Loaders fetch data**: No `useEffect` for data fetching
- **Actions handle mutations**: All form submissions via Remix actions
- **Services for API calls**: Centralize API client in `services/api.ts`
- **Type safety**: Generate types from Django serializers (future: use OpenAPI)

### 12.3 Database Migrations

**Django Migrations:**
```bash
# Create migration after model changes
poetry run python manage.py makemigrations

# Review migration file (apps/api/candidates/migrations/0002_add_video_url.py)
# Apply migration
poetry run python manage.py migrate

# Production: Run migrations in ECS task before deployment
aws ecs run-task --task-definition talentbase-migrate --cluster talentbase-prod
```

**Migration Strategy:**
- **Additive changes first**: Add nullable fields, then backfill, then make non-nullable
- **Zero-downtime**: Never drop columns in same deployment as code that uses them

---

## 13. Architecture Decision Records (ADRs)

### ADR-001: Modular Monolith over Microservices

**Status**: Accepted

**Context**: Need to choose between microservices, modular monolith, or traditional monolith for TalentBase.

**Decision**: Use modular monolith with clear domain boundaries (Django apps).

**Rationale**:
- **Team size**: Small team (1-3 devs), microservices add operational complexity
- **Development speed**: Monolith faster to develop, single codebase, shared code easy
- **Deployment**: Simpler CI/CD, single ECS service, no service mesh
- **Future-proof**: Can extract to microservices later if needed (matching service → separate API)

**Consequences**:
- ✅ Faster development, simpler deployment, lower infra cost
- ✅ Easier debugging, single database transaction scope
- ❌ Entire app scales together (acceptable for MVP, optimize later)

---

### ADR-002: Remix SSR over SPA (Next.js/React)

**Status**: Accepted

**Context**: Need to choose frontend framework. Requirements: SEO (public profiles), fast initial load, forms work without JS.

**Decision**: Use Remix (SSR) instead of SPA or Next.js.

**Rationale**:
- **SEO**: SSR renders public profiles server-side, Google indexes content
- **Performance**: SSR delivers HTML fast (FCP <1s), React hydrates for interactivity
- **Progressive Enhancement**: Forms work without JS (Remix actions), resilient UX
- **Developer Experience**: Remix loaders/actions simpler than Next.js getServerSideProps, better TypeScript support

**Consequences**:
- ✅ Better SEO, faster FCP, resilient forms
- ✅ Simpler data fetching (loaders), no client-side state management needed
- ❌ Learning curve for team (Remix newer than Next.js)

---

### ADR-003: Token Auth in httpOnly Cookie

**Status**: Accepted

**Context**: Need secure authentication between Remix (frontend) and Django (backend). Options: JWT in localStorage, session cookies, token in httpOnly cookie.

**Decision**: DRF Token stored in httpOnly cookie, sent with every request.

**Rationale**:
- **Security**: httpOnly prevents XSS attacks (JS can't read cookie)
- **Stateless**: Token stored in DB, no session state in backend
- **Simplicity**: Remix automatically sends cookie, no manual Authorization header
- **CSRF**: Django CSRF middleware protects against CSRF (token in form)

**Consequences**:
- ✅ Secure (XSS protection), simple (no manual headers), stateless
- ❌ CORS setup required (whitelist frontend domain)

---

### ADR-004: PostgreSQL JSONB for Skills/Requirements

**Status**: Accepted

**Context**: Candidate skills and job requirements are flexible lists (not predefined). Options: EAV pattern, separate Skills table, JSONB column.

**Decision**: Use PostgreSQL JSONB column for `top_skills` and `required_skills`.

**Rationale**:
- **Flexibility**: Skills vary per candidate/job, no fixed schema
- **Performance**: JSONB indexed, fast queries (`@>` operator for containment)
- **Simplicity**: No complex joins, single query to fetch candidate with skills
- **DRF support**: JSONField serializes/deserializes automatically

**Consequences**:
- ✅ Flexible schema, fast queries, simple ORM usage
- ❌ No referential integrity (skills are strings, not FK to Skills table)
- ❌ Future: If need skill taxonomy, migrate to M2M table

---

### ADR-005: Manual Matching in MVP, AI Post-MVP

**Status**: Accepted

**Context**: Need to match candidates to jobs. Options: AI/ML scoring from start, rule-based matching, manual admin-driven.

**Decision**: MVP uses manual admin-driven matching, AI automation in future iteration.

**Rationale**:
- **Time to market**: Manual matching ships faster, no ML model training
- **Quality**: Human judgment better in early stage (small dataset, nuanced matches)
- **Data collection**: Manual process generates training data for future AI model
- **MVP validation**: Prove business model before investing in AI

**Consequences**:
- ✅ Fast MVP delivery, high-quality initial matches, training data collection
- ✅ Architect for future AI (matching logic isolated in `matching` app)
- ❌ Manual work doesn't scale (acceptable for MVP with <100 candidates)

---

## 14. Epic-to-Component Mapping

### Epic Readiness Matrix

| Epic | Django Apps | Remix Routes | External Services | Complexity | Dependencies |
|------|-------------|--------------|-------------------|------------|--------------|
| **Epic 1: Foundation** | core, authentication | \_index, auth.* | AWS (S3, CloudFront) | Low | None |
| **Epic 2: Auth & User Mgmt** | authentication | auth.*, admin.users | - | Medium | Epic 1 |
| **Epic 3: Candidate Mgmt** | candidates | candidate.*, profile.$token | S3 (CSV), YouTube (embed) | High | Epic 2 |
| **Epic 4: Company & Jobs** | companies, jobs | company.*, jobs.* | - | Medium | Epic 2 |
| **Epic 5: Matching** | applications, matching | admin.matching.* | - | High | Epic 3, Epic 4 |

### Component Dependencies

**Epic 1 → Epic 2:**
- Django project settings, base models (core) must exist before authentication

**Epic 2 → Epic 3/4:**
- User model with roles (admin/candidate/company) required for candidate/company profiles

**Epic 3 + Epic 4 → Epic 5:**
- Candidate profiles and job postings must exist before creating applications and matching

### Integration Points

1. **Remix ↔ Django API**: All routes call `/api/v1/*` endpoints, token in cookie
2. **Design System ↔ Remix**: Import components from `@talentbase/design-system`
3. **YouTube ↔ Public Profiles**: Embed `https://youtube.com/embed/{video_id}` in iframe
4. **Notion CSV ↔ Django**: Celery task imports CSV from S3, creates CandidateProfile/CompanyProfile
5. **Celery ↔ Redis**: Task queue for async jobs (email, CSV import)

---

## 15. Next Steps

### Immediate Actions (Post-Architecture Approval)

1. **Run Cohesion Check** ✅
   - Validate architecture against PRD requirements
   - Generate epic alignment matrix

2. **Generate Tech Specs per Epic** 📝
   - `tech-spec-epic-1.md` → Foundation & Public Presence
   - `tech-spec-epic-2.md` → Authentication & User Management
   - `tech-spec-epic-3.md` → Candidate Management System
   - `tech-spec-epic-4.md` → Company & Job Management
   - `tech-spec-epic-5.md` → Matching & Analytics

3. **Infrastructure Setup** 🔧
   - Initialize monorepo structure (`pnpm init`, `poetry init`)
   - Configure AWS (ECS cluster, RDS, ElastiCache, S3 buckets)
   - Set up GitHub Actions workflows

4. **Sprint Planning** 📅
   - Break epics into 2-week sprints
   - Assign stories to developers
   - Set up project board (GitHub Projects)

### Long-Term Roadmap (Post-MVP)

- **AI Matching**: Train ML model on manual matching data, automate suggestions
- **WhatsApp Integration**: Candidate notifications via WhatsApp Business API
- **Video Interviews**: Integrate Whereby/Zoom for in-platform interviews
- **Advanced Analytics**: Company dashboards (funnel metrics, time-to-hire)
- **Mobile App**: React Native app for candidates (apply on mobile)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-01
**Author**: BMad Master (AI Architecture Agent)
**Approved By**: [Pending Stakeholder Review]
