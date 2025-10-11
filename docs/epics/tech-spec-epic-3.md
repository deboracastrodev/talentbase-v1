# Technical Specification - Epic 3: Candidate Management System

**Epic:** Epic 3 - Candidate Management System
**Timeline:** Weeks 4-7
**Stories:** 3.1, 3.2, 3.3, 3.3.5, 3.4, 3.5, 3.6, 3.7
**Author:** BMad Architecture Agent
**Date:** 2025-10-01
**Last Updated:** 2025-10-10 (Added Story 3.3.5)

---

## Epic Overview

### Business Context
Epic 3 delivers the core value proposition of TalentBase: replacing Notion with a comprehensive candidate profile management system. This epic enables candidates to create rich sales profiles, admin to curate and rank candidates, and generates shareable public profiles for LinkedIn distribution.

### Success Criteria
- All Notion candidate data migrated to TalentBase via CSV import
- Candidates can create and edit comprehensive sales profiles (position, skills, tools, experience, video)
- Shareable public candidate profiles generated with unique URLs
- Admin can curate, edit, rank, and manage all candidates
- Candidate dashboard functional for profile viewing and job browsing

### Architecture Context

**Data Migration Strategy:**
- CSV import tool for bulk Notion data migration
- Pandas for CSV parsing and validation
- Celery async tasks for large imports (>100 candidates)
- Duplicate detection by email, skip or update

**File Storage (AWS S3):**
- **Profile photos**: Direct browser upload via presigned URLs
  - Max 2MB JPG/PNG
  - Stored in `s3://talentbase-media/candidate-photos/{candidate_id}/profile_{timestamp}.jpg`
- **Pitch videos** (OBRIGATÓRIO): Duas opções
  - **Opção A - S3 Upload**: Direct browser upload via presigned URLs
    - Max 50MB MP4/MOV/AVI
    - Stored in `s3://talentbase-media/pitch-videos/{candidate_id}/pitch_{timestamp}.mp4`
  - **Opção B - YouTube**: URL do YouTube validada e salva no banco
- CloudFront CDN for fast delivery (S3 files)

**Public Profile Strategy:**
- UUID token per candidate (shareable link)
- Public route `/share/candidate/:token` (no auth)
- SEO optimized with meta tags (LinkedIn preview)
- Candidate can regenerate token or disable sharing

---

## Story 3.1: Candidate Profile Creation (Multi-Step Form)

### Architecture Context

**Multi-Step Form (5 Steps):**
1. **Basic Info:** Name, phone, location, photo upload
2. **Position & Experience:** Current position, years, Inbound/Outbound, sales cycle, ticket size
3. **Tools & Software:** Multi-select (Salesforce, HubSpot, Apollo.io, Outreach, etc.)
4. **Solutions & Departments:** Solutions sold, departments sold to
5. **Work History & Bio:** Add experiences, write bio

**State Management:**
- Remix form with session-based draft storage
- "Save Draft" saves partial data to DB
- Progress indicator shows completion (20% per step)

### Implementation Steps

**1. Complete CandidateProfile Model:**

> **UPDATED 2025-10-09**: Model expanded to support all 36 Notion CSV fields for complete candidate data migration and admin matching capabilities.

