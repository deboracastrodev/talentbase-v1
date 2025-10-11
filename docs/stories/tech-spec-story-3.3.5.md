# talentbase - Technical Specification: Story 3.3.5 Admin Complete Candidate Creation

**Author:** Debora
**Date:** 2025-10-10
**Project Level:** Level 1 (Single Feature Enhancement)
**Project Type:** Web application (SaaS)
**Development Context:** Brownfield - Extending existing admin candidate creation

---

## Source Tree Structure

### Frontend (Remix/React) - Reutilizando Componentes Existentes

```
packages/web/app/
├── routes/
│   └── admin.candidates.new.tsx               # MODIFY: Refactor to use MultiStepWizard
│
├── components/
│   ├── candidate/                             # REUSE: Existing components
│   │   ├── ToolsSelector.tsx                  # ✅ Already exists - REUSE
│   │   ├── SolutionsSelector.tsx              # ✅ Already exists - REUSE
│   │   ├── DepartmentsSelector.tsx            # ✅ Already exists - REUSE
│   │   ├── PhotoUpload.tsx                    # ✅ Already exists - REUSE
│   │   ├── VideoUpload.tsx                    # ✅ Already exists - REUSE
│   │   └── ExperienceEditor.tsx               # ✅ Already exists - REUSE
│   │
│   └── admin/                                 # NEW: Admin-specific components (minimal)
│       └── LanguageInput.tsx                  # NEW: Language + proficiency input (if not exists)
│
├── lib/
│   └── api/
│       └── candidates.ts                      # MODIFY: Update AdminCreateCandidate type
│
└── utils/
    ├── formatting.ts                          # ✅ Already has formatPhone - REUSE
    └── validation.ts                          # ✅ Already has validatePhone - REUSE
```

### Design System Components (Already Available)

```
@talentbase/design-system:
├── MultiStepWizard                            # ✅ Already exists - REUSE
├── Input, Select, Textarea, Button            # ✅ Already exists - REUSE
└── Alert                                      # ✅ Already exists - REUSE
```

### Backend (Django)

```
apps/api/candidates/
├── models.py                                  # NO CHANGE: CandidateProfile already complete
├── serializers.py                             # MODIFY: AdminCreateCandidateSerializer accept all fields
├── views.py                                   # MODIFY: admin_create_candidate handle all fields
└── tests/
    └── test_admin_creation.py                 # MODIFY: Add test coverage for new fields
```

### Key File Changes Summary

**REUSE - 9 componentes já existem:**
- `MultiStepWizard` (design system)
- `ToolsSelector`, `SolutionsSelector`, `DepartmentsSelector`
- `PhotoUpload`, `VideoUpload`, `ExperienceEditor`
- `Input`, `Select`, `Textarea`, `Alert` (design system)
- `formatPhone`, `validatePhone` (utils)

**1 NEW component (opcional):**
- `LanguageInput.tsx` - Se não existir componente de idiomas

**2 MODIFIED files:**
1. `admin.candidates.new.tsx` - Implementar wizard similar ao `candidate.profile.create.tsx` mas com TODOS os campos do modelo
2. `serializers.py` - Aceitar todos os campos do CandidateProfile
3. `test_admin_creation.py` - Adicionar cobertura para novos campos

---

## Technical Approach

### Overview

Esta story estende a funcionalidade existente de criação manual de candidatos pelo admin (Story 3.3.5 backend já implementado) para incluir **TODOS os campos do modelo CandidateProfile**.

**Contexto atual:**
- Backend já implementado e testado (8/8 testes passando)
- Frontend atual: formulário simples com apenas 5 campos (email, nome, telefone, cidade, posição)
- Wizard de candidato (`candidate.profile.create.tsx`) já existe com 5 steps
- Componentes reutilizáveis já disponíveis no design system

**Objetivo:**
Refatorar `admin.candidates.new.tsx` para usar o mesmo padrão de wizard do auto-cadastro, mas permitindo que o admin preencha **todos os 60+ campos** do CandidateProfile de uma vez.

### Strategy: Component Reuse + Field Extension

#### 1. Reutilizar Arquitetura Existente

Usar como referência `candidate.profile.create.tsx` (lines 88-546):
- `MultiStepWizard` component do design system
- Mesmo padrão de gerenciamento de estado (`useState` + `updateFormData`)
- Auto-save de draft em localStorage
- Validação por step antes de avançar

#### 2. Estender Steps com Campos Adicionais do Admin

O wizard do candidato tem 5 steps. O admin precisa dos mesmos + campos extras:

**Step 1: Informações Básicas (EXTENDED)**
- Campos existentes: full_name, phone, city, profile_photo_url
- **Novos campos admin:** linkedin, cpf, zip_code

**Step 2: Posição & Experiência (EXTENDED)**
- Campos existentes: current_position, years_of_experience, sales_type, sales_cycle, avg_ticket
- **Novos campos admin:** academic_degree, bio

**Step 3: Ferramentas & Habilidades (EXTENDED)**
- Campos existentes: tools_software
- **Novos campos admin:** top_skills, languages (JSON array)

**Step 4: Soluções & Departamentos (SAME)**
- Sem mudanças: solutions_sold, departments_sold_to

**Step 5: Preferências de Trabalho (NEW)**
- **Campos admin:** work_model, relocation_availability, travel_availability, accepts_pj, pcd/is_pcd, position_interest, minimum_salary, salary_notes, has_drivers_license, has_vehicle

**Step 6: Histórico & Vídeo (EXTENDED)**
- Campos existentes: experiences, pitch_video_url, pitch_video_type
- **Novos campos admin:** contract_signed, interview_date

### 3. Backend Integration

O backend já aceita todos os campos via `AdminCreateCandidateSerializer`. Frontend precisa apenas:

1. **Atualizar tipo TypeScript** em `lib/api/candidates.ts`:
```typescript
interface AdminCreateCandidatePayload {
  // Básicos
  email: string;
  full_name: string;
  phone: string;
  city?: string;
  linkedin?: string;
  cpf?: string;
  zip_code?: string;

  // Profissionais
  current_position?: string;
  years_of_experience?: number;
  sales_type?: string;
  sales_cycle?: string;
  avg_ticket?: string;
  academic_degree?: string;

  // Habilidades
  top_skills?: string[];
  tools_software?: string[];
  solutions_sold?: string[];
  departments_sold_to?: string[];
  languages?: Array<{name: string, level: string}>;

  // Preferências
  work_model?: 'remote' | 'hybrid' | 'onsite';
  relocation_availability?: string;
  travel_availability?: string;
  accepts_pj?: boolean;
  pcd?: boolean;
  is_pcd?: boolean;
  position_interest?: string;
  minimum_salary?: number;
  salary_notes?: string;
  has_drivers_license?: boolean;
  has_vehicle?: boolean;

  // Histórico
  bio?: string;
  pitch_video_url?: string;
  pitch_video_type?: 's3' | 'youtube';
  experiences?: Experience[];
  contract_signed?: boolean;
  interview_date?: string;

  // Admin-specific
  send_welcome_email?: boolean;
}
```

2. **Chamar API existente** `POST /api/v1/candidates/admin/candidates/create`

### 4. Validation Strategy

**Client-side (Progressive):**
- Step 1-3: Campos obrigatórios conforme modelo
- Step 4-6: Campos opcionais, permitir skip
- Validação inline com feedback visual

**Server-side:**
- Backend já valida via Django serializer
- Frontend trata erros 400 (duplicate email, validation errors)

### 5. UX Enhancements for Admin

**Diferenças vs. auto-cadastro do candidato:**

