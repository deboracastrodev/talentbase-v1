# Sprint Change Proposal
## Expansão do Modelo CandidateProfile - Campos Notion CSV

**Project**: TalentBase v1
**Epic**: Epic 3 - Candidate Management System
**Change Type**: Data Model Enhancement
**Scope Classification**: **MINOR** (Direct Implementation)
**Date**: 2025-10-09
**Author**: John (Product Manager Agent)
**Approved By**: Debora (Product Owner)

---

## 1. ISSUE SUMMARY

### Problem Statement
O CSV exportado do Notion contém **36 campos** de dados de candidatos, mas o modelo atual `CandidateProfile` possui apenas **~20 campos**. Há **25 campos ausentes** críticos para:

1. **Admin realizar matching preciso** com vagas (remuneração, disponibilidade, mobilidade, PCD, CNH)
2. **Dados de experiência detalhados** para qualificação (carteira, prospecção ativa, inbound/outbound)
3. **Informações contratuais e legais** (aceita PJ, contrato assinado, data entrevista)

### Context
- **Discovery**: Durante preparação da Story 3.3 (CSV Import Tool) - novos campos adicionados no Notion
- **Impact**: Impossível importar dados completos do Notion sem perda de informação
- **Business Value**: Dados completos são essenciais para matching candidato-vaga (core value proposition do Epic 4)

### Evidence
- CSV com 36 colunas vs Modelo Django com ~20 campos
- 25 campos identificados como ausentes (ver Gap Analysis)
- Dados ausentes impedem funcionalidade de matching do Epic 4

---

## 2. IMPACT ANALYSIS

### Epic Impact

**Epic 3 - Candidate Management System**: ✅ **Modificação Necessária**
- ✅ **Story 3.1** (Profile Creation): Campos opcionais adicionados ao form (não obrigatórios para candidato)
- ✅ **Story 3.3** (CSV Import): Expandir mapeamento de colunas para 36 campos + parsers
- ✅ **Story 3.4** (Admin Curation): Adicionar filtros/colunas para novos campos

**Other Epics**: ✅ **Sem Impacto Negativo**
- Epic 4 (Job Matching): **Beneficiado** - mais dados para matching
- Epic 5 (Admin Dashboard): **Beneficiado** - métricas mais ricas

### Artifact Conflicts

| Artifact | Impact | Action Required |
|----------|--------|-----------------|
| **PRD** | ✅ No conflict | Nenhuma - MVP alcançável |
| **Architecture** | ⚠️ Minor | Atualizar Data Model schema |
| **Tech Spec Epic 3** | ⚠️ Update | ✅ DONE - Campos adicionados (Stories 3.1, 3.3, 3.4) |
| **UI/UX** | ⚠️ Minor | Admin table: adicionar colunas/filtros |
| **API** | ✅ No breaking | Campos opcionais - compatível com clients existentes |

### Technical Impact

**Database**:
- ✅ Migration segura (apenas `ADD COLUMN`)
- ✅ Todos campos `blank=True` ou `default` - sem quebra de dados existentes
- ✅ Sem downtime necessário

**Backend**:
- ✅ Modelo Django: adicionar 25 campos
- ✅ Serializers: expandir fields list
- ✅ CSV Import: adicionar parsers (boolean, currency, list)

**Frontend**:
- ⚠️ Admin table: adicionar colunas e filtros
- ✅ Candidate form: campos opcionais (não obrigatórios)
- ✅ Public profile: **NÃO exibir** campos sensíveis (salário, PCD, contrato)

---

## 3. RECOMMENDED APPROACH

### Selected Path: **Direct Adjustment** ✅

**Justification**:
1. ✅ **Low Risk**: Campos opcionais não quebram código existente
2. ✅ **Low Effort**: 1-2 dias de desenvolvimento
3. ✅ **No Timeline Impact**: Epic 3 continua no prazo
4. ✅ **High Value**: Dados completos habilitam matching (core feature)
5. ✅ **No Rollback Needed**: Mudança aditiva, não destrutiva

