# Technical Specification - Epic 4: Company & Job Management (UPDATED)

**Epic:** Epic 4 - Company & Job Management
**Timeline:** Weeks 7-10
**Stories:** 4.1 - 4.8
**Author:** BMad Architecture Agent
**Date:** 2025-10-01
**Last Updated:** 2025-10-10 (Best Practices Review)
**Status:** ✅ Updated with Best Practices

---

## 🔄 Updates Applied

This document has been updated to follow best practices established in Épicos 1-3:
- ✅ Centralized routes configuration
- ✅ Environment-based URL configuration
- ✅ Type-safe API clients
- ✅ Django serializers for validation
- ✅ No hardcoded values

**See:** [BEST_PRACTICES_REVIEW_EPIC_4_5.md](./BEST_PRACTICES_REVIEW_EPIC_4_5.md) for detailed analysis.

---

## Epic Overview

### Business Context
Epic 4 completes the marketplace by enabling companies to post jobs, search candidates, and manage applications. Companies can create job postings, generate shareable job links, use advanced filters to find talent, favorite candidates, and review applications.

### Success Criteria
- Companies can create and manage job postings (CRUD)
- Shareable public job links generated and SEO optimized
- Companies can search candidates with advanced filters (position, tools, skills, experience)
- Companies can favorite candidates and add private notes
- Job application flow functional (candidates apply, companies review)

---

## 🛠️ Prerequisites (MUST DO BEFORE Story 4.1)

### Backend Setup

**1. Add APP_BASE_URL to Django Settings:**

`apps/api/talentbase/settings/base.py`:
```python
# App Base URL (for share links)
APP_BASE_URL = env.str('APP_BASE_URL', default='http://localhost:3000')
```

`apps/api/.env.example`:
```bash
# App Base URL - Frontend URL
APP_BASE_URL=http://localhost:3000
```

`apps/api/.env.development`:
```bash
APP_BASE_URL=http://localhost:3000
```

`apps/api/.env.production`:
```bash
APP_BASE_URL=https://www.salesdog.click
```

---

### Frontend Setup

**2. Extend Routes Configuration:**

`packages/web/app/config/routes.ts`:
```typescript
export const ROUTES = {
  // ... existing routes

  // Company Routes
  company: {
    dashboard: '/company/dashboard',
    profile: '/company/profile',
    profileEdit: '/company/profile/edit',
    jobs: '/company/jobs',
    jobDetail: (id: string) => `/company/jobs/${id}`,
    jobNew: '/company/jobs/new',
    jobEdit: (id: string) => `/company/jobs/${id}/edit`,
    applications: '/company/applications',
    candidates: '/company/candidates',
    favorites: '/company/favorites',
  },

  // Apply Routes
  apply: {
    job: (token: string) => `/apply/${token}`,
  },

  // Share Routes (extended)
  share: {
    candidate: (token: string) => `/share/candidate/${token}`,
    job: (token: string) => `/share/job/${token}`,
  },
} as const;

/**
 * Company Candidate Search Route Builder
 *
 * @example
 * buildCompanyCandidatesRoute({
 *   position: ['SDR/BDR'],
 *   tools: ['Salesforce', 'HubSpot'],
 *   page: 2
 * })
 * // => '/company/candidates?position=SDR%2FBDR&tools=Salesforce&tools=HubSpot&page=2'
 */
export function buildCompanyCandidatesRoute(params?: {
  position?: string[];
  tools?: string[];
  solutions?: string[];
  departments?: string[];
  location?: string;
  search?: string;
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

  if (params.search) {
    searchParams.set('search', params.search);
  }

  if (params.page && params.page > 1) {
    searchParams.set('page', params.page.toString());
  }

  const query = searchParams.toString();
  return query ? `${ROUTES.company.candidates}?${query}` : ROUTES.company.candidates;
}

/**
 * Company Applications Route Builder
 */
export function buildCompanyApplicationsRoute(params?: {
  job_id?: string;
  status?: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  page?: number;
}): string {
  if (!params) {
    return ROUTES.company.applications;
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
  return query ? `${ROUTES.company.applications}?${query}` : ROUTES.company.applications;
}
```

**3. Create TypeScript Interfaces:**