`apps/api/candidates/models.py`:
```python
import uuid
from django.db import models
from core.models import BaseModel
from authentication.models import User

class CandidateProfile(BaseModel):
    POSITION_CHOICES = [
        ('SDR/BDR', 'SDR/BDR'),
        ('AE/Closer', 'Account Executive/Closer'),
        ('CSM', 'Customer Success Manager'),
    ]

    STATUS_CHOICES = [
        ('available', 'Disponível'),
        ('inactive', 'Inativo'),
        ('no_contract', 'Sem Contrato'),
    ]

    # Relationships
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')

    # Basic Info
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    cpf = models.CharField(max_length=255, blank=True, default="")  # TODO: Add encryption
    linkedin = models.URLField(blank=True, default="")
    location = models.CharField(max_length=100, blank=True)  # DEPRECATED - use 'city' instead
    photo_url = models.URLField(blank=True)  # S3 URL
    video_url = models.URLField(blank=True)  # YouTube URL

    # Position & Experience
    current_position = models.CharField(max_length=50, choices=POSITION_CHOICES, blank=True)
    years_of_experience = models.PositiveIntegerField(null=True, blank=True)
    sales_type = models.CharField(max_length=50, blank=True)  # "Inbound", "Outbound", "Both"
    inside_outside = models.CharField(max_length=50, blank=True)  # DEPRECATED - use experience fields
    sales_cycle = models.CharField(max_length=100, blank=True)  # "30-60 dias"
    avg_ticket = models.CharField(max_length=100, blank=True)  # "R$ 10k-50k MRR"

    # Tools & Software (JSONB)
    top_skills = models.JSONField(default=list)  # ["Outbound", "Negociacao", "HubSpot"]
    tools_software = models.JSONField(default=list)  # ["Salesforce", "Apollo.io", "Hubspot"]

    # Solutions & Departments (JSONB)
    solutions_sold = models.JSONField(default=list)  # ["SaaS B2B", "Fintech"]
    departments_sold_to = models.JSONField(default=list)  # ["C-Level", "Marketing"]

    # Bio
    bio = models.TextField(blank=True)

    # **PITCH VIDEO (OBRIGATÓRIO)**
    pitch_video_url = models.URLField(help_text="URL do vídeo pitch (S3 ou YouTube)")
    pitch_video_type = models.CharField(
        max_length=10,
        choices=[('s3', 'S3 Upload'), ('youtube', 'YouTube')],
        help_text="Tipo de vídeo: upload direto (S3) ou YouTube"
    )

    # Shareable Profile
    public_token = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    is_public = models.BooleanField(default=False)

    # Admin Curation
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    is_verified = models.BooleanField(default=False)

    # ============ NOTION CSV FIELDS (Added 2025-10-09) ============

    # Personal & Legal Info
    accepts_pj = models.BooleanField(default=False, help_text="Aceita trabalhar como PJ?")
    zip_code = models.CharField(max_length=10, blank=True, help_text="CEP")
    city = models.CharField(max_length=100, blank=True, help_text="Cidade")
    is_pcd = models.BooleanField(default=False, help_text="Pessoa com Deficiência?")

    # Contract & Interview Info
    contract_signed = models.BooleanField(default=False, help_text="Contrato assinado?")
    interview_date = models.DateField(null=True, blank=True, help_text="Data da entrevista")

    # Mobility & Availability
    relocation_availability = models.CharField(max_length=50, blank=True, help_text="Disponibilidade para mudança")
    travel_availability = models.CharField(max_length=100, blank=True, help_text="Disponibilidade para viagem")
    has_drivers_license = models.BooleanField(default=False, help_text="Possui CNH?")
    has_vehicle = models.BooleanField(default=False, help_text="Possui veículo próprio?")

    # Education & Languages
    academic_degree = models.CharField(max_length=200, blank=True, help_text="Formação acadêmica")
    languages = models.JSONField(default=list, help_text="Idiomas (ex: ['Português (Nativo)', 'Inglês (Fluente)'])")

    # Work Preferences & Compensation
    work_model = models.CharField(max_length=100, blank=True, help_text="Modelo de trabalho (Home-office, Híbrido, Presencial)")
    positions_of_interest = models.JSONField(default=list, help_text="Posições de interesse")
    minimum_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Remuneração mínima mensal")
    salary_notes = models.TextField(blank=True, help_text="Observações sobre remuneração")

    # Sales Experience Details (CharField for ranges like "Entre 3 e 5 anos", "Mais de 10 anos", "Nula")
    active_prospecting_experience = models.CharField(max_length=100, blank=True, help_text="Experiência em Prospecção Ativa")
    inbound_qualification_experience = models.CharField(max_length=100, blank=True, help_text="Experiência em Qualificação de Leads Inbound")
    portfolio_retention_experience = models.CharField(max_length=100, blank=True, help_text="Experiência em Retenção de Carteira")
    portfolio_expansion_experience = models.CharField(max_length=100, blank=True, help_text="Experiência em Expansão/Venda para Carteira")
    portfolio_size = models.CharField(max_length=100, blank=True, help_text="Tamanho da carteira gerida")
    inbound_sales_experience = models.CharField(max_length=100, blank=True, help_text="Experiência em Venda para Leads Inbound")
    outbound_sales_experience = models.CharField(max_length=100, blank=True, help_text="Experiência em Venda para Leads Outbound")
    field_sales_experience = models.CharField(max_length=100, blank=True, help_text="Experiência em Vendas Field Sales")
    inside_sales_experience = models.CharField(max_length=100, blank=True, help_text="Experiência em Vendas Inside Sales")

    def __str__(self):
        return f"{self.full_name} ({self.current_position})"

    @property
    def profile_completeness(self):
        required_fields = [
            self.full_name, self.phone, self.current_position,
            self.years_of_experience, self.bio, self.top_skills, self.tools_software
        ]
        filled = sum(1 for field in required_fields if field)
        return int((filled / len(required_fields)) * 100)

class Experience(BaseModel):
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='experiences')
    company_name = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # Null if current job
    responsibilities = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.candidate.full_name} - {self.company_name}"
```

**2. Create Multi-Step Form (Remix):**

`packages/web/app/routes/candidate.onboarding.tsx`:
```typescript
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { useState } from 'react';
import { Button, Input, Select, Textarea } from '@talentbase/design-system';
import { api } from '~/services/api.server';
import { requireAuth } from '~/services/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request, 'candidate');
  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const step = formData.get('step');

  if (step === 'complete') {
    // Final submission
    try {
      await api.post('/candidates', {
        full_name: formData.get('full_name'),
        phone: formData.get('phone'),
        location: formData.get('location'),
        photo_url: formData.get('photo_url'),
        current_position: formData.get('current_position'),
        years_of_experience: Number(formData.get('years_of_experience')),
        sales_type: formData.get('sales_type'),
        inside_outside: formData.get('inside_outside'),
        sales_cycle: formData.get('sales_cycle'),
        avg_ticket: formData.get('avg_ticket'),
        top_skills: JSON.parse(formData.get('top_skills') as string),
        tools_software: JSON.parse(formData.get('tools_software') as string),
        solutions_sold: JSON.parse(formData.get('solutions_sold') as string),
        departments_sold_to: JSON.parse(formData.get('departments_sold_to') as string),
        bio: formData.get('bio'),
        video_url: formData.get('video_url'),
      });

      return redirect('/candidate');
    } catch (error: any) {
      return json({ error: error.response?.data || 'Profile creation failed' }, { status: 400 });
    }
  }

  return json({ success: true });
}

export default function CandidateOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Complete seu Perfil</h1>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-600">Etapa {currentStep} de {totalSteps}</p>
        </div>

        <Form method="post" className="bg-white p-8 rounded-lg shadow">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Informa��es B�sicas</h2>
              <Input label="Nome Completo" name="full_name" required />
              <Input label="Telefone" name="phone" type="tel" required />
              <Input label="Localiza��o" name="location" placeholder="S�o Paulo, SP" required />
              <div>
                <label className="block text-sm font-medium mb-2">Foto de Perfil</label>
                <input type="file" accept="image/jpeg,image/png" className="border p-2 rounded" />
              </div>
              <Button type="button" onClick={nextStep}>Pr�ximo</Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Posi��o & Experi�ncia</h2>
              <Select label="Posi��o Atual" name="current_position" options={[
                { value: 'SDR/BDR', label: 'SDR/BDR' },
                { value: 'AE/Closer', label: 'Account Executive/Closer' },
                { value: 'CSM', label: 'Customer Success Manager' },
              ]} required />
              <Input label="Anos de Experi�ncia" name="years_of_experience" type="number" required />
              <Select label="Tipo de Venda" name="sales_type" options={[
                { value: 'Inbound', label: 'Inbound' },
                { value: 'Outbound', label: 'Outbound' },
                { value: 'Both', label: 'Inbound & Outbound' },
              ]} />
              <Input label="Ciclo de Vendas" name="sales_cycle" placeholder="30-60 dias" />
              <Input label="Ticket M�dio" name="avg_ticket" placeholder="R$ 10k-50k MRR" />
              <div className="flex gap-4">
                <Button type="button" onClick={prevStep} variant="secondary">Voltar</Button>
                <Button type="button" onClick={nextStep}>Pr�ximo</Button>
              </div>
            </div>
          )}

          {/* Steps 3, 4, 5 similar structure */}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Hist�rico & Bio</h2>
              <Textarea label="Bio / Resumo Profissional" name="bio" rows={6} required />
              <Input label="V�deo de Apresenta��o (YouTube URL)" name="video_url" type="url" />
              <input type="hidden" name="step" value="complete" />
              <div className="flex gap-4">
                <Button type="button" onClick={prevStep} variant="secondary">Voltar</Button>
                <Button type="submit">Concluir Perfil</Button>
              </div>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
```

