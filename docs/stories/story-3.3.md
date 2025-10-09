# Story 3.3: CSV Import Tool (Admin - Notion Migration)

Status: Not Started

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)

## Story

Como um **admin**,
Eu quero **importar candidatos em massa via CSV**,
Para que **eu possa migrar dados existentes do Notion rapidamente**.

## Acceptance Criteria

1. Página admin em `/admin/import/candidates`
2. Upload de arquivo aceita .csv files (max 10MB)
3. Após upload, mostra interface de mapeamento de colunas:
   - Colunas do CSV listadas
   - Dropdown para mapear para campos do modelo Candidate
   - Auto-detecta nomes comuns de campos (ex: "Name" → name)
4. Tabela de preview mostra primeiras 5 linhas com mapeamentos
5. Admin clica "Importar" → API `POST /api/v1/admin/candidates/import`
6. Backend processa CSV:
   - Cria registros Candidate
   - Vincula a User (cria usuário básico se email fornecido)
   - Trata duplicatas (pula ou atualiza baseado em email)
7. Indicador de progresso da importação (X de Y candidatos processados)
8. Importação completa: mostra resumo
   - Sucessos: 48 candidatos importados
   - Erros: 2 duplicatas puladas
9. Download de log de erros CSV (linhas que falharam com motivo)
10. Candidatos importados visíveis na lista admin de candidatos

## Tasks / Subtasks

- [ ] Task 1: Criar página de upload (AC: 1, 2)
  - [ ] Criar route `/admin/import/candidates`
  - [ ] Implementar componente de upload de arquivo
  - [ ] Validar formato CSV e tamanho max 10MB

- [ ] Task 2: Implementar parser e mapeamento de colunas (AC: 3, 4)
  - [ ] Endpoint `POST /api/v1/admin/candidates/parse-csv` (upload temporário)
  - [ ] Parser CSV com pandas
  - [ ] Auto-detecção de colunas (fuzzy matching)
  - [ ] Componente frontend de mapeamento

- [ ] Task 3: Implementar importação em batch (AC: 5, 6, 7)
  - [ ] Endpoint `POST /api/v1/admin/candidates/import`
  - [ ] Celery task assíncrona para processamento
  - [ ] Criar User + CandidateProfile para cada linha
  - [ ] Validação de dados (email, required fields)
  - [ ] Tratamento de duplicatas

- [ ] Task 4: Implementar feedback de progresso (AC: 7, 8, 9)
  - [ ] WebSocket ou polling para progresso
  - [ ] Resumo de importação (sucessos, erros)
  - [ ] Geração de log de erros CSV
  - [ ] Download de arquivo de erros

- [ ] Task 5: Integração com lista de candidatos (AC: 10)
  - [ ] Candidatos importados aparecem em `/admin/candidates`
  - [ ] Filtrar por "importados" (flag ou source)

## Dev Notes

### CSV Format

**Expected CSV Columns:**
```csv
name,email,phone,position,years_experience,location,sales_type,tools,solutions,bio
João Silva,joao@email.com,11999999999,AE,5,São Paulo,Outbound,"Salesforce,Hubspot","SaaS,Fintech",Bio text...
```

**Field Mapping:**
- **Required Fields:** name, email, position
- **Optional Fields:** phone, location, years_experience, sales_type, tools, solutions, departments, bio
- **Auto-detection Logic:**
  - "Name" / "Nome" → name
  - "Email" / "E-mail" → email
  - "Phone" / "Telefone" / "Tel" → phone
  - "Position" / "Posição" / "Cargo" → position
  - "Experience" / "Experiência" / "Anos" → years_experience
  - etc.

### Backend Implementation

**CSV Parsing with Pandas:**
```python
import pandas as pd
from celery import shared_task

@shared_task
def process_csv_import(file_path, column_mapping, admin_user_id):
    df = pd.read_csv(file_path)
    results = {
        'total': len(df),
        'success': 0,
        'errors': []
    }

    for index, row in df.iterrows():
        try:
            # Map CSV columns to model fields
            data = {
                model_field: row[csv_column]
                for model_field, csv_column in column_mapping.items()
            }

            # Create or get user
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'username': data['email'],
                    'role': 'candidate',
                    'is_active': True
                }
            )

            # Create candidate profile
            candidate = CandidateProfile.objects.create(
                user=user,
                **data
            )

            results['success'] += 1

        except Exception as e:
            results['errors'].append({
                'row': index + 2,  # +2 for header + 0-index
                'data': row.to_dict(),
                'error': str(e)
            })

    # Generate error log CSV
    if results['errors']:
        error_df = pd.DataFrame(results['errors'])
        error_file_path = f'/tmp/import_errors_{admin_user_id}.csv'
        error_df.to_csv(error_file_path, index=False)
        results['error_file_path'] = error_file_path

    return results
```

**Duplicate Handling Strategies:**
1. **Skip:** If email exists, skip row (default)
2. **Update:** If email exists, update existing profile
3. **Error:** If email exists, mark as error

### API Endpoints

