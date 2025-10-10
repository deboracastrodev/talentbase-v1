# Story 3.5: Candidate Ranking System (Admin)

Status: Not Started

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)

## Story

Como um **admin**,
Eu quero **atribuir scores de ranking aos candidatos**,
Para que **eu possa identificar talentos top para matching**.

## Acceptance Criteria

1. Página admin em `/admin/rankings`
2. Lista de todos candidatos com score de ranking atual (padrão 0)
3. Admin pode atribuir score 0-100 para cada candidato
4. Categorias de score:
   - Overall Ranking
   - SDR/BDR Specialist Ranking
   - AE/Closer Ranking
   - CSM Ranking
5. Admin pode adicionar notas de ranking (por que esse score)
6. Top 10 candidatos destacados (score >= 80)
7. Endpoint API `POST /api/v1/admin/rankings` (criar/atualizar ranking)
8. Rankings exibidos na tabela admin de candidatos (coluna ordenável)
9. Score de ranking influencia sugestões de matching futuras (Epic 5)
10. Histórico de ranking rastreado (mudanças de score ao longo do tempo)

## Tasks / Subtasks

- [ ] Task 1: Criar modelo Ranking (AC: 3, 4, 5, 10)
  - [ ] Criar Ranking model
  - [ ] Campos: candidate, category, score, notes, created_by
  - [ ] Modelo RankingHistory para rastrear mudanças
  - [ ] Executar migrações

- [ ] Task 2: Criar página de rankings (AC: 1, 2, 6)
  - [ ] Criar route `/admin/rankings`
  - [ ] Listar candidatos com scores atuais
  - [ ] Destacar Top 10 (score >= 80)
  - [ ] Filtrar por categoria

- [ ] Task 3: Implementar interface de atribuição de score (AC: 3, 5)
  - [ ] Componente inline editing de score
  - [ ] Campo de notas (modal ou expandable)
  - [ ] Validação: score 0-100

- [ ] Task 4: Implementar API de rankings (AC: 7, 10)
  - [ ] Endpoint `POST /api/v1/admin/rankings`
  - [ ] Endpoint `GET /api/v1/admin/rankings?category=overall`
  - [ ] Salvar histórico de mudanças
  - [ ] Permissão admin-only

- [ ] Task 5: Integrar rankings na lista de candidatos (AC: 8)
  - [ ] Adicionar coluna "Ranking" na tabela de candidatos
  - [ ] Ordenação por ranking score
  - [ ] Exibir categoria de ranking

## Dev Notes

### Database Models

**Ranking Model:**
```python
class Ranking(models.Model):
    candidate = models.ForeignKey(CandidateProfile, related_name='rankings')
    category = models.CharField(
        max_length=50,
        choices=[
            ('overall', 'Overall Ranking'),
            ('sdr_bdr', 'SDR/BDR Specialist'),
            ('ae_closer', 'AE/Closer'),
            ('csm', 'CSM'),
        ]
    )
    score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='rankings_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('candidate', 'category')
        ordering = ['-score']
```

**RankingHistory Model:**
```python
class RankingHistory(models.Model):
    ranking = models.ForeignKey(Ranking, related_name='history')
    old_score = models.IntegerField()
    new_score = models.IntegerField()
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    reason = models.TextField(blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-changed_at']
```

### API Endpoints

```
POST /api/v1/admin/rankings
- Creates or updates ranking for candidate
- Auth: Required (admin role)
- Body: {
    candidate_id: 123,
    category: "overall",
    score: 85,
    notes: "Top performer, great communication"
  }
- Creates RankingHistory entry if score changed
- Response: Ranking object

GET /api/v1/admin/rankings
- Lists all rankings
- Auth: Required (admin role)
- Query params:
  - category: overall, sdr_bdr, ae_closer, csm
  - min_score: 80
  - candidate_id: 123
- Response: [{ candidate, category, score, notes, created_by }]

GET /api/v1/admin/rankings/:id/history
- Returns ranking change history
- Auth: Required (admin role)
- Response: [{ old_score, new_score, changed_by, changed_at, reason }]

GET /api/v1/admin/rankings/top10?category=overall
- Returns top 10 candidates by category
- Auth: Required (admin role)
- Response: [{ candidate, score, notes }] (ordered by score DESC, limit 10)
```

### Frontend Components

**Rankings Page:**
```
┌─────────────────────────────────────────────────────────────┐
│  Rankings                                                    │
├─────────────────────────────────────────────────────────────┤
│  Categoria: [Overall ▾]                                      │
│                                                              │
│  Top 10 (Score >= 80)                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🏆 João Silva - AE (Score: 95) [Ver] [Editar]         │ │
│  │ 🥈 Maria Santos - SDR (Score: 88) [Ver] [Editar]      │ │
│  │ 🥉 Pedro Costa - CSM (Score: 85) [Ver] [Editar]       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Todos os Candidatos                                         │
│  Nome           Posição  Overall  SDR  AE  CSM  [Ações]     │
│  João Silva     AE       95       70   95  60   [Editar]    │
│  Maria Santos   SDR      88       88   75  65   [Editar]    │
│  Pedro Costa    CSM      85       60   70  85   [Editar]    │
│  Ana Lima       AE       72       50   72  55   [Editar]    │
│  ...                                                         │
├─────────────────────────────────────────────────────────────┤
│  Mostrando 1-20 de 48                [◀] Página 1 [▶]       │
└─────────────────────────────────────────────────────────────┘
```