**3. S3 Photo Upload (Presigned URL):**

`apps/api/candidates/views.py`:
```python
import boto3
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def generate_upload_url(request):
    s3_client = boto3.client('s3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

    candidate_id = request.user.candidate_profile.id
    file_name = f"profiles/{candidate_id}/photo.jpg"

    presigned_url = s3_client.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': settings.AWS_S3_BUCKET_NAME,
            'Key': file_name,
            'ContentType': 'image/jpeg'
        },
        ExpiresIn=3600
    )

    return Response({
        'upload_url': presigned_url,
        'photo_url': f"https://{settings.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/{file_name}"
    })
```

### Testing Approach

**E2E Test:**
```typescript
test('candidate completes onboarding flow', async ({ page }) => {
  await page.goto('/candidate/onboarding');

  // Step 1
  await page.getByLabel('Nome Completo').fill('Jo�o Silva');
  await page.getByLabel('Telefone').fill('11999999999');
  await page.getByLabel('Localiza��o').fill('S�o Paulo, SP');
  await page.getByRole('button', { name: 'Pr�ximo' }).click();

  // Step 2
  await page.getByLabel('Posi��o Atual').selectOption('SDR/BDR');
  await page.getByLabel('Anos de Experi�ncia').fill('3');
  await page.getByRole('button', { name: 'Pr�ximo' }).click();

  // ... continue through all steps

  // Step 5
  await page.getByLabel('Bio').fill('SDR experiente com foco em Outbound...');
  await page.getByRole('button', { name: 'Concluir Perfil' }).click();

  await expect(page).toHaveURL('/candidate');
});
```

---

## Story 3.2: Shareable Public Candidate Profile

### Implementation Steps

**1. Generate Share Token API:**

`apps/api/candidates/views.py`:
```python
@api_view(['POST'])
def generate_share_token(request, pk):
    candidate = get_object_or_404(CandidateProfile, pk=pk, user=request.user)

    # Regenerate token
    candidate.public_token = uuid.uuid4()
    candidate.is_public = True
    candidate.save()

    share_url = f"https://www.salesdog.click/share/candidate/{candidate.public_token}"

    return Response({'share_url': share_url})
```

**2. Public Profile Route (Remix):**

`packages/web/app/routes/share.candidate.$token.tsx`:
```typescript
import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Card, Badge } from '@talentbase/design-system';
import { api } from '~/services/api.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const { token } = params;

  try {
    const response = await api.get(`/candidates/public/${token}`);
    return json({ candidate: response.data });
  } catch (error) {
    throw new Response('Candidate not found', { status: 404 });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const { candidate } = data;
  return [
    { title: `${candidate.full_name} - ${candidate.current_position} | TalentBase` },
    { name: 'description', content: `${candidate.bio.substring(0, 150)}...` },
    { property: 'og:title', content: `${candidate.full_name} - ${candidate.current_position}` },
    { property: 'og:description', content: candidate.bio },
    { property: 'og:image', content: candidate.photo_url },
    { property: 'og:type', content: 'profile' },
  ];
};

export default function PublicCandidateProfile() {
  const { candidate } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="flex items-start gap-6">
            <img
              src={candidate.photo_url || '/default-avatar.png'}
              alt={candidate.full_name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{candidate.full_name}</h1>
              <p className="text-xl text-gray-600">{candidate.current_position}</p>
              <p className="text-gray-500">{candidate.location}</p>
              <p className="mt-2 text-gray-700">{candidate.years_of_experience} anos de experi�ncia</p>

              {candidate.is_verified && (
                <Badge variant="success" className="mt-2">Verificado</Badge>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Sobre</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{candidate.bio}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Habilidades</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.top_skills.map((skill: string) => (
                <Badge key={skill} variant="primary">{skill}</Badge>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Ferramentas & Software</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.tools_software.map((tool: string) => (
                <Badge key={tool} variant="secondary">{tool}</Badge>
              ))}
            </div>
          </div>

          {candidate.video_url && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">V�deo de Apresenta��o</h2>
              <div className="aspect-video">
                <iframe
                  src={candidate.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full rounded"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Experi�ncia Profissional</h2>
            {candidate.experiences.map((exp: any) => (
              <div key={exp.id} className="mb-4">
                <h3 className="font-semibold">{exp.position} - {exp.company_name}</h3>
                <p className="text-gray-600">
                  {new Date(exp.start_date).getFullYear()} - {exp.end_date ? new Date(exp.end_date).getFullYear() : 'Presente'}
                </p>
                <p className="text-gray-700 mt-2">{exp.responsibilities}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Interessado? Entre em contato via TalentBase
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

---

## Story 3.3: CSV Import Tool (Notion Migration)

> **UPDATED 2025-10-09**: CSV import expanded to support all 36 Notion fields with field parsers for boolean, currency, and list types.

### Implementation Steps

**1. Create CSV Import View:**

`apps/api/candidates/views.py`:
```python
import pandas as pd
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .tasks import import_candidates_csv