| Feature | Candidate Wizard | Admin Wizard |
|---------|------------------|--------------|
| Email field | Not in form (from auth) | **Step 1 - Required** |
| CPF | Optional | **Admin can fill** |
| Languages | Not present | **Admin can add** |
| Work preferences | Not present | **New Step 5** |
| Contract/Interview | Not present | **Step 6 admin fields** |
| Welcome email | Auto-sent | **Optional checkbox** |
| Draft save | localStorage | localStorage |

**Admin-specific features:**
- Checkbox "Enviar email de boas-vindas" no final (default: unchecked)
- "Criar outro candidato" após sucesso com opção de copiar preferências
- Indicador de completude do perfil (% de campos preenchidos)

### 6. Data Flow

```
Admin fills form (6 steps)
    ↓
Client-side validation per step
    ↓
Auto-save draft to localStorage every 30s
    ↓
Final step: Admin clicks "Criar Candidato"
    ↓
POST /api/v1/candidates/admin/candidates/create
    ↓
Backend creates User + CandidateProfile
    ↓
If send_welcome_email=true: Queue Celery task
    ↓
Response 201: {success, candidate, email_sent}
    ↓
Frontend: Toast + Redirect to /admin/candidates?created=true
```

---

## Implementation Stack

### Frontend Stack (Definitive Versions)

**Framework & Runtime:**
- **React 18.2.0** - UI library
- **Remix 2.x** - Full-stack React framework
- **TypeScript 5.x** - Type safety
- **Vite 5.x** - Build tool

**UI Components & Design:**
- **@talentbase/design-system 1.0.0** - Internal design system
  - `MultiStepWizard` - Multi-step form container
  - `Input`, `Select`, `Textarea`, `Button` - Form controls
  - `Alert` - Notifications
- **Tailwind CSS 3.4+** - Utility-first CSS
- **Lucide React** - Icon library

**Form & Validation:**
- **Zod** - Schema validation (optional, for complex validation)
- **React hooks** - Built-in state management (`useState`, `useEffect`)

**Existing Reusable Components:**
- `ToolsSelector.tsx` - Multi-select for tools/software
- `SolutionsSelector.tsx` - Multi-select for solutions
- `DepartmentsSelector.tsx` - Multi-select for departments
- `PhotoUpload.tsx` - S3 photo upload with presigned URLs
- `VideoUpload.tsx` - S3/YouTube video upload
- `ExperienceEditor.tsx` - Dynamic experience list editor

**Utilities:**
- `formatPhone()` - Brazilian phone mask formatting
- `validatePhone()` - Phone number validation

### Backend Stack (Definitive Versions)

**Framework:**
- **Django 5.x** - Web framework
- **Django REST Framework 3.14+** - API toolkit
- **Python 3.11+** - Runtime

**Database:**
- **PostgreSQL 15+** - Primary database
- **Redis** - Cache + Celery broker

**Background Tasks:**
- **Celery** - Async task queue (for welcome emails)

**Authentication:**
- **JWT (djangorestframework-simplejwt)** - Token-based auth

**Storage:**
- **AWS S3** - File storage (photos, videos)

### API Endpoints (Already Implemented)

**Create Candidate (Admin):**
```
POST /api/v1/candidates/admin/candidates/create
Headers: Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "candidate": {
    "id": "uuid",
    "email": "string",
    "full_name": "string"
  },
  "email_sent": boolean
}
```

### Environment Variables

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:8000  # Backend API base URL
```

**Backend (.env):**
```bash
# Already configured
FRONTEND_URL=http://localhost:3000
AWS_S3_BUCKET_NAME=talentbase-uploads
EMAIL_HOST=smtp.example.com
CELERY_BROKER_URL=redis://localhost:6379/0
```

### Development Tools

**Code Quality:**
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

**Testing:**
- **Pytest** - Backend unit tests (already passing)
- **Playwright** - E2E tests (optional for this story)

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Targets

- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Form submission:** < 500ms response time
- **Auto-save debounce:** 30 seconds

---

## Technical Details

### Component Structure: admin.candidates.new.tsx

**File Location:** `packages/web/app/routes/admin.candidates.new.tsx`

**Reference Implementation:** `candidate.profile.create.tsx` (lines 88-546)

#### Form State Interface

```typescript
interface AdminCandidateFormData {
  // Step 1: Informações Básicas
  email: string;                    // REQUIRED - Admin-specific (candidate gets from auth)
  full_name: string;                // REQUIRED
  phone: string;                    // REQUIRED
  city: string;                     // REQUIRED
  linkedin?: string;                // Optional
  cpf?: string;                     // Optional (will be encrypted backend)
  zip_code?: string;                // Optional
  profile_photo_url?: string;       // Optional (S3 upload)

  // Step 2: Posição & Experiência
  current_position: string;         // REQUIRED
  years_of_experience: number;      // REQUIRED
  sales_type: string;               // REQUIRED (Inbound/Outbound/Both)
  sales_cycle?: string;             // Optional
  avg_ticket?: string;              // Optional
  academic_degree?: string;         // Optional
  bio?: string;                     // Optional

  // Step 3: Ferramentas & Habilidades
  tools_software: string[];         // REQUIRED (min 1)
  top_skills?: string[];            // Optional
  languages?: Array<{               // Optional
    name: string;
    level: string;  // 'Básico' | 'Intermediário' | 'Avançado' | 'Fluente' | 'Nativo'
  }>;

  // Step 4: Soluções & Departamentos
  solutions_sold: string[];         // REQUIRED (min 1)
  departments_sold_to: string[];    // REQUIRED (min 1)

  // Step 5: Preferências de Trabalho
  work_model?: 'remote' | 'hybrid' | 'onsite';
  relocation_availability?: string;
  travel_availability?: string;
  accepts_pj?: boolean;
  pcd?: boolean;
  is_pcd?: boolean;                 // Alternate field for CSV compatibility
  position_interest?: string;
  minimum_salary?: number;
  salary_notes?: string;
  has_drivers_license?: boolean;
  has_vehicle?: boolean;

  // Step 6: Histórico & Vídeo
  experiences: Experience[];
  pitch_video_url?: string;         // Optional
  pitch_video_type?: 's3' | 'youtube';
  contract_signed?: boolean;
  interview_date?: string;          // ISO date string

  // Final step: Admin options
  send_welcome_email: boolean;      // Default: false
}
```

#### Wizard Steps Configuration

```typescript
const steps = [
  {
    id: '1',
    label: 'Informações Básicas',
    description: 'Email, nome, telefone e contatos',
  },
  {
    id: '2',
    label: 'Posição & Experiência',
    description: 'Cargo, tempo de experiência e formação',
  },
  {
    id: '3',
    label: 'Ferramentas & Habilidades',
    description: 'Tecnologias, skills e idiomas',
  },
  {
    id: '4',
    label: 'Soluções & Departamentos',
    description: 'Experiência por segmento e buyer persona',
  },
  {
    id: '5',
    label: 'Preferências de Trabalho',
    description: 'Modelo de trabalho, disponibilidade e remuneração',
  },
  {
    id: '6',
    label: 'Histórico & Vídeo',
    description: 'Experiências profissionais e vídeo pitch',
  },
];
```

#### Step-by-Step Validation Rules

```typescript
const validateCurrentStep = (step: number, formData: AdminCandidateFormData): boolean => {
  switch (step) {
    case 0: // Step 1: Básico
      return !!(
        formData.email &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
        formData.full_name.trim() &&
        formData.phone &&
        validatePhone(formData.phone).isValid &&
        formData.city.trim()
      );

    case 1: // Step 2: Posição
      return !!(
        formData.current_position &&
        formData.years_of_experience > 0 &&
        formData.sales_type
      );

    case 2: // Step 3: Ferramentas
      return formData.tools_software.length > 0;

    case 3: // Step 4: Soluções
      return (
        formData.solutions_sold.length > 0 &&
        formData.departments_sold_to.length > 0
      );

    case 4: // Step 5: Preferências (all optional)
      return true;

    case 5: // Step 6: Histórico (all optional)
      return true;

    default:
      return false;
  }
};
```

### Step Implementations

#### Step 1: Informações Básicas

```typescript
// New fields vs candidate wizard:
<div>
  <label>Email *</label>
  <Input
    type="email"
    required
    value={formData.email}
    onChange={(e) => updateFormData({ email: e.target.value })}
    placeholder="candidato@exemplo.com"
  />
