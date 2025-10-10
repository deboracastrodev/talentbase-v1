# Best Practices Review - Épicos 4 & 5

**Documento:** Revisão de Boas Práticas
**Épicos:** Epic 4 (Company & Job Management) & Epic 5 (Matching & Analytics)
**Data:** 2025-10-10
**Autor:** BMad Master + Claude Code
**Status:** 🔍 Review & Recommendations

---

## 📋 Executive Summary

Esta revisão identifica **hardcoded values**, **má configuração de rotas**, **falta de type safety** e outras violações de boas práticas nos Épicos 4 e 5, baseado nas implementações já realizadas nos Épicos 1-3.

---

## 🎯 Boas Práticas Implementadas (Épicos 1-3)

### ✅ **1. Rotas Centralizadas** (`config/routes.ts`)
```tsx
// ❌ EVITAR
<Link to="/admin/users?status=pending" />

// ✅ USAR
import { QUICK_ROUTES } from '~/config/routes';
<Link to={QUICK_ROUTES.pendingCompanyApprovals} />
```

### ✅ **2. Variáveis de Ambiente Centralizadas** (`config/api.ts`)
```tsx
// ❌ EVITAR
const apiUrl = 'http://localhost:8000';

// ✅ USAR
import { getApiBaseUrl, getAppBaseUrl } from '~/config/api';
const apiUrl = getApiBaseUrl();
```

### ✅ **3. Autenticação JWT** (`/api/v1/auth/me`)
```tsx
// ✅ Sempre validar JWT
const userData = await getUserFromToken(token);
```

### ✅ **4. Type Safety**
```tsx
// ✅ Tipos explícitos
export interface JobPosting {
  id: string;
  title: string;
  // ...
}
```

---

## 🚨 Problemas Identificados nos Épicos 4 & 5

### **Epic 4 - Company & Job Management**

#### **❌ PROBLEMA 1: Hardcoded Share URLs**

**Localização:** `tech-spec-epic-4.md` - Story 4.3, linha 237

```python
# ❌ RUIM - Hardcoded
share_url = f"https://www.salesdog.click/share/job/{job.public_token}"
```

**Impacto:**
- Quebra em ambientes dev/staging
- Impossível testar localmente
- Deploy manual necessário para mudar URL

**✅ SOLUÇÃO:**
```python
from django.conf import settings

share_url = f"{settings.APP_BASE_URL}/share/job/{job.public_token}"
```

**Configuração necessária:**
```python
# apps/api/talentbase/settings/base.py
APP_BASE_URL = env.str('APP_BASE_URL', default='http://localhost:3000')
```

```bash
# .env (development)
APP_BASE_URL=http://localhost:3000

# .env.production
APP_BASE_URL=https://www.salesdog.click

# .env.staging
APP_BASE_URL=https://dev.salesdog.click
```

---

#### **❌ PROBLEMA 2: Rotas Hardcoded no Frontend**

**Localização:** `tech-spec-epic-4.md` - Story 4.2, linha 214

```tsx
// ❌ RUIM
return redirect(`/company/jobs/${response.data.id}`);
```

**Localização:** Story 4.3, linha 307

```tsx
// ❌ RUIM
<a href={`/apply/${job.public_token}`}>
  <Button size="lg">Candidatar-se a esta Vaga</Button>
</a>
```

**✅ SOLUÇÃO:**

Adicionar ao `config/routes.ts`:

```typescript
export const ROUTES = {
  // ... existing routes

  company: {
    dashboard: '/company/dashboard',
    profile: '/company/profile',
    jobs: '/company/jobs',
    jobDetail: (id: string) => `/company/jobs/${id}`,
    jobNew: '/company/jobs/new',
    applications: '/company/applications',
  },

  apply: {
    job: (token: string) => `/apply/${token}`,
  },

  share: {
    candidate: (token: string) => `/share/candidate/${token}`,
    job: (token: string) => `/share/job/${token}`, // ✅ ADICIONAR
  },
} as const;
```

**Usar:**
```tsx
import { ROUTES } from '~/config/routes';

// ✅ BOM
return redirect(ROUTES.company.jobDetail(response.data.id));

// ✅ BOM
<Link to={ROUTES.apply.job(job.public_token)}>
  <Button size="lg">Candidatar-se a esta Vaga</Button>
</Link>
```

---

#### **❌ PROBLEMA 3: Falta de Type Safety em Query Parameters**

**Localização:** Story 4.4, linha 343-370

```python
# ❌ Sem validação de tipos
position = self.request.query_params.getlist('position')
tools = self.request.query_params.getlist('tools')
```

