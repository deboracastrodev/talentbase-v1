# Story 1.2: Implement Database Schema (All Models)

Status: Draft

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../CODE_QUALITY.md)
- [Backend Best Practices](../BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../PRE_IMPLEMENTATION_CHECKLIST.md)

## Story

Como um **backend developer**,
Eu quero **o schema completo do PostgreSQL implementado como models Django**,
Para que **todas as entidades estejam prontas para desenvolvimento de APIs**.

## Contexto

Esta story implementa todo o schema do banco de dados TalentBase conforme especificado no tech spec Epic 1. Inclui criação de 7 Django apps (core, authentication, candidates, companies, jobs, applications, matching) com todos os models, relacionamentos e migrations.

**Correção Importante:** O tech spec original não incluía o comando para criar o app `matching`, mas o modelo `Ranking` depende dele. Esta story corrige esse gap identificado no review.

## Acceptance Criteria

1. ✅ Model `User` customizado criado com campo `role` (admin, candidate, company)
2. ✅ Model `CandidateProfile` com todos os campos específicos de vendas (position, experience, tools, etc.)
3. ✅ Model `CompanyProfile` com campos CNPJ, industry, status
4. ✅ Model `JobPosting` com position, seniority, salary, requirements
5. ✅ Model `Application` linkando candidatos a jobs
6. ✅ Model `Experience` para histórico profissional dos candidatos
7. ✅ Model `Ranking` para scores atribuídos pelo admin
8. ✅ Todas as foreign keys e índices definidos corretamente
9. ✅ Django migrations criadas e aplicadas sem erros
10. ✅ Campos UUID como primary keys em todos os models
11. ✅ Soft deletes implementados via campo `is_active`
12. ✅ Timestamps `created_at` e `updated_at` em todos os models
13. ✅ Testes de model criados e executando com sucesso
14. ✅ Django admin configurado para todos os models

## Tasks / Subtasks

### Task 1: Criar Django Apps (AC: 1-7)
- [ ] Criar app `core`:
  ```bash
  cd apps/api
  poetry run python manage.py startapp core
  ```
- [ ] Criar app `authentication`:
  ```bash
  poetry run python manage.py startapp authentication
  ```
- [ ] Criar app `candidates`:
  ```bash
  poetry run python manage.py startapp candidates
  ```
- [ ] Criar app `companies`:
  ```bash
  poetry run python manage.py startapp companies
  ```
- [ ] Criar app `jobs`:
  ```bash
  poetry run python manage.py startapp jobs
  ```
- [ ] Criar app `applications`:
  ```bash
  poetry run python manage.py startapp applications
  ```
- [ ] **[FIX]** Criar app `matching`:
  ```bash
  poetry run python manage.py startapp matching
  ```
  (Este comando estava ausente no tech spec original - gap identificado no review)

### Task 2: Implementar BaseModel no core (AC: 10, 11, 12)
- [ ] Criar arquivo `apps/api/core/models.py`:
  ```python
  import uuid
  from django.db import models

  class BaseModel(models.Model):
      """
      Abstract base model com campos comuns a todos os models.
      Inclui UUID PK, soft delete, e timestamps.
      """
      id = models.UUIDField(
          primary_key=True,
          default=uuid.uuid4,
          editable=False,
          help_text="Identificador único UUID"
      )
      created_at = models.DateTimeField(
          auto_now_add=True,
          help_text="Data/hora de criação"
      )
      updated_at = models.DateTimeField(
          auto_now=True,
          help_text="Data/hora da última atualização"
      )
      is_active = models.BooleanField(
          default=True,
          db_index=True,
          help_text="Soft delete: False = deletado"
      )

      class Meta:
          abstract = True
          ordering = ['-created_at']
  ```