</div>

<div>
  <label>CPF (opcional)</label>
  <Input
    type="text"
    value={formData.cpf}
    onChange={(e) => updateFormData({ cpf: formatCPF(e.target.value) })}
    placeholder="000.000.000-00"
  />
  <p className="text-xs text-gray-500">Será criptografado no banco</p>
</div>

<div>
  <label>CEP (opcional)</label>
  <Input
    type="text"
    value={formData.zip_code}
    onChange={(e) => updateFormData({ zip_code: e.target.value })}
    placeholder="00000-000"
  />
</div>

<div>
  <label>LinkedIn (opcional)</label>
  <Input
    type="url"
    value={formData.linkedin}
    onChange={(e) => updateFormData({ linkedin: e.target.value })}
    placeholder="https://linkedin.com/in/username"
  />
</div>

// Reuse existing:
<PhotoUpload
  onUploadComplete={(url) => updateFormData({ profile_photo_url: url })}
  currentPhotoUrl={formData.profile_photo_url}
/>
```

#### Step 3: Ferramentas & Habilidades (Extended)

```typescript
// Existing component:
<ToolsSelector
  selected={formData.tools_software}
  onChange={(tools) => updateFormData({ tools_software: tools })}
/>

// NEW: Top Skills (similar pattern)
<div>
  <label>Principais Habilidades (opcional)</label>
  <TagInput
    placeholder="Digite e pressione Enter"
    tags={formData.top_skills || []}
    onChange={(skills) => updateFormData({ top_skills: skills })}
    suggestions={['Negociação', 'Prospecção', 'Apresentação', 'Cold Call']}
  />
</div>

// NEW: Languages
<div>
  <label>Idiomas (opcional)</label>
  <LanguageInput
    languages={formData.languages || []}
    onChange={(languages) => updateFormData({ languages })}
  />
</div>
```

#### Step 5: Preferências de Trabalho (NEW)

```typescript
<div className="space-y-6">
  <div>
    <label>Modelo de Trabalho</label>
    <Select
      value={formData.work_model || ''}
      onChange={(e) => updateFormData({ work_model: e.target.value })}
      options={[
        { value: '', label: 'Selecione...' },
        { value: 'remote', label: 'Remoto' },
        { value: 'hybrid', label: 'Híbrido' },
        { value: 'onsite', label: 'Presencial' },
      ]}
    />
  </div>

  <div>
    <label>Disponibilidade para Mudança</label>
    <Input
      value={formData.relocation_availability || ''}
      onChange={(e) => updateFormData({ relocation_availability: e.target.value })}
      placeholder="Ex: Sim, Não, Depende da oportunidade"
    />
  </div>

  <div>
    <label>Disponibilidade para Viagens</label>
    <Input
      value={formData.travel_availability || ''}
      onChange={(e) => updateFormData({ travel_availability: e.target.value })}
      placeholder="Ex: Sim semanalmente, Eventualmente, Não"
    />
  </div>

  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      id="accepts_pj"
      checked={formData.accepts_pj || false}
      onChange={(e) => updateFormData({ accepts_pj: e.target.checked })}
    />
    <label htmlFor="accepts_pj">Aceita contrato PJ</label>
  </div>

  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      id="pcd"
      checked={formData.pcd || false}
      onChange={(e) => updateFormData({ pcd: e.target.checked, is_pcd: e.target.checked })}
    />
    <label htmlFor="pcd">Pessoa com Deficiência (PCD)</label>
  </div>

  <div>
    <label>Posição de Interesse</label>
    <Input
      value={formData.position_interest || ''}
      onChange={(e) => updateFormData({ position_interest: e.target.value })}
      placeholder="Ex: Account Manager/CSM, SDR, AE"
    />
  </div>

  <div>
    <label>Remuneração Mínima Mensal (R$)</label>
    <Input
      type="number"
      value={formData.minimum_salary || ''}
      onChange={(e) => updateFormData({ minimum_salary: parseFloat(e.target.value) })}
      placeholder="0.00"
    />
  </div>

  <div>
    <label>Observações sobre Remuneração</label>
    <Textarea
      value={formData.salary_notes || ''}
      onChange={(e) => updateFormData({ salary_notes: e.target.value })}
      placeholder="Ex: Valores negociáveis, preferência por variável, etc."
    />
  </div>

  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      id="has_drivers_license"
      checked={formData.has_drivers_license || false}
      onChange={(e) => updateFormData({ has_drivers_license: e.target.checked })}
    />
    <label htmlFor="has_drivers_license">Possui CNH</label>
  </div>

  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      id="has_vehicle"
      checked={formData.has_vehicle || false}
      onChange={(e) => updateFormData({ has_vehicle: e.target.checked })}
    />
    <label htmlFor="has_vehicle">Possui veículo próprio</label>
  </div>
</div>
```

#### Step 6: Histórico & Vídeo (Extended)

```typescript
// Reuse existing:
<ExperienceEditor
  experiences={formData.experiences}
  onChange={(experiences) => updateFormData({ experiences })}
/>

<VideoUpload
  onUploadComplete={(url, type) =>
    updateFormData({
      pitch_video_url: url,
      pitch_video_type: type === 's3' ? 's3' : 'youtube',
    })
  }
  currentVideoUrl={formData.pitch_video_url}
  currentVideoType={formData.pitch_video_type}
/>

// NEW: Admin fields
<div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="contract_signed"
    checked={formData.contract_signed || false}
    onChange={(e) => updateFormData({ contract_signed: e.target.checked })}
  />
  <label htmlFor="contract_signed">Contrato assinado</label>
</div>

<div>
  <label>Data da Entrevista</label>
  <Input
    type="date"
    value={formData.interview_date || ''}
    onChange={(e) => updateFormData({ interview_date: e.target.value })}
  />
</div>

// Final admin option:
<div className="mt-8 p-4 bg-blue-50 rounded-lg">
  <div className="flex items-start space-x-3">
    <input
      type="checkbox"
      id="send_welcome_email"
      checked={formData.send_welcome_email}
      onChange={(e) => updateFormData({ send_welcome_email: e.target.checked })}
    />
    <div>
      <label htmlFor="send_welcome_email" className="font-medium">
        Enviar email de boas-vindas
      </label>
      <p className="text-sm text-gray-600 mt-1">
        Email com link para o candidato definir senha e completar perfil.
        Deixe desmarcado se estiver apenas registrando o candidato.
      </p>
    </div>
  </div>
