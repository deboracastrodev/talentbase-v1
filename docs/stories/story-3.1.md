# Story 3.1: Candidate Profile Creation (Self-Registration)

Status: Ready

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
5. Botão "Anterior" preserva dados do step atual antes de navegar
6. Endpoint API `POST /api/v1/candidates` cria perfil
7. Upload de arquivo para foto de perfil (max 2MB, JPG/PNG, validação MIME no backend)
8. Foto armazenada no AWS S3, URL salva no banco de dados
9. Upload de nova foto substitui foto anterior (delete old file from S3)
10. Mensagem de sucesso: "Perfil criado! Gere seu link compartilhável."
11. Redirect para `/candidate/profile` (modo visualização)
12. Prevent duplicate profile creation (user can have only one CandidateProfile)

## Tasks / Subtasks

- [ ] Task 1: Criar modelo CandidateProfile estendido (AC: 5, 7)
  - [ ] Estender CandidateProfile model com todos os campos
  - [ ] Adicionar campos: position, years_experience, sales_type, sales_cycle, ticket_size
  - [ ] Adicionar campos: tools (JSONField), solutions (JSONField), departments (JSONField)
  - [ ] Adicionar campos: bio (TextField), profile_photo_url (URLField)
  - [ ] Executar migrações Django

- [ ] Task 2: Implementar API de criação de perfil (AC: 6, 7, 8, 9, 12)
  - [ ] Criar CandidateProfileSerializer completo
  - [ ] Criar view `POST /api/v1/candidates` com validação de duplicação
  - [ ] Implementar validação de campos obrigatórios
  - [ ] Implementar validação MIME no backend (JPG/PNG apenas)
  - [ ] Implementar upload para S3 (presigned URLs)
  - [ ] Implementar delete de foto antiga ao fazer upload de nova

- [ ] Task 3: Criar formulário multi-step frontend (AC: 1, 2, 3, 5, 11)
  - [ ] Criar route `/candidate/profile/create`
  - [ ] Implementar wizard com 5 steps e indicador de progresso
  - [ ] Implementar validação client-side por step com mensagens de erro específicas
  - [ ] Implementar navegação "Anterior" que preserva dados do step atual
  - [ ] Implementar loading states durante upload S3
  - [ ] Integrar com design system

- [ ] Task 4: Implementar funcionalidade "Salvar Rascunho" (AC: 4)
  - [ ] Endpoint `PATCH /api/v1/candidates/:id/draft`
  - [ ] Salvar estado parcial do formulário
  - [ ] Carregar rascunho ao retornar

- [ ] Task 5: Implementar redirect pós-criação (AC: 10, 11)
  - [ ] Mensagem de sucesso
  - [ ] Redirect para visualização de perfil

- [ ] Task 6: Implementar segurança e sanitização (AC: 7, 12)
  - [ ] Validação MIME type no backend para uploads
  - [ ] Sanitização da bio para prevenir XSS
  - [ ] Validação de URL S3 (confirmar bucket correto)

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
2. Backend validates MIME type from filename extension
3. Backend generates S3 presigned POST URL (expires in 5 minutes)
4. Frontend uploads directly to S3 using presigned URL
5. Frontend sends S3 URL to backend with profile data
6. Backend validates URL is from our S3 bucket and saves
7. If updating photo: Backend deletes old photo from S3 before saving new URL

**S3 Bucket Structure:**
```
s3://talentbase-media/
  candidate-photos/
    {user_id}/
      profile_{timestamp}.jpg  # timestamp prevents cache issues
```

**S3 Security & Retention:**
- Bucket policy: Private (no public read)
- Access: Via CloudFront CDN with signed URLs
- Retention: Photos deleted when user account is deleted
- MIME validation: Backend verifies Content-Type header (image/jpeg or image/png)
- Max file size: 2MB enforced on backend

**XSS Prevention & Sanitization:**
- **Backend (Python):** Use `bleach 6.1+` to sanitize bio field
  - Strip all HTML tags except safe ones (if any)
  - Remove JavaScript event handlers
  - Configuration: `bleach.clean(bio, tags=[], strip=True)`
- **Frontend (TypeScript):** Display bio as plain text (no HTML rendering)
- **Validation:** Bio max length 2000 characters

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
- Auto-save functionality (saves to localStorage every 30s)
- Loading states for S3 upload and API calls

**Form Validation Rules & Error Messages:**
- Step 1:
  - phone (required, format) → "Telefone inválido. Use formato: (11) 98765-4321"
  - location (required) → "Localização é obrigatória"
  - photo (optional, max 2MB, JPG/PNG) → "Arquivo deve ser JPG ou PNG e menor que 2MB"
- Step 2:
  - position (required) → "Selecione sua posição"
  - years_experience (required, number > 0) → "Anos de experiência deve ser maior que 0"
- Step 3:
  - tools (at least 1 selected) → "Selecione pelo menos 1 ferramenta"