# Default column mapping (Notion CSV → TalentBase fields)
DEFAULT_COLUMN_MAPPING = {
    'Nome': 'full_name',
    'Aceita ser PJ?': 'accepts_pj',
    'CEP': 'zip_code',
    'CPF': 'cpf',
    'Cidade': 'city',
    'Contrato Assinado?': 'contract_signed',
    'Data da Entrevista': 'interview_date',
    'Departamentos que já vendeu': 'departments_sold_to',
    'Disp. p/ Mudança?': 'relocation_availability',
    'Disponibilidade para viagem?': 'travel_availability',
    'Expansão/Venda pra carteira de clientes': 'portfolio_expansion_experience',
    'Formação Acadêmica': 'academic_degree',
    'Idiomas': 'languages',
    'LinkedIn': 'linkedin',
    'Modelo de Trabalho': 'work_model',
    'Mín Mensal Remuneração Total': 'minimum_salary',
    'Obs. Remuneração': 'salary_notes',
    'PCD?': 'is_pcd',
    'Posições de Interesse': 'positions_of_interest',
    'Possui CNH?': 'has_drivers_license',
    'Possui veículo próprio?': 'has_vehicle',
    'Prospecção Ativa': 'active_prospecting_experience',
    'Qualificação de Leads Inbound': 'inbound_qualification_experience',
    'Retenção de Carteira de Clientes': 'portfolio_retention_experience',
    'Softwares de Vendas': 'tools_software',
    'Soluções que já vendeu': 'solutions_sold',
    'Status/Contrato': 'status',
    'Tamanho da carteira gerida': 'portfolio_size',
    'Venda p/ Leads Inbound': 'inbound_sales_experience',
    'Venda p/ Leads Outbound': 'outbound_sales_experience',
    'Vendas em Field Sales': 'field_sales_experience',
    'Vendas em Inside Sales': 'inside_sales_experience',
    '[Vendas/Closer] Ciclo de vendas': 'sales_cycle',
    '[Vendas/Closer] Ticket Médio': 'avg_ticket',
}

@api_view(['POST'])
@permission_classes([IsAdminUser])
def import_candidates(request):
    csv_file = request.FILES.get('csv_file')

    if not csv_file:
        return Response({'error': 'No file provided'}, status=400)

    # Read CSV
    df = pd.read_csv(csv_file)

    # Map columns (use default mapping or custom from request)
    column_mapping = request.data.get('column_mapping', DEFAULT_COLUMN_MAPPING)

    # Start async import task
    task = import_candidates_csv.delay(df.to_dict('records'), column_mapping)

    return Response({
        'task_id': task.id,
        'message': f'Import started for {len(df)} candidates'
    })
```

**2. Celery Import Task with Field Parsers:**

`apps/api/candidates/tasks.py`:
```python
from celery import shared_task
from decimal import Decimal
from .models import CandidateProfile
from authentication.models import User