```
POST /api/v1/admin/candidates/parse-csv
- Uploads CSV temporarily, parses headers
- Returns: { columns: [...], preview_rows: [...], suggested_mapping: {...} }
- Auth: Required (admin role)
- File size: max 10MB

POST /api/v1/admin/candidates/import
- Triggers async import task
- Body: { file_id, column_mapping, duplicate_strategy }
- Returns: { task_id }
- Auth: Required (admin role)

GET /api/v1/admin/candidates/import/:task_id/status
- Polls import progress
- Returns: { status: "processing", progress: 50, total: 100 }

GET /api/v1/admin/candidates/import/:task_id/result
- Gets final import result
- Returns: { success: 48, errors: 2, error_file_url: "..." }

GET /api/v1/admin/candidates/import/:task_id/error-log
- Downloads error log CSV
- Returns: CSV file
```

### Frontend Components

**Import Wizard Steps:**

**Step 1: Upload CSV**
```
┌─────────────────────────────────────┐
│  Importar Candidatos                │
├─────────────────────────────────────┤
│  Arraste arquivo CSV ou clique      │
│  ┌───────────────────────────────┐  │
│  │   [📁 Selecionar Arquivo]     │  │
│  └───────────────────────────────┘  │
│  Max 10MB, formato .csv             │
│                                     │
│  [Baixar Template CSV]              │
└─────────────────────────────────────┘
```

**Step 2: Column Mapping**
```
┌─────────────────────────────────────┐
│  Mapear Colunas                     │
├─────────────────────────────────────┤
│  CSV Column     →  Model Field      │
│  ┌──────────┐     ┌─────────────┐  │
│  │ Name     │  →  │ name ▾      │  │
│  │ Email    │  →  │ email ▾     │  │
│  │ Phone    │  →  │ phone ▾     │  │
│  │ Position │  →  │ position ▾  │  │
│  └──────────┘     └─────────────┘  │
│                                     │
│  Preview (primeiras 5 linhas):      │
│  [Table with mapped data]           │
│                                     │
│  Estratégia de Duplicatas:          │
│  ● Pular   ○ Atualizar   ○ Erro    │
│                                     │
│  [Voltar]  [Importar]               │
└─────────────────────────────────────┘
```

**Step 3: Import Progress**
```
┌─────────────────────────────────────┐
│  Importando Candidatos...           │
├─────────────────────────────────────┤
│  ███████████░░░░░░░░  48 / 100      │
│                                     │
│  ✓ 48 candidatos importados         │
│  ⚠ 2 erros (duplicatas)             │
│                                     │
│  [Cancelar Importação]              │
└─────────────────────────────────────┘
```

**Step 4: Results**
```
┌─────────────────────────────────────┐
│  Importação Concluída               │
├─────────────────────────────────────┤
│  ✓ 48 candidatos importados         │
│  ⚠ 2 linhas com erros               │
│                                     │
│  [Baixar Log de Erros.csv]          │
│                                     │
│  [Ver Candidatos]  [Nova Importação]│
└─────────────────────────────────────┘
```

### Validation Rules

**Required Fields Validation:**
- name: not empty
- email: valid email format, not duplicate (if skip strategy)
- position: one of predefined options

**Optional Fields Validation:**
- phone: valid phone format (if provided)
- years_experience: integer >= 0
- tools: comma-separated list
- solutions: comma-separated list

**Error Handling:**
- Invalid email format → skip row, log error
- Duplicate email (skip strategy) → skip row, log as duplicate
- Missing required field → skip row, log error
- Invalid position value → skip row, log error

### Testing Considerations

**Unit Tests:**
- CSV parsing with pandas
- Column auto-detection logic
- User/Candidate creation
- Duplicate handling strategies

**Integration Tests:**
- End-to-end import flow (upload → map → import → results)
- Error log generation
- Progress tracking

**Edge Cases:**
- Empty CSV (0 rows)
- CSV with only headers
- CSV with 1000+ rows (performance)
- CSV with special characters (UTF-8 encoding)
- CSV with malformed data
- Concurrent imports by multiple admins

### Performance Considerations

- **Batch Processing:** Process rows in batches of 100 (commit every 100)
- **Async Task:** Use Celery for imports >50 rows
- **Progress Updates:** Update task progress every 10%
- **Timeout:** Max 30 minutes for import task
- **Memory:** Stream CSV parsing for large files

### Sample Notion Export CSV

**docs/basedados/notion_candidates_sample.csv:**
```csv
Name,Email,Phone,Position,Years,Location,Type,Tools,Solutions
João Silva,joao@email.com,11999999999,AE,5,São Paulo,Outbound,"Salesforce,Hubspot","SaaS,Fintech"
Maria Santos,maria@email.com,11988888888,SDR,2,Rio de Janeiro,Inbound,"Salesforce,Outreach","HR Tech,Edtech"
```

## Dependencies

- Story 3.1: CandidateProfile model complete
- Celery + Redis configured
- pandas library installed

## Definition of Done

- [ ] All 10 acceptance criteria validated
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Can import sample Notion CSV successfully
- [ ] Error logging working
- [ ] Progress tracking working
- [ ] Code reviewed and merged
- [ ] Deployed to staging
- [ ] QA sign-off
- [ ] Admin can import 100+ candidates without issues
