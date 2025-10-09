# Story 3.1: Candidate Profile Creation (Self-Registration)

Status: ContextReadyDraft

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)

## Story

Como um **candidato**,
Eu quero **criar meu perfil de vendas abrangente**,
Para que **empresas possam descobrir minhas habilidades e experiência**.

## Acceptance Criteria

1. Candidato redirecionado para `/candidate/profile/create` após registro
2. Formulário multi-step wizard com indicador de progresso (5 steps):
   - Step 1: Informações Básicas (nome, telefone, localização, foto upload para S3)
   - Step 2: Posição & Experiência (posição, anos, Inbound/Outbound, Inside/Field, ciclo de vendas, ticket size)
   - Step 3: Ferramentas & Software (multi-select: Salesforce, Hubspot, Apollo.io, etc.)
   - Step 4: Soluções & Departamentos (soluções vendidas, departamentos para quem vendeu)
   - Step 5: Histórico de Trabalho & Bio (adicionar 1+ empresas anteriores, escrever bio)
3. Cada step tem validação client-side antes de "Próximo"
4. Botão "Salvar Rascunho" em cada step (salva progresso)
5. Endpoint API `POST /api/v1/candidates` cria perfil
6. Upload de arquivo para foto de perfil (max 2MB, JPG/PNG)
7. Foto armazenada no AWS S3, URL salva no banco de dados
8. Mensagem de sucesso: "Perfil criado! Gere seu link compartilhável."
9. Redirect para `/candidate/profile` (modo visualização)

## Tasks / Subtasks

- [ ] Task 1: Criar modelo CandidateProfile estendido (AC: 5, 7)
  - [ ] Estender CandidateProfile model com todos os campos
  - [ ] Adicionar campos: position, years_experience, sales_type, sales_cycle, ticket_size
  - [ ] Adicionar campos: tools (JSONField), solutions (JSONField), departments (JSONField)
  - [ ] Adicionar campos: bio (TextField), profile_photo_url (URLField)
  - [ ] Executar migrações Django

- [ ] Task 2: Implementar API de criação de perfil (AC: 5, 6, 7)
  - [ ] Criar CandidateProfileSerializer completo
  - [ ] Criar view `POST /api/v1/candidates`
  - [ ] Implementar validação de campos obrigatórios
  - [ ] Implementar upload para S3 (presigned URLs)

- [ ] Task 3: Criar formulário multi-step frontend (AC: 1, 2, 3, 9)
  - [ ] Criar route `/candidate/profile/create`
  - [ ] Implementar wizard com 5 steps e indicador de progresso
  - [ ] Implementar validação client-side por step
  - [ ] Integrar com design system

- [ ] Task 4: Implementar funcionalidade "Salvar Rascunho" (AC: 4)
  - [ ] Endpoint `PATCH /api/v1/candidates/:id/draft`
  - [ ] Salvar estado parcial do formulário
  - [ ] Carregar rascunho ao retornar

- [ ] Task 5: Implementar redirect pós-criação (AC: 8, 9)
  - [ ] Mensagem de sucesso
  - [ ] Redirect para visualização de perfil

## Dev Notes

### Candidate Profile Data Model

**CandidateProfile Fields:**
```python
class CandidateProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Step 1: Basic Info
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=100)  # City, State
    profile_photo_url = models.URLField(blank=True, null=True)

    # Step 2: Position & Experience
    position = models.CharField(max_length=50)  # SDR/BDR, AE, CSM
    years_experience = models.IntegerField()
    sales_type = models.JSONField(default=list)  # ["Inbound", "Outbound"]
    sales_model = models.JSONField(default=list)  # ["Inside Sales", "Field Sales"]
    sales_cycle = models.CharField(max_length=20)  # "1-3mo", "3-6mo", etc.
    ticket_size = models.CharField(max_length=20)  # "12-24K", "24-60K", etc.

    # Step 3: Tools & Software
    tools = models.JSONField(default=list)  # ["Salesforce", "Hubspot", ...]

    # Step 4: Solutions & Departments
    solutions = models.JSONField(default=list)  # ["SaaS", "Cybersecurity", ...]
    departments = models.JSONField(default=list)  # ["IT", "Finance", ...]

    # Step 5: Work History & Bio
    bio = models.TextField(blank=True)
    # Work history in separate Experience model

    # Metadata
    status = models.CharField(max_length=20, default='available')
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Experience Model (Work History):**
```python
class Experience(models.Model):
    candidate = models.ForeignKey(CandidateProfile, related_name='experiences')
    company_name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # null = current
    description = models.TextField(blank=True)
