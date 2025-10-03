# Technical Specification - Epic 4: Company & Job Management

**Epic:** Epic 4 - Company & Job Management
**Timeline:** Weeks 7-10
**Stories:** 4.1 - 4.8
**Author:** BMad Architecture Agent
**Date:** 2025-10-01

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

### Architecture Context

**Job Posting Strategy:**
- Company or Admin can create jobs
- Shareable public job links (UUID token)
- SEO optimized for LinkedIn/social sharing
- Rich text description (markdown or Tiptap editor)

**Candidate Search:**
- Advanced filters: position, tools, skills, ticket size, sales cycle, location
- PostgreSQL JSONB queries for multi-select filters
- Indexed fields for performance (<1s query time)
- Pagination (20 results/page)

**Application Workflow:**
- Candidate applies ’ Application created (status=pending)
- Company reviews applications
- Admin can manually match candidates to jobs

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
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request, 'company');
  const formData = await request.formData();

  await api.patch(`/companies/${user.company_profile.id}`, {
    logo_url: formData.get('logo_url'),
    industry: formData.get('industry'),
    size: formData.get('size'),
    description: formData.get('description'),
    website: formData.get('website'),
  });

  return redirect('/company/profile');
}
```

---

## Story 4.2: Job Posting Creation

### Implementation Steps

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
from .models import JobPosting
from .serializers import JobPostingSerializer

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobPostingSerializer

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return JobPosting.objects.all()
        elif self.request.user.role == 'company':
            return JobPosting.objects.filter(company__user=self.request.user)
        else:
            return JobPosting.objects.filter(is_active=True)

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

**3. Job Creation Route (Remix):**

`packages/web/app/routes/company.jobs.new.tsx`:
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request, 'company');
  const formData = await request.formData();

  const response = await api.post('/jobs', {
    title: formData.get('title'),
    description: formData.get('description'),
    position_type: formData.get('position_type'),
    seniority: formData.get('seniority'),
    employment_type: formData.get('employment_type'),
    salary_min: Number(formData.get('salary_min')),
    salary_max: Number(formData.get('salary_max')),
    required_skills: JSON.parse(formData.get('required_skills') as string),
    required_tools: JSON.parse(formData.get('required_tools') as string),
    sales_cycle: formData.get('sales_cycle'),
    avg_ticket: formData.get('avg_ticket'),
    location: formData.get('location'),
    is_remote: formData.get('is_remote') === 'true',
  });

  return redirect(`/company/jobs/${response.data.id}`);
}
```

---

## Story 4.3: Shareable Public Job Listing

### Implementation Steps

**1. Generate Share Token API:**

`apps/api/jobs/views.py`:
```python
@action(detail=True, methods=['post'])
def generate_share_token(self, request, pk=None):
    job = self.get_object()

    # Regenerate token
    job.public_token = uuid.uuid4()
    job.is_public = True
    job.save()

    share_url = f"https://www.salesdog.click/share/job/{job.public_token}"

    return Response({'share_url': share_url})
```

**2. Public Job Route:**

`packages/web/app/routes/share.job.$token.tsx`:
```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  const { token } = params;

  const response = await api.get(`/jobs/public/${token}`);
  return json({ job: response.data });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const { job } = data;
  return [
    { title: `${job.title} - ${job.company.company_name} | TalentBase` },
    { name: 'description', content: job.description.substring(0, 150) + '...' },
    { property: 'og:title', content: job.title },
    { property: 'og:description', content: job.description },
    { property: 'og:image', content: job.company.logo_url },
  ];
};

export default function PublicJobListing() {
  const { job } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Card className="p-8">
        <div className="flex items-start gap-6">
          <img src={job.company.logo_url} alt={job.company.company_name} className="w-20 h-20" />
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-xl text-gray-600">{job.company.company_name}</p>
            <div className="flex gap-4 mt-2">
              <Badge>{job.position_type}</Badge>
              <Badge>{job.seniority}</Badge>
              <Badge>{job.employment_type}</Badge>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Descrição da Vaga</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Requisitos</h2>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map((skill: string) => (
              <Badge key={skill} variant="primary">{skill}</Badge>
            ))}
          </div>
        </div>

        {job.salary_min && job.salary_max && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Faixa Salarial</h2>
            <p className="text-lg">R$ {job.salary_min.toLocaleString()} - R$ {job.salary_max.toLocaleString()}</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <a href={`/apply/${job.public_token}`}>
            <Button size="lg">Candidatar-se a esta Vaga</Button>
          </a>
        </div>
      </Card>
    </div>
  );
}
```