@shared_task
def import_candidates_csv(records, column_mapping):
    success_count = 0
    error_count = 0
    errors = []

    # Field parsers
    def parse_bool(value):
        """Parse Sim/Não to True/False"""
        if not value or pd.isna(value):
            return False
        return str(value).strip().lower() in ['sim', 'yes', 'true']

    def parse_currency(value):
        """Parse R$ 7.500,00 to Decimal(7500.00)"""
        if not value or pd.isna(value):
            return None
        try:
            cleaned = str(value).replace('R$', '').replace('.', '').replace(',', '.').strip()
            return Decimal(cleaned)
        except:
            return None

    def parse_list(value):
        """Parse comma-separated string to list"""
        if not value or pd.isna(value):
            return []
        return [item.strip() for item in str(value).split(',') if item.strip()]

    def parse_date(value):
        """Parse date string"""
        if not value or pd.isna(value):
            return None
        try:
            return pd.to_datetime(value).date()
        except:
            return None

    for record in records:
        try:
            email = record.get('Email', '')
            if not email:
                error_count += 1
                errors.append({'record': record, 'error': 'Email missing'})
                continue

            full_name = record.get('Nome', '')

            # Create or get user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'role': 'candidate'}
            )

            # Create candidate profile with ALL 36 fields
            candidate, created = CandidateProfile.objects.update_or_create(
                user=user,
                defaults={
                    # Basic fields
                    'full_name': full_name,
                    'cpf': record.get('CPF', ''),
                    'linkedin': record.get('LinkedIn', ''),

                    # New fields from Notion CSV
                    'accepts_pj': parse_bool(record.get('Aceita ser PJ?')),
                    'zip_code': record.get('CEP', ''),
                    'city': record.get('Cidade', ''),
                    'contract_signed': parse_bool(record.get('Contrato Assinado?')),
                    'interview_date': parse_date(record.get('Data da Entrevista')),
                    'relocation_availability': record.get('Disp. p/ Mudança?', ''),
                    'travel_availability': record.get('Disponibilidade para viagem?', ''),
                    'academic_degree': record.get('Formação Acadêmica', ''),
                    'languages': parse_list(record.get('Idiomas', '')),
                    'work_model': record.get('Modelo de Trabalho', ''),
                    'minimum_salary': parse_currency(record.get('Mín Mensal Remuneração Total')),
                    'salary_notes': record.get('Obs. Remuneração', ''),
                    'is_pcd': parse_bool(record.get('PCD?')),
                    'positions_of_interest': parse_list(record.get('Posições de Interesse', '')),
                    'has_drivers_license': parse_bool(record.get('Possui CNH?')),
                    'has_vehicle': parse_bool(record.get('Possui veículo próprio?')),

                    # Experience fields
                    'active_prospecting_experience': record.get('Prospecção Ativa', ''),
                    'inbound_qualification_experience': record.get('Qualificação de Leads Inbound', ''),
                    'portfolio_retention_experience': record.get('Retenção de Carteira de Clientes', ''),
                    'portfolio_expansion_experience': record.get('Expansão/Venda pra carteira de clientes', ''),
                    'portfolio_size': record.get('Tamanho da carteira gerida', ''),
                    'inbound_sales_experience': record.get('Venda p/ Leads Inbound', ''),
                    'outbound_sales_experience': record.get('Venda p/ Leads Outbound', ''),
                    'field_sales_experience': record.get('Vendas em Field Sales', ''),
                    'inside_sales_experience': record.get('Vendas em Inside Sales', ''),

                    # Existing fields
                    'tools_software': parse_list(record.get('Softwares de Vendas', '')),
                    'solutions_sold': parse_list(record.get('Soluções que já vendeu', '')),
                    'departments_sold_to': parse_list(record.get('Departamentos que já vendeu', '')),
                    'sales_cycle': record.get('[Vendas/Closer] Ciclo de vendas', ''),
                    'avg_ticket': record.get('[Vendas/Closer] Ticket Médio', ''),
                    'status': record.get('Status/Contrato', 'available'),
                }
            )

            success_count += 1
        except Exception as e:
            error_count += 1
            errors.append({'record': record.get('Nome', 'Unknown'), 'error': str(e)})

    return {
        'success_count': success_count,
        'error_count': error_count,
        'errors': errors[:10]  # Limit errors to first 10
    }
```

---

## Story 3.3.5: Admin Manual Candidate Creation

### Business Context

Permite que admins criem candidatos manualmente através de um formulário simplificado, gerando credenciais automáticas e enviando email de boas-vindas ao candidato para que complete seu perfil.

**Use Cases:**
- Candidato indicado por parceiro (não veio do CSV)
- Candidato descoberto em evento/networking
- Candidato que entrou em contato direto (sem se registrar)
- Criação de perfil inicial para posterior completude pelo próprio candidato

**Diferenciação:**
- `import_source: 'admin_created'` (vs `csv_import` or `self_registered`)
- Senha temporária gerada automaticamente
- Email de convite enviado com link para completar perfil
- Campos essenciais preenchidos pelo admin, candidato completa o resto

### Architecture Context

**Form Strategy:**
- **Admin preenche campos mínimos**: Nome, email, telefone, posição, cidade
- **Sistema gera automaticamente**: Senha temporária, token de ativação
- **Candidato completa depois**: Bio, experiências, habilidades, vídeo, foto

**Authentication Flow:**
1. Admin cria candidato → `User` criado com `password_reset_required=True`
2. Email enviado → "Bem-vindo ao TalentBase! Complete seu perfil"
3. Candidato clica no link → Redireciona para `/auth/set-password?token=xxx`
4. Candidato define senha → Redireciona para `/candidate/profile/create`
5. Candidato completa perfil → Perfil ativo

**Email Template:**
```
Assunto: Bem-vindo ao TalentBase - Complete seu Perfil

Olá [Nome],

Você foi adicionado ao TalentBase por nossa equipe!

Complete seu perfil de vendedor para começar a receber oportunidades de vagas:
[Link para definir senha e completar perfil]

Este link expira em 7 dias.

Qualquer dúvida, responda este email.

Atenciosamente,
Equipe TalentBase
```

### Implementation Steps

**1. Update User Model with Password Reset Flag:**

`apps/api/authentication/models.py`:
```python
from django.contrib.auth.models import AbstractBaseUser
from django.db import models
from core.models import BaseModel
import uuid

class User(AbstractBaseUser, BaseModel):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=[('admin', 'Admin'), ('candidate', 'Candidate'), ('company', 'Company')])
    is_active = models.BooleanField(default=True)
    password_reset_required = models.BooleanField(default=False)  # NEW FIELD
    password_reset_token = models.UUIDField(null=True, blank=True, unique=True)  # NEW FIELD
    password_reset_token_expires = models.DateTimeField(null=True, blank=True)  # NEW FIELD

    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email
