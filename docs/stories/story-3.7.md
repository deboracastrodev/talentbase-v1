# Story 3.7: Candidate Profile Editing

Status: Not Started

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)

## Story

Como um **candidato**,
Eu quero **editar minhas informações de perfil**,
Para que **eu possa mantê-lo atualizado**.

## Acceptance Criteria

1. Página de edição de perfil em `/candidate/profile/edit`
2. Formulário pré-populado com dados atuais
3. Mesmo wizard multi-step da criação (ou formulário de página única)
4. Todos os campos editáveis (exceto email → requer fluxo de verificação)
5. Upload de foto para substituir a existente
6. Endpoint API `PATCH /api/v1/candidates/:id`
7. Mudanças salvas imediatamente (ou botão "Salvar Alterações")
8. Mensagem de sucesso: "Perfil atualizado com sucesso"
9. Se link compartilhável é público, mudanças refletem imediatamente na página pública
10. Validação igual à criação

## Tasks / Subtasks

- [ ] Task 1: Criar página de edição (AC: 1, 2)
  - [ ] Criar route `/candidate/profile/edit`
  - [ ] Endpoint `GET /api/v1/candidates/me` para carregar dados
  - [ ] Pre-popular formulário com dados atuais

- [ ] Task 2: Implementar formulário de edição (AC: 3, 4, 5)
  - [ ] Reutilizar wizard multi-step ou criar formulário single-page
  - [ ] Todos campos editáveis (exceto email)
  - [ ] Upload de nova foto (sobrescreve antiga no S3)

- [ ] Task 3: Implementar API de atualização (AC: 6, 9)
  - [ ] Endpoint `PATCH /api/v1/candidates/:id`
  - [ ] Permitir atualização parcial (apenas campos modificados)
  - [ ] Validação server-side
  - [ ] Permissão: apenas owner pode editar

- [ ] Task 4: Implementar feedback e redirect (AC: 7, 8)
  - [ ] Mensagem de sucesso após save
  - [ ] Opção: permanecer na página ou voltar para visualização
  - [ ] Loading state durante save

- [ ] Task 5: Validar reflexo em perfil público (AC: 9)
  - [ ] Testar que mudanças aparecem imediatamente em `/share/candidate/:token`
  - [ ] Cache invalidation (se aplicável)

## Dev Notes

### Edit Form Options

**Option 1: Multi-Step Wizard (Same as Creation)**
- Pros: Consistent UX with creation flow
- Cons: More clicks to edit single field
- Use case: Major profile updates

**Option 2: Single Page Form**
- Pros: Quick edits, all fields visible
- Cons: Long form, may be overwhelming
- Use case: Small updates (e.g., update phone)

**Recommended: Tabbed Single Page Form**
- Tabs: Básico | Experiência | Ferramentas | Histórico
- Edit any tab, save applies all changes
- Best of both worlds

### Tabbed Form Layout

```
┌─────────────────────────────────────────────────────────┐
│  Editar Perfil                              [Cancelar]  │
├─────────────────────────────────────────────────────────┤
│  [Básico] [Experiência] [Ferramentas] [Histórico]      │
├─────────────────────────────────────────────────────────┤
│  ── Tab: Básico ──                                      │
│                                                         │
│  Foto de Perfil:                                        │
│  ┌─────────┐                                            │
│  │  Photo  │  [Upload Nova Foto]                        │
│  └─────────┘                                            │
│                                                         │
│  Nome:        [João Silva_____________]                 │
│  Telefone:    [11 99999-9999_________]                  │
│  Localização: [São Paulo, SP_________]                  │
│                                                         │
│  ── Tab: Experiência ──                                 │
│  (shown when tab clicked)                               │
│                                                         │
│  Posição:     [AE (Account Executive) ▾]                │
│  Anos:        [5___]                                    │
│  Tipo Vendas: ☑ Outbound  ☐ Inbound                    │
│  Modelo:      ☑ Field Sales  ☐ Inside Sales            │
│  Ciclo:       [3-6 meses ▾]                             │
│  Ticket:      [60-120K ▾]                               │
│                                                         │
│  ── Tab: Ferramentas ──                                 │
│  (shown when tab clicked)                               │
│                                                         │
│  Ferramentas: ☑ Salesforce  ☑ Hubspot  ☐ Apollo        │
│  Soluções:    ☑ SaaS  ☑ Fintech  ☐ HR Tech             │
│  Departamentos: ☑ IT  ☑ C-Level  ☐ Finance             │
│                                                         │
│  ── Tab: Histórico ──                                   │
│  (shown when tab clicked)                               │
│                                                         │
│  Bio:                                                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Experienced AE with 5 years in SaaS sales...      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Experiências:                                          │
│  • Tech Startup - AE (2020-2023) [Editar] [Remover]    │
│  • SaaS Co - SDR (2018-2020) [Editar] [Remover]        │
│  [+ Adicionar Experiência]                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                         [Cancelar]  [Salvar Alterações] │
└─────────────────────────────────────────────────────────┘
```

### API Endpoints

```
GET /api/v1/candidates/me
- Returns authenticated candidate's profile
- Auth: Required (candidate role)
- Response: Full CandidateProfile object

PATCH /api/v1/candidates/:id
- Updates candidate profile (partial update)
- Auth: Required (candidate role, owner only)
- Body: Any CandidateProfile fields (partial)
- Example: { phone: "11 98888-8888", bio: "Updated bio..." }
- Validates only provided fields
- Response: Updated CandidateProfile object

POST /api/v1/candidates/:id/upload-photo
- Handles photo replacement
- Auth: Required (candidate role, owner only)
- Body: multipart/form-data with photo file
- Deletes old photo from S3, uploads new one
- Response: { profile_photo_url }
```