**Edit Ranking Modal:**
```
┌─────────────────────────────────────────────────────────┐
│  Editar Ranking - João Silva (AE)                  [×]  │
├─────────────────────────────────────────────────────────┤
│  Categoria: [Overall ▾]                                 │
│                                                         │
│  Score: [95____] (0-100)                                │
│  ────────────────────────────────────────────           │
│  0        25        50        75       100              │
│  Low                           █       High             │
│                                                         │
│  Notas:                                                 │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Top performer, excellent communication skills,   │ │
│  │ consistently closes high-value deals             │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Histórico de Mudanças:                                 │
│  • 2025-01-20 - Score: 90 → 95 (Admin User)            │
│  • 2025-01-15 - Score: 85 → 90 (Admin User)            │
│                                                         │
│  [Cancelar]  [Salvar]                                   │
└─────────────────────────────────────────────────────────┘
```

**Inline Editing (Alternative):**
```
┌─────────────────────────────────────────────────────────┐
│  Nome           Posição  Overall      [Ações]           │
│  João Silva     AE       [95▾] 📝     [Notas]           │
│  Maria Santos   SDR      [88▾] 📝     [Notas]           │
└─────────────────────────────────────────────────────────┘
```

### Ranking Score Guidelines

**Score Ranges:**
- **90-100:** Exceptional (top tier talent)
- **80-89:** Excellent (highly recommended)
- **70-79:** Good (solid candidate)
- **60-69:** Average (needs improvement)
- **0-59:** Below average (not recommended)

**Ranking Criteria (Admin Training):**
- **Overall:** Holistic assessment combining all factors
- **SDR/BDR:** Prospecting skills, email/phone outreach, pipeline generation
- **AE/Closer:** Deal closing ability, negotiation, quota attainment
- **CSM:** Customer retention, expansion, relationship management

### Service Layer

**Ranking Service:**
```python
class RankingService:
    @staticmethod
    def create_or_update_ranking(candidate_id, category, score, notes, admin_user):
        candidate = CandidateProfile.objects.get(id=candidate_id)

        # Get or create ranking
        ranking, created = Ranking.objects.get_or_create(
            candidate=candidate,
            category=category,
            defaults={
                'score': score,
                'notes': notes,
                'created_by': admin_user
            }
        )

        # If updating, track history
        if not created and ranking.score != score:
            RankingHistory.objects.create(
                ranking=ranking,
                old_score=ranking.score,
                new_score=score,
                changed_by=admin_user
            )
            ranking.score = score

        ranking.notes = notes
        ranking.save()

        return ranking

    @staticmethod
    def get_top_candidates(category='overall', limit=10):
        return Ranking.objects.filter(
            category=category
        ).select_related('candidate').order_by('-score')[:limit]

    @staticmethod
    def get_candidate_overall_score(candidate_id):
        """Get overall ranking score for candidate"""
        ranking = Ranking.objects.filter(
            candidate_id=candidate_id,
            category='overall'
        ).first()
        return ranking.score if ranking else 0
```

### Integration with Candidate List

**Update Candidate List View:**
- Add "Ranking" column showing overall score
- Sortable by ranking score
- Color-coded badges:
  - 90-100: Green (Exceptional)
  - 80-89: Blue (Excellent)
  - 70-79: Yellow (Good)
  - <70: Gray (Average)

**Query Optimization:**
```python
# In candidates list view
candidates = CandidateProfile.objects.annotate(
    overall_score=Subquery(
        Ranking.objects.filter(
            candidate_id=OuterRef('pk'),
            category='overall'
        ).values('score')[:1]
    )
).order_by('-overall_score')
```

### Future Integration (Epic 5)

**Matching Algorithm (Preview):**
```python
# Epic 5: Use ranking in matching suggestions
def get_match_suggestions(job_id):
    job = Job.objects.get(id=job_id)

    candidates = CandidateProfile.objects.filter(
        position=job.position,
        status='available'
    ).annotate(
        ranking_score=Subquery(
            Ranking.objects.filter(
                candidate_id=OuterRef('pk'),
                category='overall'
            ).values('score')[:1]
        )
    ).order_by('-ranking_score')

    # Higher ranked candidates appear first in suggestions
    return candidates[:10]
```

### Testing Considerations

**Unit Tests:**
- Ranking creation with valid score (0-100)
- Ranking update creates history entry
- Score validation (reject <0 or >100)
- Top 10 query returns correct order

**Integration Tests:**
- Admin creates ranking for candidate
- Admin updates ranking (history tracked)
- Ranking displayed in candidate list
- Top 10 page shows correct candidates

**Edge Cases:**
- Score outside 0-100 range (validation error)
- Multiple rankings for same candidate+category (unique constraint)
- Concurrent ranking updates by multiple admins
- Candidate deleted (cascade or protect?)

### Performance Considerations

- **Indexes:** Add index on (category, score) for fast Top 10 queries
- **Denormalization:** Consider caching overall_score on CandidateProfile for faster sorting
- **Pagination:** Rankings page should paginate (20 per page)

## Dependencies

- Story 3.4: Admin candidate curation (candidate list page)
- Story 3.1: CandidateProfile model

## Definition of Done

- [ ] All 10 acceptance criteria validated
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Ranking history tracked
- [ ] Top 10 page performant (<1s)
- [ ] Admin can rank all candidates
- [ ] Code reviewed and merged
- [ ] Deployed to staging
- [ ] QA sign-off
