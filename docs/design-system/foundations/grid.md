# Grid System - Sistema de Grid

Sistema de grid responsivo da TalentBase baseado em 12 colunas com breakpoints bem definidos.

## 📐 Estrutura Base

### 12-Column Grid
Sistema flexível de 12 colunas que permite layouts variados:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6); /* 24px */
}
```

**Vantagens:**
- Divisível por 2, 3, 4, 6 (layouts flexíveis)
- Padrão da indústria
- Fácil de implementar layouts complexos

## 📱 Breakpoints

```css
/* Mobile First Approach */
--breakpoint-xs: 0px;      /* Mobile portrait */
--breakpoint-sm: 640px;    /* Mobile landscape */
--breakpoint-md: 768px;    /* Tablet portrait */
--breakpoint-lg: 1024px;   /* Tablet landscape / Desktop small */
--breakpoint-xl: 1280px;   /* Desktop */
--breakpoint-2xl: 1536px;  /* Desktop large */
```

### Media Queries
```css
/* Small devices (landscape phones) */
@media (min-width: 640px) { }

/* Medium devices (tablets) */
@media (min-width: 768px) { }

/* Large devices (desktops) */
@media (min-width: 1024px) { }

/* Extra large devices (large desktops) */
@media (min-width: 1280px) { }

/* 2X large devices */
@media (min-width: 1536px) { }
```

## 📦 Container

### Max Width Container
```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

/* Breakpoint Specific */
@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
  }
}
```

### Full Width Container
```css
.container-fluid {
  width: 100%;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}
```

## 🎯 Column Spans

### Desktop (12 columns)
```css
.col-1  { grid-column: span 1; }
.col-2  { grid-column: span 2; }
.col-3  { grid-column: span 3; }
.col-4  { grid-column: span 4; }
.col-5  { grid-column: span 5; }
.col-6  { grid-column: span 6; }
.col-7  { grid-column: span 7; }
.col-8  { grid-column: span 8; }
.col-9  { grid-column: span 9; }
.col-10 { grid-column: span 10; }
.col-11 { grid-column: span 11; }
.col-12 { grid-column: span 12; }
```

### Responsive Prefixes
```css
/* Mobile (padrão - sem prefixo) */
.col-12 { grid-column: span 12; }

/* Tablet */
@media (min-width: 768px) {
  .md\:col-6 { grid-column: span 6; }
}

/* Desktop */
@media (min-width: 1024px) {
  .lg\:col-4 { grid-column: span 4; }
}
```

## 📏 Gap (Gutters)

Espaçamento entre colunas:

```css
.gap-0  { gap: 0; }
.gap-2  { gap: var(--space-2); }   /* 8px */
.gap-4  { gap: var(--space-4); }   /* 16px */
.gap-6  { gap: var(--space-6); }   /* 24px - Padrão */
.gap-8  { gap: var(--space-8); }   /* 32px */
.gap-12 { gap: var(--space-12); }  /* 48px */
```

### Directional Gap
```css
.gap-x-6 { column-gap: var(--space-6); }
.gap-y-6 { row-gap: var(--space-6); }
```

## 🎨 Layout Patterns

### Two Column Layout
```css
/* Mobile: 1 column */
/* Desktop: 2 columns */
.grid-2-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .grid-2-col {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Three Column Layout
```css
/* Mobile: 1 column */
/* Tablet: 2 columns */
/* Desktop: 3 columns */
.grid-3-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 640px) {
  .grid-3-col {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-3-col {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Four Column Layout
```css
/* Mobile: 1 column */
/* Tablet: 2 columns */
/* Desktop: 4 columns */
.grid-4-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 640px) {
  .grid-4-col {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-4-col {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Sidebar Layout (Asymmetric)
```css
/* Mobile: Stack */
/* Desktop: Sidebar + Content (1:3 ratio) */
.grid-sidebar {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 1024px) {
  .grid-sidebar {
    grid-template-columns: 1fr 3fr;
    gap: var(--space-8);
  }
}
```

### Dashboard Layout (2:1 ratio)
```css
@media (min-width: 1024px) {
  .grid-dashboard {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--space-6);
  }
}
```

## 🎯 Casos de Uso na Landing Page

### Hero Section
```css
/* Full width com container interno */
.hero {
  width: 100%;
  padding: var(--space-16) 0;
}

.hero .container {
  display: grid;
  grid-template-columns: 1fr;
  text-align: center;
}
```

### Cards de Vagas
```css
/* Grid de cards responsivo */
.jobs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .jobs-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .jobs-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Form Layout
```css
/* Form com campos lado a lado no desktop */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

/* Campo full width */
.form-grid .full-width {
  grid-column: 1 / -1;
}
```

## 📐 Auto-Fit & Auto-Fill

Para grids dinâmicos:

```css
/* Cards que se ajustam automaticamente */
.grid-auto-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

/* Mantém número de colunas mesmo com menos items */
.grid-auto-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}
```

## 🎨 Nested Grids

Grids dentro de grids:

```css
.outer-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

.nested-container {
  grid-column: span 8;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--space-4);
}
```

## ✅ Boas Práticas

### Fazer
- Usar mobile-first approach (do menor para maior)
- Manter gaps consistentes (múltiplos de 4)
- Testar em todos os breakpoints
- Usar auto-fit/auto-fill para grids dinâmicos
- Centralizar containers com max-width

### Evitar
- Layout fixo sem responsividade
- Gaps muito pequenos em mobile (< 16px)
- Muitos breakpoints customizados
- Grid com mais de 12 colunas
- Nested grids profundos (> 2 níveis)

## 🔧 Implementação

### CSS Grid Utility Classes
```css
/* Display */
.grid { display: grid; }
.inline-grid { display: inline-grid; }

/* Template Columns */
.grid-cols-1  { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2  { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3  { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4  { grid-template-columns: repeat(4, 1fr); }
.grid-cols-6  { grid-template-columns: repeat(6, 1fr); }
.grid-cols-12 { grid-template-columns: repeat(12, 1fr); }

/* Column Span */
.col-span-full { grid-column: 1 / -1; }
```

### Tailwind Config
```js
gridTemplateColumns: {
  '12': 'repeat(12, minmax(0, 1fr))',
},
gap: {
  '6': '24px',
}
```