**✅ SOLUÇÃO:**

Usar Django REST Framework Serializers:

```python
# apps/api/candidates/serializers.py
from rest_framework import serializers

class CandidateSearchSerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True)
    position = serializers.MultipleChoiceField(
        choices=['SDR/BDR', 'AE/Closer', 'CSM'],
        required=False
    )
    tools = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    solutions = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    departments = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    location = serializers.CharField(required=False, allow_blank=True)
    page = serializers.IntegerField(default=1, min_value=1)
    page_size = serializers.IntegerField(default=20, min_value=1, max_value=100)

# apps/api/candidates/views.py
def get_queryset(self):
    serializer = CandidateSearchSerializer(data=self.request.query_params)
    serializer.is_valid(raise_exception=True)
    filters = serializer.validated_data

    queryset = CandidateProfile.objects.filter(is_active=True)

    if filters.get('search'):
        queryset = queryset.filter(
            Q(full_name__icontains=filters['search']) |
            Q(bio__icontains=filters['search'])
        )
    # ... resto dos filtros
```

---

#### **❌ PROBLEMA 4: Route Builder Ausente para Company Candidates Search**

**Localização:** Story 4.4

**✅ SOLUÇÃO:**

Adicionar ao `config/routes.ts`:

```typescript
/**
 * Company Candidate Search Route Builder
 */
export function buildCompanyCandidatesRoute(params?: {
  position?: string[];
  tools?: string[];
  solutions?: string[];
  departments?: string[];
  location?: string;
  page?: number;
}): string {
  if (!params) {
    return ROUTES.company.candidates;
  }

  const searchParams = new URLSearchParams();

  if (params.position && params.position.length > 0) {
    params.position.forEach(p => searchParams.append('position', p));
  }

  if (params.tools && params.tools.length > 0) {
    params.tools.forEach(t => searchParams.append('tools', t));
  }

  if (params.solutions && params.solutions.length > 0) {
    params.solutions.forEach(s => searchParams.append('solutions', s));
  }

  if (params.departments && params.departments.length > 0) {
    params.departments.forEach(d => searchParams.append('departments', d));
  }

  if (params.location) {
    searchParams.set('location', params.location);
  }

  if (params.page && params.page > 1) {
    searchParams.set('page', params.page.toString());
  }

  const query = searchParams.toString();
  return query ? `${ROUTES.company.candidates}?${query}` : ROUTES.company.candidates;
}
```

**Uso:**
```tsx
const route = buildCompanyCandidatesRoute({
  position: ['SDR/BDR'],
  tools: ['Salesforce', 'HubSpot'],
  page: 2
});
// => '/company/candidates?position=SDR%2FBDR&tools=Salesforce&tools=HubSpot&page=2'
```

---

### **Epic 5 - Matching & Analytics**

#### **❌ PROBLEMA 5: Hardcoded API Calls sem Abstração**

**Localização:** `tech-spec-epic-5.md` - Story 5.1, linha 222-223

```tsx
// ❌ RUIM - Hardcoded endpoint
const response = await api.get(`/matching/suggestions?job_id=${jobId}`);
await api.post('/matching/matches', { job_id, candidate_id });
```

**✅ SOLUÇÃO:**

Criar API client centralizado:

```typescript
// packages/web/app/lib/api/matching.ts
import { getApiBaseUrl } from '~/config/api';

export interface MatchSuggestion {
  candidate: CandidateProfile;
  match_score: number;
}

export interface CreateMatchRequest {
  job_id: string;
  candidate_id: string;
}

export interface Match {
  id: string;
  job: JobPosting;
  candidate: CandidateProfile;
  match_score: number;
  status: 'matched' | 'contacted' | 'interview_scheduled' | 'hired' | 'rejected';
  created_at: string;
}

/**
 * Get match suggestions for a job
 */
export async function getMatchSuggestions(
  token: string,
  jobId: string
): Promise<MatchSuggestion[]> {
  const apiUrl = getApiBaseUrl();
  const response = await fetch(
    `${apiUrl}/api/v1/matching/suggestions?job_id=${jobId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch match suggestions');
  }

  const data = await response.json();
  return data.suggestions;
}

/**
 * Create a match between job and candidate
 */