</div>
```

### Backend Serializer Extension

**File:** `apps/api/candidates/serializers.py`

```python
class AdminCreateCandidateSerializer(serializers.Serializer):
    """Extended serializer accepting all CandidateProfile fields."""

    # Existing fields (already implemented)
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    current_position = serializers.CharField(max_length=50, required=False, allow_blank=True)
    send_welcome_email = serializers.BooleanField(default=False)

    # NEW: Additional basic fields
    linkedin = serializers.URLField(required=False, allow_blank=True)
    cpf = serializers.CharField(max_length=14, required=False, allow_blank=True)
    zip_code = serializers.CharField(max_length=10, required=False, allow_blank=True)
    profile_photo_url = serializers.URLField(required=False, allow_blank=True)

    # NEW: Professional fields
    years_of_experience = serializers.IntegerField(required=False, allow_null=True)
    sales_type = serializers.CharField(max_length=50, required=False, allow_blank=True)
    sales_cycle = serializers.CharField(max_length=100, required=False, allow_blank=True)
    avg_ticket = serializers.CharField(max_length=100, required=False, allow_blank=True)
    academic_degree = serializers.CharField(max_length=200, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)

    # NEW: Skills (JSON fields)
    top_skills = serializers.ListField(child=serializers.CharField(), required=False)
    tools_software = serializers.ListField(child=serializers.CharField(), required=False)
    solutions_sold = serializers.ListField(child=serializers.CharField(), required=False)
    departments_sold_to = serializers.ListField(child=serializers.CharField(), required=False)
    languages = serializers.JSONField(required=False)

    # NEW: Work preferences
    work_model = serializers.ChoiceField(
        choices=['remote', 'hybrid', 'onsite'],
        required=False,
        allow_blank=True
    )
    relocation_availability = serializers.CharField(required=False, allow_blank=True)
    travel_availability = serializers.CharField(required=False, allow_blank=True)
    accepts_pj = serializers.BooleanField(default=False)
    pcd = serializers.BooleanField(default=False)
    is_pcd = serializers.BooleanField(default=False)
    position_interest = serializers.CharField(required=False, allow_blank=True)
    minimum_salary = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    salary_notes = serializers.CharField(required=False, allow_blank=True)
    has_drivers_license = serializers.BooleanField(default=False)
    has_vehicle = serializers.BooleanField(default=False)

    # NEW: Video & history
    pitch_video_url = serializers.URLField(required=False, allow_blank=True)
    pitch_video_type = serializers.ChoiceField(
        choices=['s3', 'youtube'],
        required=False,
        allow_blank=True
    )
    contract_signed = serializers.BooleanField(default=False)
    interview_date = serializers.DateField(required=False, allow_null=True)
```

### Auto-Save Draft Implementation

```typescript
// Auto-save every 30 seconds
const DRAFT_KEY = 'admin_candidate_draft';

useEffect(() => {
  const interval = setInterval(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, 30000);

  return () => clearInterval(interval);
}, [formData]);

// Load draft on mount
useEffect(() => {
  const draft = localStorage.getItem(DRAFT_KEY);
  if (draft) {
    try {
      setFormData(JSON.parse(draft));
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  }
}, []);

// Clear draft after successful submission
const handleSubmit = async () => {
  // ... submit logic
  localStorage.removeItem(DRAFT_KEY);
};
```

### Error Handling

```typescript
try {
  const response = await apiServer.post('/candidates/admin/candidates/create', formData);

  // Success
  const message = response.email_sent
    ? 'Candidato criado com sucesso! Email de boas-vindas enviado.'
    : 'Candidato criado com sucesso!';

  navigate(`/admin/candidates?created=true&email_sent=${response.email_sent}`, {
    state: { successMessage: message }
  });

} catch (error) {
  if (error.status === 400 && error.data?.error === 'Email already exists') {
    setFieldError('email', 'Este email já está cadastrado');
  } else {
    setError('Erro ao criar candidato. Tente novamente.');
  }
}
```

---

## Development Setup

### Prerequisites

**Frontend:**
```bash
Node.js 18+ installed
pnpm package manager
```

**Backend:**
```bash
Python 3.11+
PostgreSQL 15+
Redis (for Celery)
Poetry package manager
```

### Environment Setup

1. **Clone and Navigate:**
```bash
cd /Users/debor/Documents/sistemas/talentbase-v1
```

2. **Frontend Setup:**
```bash
cd packages/web
pnpm install
```

3. **Backend Setup:**
```bash
cd apps/api
poetry install
```

4. **Database Setup:**
```bash
# Start PostgreSQL
brew services start postgresql@15

# Start Redis
brew services start redis

# Run migrations
DJANGO_SETTINGS_MODULE=talentbase.settings.development poetry run python manage.py migrate
```

5. **Start Development Servers:**

**Terminal 1 - Frontend:**
```bash
cd packages/web
pnpm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd apps/api
DJANGO_SETTINGS_MODULE=talentbase.settings.development poetry run python manage.py runserver
# Runs on http://localhost:8000
```

**Terminal 3 - Celery (Optional - only if testing email):**
```bash
cd apps/api
poetry run celery -A talentbase worker -l info
```

### Verify Backend Already Works

The backend for this story is already complete. Verify it's working:

```bash
# Run existing tests
cd apps/api
DJANGO_SETTINGS_MODULE=talentbase.settings.test poetry run pytest candidates/tests/test_admin_creation.py -v

# Should show 8/8 tests passing:
# ✅ test_admin_creates_candidate_without_email
# ✅ test_admin_creates_candidate_with_email
# ✅ test_admin_creates_duplicate_email_fails
# ✅ test_non_admin_cannot_create_candidate
# ✅ test_set_password_with_valid_token
# ✅ test_set_password_with_expired_token
# ✅ test_set_password_with_invalid_token
# ✅ test_set_password_short_password_fails
```

### Development Workflow

1. **Create Admin User (if not exists):**
```bash
DJANGO_SETTINGS_MODULE=talentbase.settings.development poetry run python manage.py shell

# In Python shell:
from authentication.models import User
admin = User.objects.create_user(
    email='admin@talentbase.com',
    password='admin123',
    role='admin'
)
```

2. **Get Admin JWT Token:**
```bash
# Login via API
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@talentbase.com","password":"admin123"}'

# Copy the access token from response
```

3. **Test API Endpoint Manually:**
```bash
curl -X POST http://localhost:8000/api/v1/candidates/admin/candidates/create \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Test Candidate",
    "phone": "11999999999",
    "city": "São Paulo",
    "current_position": "SDR/BDR",
    "send_welcome_email": false
  }'
```

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend:** Vite detects changes automatically
- **Backend:** Django dev server reloads on file changes
- **Celery:** Must restart manually if you change task code

### Design System Development

If you need to verify design system components:

```bash
cd packages/design-system
pnpm run dev
# Storybook runs on http://localhost:6006

# View available components:
# - MultiStepWizard
# - Input, Select, Textarea, Button
# - Alert
```

---

## Implementation Guide

### Step-by-Step Implementation

#### Phase 1: Backend Extension (1-2 hours)

**File:** `apps/api/candidates/serializers.py`

1. **Extend AdminCreateCandidateSerializer** to accept all fields:

```python
# Add these new fields to the existing AdminCreateCandidateSerializer
# (it already has: email, full_name, phone, city, current_position, send_welcome_email)

# Basic fields
linkedin = serializers.URLField(required=False, allow_blank=True)
cpf = serializers.CharField(max_length=14, required=False, allow_blank=True)
zip_code = serializers.CharField(max_length=10, required=False, allow_blank=True)
profile_photo_url = serializers.URLField(required=False, allow_blank=True)

# Professional fields
years_of_experience = serializers.IntegerField(required=False, allow_null=True)
sales_type = serializers.CharField(max_length=50, required=False, allow_blank=True)
sales_cycle = serializers.CharField(max_length=100, required=False, allow_blank=True)
avg_ticket = serializers.CharField(max_length=100, required=False, allow_blank=True)
academic_degree = serializers.CharField(max_length=200, required=False, allow_blank=True)
bio = serializers.CharField(required=False, allow_blank=True)

# Skills (JSON)
top_skills = serializers.ListField(child=serializers.CharField(), required=False)
tools_software = serializers.ListField(child=serializers.CharField(), required=False)
solutions_sold = serializers.ListField(child=serializers.CharField(), required=False)
departments_sold_to = serializers.ListField(child=serializers.CharField(), required=False)
languages = serializers.JSONField(required=False)

