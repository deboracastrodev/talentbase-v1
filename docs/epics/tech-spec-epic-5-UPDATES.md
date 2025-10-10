# Epic 5: Matching & Analytics - Best Practices Updates

**Epic:** Epic 5 - Matching & Analytics
**Original Spec:** [tech-spec-epic-5.md](./tech-spec-epic-5.md)
**Date:** 2025-10-10
**Status:** ✅ Updates Summary

---

## 📋 Overview

This document summarizes the best practices updates needed for Epic 5 implementation.

**Full details:** See [tech-spec-epic-4-UPDATED.md](./tech-spec-epic-4-UPDATED.md) for comprehensive examples.

---

## 🛠️ Required Updates

### 1. Create API Client Module

**File:** `packages/web/app/lib/api/matching.ts`

```typescript
import { getApiBaseUrl } from '~/config/api';

export interface MatchSuggestion {
  candidate: CandidateProfile;
  match_score: number;
}

export interface Match {
  id: string;
  job: JobPosting;
  candidate: CandidateProfile;
  match_score: number;
  status: 'matched' | 'contacted' | 'interview_scheduled' | 'hired' | 'rejected';
  created_at: string;
  notes: string;
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
 * Create a match
 */
export async function createMatch(
  token: string,
  data: { job_id: string; candidate_id: string }
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

/**
 * Update match status
 */
export async function updateMatchStatus(
  token: string,
  matchId: string,
  status: string,
  notes?: string
): Promise<Match> {
  const apiUrl = getApiBaseUrl();
  const response = await fetch(
    `${apiUrl}/api/v1/matching/matches/${matchId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, notes }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update match');
  }

  return response.json();
}
```

---

### 2. Add Routes to Configuration

**File:** `packages/web/app/config/routes.ts`

```typescript
export const ROUTES = {
  // ... existing routes

  admin: {
    // ... existing admin routes
    matching: '/admin/matching',
    matches: '/admin/matches',
    analytics: '/admin/analytics',
  },
} as const;

/**
 * Admin Matching Route Builder
 */