### Photo Replacement Logic

**Service Method:**
```python
class CandidateService:
    @staticmethod
    def replace_profile_photo(candidate_id, new_photo_file):
        candidate = CandidateProfile.objects.get(id=candidate_id)

        # Delete old photo from S3
        if candidate.profile_photo_url:
            old_photo_key = extract_s3_key(candidate.profile_photo_url)
            s3_client.delete_object(
                Bucket=settings.S3_BUCKET,
                Key=old_photo_key
            )

        # Upload new photo
        new_photo_key = f"candidate-photos/{candidate.user_id}/profile.jpg"
        s3_client.upload_fileobj(
            new_photo_file,
            settings.S3_BUCKET,
            new_photo_key,
            ExtraArgs={'ContentType': 'image/jpeg'}
        )

        # Update profile
        candidate.profile_photo_url = f"https://{settings.S3_BUCKET}.s3.amazonaws.com/{new_photo_key}"
        candidate.save()

        return candidate
```

### Form State Management

**React State (Remix):**
```tsx
export default function EditProfile() {
  const { candidate } = useLoaderData()
  const [formData, setFormData] = useState(candidate)
  const [activeTab, setActiveTab] = useState('basico')

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async () => {
    // Only send changed fields
    const changedFields = getChangedFields(candidate, formData)
    await updateCandidate(changedFields)
    toast.success('Perfil atualizado com sucesso!')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="basico">Básico</Tab>
        <Tab value="experiencia">Experiência</Tab>
        <Tab value="ferramentas">Ferramentas</Tab>
        <Tab value="historico">Histórico</Tab>
      </Tabs>

      {activeTab === 'basico' && <BasicInfoTab data={formData} onChange={handleChange} />}
      {activeTab === 'experiencia' && <ExperienceTab data={formData} onChange={handleChange} />}
      {/* ... */}

      <Button type="submit">Salvar Alterações</Button>
    </form>
  )
}
```

### Validation Rules

**Same as Creation (Story 3.1):**
- Phone: valid format
- Location: required
- Position: required, one of predefined
- Years experience: number >= 0
- Bio: min 100 characters
- Tools: at least 1 selected
- Solutions: at least 1 selected
- Experiences: at least 1 entry

**Additional Edit Rules:**
- Email: NOT editable in this story (future: email verification flow)
- All other fields: editable

### Experience CRUD (Sub-form)

**Add Experience:**
- Click "+ Adicionar Experiência"
- Modal opens with form: company, role, start_date, end_date, description
- Submit creates new Experience record

**Edit Experience:**
- Click "Editar" on experience item
- Modal opens pre-populated
- Submit updates Experience record

**Delete Experience:**
- Click "Remover"
- Confirmation: "Tem certeza que deseja remover esta experiência?"
- Submit deletes Experience record

**API Endpoints:**
```
POST /api/v1/candidates/:id/experiences
- Creates new experience
- Body: { company_name, role, start_date, end_date, description }

PATCH /api/v1/candidates/:id/experiences/:exp_id
- Updates experience
- Body: (partial update)

DELETE /api/v1/candidates/:id/experiences/:exp_id
- Deletes experience
```

### Public Profile Cache Invalidation

**If using caching:**
```python
# In update_candidate service method
def update_candidate(candidate_id, data):
    candidate = CandidateProfile.objects.get(id=candidate_id)

    # Update fields
    for field, value in data.items():
        setattr(candidate, field, value)
    candidate.save()

    # Invalidate public profile cache
    if candidate.public_sharing_enabled:
        cache_key = f"public_profile:{candidate.share_token}"
        cache.delete(cache_key)

    return candidate
```

**If NOT using caching:**
- No action needed, changes reflect immediately

### Unsaved Changes Warning

**Prompt before leaving:**
```tsx
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault()
      e.returnValue = 'Você tem alterações não salvas. Deseja sair?'
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [hasUnsavedChanges])
```

### Success Feedback

**Options:**

**Option 1: Toast Notification**
```tsx
toast.success('Perfil atualizado com sucesso!')
// Stay on edit page
```

**Option 2: Redirect to View Mode**
```tsx
toast.success('Perfil atualizado!')
navigate('/candidate/profile')
```

**Option 3: Banner on Same Page**
```tsx
<Banner type="success">
  Perfil atualizado com sucesso!
  <a href="/candidate/profile">Ver perfil</a>
</Banner>
```

### Testing Considerations

**Unit Tests:**
- Form validation (all rules)
- Partial update (only changed fields sent)
- Photo replacement (old photo deleted)

**Integration Tests:**
- Edit profile flow (load → edit → save → verify)
- Experience CRUD (add, edit, delete)
- Public profile reflects changes immediately

**Edge Cases:**
- Edit without making changes (no API call)
- Concurrent edits (optimistic locking)
- Photo upload fails (rollback)
- Large photo file (>2MB rejected)
- Invalid photo format (not JPG/PNG)

### Permissions

**Owner Only:**
- Candidate can only edit own profile
- API checks: `candidate.user_id == request.user.id`
- 403 Forbidden if not owner

**Admin Override:**
- Admin can edit any candidate (Story 3.4)
- Uses different endpoint: `PATCH /api/v1/admin/candidates/:id`

## Dependencies

- Story 3.1: Candidate profile creation (model, validation)
- Story 3.6: Candidate dashboard (link to edit page)

## Definition of Done

- [ ] All 10 acceptance criteria validated
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Form validation working
- [ ] Photo upload/replacement working
- [ ] Experience CRUD working
- [ ] Public profile updates immediately
- [ ] Unsaved changes warning working
- [ ] Code reviewed and merged
- [ ] Deployed to staging
- [ ] QA sign-off
