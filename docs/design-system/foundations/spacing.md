# Spacing - Espaçamentos

Sistema de espaçamento da TalentBase baseado em múltiplos de 4px (base-4) para consistência e alinhamento perfeito.

## 📐 Sistema Base-4

O sistema usa 4px como unidade base, criando um ritmo visual harmônico:

```
Base Unit = 4px
Múltiplos: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256
```

## 📏 Scale de Espaçamento

```css
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
--space-40: 160px;
--space-48: 192px;
--space-64: 256px;
```

## 🎯 Uso Semântico

### Component Spacing (Interno)
Espaçamento dentro de componentes:

```css
/* Extra Small - Padding interno de badges, tags */
--spacing-component-xs: var(--space-2); /* 8px */

/* Small - Padding de botões pequenos */
--spacing-component-sm: var(--space-3); /* 12px */

/* Medium - Padding padrão de botões e inputs */
--spacing-component-md: var(--space-4); /* 16px */

/* Large - Padding de cards e containers */
--spacing-component-lg: var(--space-6); /* 24px */

/* Extra Large - Padding de seções */
--spacing-component-xl: var(--space-8); /* 32px */
```

### Layout Spacing (Estrutural)
Espaçamento entre componentes e seções:

```css
/* Gap entre elementos próximos */
--spacing-layout-xs: var(--space-2); /* 8px */
--spacing-layout-sm: var(--space-4); /* 16px */
--spacing-layout-md: var(--space-6); /* 24px */
--spacing-layout-lg: var(--space-8); /* 32px */
--spacing-layout-xl: var(--space-12); /* 48px */
--spacing-layout-2xl: var(--space-16); /* 64px */
--spacing-layout-3xl: var(--space-24); /* 96px */
```

### Section Spacing
Espaçamento entre seções da página:

```css
--spacing-section-sm: var(--space-16); /* 64px */
--spacing-section-md: var(--space-20); /* 80px */
--spacing-section-lg: var(--space-24); /* 96px */
--spacing-section-xl: var(--space-32); /* 128px */
```

## 📱 Responsive Spacing

### Mobile (< 640px)
```css
--spacing-section-sm: var(--space-12); /* 48px */
--spacing-section-md: var(--space-16); /* 64px */
--spacing-section-lg: var(--space-20); /* 80px */
--spacing-section-xl: var(--space-24); /* 96px */
```

### Tablet (640px - 1024px)
```css
--spacing-section-sm: var(--space-16); /* 64px */
--spacing-section-md: var(--space-20); /* 80px */
--spacing-section-lg: var(--space-24); /* 96px */
--spacing-section-xl: var(--space-32); /* 128px */
```

### Desktop (> 1024px)
Usar valores padrão.

## 🎨 Aplicações Práticas

### Botões
```css
/* Small Button */
.btn-sm {
  padding: var(--space-2) var(--space-3); /* 8px 12px */
}

/* Medium Button (padrão) */
.btn-md {
  padding: var(--space-3) var(--space-6); /* 12px 24px */
}

/* Large Button */
.btn-lg {
  padding: var(--space-4) var(--space-8); /* 16px 32px */
}
```

### Cards
```css
.card {
  padding: var(--space-6); /* 24px */
  gap: var(--space-4); /* 16px entre elementos internos */
}

.card-lg {
  padding: var(--space-8); /* 32px */
  gap: var(--space-6); /* 24px */
}
```

### Forms
```css
.form-group {
  margin-bottom: var(--space-4); /* 16px */
}

.input {
  padding: var(--space-3) var(--space-4); /* 12px 16px */
}

.input-lg {
  padding: var(--space-4) var(--space-5); /* 16px 20px */
}
```

### Grid & Flex Gaps
```css
/* Cards Grid */
.cards-grid {
  gap: var(--space-6); /* 24px */
}

/* Form Horizontal */
.form-horizontal {
  gap: var(--space-4); /* 16px */
}

/* Navigation Items */
.nav-items {
  gap: var(--space-8); /* 32px */
}
```

### Container Margins
```css
/* Container Padding */
.container {
  padding-left: var(--space-4); /* 16px mobile */
  padding-right: var(--space-4);
}

@media (min-width: 640px) {
  .container {
    padding-left: var(--space-6); /* 24px tablet */
    padding-right: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: var(--space-8); /* 32px desktop */
    padding-right: var(--space-8);
  }
}
```

## 📊 Tabela de Referência Rápida

| Token | Valor | Uso Comum |
|-------|-------|-----------|
| space-1 | 4px | Bordas, separadores finos |
| space-2 | 8px | Badges, tags, gap mínimo |
| space-3 | 12px | Padding de botões small |
| space-4 | 16px | Padding padrão, gap entre elementos |
| space-6 | 24px | Padding de cards, margin entre seções |
| space-8 | 32px | Seções internas, gap entre grupos |
| space-12 | 48px | Seções médias |
| space-16 | 64px | Seções grandes |
| space-24 | 96px | Separação entre páginas |

## 📐 Stack & Inline

### Vertical Spacing (Stack)
Espaçamento vertical entre elementos empilhados:

```css
.stack-xs { gap: var(--space-2); } /* 8px */
.stack-sm { gap: var(--space-4); } /* 16px */
.stack-md { gap: var(--space-6); } /* 24px */
.stack-lg { gap: var(--space-8); } /* 32px */
.stack-xl { gap: var(--space-12); } /* 48px */
```

### Horizontal Spacing (Inline)
Espaçamento horizontal entre elementos em linha:

```css
.inline-xs { gap: var(--space-2); } /* 8px */
.inline-sm { gap: var(--space-4); } /* 16px */
.inline-md { gap: var(--space-6); } /* 24px */
.inline-lg { gap: var(--space-8); } /* 32px */
```

## 🎯 Inset (Padding Uniforme)

```css
.inset-xs { padding: var(--space-2); }  /* 8px */
.inset-sm { padding: var(--space-4); }  /* 16px */
.inset-md { padding: var(--space-6); }  /* 24px */
.inset-lg { padding: var(--space-8); }  /* 32px */
.inset-xl { padding: var(--space-12); } /* 48px */
```

## ✅ Boas Práticas

### Fazer
- Usar múltiplos de 4px para todos os espaçamentos
- Manter consistência em componentes similares
- Aumentar espaçamento em telas maiores
- Usar tokens semânticos em vez de valores fixos
- Agrupar elementos relacionados com gap menor

### Evitar
- Valores quebrados (não múltiplos de 4)
- Espaçamentos aleatórios sem padrão
- Padding muito apertado em mobile
- Gap muito grande entre elementos relacionados
- Misturar margin e padding desnecessariamente

## 🔧 Implementação

### CSS Variables
```css
:root {
  --space-base: 4px;
  --space-unit: var(--space-base);
}
```

### Tailwind Config
```js
spacing: {
  '0': '0px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
  '20': '80px',
  '24': '96px',
  '32': '128px',
  '40': '160px',
  '48': '192px',
  '64': '256px',
}
```

## 🧮 Calculadora Mental Rápida

Para calcular espaçamento rapidamente:
- **4px = 1 unidade** (space-1)
- **8px = 2 unidades** (space-2)
- **16px = 4 unidades** (space-4)
- **24px = 6 unidades** (space-6)
- **32px = 8 unidades** (space-8)
- **48px = 12 unidades** (space-12)
- **64px = 16 unidades** (space-16)