### Task 3: Implementar User Model customizado (AC: 1)
- [ ] Criar arquivo `apps/api/authentication/models.py`:
  ```python
  import uuid
  from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
  from django.db import models

  class UserManager(BaseUserManager):
      def create_user(self, email, password=None, **extra_fields):
          if not email:
              raise ValueError('Email é obrigatório')
          email = self.normalize_email(email)
          user = self.model(email=email, **extra_fields)
          user.set_password(password)
          user.save(using=self._db)
          return user

      def create_superuser(self, email, password=None, **extra_fields):
          extra_fields.setdefault('role', 'admin')
          extra_fields.setdefault('is_staff', True)
          extra_fields.setdefault('is_superuser', True)
          return self.create_user(email, password, **extra_fields)

  class User(AbstractBaseUser, PermissionsMixin):
      """
      Model de usuário customizado usando email como identificador.
      Suporta 3 roles: admin, candidate, company.
      """
      ROLE_CHOICES = [
          ('admin', 'Admin'),
          ('candidate', 'Candidato'),
          ('company', 'Empresa'),
      ]

      id = models.UUIDField(
          primary_key=True,
          default=uuid.uuid4,
          editable=False
      )
      email = models.EmailField(
          unique=True,
          db_index=True,
          help_text="Email único do usuário"
      )
      role = models.CharField(
          max_length=20,
          choices=ROLE_CHOICES,
          help_text="Papel do usuário no sistema"
      )
      is_active = models.BooleanField(
          default=True,
          help_text="Usuário pode fazer login?"
      )
      is_staff = models.BooleanField(
          default=False,
          help_text="Acesso ao Django Admin"
      )
      created_at = models.DateTimeField(auto_now_add=True)
      updated_at = models.DateTimeField(auto_now=True)

      USERNAME_FIELD = 'email'
      REQUIRED_FIELDS = ['role']

      objects = UserManager()

      class Meta:
          db_table = 'users'
          verbose_name = 'Usuário'
          verbose_name_plural = 'Usuários'

      def __str__(self):
          return f"{self.email} ({self.get_role_display()})"
  ```

### Task 4: Implementar Candidate Models (AC: 2, 6)
- [ ] Criar validador de YouTube URL:
  ```python
  from django.core.exceptions import ValidationError

  def validate_youtube_url(value):
      """Valida que a URL é do YouTube."""
      if value and 'youtube.com' not in value and 'youtu.be' not in value:
          raise ValidationError('URL deve ser do YouTube (youtube.com ou youtu.be)')
  ```
- [ ] Criar arquivo `apps/api/candidates/models.py`:
  ```python
  import uuid
  from django.db import models
  from core.models import BaseModel
  from authentication.models import User

  class CandidateProfile(BaseModel):
      """
      Perfil completo de candidato com dados específicos de vendas tech.
      """
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

      user = models.OneToOneField(
          User,
          on_delete=models.CASCADE,
          related_name='candidate_profile',
          help_text="Usuário associado ao perfil"
      )
      full_name = models.CharField(
          max_length=200,
          help_text="Nome completo do candidato"
      )
      phone = models.CharField(
          max_length=20,
          help_text="Telefone de contato"
      )
      cpf = models.CharField(
          max_length=255,
          help_text="CPF (será encriptado)"
      )  # TODO: Adicionar encriptação via django-encrypted-model-fields
      linkedin = models.URLField(
          help_text="URL do perfil LinkedIn"
      )
      video_url = models.URLField(
          blank=True,
          validators=[validate_youtube_url],
          help_text="URL do vídeo de apresentação no YouTube"
      )
      current_position = models.CharField(
          max_length=50,
          choices=POSITION_CHOICES,
          db_index=True,
          help_text="Posição atual na carreira de vendas"
      )
      years_of_experience = models.PositiveIntegerField(
          help_text="Anos de experiência em vendas"
      )
      sales_type = models.CharField(
          max_length=50,
          blank=True,
          help_text="Tipo de vendas: Inbound, Outbound, Both"
      )
      sales_cycle = models.CharField(
          max_length=100,
          blank=True,
          help_text="Ciclo de vendas típico (ex: 30-60 dias)"
      )
      avg_ticket = models.CharField(
          max_length=100,
          blank=True,
          help_text="Ticket médio (ex: R$ 10k-50k MRR)"
      )
      top_skills = models.JSONField(
          default=list,
          help_text="Lista de habilidades principais (ex: ['Outbound', 'Negociação'])"
      )
      tools_software = models.JSONField(
          default=list,
          help_text="Ferramentas dominadas (ex: ['Salesforce', 'HubSpot'])"
      )
      solutions_sold = models.JSONField(
          default=list,
          help_text="Soluções vendidas (ex: ['SaaS B2B', 'Fintech'])"
      )
      departments_sold_to = models.JSONField(
          default=list,
          help_text="Departamentos para quem vendeu (ex: ['C-Level', 'Marketing'])"
      )
      bio = models.TextField(
          blank=True,
          help_text="Bio/resumo profissional"
      )
      status = models.CharField(
          max_length=20,
          choices=STATUS_CHOICES,
          default='available',
          db_index=True,
          help_text="Status de disponibilidade"
      )
      is_public = models.BooleanField(
          default=False,
          help_text="Perfil visível publicamente?"
      )
      public_token = models.UUIDField(
          default=uuid.uuid4,
          unique=True,
          db_index=True,
          help_text="Token para URL pública do perfil"
      )

      class Meta:
          db_table = 'candidate_profiles'
          verbose_name = 'Perfil de Candidato'
          verbose_name_plural = 'Perfis de Candidatos'
          indexes = [
              models.Index(fields=['current_position', 'status']),
              models.Index(fields=['status', '-created_at']),
          ]

      def __str__(self):
          return f"{self.full_name} ({self.current_position})"

  class Experience(BaseModel):
      """
      Histórico de experiências profissionais do candidato.
      """
      candidate = models.ForeignKey(
          CandidateProfile,
          on_delete=models.CASCADE,
          related_name='experiences',
          help_text="Candidato dono desta experiência"
      )
      company_name = models.CharField(
          max_length=200,
          help_text="Nome da empresa"
      )
      position = models.CharField(
          max_length=200,
          help_text="Cargo ocupado"
      )
      start_date = models.DateField(
          help_text="Data de início"
      )
      end_date = models.DateField(
          null=True,
          blank=True,
          help_text="Data de término (null se emprego atual)"
      )
      responsibilities = models.TextField(
          blank=True,
          help_text="Responsabilidades e conquistas"
      )

      class Meta:
          db_table = 'experiences'
          verbose_name = 'Experiência Profissional'
          verbose_name_plural = 'Experiências Profissionais'
          ordering = ['-start_date']
          indexes = [
              models.Index(fields=['candidate', '-start_date']),
          ]

      def __str__(self):
          return f"{self.candidate.full_name} - {self.company_name} ({self.position})"
  ```

