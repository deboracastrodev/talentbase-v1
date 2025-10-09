# Story 3.6: Candidate Dashboard (View Profile & Browse Jobs)

Status: Not Started

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)

## Story

Como um **candidato**,
Eu quero **visualizar meu perfil e navegar vagas disponíveis**,
Para que **eu possa acompanhar minhas informações e me candidatar a oportunidades**.

## Acceptance Criteria

1. Dashboard do candidato em `/candidate`
2. Seções do dashboard:
   - Widget de completude do perfil (% completo, link para editar)
   - Display de link compartilhável com botão "Copiar Link"
   - Resumo de status de candidaturas (Candidaturas: X, Em Revisão: Y, etc.)
   - Widget de vagas recomendadas (3-5 vagas matching posição do candidato)
3. Link "Meu Perfil" → `/candidate/profile` (modo visualização)
4. Botão "Editar Perfil" → `/candidate/profile/edit`
5. Link "Explorar Vagas" → `/candidate/jobs` (página de listagem de vagas)
6. Link "Minhas Candidaturas" → `/candidate/applications`
7. Dashboard carrega em menos de 2 segundos
8. Estados vazios se sem dados (ex: sem candidaturas ainda)

## Tasks / Subtasks

- [ ] Task 1: Criar layout do dashboard (AC: 1, 2, 7, 8)
  - [ ] Criar route `/candidate`
  - [ ] Implementar CandidateLayout component
  - [ ] Criar widgets: perfil, candidaturas, vagas recomendadas
  - [ ] Implementar estados vazios

- [ ] Task 2: Implementar widget de completude de perfil (AC: 2)
  - [ ] Calcular % de completude (campos obrigatórios preenchidos)
  - [ ] Exibir barra de progresso
  - [ ] Link para editar campos faltantes

- [ ] Task 3: Implementar widget de link compartilhável (AC: 2)
  - [ ] Exibir link compartilhável (se gerado)
  - [ ] Botão "Copiar Link" com feedback
  - [ ] Botão "Gerar Link" (se ainda não gerado)

- [ ] Task 4: Implementar resumo de candidaturas (AC: 2)
  - [ ] Endpoint `GET /api/v1/candidates/me/applications/summary`
  - [ ] Exibir contagens por status
  - [ ] Link para ver todas candidaturas

- [ ] Task 5: Implementar widget de vagas recomendadas (AC: 2)
  - [ ] Endpoint `GET /api/v1/candidates/me/recommended-jobs`
  - [ ] Filtrar vagas por posição do candidato
  - [ ] Exibir 3-5 vagas
  - [ ] Cards de vaga com ação "Ver Detalhes"

- [ ] Task 6: Implementar navegação (AC: 3, 4, 5, 6)
  - [ ] Sidebar ou top nav com links
  - [ ] Highlight item ativo
  - [ ] Mobile responsive

## Dev Notes

### Dashboard Layout

**Page Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  Header: TalentBase Logo | Meu Perfil | [User Menu ▾]   │
├─────────────────────────────────────────────────────────┤
│  Sidebar:                │  Main Content Area           │
│  ● Dashboard             │                              │
│  ○ Meu Perfil            │  ┌─────────────────────────┐ │
│  ○ Editar Perfil         │  │ Completude do Perfil    │ │
│  ○ Explorar Vagas        │  │ 80% completo            │ │
│  ○ Minhas Candidaturas   │  │ ████████░░              │ │
│                          │  │ [Completar Perfil]      │ │
│                          │  └─────────────────────────┘ │
│                          │                              │
│                          │  ┌─────────────────────────┐ │
│                          │  │ Link Compartilhável     │ │
│                          │  │ salesdog.click/share/.. │ │
│                          │  │ [Copiar] [Regenerar]    │ │
│                          │  └─────────────────────────┘ │
│                          │                              │
│                          │  ┌─────────────────────────┐ │
│                          │  │ Minhas Candidaturas     │ │
│                          │  │ Candidaturas: 3         │ │
│                          │  │ Em Revisão: 1           │ │
│                          │  │ Entrevista: 1           │ │
│                          │  │ [Ver Todas]             │ │
│                          │  └─────────────────────────┘ │
│                          │                              │
│                          │  ┌─────────────────────────┐ │
│                          │  │ Vagas Recomendadas      │ │
│                          │  │ • AE - Tech Startup     │ │
│                          │  │   R$ 8k-12k [Ver]       │ │
│                          │  │ • AE - SaaS Company     │ │
│                          │  │   R$ 10k-15k [Ver]      │ │
│                          │  │ [Ver Todas Vagas]       │ │
│                          │  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Profile Completeness Calculation

