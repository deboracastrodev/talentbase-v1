# Table Component

Componente de tabela profissional com header azul primário, linhas zebradas (striped) e efeitos de hover. Otimizado para exibição de dados em painéis administrativos e dashboards.

## Características

- ✅ **Header azul primário** - fundo azul claro respeitando brand colors
- ✅ **Zebra-striped rows** - linhas alternadas para melhor leitura
- ✅ **Hover interativo** - destaque ao passar mouse em linhas clicáveis
- ✅ **Sticky header** - header fixo ao rolar (opcional)
- ✅ **Sorting** - indicadores de ordenação
- ✅ **Loading state** - skeleton durante carregamento
- ✅ **Empty state** - mensagem quando não há dados
- ✅ **Responsive** - scroll horizontal em telas pequenas
- ✅ **Acessível** - HTML semântico e ARIA

## Quando Usar

### ✅ Use Table para:

- **Lista de candidatos** - nome, email, posição, status
- **Lista de empresas** - razão social, CNPJ, contato
- **Histórico** - logs, auditoria, transações
- **Relatórios** - dados tabulares estruturados
- **Admin panels** - qualquer listagem com múltiplas colunas

### ❌ Não use Table para:

- **Listas simples com 1-2 colunas** → use Card list
- **Dados hierárquicos** → use Tree view
- **Mobile-first views** → considere Card layout
- **Formulários** → use Form layout

## Instalação

A Table já está incluída no design system:

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableLoading,
} from '@talentbase/design-system';
```

## Uso Básico

```tsx
<Table striped>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Posição</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow clickable onClick={() => handleView(user)}>
      <TableCell>João Silva</TableCell>
      <TableCell>joao@example.com</TableCell>
      <TableCell>SDR/BDR</TableCell>
      <TableCell>
        <Badge variant="success">Ativo</Badge>
      </TableCell>
    </TableRow>
    <TableRow clickable onClick={() => handleView(user2)}>
      <TableCell>Maria Santos</TableCell>
      <TableCell>maria@example.com</TableCell>
      <TableCell>Account Executive</TableCell>
      <TableCell>
        <Badge variant="warning">Pendente</Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## API

### Table Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `children` | `ReactNode` | - | Conteúdo da tabela (TableHeader + TableBody) |
| `striped` | `boolean` | `false` | Ativa linhas zebradas (recomendado para 5+ linhas) |
| `stickyHeader` | `boolean` | `false` | Mantém header fixo ao rolar |
| `className` | `string` | `''` | Classe CSS customizada |

### TableHeader Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `children` | `ReactNode` | - | TableRow com TableHead cells |
| `variant` | `'default' \| 'primary' \| 'secondary'` | `'primary'` | Cor do header |
| `className` | `string` | `''` | Classe CSS customizada |

**Variantes do Header:**
- `primary` (padrão) - Fundo azul claro (`bg-primary-50`), borda azul (`border-primary-200`)
- `secondary` - Fundo verde/teal claro (`bg-secondary-50`)
- `default` - Fundo cinza (`bg-gray-50`)

### TableRow Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `children` | `ReactNode` | - | TableCell ou TableHead cells |
| `clickable` | `boolean` | `false` | Adiciona cursor pointer e hover effect |
| `selected` | `boolean` | `false` | Marca linha como selecionada |
| `onClick` | `() => void` | - | Handler quando linha é clicada |
| `className` | `string` | `''` | Classe CSS customizada |

### TableHead Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `children` | `ReactNode` | - | Conteúdo do header (texto da coluna) |
| `sortable` | `boolean` | `false` | Habilita sorting (mostra indicador) |
| `sortDirection` | `'asc' \| 'desc' \| null` | `null` | Direção atual do sort |
| `onSort` | `() => void` | - | Callback quando header é clicado para sort |
| `className` | `string` | `''` | Classe CSS customizada |

### TableCell Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `children` | `ReactNode` | - | Conteúdo da célula |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alinhamento do conteúdo |
| `className` | `string` | `''` | Classe CSS customizada |

## Header Azul Primário

O header da tabela usa a cor azul primária do design system para destacar visualmente e criar hierarquia:

```tsx
// Variante padrão (primary) - azul
<TableHeader>
  <TableRow>
    <TableHead>Nome</TableHead>
    <TableHead>Email</TableHead>
  </TableRow>
</TableHeader>

// Variante secundária - verde/teal
<TableHeader variant="secondary">
  <TableRow>
    <TableHead>Nome</TableHead>
    <TableHead>Email</TableHead>
  </TableRow>
</TableHeader>

// Variante default - cinza (para casos especiais)
<TableHeader variant="default">
  <TableRow>
    <TableHead>Nome</TableHead>
    <TableHead>Email</TableHead>
  </TableRow>
</TableHeader>
```

