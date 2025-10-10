# Story 3.3: CSV Import Tool (Admin - Notion Migration)

Status: ContextReadyDraft

**📝 UPDATED 2025-10-09**: CSV import expanded to support all 36 Notion fields with specialized parsers for boolean, currency, date, and list types. Complete column mapping defined.

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

- [ ] Task 6: Criar componentes novos no Design System (AC: 1, 2, 3, 4, 7)
  - [ ] FileUpload component (drag & drop com validação)
    - [ ] Drag & drop zone
    - [ ] File validation (tipo, tamanho)
    - [ ] Preview de arquivo selecionado
    - [ ] Error states
  - [ ] ProgressBar component (com label e variantes)
    - [ ] Variantes: default, success, error
    - [ ] Label customizável
    - [ ] Percentage display
  - [ ] Stepper component (wizard navigation)
    - [ ] Status por step: pending, active, completed, error
    - [ ] Responsive (horizontal/vertical)
    - [ ] Accessible navigation
  - [ ] RadioGroup component (se não existir)
    - [ ] Multiple options
    - [ ] Description support
    - [ ] Keyboard navigation
  - [ ] Adicionar exports ao index.ts
  - [ ] Criar stories no Storybook

- [ ] Task 7: Implementar UI States e Validações (AC: 2, 3, 4, 7, 8, 9)
  - [ ] Loading states (upload, parsing, importing)
  - [ ] Error states (arquivo inválido, parsing falhou, importação falhou)
  - [ ] Success states (arquivo válido, importação completa)
  - [ ] Empty states (CSV vazio, sem erros)
  - [ ] Validação client-side (formato CSV, tamanho 10MB)
  - [ ] Toast/Alert notifications (sucesso, erro, warning)
  - [ ] User-friendly error messages

- [ ] Task 8: Garantir Responsividade (AC: 1-10)
  - [ ] Layout mobile (stepper colapsado, tabelas com scroll/cards)
  - [ ] Layout tablet (stepper horizontal, tables scroll se necessário)
  - [ ] Layout desktop (full width, two-column layout)
  - [ ] FileUpload responsivo (full width mobile, max-width desktop)
  - [ ] Testar em dispositivos reais (Chrome DevTools + mobile)

- [ ] Task 9: Implementar Acessibilidade (AC: 1-10)
  - [ ] ARIA labels em file upload zone
  - [ ] Keyboard navigation (Tab, Enter, Escape, Arrow keys)
  - [ ] Screen reader announcements (progress updates, errors)
  - [ ] Focus management (auto-focus, focus trap, focus restore)
  - [ ] Visual focus indicators (ring-2 ring-primary-500)
  - [ ] Validar contraste (WCAG AA)
  - [ ] Testar com screen readers (NVDA/VoiceOver)

## Dev Notes

### CSV Format