`packages/web/app/types/job.ts`:
```typescript
export interface JobPosting {
  id: string;
  company: {
    id: string;
    company_name: string;
    logo_url?: string;
  };
  title: string;
  description: string;
  position_type: 'SDR/BDR' | 'AE/Closer' | 'CSM';
  seniority: 'junior' | 'pleno' | 'senior';
  employment_type: 'CLT' | 'PJ' | 'Hybrid';
  salary_min?: number;
  salary_max?: number;
  required_skills: string[];
  required_tools: string[];
  sales_cycle?: string;
  avg_ticket?: string;
  location: string;
  is_remote: boolean;
  is_active: boolean;
  is_public: boolean;
  public_token: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  position_type: string;
  seniority: string;
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  required_skills: string[];
  required_tools: string[];
  sales_cycle?: string;
  avg_ticket?: string;
  location: string;
  is_remote: boolean;
}
```

**4. Create API Client:**

`packages/web/app/lib/api/jobs.ts`:
```typescript
import { getApiBaseUrl } from '~/config/api';
import type { JobPosting, CreateJobRequest } from '~/types/job';

/**
 * Get all jobs for company
 */
export async function getCompanyJobs(token: string): Promise<JobPosting[]> {
  const apiUrl = getApiBaseUrl();
  const response = await fetch(`${apiUrl}/api/v1/jobs`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }

  return response.json();
}

/**
 * Get single job by ID
 */
export async function getJob(token: string, jobId: string): Promise<JobPosting> {
  const apiUrl = getApiBaseUrl();
  const response = await fetch(`${apiUrl}/api/v1/jobs/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch job');
  }

  return response.json();
}

/**
 * Get public job by token (no auth required)
 */
export async function getPublicJob(token: string): Promise<JobPosting> {
  const apiUrl = getApiBaseUrl();
  const response = await fetch(`${apiUrl}/api/v1/jobs/public/${token}`);

  if (!response.ok) {
    throw new Error('Job not found or sharing is disabled');
  }

  return response.json();
}

/**
 * Create new job
 */