### Task 5: Implementar Company Models (AC: 3)
- [ ] Criar arquivo `apps/api/companies/models.py`:
  ```python
  from django.db import models
  from core.models import BaseModel
  from authentication.models import User

  class CompanyProfile(BaseModel):
      """
      Perfil de empresa que contrata talentos de vendas.
      """
      SIZE_CHOICES = [
          ('1-10', '1-10 funcionários'),
          ('11-50', '11-50 funcionários'),
          ('51-200', '51-200 funcionários'),
          ('201+', 'Mais de 200 funcionários'),
      ]

      user = models.OneToOneField(
          User,
          on_delete=models.CASCADE,
          null=True,
          blank=True,
          related_name='company_profile',
          help_text="Usuário associado (null se criado por admin)"
      )
      company_name = models.CharField(
          max_length=200,
          help_text="Razão social ou nome fantasia"
      )
      cnpj = models.CharField(
          max_length=255,
          help_text="CNPJ (será encriptado)"
      )  # TODO: Adicionar encriptação
      website = models.URLField(
          help_text="Site da empresa"
      )
      industry = models.CharField(
          max_length=100,
          help_text="Setor/indústria (ex: SaaS, Fintech)"
      )
      size = models.CharField(
          max_length=20,
          choices=SIZE_CHOICES,
          help_text="Tamanho da empresa"
      )
      description = models.TextField(
          blank=True,
          help_text="Descrição da empresa"
      )
      contact_person_name = models.CharField(
          max_length=200,
          help_text="Nome do responsável"
      )
      contact_person_email = models.EmailField(
          help_text="Email do responsável"
      )
      contact_person_phone = models.CharField(
          max_length=20,
          help_text="Telefone do responsável"
      )
      created_by_admin = models.BooleanField(
          default=False,
          help_text="True se criado por admin, False se self-registered"
      )

      class Meta:
          db_table = 'company_profiles'
          verbose_name = 'Perfil de Empresa'
          verbose_name_plural = 'Perfis de Empresas'
          indexes = [
              models.Index(fields=['industry']),
              models.Index(fields=['-created_at']),
          ]

      def __str__(self):
          return self.company_name
  ```