> **UPDATED 2025-10-09**: Full Notion CSV format with 36 columns. See complete mapping in [tech-spec-epic-3.md](../epics/tech-spec-epic-3.md#story-33).

**Notion CSV Columns (36 total):**
```csv
Nome,Aceita ser PJ?,CEP,CPF,Cidade,Contrato Assinado?,Data da Entrevista,Departamentos que já vendeu,Disp. p/ Mudança?,Disponibilidade para viagem?,Expansão/Venda pra carteira de clientes,Formação,Formação Acadêmica,ID,Idiomas,LinkedIn,Modelo de Trabalho,Mín Mensal Remuneração Total,Obs. Remuneração,PCD?,Posições de Interesse,Possui CNH?,Possui veículo próprio?,Prospecção Ativa,Qualificação de Leads Inbound,Retenção de Carteira de Clientes,Softwares de Vendas,Soluções que já vendeu,Status/Contrato,Tamanho da carteira gerida,Venda p/ Leads Inbound,Venda p/ Leads Outbound,Vendas em Field Sales,Vendas em Inside Sales,[Vendas/Closer] Ciclo de vendas,[Vendas/Closer] Ticket Médio
```

**Complete Field Mapping (36 columns → Model fields):**

See `DEFAULT_COLUMN_MAPPING` in [tech-spec-epic-3.md](../epics/tech-spec-epic-3.md#story-33) for the complete dictionary mapping all 36 Notion CSV columns to Django model fields.

**Key Field Types Requiring Parsing:**
- **Boolean Fields** (Sim/Não → True/False): `Aceita ser PJ?`, `Contrato Assinado?`, `PCD?`, `Possui CNH?`, `Possui veículo próprio?`
- **Currency Fields** (R$ 7.500,00 → Decimal): `Mín Mensal Remuneração Total`
- **Date Fields**: `Data da Entrevista`
- **List Fields** (comma-separated): `Departamentos`, `Idiomas`, `Posições de Interesse`, `Softwares de Vendas`, `Soluções`
- **Text Fields**: All experience fields (Prospecção Ativa, Qualificação, Retenção, etc.) store ranges like "Entre 3 e 5 anos"

### Backend Implementation

> **UPDATED 2025-10-09**: Added field parsers for boolean, currency, date, and list types. See complete implementation in [tech-spec-epic-3.md](../epics/tech-spec-epic-3.md#story-33).

**CSV Parsing with Pandas + Field Parsers:**
```python
import pandas as pd
from celery import shared_task
from decimal import Decimal

@shared_task
def process_csv_import(file_path, column_mapping, admin_user_id):
    df = pd.read_csv(file_path)
    results = {
        'total': len(df),
        'success': 0,
        'errors': []
    }

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

    for index, row in df.iterrows():
        try:
            # Create or get user
            email = row.get('Email', '')
            if not email:
                raise ValueError('Email missing')

            user, created = User.objects.get_or_create(
                email=email,
                defaults={'role': 'candidate'}
            )

            # Create candidate profile with ALL 36 fields parsed
            candidate = CandidateProfile.objects.update_or_create(
                user=user,
                defaults={
                    # Basic fields
                    'full_name': row.get('Nome', ''),
                    'cpf': row.get('CPF', ''),
                    'linkedin': row.get('LinkedIn', ''),

                    # New fields with parsers
                    'accepts_pj': parse_bool(row.get('Aceita ser PJ?')),
                    'zip_code': row.get('CEP', ''),
                    'city': row.get('Cidade', ''),
                    'contract_signed': parse_bool(row.get('Contrato Assinado?')),
                    'interview_date': parse_date(row.get('Data da Entrevista')),
                    'relocation_availability': row.get('Disp. p/ Mudança?', ''),
                    'travel_availability': row.get('Disponibilidade para viagem?', ''),
                    'academic_degree': row.get('Formação Acadêmica', ''),
                    'languages': parse_list(row.get('Idiomas', '')),
                    'work_model': row.get('Modelo de Trabalho', ''),
                    'minimum_salary': parse_currency(row.get('Mín Mensal Remuneração Total')),
                    'salary_notes': row.get('Obs. Remuneração', ''),
                    'is_pcd': parse_bool(row.get('PCD?')),
                    'positions_of_interest': parse_list(row.get('Posições de Interesse', '')),
                    'has_drivers_license': parse_bool(row.get('Possui CNH?')),
                    'has_vehicle': parse_bool(row.get('Possui veículo próprio?')),

                    # Experience fields (text ranges)
                    'active_prospecting_experience': row.get('Prospecção Ativa', ''),
                    'inbound_qualification_experience': row.get('Qualificação de Leads Inbound', ''),
                    'portfolio_retention_experience': row.get('Retenção de Carteira de Clientes', ''),
                    'portfolio_expansion_experience': row.get('Expansão/Venda pra carteira de clientes', ''),
                    'portfolio_size': row.get('Tamanho da carteira gerida', ''),
                    'inbound_sales_experience': row.get('Venda p/ Leads Inbound', ''),
                    'outbound_sales_experience': row.get('Venda p/ Leads Outbound', ''),
                    'field_sales_experience': row.get('Vendas em Field Sales', ''),
                    'inside_sales_experience': row.get('Vendas em Inside Sales', ''),

                    # Existing fields
                    'tools_software': parse_list(row.get('Softwares de Vendas', '')),
                    'solutions_sold': parse_list(row.get('Soluções que já vendeu', '')),
                    'departments_sold_to': parse_list(row.get('Departamentos que já vendeu', '')),
                    'sales_cycle': row.get('[Vendas/Closer] Ciclo de vendas', ''),
                    'avg_ticket': row.get('[Vendas/Closer] Ticket Médio', ''),
                    'status': row.get('Status/Contrato', 'available'),
                }
            )

            results['success'] += 1

        except Exception as e:
            results['errors'].append({
                'row': index + 2,
                'nome': row.get('Nome', 'Unknown'),
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

**Key Changes:**
- ✅ Added 4 parser functions: `parse_bool()`, `parse_currency()`, `parse_list()`, `parse_date()`
- ✅ All 36 Notion CSV columns mapped to model fields
- ✅ Handles special formats (R$ currency, Sim/Não booleans, comma-separated lists)
- ✅ Experience fields stored as text (ranges like "Entre 3 e 5 anos")

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

### Frontend Components Architecture

**Componentes Design System Utilizados:**

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Alert,
  Badge,
  Modal,
  Input
} from '@talentbase/design-system';
```

**Novos Componentes a Criar no Design System:**

1. `FileUpload` - Drag & drop com validação de arquivo (packages/design-system/src/components/FileUpload.tsx)
2. `ProgressBar` - Barra de progresso com label e variantes (packages/design-system/src/components/ProgressBar.tsx)
3. `Stepper` - Wizard navigation indicator (packages/design-system/src/components/Stepper.tsx)
4. `RadioGroup` - Grupo de radio buttons (verificar se existe, caso contrário criar)

### Import Wizard Steps

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

### UI States

**Upload Step:**
- **Initial State:** Drag & drop zone ativo, botão "Selecionar Arquivo"
- **Dragging State:** Highlight da zone quando arquivo está sobre a área
- **Validating State:** Spinner + "Validando arquivo..."
- **Error State:** Alert vermelho com mensagem específica ("Arquivo muito grande", "Formato inválido")
- **Success State:** Preview do arquivo selecionado com nome, tamanho e número estimado de linhas

**Mapping Step:**
- **Loading State:** Skeleton table enquanto faz parse do CSV
- **Mapping Active:** Tabela editável com dropdowns Select
- **Validation Feedback:** Checkmarks verdes em campos válidos, X vermelho em inválidos
- **Warning State:** Badge amarelo se há colunas CSV não mapeadas

**Import Step:**
- **Processing State:** ProgressBar animada com porcentagem e "X de Y candidatos"
- **Pause State:** Botão "Pausar Importação" (se implementado)
- **Canceling State:** Loading spinner + "Cancelando importação..."
- **Error State:** Alert vermelho + botão "Tentar Novamente"

**Results Step:**
- **Success Total (100%):** Alert verde + ícone de celebração
- **Success Partial:** Alert amarelo com estatísticas (X sucessos, Y erros)
- **Failure Total (0%):** Alert vermelho com sugestões de correção

### Client-Side Validation

**File Upload Validation:**
```tsx
function validateFile(file: File): ValidationResult {
  // Check extension
  if (!file.name.endsWith('.csv')) {
    return {
      valid: false,
      error: 'Apenas arquivos .csv são aceitos'
    };
  }

  // Check size (10MB = 10 * 1024 * 1024 bytes)
  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 10MB'
    };
  }

  // Check if empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Arquivo vazio. Selecione um CSV válido'
    };
  }

  return { valid: true };
}
```

**Column Mapping Validation:**
- Required fields (Name, Email) must be mapped
- Show warning badge if unmapped CSV columns exist
- Validate data type compatibility (ex: date column → date field)
- Visual feedback: green checkmark (✓) para válido, red X (✕) para inválido

**User-Friendly Error Messages:**
```tsx
// ❌ Evitar mensagens técnicas
"Error processing row 15"
"Invalid format"
"Duplicate entry"

// ✅ Usar mensagens claras e acionáveis
"Linha 15: Email inválido (joao@ está incompleto)"
"Data de nascimento em formato inválido. Use DD/MM/AAAA (ex: 25/12/1990)"
"Email já cadastrado: maria@email.com (linha 23)"
```

### Responsive Design

**Mobile (< 768px):**
- **Stepper:** Horizontal scroll ou mostrar apenas step ativo
- **FileUpload:** Full width, texto reduzido, botão grande
- **Mapping Table:**
  - Horizontal scroll com first column sticky
  - Ou transformar em cards verticais
- **Preview Table:** Cards verticais ao invés de tabela
- **Buttons:** Stack vertical, full width

**Tablet (768px - 1023px):**
- **Stepper:** Horizontal com labels visíveis
- **Tables:** Scroll horizontal se necessário, borders visíveis
- **Buttons:** Inline com wrapping permitido
- **FileUpload:** Width 100%, drag zone visível

**Desktop (>= 1024px):**
- **Stepper:** Full horizontal com todos os steps visíveis
- **Tables:** Full width sem scroll
- **Layout:** Two-column quando possível (ex: mapping table + preview)
- **FileUpload:** Max-width 600px, centralizado

### Accessibility (a11y)

**File Upload Zone:**
```tsx
<div
  role="button"
  tabIndex={0}
  aria-label="Área de upload de arquivo CSV. Arraste um arquivo ou pressione Enter para selecionar"
  aria-describedby="upload-instructions"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  }}
>
  <p id="upload-instructions" className="text-sm text-gray-600">
    Arraste um arquivo CSV ou pressione Enter/Espaço para selecionar
  </p>
</div>
```

**Progress Updates (Screen Reader):**
```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {progress}% completo. {successCount} de {total} candidatos importados.
  {errorCount > 0 && `${errorCount} erros encontrados.`}
</div>
```

**Stepper Navigation:**
```tsx
<nav aria-label="Progresso da importação">
  <ol className="flex">
    {steps.map((step, index) => (
      <li
        key={step.id}
        aria-current={step.status === 'active' ? 'step' : undefined}
      >
        <span className={cn(
          step.status === 'completed' && 'text-green-600',
          step.status === 'active' && 'text-primary-600 font-semibold',
          step.status === 'pending' && 'text-gray-400'
        )}>
          {step.label}
        </span>
      </li>
    ))}
  </ol>
</nav>
```

**Keyboard Navigation:**
- **Tab:** Navegar entre elementos interativos
- **Enter/Space:** Abrir file dialog, selecionar opções
- **Escape:** Cancelar operação, fechar modal
- **Arrow keys:** Navegar em tabela de mapeamento (row by row)
- **Home/End:** Ir para primeiro/último campo da tabela

**Focus Management:**
- Auto-focus em primeiro campo inválido após validação
- Focus trap em modais
- Focus restaurado ao elemento anterior após fechar modal
- Visual focus indicator em todos os elementos (ring-2 ring-primary-500)

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

## Dev Agent Record

### Context Reference

- [Story Context XML](../stories-context/story-context-3.3.xml) - Generated 2025-10-09

### Agent Model Used

Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

### Completion Notes List

### File List