**Required Fields:**
- name ✓
- email ✓
- phone
- location
- position
- years_experience
- bio (min 100 characters)
- tools (at least 1)
- solutions (at least 1)
- experiences (at least 1)
- profile_photo_url

**Calculation:**
```python
def calculate_profile_completeness(candidate):
    required_fields = [
        'phone',
        'location',
        'position',
        'years_experience',
        'profile_photo_url',
    ]

    completed = 0
    total = len(required_fields) + 4  # +4 for bio, tools, solutions, experiences

    # Check simple fields
    for field in required_fields:
        if getattr(candidate, field):
            completed += 1

    # Check bio (min 100 chars)
    if candidate.bio and len(candidate.bio) >= 100:
        completed += 1

    # Check tools (at least 1)
    if candidate.tools and len(candidate.tools) > 0:
        completed += 1

    # Check solutions (at least 1)
    if candidate.solutions and len(candidate.solutions) > 0:
        completed += 1

    # Check experiences (at least 1)
    if candidate.experiences.count() > 0:
        completed += 1

    return int((completed / total) * 100)
```

### API Endpoints

```
GET /api/v1/candidates/me
- Returns authenticated candidate's profile
- Auth: Required (candidate role)
- Response: CandidateProfile object with completeness %

GET /api/v1/candidates/me/applications/summary
- Returns application count by status
- Auth: Required (candidate role)
- Response: {
    total: 3,
    applied: 1,
    under_review: 1,
    interview_scheduled: 1,
    rejected: 0
  }

GET /api/v1/candidates/me/recommended-jobs
- Returns 3-5 jobs matching candidate position
- Auth: Required (candidate role)
- Query params: limit (default 5)
- Response: [{ job_id, title, company, salary, ... }]
```

### Recommended Jobs Algorithm (Simple MVP)

**Matching Logic:**
```python
def get_recommended_jobs(candidate, limit=5):
    # Match by position
    jobs = Job.objects.filter(
        position=candidate.position,
        status='active'
    )

    # Exclude jobs already applied to
    applied_job_ids = Application.objects.filter(
        candidate=candidate
    ).values_list('job_id', flat=True)

    jobs = jobs.exclude(id__in=applied_job_ids)

    # Order by created_at (newest first)
    jobs = jobs.order_by('-created_at')[:limit]

    return jobs
```

**Future Enhancement (Epic 5):**
- Factor in skills match
- Factor in location match
- Factor in salary range match
- Use ML-based recommendations

### Shareable Link Widget

**States:**

**Link Not Generated:**
```
┌─────────────────────────────────────┐
│  Link Compartilhável                │
│  Você ainda não gerou seu link      │
│  compartilhável.                    │
│                                     │
│  [Gerar Link Compartilhável]        │
└─────────────────────────────────────┘
```

**Link Generated:**
```
┌─────────────────────────────────────┐
│  Link Compartilhável                │
│  salesdog.click/share/candidate/... │
│                                     │
│  [Copiar Link] [Regenerar] [Ver]    │
│                                     │
│  Compartilhamentos: 12 visualizações│
└─────────────────────────────────────┘
```

**Link Disabled:**
```
┌─────────────────────────────────────┐
│  Link Compartilhável                │
│  Seu link está desabilitado.        │
│                                     │
│  [Habilitar Compartilhamento]       │
└─────────────────────────────────────┘
```

### Application Summary Widget