### Task 6: Implementar Job Models (AC: 4)
- [ ] Criar arquivo `apps/api/jobs/models.py`:
  ```python
  from django.db import models
  from core.models import BaseModel
  from companies.models import CompanyProfile

  class JobPosting(BaseModel):
      """
      Vaga de emprego publicada por uma empresa.
      """
      POSITION_CHOICES = [
          ('SDR/BDR', 'SDR/BDR'),
          ('AE/Closer', 'Account Executive/Closer'),
          ('CSM', 'Customer Success Manager'),
      ]

      SENIORITY_CHOICES = [
          ('junior', 'Júnior'),
          ('pleno', 'Pleno'),
          ('senior', 'Sênior'),
      ]

      company = models.ForeignKey(
          CompanyProfile,
          on_delete=models.CASCADE,
          related_name='jobs',
          help_text="Empresa que publicou a vaga"
      )
      title = models.CharField(
          max_length=200,
          help_text="Título da vaga"
      )
      position_type = models.CharField(
          max_length=50,
          choices=POSITION_CHOICES,
          db_index=True,
          help_text="Tipo de posição"
      )
      seniority = models.CharField(
          max_length=20,
          choices=SENIORITY_CHOICES,
          help_text="Nível de senioridade"
      )
      description = models.TextField(
          help_text="Descrição completa da vaga"
      )
      responsibilities = models.TextField(
          help_text="Responsabilidades do cargo"
      )
      required_skills = models.JSONField(
          default=list,
          help_text="Habilidades requeridas (ex: ['Outbound', 'HubSpot'])"
      )
      required_tools = models.JSONField(
          default=list,
          help_text="Ferramentas requeridas (ex: ['Salesforce'])"
      )
      sales_cycle = models.CharField(
          max_length=100,
          blank=True,
          help_text="Ciclo de vendas da empresa"
      )
      avg_ticket = models.CharField(
          max_length=100,
          blank=True,
          help_text="Ticket médio da empresa"
      )
      location = models.CharField(
          max_length=100,
          help_text="Localização da vaga"
      )
      is_remote = models.BooleanField(
          default=False,
          help_text="Trabalho remoto?"
      )
      salary_range = models.CharField(
          max_length=100,
          blank=True,
          help_text="Faixa salarial (ex: R$ 5k-8k)"
      )

      class Meta:
          db_table = 'job_postings'
          verbose_name = 'Vaga de Emprego'
          verbose_name_plural = 'Vagas de Emprego'
          ordering = ['-created_at']
          indexes = [
              models.Index(fields=['position_type', 'is_active']),
              models.Index(fields=['company', '-created_at']),
              models.Index(fields=['is_active', '-created_at']),
          ]

      def __str__(self):
          return f"{self.title} - {self.company.company_name}"
  ```

### Task 7: Implementar Application Models (AC: 5)
- [ ] Criar arquivo `apps/api/applications/models.py`:
  ```python
  from django.db import models
  from core.models import BaseModel
  from candidates.models import CandidateProfile
  from jobs.models import JobPosting
  from authentication.models import User

  class Application(BaseModel):
      """
      Candidatura de um candidato para uma vaga.
      Pode ser criada pelo candidato ou pelo admin (matching).
      """
      STATUS_CHOICES = [
          ('pending', 'Pendente'),
          ('matched', 'Matched pelo Admin'),
          ('rejected', 'Rejeitado'),
      ]

      job = models.ForeignKey(
          JobPosting,
          on_delete=models.CASCADE,
          related_name='applications',
          help_text="Vaga para a qual se candidatou"
      )
      candidate = models.ForeignKey(
          CandidateProfile,
          on_delete=models.CASCADE,
          related_name='applications',
          help_text="Candidato que se candidatou"
      )
      status = models.CharField(
          max_length=20,
          choices=STATUS_CHOICES,
          default='pending',
          db_index=True,
          help_text="Status da candidatura"
      )
      matched_by_admin = models.ForeignKey(
          User,
          on_delete=models.SET_NULL,
          null=True,
          blank=True,
          related_name='matched_applications',
          help_text="Admin que fez o match (se aplicável)"
      )
      matched_at = models.DateTimeField(
          null=True,
          blank=True,
          help_text="Data/hora do match pelo admin"
      )
      admin_notes = models.TextField(
          blank=True,
          help_text="Notas internas do admin"
      )

      class Meta:
          db_table = 'applications'
          verbose_name = 'Candidatura'
          verbose_name_plural = 'Candidaturas'
          unique_together = [['job', 'candidate']]  # Evita candidaturas duplicadas
          ordering = ['-created_at']
          indexes = [
              models.Index(fields=['status', '-created_at']),
              models.Index(fields=['job', 'status']),
              models.Index(fields=['candidate', '-created_at']),
          ]

      def __str__(self):
          return f"{self.candidate.full_name} -> {self.job.title} ({self.status})"
  ```

### Task 8: Implementar Ranking Models (AC: 7)
- [ ] Criar arquivo `apps/api/matching/models.py`:
  ```python
  from django.db import models
  from core.models import BaseModel
  from candidates.models import CandidateProfile
  from authentication.models import User

  class Ranking(BaseModel):
      """
      Ranking/score atribuído pelo admin a um candidato.
      """
      candidate = models.OneToOneField(
          CandidateProfile,
          on_delete=models.CASCADE,
          related_name='ranking',
          help_text="Candidato sendo ranqueado"
      )
      score = models.DecimalField(
          max_digits=5,
          decimal_places=2,
          help_text="Score de 0.00 a 100.00"
      )
      rank_position = models.PositiveIntegerField(
          null=True,
          blank=True,
          help_text="Posição geral no ranking (opcional)"
      )
      ranked_by = models.ForeignKey(
          User,
          on_delete=models.SET_NULL,
          null=True,
          blank=True,
          help_text="Admin que atribuiu o ranking"
      )
      ranking_notes = models.TextField(
          blank=True,
          help_text="Notas sobre o ranking (critérios, justificativa)"
      )

      class Meta:
          db_table = 'rankings'
          verbose_name = 'Ranking de Candidato'
          verbose_name_plural = 'Rankings de Candidatos'
          ordering = ['-score', 'rank_position']
          indexes = [
              models.Index(fields=['-score']),
              models.Index(fields=['rank_position']),
          ]

      def __str__(self):
          return f"{self.candidate.full_name} - Score: {self.score}"
  ```