export async function createJob(
  token: string,
  data: CreateJobRequest
): Promise<JobPosting> {
  const apiUrl = getApiBaseUrl();
  const response = await fetch(`${apiUrl}/api/v1/jobs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create job');
  }

  return response.json();
}

/**
 * Update job
 */
export async function updateJob(
  token: string,
  jobId: string,
  data: Partial<CreateJobRequest>
): Promise<JobPosting> {
  const apiUrl = getApiBaseUrl();
  const response = await fetch(`${apiUrl}/api/v1/jobs/${jobId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update job');
  }

  return response.json();
}

/**
 * Delete job
 */
export async function deleteJob(token: string, jobId: string): Promise<void> {
  const apiUrl = getApiBaseUrl();
  const response = await fetch(`${apiUrl}/api/v1/jobs/${jobId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete job');
  }
}

/**
 * Generate share token for job
 */
export async function generateJobShareToken(
  token: string,
  jobId: string
): Promise<{ share_url: string }> {
  const apiUrl = getApiBaseUrl();
  const response = await fetch(
    `${apiUrl}/api/v1/jobs/${jobId}/generate-share-token`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to generate share token');
  }

  return response.json();
}

/**
 * Toggle job public sharing
 */
export async function toggleJobSharing(
  token: string,
  jobId: string,
  enabled: boolean
): Promise<{ is_public: boolean }> {
  const apiUrl = getApiBaseUrl();
  const response = await fetch(
    `${apiUrl}/api/v1/jobs/${jobId}/toggle-sharing`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to toggle sharing');
  }

  return response.json();
}
```

---

## Story 4.1: Company Profile Management

### Implementation Steps

**1. Complete CompanyProfile Model:**

`apps/api/companies/models.py`:
```python
class CompanyProfile(BaseModel):
    SIZE_CHOICES = [
        ('1-10', '1-10 funcionários'),
        ('11-50', '11-50 funcionários'),
        ('51-200', '51-200 funcionários'),
        ('201+', 'Mais de 200 funcionários'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    company_name = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=255)  # Encrypted
    logo_url = models.URLField(blank=True)  # S3 URL
    website = models.URLField()
    industry = models.CharField(max_length=100)
    size = models.CharField(max_length=20, choices=SIZE_CHOICES)
    description = models.TextField(blank=True)
    contact_person_name = models.CharField(max_length=200)
    contact_person_email = models.EmailField()
    contact_person_phone = models.CharField(max_length=20)
    created_by_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.company_name
```

**2. Company Profile Edit Route:**

`packages/web/app/routes/company.profile.edit.tsx`:
```typescript
import { redirect, json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { requireAuth } from '~/utils/auth.server';
import { updateCompanyProfile } from '~/lib/api/company';
import { ROUTES } from '~/config/routes';

export async function action({ request }: ActionFunctionArgs) {
  const { token, user } = await requireAuth(request, 'company');
  const formData = await request.formData();

  const data = {
    logo_url: formData.get('logo_url') as string,
    industry: formData.get('industry') as string,
    size: formData.get('size') as string,
    description: formData.get('description') as string,
    website: formData.get('website') as string,
  };

  await updateCompanyProfile(token, user.company_profile.id, data);

  return redirect(ROUTES.company.profile);
}
```

---

## Story 4.2: Job Posting Creation

### Backend Implementation

**1. JobPosting Model:**

`apps/api/jobs/models.py`:
```python
import uuid
from django.db import models
from core.models import BaseModel
from companies.models import CompanyProfile

class JobPosting(BaseModel):
    POSITION_CHOICES = [
        ('SDR/BDR', 'SDR/BDR'),
        ('AE/Closer', 'Account Executive/Closer'),
        ('CSM', 'Customer Success Manager'),
    ]

    SENIORITY_CHOICES = [
        ('junior', 'Júnior'),
        ('pleno', 'Pleno'),
        ('senior', 'Sênior'),
    ]

    EMPLOYMENT_CHOICES = [
        ('CLT', 'CLT'),
        ('PJ', 'PJ'),
        ('Hybrid', 'Híbrido'),
    ]

    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    position_type = models.CharField(max_length=50, choices=POSITION_CHOICES)
    seniority = models.CharField(max_length=20, choices=SENIORITY_CHOICES)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_CHOICES)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    required_skills = models.JSONField(default=list)
    required_tools = models.JSONField(default=list)
    sales_cycle = models.CharField(max_length=100, blank=True)
    avg_ticket = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100)
    is_remote = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    public_token = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    is_public = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.company.company_name}"
```

**2. Job Creation View:**

`apps/api/jobs/views.py`:
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import JobPosting
from .serializers import JobPostingSerializer, CreateJobSerializer

class JobViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateJobSerializer
        return JobPostingSerializer

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return JobPosting.objects.all()
        elif self.request.user.role == 'company':
            return JobPosting.objects.filter(company__user=self.request.user)
        else:
            return JobPosting.objects.filter(is_active=True, is_public=True)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Auto-assign company if user is company role
        if request.user.role == 'company':
            serializer.save(company=request.user.company_profile)
        else:
            serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

**3. Job Serializer:**

`apps/api/jobs/serializers.py`:
```python
from rest_framework import serializers
from .models import JobPosting
from companies.serializers import CompanyProfileSerializer

class JobPostingSerializer(serializers.ModelSerializer):
    company = CompanyProfileSerializer(read_only=True)

    class Meta:
        model = JobPosting
        fields = [
            'id', 'company', 'title', 'description', 'position_type',
            'seniority', 'employment_type', 'salary_min', 'salary_max',
            'required_skills', 'required_tools', 'sales_cycle', 'avg_ticket',
            'location', 'is_remote', 'is_active', 'is_public', 'public_token',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'company', 'public_token', 'created_at', 'updated_at']

class CreateJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = [
            'title', 'description', 'position_type', 'seniority',
            'employment_type', 'salary_min', 'salary_max',
            'required_skills', 'required_tools', 'sales_cycle',
            'avg_ticket', 'location', 'is_remote'
        ]

    def validate_required_skills(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Must be a list")
        return value

    def validate_required_tools(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Must be a list")
        return value
```

### Frontend Implementation

**Job Creation Route:**

`packages/web/app/routes/company.jobs.new.tsx`:
```typescript
import { redirect, json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { requireAuth } from '~/utils/auth.server';
import { createJob } from '~/lib/api/jobs';
import { ROUTES } from '~/config/routes';
import type { CreateJobRequest } from '~/types/job';

export async function action({ request }: ActionFunctionArgs) {
  const { token } = await requireAuth(request, 'company');
  const formData = await request.formData();

  const data: CreateJobRequest = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    position_type: formData.get('position_type') as string,
    seniority: formData.get('seniority') as string,
    employment_type: formData.get('employment_type') as string,
    salary_min: formData.get('salary_min') ? Number(formData.get('salary_min')) : undefined,
    salary_max: formData.get('salary_max') ? Number(formData.get('salary_max')) : undefined,
    required_skills: JSON.parse(formData.get('required_skills') as string),
    required_tools: JSON.parse(formData.get('required_tools') as string),
    sales_cycle: formData.get('sales_cycle') as string,
    avg_ticket: formData.get('avg_ticket') as string,
    location: formData.get('location') as string,
    is_remote: formData.get('is_remote') === 'true',
  };

  try {
    const job = await createJob(token, data);

    // ✅ Use centralized routes
    return redirect(ROUTES.company.jobDetail(job.id));
  } catch (error) {
    return json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

---

## Story 4.3: Shareable Public Job Listing

### Backend Implementation

**1. Generate Share Token API (✅ UPDATED):**

`apps/api/jobs/views.py`:
```python
from django.conf import settings

@action(detail=True, methods=['post'])
def generate_share_token(self, request, pk=None):
    job = self.get_object()

    # Regenerate token
    job.public_token = uuid.uuid4()
    job.is_public = True
    job.save()

    # ✅ Use environment variable instead of hardcoded URL
    share_url = f"{settings.APP_BASE_URL}/share/job/{job.public_token}"

    return Response({'share_url': share_url})

@action(detail=True, methods=['patch'])
def toggle_sharing(self, request, pk=None):
    job = self.get_object()
    enabled = request.data.get('enabled', False)

    job.is_public = enabled
    job.save()

    return Response({'is_public': job.is_public})
```

**2. Public Job View:**

`apps/api/jobs/views.py`:
```python
@action(detail=False, methods=['get'], url_path='public/(?P<token>[^/.]+)')
def get_public_job(self, request, token=None):
    try:
        job = JobPosting.objects.get(
            public_token=token,
            is_public=True,
            is_active=True
        )
        serializer = self.get_serializer(job)
        return Response(serializer.data)
    except JobPosting.DoesNotExist:
        return Response(
            {'error': 'Job not found or sharing is disabled'},
            status=status.HTTP_404_NOT_FOUND
        )
```

### Frontend Implementation (✅ UPDATED)

**Public Job Route:**

`packages/web/app/routes/share.job.$token.tsx`:
```typescript
import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@talentbase/design-system';
import { getPublicJob } from '~/lib/api/jobs';
import { ROUTES, getAppBaseUrl } from '~/config/routes'; // ✅ Import utilities
import type { JobPosting } from '~/types/job';

interface LoaderData {
  job: JobPosting;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { token } = params;

  if (!token) {
    throw new Response('Token not found', { status: 404 });
  }

  try {
    // ✅ Use API client
    const job = await getPublicJob(token);
    return json<LoaderData>({ job });
  } catch (error) {
    throw new Response('Job not found or sharing is disabled', { status: 404 });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: 'Vaga não encontrada | TalentBase' }];
  }

  const { job } = data as LoaderData;
  // ✅ Use getAppBaseUrl() instead of hardcoded
  const appBaseUrl = getAppBaseUrl();
  const shareUrl = `${appBaseUrl}/share/job/${job.public_token}`;

  const title = `${job.title} - ${job.company.company_name} | TalentBase`;
  const description = job.description.substring(0, 150) + '...';

  return [
    { title },
    { name: 'description', content: description },

    // Open Graph
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: job.company.logo_url || `${appBaseUrl}/og-default.png` },
    { property: 'og:url', content: shareUrl },
    { property: 'og:type', content: 'website' },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: job.company.logo_url || `${appBaseUrl}/og-default.png` },
  ];
};

