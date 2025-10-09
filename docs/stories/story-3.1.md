# Story 3.1: Candidate Profile Creation (Self-Registration)

Status: Ready

**📝 UPDATED 2025-10-09**: CandidateProfile model expanded with 25 new fields from Notion CSV for complete candidate data capture and admin matching capabilities.

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
   - Step 5: Histórico de Trabalho, Bio & **Vídeo Pitch** (adicionar 1+ empresas anteriores, escrever bio, **vídeo obrigatório**)
3. Cada step tem validação client-side antes de "Próximo"
4. Botão "Salvar Rascunho" em cada step (salva progresso)
5. Botão "Anterior" preserva dados do step atual antes de navegar
6. Endpoint API `POST /api/v1/candidates` cria perfil
7. Upload de arquivo para foto de perfil (max 2MB, JPG/PNG, validação MIME no backend)
8. Foto armazenada no AWS S3, URL salva no banco de dados
9. Upload de nova foto substitui foto anterior (delete old file from S3)
10. **NOVO** Vídeo pitch obrigatório com 2 opções:
    - **Opção A**: Upload direto para S3 (max 50MB, MP4/MOV/AVI, validação MIME)
    - **Opção B**: URL do YouTube (validação de formato YouTube)
11. Vídeo armazenado no S3 (`s3://talentbase-media/pitch-videos/{candidate_id}/`) OU URL YouTube salva no banco
12. Upload de novo vídeo substitui vídeo anterior (delete old file from S3 if exists)
13. Mensagem de sucesso: "Perfil criado! Gere seu link compartilhável."
14. Redirect para `/candidate/profile` (modo visualização)
15. Prevent duplicate profile creation (user can have only one CandidateProfile)

## Tasks / Subtasks

- [ ] Task 1: Criar modelo CandidateProfile estendido (AC: 6, 7, 10)
  - [ ] Estender CandidateProfile model com todos os campos
  - [ ] Adicionar campos: position, years_experience, sales_type, sales_cycle, ticket_size
  - [ ] Adicionar campos: tools (JSONField), solutions (JSONField), departments (JSONField)
  - [ ] Adicionar campos: bio (TextField), profile_photo_url (URLField)
  - [ ] **NOVO** Adicionar campos: pitch_video_url (URLField), pitch_video_type (CharField: 's3' ou 'youtube')
  - [ ] Executar migrações Django

- [ ] Task 2: Implementar API de criação de perfil (AC: 6, 7, 8, 9, 10, 11, 12, 15)
  - [ ] Criar CandidateProfileSerializer completo
  - [ ] Criar view `POST /api/v1/candidates` com validação de duplicação
  - [ ] Implementar validação de campos obrigatórios (incluindo vídeo pitch)
  - [ ] Implementar validação MIME no backend (JPG/PNG para foto, MP4/MOV/AVI para vídeo)
  - [ ] Implementar upload para S3 (presigned URLs) para foto E vídeo
  - [ ] Implementar validação de URL YouTube (regex pattern)
  - [ ] Implementar delete de foto/vídeo antigo ao fazer upload de novo

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