**Alternatives Considered**:
- ❌ **Option 2 (Rollback)**: Não aplicável - nada a reverter
- ❌ **Option 3 (MVP Review)**: Desnecessário - MVP não afetado

### Effort Estimate
- **Backend (Model + Migration + Import)**: 4-6 horas
- **Frontend (Admin Table/Filters)**: 4-6 horas
- **Tests**: 2-3 horas
- **Total**: **10-15 horas** (~1.5 dias)

### Risk Assessment
- **Technical Risk**: 🟢 **LOW** (campos opcionais, migration segura)
- **Business Risk**: 🟢 **LOW** (não altera funcionalidade existente)
- **Timeline Risk**: 🟢 **NONE** (dentro do Epic 3)

---

## 4. GAP ANALYSIS: CSV vs Current Model

### Summary
- ✅ **Existing**: 10 campos
- 🆕 **New**: 25 campos
- ⚠️ **Ignored**: 1 campo (ID - usar Django PK)

### Complete Field Mapping (36 campos)

| # | CSV Column | Django Field | Type | Category |
|---|------------|--------------|------|----------|
| 1 | Nome | `full_name` | CharField | ✅ Existing |
| 2 | Aceita ser PJ? | `accepts_pj` | BooleanField | 🆕 Legal |
| 3 | CEP | `zip_code` | CharField | 🆕 Personal |
| 4 | CPF | `cpf` | CharField | ✅ Existing |
| 5 | Cidade | `city` | CharField | 🆕 Personal |
| 6 | Contrato Assinado? | `contract_signed` | BooleanField | 🆕 Contract |
| 7 | Data da Entrevista | `interview_date` | DateField | 🆕 Contract |
| 8 | Departamentos vendeu | `departments_sold_to` | JSONField | ✅ Existing |
| 9 | Disp. Mudança? | `relocation_availability` | CharField | 🆕 Mobility |
| 10 | Disp. Viagem? | `travel_availability` | CharField | 🆕 Mobility |
| 11 | Expansão Carteira | `portfolio_expansion_experience` | CharField | 🆕 Experience |
| 12 | Formação Acadêmica | `academic_degree` | CharField | 🆕 Education |
| 13 | Idiomas | `languages` | JSONField | 🆕 Education |
| 14 | LinkedIn | `linkedin` | URLField | ✅ Existing |
| 15 | Modelo de Trabalho | `work_model` | CharField | 🆕 Preferences |
| 16 | Mín Remuneração | `minimum_salary` | DecimalField | 🆕 Compensation |
| 17 | Obs. Remuneração | `salary_notes` | TextField | 🆕 Compensation |
| 18 | PCD? | `is_pcd` | BooleanField | 🆕 Legal |
| 19 | Posições Interesse | `positions_of_interest` | JSONField | 🆕 Preferences |
| 20 | Possui CNH? | `has_drivers_license` | BooleanField | 🆕 Mobility |
| 21 | Possui veículo? | `has_vehicle` | BooleanField | 🆕 Mobility |
| 22 | Prospecção Ativa | `active_prospecting_experience` | CharField | 🆕 Experience |
| 23 | Qualif. Inbound | `inbound_qualification_experience` | CharField | 🆕 Experience |
| 24 | Retenção Carteira | `portfolio_retention_experience` | CharField | 🆕 Experience |
| 25 | Softwares Vendas | `tools_software` | JSONField | ✅ Existing |
| 26 | Soluções vendeu | `solutions_sold` | JSONField | ✅ Existing |
| 27 | Status/Contrato | `status` | CharField | ✅ Existing |
| 28 | Tamanho carteira | `portfolio_size` | CharField | 🆕 Experience |
| 29 | Venda Inbound | `inbound_sales_experience` | CharField | 🆕 Experience |
| 30 | Venda Outbound | `outbound_sales_experience` | CharField | 🆕 Experience |
| 31 | Field Sales | `field_sales_experience` | CharField | 🆕 Experience |
| 32 | Inside Sales | `inside_sales_experience` | CharField | 🆕 Experience |
| 33 | Ciclo vendas | `sales_cycle` | CharField | ✅ Existing |
| 34 | Ticket Médio | `avg_ticket` | CharField | ✅ Existing |

