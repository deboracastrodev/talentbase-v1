# Technical Specification - Epic 5: Matching & Analytics

**Epic:** Epic 5 - Matching & Analytics
**Timeline:** Weeks 10-12
**Stories:** 5.1 - 5.7
**Author:** BMad Architecture Agent
**Date:** 2025-10-01

---

## Epic Overview

### Business Context
Epic 5 streamlines the admin matching process and provides data-driven insights. This epic delivers manual matching tools (admin pairs candidates to jobs), match outcome tracking, and analytics dashboards to measure platform health. The matching data collected here will train future AI-powered automated matching (post-MVP).

### Success Criteria
- Admin can use matching dashboard to efficiently pair candidates and jobs (reduce matching time from 2 hours to 30 minutes)
- Match suggestions based on criteria (position, skills, experience, ranking score)
- Email notifications sent to candidates and companies on match
- Match outcomes tracked (interview, hired, rejected) for quality measurement
- Admin analytics dashboard shows platform health metrics (candidates, jobs, match rates, hire rates)

### Architecture Context

**Manual Matching Strategy:**
- Admin-driven manual matching in MVP
- Match suggestions powered by scoring algorithm:
  - Position match (40%)
  - Skills overlap (30%)
  - Seniority match (20%)
  - Ranking score (10%)
- Suggestions ranked by match score (0-100%)

**Match Model:**
```python
class Match:
    job: ForeignKey(JobPosting)
    candidate: ForeignKey(CandidateProfile)
    created_by: ForeignKey(User)  # Admin who created match
    status: CharField  # matched, contacted, interview_scheduled, hired, rejected
    match_score: DecimalField  # 0-100%
    outcome_date: DateTimeField  # Date of hire/rejection
    notes: TextField  # Admin notes on outcome
```

**Analytics Strategy:**
- Real-time aggregation queries for dashboard
- Redis cache (1-hour TTL) for expensive calculations
- Django ORM aggregation: Count, Avg, Sum
- Charts: Chart.js or Recharts (optional)

---

## Story 5.1: Admin Matching Dashboard (Manual Matching)

### Architecture Context

**Match Score Calculation:**
```python
def calculate_match_score(job, candidate):
    score = 0

    # Position match (40%)
    if job.position_type == candidate.current_position:
        score += 40

    # Skills overlap (30%)
    job_skills = set(job.required_skills)
    candidate_skills = set(candidate.top_skills + candidate.tools_software)
    skills_overlap = len(job_skills & candidate_skills) / len(job_skills) if job_skills else 0
    score += skills_overlap * 30

    # Seniority match (20%)
    seniority_map = {'junior': 1, 'pleno': 2, 'senior': 3}
    if job.seniority == candidate.seniority_level:
        score += 20
    elif abs(seniority_map.get(job.seniority, 0) - seniority_map.get(candidate.seniority_level, 0)) == 1:
        score += 10

    # Ranking score (10%)
    if hasattr(candidate, 'ranking'):
        score += (candidate.ranking.score / 100) * 10

    return round(score, 2)
```

### Implementation Steps

**1. Match Model:**

`apps/api/matching/models.py`:
```python
from django.db import models
from core.models import BaseModel
from jobs.models import JobPosting
from candidates.models import CandidateProfile
from authentication.models import User

class Match(BaseModel):
    STATUS_CHOICES = [
        ('matched', 'Matched'),
        ('contacted', 'Contacted'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('offer_extended', 'Offer Extended'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
        ('declined', 'Declined'),
    ]

    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='matches')
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='matches')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='matches_created')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='matched')
    match_score = models.DecimalField(max_digits=5, decimal_places=2)  # 0-100
    outcome_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['job', 'candidate']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.candidate.full_name} ’ {self.job.title} ({self.status})"
```

**2. Match Suggestions API:**