### Task 9: Configurar apps no settings (AC: 9)
- [ ] Editar `apps/api/talentbase/settings/base.py`:
  ```python
  INSTALLED_APPS = [
      # Django Core
      'django.contrib.admin',
      'django.contrib.auth',
      'django.contrib.contenttypes',
      'django.contrib.sessions',
      'django.contrib.messages',
      'django.contrib.staticfiles',

      # Third-party
      'rest_framework',
      'corsheaders',

      # Local apps (IMPORTANTE: ordem de dependências)
      'core',
      'authentication',
      'candidates',
      'companies',
      'jobs',
      'applications',
      'matching',
  ]

  # Configurar User model customizado
  AUTH_USER_MODEL = 'authentication.User'
  ```

### Task 10: Criar e aplicar migrations (AC: 9, 10, 11, 12)
- [ ] Criar migrations para todos os apps:
  ```bash
  cd apps/api
  poetry run python manage.py makemigrations
  ```
- [ ] Revisar migrations geradas (verificar dependências entre apps)
- [ ] Aplicar migrations:
  ```bash
  poetry run python manage.py migrate
  ```
- [ ] Verificar schema no PostgreSQL:
  ```bash
  psql -h localhost -U talentbase -d talentbase_dev
  \dt  # Listar todas as tabelas
  \d users  # Descrever tabela users
  \d candidate_profiles  # Descrever tabela candidate_profiles
  ```

### Task 11: Criar testes de models (AC: 13)
- [ ] Criar `apps/api/candidates/tests/test_models.py`:
  ```python
  import pytest
  from django.contrib.auth import get_user_model
  from candidates.models import CandidateProfile, Experience
  from datetime import date

  User = get_user_model()

  @pytest.mark.django_db
  def test_candidate_profile_creation():
      user = User.objects.create_user(
          email='joao@example.com',
          password='test123',
          role='candidate'
      )
      candidate = CandidateProfile.objects.create(
          user=user,
          full_name='João Silva',
          phone='11999999999',
          cpf='12345678900',
          linkedin='https://linkedin.com/in/joaosilva',
          current_position='SDR/BDR',
          years_of_experience=3,
          top_skills=['Outbound', 'HubSpot']
      )

      assert candidate.id is not None
      assert candidate.public_token is not None
      assert candidate.status == 'available'
      assert candidate.is_public is False

  @pytest.mark.django_db
  def test_experience_ordering():
      user = User.objects.create_user(
          email='maria@example.com',
          password='test123',
          role='candidate'
      )
      candidate = CandidateProfile.objects.create(
          user=user,
          full_name='Maria Santos',
          phone='11988888888',
          cpf='98765432100',
          linkedin='https://linkedin.com/in/mariasantos',
          current_position='AE/Closer',
          years_of_experience=5
      )

      exp1 = Experience.objects.create(
          candidate=candidate,
          company_name='Company A',
          position='SDR',
          start_date=date(2020, 1, 1),
          end_date=date(2022, 1, 1)
      )
      exp2 = Experience.objects.create(
          candidate=candidate,
          company_name='Company B',
          position='AE',
          start_date=date(2022, 2, 1)
      )

      experiences = candidate.experiences.all()
      assert experiences[0] == exp2  # Mais recente primeiro
      assert experiences[1] == exp1

  @pytest.mark.django_db
  def test_youtube_url_validation():
      from django.core.exceptions import ValidationError
      from candidates.models import validate_youtube_url

      # URLs válidas
      validate_youtube_url('https://youtube.com/watch?v=abc123')
      validate_youtube_url('https://youtu.be/abc123')

      # URL inválida
      with pytest.raises(ValidationError):
          validate_youtube_url('https://vimeo.com/123456')
  ```
- [ ] Criar testes para outros models (companies, jobs, applications, etc.)
- [ ] Executar testes:
  ```bash
  poetry run pytest
  ```