```

**2. Create Admin Candidate Creation API:**

`apps/api/candidates/views.py`:
```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
import uuid
from authentication.models import User
from candidates.models import CandidateProfile
from core.tasks import send_welcome_email

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_create_candidate(request):
    """
    Admin creates candidate manually with minimal fields.
    Generates temp password, sends welcome email with profile completion link.
    """
    # Validate required fields
    email = request.data.get('email')
    full_name = request.data.get('full_name')
    phone = request.data.get('phone')
    city = request.data.get('city', '')
    current_position = request.data.get('current_position', '')

    if not email or not full_name or not phone:
        return Response(
            {'error': 'Email, full_name, and phone are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': f'User with email {email} already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create User with password reset required
    password_reset_token = uuid.uuid4()
    user = User.objects.create(
        email=email,
        role='candidate',
        password_reset_required=True,
        password_reset_token=password_reset_token,
        password_reset_token_expires=timezone.now() + timedelta(days=7)
    )
    user.set_unusable_password()  # No login until password is set
    user.save()

    # Create minimal CandidateProfile
    candidate = CandidateProfile.objects.create(
        user=user,
        full_name=full_name,
        phone=phone,
        city=city,
        current_position=current_position,
        import_source='admin_created'  # NEW FIELD (add to model)
    )

    # Send welcome email with profile completion link
    completion_url = f"https://www.salesdog.click/auth/set-password?token={password_reset_token}"
    send_welcome_email.delay(
        email=email,
        full_name=full_name,
        completion_url=completion_url
    )

    return Response({
        'id': str(candidate.id),
        'email': email,
        'full_name': full_name,
        'message': 'Candidate created successfully. Welcome email sent.',
        'completion_url': completion_url  # For testing
    }, status=status.HTTP_201_CREATED)
```

**3. Add `import_source` Field to CandidateProfile Model:**

`apps/api/candidates/models.py`:
```python
class CandidateProfile(BaseModel):
    # ... existing fields ...

    # Import tracking
    import_source = models.CharField(
        max_length=20,
        choices=[
            ('self_registered', 'Self Registered'),
            ('csv_import', 'CSV Import'),
            ('admin_created', 'Admin Created'),
        ],
        default='self_registered',
        help_text="How was this candidate added to the system?"
    )
```

**4. Create Welcome Email Task:**

`apps/api/core/tasks.py`:
```python
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_welcome_email(email, full_name, completion_url):
    """Send welcome email to admin-created candidate"""
    subject = 'Bem-vindo ao TalentBase - Complete seu Perfil'

    message = f"""
Olá {full_name},

Você foi adicionado ao TalentBase por nossa equipe!

Complete seu perfil de vendedor para começar a receber oportunidades de vagas em empresas parceiras.

Clique no link abaixo para definir sua senha e completar seu perfil:
{completion_url}

⚠️ Este link expira em 7 dias.

Qualquer dúvida, responda este email.

Atenciosamente,
Equipe TalentBase
    """

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )
```

**5. Create Password Set View:**

`apps/api/authentication/views.py`:
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from authentication.models import User

@api_view(['POST'])
def set_password_with_token(request):
    """
    Candidate sets password using token from welcome email.
    """
    token = request.data.get('token')
    new_password = request.data.get('password')

    if not token or not new_password:
        return Response(
            {'error': 'Token and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(password_reset_token=token)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid or expired token'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check token expiration
    if user.password_reset_token_expires < timezone.now():
        return Response(
            {'error': 'Token has expired. Please contact admin.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Set password and clear reset flags
    user.set_password(new_password)
    user.password_reset_required = False
    user.password_reset_token = None
    user.password_reset_token_expires = None
    user.save()

    return Response({
        'message': 'Password set successfully. You can now login.',
        'email': user.email
    })
```

**6. Create Frontend Admin Form:**

`packages/web/app/routes/admin.candidates.new.tsx`:
```typescript
import { Form, useActionData, useNavigate } from '@remix-run/react';
import { json, redirect, type ActionFunctionArgs } from '@remix-run/node';
import { Button, Input, Select } from '@talentbase/design-system';
import { requireAuth } from '~/utils/auth.server';
import { createCandidate } from '~/lib/api/candidates';

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request, 'admin');
  const formData = await request.formData();

  try {
    const result = await createCandidate(request, {
      email: formData.get('email') as string,
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      city: formData.get('city') as string,
      current_position: formData.get('current_position') as string,
    });

    // Show success toast and redirect
    return redirect('/admin/candidates?created=true');
  } catch (error: any) {
    return json(
      { error: error.message || 'Failed to create candidate' },
      { status: 400 }
    );
  }
}

export default function AdminCreateCandidate() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Criar Novo Candidato</h1>
        <p className="text-gray-600 mt-2">
          Preencha os campos essenciais. O candidato receberá um email para completar o perfil.
        </p>
      </div>

      <Form method="post" className="space-y-6 bg-white p-6 rounded-lg shadow">
        {actionData?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {actionData.error}
          </div>
        )}

        <Input
          label="Nome Completo *"
          name="full_name"
          required
          placeholder="João Silva"
        />

        <Input
          label="Email *"
          name="email"
          type="email"
          required
          placeholder="joao.silva@email.com"
          helperText="O candidato receberá um email neste endereço para completar o perfil"
        />

        <Input
          label="Telefone *"
          name="phone"
          type="tel"
          required
          placeholder="(11) 99999-9999"
        />

        <Input
          label="Cidade"
          name="city"
          placeholder="São Paulo, SP"
        />

        <Select
          label="Posição"
          name="current_position"
          options={[
            { value: '', label: 'Selecione...' },
            { value: 'SDR/BDR', label: 'SDR/BDR' },
            { value: 'AE/Closer', label: 'Account Executive/Closer' },
            { value: 'CSM', label: 'Customer Success Manager' },
          ]}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/candidates')}
          >
            Cancelar
          </Button>
          <Button type="submit">
            Criar Candidato e Enviar Email
          </Button>
        </div>
      </Form>

      <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">O que acontece após criar?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✉️ Email de boas-vindas enviado ao candidato</li>
          <li>🔑 Link para definir senha (válido por 7 dias)</li>
          <li>📝 Candidato completa perfil (bio, experiências, skills, vídeo)</li>
          <li>✅ Perfil fica disponível para edição e curadoria admin</li>
        </ul>
      </div>
    </div>
  );
}
```

**7. Create Password Set Form (Frontend):**

`packages/web/app/routes/auth.set-password.tsx`:
```typescript
import { Form, useActionData, useSearchParams } from '@remix-run/react';
import { json, redirect, type ActionFunctionArgs } from '@remix-run/node';
import { Button, Input } from '@talentbase/design-system';
import { setPasswordWithToken } from '~/lib/api/auth';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (password !== confirmPassword) {
    return json({ error: 'Passwords do not match' }, { status: 400 });
  }

  if (password.length < 8) {
    return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  try {
    await setPasswordWithToken(token, password);
    return redirect('/auth/login?password_set=true');
  } catch (error: any) {
    return json(
      { error: error.message || 'Failed to set password' },
      { status: 400 }
    );
  }
}

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const actionData = useActionData<typeof action>();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Link Inválido</h1>
          <p className="text-gray-700">
            Este link é inválido ou expirou. Entre em contato com o suporte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">Defina sua Senha</h1>
        <p className="text-gray-600 mb-6">
          Crie uma senha segura para acessar sua conta TalentBase.
        </p>

        <Form method="post" className="space-y-4">
          <input type="hidden" name="token" value={token} />

          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {actionData.error}
            </div>
          )}

          <Input
            label="Nova Senha"
            name="password"
            type="password"
            required
            minLength={8}
            helperText="Mínimo 8 caracteres"
          />

          <Input
            label="Confirmar Senha"
            name="confirm_password"
            type="password"
            required
            minLength={8}
          />

          <Button type="submit" className="w-full">
            Definir Senha e Continuar
          </Button>
        </Form>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Após definir sua senha, você será redirecionado para completar seu perfil.
        </p>
      </div>
    </div>
  );
}
```

**8. Add API Client Functions:**

`packages/web/app/lib/api/candidates.ts`:
```typescript
import { getApiBaseUrl } from '~/config/api';

export async function createCandidate(request: Request, data: {
  email: string;
  full_name: string;
  phone: string;
  city?: string;
  current_position?: string;
}) {
  const apiUrl = getApiBaseUrl();
  const token = await getAuthToken(request);

  const response = await fetch(`${apiUrl}/api/v1/admin/candidates/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create candidate');
  }

  return response.json();
}
```

`packages/web/app/lib/api/auth.ts`:
```typescript
import { getApiBaseUrl } from '~/config/api';