export async function createMatch(
  token: string,
  data: CreateMatchRequest
): Promise<Match> {
  const apiUrl = getApiBaseUrl();
  const response = await fetch(
    `${apiUrl}/api/v1/matching/matches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create match');
  }

  return response.json();
}

/**
 * Get all matches (admin view)
 */
export async function getMatches(
  token: string,
  filters?: {
    status?: string;
    job_id?: string;
    page?: number;
  }
): Promise<{ matches: Match[]; total: number }> {
  const apiUrl = getApiBaseUrl();
  const searchParams = new URLSearchParams();

  if (filters?.status) searchParams.set('status', filters.status);
  if (filters?.job_id) searchParams.set('job_id', filters.job_id);
  if (filters?.page) searchParams.set('page', filters.page.toString());

  const query = searchParams.toString();
  const url = query
    ? `${apiUrl}/api/v1/matching/matches?${query}`
    : `${apiUrl}/api/v1/matching/matches`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }

  return response.json();
}
```

**Uso no route:**
```tsx
import { getMatchSuggestions, createMatch } from '~/lib/api/matching';
import { requireAdmin } from '~/utils/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  const { token } = await requireAdmin(request);
  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'get_suggestions') {
    const jobId = formData.get('job_id') as string;
    const suggestions = await getMatchSuggestions(token, jobId);
    return json({ suggestions });
  }

  if (action === 'create_match') {
    const match = await createMatch(token, {
      job_id: formData.get('job_id') as string,
      candidate_id: formData.get('candidate_id') as string,
    });
    return json({ success: true, match });
  }

  return json({});
}
```

---

#### **❌ PROBLEMA 6: Falta de Validação de Permissions**

**Localização:** Story 5.1, linha 209-210

```tsx
// ❌ Incompleto - apenas verifica auth, não role
await requireAuth(request, 'admin');
```

**✅ SOLUÇÃO:**

Já implementado em `utils/auth.server.ts`! Apenas garantir uso consistente:

```tsx
// ✅ BOM - valida role automaticamente
const { token, user } = await requireAdmin(request);
```

---

#### **❌ PROBLEMA 7: Alert Hardcoded**

**Localização:** Story 5.1, linha 263

```tsx
// ❌ RUIM
alert('Match criado com sucesso!');
```

**✅ SOLUÇÃO:**

Usar Toast notification do design system:

```tsx
import { useToast } from '@talentbase/design-system';

export default function AdminMatching() {
  const { showToast } = useToast();

  const createMatch = async (candidateId: string) => {
    try {
      const match = await createMatch(token, {
        job_id: selectedJob,
        candidate_id: candidateId,
      });

      showToast({
        variant: 'success',
        title: 'Match criado!',
        description: `${match.candidate.full_name} foi pareado com sucesso.`,
      });

      // Reload suggestions
      loadSuggestions(selectedJob);
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Erro ao criar match',
        description: error.message,
      });
    }
  };
}
```

---

## 📝 Checklist de Boas Práticas

### **Frontend (Remix)**

- [ ] **Rotas Centralizadas**
  - [ ] Adicionar `share.job(token)` ao `ROUTES`
  - [ ] Adicionar `company.jobDetail(id)` ao `ROUTES`
  - [ ] Adicionar `apply.job(token)` ao `ROUTES`
  - [ ] Criar `buildCompanyCandidatesRoute()` builder
  - [ ] Criar `buildMatchingRoute()` builder (se necessário)

- [ ] **API Clients**
  - [ ] Criar `lib/api/jobs.ts`
  - [ ] Criar `lib/api/matching.ts`
  - [ ] Criar `lib/api/applications.ts`
  - [ ] Criar `lib/api/company.ts`
  - [ ] Usar `getApiBaseUrl()` em todos

- [ ] **Type Safety**
  - [ ] Definir interfaces para `JobPosting`
  - [ ] Definir interfaces para `Match`
  - [ ] Definir interfaces para `Application`
  - [ ] Definir interfaces para `CompanyProfile`

- [ ] **Error Handling**
  - [ ] Remover `alert()` - usar Toast
  - [ ] Implementar error boundaries
  - [ ] Validar responses da API

- [ ] **Auth**
  - [ ] Usar `requireAdmin()` para rotas admin
  - [ ] Usar `requireAuth(request, 'company')` para rotas company
  - [ ] Validar JWT com `getUserFromToken()`

---

### **Backend (Django)**

- [ ] **Environment Variables**
  - [ ] Adicionar `APP_BASE_URL` ao settings
  - [ ] Usar `settings.APP_BASE_URL` em share URLs
  - [ ] Configurar `.env` para dev/staging/prod

- [ ] **Serializers**
  - [ ] Criar `CandidateSearchSerializer` com validação
  - [ ] Criar `JobPostingSerializer` completo
  - [ ] Criar `MatchSerializer`
  - [ ] Usar `serializer.is_valid(raise_exception=True)`

- [ ] **Permissions**
  - [ ] Verificar `@permission_classes([IsAdminUser])` em matching views
  - [ ] Verificar `@permission_classes([IsAuthenticated])` em company views
  - [ ] Implementar `IsCompanyOwner` permission class

- [ ] **Performance**
  - [ ] Adicionar `.select_related()` e `.prefetch_related()`
  - [ ] Indexar campos de busca (position, tools, etc)
  - [ ] Cache para match suggestions (Redis)

---

## 🚀 Action Items por Story

### **Story 4.1: Company Profile Management**
- [x] Já implementado (Epic 2)
- [ ] Validar uso de `ROUTES.company.profile`

### **Story 4.2: Job Posting Creation**
- [ ] Criar `lib/api/jobs.ts`
- [ ] Adicionar `ROUTES.company.jobDetail(id)`
- [ ] Usar `redirect(ROUTES.company.jobDetail(id))`

### **Story 4.3: Shareable Public Job Listing**
- [ ] Adicionar `APP_BASE_URL` ao Django settings
- [ ] Usar `settings.APP_BASE_URL` em `generate_share_token()`
- [ ] Adicionar `ROUTES.share.job(token)`
- [ ] Adicionar `ROUTES.apply.job(token)`
- [ ] Configurar SEO meta tags (usar `getAppBaseUrl()`)

### **Story 4.4: Advanced Candidate Search**
- [ ] Criar `CandidateSearchSerializer`
- [ ] Criar `buildCompanyCandidatesRoute()` builder
- [ ] Criar `lib/api/candidates.ts` (search)

### **Story 4.5: Candidate Favorites & Notes**
- [ ] Criar `lib/api/favorites.ts`
- [ ] Type-safe favorite requests

### **Story 4.6: Job Application System**
- [ ] Criar `lib/api/applications.ts`
- [ ] Adicionar `ROUTES.apply.job(token)`

### **Story 4.7: Company Application Review**
- [ ] Adicionar `ROUTES.company.applications`
- [ ] Criar route builder para filtros de applications

### **Story 4.8: Admin Job Management**
- [ ] Usar `requireAdmin()`
- [ ] Adicionar `ROUTES.admin.jobs`

---

### **Story 5.1: Admin Matching Dashboard**
- [ ] Criar `lib/api/matching.ts`
- [ ] Remover `alert()` - usar Toast
- [ ] Adicionar `ROUTES.admin.matching`

### **Story 5.2+: Demais stories**
- [ ] Aplicar mesmas práticas
- [ ] Validar auth/permissions
- [ ] Centralizar API calls

---

## 📚 Documentação de Referência

- [config/routes.ts](../../packages/web/app/config/routes.ts) - Rotas centralizadas
- [config/ROUTES_USAGE.md](../../packages/web/app/config/ROUTES_USAGE.md) - Guia de uso
- [config/api.ts](../../packages/web/app/config/api.ts) - API configuration
- [utils/auth.server.ts](../../packages/web/app/utils/auth.server.ts) - Auth utilities

---

## 🎯 Prioridade de Implementação

### **🔴 Alta Prioridade (Implementar ANTES de Story 4.1)**
1. Adicionar `APP_BASE_URL` ao Django settings
2. Criar route builders para company routes
3. Criar `lib/api/jobs.ts`
4. Definir interfaces TypeScript

### **🟡 Média Prioridade (Durante implementação)**
5. Criar serializers com validação
6. Implementar Toast notifications
7. Adicionar error boundaries

### **🟢 Baixa Prioridade (Refactor depois)**
8. Cache Redis para match suggestions
9. Performance optimization
10. Analytics dashboard charts

---

## ✅ Conclusão

Os Épicos 4 e 5 contêm várias violações das boas práticas já implementadas nos Épicos 1-3. Este documento fornece:

1. ✅ Identificação clara de todos os problemas
2. ✅ Soluções detalhadas com código
3. ✅ Checklist de implementação
4. ✅ Priorização de tarefas

**Recomendação:** Implementar as correções de **Alta Prioridade** antes de iniciar Story 4.1 para evitar débito técnico.

---

**Próximos Passos:**
1. Revisar este documento com o time
2. Atualizar tech specs dos Épicos 4 e 5
3. Implementar correções prioritárias
4. Começar implementação seguindo boas práticas

---

**Documento criado em:** 2025-10-10
**Última atualização:** 2025-10-10
**Status:** ✅ Completo e pronto para implementação