### Task 12: Configurar Django Admin (AC: 14)
- [ ] Criar `apps/api/candidates/admin.py`:
  ```python
  from django.contrib import admin
  from .models import CandidateProfile, Experience

  @admin.register(CandidateProfile)
  class CandidateProfileAdmin(admin.ModelAdmin):
      list_display = ['full_name', 'current_position', 'status', 'is_public', 'created_at']
      list_filter = ['current_position', 'status', 'is_public']
      search_fields = ['full_name', 'user__email']
      readonly_fields = ['id', 'public_token', 'created_at', 'updated_at']

  @admin.register(Experience)
  class ExperienceAdmin(admin.ModelAdmin):
      list_display = ['candidate', 'company_name', 'position', 'start_date', 'end_date']
      list_filter = ['start_date']
      search_fields = ['candidate__full_name', 'company_name', 'position']
  ```
- [ ] Configurar admin para todos os outros models
- [ ] Criar superuser para testar admin:
  ```bash
  poetry run python manage.py createsuperuser
  ```
- [ ] Acessar Django Admin: http://localhost:8000/admin/

### Task 13: Code Quality e Validação (OBRIGATÓRIO)
- [ ] **Executar linting do código Python:**
  ```bash
  # Via Make (Docker)
  make lint-api

  # Ou via Poetry (local)
  cd apps/api
  poetry run ruff check .
  poetry run black --check .
  ```

- [ ] **Corrigir automaticamente problemas de formatação:**
  ```bash
  # Via Make (Docker)
  make format-api

  # Ou via Poetry (local)
  poetry run black .
  poetry run ruff check --fix .
  ```

- [ ] **Executar verificação de tipos com mypy:**
  ```bash
  cd apps/api
  poetry run mypy .
  ```

- [ ] **Validar complexidade ciclomática:**
  - Funções devem ter complexidade < 10
  - Ruff já valida com regra C901
  - Se houver warnings, refatorar funções complexas

- [ ] **Revisar imports:**
  - Nenhum import não utilizado
  - Imports organizados por: stdlib → third-party → local
  - Ruff organiza automaticamente com `--fix`

- [ ] **Executar todos os testes:**
  ```bash
  # Via Make (Docker)
  make test-api

  # Ou via Poetry (local)
  poetry run pytest -v
  ```

- [ ] **Verificar cobertura de testes (meta: >80%):**
  ```bash
  # Via Make (Docker)
  make coverage-api

  # Ou via Poetry (local)
  poetry run pytest --cov=. --cov-report=html
  # Abrir htmlcov/index.html no navegador
  ```

- [ ] **Checklist de Code Quality Backend:**
  - [ ] Todos os models herdam de BaseModel (exceto User)
  - [ ] Docstrings em todas as classes e métodos públicos
  - [ ] Type hints em todas as funções
  - [ ] Nenhuma função com mais de 50 linhas
  - [ ] Nenhuma função com complexidade ciclomática > 10
  - [ ] Validadores customizados documentados
  - [ ] Nenhum código comentado (remover ou explicar)
  - [ ] Nenhum TODO sem issue/ticket associado
  - [ ] Seguir Clean Architecture (models não devem ter lógica de negócio complexa)

- [ ] **Checklist de Segurança:**
  - [ ] CPF e CNPJ marcados para encriptação futura
  - [ ] Nenhuma senha ou chave em hardcode
  - [ ] Validação de URLs externas (YouTube validator)
  - [ ] Foreign keys com on_delete apropriado

## Dev Notes

### Architecture Context

**Domain-Driven Design:**
- 7 Django apps separados por domínio de negócio
- `core`: Utilitários compartilhados (BaseModel)
- `authentication`: Gerenciamento de usuários e autenticação
- `candidates`: Perfis de candidatos e experiências
- `companies`: Perfis de empresas
- `jobs`: Vagas de emprego
- `applications`: Candidaturas (ligação candidate-job)
- `matching`: Ranking e matching manual pelo admin

**Key Design Decisions:**
- **UUID Primary Keys:** Segurança (IDs não sequenciais)
- **Soft Deletes:** Campo `is_active` ao invés de DELETE
- **JSONB para dados flexíveis:** `top_skills`, `required_skills`
- **Timestamps automáticos:** `created_at`, `updated_at` via BaseModel
- **Abstract BaseModel:** DRY principle para campos comuns

### Database Schema Diagram

```
┌─────────────┐         ┌──────────────────┐
│    User     │◄────────┤ CandidateProfile │
│             │ 1:1     │                  │
│ - email     │         │ - full_name      │
│ - role      │         │ - position       │
│ - password  │         │ - top_skills     │
└─────────────┘         └──────────────────┘
       ▲                         │
       │                         │ 1:N
       │                         ▼
       │                ┌──────────────┐
       │                │ Experience   │
       │                │              │
       │                │ - company    │
       │                │ - position   │
       │                └──────────────┘
       │
       │ 1:1
       │
┌──────────────┐         ┌──────────────┐
│ CompanyProfile│◄───────┤ JobPosting   │
│              │ 1:N     │              │
│ - cnpj       │         │ - title      │
│ - industry   │         │ - position   │
└──────────────┘         │ - skills     │
                         └──────────────┘
                                │
                                │ 1:N
                                ▼
                         ┌──────────────┐
                         │ Application  │
                         │              │
                         │ - status     │
                         │ - notes      │
                         └──────────────┘
                                ▲
                                │ N:1
                                │
                         ┌──────────────┐
                         │ Ranking      │
                         │              │
                         │ - score      │
                         └──────────────┘
```