```

### S3 Upload Strategy

**Presigned URL Flow:**
1. Frontend requests presigned URL: `GET /api/v1/candidates/upload-url?filename=photo.jpg`
2. Backend generates S3 presigned POST URL (expires in 5 minutes)
3. Frontend uploads directly to S3 using presigned URL
4. Frontend sends S3 URL to backend with profile data
5. Backend validates URL is from our S3 bucket and saves

**S3 Bucket Structure:**
```
s3://talentbase-media/
  candidate-photos/
    {user_id}/
      profile.jpg
```

### Multi-Select Options (Seed Data)

**Tools Options:**
- Salesforce
- Hubspot
- Apollo.io
- Outreach
- Salesloft
- Pipedrive
- Zoho CRM
- Microsoft Dynamics

**Solutions Options:**
- SaaS
- Cybersecurity
- HR Tech
- Fintech
- Healthtech
- Martech
- Edtech
- E-commerce

**Departments Options:**
- IT
- Finance
- HR
- Marketing
- C-Level
- Operations
- Sales

**Position Options:**
- SDR/BDR
- AE (Account Executive)
- CSM (Customer Success Manager)
- Sales Manager
- Sales Director

### Frontend Components

**MultiStepWizard Component:**
- Progress indicator (steps 1-5)
- Navigation: "Anterior", "Próximo", "Salvar Rascunho"
- Client-side validation per step
- State management (React Context or local state)

**Form Validation Rules:**
- Step 1: phone (required, format), location (required)
- Step 2: position (required), years_experience (required, number > 0)
- Step 3: tools (at least 1 selected)
- Step 4: solutions (at least 1 selected)
- Step 5: bio (required, min 100 characters), at least 1 work experience

### API Endpoints

```
POST /api/v1/candidates
- Creates candidate profile
- Auth: Required (candidate role)
- Body: Full CandidateProfile data + experiences array
- Response: 201 Created + profile ID

GET /api/v1/candidates/upload-url?filename=photo.jpg
- Returns presigned S3 URL for photo upload
- Auth: Required (candidate role)
- Response: { upload_url, photo_url }

PATCH /api/v1/candidates/:id/draft
- Saves partial profile data as draft
- Auth: Required (candidate role, owner only)
- Body: Partial CandidateProfile data
- Response: 200 OK
```

### User Flow

1. Candidate registers via Story 2.1
2. After registration, redirect to `/candidate/profile/create`
3. Candidate fills Step 1 → validates → Next
4. Candidate fills Step 2 → validates → Next
5. Candidate fills Step 3 → validates → Next
6. Candidate fills Step 4 → validates → Next
7. Candidate fills Step 5 → validates → Submit
8. API creates CandidateProfile + Experiences
9. Success message displayed
10. Redirect to `/candidate/profile` (view mode)

### Testing Considerations

**Unit Tests:**
- Serializer validation for all fields
- S3 URL generation and validation
- Draft save/load functionality

**Integration Tests:**
- Complete profile creation flow (all 5 steps)
- Photo upload to S3
- Draft save and resume

**Edge Cases:**
- Photo upload failure (fallback to no photo)
- Draft data corruption (validate before load)
- Duplicate profile creation (prevent)
- Missing required fields (server-side validation)

## Dependencies

- Story 2.1: Candidate registration completed
- AWS S3 bucket configured for media storage
- Design system multi-step form components

## Definition of Done

- [ ] All 9 acceptance criteria validated
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] API endpoints documented
- [ ] Frontend form accessible (WCAG 2.1 AA)
- [ ] Photo upload to S3 working
- [ ] Code reviewed and merged
- [ ] Deployed to staging
- [ ] QA sign-off

## Dev Agent Record

### Context Reference

- [Story Context XML](../stories-context/story-context-3.1.xml) - Generated 2025-10-09

### Agent Model Used

Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

### Completion Notes List

### File List