# Work preferences
work_model = serializers.ChoiceField(choices=['remote', 'hybrid', 'onsite'], required=False)
relocation_availability = serializers.CharField(required=False, allow_blank=True)
travel_availability = serializers.CharField(required=False, allow_blank=True)
accepts_pj = serializers.BooleanField(default=False)
pcd = serializers.BooleanField(default=False)
is_pcd = serializers.BooleanField(default=False)
position_interest = serializers.CharField(required=False, allow_blank=True)
minimum_salary = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
salary_notes = serializers.CharField(required=False, allow_blank=True)
has_drivers_license = serializers.BooleanField(default=False)
has_vehicle = serializers.BooleanField(default=False)

# Video & history
pitch_video_url = serializers.URLField(required=False, allow_blank=True)
pitch_video_type = serializers.ChoiceField(choices=['s3', 'youtube'], required=False)
contract_signed = serializers.BooleanField(default=False)
interview_date = serializers.DateField(required=False, allow_null=True)

# Experience fields (CSV Notion fields)
active_prospecting_experience = serializers.CharField(required=False, allow_blank=True)
inbound_qualification_experience = serializers.CharField(required=False, allow_blank=True)
portfolio_retention_experience = serializers.CharField(required=False, allow_blank=True)
portfolio_expansion_experience = serializers.CharField(required=False, allow_blank=True)
portfolio_size = serializers.CharField(required=False, allow_blank=True)
inbound_sales_experience = serializers.CharField(required=False, allow_blank=True)
outbound_sales_experience = serializers.CharField(required=False, allow_blank=True)
field_sales_experience = serializers.CharField(required=False, allow_blank=True)
inside_sales_experience = serializers.CharField(required=False, allow_blank=True)
```

2. **Update the view** to pass all fields to CandidateProfile.objects.create():

**File:** `apps/api/candidates/views.py`

```python
# In admin_create_candidate view, update the profile creation:
profile = CandidateProfile.objects.create(
    user=user,
    full_name=validated_data['full_name'],
    phone=validated_data['phone'],
    city=validated_data.get('city', ''),

    # Add all new fields
    linkedin=validated_data.get('linkedin', ''),
    cpf=validated_data.get('cpf', ''),
    zip_code=validated_data.get('zip_code', ''),
    profile_photo_url=validated_data.get('profile_photo_url'),
    current_position=validated_data.get('current_position', ''),
    years_of_experience=validated_data.get('years_of_experience'),
    sales_type=validated_data.get('sales_type', ''),
    sales_cycle=validated_data.get('sales_cycle', ''),
    avg_ticket=validated_data.get('avg_ticket', ''),
    academic_degree=validated_data.get('academic_degree', ''),
    bio=validated_data.get('bio', ''),
    top_skills=validated_data.get('top_skills', []),
    tools_software=validated_data.get('tools_software', []),
    solutions_sold=validated_data.get('solutions_sold', []),
    departments_sold_to=validated_data.get('departments_sold_to', []),
    languages=validated_data.get('languages', []),
    work_model=validated_data.get('work_model', 'hybrid'),
    relocation_availability=validated_data.get('relocation_availability', ''),
    travel_availability=validated_data.get('travel_availability', ''),
    accepts_pj=validated_data.get('accepts_pj', False),
    pcd=validated_data.get('pcd', False),
    is_pcd=validated_data.get('is_pcd', False),
    position_interest=validated_data.get('position_interest', ''),
    minimum_salary=validated_data.get('minimum_salary'),
    salary_notes=validated_data.get('salary_notes', ''),
    has_drivers_license=validated_data.get('has_drivers_license', False),
    has_vehicle=validated_data.get('has_vehicle', False),
    pitch_video_url=validated_data.get('pitch_video_url', ''),
    pitch_video_type=validated_data.get('pitch_video_type', ''),
    contract_signed=validated_data.get('contract_signed', False),
    interview_date=validated_data.get('interview_date'),

    # CSV Notion experience fields
    active_prospecting_experience=validated_data.get('active_prospecting_experience', ''),
    inbound_qualification_experience=validated_data.get('inbound_qualification_experience', ''),
    portfolio_retention_experience=validated_data.get('portfolio_retention_experience', ''),
    portfolio_expansion_experience=validated_data.get('portfolio_expansion_experience', ''),
    portfolio_size=validated_data.get('portfolio_size', ''),
    inbound_sales_experience=validated_data.get('inbound_sales_experience', ''),
    outbound_sales_experience=validated_data.get('outbound_sales_experience', ''),
    field_sales_experience=validated_data.get('field_sales_experience', ''),
    inside_sales_experience=validated_data.get('inside_sales_experience', ''),
)
```

3. **Add tests** for new fields:

**File:** `apps/api/candidates/tests/test_admin_creation.py`

```python
def test_admin_creates_candidate_with_all_fields(admin_user, api_client):
    """Test admin can create candidate with all optional fields."""
    api_client.force_authenticate(user=admin_user)

    payload = {
        "email": "fullprofile@test.com",
        "full_name": "Full Profile Candidate",
        "phone": "11999999999",
        "city": "São Paulo",
        "linkedin": "https://linkedin.com/in/fullprofile",
        "cpf": "12345678901",
        "zip_code": "01310-100",
        "current_position": "SDR/BDR",
        "years_of_experience": 5,
        "sales_type": "Outbound",
        "sales_cycle": "30-60 dias",
        "avg_ticket": "R$ 10k-50k MRR",
        "academic_degree": "Ensino Superior Completo",
        "bio": "Experienced sales professional",
        "top_skills": ["Negociação", "Prospecção"],
        "tools_software": ["Salesforce", "HubSpot"],
        "solutions_sold": ["SaaS B2B"],
        "departments_sold_to": ["C-Level"],
        "languages": [{"name": "Português", "level": "Nativo"}],
        "work_model": "remote",
        "relocation_availability": "Sim",
        "travel_availability": "Eventualmente",
        "accepts_pj": True,
        "pcd": False,
        "position_interest": "Account Executive",
        "minimum_salary": 8000.00,
        "has_drivers_license": True,
        "has_vehicle": False,
        "contract_signed": True,
        "send_welcome_email": False
    }

    response = api_client.post('/api/v1/candidates/admin/candidates/create', payload, format='json')

    assert response.status_code == 201
    assert response.data['success'] is True

    # Verify profile was created with all fields
    profile = CandidateProfile.objects.get(user__email="fullprofile@test.com")
    assert profile.linkedin == "https://linkedin.com/in/fullprofile"
    assert profile.years_of_experience == 5
    assert profile.work_model == "remote"
    assert profile.accepts_pj is True
```

**Run tests:**
```bash
DJANGO_SETTINGS_MODULE=talentbase.settings.test poetry run pytest candidates/tests/test_admin_creation.py -v
```

#### Phase 2: Frontend Components (4-6 hours)

**Step 1: Create LanguageInput Component (if needed)**

**File:** `packages/web/app/components/admin/LanguageInput.tsx`

```typescript
import { Button, Input, Select } from '@talentbase/design-system';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Language {
  name: string;
  level: string;
}

interface LanguageInputProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
}

