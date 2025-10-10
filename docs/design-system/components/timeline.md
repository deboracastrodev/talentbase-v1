# Timeline

Componente de linha do tempo vertical para exibir histórico de experiências profissionais.

## Uso

```tsx
import { Timeline } from '@talentbase/design-system';

function ExperienceSection() {
  return (
    <Timeline
      items={[
        {
          id: '1',
          title: 'Account Executive',
          subtitle: 'Tech Company',
          period: 'jan/2023 - o momento',
          duration: '1 ano e 2 meses',
          logoUrl: 'https://...',
        }
      ]}
    />
  );
}
```

## Props

### TimelineProps

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| items | `TimelineItem[]` | `[]` | Lista de itens da timeline |
| className | `string` | - | Classes CSS adicionais |

### TimelineItem

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| id | `string` | Sim | ID único do item |
| title | `string` | Sim | Título (ex: cargo) |
| subtitle | `string` | Sim | Subtítulo (ex: empresa) |
| period | `string` | Sim | Período (ex: "jan/2023 - o momento") |
| duration | `string` | Não | Duração (ex: "1 ano e 2 meses") |
| logoUrl | `string` | Não | URL do logo da empresa |
| description | `string` | Não | Descrição da experiência |

## Variações

### Com Logos

```tsx
<Timeline
  items={[
    {
      id: '1',
      title: 'Senior AE',
      subtitle: 'Company Name',
      period: 'mai/25 - o momento',
      duration: '7 meses',
      logoUrl: 'https://cdn.company.com/logo.png'
    }
  ]}
/>
```

### Sem Logos

```tsx
<Timeline
  items={[
    {
      id: '1',
      title: 'Sales Executive',
      subtitle: 'Tech Startup',
      period: 'jan/2023 - dez/2023',
      duration: '1 ano'
    }
  ]}
/>
```

### Com Descrição

```tsx
<Timeline
  items={[
    {
      id: '1',
      title: 'Account Executive',
      subtitle: 'SaaS Company',
      period: 'jan/2023 - o momento',
      description: 'Responsável por vendas enterprise e negociação com C-level.'
    }
  ]}
/>
```

## Estados

### Empty State

Quando a lista está vazia, o componente exibe automaticamente:

```
Nenhuma experiência cadastrada
```

## Estilo

### Cores

- **Dot ativo (primeiro):** `bg-primary-500` (ciano)
- **Dots histórico:** `bg-gray-400`
- **Linha vertical:** `bg-gray-300`
- **Card background:** `bg-gray-50`

### Espaçamento

- Entre items: `space-y-6` (24px)
- Padding do card: `p-4` (16px)
- Gap logo-texto: `gap-3` (12px)

## Acessibilidade

- Ordem cronológica reversa (mais recente primeiro)
- Textos semânticos (h4 para título)
- Contraste WCAG AA
- Alt text em logos

## Exemplos de Uso

### Perfil Público de Candidato

```tsx
<Card>
  <CardHeader>
    <CardTitle>Linha do Tempo</CardTitle>
  </CardHeader>
  <CardContent>
    <Timeline items={candidate.experiences} />
  </CardContent>
</Card>
```

### Com Formatação de Data

```tsx
// Helper function para formatar período
function formatPeriod(start: string, end: string | null) {
  const startFormatted = formatMonthYear(start); // "jan/23"
  const endFormatted = end ? formatMonthYear(end) : 'o momento';
  return `${startFormatted} - ${endFormatted}`;
}

// Helper function para calcular duração
function calculateDuration(start: string, end: string | null) {
  const months = getMonthsDiff(start, end || new Date());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${months} meses`;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
}
```

## Design Tokens

```css
/* Baseado no design system */
--timeline-dot-active: var(--color-primary-500);
--timeline-dot-inactive: var(--color-gray-400);
--timeline-line: var(--color-gray-300);
--timeline-card-bg: var(--color-gray-50);
--timeline-spacing: 1.5rem; /* 24px */
```