---

## Story 4.4: Advanced Candidate Search

### Implementation Steps

**1. Search API with Filters:**

`apps/api/candidates/views.py`:
```python
from django.db.models import Q

class CandidateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CandidateSerializer

    def get_queryset(self):
        queryset = CandidateProfile.objects.filter(is_active=True, status='available')

        # Free text search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) | Q(bio__icontains=search)
            )

        # Position filter
        position = self.request.query_params.getlist('position')
        if position:
            queryset = queryset.filter(current_position__in=position)

        # Tools filter (JSONB contains)
        tools = self.request.query_params.getlist('tools')
        if tools:
            for tool in tools:
                queryset = queryset.filter(tools_software__contains=[tool])

        # Solutions filter
        solutions = self.request.query_params.getlist('solutions')
        if solutions:
            for solution in solutions:
                queryset = queryset.filter(solutions_sold__contains=[solution])

        # Departments filter
        departments = self.request.query_params.getlist('departments')
        if departments:
            for dept in departments:
                queryset = queryset.filter(departments_sold_to__contains=[dept])

        # Location filter
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)

        return queryset.select_related('user').prefetch_related('experiences')
```

**2. Search UI (Remix):**

`packages/web/app/routes/company.candidates.tsx`:
```typescript
export default function CandidateSearch() {
  const [filters, setFilters] = useState({
    position: [],
    tools: [],
    solutions: [],
    departments: [],
    location: '',
  });

  return (
    <div className="flex gap-8">
      <aside className="w-64">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Posição</h3>
          <Checkbox label="SDR/BDR" />
          <Checkbox label="AE/Closer" />
          <Checkbox label="CSM" />
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Ferramentas</h3>
          <Checkbox label="Salesforce" />
          <Checkbox label="HubSpot" />
          <Checkbox label="Apollo.io" />
        </div>

        <Button onClick={applyFilters}>Aplicar Filtros</Button>
      </aside>

      <main className="flex-1">
        <div className="grid grid-cols-3 gap-6">
          {candidates.map(candidate => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

---

## Story 4.5: Candidate Favorites & Notes

### Implementation Steps

**1. Favorite Model:**

`apps/api/companies/models.py`:
```python
class Favorite(BaseModel):
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='favorites')
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['company', 'candidate']
```

**2. Favorite API:**

`apps/api/companies/views.py`:
```python
@api_view(['POST'])
def favorite_candidate(request):
    candidate_id = request.data.get('candidate_id')
    company = request.user.company_profile

    favorite, created = Favorite.objects.get_or_create(
        company=company,
        candidate_id=candidate_id
    )

    return Response({'favorited': created})
```

---

## Remaining Stories Summary

### Story 4.6: Job Application System
- Candidate applies via `/apply/:token` ’ Creates Application
- Application status: pending, reviewed, accepted, rejected
- Email notifications to candidate and company

### Story 4.7: Company Application Review
- Route: `/company/applications`
- Filter by job, status
- Review modal: candidate profile preview, accept/reject buttons

### Story 4.8: Admin Job Management
- Route: `/admin/jobs`
- Admin can create jobs on behalf of companies
- Deactivate/delete jobs

---

## Epic Completion Checklist

- [ ] Story 4.1: Company profile management working
- [ ] Story 4.2: Job posting creation functional (company + admin)
- [ ] Story 4.3: Shareable public job links generated, SEO optimized
- [ ] Story 4.4: Advanced candidate search with filters working
- [ ] Story 4.5: Favorites and notes functional
- [ ] Story 4.6: Job application flow working
- [ ] Story 4.7: Company can review applications
- [ ] Story 4.8: Admin job management functional

---

**Document Version:** 1.0
**Last Updated:** 2025-10-01
**Status:** Ready for Implementation
