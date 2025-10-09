# Story 3.2: Shareable Public Candidate Profile

Status: ContextReadyDraft

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)

## Story

Como um **candidato**,
Eu quero **gerar um link público compartilhável do meu perfil**,
Para que **eu possa compartilhá-lo no LinkedIn e com recrutadores**.

## Acceptance Criteria

1. Botão "Gerar Link Compartilhável" no dashboard do candidato
2. Endpoint API `POST /api/v1/candidates/:id/generate-share-token`
3. Token único gerado (UUID), armazenado no banco de dados
4. Formato da URL pública: `https://www.salesdog.click/share/candidate/:token`
5. Página pública renderizada em `/share/candidate/:token` (sem autenticação requerida)
6. Perfil público exibe:
   - Nome, foto, posição, localização
   - Anos de experiência, especialização em vendas
   - Ferramentas & software proficiency (badges)
   - Soluções vendidas, departamentos (tags)
   - Histórico de trabalho (empresa, cargo, datas)
   - Bio/resumo
   - Botão "Contatar via TalentBase" (abre formulário de contato → admin)
7. Perfil público exclui: email, telefone, expectativas salariais
8. Candidato pode regenerar token (invalida link antigo)
9. Candidato pode desabilitar compartilhamento público (retorna 404 no token)
10. Perfil público é otimizado para SEO (meta tags, OG tags para preview no LinkedIn)

## Tasks / Subtasks

- [ ] Task 1: Adicionar campo share_token ao modelo (AC: 2, 3)
  - [ ] Adicionar campo `share_token` (UUIDField) ao CandidateProfile
  - [ ] Adicionar campo `public_sharing_enabled` (BooleanField, default=False)
  - [ ] Executar migrações Django

- [ ] Task 2: Implementar API de geração de token (AC: 2, 3, 8, 9)
  - [ ] Criar endpoint `POST /api/v1/candidates/:id/generate-share-token`
  - [ ] Gerar UUID único
  - [ ] Endpoint `PATCH /api/v1/candidates/:id/toggle-sharing`
  - [ ] Validar apenas owner pode gerar token

- [ ] Task 3: Criar página pública do candidato (AC: 4, 5, 6, 7)
  - [ ] Criar route `/share/candidate/:token` (pública, sem auth)
  - [ ] Endpoint `GET /api/v1/public/candidates/:token`
  - [ ] Renderizar perfil completo exceto dados privados
  - [ ] Implementar botão "Contatar via TalentBase"

- [ ] Task 4: Implementar funcionalidade de contato (AC: 6)
  - [ ] Modal de contato com formulário (nome, email, mensagem)
  - [ ] Endpoint `POST /api/v1/public/candidates/:token/contact`
  - [ ] Enviar email para admin com dados de contato

- [ ] Task 5: Implementar SEO e meta tags (AC: 10)
  - [ ] Meta tags: title, description
  - [ ] OG tags: og:title, og:description, og:image (foto do candidato)
  - [ ] Twitter cards
  - [ ] Schema.org Person markup

## Dev Notes

### Database Changes

**CandidateProfile Model Update:**
```python
class CandidateProfile(models.Model):
    # ... existing fields ...

    # Public Sharing
    share_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    public_sharing_enabled = models.BooleanField(default=False)
    share_link_generated_at = models.DateTimeField(null=True, blank=True)
```

### API Endpoints

```
POST /api/v1/candidates/:id/generate-share-token
- Generates new UUID token for candidate
- Sets public_sharing_enabled = True
- Auth: Required (candidate role, owner only)
- Response: { share_token, share_url }

PATCH /api/v1/candidates/:id/toggle-sharing
- Enable/disable public sharing
- Auth: Required (candidate role, owner only)
- Body: { enabled: true/false }
- Response: { public_sharing_enabled }

GET /api/v1/public/candidates/:token
- Fetches candidate profile by share token
- Auth: NOT required (public endpoint)
- Returns profile data excluding private fields
- Returns 404 if token invalid or sharing disabled

POST /api/v1/public/candidates/:token/contact
- Sends contact request to admin
- Auth: NOT required
- Body: { name, email, message }
- Sends email to admin with contact details
- Response: 200 OK
```

### Public Profile Data Structure

**Public Data (Included):**
- name
- profile_photo_url
- position
- location (city only)
- years_experience
- sales_type (Inbound/Outbound)
- sales_model (Inside/Field)
- sales_cycle
- ticket_size
- tools (array)
- solutions (array)
- departments (array)
- bio
- experiences (company, role, dates - no descriptions)
- verified badge

**Private Data (Excluded):**
- email
- phone
- user_id
- status
- internal notes
- salary expectations (future field)

### SEO Optimization