export async function setPasswordWithToken(token: string, password: string) {
  const apiUrl = getApiBaseUrl();

  const response = await fetch(`${apiUrl}/api/v1/auth/set-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to set password');
  }

  return response.json();
}
```

**9. Update Admin Candidates Page with "Create" Button:**

`packages/web/app/routes/admin.candidates.tsx`:
```typescript
import { Link } from '@remix-run/react';
import { Button } from '@talentbase/design-system';
import { ROUTES } from '~/config/routes';

export default function AdminCandidates() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Candidatos</h1>
        <div className="flex gap-3">
          <Link to={ROUTES.admin.importCandidates}>
            <Button variant="secondary">Importar CSV</Button>
          </Link>
          <Link to="/admin/candidates/new">
            <Button>+ Criar Candidato</Button>
          </Link>
        </div>
      </div>

      {/* Existing table implementation */}
    </div>
  );
}
```

**10. Add Route to Django URLs:**

`apps/api/candidates/urls.py`:
```python
from django.urls import path
from . import views

urlpatterns = [
    # ... existing routes ...
    path('admin/candidates/create', views.admin_create_candidate, name='admin-create-candidate'),
]
```

`apps/api/authentication/urls.py`:
```python
from django.urls import path
from . import views

urlpatterns = [
    # ... existing routes ...
    path('auth/set-password', views.set_password_with_token, name='set-password-with-token'),
]
```

### Database Migration

```bash
# Create migration for new fields
DJANGO_SETTINGS_MODULE=talentbase.settings.development poetry run python manage.py makemigrations authentication candidates --name add_admin_creation_fields

# Apply migration
DJANGO_SETTINGS_MODULE=talentbase.settings.development poetry run python manage.py migrate
```

### Testing Approach

**Backend Tests:**

`apps/api/candidates/tests/test_admin_creation.py`:
```python
from django.test import TestCase
from rest_framework.test import APIClient
from authentication.models import User
from candidates.models import CandidateProfile

class AdminCandidateCreationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='testpass123',
            role='admin'
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_admin_creates_candidate_success(self):
        response = self.client.post('/api/v1/admin/candidates/create', {
            'email': 'newcandidate@test.com',
            'full_name': 'New Candidate',
            'phone': '11999999999',
            'city': 'São Paulo',
            'current_position': 'SDR/BDR'
        })

        self.assertEqual(response.status_code, 201)

        # Check user created
        user = User.objects.get(email='newcandidate@test.com')
        self.assertEqual(user.role, 'candidate')
        self.assertTrue(user.password_reset_required)
        self.assertIsNotNone(user.password_reset_token)

        # Check candidate profile created
        candidate = CandidateProfile.objects.get(user=user)
        self.assertEqual(candidate.full_name, 'New Candidate')
        self.assertEqual(candidate.import_source, 'admin_created')

    def test_admin_creates_duplicate_email_fails(self):
        User.objects.create_user(
            email='existing@test.com',
            password='pass',
            role='candidate'
        )

        response = self.client.post('/api/v1/admin/candidates/create', {
            'email': 'existing@test.com',
            'full_name': 'Test',
            'phone': '11999999999'
        })

        self.assertEqual(response.status_code, 400)
        self.assertIn('already exists', response.data['error'])

    def test_set_password_with_valid_token(self):
        user = User.objects.create(
            email='test@test.com',
            role='candidate',
            password_reset_required=True,
            password_reset_token=uuid.uuid4(),
            password_reset_token_expires=timezone.now() + timedelta(days=7)
        )

        response = self.client.post('/api/v1/auth/set-password', {
            'token': str(user.password_reset_token),
            'password': 'newpassword123'
        })

        self.assertEqual(response.status_code, 200)

        user.refresh_from_db()
        self.assertFalse(user.password_reset_required)
        self.assertIsNone(user.password_reset_token)
        self.assertTrue(user.check_password('newpassword123'))
```

**Frontend E2E Test:**

`packages/web/tests/e2e/admin-create-candidate.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test('admin creates candidate and receives email', async ({ page }) => {
  // Login as admin
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill('admin@test.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Go to create candidate page
  await page.goto('/admin/candidates/new');

  // Fill form
  await page.getByLabel('Nome Completo').fill('João Silva');
  await page.getByLabel('Email').fill('joao.silva@test.com');
  await page.getByLabel('Telefone').fill('11999999999');
  await page.getByLabel('Cidade').fill('São Paulo, SP');
  await page.getByLabel('Posição').selectOption('SDR/BDR');

  // Submit
  await page.getByRole('button', { name: 'Criar Candidato' }).click();

  // Verify redirect
  await expect(page).toHaveURL('/admin/candidates?created=true');

  // Verify success message (toast)
  await expect(page.getByText('Candidato criado com sucesso')).toBeVisible();
});
```

### Success Criteria

- [ ] Admin can create candidate with minimal fields (email, name, phone)
- [ ] User account created with `password_reset_required=True`
- [ ] Welcome email sent with password set link (7-day expiration)
- [ ] Candidate can set password via token link
- [ ] After password set, candidate redirected to profile creation
- [ ] CandidateProfile has `import_source='admin_created'`
- [ ] Duplicate email validation prevents creation
- [ ] Token expiration enforced (7 days)
- [ ] Admin table shows "Create Candidate" button
- [ ] E2E test covers full flow

### Routes Added

**Backend:**
- `POST /api/v1/admin/candidates/create` - Admin creates candidate
- `POST /api/v1/auth/set-password` - Candidate sets password with token

**Frontend:**
- `/admin/candidates/new` - Admin create candidate form
- `/auth/set-password?token=xxx` - Password set page

---

## Remaining Stories Summary

### Story 3.4: Admin Candidate Curation & Editing

> **UPDATED 2025-10-09**: Admin table expanded with filters and columns for new Notion fields (city, salary, work_model, mobility, etc.)

- Route: `/admin/candidates`
- Features: Table list with advanced filters, search, detailed view with tabs, edit form
- Admin can set: status, verified flag, category
- API: `PATCH /api/v1/admin/candidates/:id`

**Enhanced Filters:**
- Position (select)
- Status (select)
- City (text search)
- Work Model (multi-select: Home-office, Híbrido, Presencial)
- Minimum Salary (range slider)
- Accepts PJ (boolean)
- PCD (boolean)
- Has Driver's License (boolean)
- Travel Availability (select)

**Table Columns (default visible):**
- Nome
- Posição
- Cidade
- Salário Mínimo
- Modelo de Trabalho
- Status

**Additional Toggleable Columns:**
- Aceita PJ
- PCD
- CNH
- Disponibilidade Viagem
- Tamanho Carteira
- Idiomas

**Detail View Tabs:**
1. **Informações Básicas**: Nome, telefone, LinkedIn, formação, idiomas
2. **Experiência Detalhada**: Prospecção ativa, qualificação inbound, retenção, expansão, carteira, field/inside sales
3. **Mobilidade & Preferências**: Modelo trabalho, disponibilidade viagem/mudança, CNH, veículo
4. **Remuneração**: Salário mínimo, observações, aceita PJ

### Story 3.5: Candidate Ranking System
- Route: `/admin/rankings`
- Admin assigns score 0-100 per candidate
- Multiple ranking categories (Overall, SDR, AE, CSM)
- Rankings displayed in admin table (sortable)
- API: `POST /api/v1/admin/rankings`

### Story 3.6: Candidate Dashboard
- Route: `/candidate`
- Widgets: Profile completeness, shareable link, applications, recommended jobs
- Links: View profile, edit profile, browse jobs, my applications

### Story 3.7: Candidate Profile Editing
- Route: `/candidate/profile/edit`
- Pre-populated form, all fields editable
- Photo re-upload replaces S3 file
- API: `PATCH /api/v1/candidates/:id`

---

## Epic Completion Checklist

- [ ] Story 3.1: Multi-step profile creation working, S3 upload functional
- [ ] Story 3.2: Shareable public profiles generated, SEO optimized
- [ ] Story 3.3: CSV import tool working, Notion data migrated
- [ ] Story 3.3.5: Admin manual candidate creation working, welcome emails sent
- [ ] Story 3.4: Admin can edit candidates, set status/verified
- [ ] Story 3.5: Ranking system implemented, scores assigned
- [ ] Story 3.6: Candidate dashboard functional
- [ ] Story 3.7: Profile editing working

---

**Document Version:** 1.0
**Last Updated:** 2025-10-01
**Status:** Ready for Implementation