`apps/api/matching/views.py`:
```python
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from jobs.models import JobPosting
from candidates.models import CandidateProfile
from .utils import calculate_match_score

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_match_suggestions(request):
    job_id = request.query_params.get('job_id')
    job = JobPosting.objects.get(id=job_id)

    # Get available candidates with matching position
    candidates = CandidateProfile.objects.filter(
        current_position=job.position_type,
        status='available'
    ).select_related('user', 'ranking').prefetch_related('experiences')

    # Calculate match scores
    suggestions = []
    for candidate in candidates:
        score = calculate_match_score(job, candidate)
        suggestions.append({
            'candidate': CandidateSerializer(candidate).data,
            'match_score': score
        })

    # Sort by match score descending
    suggestions.sort(key=lambda x: x['match_score'], reverse=True)

    return Response({'suggestions': suggestions[:20]})  # Top 20 candidates
```

**3. Create Match API:**

`apps/api/matching/views.py`:
```python
@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_match(request):
    job_id = request.data.get('job_id')
    candidate_id = request.data.get('candidate_id')

    job = JobPosting.objects.get(id=job_id)
    candidate = CandidateProfile.objects.get(id=candidate_id)

    # Calculate match score
    match_score = calculate_match_score(job, candidate)

    # Create match
    match = Match.objects.create(
        job=job,
        candidate=candidate,
        created_by=request.user,
        match_score=match_score
    )

    # Send notifications (async)
    from .tasks import send_match_notification
    send_match_notification.delay(match.id)

    return Response({
        'match': MatchSerializer(match).data,
        'message': 'Match created successfully'
    })
```

**4. Matching Dashboard (Remix):**

`packages/web/app/routes/admin.matching.tsx`:
```typescript
import { useLoaderData, Form } from '@remix-run/react';
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { Select, Button, Card, Badge } from '@talentbase/design-system';
import { api } from '~/services/api.server';
import { requireAuth } from '~/services/auth.server';
import { useState } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request, 'admin');

  const jobs = await api.get('/jobs');
  return json({ jobs: jobs.data });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'get_suggestions') {
    const jobId = formData.get('job_id');
    const response = await api.get(`/matching/suggestions?job_id=${jobId}`);
    return json({ suggestions: response.data.suggestions });
  }

  if (action === 'create_match') {
    const jobId = formData.get('job_id');
    const candidateId = formData.get('candidate_id');

    await api.post('/matching/matches', {
      job_id: jobId,
      candidate_id: candidateId
    });

    return json({ success: true, message: 'Match created successfully' });
  }

  return json({});
}

export default function AdminMatching() {
  const { jobs } = useLoaderData<typeof loader>();
  const [selectedJob, setSelectedJob] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const loadSuggestions = async (jobId: string) => {
    const formData = new FormData();
    formData.append('action', 'get_suggestions');
    formData.append('job_id', jobId);

    const response = await fetch('', { method: 'POST', body: formData });
    const data = await response.json();
    setSuggestions(data.suggestions || []);
  };

  const createMatch = async (candidateId: string) => {
    const formData = new FormData();
    formData.append('action', 'create_match');
    formData.append('job_id', selectedJob);
    formData.append('candidate_id', candidateId);

    await fetch('', { method: 'POST', body: formData });
    alert('Match criado com sucesso!');
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
          {suggestions.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Candidatos Sugeridos</h2>
              <div className="space-y-4">
                {suggestions.map(({ candidate, match_score }) => (
                  <Card key={candidate.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{candidate.full_name}</h3>
                        <p className="text-sm text-gray-600">{candidate.current_position}</p>
                        <p className="text-sm">{candidate.years_of_experience} anos de experiência</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="success">
                          Match: {match_score}%
                        </Badge>
                        <Button
                          onClick={() => createMatch(candidate.id)}
                          size="sm"
                          className="mt-2"
                        >
                          Fazer Match
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

## Story 5.2: Match Notifications (Email to Candidate & Company)

### Implementation Steps

**1. Celery Task for Match Notifications:**

`apps/api/matching/tasks.py`:
```python
from celery import shared_task
from django.core.mail import send_mail
from .models import Match