**Example:**
```
┌─────────────────────────────────────┐
│  Minhas Candidaturas                │
├─────────────────────────────────────┤
│  📊 Total: 5 candidaturas           │
│                                     │
│  🔵 Candidaturas: 2                 │
│  🟡 Em Revisão: 1                   │
│  🟢 Entrevista: 1                   │
│  ⚪ Oferta: 0                       │
│  🔴 Rejeitadas: 1                   │
│                                     │
│  [Ver Todas Candidaturas →]         │
└─────────────────────────────────────┘
```

### Recommended Jobs Widget

**Job Card:**
```
┌─────────────────────────────────────┐
│  Vagas Recomendadas para AE         │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ 📄 Account Executive            ││
│  │    Tech Startup Inc.            ││
│  │    💰 R$ 8.000 - 12.000         ││
│  │    📍 São Paulo (Remoto)        ││
│  │    [Ver Detalhes →]             ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 📄 Senior AE                    ││
│  │    SaaS Company Ltd.            ││
│  │    💰 R$ 10.000 - 15.000        ││
│  │    📍 Rio de Janeiro            ││
│  │    [Ver Detalhes →]             ││
│  └─────────────────────────────────┘│
│                                     │
│  [Explorar Todas Vagas →]           │
└─────────────────────────────────────┘
```

### Empty States

**No Applications:**
```
┌─────────────────────────────────────┐
│  Minhas Candidaturas                │
├─────────────────────────────────────┤
│  📭 Você ainda não se candidatou    │
│     a nenhuma vaga.                 │
│                                     │
│  [Explorar Vagas →]                 │
└─────────────────────────────────────┘
```

**No Recommended Jobs:**
```
┌─────────────────────────────────────┐
│  Vagas Recomendadas                 │
├─────────────────────────────────────┤
│  📭 Nenhuma vaga disponível no      │
│     momento para sua posição.       │
│                                     │
│  [Ver Todas Vagas →]                │
└─────────────────────────────────────┘
```

### Navigation Component

**CandidateLayout with Sidebar:**
```tsx
const CandidateLayout = ({ children }) => {
  const pathname = useLocation().pathname

  const navItems = [
    { label: 'Dashboard', path: '/candidate', icon: HomeIcon },
    { label: 'Meu Perfil', path: '/candidate/profile', icon: UserIcon },
    { label: 'Editar Perfil', path: '/candidate/profile/edit', icon: EditIcon },
    { label: 'Explorar Vagas', path: '/candidate/jobs', icon: BriefcaseIcon },
    { label: 'Minhas Candidaturas', path: '/candidate/applications', icon: FileIcon },
  ]

  return (
    <div className="flex">
      <Sidebar>
        {navItems.map(item => (
          <NavItem
            key={item.path}
            {...item}
            active={pathname === item.path}
          />
        ))}
      </Sidebar>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
```

### Performance Optimization

**Parallel Data Fetching:**
```tsx
// In Remix loader
export const loader = async ({ request }) => {
  const user = await requireCandidateAuth(request)

  // Fetch all dashboard data in parallel
  const [candidate, applicationsSummary, recommendedJobs] = await Promise.all([
    getCandidateProfile(user.id),
    getApplicationsSummary(user.id),
    getRecommendedJobs(user.id, 5)
  ])

  return json({
    candidate,
    applicationsSummary,
    recommendedJobs
  })
}
```

**Caching:**
- Cache dashboard data for 5 minutes (Redis)
- Invalidate on profile update or new application

### Testing Considerations

**Unit Tests:**
- Profile completeness calculation
- Recommended jobs filtering

**Integration Tests:**
- Dashboard loads all widgets
- Navigation works
- Empty states display correctly

**Edge Cases:**
- Profile 0% complete (new user)
- Profile 100% complete
- No applications (empty state)
- No recommended jobs (empty state)
- Link not generated yet

## Dependencies

- Story 3.1: Candidate profile creation
- Story 3.2: Shareable link
- Story 3.7: Profile editing (for "Edit Profile" link)
- Epic 4: Jobs exist for recommendations

## Definition of Done

- [ ] All 8 acceptance criteria validated
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Dashboard loads <2 seconds
- [ ] All widgets functional
- [ ] Empty states tested
- [ ] Mobile responsive
- [ ] Code reviewed and merged
- [ ] Deployed to staging
- [ ] QA sign-off