**Classes aplicadas (variant="primary"):**
- Fundo: `bg-primary-50` (azul muito claro)
- Borda inferior: `border-b-2 border-primary-200` (azul claro)
- Texto: `text-primary-900` (azul escuro)
- Texto uppercase, tracking-wide, font-semibold

## Zebra-Striped Rows

Ative `striped` para alternar cores de fundo nas linhas, facilitando leitura:

```tsx
<Table striped>
  {/* Linha 0 (par): bg-gray-50 */}
  <TableRow>...</TableRow>

  {/* Linha 1 (ímpar): sem background */}
  <TableRow>...</TableRow>

  {/* Linha 2 (par): bg-gray-50 */}
  <TableRow>...</TableRow>
</Table>
```

**Recomendação UX:**
- Use `striped` para tabelas com **5 ou mais linhas**
- Não use para tabelas com poucas linhas (3 ou menos)
- Combine com `clickable` para melhor feedback visual

## Linhas Clicáveis com Hover

Marque linhas como `clickable` para adicionar cursor pointer e hover effect:

```tsx
<TableRow clickable onClick={() => navigate(`/candidates/${candidate.id}`)}>
  <TableCell>{candidate.name}</TableCell>
  <TableCell>{candidate.email}</TableCell>
</TableRow>
```

**Comportamento do hover:**
- **Sem striped:** hover muda para `bg-gray-50`
- **Com striped:** hover muda para `bg-primary-50` (azul claro)
- **Active (clique):** `bg-primary-100` (azul mais forte)

## Sorting

Adicione sorting indicators aos headers:

```tsx
const [sortColumn, setSortColumn] = useState('name');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

const handleSort = (column: string) => {
  if (sortColumn === column) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortColumn(column);
    setSortDirection('asc');
  }
};

<Table>
  <TableHeader>
    <TableRow>
      <TableHead
        sortable
        sortDirection={sortColumn === 'name' ? sortDirection : null}
        onSort={() => handleSort('name')}
      >
        Nome
      </TableHead>
      <TableHead
        sortable
        sortDirection={sortColumn === 'email' ? sortDirection : null}
        onSort={() => handleSort('email')}
      >
        Email
      </TableHead>
      <TableHead>Ações</TableHead> {/* Não sortable */}
    </TableRow>
  </TableHeader>
</Table>
```

**Indicadores:**
- `↑` - Ordenação ascendente
- `↓` - Ordenação descendente
- `⇅` - Coluna sortable mas não ativa

## Loading State

Use `TableLoading` para skeleton durante carregamento:

```tsx
<Table striped>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Posição</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {isLoading ? (
      <TableLoading rows={5} columns={3} />
    ) : (
      candidates.map(candidate => (
        <TableRow key={candidate.id}>
          <TableCell>{candidate.name}</TableCell>
          <TableCell>{candidate.email}</TableCell>
          <TableCell>{candidate.position}</TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>
```

## Empty State

Use `TableEmpty` quando não há dados:

```tsx
import { Users } from 'lucide-react';

<TableBody>
  {candidates.length === 0 ? (
    <TableEmpty
      icon={<Users className="h-12 w-12" />}
      title="Nenhum candidato encontrado"
      message="Comece importando candidatos via CSV ou criando manualmente."
      action={
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/import')}>
            Importar CSV
          </Button>
          <Button onClick={() => navigate('/admin/candidates/new')}>
            Criar Candidato
          </Button>
        </div>
      }
    />
  ) : (
    // ... actual rows
  )}
</TableBody>
```

## Sticky Header

Para tabelas longas, ative `stickyHeader` para manter header visível ao rolar:

```tsx
<Table striped stickyHeader>
  <TableHeader>
    {/* header fica fixo */}
  </TableHeader>
  <TableBody>
    {/* 100+ linhas */}
  </TableBody>
</Table>
```

**Nota:** Altura máxima automaticamente definida em `600px` quando `stickyHeader` está ativo.

## Exemplos Práticos

### Tabela de Candidatos (Admin)