@shared_task
def send_match_notification(match_id):
    match = Match.objects.select_related('job', 'candidate', 'job__company').get(id=match_id)

    # Email to candidate
    send_mail(
        subject='Você foi matcheado com uma oportunidade!',
        message=f'''
Olá {match.candidate.full_name},

Você foi matcheado com a vaga de {match.job.title} na empresa {match.job.company.company_name}!

Detalhes da vaga:
- Posição: {match.job.position_type}
- Localização: {match.job.location}
- Faixa Salarial: R$ {match.job.salary_min} - R$ {match.job.salary_max}

A empresa revisará seu perfil e poderá entrar em contato para uma entrevista.

Veja os detalhes completos: https://www.salesdog.click/candidate/matches/{match.id}

Boa sorte!
Equipe TalentBase
        ''',
        from_email='noreply@salesdog.click',
        recipient_list=[match.candidate.user.email],
        fail_silently=True,
    )

    # Email to company
    send_mail(
        subject=f'Novo candidato matcheado para a vaga: {match.job.title}',
        message=f'''
Olá {match.job.company.contact_person_name},

Temos um novo candidato matcheado para sua vaga de {match.job.title}!

Candidato: {match.candidate.full_name}
Posição Atual: {match.candidate.current_position}
Experiência: {match.candidate.years_of_experience} anos
Score de Match: {match.match_score}%

Principais Habilidades: {', '.join(match.candidate.top_skills[:5])}

Veja o perfil completo: https://www.salesdog.click/share/candidate/{match.candidate.public_token}

Entre em contato via TalentBase ou diretamente com o candidato.

Equipe TalentBase
        ''',
        from_email='noreply@salesdog.click',
        recipient_list=[match.job.company.contact_person_email],
        fail_silently=True,
    )
```

---

## Story 5.3: Match Outcome Tracking

### Implementation Steps

**1. Update Match Outcome API:**

`apps/api/matching/views.py`:
```python
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_match_outcome(request, pk):
    match = Match.objects.get(id=pk)

    match.status = request.data.get('status', match.status)
    match.outcome_date = request.data.get('outcome_date', match.outcome_date)
    match.notes = request.data.get('notes', match.notes)
    match.save()

    return Response({'match': MatchSerializer(match).data})