export default function PublicJobListing() {
  const { job } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Card className="p-8">
        <div className="flex items-start gap-6">
          {job.company.logo_url && (
            <img
              src={job.company.logo_url}
              alt={job.company.company_name}
              className="w-20 h-20 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-xl text-gray-600">{job.company.company_name}</p>
            <div className="flex gap-4 mt-2">
              <Badge>{job.position_type}</Badge>
              <Badge>{job.seniority}</Badge>
              <Badge>{job.employment_type}</Badge>
              {job.is_remote && <Badge variant="success">Remoto</Badge>}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Descrição da Vaga</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>

        {job.required_skills.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Habilidades Necessárias</h2>
            <div className="flex flex-wrap gap-2">
              {job.required_skills.map((skill: string) => (
                <Badge key={skill} variant="primary">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        {job.required_tools.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Ferramentas</h2>
            <div className="flex flex-wrap gap-2">
              {job.required_tools.map((tool: string) => (
                <Badge key={tool} variant="secondary">{tool}</Badge>
              ))}
            </div>
          </div>
        )}

        {job.salary_min && job.salary_max && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Faixa Salarial</h2>
            <p className="text-lg">
              R$ {job.salary_min.toLocaleString()} - R$ {job.salary_max.toLocaleString()}
            </p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Localização</h2>
          <p className="text-lg">
            {job.location} {job.is_remote && '(Trabalho Remoto)'}
          </p>
        </div>

        <div className="mt-8 text-center">
          {/* ✅ Use centralized route */}
          <Link to={ROUTES.apply.job(job.public_token)}>
            <Button size="lg">Candidatar-se a esta Vaga</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
```

---

## Story 4.4: Advanced Candidate Search

### Backend Implementation (✅ UPDATED with Serializer Validation)

**1. Search Serializer:**

`apps/api/candidates/serializers.py`:
```python
class CandidateSearchSerializer(serializers.Serializer):
    """Serializer for candidate search with validation"""

    POSITION_CHOICES = ['SDR/BDR', 'AE/Closer', 'CSM']

    search = serializers.CharField(required=False, allow_blank=True, max_length=200)
    position = serializers.MultipleChoiceField(
        choices=POSITION_CHOICES,
        required=False
    )
    tools = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        max_length=20  # Max 20 tools
    )
    solutions = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        max_length=20
    )
    departments = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        max_length=20
    )
    location = serializers.CharField(required=False, allow_blank=True, max_length=100)
    page = serializers.IntegerField(default=1, min_value=1)
    page_size = serializers.IntegerField(default=20, min_value=1, max_value=100)
```

**2. Search API with Validation:**

`apps/api/candidates/views.py`:
```python
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination

class CandidateSearchPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class CandidateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CandidateSerializer
    pagination_class = CandidateSearchPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # ✅ Use serializer for validation
        search_serializer = CandidateSearchSerializer(
            data=self.request.query_params
        )
        search_serializer.is_valid(raise_exception=True)
        filters = search_serializer.validated_data

        queryset = CandidateProfile.objects.filter(
            is_active=True,
            status='available'
        )

        # Free text search
        if filters.get('search'):
            queryset = queryset.filter(
                Q(full_name__icontains=filters['search']) |
                Q(bio__icontains=filters['search'])
            )

        # Position filter
        if filters.get('position'):
            queryset = queryset.filter(current_position__in=filters['position'])

        # Tools filter (JSONB contains)
        if filters.get('tools'):
            for tool in filters['tools']:
                queryset = queryset.filter(tools_software__contains=[tool])

        # Solutions filter
        if filters.get('solutions'):
            for solution in filters['solutions']:
                queryset = queryset.filter(solutions_sold__contains=[solution])

        # Departments filter
        if filters.get('departments'):
            for dept in filters['departments']:
                queryset = queryset.filter(departments_sold_to__contains=[dept])

        # Location filter
        if filters.get('location'):
            queryset = queryset.filter(city__icontains=filters['location'])

        return queryset.select_related('user').prefetch_related('experiences')
```

### Frontend Implementation (✅ UPDATED)

**Search UI (Remix):**

`packages/web/app/routes/company.candidates.tsx`:
```typescript
import { useState } from 'react';
import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';
import { searchCandidates } from '~/lib/api/candidates';
import { buildCompanyCandidatesRoute } from '~/config/routes';
import { Checkbox, Button, Input, Card } from '@talentbase/design-system';
import type { CandidateProfile } from '~/types/candidate';

interface LoaderData {
  candidates: CandidateProfile[];
  totalCount: number;
  currentPage: number;
  filters: {
    position: string[];
    tools: string[];
    solutions: string[];
    departments: string[];
    location: string;
    search: string;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireAuth(request, 'company');

  const url = new URL(request.url);
  const filters = {
    position: url.searchParams.getAll('position'),
    tools: url.searchParams.getAll('tools'),
    solutions: url.searchParams.getAll('solutions'),
    departments: url.searchParams.getAll('departments'),
    location: url.searchParams.get('location') || '',
    search: url.searchParams.get('search') || '',
    page: parseInt(url.searchParams.get('page') || '1', 10),
  };

  const response = await searchCandidates(token, filters);

  return json<LoaderData>({
    candidates: response.results,
    totalCount: response.count,
    currentPage: filters.page,
    filters,
  });
}

export default function CandidateSearch() {
  const { candidates, totalCount, currentPage, filters: initialFilters } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState(initialFilters);

  const handleApplyFilters = () => {
    // ✅ Use route builder
    const route = buildCompanyCandidatesRoute(filters);
    navigate(route);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex gap-8 p-8">
      <aside className="w-64">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>

        <div className="mb-6">
          <Input
            label="Buscar"
            placeholder="Nome ou palavra-chave"
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Posição</h3>
          <Checkbox
            label="SDR/BDR"
            checked={filters.position.includes('SDR/BDR')}
            onChange={(checked) => {
              const newPosition = checked
                ? [...filters.position, 'SDR/BDR']
                : filters.position.filter(p => p !== 'SDR/BDR');
              handleFilterChange('position', newPosition);
            }}
          />
          <Checkbox
            label="AE/Closer"
            checked={filters.position.includes('AE/Closer')}
            onChange={(checked) => {
              const newPosition = checked
                ? [...filters.position, 'AE/Closer']
                : filters.position.filter(p => p !== 'AE/Closer');
              handleFilterChange('position', newPosition);
            }}
          />
          <Checkbox
            label="CSM"
            checked={filters.position.includes('CSM')}
            onChange={(checked) => {
              const newPosition = checked
                ? [...filters.position, 'CSM']
                : filters.position.filter(p => p !== 'CSM');
              handleFilterChange('position', newPosition);
            }}
          />
        </div>

        <div className="mb-6">
          <Input
            label="Localização"
            placeholder="Cidade"
            value={filters.location}
            onChange={e => handleFilterChange('location', e.target.value)}
          />
        </div>

        <Button onClick={handleApplyFilters} className="w-full">
          Aplicar Filtros
        </Button>
      </aside>

      <main className="flex-1">
        <div className="mb-4">
          <p className="text-gray-600">
            {totalCount} {totalCount === 1 ? 'candidato encontrado' : 'candidatos encontrados'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {candidates.map(candidate => (
            <Card key={candidate.id} className="p-4">
              <h3 className="font-semibold text-lg">{candidate.full_name}</h3>
              <p className="text-sm text-gray-600">{candidate.current_position}</p>
              <p className="text-sm">{candidate.years_of_experience} anos de experiência</p>
              <p className="text-sm text-gray-500">{candidate.city}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
```

---

## Remaining Stories Summary

### Story 4.5: Candidate Favorites & Notes
- Create API client: `lib/api/favorites.ts`
- Use centralized routes for favorites list
- Type-safe favorite requests

### Story 4.6: Job Application System
- Create API client: `lib/api/applications.ts`
- Use `ROUTES.apply.job(token)` for apply link
- Email notifications to candidate and company

### Story 4.7: Company Application Review
- Use `buildCompanyApplicationsRoute()` for filters
- Create API client methods for application review

### Story 4.8: Admin Job Management
- Use `requireAdmin()` for auth
- Use `ROUTES.admin.jobs` for navigation
- Reuse job API client with admin permissions

---

## Epic Completion Checklist

### Prerequisites
- [x] APP_BASE_URL configured in Django settings
- [x] Routes extended in config/routes.ts
- [x] Route builders created
- [x] API client created (lib/api/jobs.ts)
- [x] TypeScript interfaces defined

### Stories
- [ ] Story 4.1: Company profile management working
- [ ] Story 4.2: Job posting creation functional (company + admin)
- [ ] Story 4.3: Shareable public job links generated, SEO optimized
- [ ] Story 4.4: Advanced candidate search with filters working
- [ ] Story 4.5: Favorites and notes functional
- [ ] Story 4.6: Job application flow working
- [ ] Story 4.7: Company can review applications
- [ ] Story 4.8: Admin job management functional

---

## Migration from Old Spec

If you've already started implementation following the old spec, here's what to update:

1. **Replace hardcoded share URLs:**
   - Find: `f"https://www.salesdog.click/share/job/{token}"`
   - Replace: `f"{settings.APP_BASE_URL}/share/job/{token}"`

2. **Replace hardcoded routes:**
   - Find: `redirect('/company/jobs/...')`
   - Replace: `redirect(ROUTES.company.jobDetail(id))`

3. **Replace direct API calls:**
   - Find: `await api.get('/jobs')`
   - Replace: `await getCompanyJobs(token)`

4. **Add serializer validation:**
   - Create `CandidateSearchSerializer`
   - Use `serializer.is_valid(raise_exception=True)`

---

**Document Version:** 2.0 (Updated)
**Last Updated:** 2025-10-10
**Status:** ✅ Ready for Implementation with Best Practices