```tsx
function CandidatesTable({ candidates, isLoading, onRowClick }) {
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? modifier : -modifier;
    });
  }, [candidates, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <Table striped>
      <TableHeader>
        <TableRow>
          <TableHead
            sortable
            sortDirection={sortColumn === 'name' ? sortDirection : null}
            onSort={() => handleSort('name')}
          >
            Nome
          </TableHead>
          <TableHead
            sortable
            sortDirection={sortColumn === 'email' ? sortDirection : null}
            onSort={() => handleSort('email')}
          >
            Email
          </TableHead>
          <TableHead
            sortable
            sortDirection={sortColumn === 'position' ? sortDirection : null}
            onSort={() => handleSort('position')}
          >
            Posição
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableLoading rows={5} columns={5} />
        ) : sortedCandidates.length === 0 ? (
          <TableEmpty
            title="Nenhum candidato encontrado"
            message="Tente ajustar os filtros ou importar novos candidatos."
          />
        ) : (
          sortedCandidates.map((candidate) => (
            <TableRow
              key={candidate.id}
              clickable
              onClick={() => onRowClick(candidate)}
            >
              <TableCell>{candidate.name}</TableCell>
              <TableCell>{candidate.email}</TableCell>
              <TableCell>{candidate.position}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    candidate.status === 'active'
                      ? 'success'
                      : candidate.status === 'pending'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {candidate.status}
                </Badge>
              </TableCell>
              <TableCell align="right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation(); // Previne click da row
                    handleEdit(candidate);
                  }}
                >
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
```

### Tabela com Seleção Múltipla

```tsx
function SelectableTable({ items }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected(prev =>
      prev.length === items.length
        ? []
        : items.map(i => i.id)
    );
  };

  return (
    <>
      {selected.length > 0 && (
        <div className="mb-4 p-4 bg-primary-50 rounded">
          {selected.length} item(ns) selecionado(s)
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleBulkDelete(selected)}
          >
            Deletar Selecionados
          </Button>
        </div>
      )}

      <Table striped>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={selected.length === items.length}
                onChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow
              key={item.id}
              selected={selected.includes(item.id)}
            >
              <TableCell>
                <Checkbox
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
```

### Tabela Responsiva com Scroll

```tsx
<div className="bg-white rounded-lg shadow overflow-hidden">
  <Table striped>
    <TableHeader>
      <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Telefone</TableHead>
        <TableHead>Cidade</TableHead>
        <TableHead>Posição</TableHead>
        <TableHead>Anos Exp.</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {/* Scroll horizontal automático em mobile */}
    </TableBody>
  </Table>
</div>
```

## UX Best Practices

### ✅ Boas Práticas

1. **Use striped para tabelas longas**
   ```tsx
   // ✅ Tabela com 10+ linhas
   <Table striped>

   // ❌ Tabela com 3 linhas
   <Table striped> // Desnecessário
   ```

2. **Torne linhas clicáveis quando apropriado**
   ```tsx
   // ✅ Linha inteira clicável para detalhes
   <TableRow clickable onClick={() => navigate(`/users/${user.id}`)}>

   // ❌ Apenas texto clicável
   <TableRow>
     <TableCell>
       <a onClick={...}>{user.name}</a> // Dificulta clique
     </TableCell>
   </TableRow>
   ```

3. **Alinhe números à direita**
   ```tsx
   <TableCell align="right">R$ 5.000</TableCell>
   <TableCell align="right">15</TableCell>
   ```

4. **Mostre loading state**
   ```tsx
   {isLoading ? <TableLoading /> : actualRows}
   ```

5. **Forneça empty state com ação**
   ```tsx
   <TableEmpty
     title="Sem dados"
     message="Descrição clara"
     action={<Button>Ação</Button>}
   />
   ```

## Acessibilidade

- **HTML semântico** - `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- **Scope nos headers** - `<th>` tem scope implícito
- **Caption opcional** - use `<TableCaption>` para descrever tabela
- **Keyboard navigation** - Tab navega células, Enter ativa linhas clickable
- **ARIA** - `role="table"`, `role="row"`, etc. (implícito no HTML semântico)

## Troubleshooting

### Striped rows não aparecem

**Causa:** Prop `striped` não passada para `<Table>`.

**Solução:**
```tsx
<Table striped> {/* ✅ Adicione prop */}
```

### Header não fica azul

**Causa:** Variante não é `primary` ou cores customizadas no className.

**Solução:**
```tsx
<TableHeader variant="primary"> {/* Padrão */}
```

### Hover não funciona

**Causa:** Linha não marcada como `clickable`.

**Solução:**
```tsx
<TableRow clickable onClick={...}> {/* ✅ */}
```

## Changelog

### v2.0.0 (2025-10-10)
- ✨ Header com variante `primary` (azul) como padrão
- ✨ Zebra-striped rows via prop `striped`
- ✨ Hover effect em linhas clicáveis
- ✨ Sorting indicators
- ✨ TableEmpty component
- ✨ TableLoading component
- ✨ TableCaption component
- ✨ Sticky header via prop `stickyHeader`
- ✨ Selected state em rows
- ✨ Align prop em TableCell
- 🎨 Header com texto uppercase, tracking-wide
- 🎨 Cores do header: primary-50, primary-200, primary-900
- 📝 Documentação completa

### v1.0.0
- Versão básica da Table