### PostgreSQL Specific Features

**JSONB Fields:**
- Usado em `top_skills`, `required_skills`, `tools_software`, etc.
- Permite queries eficientes: `WHERE top_skills @> '["Outbound"]'::jsonb`
- Indexação opcional: `CREATE INDEX idx_skills ON candidates USING GIN (top_skills);`

**UUID Extension:**
Django cria automaticamente, mas se necessário:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Encryption (TODO para futuro)

CPF e CNPJ devem ser encriptados. Adicionar no futuro:
```bash
poetry add django-encrypted-model-fields
```

```python
from encrypted_model_fields.fields import EncryptedCharField

class CandidateProfile(BaseModel):
    cpf = EncryptedCharField(max_length=255)
```

### MCP Context (Database Schema)

**Model Context Protocol - Story 1.2**
```xml
<context type="database-schema">
  <orm>Django ORM</orm>
  <database>PostgreSQL 15+</database>

  <apps>
    <app name="core">
      <models>
        <model name="BaseModel" type="abstract">
          <fields>
            <field name="id" type="UUIDField" primary_key="true"/>
            <field name="created_at" type="DateTimeField" auto_now_add="true"/>
            <field name="updated_at" type="DateTimeField" auto_now="true"/>
            <field name="is_active" type="BooleanField" default="true" indexed="true"/>
          </fields>
        </model>
      </models>
    </app>

    <app name="authentication">
      <models>
        <model name="User" extends="AbstractBaseUser, PermissionsMixin">
          <fields>
            <field name="email" type="EmailField" unique="true" indexed="true"/>
            <field name="role" type="CharField" choices="['admin', 'candidate', 'company']"/>
            <field name="is_active" type="BooleanField"/>
            <field name="is_staff" type="BooleanField"/>
          </fields>
          <auth>
            <username_field>email</username_field>
            <manager>UserManager</manager>
          </auth>
        </model>
      </models>
    </app>

    <app name="candidates">
      <models>
        <model name="CandidateProfile" extends="BaseModel">
          <relationships>
            <one_to_one target="User" on_delete="CASCADE"/>
            <one_to_many target="Experience" related_name="experiences"/>
            <one_to_one target="Ranking" related_name="ranking"/>
          </relationships>
          <indexes>
            <index fields="['current_position', 'status']"/>
            <index fields="['status', '-created_at']"/>
          </indexes>
        </model>

        <model name="Experience" extends="BaseModel">
          <relationships>
            <foreign_key target="CandidateProfile" on_delete="CASCADE"/>
          </relationships>
          <ordering>['-start_date']</ordering>
        </model>
      </models>
    </app>

    <app name="companies">
      <models>
        <model name="CompanyProfile" extends="BaseModel">
          <relationships>
            <one_to_one target="User" on_delete="CASCADE" nullable="true"/>
            <one_to_many target="JobPosting" related_name="jobs"/>
          </relationships>
        </model>
      </models>
    </app>

    <app name="jobs">
      <models>
        <model name="JobPosting" extends="BaseModel">
          <relationships>
            <foreign_key target="CompanyProfile" on_delete="CASCADE"/>
            <one_to_many target="Application" related_name="applications"/>
          </relationships>
          <indexes>
            <index fields="['position_type', 'is_active']"/>
            <index fields="['is_active', '-created_at']"/>
          </indexes>
        </model>
      </models>
    </app>

    <app name="applications">
      <models>
        <model name="Application" extends="BaseModel">
          <relationships>
            <foreign_key target="JobPosting" on_delete="CASCADE"/>
            <foreign_key target="CandidateProfile" on_delete="CASCADE"/>
            <foreign_key target="User" on_delete="SET_NULL" nullable="true" name="matched_by_admin"/>
          </relationships>
          <constraints>
            <unique_together>['job', 'candidate']</unique_together>
          </constraints>
        </model>
      </models>
    </app>

    <app name="matching">
      <models>
        <model name="Ranking" extends="BaseModel">
          <relationships>
            <one_to_one target="CandidateProfile" on_delete="CASCADE"/>
            <foreign_key target="User" on_delete="SET_NULL" nullable="true" name="ranked_by"/>
          </relationships>
          <ordering>['-score', 'rank_position']</ordering>
        </model>
      </models>
    </app>
  </apps>

  <migration-strategy>
    <approach>Django migrations with dependency resolution</approach>
    <execution-order>
      <step order="1">core (BaseModel abstract)</step>
      <step order="2">authentication (User model)</step>
      <step order="3">candidates, companies (depend on User)</step>
      <step order="4">jobs (depends on CompanyProfile)</step>
      <step order="5">applications, matching (depend on all above)</step>
    </execution-order>
  </migration-strategy>
</context>
```