> **UPDATED 2025-10-09**: Model expanded to include 25 new fields from Notion CSV. See full model specification in [tech-spec-epic-3.md](../epics/tech-spec-epic-3.md#story-31).

**CandidateProfile Core Fields (Multi-Step Form):**
```python
class CandidateProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Step 1: Basic Info
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=100, blank=True)  # DEPRECATED - use 'city'
    city = models.CharField(max_length=100, blank=True)
    profile_photo_url = models.URLField(blank=True, null=True)

    # Step 2: Position & Experience
    position = models.CharField(max_length=50)  # SDR/BDR, AE, CSM
    years_experience = models.IntegerField()
    sales_type = models.CharField(max_length=50, blank=True)  # "Inbound", "Outbound", "Both"
    sales_cycle = models.CharField(max_length=100, blank=True)  # "30-60 dias"
    avg_ticket = models.CharField(max_length=100, blank=True)  # "R$ 10k-50k MRR"

    # Step 3: Tools & Software
    top_skills = models.JSONField(default=list)  # ["Outbound", "Negociação"]
    tools_software = models.JSONField(default=list)  # ["Salesforce", "Hubspot", ...]

    # Step 4: Solutions & Departments
    solutions_sold = models.JSONField(default=list)  # ["SaaS", "Cybersecurity", ...]
    departments_sold_to = models.JSONField(default=list)  # ["IT", "Finance", ...]

    # Step 5: Work History & Bio & Pitch Video
    bio = models.TextField(blank=True)

    # **PITCH VIDEO (OBRIGATÓRIO)**
    pitch_video_url = models.URLField(help_text="URL do vídeo pitch (S3 ou YouTube)")
    pitch_video_type = models.CharField(
        max_length=10,
        choices=[('s3', 'S3 Upload'), ('youtube', 'YouTube')],
        help_text="Tipo de vídeo: upload direto (S3) ou YouTube"
    )
    # Work history in separate Experience model

    # Metadata
    status = models.CharField(max_length=20, default='available')
    is_verified = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    public_token = models.UUIDField(default=uuid.uuid4, unique=True)

    # ============ OPTIONAL FIELDS (Step 6 - Optional Preferences) ============
    # These fields are primarily for admin use (CSV import) but can be
    # optionally collected during onboarding

    # Personal & Legal
    cpf = models.CharField(max_length=255, blank=True)
    linkedin = models.URLField(blank=True)
    zip_code = models.CharField(max_length=10, blank=True)
    accepts_pj = models.BooleanField(default=False)
    is_pcd = models.BooleanField(default=False)

    # Contract & Interview (Admin only)
    contract_signed = models.BooleanField(default=False)
    interview_date = models.DateField(null=True, blank=True)

    # Mobility & Availability (Optional in Step 6)
    relocation_availability = models.CharField(max_length=50, blank=True)
    travel_availability = models.CharField(max_length=100, blank=True)
    has_drivers_license = models.BooleanField(default=False)
    has_vehicle = models.BooleanField(default=False)

    # Education & Languages (Optional in Step 6)
    academic_degree = models.CharField(max_length=200, blank=True)
    languages = models.JSONField(default=list)

    # Work Preferences & Compensation (Optional in Step 6)
    work_model = models.CharField(max_length=100, blank=True)
    positions_of_interest = models.JSONField(default=list)
    minimum_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_notes = models.TextField(blank=True)

    # Sales Experience Details (Admin/CSV import only)
    active_prospecting_experience = models.CharField(max_length=100, blank=True)
    inbound_qualification_experience = models.CharField(max_length=100, blank=True)
    portfolio_retention_experience = models.CharField(max_length=100, blank=True)
    portfolio_expansion_experience = models.CharField(max_length=100, blank=True)
    portfolio_size = models.CharField(max_length=100, blank=True)
    inbound_sales_experience = models.CharField(max_length=100, blank=True)
    outbound_sales_experience = models.CharField(max_length=100, blank=True)
    field_sales_experience = models.CharField(max_length=100, blank=True)
    inside_sales_experience = models.CharField(max_length=100, blank=True)
```

**Note**: The 25 new fields are `blank=True` and optional. Candidate onboarding form can collect a subset of these fields in an optional Step 6 (Preferences), while the full set is populated via CSV import for existing candidates.

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

> **UPDATED 2025-10-09**: Expanded to support pitch video uploads (S3 ou YouTube).

**Presigned URL Flow (Photo & Video):**
1. Frontend requests presigned URL:
   - Photo: `GET /api/v1/candidates/upload-url?filename=photo.jpg&type=photo`
   - Video: `GET /api/v1/candidates/upload-url?filename=pitch.mp4&type=video`
2. Backend validates MIME type from filename extension
3. Backend generates S3 presigned POST URL (expires in 10 minutes for videos)
4. Frontend uploads directly to S3 using presigned URL
5. Frontend sends S3 URL to backend with profile data
6. Backend validates URL is from our S3 bucket and saves
7. If updating photo/video: Backend deletes old file from S3 before saving new URL

**S3 Bucket Structure:**
```
s3://talentbase-media/
  candidate-photos/
    {candidate_id}/
      profile_{timestamp}.jpg  # timestamp prevents cache issues
  pitch-videos/
    {candidate_id}/
      pitch_{timestamp}.mp4  # timestamp prevents cache issues
```

**S3 Security & Retention:**
- Bucket policy: Private (no public read)
- Access: Via CloudFront CDN with signed URLs
- Retention: Files deleted when user account is deleted
- MIME validation: Backend verifies Content-Type header
  - **Photos**: image/jpeg or image/png
  - **Videos**: video/mp4, video/quicktime, video/x-msvideo
- Max file size:
  - **Photos**: 2MB enforced on backend
  - **Videos**: 50MB enforced on backend

**Video Options:**
1. **S3 Upload** (pitch_video_type='s3'):
   - Upload direto para S3 via presigned URL
   - Max 50MB, MP4/MOV/AVI
   - Armazenado em `s3://talentbase-media/pitch-videos/{candidate_id}/`
   - Servido via CloudFront CDN

2. **YouTube URL** (pitch_video_type='youtube'):
   - Candidato fornece URL do YouTube
   - Backend valida formato: `https://www.youtube.com/watch?v=VIDEO_ID` ou `https://youtu.be/VIDEO_ID`
   - Salva URL no campo `pitch_video_url`
   - Frontend embeda vídeo usando YouTube iframe API

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
  - **NOVO** pitch video (required) → "Vídeo pitch é obrigatório. Escolha upload de arquivo ou URL do YouTube"
    - Se S3 upload: max 50MB, MP4/MOV/AVI → "Arquivo deve ser MP4, MOV ou AVI e menor que 50MB"
    - Se YouTube: formato válido → "URL do YouTube inválida. Use formato: https://www.youtube.com/watch?v=VIDEO_ID"

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
- Body: Full CandidateProfile data + experiences array + pitch_video_url + pitch_video_type
- Validations:
  - Check if user already has a CandidateProfile (return 409 Conflict if exists)
  - Validate MIME type of profile_photo_url
  - **NOVO** Validate pitch_video_url is required
  - **NOVO** If pitch_video_type='s3': Validate S3 URL is from our bucket
  - **NOVO** If pitch_video_type='youtube': Validate YouTube URL format
  - Sanitize bio field (strip HTML, prevent XSS)
  - Validate S3 URL is from our bucket
- Response: 201 Created + profile ID
- Error: 409 Conflict "You already have a profile"
- Error: 400 Bad Request "Pitch video is required"
- Error: 400 Bad Request "Invalid YouTube URL format"

GET /api/v1/candidates/upload-url?filename=photo.jpg&content_type=image/jpeg&type=photo
- Returns presigned S3 URL for photo or video upload
- Auth: Required (candidate role)
- Query params:
  - filename: nome do arquivo
  - content_type: MIME type
  - type: 'photo' ou 'video'
- Validations:
  - If type=photo: content_type must be image/jpeg or image/png, max 2MB
  - **NOVO** If type=video: content_type must be video/mp4, video/quicktime, or video/x-msvideo, max 50MB
  - filename extension must match content_type
- Response: { upload_url, file_url }
- Error: 400 Bad Request "Invalid file type"

PATCH /api/v1/candidates/:id/draft
- Saves partial profile data as draft
- Auth: Required (candidate role, owner only)
- Body: Partial CandidateProfile data
- No validation (allows incomplete data, including missing pitch video)
- Response: 200 OK

PUT /api/v1/candidates/:id/photo
- Updates profile photo (deletes old photo from S3)
- Auth: Required (candidate role, owner only)
- Body: { profile_photo_url }
- Validations: Same as POST /api/v1/candidates
- Side effect: Deletes previous photo from S3
- Response: 200 OK

PUT /api/v1/candidates/:id/video
- Updates pitch video (deletes old video from S3 if type='s3')
- Auth: Required (candidate role, owner only)
- Body: { pitch_video_url, pitch_video_type }
- Validations:
  - If pitch_video_type='s3': Validate S3 URL is from our bucket
  - If pitch_video_type='youtube': Validate YouTube URL format
- Side effect: If type='s3', deletes previous video from S3
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