**Meta Tags Example:**
```html
<title>João Silva - Account Executive | TalentBase</title>
<meta name="description" content="Senior AE with 5 years experience in SaaS sales. Expert in Salesforce, Hubspot. Specialized in IT and C-Level sales." />

<!-- Open Graph (LinkedIn, Facebook) -->
<meta property="og:title" content="João Silva - Account Executive" />
<meta property="og:description" content="Senior AE with 5 years experience..." />
<meta property="og:image" content="https://s3.amazonaws.com/.../profile.jpg" />
<meta property="og:url" content="https://www.salesdog.click/share/candidate/abc123" />
<meta property="og:type" content="profile" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="João Silva - Account Executive" />
<meta name="twitter:description" content="Senior AE with 5 years experience..." />
<meta name="twitter:image" content="https://s3.amazonaws.com/.../profile.jpg" />

<!-- Schema.org -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "João Silva",
  "jobTitle": "Account Executive",
  "description": "Senior AE with 5 years experience...",
  "image": "https://s3.amazonaws.com/.../profile.jpg",
  "url": "https://www.salesdog.click/share/candidate/abc123"
}
</script>
```

### Frontend Components

**Public Profile Page Layout:**
```
┌─────────────────────────────────────┐
│  Header (TalentBase logo, Login)   │
├─────────────────────────────────────┤
│  ┌───────────┐  João Silva         │
│  │   Photo   │  Account Executive  │
│  │           │  São Paulo, SP      │
│  └───────────┘  5 anos de experiência│
│                                     │
│  [Contatar via TalentBase]          │
├─────────────────────────────────────┤
│  Sobre                              │
│  Bio text...                        │
├─────────────────────────────────────┤
│  Especialização                     │
│  Outbound | Field Sales             │
│  Ciclo: 3-6 meses | Ticket: 60-120K │
├─────────────────────────────────────┤
│  Ferramentas                        │
│  [Salesforce] [Hubspot] [Apollo]    │
├─────────────────────────────────────┤
│  Soluções & Departamentos           │
│  Soluções: SaaS, Cybersecurity      │
│  Departamentos: IT, C-Level         │
├─────────────────────────────────────┤
│  Experiência Profissional           │
│  • Company A - AE (2020-2023)       │
│  • Company B - SDR (2018-2020)      │
├─────────────────────────────────────┤
│  Footer (TalentBase branding)       │
└─────────────────────────────────────┘
```

**Contact Modal:**
- Form fields: Nome, Email, Mensagem
- Submit sends email to admin@salesdog.click
- Success message: "Mensagem enviada! Entraremos em contato em breve."

### User Flow

**Generate Share Link:**
1. Candidate on `/candidate/profile`
2. Clicks "Gerar Link Compartilhável"
3. API generates UUID token, sets public_sharing_enabled=true
4. Success message: "Link gerado!"
5. Copy button displays share URL
6. Candidate can share on LinkedIn, email, etc.

**Regenerate Token:**
1. Candidate clicks "Regenerar Link"
2. Confirmation modal: "Isso invalidará o link anterior. Continuar?"
3. API generates new UUID, old token becomes invalid
4. New URL displayed

**Disable Sharing:**
1. Candidate clicks "Desabilitar Compartilhamento"
2. API sets public_sharing_enabled=false
3. Public URL returns 404
4. Can re-enable anytime

**Public View:**
1. Anyone accesses `/share/candidate/:token`
2. If token valid and sharing enabled → show profile
3. If invalid or disabled → 404 page
4. Click "Contatar" → modal opens
5. Submit contact form → email sent to admin

### Testing Considerations

**Unit Tests:**
- Token generation (UUID uniqueness)
- Public data serialization (excludes private fields)
- Sharing enable/disable toggle

**Integration Tests:**
- Generate token flow
- Public profile access (authenticated vs public)
- Contact form submission
- Token regeneration invalidates old token

**Edge Cases:**
- Token not found (404)
- Sharing disabled (404)
- Invalid contact form data (validation errors)
- Multiple token regenerations

### Security Considerations

- UUIDs are unguessable (128-bit randomness)
- No sensitive data exposed on public profile
- Rate limiting on contact form (prevent spam)
- CSRF protection on contact form
- Email validation on contact form

## Dependencies

- Story 3.1: Candidate profile creation completed
- Email notification system (Epic 2)
- Design system public profile template

## Definition of Done

- [ ] All 10 acceptance criteria validated
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Public profile renders correctly
- [ ] Meta tags validated (LinkedIn preview working)
- [ ] Contact form emails working
- [ ] Code reviewed and merged
- [ ] Deployed to staging
- [ ] QA sign-off
- [ ] LinkedIn share preview tested

## Dev Agent Record

### Context Reference

- [Story Context XML](../stories-context/story-context-3.2.xml) - Generated 2025-10-09

### Agent Model Used

Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

### Completion Notes List

### File List
