# Backend Best Practices

**Projeto:** TalentBase
**Stack:** Python 3.11 + Django 5.0 + Django REST Framework + PostgreSQL
**Status:** Living Document
**Última Atualização:** 2025-10-02

## 📋 Índice

- [Arquitetura em Camadas](#arquitetura-em-camadas)
- [Models e Database](#models-e-database)
- [Services (Lógica de Negócio)](#services-lógica-de-negócio)
- [APIs e Serializers](#apis-e-serializers)
- [Queries e Performance](#queries-e-performance)
- [Validações](#validações)
- [Testes](#testes)
- [Segurança](#segurança)

## Arquitetura em Camadas

### Clean Architecture OBRIGATÓRIA

```
┌──────────────────────────────────────────┐
│  Presentation Layer                      │
│  - views.py (ViewSets, APIViews)        │
│  - serializers.py                        │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│  Application Layer                       │
│  - services/ (Business Logic)           │
│  - use_cases/ (Application Logic)       │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│  Domain Layer                            │
│  - models.py (Entities)                 │
│  - validators.py                        │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│  Infrastructure Layer                    │
│  - ORM (Django)                         │
│  - External APIs                        │
│  - Cache (Redis)                        │
└──────────────────────────────────────────┘
```

### Separação de Responsabilidades

**❌ NUNCA:**
- Lógica de negócio em models
- Queries complexas em views
- Validação de negócio em serializers
- Acesso direto ao ORM em views

**✅ SEMPRE:**
- Models = estrutura de dados
- Services = lógica de negócio
- Views = coordenação (thin controllers)
- Serializers = validação de dados de entrada/saída

## Models e Database

### BaseModel (Sempre Herdar)

```python
# core/models.py
import uuid
from django.db import models

class BaseModel(models.Model):
    """
    Abstract base model com campos comuns.
    TODOS os models devem herdar deste.
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

    def soft_delete(self) -> None:
        """Soft delete: marca como inativo ao invés de deletar."""
        self.is_active = False
        self.save(update_fields=['is_active', 'updated_at'])
```

### Models: Apenas Estrutura de Dados

**❌ Ruim:**
```python
class CandidateProfile(BaseModel):
    # ... campos ...

    def calculate_match_with_all_jobs(self):
        """ERRADO: Lógica de negócio no model."""
        jobs = JobPosting.objects.filter(is_active=True)
        scores = []
        for job in jobs:
            # Cálculo complexo...
            score = self._complex_calculation(job)
            scores.append(score)
        return scores

    def _complex_calculation(self, job):
        # Mais lógica...
        pass
```

**✅ Bom:**
```python
# candidates/models.py
class CandidateProfile(BaseModel):
    """
    Perfil de candidato. Apenas estrutura de dados.
    Lógica de negócio vai em services.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=200)
    current_position = models.CharField(max_length=50, choices=POSITION_CHOICES)
    years_of_experience = models.PositiveIntegerField()
    top_skills = models.JSONField(default=list)

    class Meta:
        db_table = 'candidate_profiles'
        verbose_name = 'Perfil de Candidato'
        verbose_name_plural = 'Perfis de Candidatos'
        indexes = [
            models.Index(fields=['current_position', 'is_active']),
        ]

    def __str__(self) -> str:
        return f"{self.full_name} ({self.current_position})"

# candidates/services/matching.py (Lógica aqui!)
class MatchingService:
    """Service para lógica de matching."""

    @staticmethod
    def calculate_candidate_matches(
        candidate: CandidateProfile
    ) -> list[JobMatch]:
        """
        Calcula compatibilidade do candidato com vagas ativas.

        Args:
            candidate: Perfil do candidato

        Returns:
            Lista de JobMatch ordenada por score
        """
        jobs = JobPosting.objects.filter(is_active=True).select_related('company')

        matches = [
            JobMatch(
                job=job,
                score=MatchingService._calculate_score(candidate, job)
            )
            for job in jobs
        ]

        return sorted(matches, key=lambda m: m.score, reverse=True)

    @staticmethod
    def _calculate_score(candidate: CandidateProfile, job: JobPosting) -> Decimal:
        """Calcula score de compatibilidade."""
        score = Decimal('0.00')

        # Skills match (40%)
        if candidate.top_skills and job.required_skills:
            skills_match = len(
                set(candidate.top_skills) & set(job.required_skills)
            )
            score += Decimal(skills_match * 10)

        # Position match (30%)
        if candidate.current_position == job.position_type:
            score += Decimal('30.00')

        # Experience match (30%)
        if candidate.years_of_experience >= job.min_years_experience:
            score += Decimal('30.00')

        return min(score, Decimal('100.00'))
```

### Relacionamentos e Índices

```python
class Application(BaseModel):
    """Candidatura para vaga."""

    job = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name='applications',
        help_text="Vaga"
    )
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='applications',
        help_text="Candidato"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True  # Frequentemente filtrado
    )

    class Meta:
        db_table = 'applications'
        # Evita candidaturas duplicadas
        unique_together = [['job', 'candidate']]
        # Índices compostos para queries comuns
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['job', 'status']),
            models.Index(fields=['candidate', '-created_at']),
        ]
```

### Validadores Customizados

```python
# candidates/validators.py
from django.core.exceptions import ValidationError

def validate_youtube_url(value: str) -> None:
    """
    Valida que URL é do YouTube.

    Args:
        value: URL a validar

    Raises:
        ValidationError: Se não for URL do YouTube
    """
    if value and 'youtube.com' not in value and 'youtu.be' not in value:
        raise ValidationError(
            'URL deve ser do YouTube (youtube.com ou youtu.be)',
            code='invalid_youtube_url'
        )

def validate_cpf(value: str) -> None:
    """
    Valida formato e dígitos verificadores do CPF.

    Args:
        value: CPF a validar (apenas números)

    Raises:
        ValidationError: Se CPF inválido
    """
    # Remover formatação
    cpf = ''.join(filter(str.isdigit, value))

    if len(cpf) != 11:
        raise ValidationError('CPF deve ter 11 dígitos')

    # Validar dígitos verificadores
    if not _validate_cpf_digits(cpf):
        raise ValidationError('CPF inválido')

def _validate_cpf_digits(cpf: str) -> bool:
    """Valida dígitos verificadores do CPF."""
    # Implementação dos cálculos dos dígitos
    pass
```

## Services (Lógica de Negócio)

### Estrutura de Services

```
candidates/
├── models.py
├── services/
│   ├── __init__.py
│   ├── matching.py          # Lógica de matching
│   ├── profile.py           # Lógica de perfil
│   └── validation.py        # Validações de negócio
├── serializers.py
└── views.py
```

### Service Pattern

```python
# candidates/services/profile.py
from typing import Optional
from decimal import Decimal
from django.db import transaction
from candidates.models import CandidateProfile, Experience
from authentication.models import User

class CandidateProfileService:
    """Service para operações de perfil de candidato."""

    @staticmethod
    @transaction.atomic
    def create_candidate_profile(
        user: User,
        profile_data: dict,
        experiences_data: list[dict]
    ) -> CandidateProfile:
        """
        Cria perfil de candidato com experiências.

        Args:
            user: Usuário associado
            profile_data: Dados do perfil
            experiences_data: Lista de experiências

        Returns:
            CandidateProfile criado

        Raises:
            ValidationError: Se dados inválidos
        """
        # Validações de negócio
        if user.role != 'candidate':
            raise ValidationError('Usuário deve ter role candidate')

        # Criar perfil
        profile = CandidateProfile.objects.create(
            user=user,
            **profile_data
        )

        # Criar experiências
        for exp_data in experiences_data:
            Experience.objects.create(
                candidate=profile,
                **exp_data
            )

        return profile

    @staticmethod
    def get_active_candidates_by_position(
        position: str,
        min_experience: int = 0
    ) -> list[CandidateProfile]:
        """
        Retorna candidatos ativos filtrados por posição.

        Args:
            position: Posição desejada (SDR/BDR, AE/Closer, CSM)
            min_experience: Mínimo de anos de experiência

        Returns:
            Lista de candidatos que atendem critérios
        """
        return CandidateProfile.objects.filter(
            is_active=True,
            status='available',
            current_position=position,
            years_of_experience__gte=min_experience
        ).select_related('user').prefetch_related('experiences')

    @staticmethod
    def calculate_profile_completeness(profile: CandidateProfile) -> Decimal:
        """
        Calcula percentual de completude do perfil.

        Args:
            profile: Perfil do candidato

        Returns:
            Percentual de 0.00 a 100.00
        """
        total_fields = 10
        filled_fields = 0

        # Campos obrigatórios
        if profile.full_name:
            filled_fields += 1
        if profile.phone:
            filled_fields += 1
        if profile.linkedin:
            filled_fields += 1

        # Campos opcionais
        if profile.video_url:
            filled_fields += 1
        if profile.bio:
            filled_fields += 1
        if profile.top_skills:
            filled_fields += 1
        if profile.tools_software:
            filled_fields += 1
        if profile.solutions_sold:
            filled_fields += 1

        # Experiências
        if profile.experiences.exists():
            filled_fields += 2

        return Decimal((filled_fields / total_fields) * 100).quantize(
            Decimal('0.01')
        )
```

### Transações

**SEMPRE use @transaction.atomic para operações que modificam múltiplos objetos:**

```python
from django.db import transaction

class ApplicationService:
    @staticmethod
    @transaction.atomic
    def apply_to_job(candidate_id: str, job_id: str) -> Application:
        """
        Candidata-se a uma vaga.
        Usa transação para garantir consistência.
        """
        candidate = CandidateProfile.objects.select_for_update().get(id=candidate_id)
        job = JobPosting.objects.select_for_update().get(id=job_id)

        # Validações
        if not candidate.is_active or candidate.status != 'available':
            raise ValidationError('Candidato não disponível')

        if not job.is_active:
            raise ValidationError('Vaga não disponível')

        # Criar application
        application = Application.objects.create(
            candidate=candidate,
            job=job,
            status='pending'
        )

        # Atualizar contadores (exemplo)
        job.applications_count = job.applications.count()
        job.save(update_fields=['applications_count'])

        return application
```

## APIs e Serializers

### ViewSets (Coordenação Apenas)

```python
# candidates/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from candidates.models import CandidateProfile
from candidates.serializers import (
    CandidateProfileSerializer,
    CandidateMatchSerializer
)
from candidates.services.profile import CandidateProfileService
from candidates.services.matching import MatchingService

class CandidateProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet para perfis de candidatos.
    THIN CONTROLLER: apenas coordena serializers e services.
    """
    queryset = CandidateProfile.objects.filter(is_active=True)
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Otimiza queryset com select/prefetch.
        Views não fazem lógica de negócio.
        """
        return (
            super()
            .get_queryset()
            .select_related('user')
            .prefetch_related('experiences')
        )

    def create(self, request):
        """
        Cria perfil de candidato.
        Delega para service.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Service faz toda a lógica
        profile = CandidateProfileService.create_candidate_profile(
            user=request.user,
            profile_data=serializer.validated_data['profile'],
            experiences_data=serializer.validated_data.get('experiences', [])
        )

        # Retorna resposta
        output_serializer = CandidateProfileSerializer(profile)
        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def matches(self, request, pk=None):
        """
        Custom action: retorna vagas compatíveis.
        Delega para MatchingService.
        """
        candidate = self.get_object()

        # Service faz o cálculo
        matches = MatchingService.calculate_candidate_matches(candidate)

        # Serializa e retorna
        serializer = CandidateMatchSerializer(matches, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def completeness(self, request, pk=None):
        """
        Retorna percentual de completude do perfil.
        """
        candidate = self.get_object()

        # Service calcula
        completeness = CandidateProfileService.calculate_profile_completeness(
            candidate
        )

        return Response({
            'completeness': float(completeness),
            'is_complete': completeness >= 80
        })
```

### Serializers (Validação de Entrada/Saída)

```python
# candidates/serializers.py
from rest_framework import serializers
from candidates.models import CandidateProfile, Experience

class ExperienceSerializer(serializers.ModelSerializer):
    """Serializer para experiências profissionais."""

    class Meta:
        model = Experience
        fields = [
            'id', 'company_name', 'position',
            'start_date', 'end_date', 'responsibilities'
        ]

    def validate(self, data):
        """Validação de negócio."""
        if data.get('end_date') and data['end_date'] < data['start_date']:
            raise serializers.ValidationError(
                'Data de término deve ser posterior à data de início'
            )
        return data

class CandidateProfileSerializer(serializers.ModelSerializer):
    """Serializer para perfil de candidato."""

    experiences = ExperienceSerializer(many=True, read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'full_name', 'email', 'phone', 'linkedin',
            'current_position', 'years_of_experience', 'top_skills',
            'tools_software', 'bio', 'status', 'experiences',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_years_of_experience(self, value):
        """Validação de campo."""
        if value < 0:
            raise serializers.ValidationError(
                'Anos de experiência não pode ser negativo'
            )
        if value > 50:
            raise serializers.ValidationError(
                'Anos de experiência inválido'
            )
        return value

class CandidateMatchSerializer(serializers.Serializer):
    """Serializer para resultado de matching."""

    job_id = serializers.UUIDField()
    job_title = serializers.CharField()
    company_name = serializers.CharField()
    match_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    matched_skills = serializers.ListField(child=serializers.CharField())
```

## Queries e Performance

### N+1 Queries (EVITAR)

**❌ Ruim:**
```python
# Gera N+1 queries
def get_candidates_with_companies():
    candidates = CandidateProfile.objects.filter(is_active=True)

    # Para cada candidato, faz query adicional
    for candidate in candidates:
        print(candidate.user.email)  # Query!

        for exp in candidate.experiences.all():  # Query!
            print(exp.company_name)
```

**✅ Bom:**
```python
# 1 query (ou 2-3 com prefetch)
def get_candidates_with_companies():
    candidates = (
        CandidateProfile.objects
        .filter(is_active=True)
        .select_related('user')  # JOIN
        .prefetch_related('experiences')  # Separate query, cached
    )

    for candidate in candidates:
        print(candidate.user.email)  # Sem query adicional

        for exp in candidate.experiences.all():  # Sem query adicional
            print(exp.company_name)
```

### select_related vs prefetch_related

```python
# select_related: ForeignKey, OneToOne (JOIN)
candidates = CandidateProfile.objects.select_related(
    'user',  # OneToOne
)

# prefetch_related: ManyToMany, Reverse ForeignKey (separate query)
candidates = CandidateProfile.objects.prefetch_related(
    'experiences',  # Reverse ForeignKey
    'applications',  # Reverse ForeignKey
)

# Combinar ambos
candidates = (
    CandidateProfile.objects
    .select_related('user')
    .prefetch_related('experiences', 'applications__job')
)
```

### Aggregations

```python
from django.db.models import Count, Avg, Q

# Contar applications por status
stats = Application.objects.aggregate(
    total=Count('id'),
    pending=Count('id', filter=Q(status='pending')),
    matched=Count('id', filter=Q(status='matched')),
    avg_per_candidate=Avg('candidate__applications_count')
)

# Annotate: adicionar campo calculado
candidates_with_stats = (
    CandidateProfile.objects
    .annotate(
        applications_count=Count('applications'),
        matched_count=Count('applications', filter=Q(applications__status='matched'))
    )
    .filter(applications_count__gt=0)
)
```

### Bulk Operations

```python
# Bulk create (mais rápido)
experiences = [
    Experience(candidate=candidate, company_name='Company A', ...),
    Experience(candidate=candidate, company_name='Company B', ...),
]
Experience.objects.bulk_create(experiences)

# Bulk update
candidates = CandidateProfile.objects.filter(status='inactive')
candidates.update(is_public=False)
```

## Validações

### Camadas de Validação

1. **Serializer** - Validação de formato e tipos
2. **Service** - Validação de regras de negócio
3. **Model validators** - Validação de restrições de dados

```python
# 1. Serializer (formato)
class CandidateSerializer(serializers.ModelSerializer):
    def validate_phone(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('Telefone deve conter apenas números')
        return value

# 2. Service (negócio)
class CandidateProfileService:
    @staticmethod
    def create_profile(user, data):
        # Regra de negócio
        if CandidateProfile.objects.filter(user=user).exists():
            raise ValidationError('Usuário já possui perfil')

        return CandidateProfile.objects.create(user=user, **data)

# 3. Model validator (dados)
class CandidateProfile(BaseModel):
    video_url = models.URLField(
        validators=[validate_youtube_url]  # Valida formato YouTube
    )
```

## Testes

### Estrutura de Testes

```
candidates/
├── tests/
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_serializers.py
│   ├── test_views.py
│   └── test_services.py
```

### Testes de Models

```python
# candidates/tests/test_models.py
import pytest
from django.core.exceptions import ValidationError
from candidates.models import CandidateProfile, validate_youtube_url
from authentication.models import User

@pytest.mark.django_db
class TestCandidateProfile:
    def test_create_candidate_profile(self):
        """Testa criação de perfil de candidato."""
        user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            role='candidate'
        )

        candidate = CandidateProfile.objects.create(
            user=user,
            full_name='João Silva',
            phone='11999999999',
            cpf='12345678900',
            linkedin='https://linkedin.com/in/joao',
            current_position='SDR/BDR',
            years_of_experience=3
        )

        assert candidate.id is not None
        assert candidate.public_token is not None
        assert candidate.status == 'available'

    def test_soft_delete(self):
        """Testa soft delete."""
        candidate = self._create_candidate()

        candidate.soft_delete()

        assert candidate.is_active is False
        # Ainda existe no banco
        assert CandidateProfile.objects.filter(id=candidate.id).exists()

    def test_youtube_url_validation(self):
        """Testa validador de URL do YouTube."""
        # URLs válidas
        validate_youtube_url('https://youtube.com/watch?v=abc123')
        validate_youtube_url('https://youtu.be/abc123')

        # URL inválida
        with pytest.raises(ValidationError):
            validate_youtube_url('https://vimeo.com/123456')
```

### Testes de Services

```python
# candidates/tests/test_services.py
import pytest
from decimal import Decimal
from candidates.services.profile import CandidateProfileService
from candidates.models import CandidateProfile

@pytest.mark.django_db
class TestCandidateProfileService:
    def test_create_candidate_profile_with_experiences(self):
        """Testa criação de perfil com experiências."""
        user = self._create_user()
        profile_data = {
            'full_name': 'Maria Santos',
            'phone': '11988888888',
            # ...
        }
        experiences_data = [
            {
                'company_name': 'Company A',
                'position': 'SDR',
                'start_date': '2020-01-01',
                'end_date': '2022-01-01'
            }
        ]

        profile = CandidateProfileService.create_candidate_profile(
            user=user,
            profile_data=profile_data,
            experiences_data=experiences_data
        )

        assert profile.id is not None
        assert profile.experiences.count() == 1

    def test_calculate_profile_completeness(self):
        """Testa cálculo de completude do perfil."""
        candidate = self._create_candidate_with_all_fields()

        completeness = CandidateProfileService.calculate_profile_completeness(
            candidate
        )

        assert completeness == Decimal('100.00')
```

### Testes de APIs

```python
# candidates/tests/test_views.py
import pytest
from rest_framework.test import APIClient
from rest_framework import status

@pytest.mark.django_db
class TestCandidateProfileViewSet:
    def setup_method(self):
        self.client = APIClient()
        self.user = self._create_user()
        self.client.force_authenticate(user=self.user)

    def test_list_candidates(self):
        """Testa listagem de candidatos."""
        self._create_candidate()

        response = self.client.get('/api/candidates/')

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_create_candidate_profile(self):
        """Testa criação de perfil."""
        data = {
            'profile': {
                'full_name': 'Test User',
                'phone': '11999999999',
                # ...
            },
            'experiences': []
        }

        response = self.client.post('/api/candidates/', data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['full_name'] == 'Test User'
```

## Segurança

### Nunca Expor Dados Sensíveis

```python
class CandidateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'full_name', 'phone', 'linkedin',
            # NÃO incluir: cpf, dados bancários, etc.
        ]
        # Ou usar exclude
        exclude = ['cpf', 'bank_account']
```

### Validar Permissões

```python
from rest_framework.permissions import BasePermission

class IsCandidateOwner(BasePermission):
    """Apenas o dono do perfil pode editar."""

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class CandidateProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsCandidateOwner]
```

### SQL Injection (Django ORM previne)

```python
# ✅ Seguro (ORM faz escape automático)
candidates = CandidateProfile.objects.filter(full_name=user_input)

# ❌ NUNCA usar raw SQL sem escape
# cursor.execute(f"SELECT * FROM candidates WHERE name = '{user_input}'")
```

## Checklist Pré-Commit

- [ ] Models herdam de BaseModel
- [ ] Lógica de negócio em Services
- [ ] Views são thin controllers
- [ ] Queries otimizadas (select_related/prefetch_related)
- [ ] Validações em todas as camadas
- [ ] Testes cobrindo >= 50%
- [ ] Type hints em todas as funções
- [ ] Docstrings em classes e métodos públicos
- [ ] Black + Ruff aplicados
- [ ] Nenhum print/logging de dados sensíveis

## Recursos

- [Django Best Practices](https://django-best-practices.readthedocs.io/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Two Scoops of Django](https://www.feldroy.com/books/two-scoops-of-django-3-x)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
