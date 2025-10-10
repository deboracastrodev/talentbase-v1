# Technical Specification - Epic 3: Candidate Management System

**Epic:** Epic 3 - Candidate Management System
**Timeline:** Weeks 4-7
**Stories:** 3.1 - 3.7
**Author:** BMad Architecture Agent
**Date:** 2025-10-01

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
- [ ] Story 3.4: Admin can edit candidates, set status/verified
- [ ] Story 3.5: Ranking system implemented, scores assigned
- [ ] Story 3.6: Candidate dashboard functional
- [ ] Story 3.7: Profile editing working

---

**Document Version:** 1.0
**Last Updated:** 2025-10-01
**Status:** Ready for Implementation