```

**2. Match Tracking Dashboard:**

`packages/web/app/routes/admin.matches.tsx`:
```typescript
export default function AdminMatches() {
  const { matches } = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Match Tracking</h1>

      <table className="w-full">
        <thead>
          <tr>
            <th>Candidato</th>
            <th>Vaga</th>
            <th>Empresa</th>
            <th>Data do Match</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {matches.map(match => (
            <tr key={match.id}>
              <td>{match.candidate.full_name}</td>
              <td>{match.job.title}</td>
              <td>{match.job.company.company_name}</td>
              <td>{new Date(match.created_at).toLocaleDateString()}</td>
              <td>
                <Badge variant={match.status === 'hired' ? 'success' : 'secondary'}>
                  {match.status}
                </Badge>
              </td>
              <td>
                <Button size="sm" onClick={() => openOutcomeModal(match)}>
                  Atualizar Outcome
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Story 5.4: Admin Analytics Dashboard

### Implementation Steps

**1. Analytics API:**

`apps/api/matching/views.py`:
```python
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_analytics(request):
    # Check cache first
    cache_key = 'admin_analytics'
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data)

    # Calculate analytics
    thirty_days_ago = timezone.now() - timedelta(days=30)

    analytics = {
        'candidates': {
            'total': CandidateProfile.objects.count(),
            'available': CandidateProfile.objects.filter(status='available').count(),
            'inactive': CandidateProfile.objects.filter(status='inactive').count(),
            'under_contract': CandidateProfile.objects.filter(status='no_contract').count(),
        },
        'companies': {
            'total': CompanyProfile.objects.count(),
            'active': CompanyProfile.objects.filter(user__is_active=True).count(),
            'pending': CompanyProfile.objects.filter(user__is_active=False).count(),
        },
        'jobs': {
            'total': JobPosting.objects.count(),
            'active': JobPosting.objects.filter(is_active=True).count(),
            'paused': JobPosting.objects.filter(is_active=False).count(),
        },
        'matches': {
            'total_this_month': Match.objects.filter(created_at__gte=thirty_days_ago).count(),
            'hired': Match.objects.filter(status='hired').count(),
            'interview_rate': calculate_interview_rate(),
            'hire_rate': calculate_hire_rate(),
        }
    }

    # Cache for 1 hour
    cache.set(cache_key, analytics, 3600)

    return Response(analytics)

def calculate_interview_rate():
    total_matches = Match.objects.count()
    if total_matches == 0:
        return 0

    interviews = Match.objects.filter(
        status__in=['interview_scheduled', 'offer_extended', 'hired']
    ).count()

    return round((interviews / total_matches) * 100, 2)

def calculate_hire_rate():
    total_matches = Match.objects.count()
    if total_matches == 0:
        return 0

    hired = Match.objects.filter(status='hired').count()
    return round((hired / total_matches) * 100, 2)
```

**2. Analytics Dashboard (Remix):**

`packages/web/app/routes/admin._index.tsx`:
```typescript
export default function AdminDashboard() {
  const { analytics } = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Candidatos</h3>
          <p className="text-4xl font-bold">{analytics.candidates.total}</p>
          <p className="text-sm text-gray-600 mt-2">
            {analytics.candidates.available} disponíveis
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Empresas</h3>
          <p className="text-4xl font-bold">{analytics.companies.total}</p>
          <p className="text-sm text-gray-600 mt-2">
            {analytics.companies.pending} pendentes
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Vagas Ativas</h3>
          <p className="text-4xl font-bold">{analytics.jobs.active}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Matches (mês)</h3>
          <p className="text-4xl font-bold">{analytics.matches.total_this_month}</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Taxa de Conversão</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Match ’ Entrevista</p>
              <p className="text-2xl font-bold">{analytics.matches.interview_rate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Match ’ Contratação</p>
              <p className="text-2xl font-bold">{analytics.matches.hire_rate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-2">
            <p className="text-sm">João Silva aplicou para SDR na Empresa X</p>
            <p className="text-sm">Nova empresa cadastrada: Tech Solutions</p>
            <p className="text-sm">Match criado: Maria ’ AE na SaaS Co</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

---

## Remaining Stories Summary

### Story 5.5: Top 10 Rankings Display
- Widget on admin dashboard showing top 10 candidates by ranking score
- Public page `/rankings` showing top candidates (if opted-in)

### Story 5.6: Candidate Match Dashboard
- Route: `/candidate/matches`
- View matches created by admin
- Match status, job details, next steps

### Story 5.7: Company Match Dashboard
- Route: `/company/matches`
- View matches created by admin
- Candidate details, contact button

---

## Epic Completion Checklist

- [ ] Story 5.1: Matching dashboard functional, suggestions working
- [ ] Story 5.2: Match notifications sent to candidate and company
- [ ] Story 5.3: Match outcome tracking implemented
- [ ] Story 5.4: Admin analytics dashboard showing metrics
- [ ] Story 5.5: Top 10 rankings displayed
- [ ] Story 5.6: Candidate match dashboard functional
- [ ] Story 5.7: Company match dashboard functional

---

## Post-MVP: AI-Powered Automated Matching

**Data Collection for AI:**
- Match scores (manual)
- Match outcomes (interview, hired, rejected)
- Skills overlap effectiveness
- Ranking correlation with outcomes

**Future AI Model:**
- Train on historical match data
- Predict match success probability
- Automate candidate suggestions
- Continuous learning from outcomes

---

**Document Version:** 1.0
**Last Updated:** 2025-10-01
**Status:** Ready for Implementation