### Testing Strategy

**Model Tests:**
- Testar criação de instâncias
- Testar relacionamentos (ForeignKey, OneToOne)
- Testar validadores customizados
- Testar ordenação (Meta.ordering)
- Testar unique constraints
- Testar soft deletes

**Database Tests:**
- Conexão com PostgreSQL
- Migrations aplicadas corretamente
- Índices criados
- Constraints funcionando

**Checklist de Validação:**
- [ ] Todas as migrations executam sem erros
- [ ] Django admin mostra todos os models
- [ ] UUIDs gerados automaticamente
- [ ] Foreign keys funcionando
- [ ] JSONB fields aceitam listas
- [ ] Soft delete (is_active) funciona
- [ ] Timestamps automáticos (created_at, updated_at)
- [ ] Testes de model executam com sucesso

### Gap Fixes from Review

Esta story corrige o **Gap Crítico 1** identificado no tech spec review:

**Problema:** App `matching` não era criado, mas model `Ranking` estava definido nele.
**Solução:** Task 1 agora inclui comando para criar app `matching`.

Outras melhorias incorporadas:
- Validação de YouTube URL (Gap Moderado 2 do review)
- Documentação completa de todos os models
- MCP context para database schema
- Testes abrangentes

### Troubleshooting

**Erro: "no such table: users"**
```bash
# Solução: Aplicar migrations
poetry run python manage.py migrate
```

**Erro: "auth.User has been swapped for authentication.User"**
```bash
# Solução: Verificar AUTH_USER_MODEL em settings/base.py
AUTH_USER_MODEL = 'authentication.User'

# Deletar database e recriar (CUIDADO: apenas em dev!)
docker-compose down -v
docker-compose up -d
poetry run python manage.py migrate
```

**Erro: Migration dependency conflict**
```bash
# Solução: Revisar ordem das migrations
# Garantir que apps dependentes vêm depois

# Resetar migrations (apenas em dev!)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
poetry run python manage.py makemigrations
poetry run python manage.py migrate
```

### References

- [Source: docs/epics/tech-spec-epic-1.md#Story-1.2]
- [Source: docs/epics/solution-architecture.md#Data-Architecture]
- [Source: docs/epics/tech-spec-epic-1-review.md#Gap-Crítico-1]
- [Source: docs/epics/tech-spec-epic-1-review.md#Gap-Moderado-2]

## Change Log

| Date       | Version | Description                                        | Author |
| ---------- | ------- | -------------------------------------------------- | ------ |
| 2025-10-02 | 0.1     | Initial draft - Complete database schema implementation | Debora |

## Dev Agent Record

### Context Reference

Story baseada no tech spec Epic 1 e incorporando TODAS as correções do review document (gap crítico do app matching + validação YouTube URL).

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes List

- Tempo estimado: 6-8 horas
- Complexidade: Alta (7 apps, múltiplos relacionamentos)
- **Gap Fix:** Comando para criar app `matching` adicionado (ausente no tech spec original)
- **Gap Fix:** Validação de YouTube URL implementada
- Bloqueia: Stories de API (Epic 2 e 3)

### Dependencies

**Depends On:**
- Story 1.1: Requires Django project configured and running

**Blocks:**
- Story 1.5: CI/CD needs migrations to run
- Epic 2: Authentication APIs require User model
- Epic 3: Candidate management requires CandidateProfile model
- Epic 4: Company/Job management requires respective models
- Epic 5: Matching requires Application and Ranking models

### File List

**To be created:**
- `apps/api/core/models.py` - BaseModel
- `apps/api/authentication/models.py` - User, UserManager
- `apps/api/candidates/models.py` - CandidateProfile, Experience + validate_youtube_url
- `apps/api/companies/models.py` - CompanyProfile
- `apps/api/jobs/models.py` - JobPosting
- `apps/api/applications/models.py` - Application
- `apps/api/matching/models.py` - Ranking
- `apps/api/*/admin.py` - Django admin config for all models
- `apps/api/*/tests/test_models.py` - Model tests
- `apps/api/*/migrations/0001_initial.py` - Initial migrations (auto-generated)

**To be modified:**
- `apps/api/talentbase/settings/base.py` - Add INSTALLED_APPS, AUTH_USER_MODEL