export function LanguageInput({ languages, onChange }: LanguageInputProps) {
  const [newLanguage, setNewLanguage] = useState({ name: '', level: 'Intermediário' });

  const addLanguage = () => {
    if (newLanguage.name.trim()) {
      onChange([...languages, newLanguage]);
      setNewLanguage({ name: '', level: 'Intermediário' });
    }
  };

  const removeLanguage = (index: number) => {
    onChange(languages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {languages.map((lang, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-gray-50 rounded">
            {lang.name} - {lang.level}
          </div>
          <button
            type="button"
            onClick={() => removeLanguage(index)}
            className="p-2 text-red-600 hover:text-red-800"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <Input
          placeholder="Nome do idioma"
          value={newLanguage.name}
          onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
        />
        <Select
          value={newLanguage.level}
          onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
          options={[
            { value: 'Básico', label: 'Básico' },
            { value: 'Intermediário', label: 'Intermediário' },
            { value: 'Avançado', label: 'Avançado' },
            { value: 'Fluente', label: 'Fluente' },
            { value: 'Nativo', label: 'Nativo' },
          ]}
        />
        <Button type="button" onClick={addLanguage} variant="secondary">
          Adicionar
        </Button>
      </div>
    </div>
  );
}
```

**Step 2: Refactor admin.candidates.new.tsx**

**File:** `packages/web/app/routes/admin.candidates.new.tsx`

Major changes from current implementation:

1. **Import MultiStepWizard and existing components:**
```typescript
import { MultiStepWizard, Input, Select, Textarea, Alert } from '@talentbase/design-system';
import { ToolsSelector } from '~/components/candidate/ToolsSelector';
import { SolutionsSelector } from '~/components/candidate/SolutionsSelector';
import { DepartmentsSelector } from '~/components/candidate/DepartmentsSelector';
import { PhotoUpload } from '~/components/candidate/PhotoUpload';
import { VideoUpload } from '~/components/candidate/VideoUpload';
import { ExperienceEditor } from '~/components/candidate/ExperienceEditor';
import { LanguageInput } from '~/components/admin/LanguageInput';
```

2. **Replace current form data with extended interface** (see Technical Details section)

3. **Implement 6-step wizard** with renderStepContent() switch statement

4. **Copy validation logic** from candidate.profile.create.tsx and extend

5. **Copy auto-save logic** from candidate.profile.create.tsx

6. **Update submit handler** to call admin API endpoint

**Estimated time:** 3-4 hours

**Testing checklist:**
- [ ] Can navigate through all 6 steps
- [ ] Validation blocks progression on required fields
- [ ] Auto-save works (check localStorage)
- [ ] All form inputs are bound to state
- [ ] Photo upload works
- [ ] Video upload works
- [ ] Experience editor works
- [ ] Language input works
- [ ] Submit creates candidate successfully
- [ ] Error handling for duplicate email works
- [ ] Success redirect works

#### Phase 3: Testing (1-2 hours)

**Backend:**
```bash
# Run all candidate tests
DJANGO_SETTINGS_MODULE=talentbase.settings.test poetry run pytest candidates/tests/ -v

# Should have 9+ tests passing (8 existing + 1 new for all fields)
```

**Frontend Manual Testing:**

1. Login as admin
2. Navigate to /admin/candidates
3. Click "Criar Candidato"
4. Fill Step 1 (basic info) → Next
5. Fill Step 2 (professional) → Next
6. Fill Step 3 (skills) → Next
7. Fill Step 4 (solutions) → Next
8. Fill Step 5 (preferences) → Next
9. Fill Step 6 (history & video) → Submit
10. Verify success toast
11. Verify redirect to /admin/candidates
12. Verify candidate appears in list
13. Test duplicate email error
14. Test auto-save (refresh page mid-wizard)

### Implementation Checklist

**Backend (1-2 hours):**
- [ ] Extend AdminCreateCandidateSerializer with all fields
- [ ] Update admin_create_candidate view to save all fields
- [ ] Add test for creating candidate with all fields
- [ ] Run tests - ensure 9+ passing

**Frontend (4-6 hours):**
- [ ] Create LanguageInput component
- [ ] Refactor admin.candidates.new.tsx to use MultiStepWizard
- [ ] Implement Step 1 (basic info + email, cpf, linkedin, zip)
- [ ] Implement Step 2 (professional + academic_degree, bio)
- [ ] Implement Step 3 (skills + top_skills, languages)
- [ ] Implement Step 4 (solutions - reuse existing)
- [ ] Implement Step 5 (NEW - work preferences)
- [ ] Implement Step 6 (history + video + admin fields)
- [ ] Add validation per step
- [ ] Add auto-save logic
- [ ] Update submit handler
- [ ] Test all flows

**Total Estimated Time: 5-8 hours**

---

## Testing Approach

### Backend Testing

**Test File:** `apps/api/candidates/tests/test_admin_creation.py`

**Existing Tests (Already Passing):**
1. ✅ `test_admin_creates_candidate_without_email` - Basic creation without email
2. ✅ `test_admin_creates_candidate_with_email` - Creation with welcome email
3. ✅ `test_admin_creates_duplicate_email_fails` - Duplicate email validation
4. ✅ `test_non_admin_cannot_create_candidate` - Permission check
5. ✅ `test_set_password_with_valid_token` - Password reset flow
6. ✅ `test_set_password_with_expired_token` - Token expiration
7. ✅ `test_set_password_with_invalid_token` - Invalid token
8. ✅ `test_set_password_short_password_fails` - Password validation

**New Test to Add:**
9. `test_admin_creates_candidate_with_all_fields` - Full profile with all optional fields

**Run Tests:**
```bash
cd apps/api
DJANGO_SETTINGS_MODULE=talentbase.settings.test poetry run pytest candidates/tests/test_admin_creation.py -v

# Expected: 9/9 tests passing
```

**Coverage:**
```bash
DJANGO_SETTINGS_MODULE=talentbase.settings.test poetry run pytest candidates/tests/test_admin_creation.py --cov=candidates --cov-report=term-missing
```

### Frontend Testing

#### Unit/Component Testing (Optional)

If time allows, create tests for LanguageInput component:

**File:** `packages/web/app/components/admin/LanguageInput.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageInput } from './LanguageInput';

test('adds language when clicking Adicionar', () => {
  const onChange = jest.fn();
  render(<LanguageInput languages={[]} onChange={onChange} />);

  fireEvent.change(screen.getByPlaceholderText('Nome do idioma'), {
    target: { value: 'Inglês' }
  });
  fireEvent.click(screen.getByText('Adicionar'));

  expect(onChange).toHaveBeenCalledWith([
    { name: 'Inglês', level: 'Intermediário' }
  ]);
});
```

#### Manual Testing Checklist

**Scenario 1: Complete Happy Path**
- [ ] Login as admin (`admin@talentbase.com`)
- [ ] Navigate to `/admin/candidates`
- [ ] Click "Criar Candidato" button
- [ ] **Step 1:** Fill all basic fields (email, name, phone, city, linkedin, cpf, zip, photo)
- [ ] Click "Próximo" - should advance to Step 2
- [ ] **Step 2:** Fill professional fields (position, years, sales_type, cycle, ticket, degree, bio)
- [ ] Click "Próximo" - should advance to Step 3
- [ ] **Step 3:** Select tools (min 1), add top skills, add language
- [ ] Click "Próximo" - should advance to Step 4
- [ ] **Step 4:** Select solutions (min 1) and departments (min 1)
- [ ] Click "Próximo" - should advance to Step 5
- [ ] **Step 5:** Fill work preferences (all optional - model, relocation, travel, PJ, PCD, salary)
- [ ] Click "Próximo" - should advance to Step 6
- [ ] **Step 6:** Add experience, upload video, set contract date, check "send email"
- [ ] Click "Criar Candidato"
- [ ] Verify success toast appears
- [ ] Verify redirect to `/admin/candidates?created=true`
- [ ] Verify new candidate appears in table
- [ ] Click on candidate - verify all fields saved correctly

**Scenario 2: Validation Errors**
- [ ] Start wizard, leave email empty on Step 1
- [ ] Try to click "Próximo" - should show validation error
- [ ] Fill email, leave phone empty
- [ ] Try to click "Próximo" - should show validation error
- [ ] Fill all required fields, advance to Step 2
- [ ] Leave position empty, try next - should block
- [ ] Fill position, advance to Step 3
- [ ] Don't select any tools, try next - should block
- [ ] Select 1 tool, advance to Step 4
- [ ] Don't select solutions, try next - should block
- [ ] Select solutions and departments, advance
- [ ] Step 5 (all optional) - should allow advancing without filling
- [ ] Step 6 (all optional) - should allow submit

**Scenario 3: Duplicate Email**
- [ ] Create candidate with email `duplicate@test.com`
- [ ] Start new candidate wizard
- [ ] On Step 1, enter same email `duplicate@test.com`
- [ ] Complete all steps and submit
- [ ] Verify error message: "Este email já está cadastrado"
- [ ] Verify stays on form, doesn't lose data
- [ ] Change email, resubmit - should succeed

**Scenario 4: Auto-Save Draft**
- [ ] Start wizard, fill Step 1
- [ ] Advance to Step 2, fill some fields
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Verify key `admin_candidate_draft` exists with form data
- [ ] Refresh page (F5)
- [ ] Verify wizard reopens at Step 1
- [ ] Verify Step 1 data is still filled
- [ ] Advance to Step 2 - verify data still there
- [ ] Complete wizard and submit
- [ ] Verify draft is cleared from localStorage

**Scenario 5: Photo Upload**
- [ ] On Step 1, click "Upload Photo"
- [ ] Select image file (JPG/PNG)
- [ ] Verify upload progress
- [ ] Verify preview shows uploaded image
- [ ] Complete wizard - verify photo URL saved

**Scenario 6: Video Upload**
- [ ] On Step 6, choose "Upload Video (S3)"
- [ ] Select video file (MP4)
- [ ] Verify upload progress
- [ ] Verify preview or success message
- [ ] Complete wizard - verify pitch_video_url and pitch_video_type='s3'
- [ ] Start new wizard
- [ ] On Step 6, choose "YouTube URL"
- [ ] Enter YouTube URL
- [ ] Complete wizard - verify pitch_video_type='youtube'

**Scenario 7: Optional Welcome Email**
- [ ] Complete wizard without checking "Enviar email de boas-vindas"
- [ ] Submit
- [ ] Verify success toast: "Candidato criado com sucesso!" (without email mention)
- [ ] Start new wizard
- [ ] Complete all steps
- [ ] Check "Enviar email de boas-vindas"
- [ ] Submit
- [ ] Verify toast: "Candidato criado com sucesso! Email de boas-vindas enviado."

**Scenario 8: Minimal Required Fields Only**
- [ ] Start wizard
- [ ] **Step 1:** Fill only email, name, phone, city (skip optional linkedin, cpf, zip, photo)
- [ ] **Step 2:** Fill only position, years, sales_type (skip cycle, ticket, degree, bio)
- [ ] **Step 3:** Select 1 tool only (skip top_skills, languages)
- [ ] **Step 4:** Select 1 solution, 1 department
- [ ] **Step 5:** Skip all (optional)
- [ ] **Step 6:** Skip all (optional)
- [ ] Submit - should succeed
- [ ] Verify candidate created with minimal data

### Integration Testing (Optional)

**E2E Test File:** `packages/web/tests/e2e/admin-create-complete-candidate.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('admin creates candidate with full profile', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[name="email"]', 'admin@talentbase.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  // Navigate to create candidate
  await page.goto('http://localhost:3000/admin/candidates/new');

  // Step 1: Basic Info
  await page.fill('input[name="email"]', 'e2e@test.com');
  await page.fill('input[name="full_name"]', 'E2E Test Candidate');
  await page.fill('input[name="phone"]', '11999999999');
  await page.fill('input[name="city"]', 'São Paulo');
  await page.click('button:has-text("Próximo")');

  // Step 2: Professional
  await page.selectOption('select[name="current_position"]', 'SDR/BDR');
  await page.fill('input[name="years_of_experience"]', '3');
  await page.selectOption('select[name="sales_type"]', 'Outbound');
  await page.click('button:has-text("Próximo")');

  // Step 3: Skills
  await page.click('text=Salesforce'); // Assuming checkbox
  await page.click('button:has-text("Próximo")');

  // Step 4: Solutions
  await page.click('text=SaaS B2B');
  await page.click('text=C-Level');
  await page.click('button:has-text("Próximo")');

  // Step 5: Preferences (skip all)
  await page.click('button:has-text("Próximo")');

  // Step 6: History & Video (skip all)
  await page.click('button:has-text("Criar Candidato")');

  // Verify success
  await expect(page.locator('text=Candidato criado com sucesso')).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/candidates\?created=true/);
});
```

**Run E2E Tests:**
```bash
cd packages/web
pnpm exec playwright test admin-create-complete-candidate.spec.ts
```

### Performance Testing

**Load Test (Optional):**
- Create 10 candidates via admin form sequentially
- Measure average time per candidate creation
- Target: < 3 seconds per submission (including API call)

**Browser Performance:**
- Open Chrome DevTools → Performance tab
- Start recording
- Complete wizard (all 6 steps)
- Stop recording
- Verify:
  - No memory leaks
  - No excessive re-renders
  - Form inputs respond < 100ms

### Test Data

**Valid Test Candidate Data:**
```json
{
  "email": "testcandidate@example.com",
  "full_name": "Test Candidate Full Name",
  "phone": "11987654321",
  "city": "São Paulo",
  "linkedin": "https://linkedin.com/in/testcandidate",
  "cpf": "12345678901",
  "zip_code": "01310-100",
  "current_position": "SDR/BDR",
  "years_of_experience": 5,
  "sales_type": "Outbound",
  "sales_cycle": "30-60 dias",
  "avg_ticket": "R$ 10k-50k MRR",
  "academic_degree": "Ensino Superior Completo",
  "bio": "Experienced sales professional with 5 years in tech sales",
  "top_skills": ["Negociação", "Prospecção", "Cold Call"],
  "tools_software": ["Salesforce", "HubSpot", "Apollo.io"],
  "solutions_sold": ["SaaS B2B", "Fintech"],
  "departments_sold_to": ["C-Level", "Marketing", "Vendas"],
  "languages": [
    {"name": "Português", "level": "Nativo"},
    {"name": "Inglês", "level": "Fluente"}
  ],
  "work_model": "remote",
  "relocation_availability": "Sim",
  "travel_availability": "Sim semanalmente",
  "accepts_pj": true,
  "pcd": false,
  "position_interest": "Account Executive",
  "minimum_salary": 8000.00,
  "salary_notes": "Flexível para o pacote completo",
  "has_drivers_license": true,
  "has_vehicle": false,
  "contract_signed": false,
  "interview_date": "2025-10-15",
  "send_welcome_email": false
}
```

### Acceptance Criteria Verification

- [ ] Admin can fill ALL fields from CandidateProfile model via wizard
- [ ] Wizard has 6 steps with clear progress indication
- [ ] Required fields block progression (Steps 1-4)
- [ ] Optional fields allow skipping (Steps 5-6)
- [ ] Auto-save works every 30 seconds
- [ ] Draft persists on page refresh
- [ ] Photo upload to S3 works
- [ ] Video upload to S3 works
- [ ] YouTube video URL works
- [ ] Duplicate email shows specific error
- [ ] Success toast shows correct message based on email_sent flag
- [ ] Candidate appears in admin table after creation
- [ ] All fields saved correctly to database
- [ ] Backend tests pass (9/9)
- [ ] No console errors in browser

---

## Deployment Strategy

### Pre-Deployment Checklist

**Code Quality:**
- [ ] ESLint passes (frontend)
- [ ] TypeScript compilation passes (frontend)
- [ ] Python linting passes (backend)
- [ ] All tests pass (9/9 backend + manual frontend)
- [ ] No console.error or console.warn in production code
- [ ] Code reviewed and approved

**Backend Verification:**
```bash
cd apps/api

# Run tests
DJANGO_SETTINGS_MODULE=talentbase.settings.test poetry run pytest candidates/tests/test_admin_creation.py -v

# Check for migrations
DJANGO_SETTINGS_MODULE=talentbase.settings.development poetry run python manage.py makemigrations --check --dry-run

# If migrations needed:
DJANGO_SETTINGS_MODULE=talentbase.settings.development poetry run python manage.py makemigrations candidates
```

**Frontend Verification:**
```bash
cd packages/web

# Build check
pnpm run build

# Type check
pnpm run typecheck

# Lint check
pnpm run lint
```

### Deployment Steps

#### Step 1: Backend Deployment (No Changes Needed)

**Backend is already deployed and working!**

The backend for Story 3.3.5 was already implemented and deployed. Only frontend changes are needed.

**Verify backend is live:**
```bash
# Test admin create endpoint
curl -X POST https://api.talentbase.com/api/v1/candidates/admin/candidates/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","full_name":"Test","phone":"11999999999","city":"São Paulo","send_welcome_email":false}'
```

**If backend needs redeployment (unlikely):**
```bash
# From project root
git add apps/api/candidates/serializers.py
git add apps/api/candidates/views.py
git add apps/api/candidates/tests/test_admin_creation.py
git commit -m "feat(api): extend admin candidate creation with all fields

- Add all CandidateProfile fields to AdminCreateCandidateSerializer
- Update view to save all optional fields
- Add comprehensive test for full profile creation
- Supports CSV import field parity

Story 3.3.5"

git push origin main
```

#### Step 2: Frontend Deployment

**Build and Deploy:**

```bash
cd packages/web

# Build production bundle
pnpm run build

# Deploy to production (GitHub Actions handles this automatically on push to main)
git add app/routes/admin.candidates.new.tsx
git add app/components/admin/LanguageInput.tsx
git commit -m "feat(web): implement complete admin candidate creation wizard

- Refactor admin.candidates.new.tsx to 6-step wizard
- Add LanguageInput component for multi-language input
- Reuse existing candidate components (ToolsSelector, PhotoUpload, etc.)
- Add all 60+ CandidateProfile fields to wizard
- Implement auto-save draft functionality
- Add validation per step
- Support optional welcome email sending

Story 3.3.5

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

**GitHub Actions will:**
1. Run tests
2. Build frontend
3. Build backend Docker images
4. Push to ECR
5. Deploy to ECS (production)
6. Run smoke tests

**Monitor deployment:**
```bash
# Watch GitHub Actions
gh run watch

# Once deployed, check ECS task status
gh workflow view deploy
```

#### Step 3: Post-Deployment Verification

**Smoke Tests:**

1. **Admin Login:**
   - Navigate to https://talentbase.com/auth/login
   - Login as admin
   - Verify redirect to /admin

2. **Navigate to Create Candidate:**
   - Click "Candidatos" in sidebar
   - Click "Criar Candidato" button
   - Verify wizard loads (Step 1/6)

3. **Quick Form Test:**
   - Fill required fields in Step 1
   - Click "Próximo" - should advance
   - Complete minimal wizard (only required fields)
   - Submit
   - Verify success toast
   - Verify redirect to candidates list
   - Verify new candidate appears

4. **Check Database:**
```bash
# SSH to production or use admin panel
# Verify candidate was created with all fields
```

5. **Monitor Logs:**
```bash
# Check for errors in logs
gh run view --log

# Or via AWS CloudWatch
aws logs tail /ecs/talentbase-production --follow
```

### Rollback Plan

**If critical issues found:**

#### Frontend Rollback:

```bash
# Revert the commit
git revert HEAD
git push origin main

# GitHub Actions will auto-deploy previous version
```

#### Backend Rollback (if needed):

```bash
# Via AWS ECS - rollback to previous task definition
aws ecs update-service \
  --cluster talentbase-production \
  --service talentbase-web-service \
  --task-definition talentbase-web:PREVIOUS_VERSION

# Monitor rollback
aws ecs describe-services \
  --cluster talentbase-production \
  --services talentbase-web-service
```

### Database Migrations (If Added)

**If new migrations were created:**

```bash
# Staging first
DJANGO_SETTINGS_MODULE=talentbase.settings.staging poetry run python manage.py migrate

# Verify staging works
# Run smoke tests on staging

# Then production
DJANGO_SETTINGS_MODULE=talentbase.settings.production poetry run python manage.py migrate
```

**Rollback migrations (if needed):**
```bash
# Identify migration to rollback to
DJANGO_SETTINGS_MODULE=talentbase.settings.production poetry run python manage.py showmigrations candidates

# Rollback
DJANGO_SETTINGS_MODULE=talentbase.settings.production poetry run python manage.py migrate candidates PREVIOUS_MIGRATION_NUMBER
```

### Monitoring Post-Deployment

**Key Metrics to Watch (First 24h):**

1. **Error Rate:**
   - CloudWatch: Filter logs for "ERROR" or "Exception"
   - Target: < 1% error rate

2. **API Response Times:**
   - Monitor `/api/v1/candidates/admin/candidates/create` endpoint
   - Target: < 500ms p95

3. **User Feedback:**
   - Check with admins after first use
   - Monitor for support tickets

4. **Database Performance:**
   - Check for slow queries
   - Monitor CandidateProfile table inserts

**CloudWatch Alarms (Already configured):**
- ECS Task Health
- API Error Rate > 5%
- Database Connection Pool > 80%

### Communication Plan

**Before Deployment:**
- [ ] Notify admin users: "Nova funcionalidade de cadastro completo de candidatos será liberada"
- [ ] Share quick guide (optional)

**After Deployment:**
- [ ] Confirm with admins: "Cadastro completo de candidatos está disponível em /admin/candidates/new"
- [ ] Collect feedback in first week
- [ ] Monitor usage analytics

### Success Criteria

**Deployment is successful if:**
- [ ] Frontend builds without errors
- [ ] Backend tests pass (9/9)
- [ ] Admin can create candidate with all fields
- [ ] No production errors in first 24h
- [ ] Admin users report successful usage
- [ ] All candidates created via wizard appear in list
- [ ] No performance degradation

### Estimated Deployment Time

- **Code push to main:** 2 minutes
- **GitHub Actions build + test:** 5-8 minutes
- **ECS deployment:** 3-5 minutes
- **Post-deployment verification:** 5 minutes

**Total:** ~15-20 minutes

### Deployment Schedule Recommendation

**Best time to deploy:**
- **Weekday:** Tuesday-Thursday (avoid Monday/Friday)
- **Time:** 10am-2pm (Brazil timezone) - admins are online for feedback
- **Avoid:** End of month (peak admin usage for candidate processing)

---

## Summary

This tech spec provides complete implementation details for Story 3.3.5: extending admin candidate creation to support all 60+ CandidateProfile fields through a 6-step wizard interface.

**Key Points:**
- Backend already implemented and tested (8/8 tests passing)
- Frontend refactor required: ~5-8 hours development time
- Reuses 9 existing components (MultiStepWizard, selectors, uploads, utils)
- Only 1 new component needed (LanguageInput)
- Total deployment time: ~20 minutes
- Zero-downtime deployment via ECS rolling update

**Ready to implement!** 🚀

---

_This tech spec is for Story 3.3.5 (BMad Method v6). It extends the existing admin manual candidate creation to support ALL CandidateProfile model fields through a multi-step wizard form._
