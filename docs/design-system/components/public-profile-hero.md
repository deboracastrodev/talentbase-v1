# PublicProfileHero

Hero section com gradient para perfis públicos de candidatos.

## Uso

```tsx
import { PublicProfileHero } from '@talentbase/design-system';

function PublicProfile() {
  return (
    <PublicProfileHero
      name="Juliana Fernandes do Amaral"
      avatarUrl="https://..."
      badges={[
        { label: '📍 Osasco - SP' },
        { label: '💼 Híbrido' },
        { label: '🎯 Account Manager/CSM' }
      ]}
    />
  );
}
```

## Props

### PublicProfileHeroProps

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| name | `string` | - | Nome completo do candidato |
| avatarUrl | `string` | - | URL da foto do candidato |
| badges | `HeroBadge[]` | `[]` | Lista de badges informativos |
| className | `string` | - | Classes CSS adicionais |

### HeroBadge

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| label | `string` | - | Texto do badge |
| variant | `BadgeVariant` | `'outline'` | Variante do badge |
| icon | `React.ReactNode` | - | Ícone opcional |

## Variações

### Básico

```tsx
<PublicProfileHero
  name="João Silva"
  avatarUrl="https://..."
  badges={[
    { label: '📍 São Paulo - SP' },
    { label: '🎯 SDR/BDR' }
  ]}
/>
```

### Com PCD

```tsx
<PublicProfileHero
  name="Maria Santos"
  avatarUrl="https://..."
  badges={[
    { label: '📍 Rio de Janeiro - RJ' },
    { label: '💼 Remoto' },
    { label: '🎯 AE' },
    { label: '♿ PCD', variant: 'success' }
  ]}
/>
```

### Sem Avatar (Fallback)

```tsx
<PublicProfileHero
  name="Carlos Eduardo"
  badges={[
    { label: '📍 Curitiba - PR' },
    { label: '🎯 CSM' }
  ]}
/>
```

O componente Avatar automaticamente exibe as iniciais do nome quando não há foto.

## Design

### Gradient Background

```tsx
bg-gradient-to-r from-primary-500 to-secondary-600
```

- **Primary (início):** `#00B8D4` (ciano)
- **Secondary (fim):** `#1E3A8A` (azul)

### Avatar

- **Mobile:** `4xl` (128px)
- **Desktop:** `5xl` (160px) via `md:h-40 md:w-40`
- **Border:** 4px branco com sombra
- **Responsivo:** Flex column mobile, row desktop

### Typography

- **Nome (H1):**
  - Mobile: `text-3xl` (30px)
  - Desktop: `text-4xl` (36px)
  - Peso: `font-bold`
  - Cor: `text-white`

### Badges

- **Background:** `bg-white/10` (10% opacidade)
- **Border:** `border-white/30` (30% opacidade)
- **Hover:** `hover:bg-white/20`
- **Text:** `text-white`

## Responsividade

### Mobile (< 768px)

```tsx
<div className="flex flex-col items-start gap-6">
  <Avatar size="4xl" /> {/* 128px */}
  <div>
    <h1 className="text-3xl font-bold">Nome</h1>
    <div className="flex flex-wrap gap-2">
      {/* Badges */}
    </div>
  </div>
</div>
```

### Desktop (>= 768px)

```tsx
<div className="flex md:flex-row items-start gap-6">
  <Avatar className="md:h-40 md:w-40" /> {/* 160px */}
  <div>
    <h1 className="text-3xl md:text-4xl font-bold">Nome</h1>
    {/* Badges */}
  </div>
</div>
```

## Ícones Recomendados

### Emojis

- **Localização:** 📍
- **Trabalho Remoto:** 🌍
- **Híbrido:** 💼
- **Presencial:** 🏢
- **Posição:** 🎯
- **PCD:** ♿

### Lucide Icons

```tsx
import { MapPin, Briefcase, Target } from 'lucide-react';

<PublicProfileHero
  badges={[
    { label: 'São Paulo - SP', icon: <MapPin className="h-4 w-4" /> },
    { label: 'Híbrido', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Account Executive', icon: <Target className="h-4 w-4" /> }
  ]}
/>
```

## Acessibilidade

- ✅ Contraste WCAG AAA (branco sobre gradient escuro)
- ✅ Alt text automático no Avatar (usa nome)
- ✅ Semântica: `<h1>` para nome principal
- ✅ Section landmark: `<section>`

## Exemplos de Integração

### Com Dados do Backend

```tsx
// app/routes/share.candidate.$token.tsx
export default function PublicCandidatePage() {
  const { candidate } = useLoaderData<typeof loader>();

  const badges = [
    { label: `📍 ${candidate.city} - ${candidate.state}` },
    { label: `💼 ${candidate.work_model}` },
    { label: `🎯 ${candidate.position_interest}` },
    ...(candidate.pcd ? [{ label: '♿ PCD', variant: 'success' }] : [])
  ];

  return (
    <div>
      <PublicProfileHero
        name={candidate.name}
        avatarUrl={candidate.profile_photo_url}
        badges={badges}
      />
      {/* Resto do perfil */}
    </div>
  );
}
```

### Formatação de Work Model

```tsx
const workModelLabels = {
  remote: '🌍 100% Remoto',
  hybrid: '💼 Híbrido',
  onsite: '🏢 Presencial'
};

const badges = [
  { label: `📍 ${candidate.city}` },
  { label: workModelLabels[candidate.work_model] },
  { label: `🎯 ${candidate.position_interest}` }
];
```

## Design Tokens

```css
/* Gradient */
--hero-gradient-start: var(--color-primary-500);
--hero-gradient-end: var(--color-secondary-600);

/* Avatar */
--hero-avatar-mobile: 8rem; /* 128px */
--hero-avatar-desktop: 10rem; /* 160px */
--hero-avatar-border: 4px solid white;

/* Typography */
--hero-title-mobile: 1.875rem; /* 30px */
--hero-title-desktop: 2.25rem; /* 36px */

/* Spacing */
--hero-padding-mobile: 2rem; /* 32px */
--hero-padding-desktop: 3rem; /* 48px */
--hero-gap: 1.5rem; /* 24px */
```