export function buildAdminMatchingRoute(params?: {
  job_id?: string;
  status?: 'matched' | 'contacted' | 'interview_scheduled' | 'hired' | 'rejected';
  page?: number;
}): string {
  if (!params) {
    return ROUTES.admin.matching;
  }

  const searchParams = new URLSearchParams();

  if (params.job_id) {
    searchParams.set('job_id', params.job_id);
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (params.page && params.page > 1) {
    searchParams.set('page', params.page.toString());
  }

  const query = searchParams.toString();
  return query ? `${ROUTES.admin.matching}?${query}` : ROUTES.admin.matching;
}
```

---

### 3. Replace Alert with Toast Notifications

**❌ BEFORE:**
```typescript
alert('Match criado com sucesso!');
```

**✅ AFTER:**
```typescript
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

### 4. Use Auth Utilities Consistently

**❌ BEFORE:**
```typescript
await requireAuth(request, 'admin');
```

**✅ AFTER:**
```typescript
const { token, user } = await requireAdmin(request);
```

---

### 5. Updated Matching Dashboard Route

**File:** `packages/web/app/routes/admin.matching.tsx`

```typescript
import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { requireAdmin } from '~/utils/auth.server';
import { getMatchSuggestions, createMatch } from '~/lib/api/matching';
import { getCompanyJobs } from '~/lib/api/jobs';
import { ROUTES } from '~/config/routes';
import { Select, Button, Card, Badge, useToast } from '@talentbase/design-system';

export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireAdmin(request);

  const jobs = await getCompanyJobs(token);
  return json({ jobs });
}

export async function action({ request }: ActionFunctionArgs) {
  const { token } = await requireAdmin(request);
  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'create_match') {
    const match = await createMatch(token, {
      job_id: formData.get('job_id') as string,
      candidate_id: formData.get('candidate_id') as string,
    });

    return json({ success: true, match });
  }

  return json({});
}

export default function AdminMatching() {
  const { jobs } = useLoaderData<typeof loader>();
  const { showToast } = useToast();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSuggestions = async (jobId: string) => {
    setLoading(true);
    try {
      const data = await getMatchSuggestions(token, jobId);
      setSuggestions(data);
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Erro',
        description: 'Falha ao carregar sugestões',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async (candidateId: string) => {
    const formData = new FormData();
    formData.append('action', 'create_match');
    formData.append('job_id', selectedJob!);
    formData.append('candidate_id', candidateId);

    try {
      const response = await fetch('', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        showToast({
          variant: 'success',
          title: 'Match criado!',
          description: 'Candidato pareado com sucesso.',
        });
        loadSuggestions(selectedJob!);
      }
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Erro',
        description: 'Falha ao criar match',
      });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Matching Dashboard</h1>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Selecione uma Vaga</h2>
          <Select
            label="Vaga"
            options={jobs.map(job => ({
              value: job.id,
              label: `${job.title} - ${job.company.company_name}`
            }))}
            onChange={(e) => {
              setSelectedJob(e.target.value);
              loadSuggestions(e.target.value);
            }}
          />
        </div>

        <div>
          {loading && <p>Carregando sugestões...</p>}

          {!loading && suggestions.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Candidatos Sugeridos</h2>
              <div className="space-y-4">
                {suggestions.map(({ candidate, match_score }) => (
                  <Card key={candidate.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{candidate.full_name}</h3>
                        <p className="text-sm text-gray-600">{candidate.current_position}</p>
                        <p className="text-sm">{candidate.years_of_experience} anos</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="success">
                          {match_score}% match
                        </Badge>
                        <Button
                          onClick={() => handleCreateMatch(candidate.id)}
                          size="sm"
                          className="mt-2"
                        >
                          Parear
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 📝 Implementation Checklist

### API Client
- [ ] Create `lib/api/matching.ts`
- [ ] Add `getMatchSuggestions()`
- [ ] Add `createMatch()`
- [ ] Add `getMatches()`
- [ ] Add `updateMatchStatus()`

### Routes
- [ ] Add `ROUTES.admin.matching`
- [ ] Add `ROUTES.admin.matches`
- [ ] Add `ROUTES.admin.analytics`
- [ ] Create `buildAdminMatchingRoute()` builder

### Components
- [ ] Replace all `alert()` with Toast
- [ ] Use `requireAdmin()` for auth
- [ ] Use `getApiBaseUrl()` for API calls
- [ ] Add error boundaries

### Backend
- [ ] Add permission checks (`@permission_classes([IsAdminUser])`)
- [ ] Create serializers for match creation
- [ ] Add validation for match status transitions

---

## 🎯 Key Changes from Original Spec

1. **API Abstraction:** Created `lib/api/matching.ts` instead of direct fetch calls
2. **Toast Notifications:** Replaced `alert()` with `useToast()` hook
3. **Centralized Auth:** Use `requireAdmin()` consistently
4. **Route Builders:** Added `buildAdminMatchingRoute()` for filters
5. **Type Safety:** Full TypeScript interfaces for all entities
6. **Error Handling:** Proper try/catch with user-friendly messages

---

## 🚀 Ready to Implement

With these updates, Epic 5 will:
✅ Follow same patterns as Épicos 1-3
✅ Be maintainable and scalable
✅ Have proper error handling
✅ Use centralized configuration
✅ Be fully type-safe

---

**See Also:**
- [tech-spec-epic-4-UPDATED.md](./tech-spec-epic-4-UPDATED.md) - Full implementation examples
- [BEST_PRACTICES_REVIEW_EPIC_4_5.md](./BEST_PRACTICES_REVIEW_EPIC_4_5.md) - Detailed analysis
- [config/routes.ts](../../packages/web/app/config/routes.ts) - Routes configuration

---

**Document Version:** 1.0
**Last Updated:** 2025-10-10
**Status:** ✅ Ready for Implementation