---

## 5. IMPLEMENTATION PLAN

### Phase 1: Backend (4-6h)
1. ✅ Atualizar modelo `CandidateProfile` com 25 campos (`apps/api/candidates/models.py`)
2. ✅ Gerar migration Django (`makemigrations candidates --name add_notion_csv_fields`)
3. ✅ Atualizar CSV import task com parsers (`apps/api/candidates/tasks.py`)
4. ✅ Atualizar serializers (admin + public) (`apps/api/candidates/serializers.py`)
5. ✅ Run migration em dev environment

### Phase 2: Frontend (4-6h)
6. ⏳ Atualizar admin table (filtros + colunas) (`packages/web/app/routes/admin.candidates.tsx`)
7. ⏳ Atualizar admin detail view (tabs para novos campos)
8. ⏳ (Opcional) Adicionar step 6 ao candidate onboarding (preferências)
9. ⏳ Testar admin UI com novos campos

### Phase 3: Testing (2-3h)
10. ⏳ Testes unitários (model fields) (`apps/api/candidates/tests/test_models.py`)
11. ⏳ Testes de integração (CSV import) (`apps/api/candidates/tests/test_csv_import.py`)
12. ⏳ Testes E2E (admin table filters)

### Phase 4: Data Migration (1h)
13. ⏳ Re-importar CSV do Notion com todos campos
14. ⏳ Verificar dados importados no admin

---

## 6. SUCCESS CRITERIA

- [ ] Todos os 36 campos do CSV Notion importados sem erros
- [ ] Admin consegue filtrar candidatos por cidade, salário, modelo trabalho
- [ ] Perfil público **NÃO exibe** dados sensíveis (salário, PCD, contrato)
- [ ] Testes passando (unit + integration + E2E)
- [ ] Migration aplicada em dev/staging sem issues

---

## 7. TIMELINE & HANDOFF

**Estimated Duration**: 1.5 dias
**Timeline Impact**: ✅ Nenhum - Epic 3 continua no prazo (Weeks 4-7)

**Handoff Recipients**:
1. **Backend Developer**: Fases 1, 3 (backend tests), 4
2. **Frontend Developer**: Fases 2, 3 (E2E tests)

**Change Scope**: **MINOR** - Direct implementation by dev team

---

## 8. DOCUMENTATION UPDATES

### Completed ✅
- [x] Tech Spec Epic 3 atualizado (`docs/epics/tech-spec-epic-3.md`)
  - Story 3.1: Modelo expandido com 25 campos
  - Story 3.3: CSV import com parsers e mapeamento completo
  - Story 3.4: Admin filters e columns documentados

### Pending ⏳
- [ ] Gerar Sprint Change Proposal document
- [ ] Atualizar individual story docs (3.1, 3.3, 3.4) se existirem

---

## 9. REFERENCES

**Documents**:
- Tech Spec Epic 3: `docs/epics/tech-spec-epic-3.md`
- CSV Notion: `docs/basedados/Cadastro de Candidatos 272f2bf1c86e8034b195d8945de62ea8_all.csv`

**Code**:
- Current Model: `apps/api/candidates/models.py`
- CSV Import Task: `apps/api/candidates/tasks.py`

---

**Workflow**: `bmad/bmm/workflows/4-implementation/correct-course`
**Status**: ✅ **APPROVED** - Ready for Implementation
**Next Steps**: Dev team to execute implementation phases 1-4