- Step 4:
  - solutions (at least 1 selected) → "Selecione pelo menos 1 solução"
  - departments (at least 1 selected) → "Selecione pelo menos 1 departamento"
- Step 5:
  - bio (required, min 100 characters) → "Bio deve ter no mínimo 100 caracteres (atual: X)"
  - work experience (at least 1 entry) → "Adicione pelo menos 1 experiência profissional"

**Navigation Behavior:**
- "Próximo": Valida step atual → salva no state → avança
- "Anterior": Salva step atual no state → volta (sem validação)
- "Salvar Rascunho": Salva via API → mostra toast "Rascunho salvo"

**Auto-Save Strategy:**
- **localStorage auto-save:** A cada 30s, salva state completo do formulário em `localStorage.setItem('candidate-profile-draft', JSON.stringify(formState))`
- **Objetivo:** Prevenir perda de dados em caso de crash do navegador ou perda de conexão
- **Recuperação:** Ao carregar `/candidate/profile/create`, verificar localStorage primeiro
- **Prioridade:** Se draft existe na API E localStorage, API tem prioridade (mais recente)
- **Limpeza:** Remover localStorage após submit bem-sucedido

### API Endpoints

```
POST /api/v1/candidates
- Creates candidate profile
- Auth: Required (candidate role)
- Body: Full CandidateProfile data + experiences array
- Validations:
  - Check if user already has a CandidateProfile (return 409 Conflict if exists)
  - Validate MIME type of profile_photo_url
  - Sanitize bio field (strip HTML, prevent XSS)
  - Validate S3 URL is from our bucket
- Response: 201 Created + profile ID
- Error: 409 Conflict "You already have a profile"

GET /api/v1/candidates/upload-url?filename=photo.jpg&content_type=image/jpeg
- Returns presigned S3 URL for photo upload
- Auth: Required (candidate role)
- Validations:
  - content_type must be image/jpeg or image/png
  - filename extension must match content_type
- Response: { upload_url, photo_url }
- Error: 400 Bad Request "Invalid file type"

PATCH /api/v1/candidates/:id/draft
- Saves partial profile data as draft
- Auth: Required (candidate role, owner only)
- Body: Partial CandidateProfile data
- No validation (allows incomplete data)
- Response: 200 OK

PUT /api/v1/candidates/:id/photo
- Updates profile photo (deletes old photo from S3)
- Auth: Required (candidate role, owner only)
- Body: { profile_photo_url }
- Validations: Same as POST /api/v1/candidates
- Side effect: Deletes previous photo from S3
- Response: 200 OK
```

### User Flow

**Happy Path:**
1. Candidate registers via Story 2.1
2. After registration, redirect to `/candidate/profile/create`
3. Check if profile already exists → if yes, redirect to `/candidate/profile`
4. Candidate fills Step 1 → validates → Next
5. Candidate fills Step 2 → validates → Next
6. Candidate fills Step 3 → validates → Next
7. Candidate fills Step 4 → validates → Next
8. Candidate fills Step 5 → validates → Submit
9. API creates CandidateProfile + Experiences (validates no duplicate)
10. Success message displayed
11. Redirect to `/candidate/profile` (view mode)

**Draft Save Flow:**
1. At any step, candidate clicks "Salvar Rascunho"
2. API saves partial data (no validation)
3. Toast message: "Rascunho salvo com sucesso"
4. Auto-save occurs every 30s to localStorage

**Resume Draft Flow:**
1. Candidate returns to `/candidate/profile/create`
2. Check for existing draft in database
3. If draft exists → load data into form state
4. Resume from last incomplete step

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
- Duplicate profile creation (return 409 Conflict)
- Missing required fields (server-side validation)
- Attempt to create profile when one already exists (redirect to view)
- S3 URL from wrong bucket (reject with 400 Bad Request)
- Invalid MIME type (reject with 400 Bad Request)
- Bio contains HTML/scripts (sanitize before save)
- Photo upload timeout (show error, allow retry)
- Old photo deletion failure (log error but continue)

## Dependencies

- Story 2.1: Candidate registration completed
- AWS S3 bucket configured for media storage
- **✅ READY:** Design system `MultiStepWizard` component implemented
  - **Location:** `@talentbase/design-system/MultiStepWizard`
  - **Storybook:** Available with interactive examples
  - **Wireframe:** See [wireframe-story-3.1-multistep.md](wireframe-story-3.1-multistep.md)

## Definition of Done

- [ ] All 12 acceptance criteria validated
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing (including edge cases)
- [ ] Security validations implemented:
  - [ ] MIME type validation on backend
  - [ ] Bio sanitization (XSS prevention)
  - [ ] S3 URL validation
  - [ ] Duplicate profile prevention
- [ ] API endpoints documented
- [ ] Frontend form accessible (WCAG 2.1 AA)
- [ ] Photo upload to S3 working
- [ ] Photo deletion on update working
- [ ] Error messages user-friendly and in Portuguese
- [ ] Loading states implemented
- [ ] Auto-save functionality working
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
