# Border Radius - Arredondamento de Bordas

Sistema de border radius da TalentBase para criar elementos com cantos arredondados e suaves.

## 📐 Scale de Border Radius

Sistema baseado em múltiplos consistentes:

```css
--radius-none: 0px;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-3xl: 32px;
--radius-full: 9999px;
```

## 🎯 Níveis e Uso

### None (0px)
```css
border-radius: 0px;
```
**Uso:**
- Elementos sem arredondamento
- Borders/dividers
- Grid cells

### Small (4px)
```css
border-radius: 4px;
```
**Uso:**
- Badges pequenos
- Tags
- Chips
- Botões small

### Medium (8px) - **Padrão**
```css
border-radius: 8px;
```
**Uso:**
- Botões padrão
- Inputs
- Selects
- Pequenos cards

### Large (12px)
```css
border-radius: 12px;
```
**Uso:**
- Cards principais
- Modais
- Popovers
- Imagens de perfil pequenas

### Extra Large (16px)
```css
border-radius: 16px;
```
**Uso:**
- Cards grandes
- Hero cards
- Featured content
- Containers principais

### 2XL (24px)
```css
border-radius: 24px;
```
**Uso:**
- Seções destacadas
- Hero sections com imagem
- Cards muito grandes
- Containers especiais

### 3XL (32px)
```css
border-radius: 32px;
```
**Uso:**
- Elementos de marketing
- Illustrations containers
- Seções fullwidth com destaque

### Full (Circular)
```css
border-radius: 9999px;
```
**Uso:**
- Avatares
- Badges circulares
- Botões circular/pill
- Loading spinners

## 🎨 Aplicações na Landing Page

### Botão CTA Principal
```css
.cta-button {
  border-radius: var(--radius-full); /* Pill shape */
  padding: 12px 24px;
}
```

### Cards de Vaga
```css
.job-card {
  border-radius: var(--radius-lg); /* 12px */
}
```

### Perfil Card (Background Escuro)
```css
.profile-card {
  border-radius: var(--radius-xl); /* 16px */
}
```

### Inputs do Formulário
```css
.form-input {
  border-radius: var(--radius-md); /* 8px */
}
```

### Avatar/Foto de Perfil
```css
.avatar {
  border-radius: var(--radius-full); /* Circular */
}
```

### Badges de Status
```css
.badge {
  border-radius: var(--radius-sm); /* 4px */
}

.badge-pill {
  border-radius: var(--radius-full); /* Pill */
}
```

## 🎯 Partial Radius

Arredondamento seletivo de cantos:

### Top Corners
```css
.radius-top-lg {
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
}
```
**Uso:** Headers de cards, modais

### Bottom Corners
```css
.radius-bottom-lg {
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}
```
**Uso:** Footers de cards, dropdowns

### Left Corners
```css
.radius-left-lg {
  border-top-left-radius: var(--radius-lg);
  border-bottom-left-radius: var(--radius-lg);
}
```
**Uso:** Início de grupos, tabs

### Right Corners
```css
.radius-right-lg {
  border-top-right-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}
```
**Uso:** Fim de grupos, tabs

### Individual Corners
```css
.radius-tl-lg { border-top-left-radius: var(--radius-lg); }
.radius-tr-lg { border-top-right-radius: var(--radius-lg); }
.radius-bl-lg { border-bottom-left-radius: var(--radius-lg); }
.radius-br-lg { border-bottom-right-radius: var(--radius-lg); }
```

## 📊 Componentes por Tamanho

### Buttons
```css
.btn-sm { border-radius: var(--radius-sm); }   /* 4px */
.btn-md { border-radius: var(--radius-md); }   /* 8px - padrão */
.btn-lg { border-radius: var(--radius-lg); }   /* 12px */
.btn-pill { border-radius: var(--radius-full); } /* Pill */
```

### Cards
```css
.card-sm { border-radius: var(--radius-md); }  /* 8px */
.card-md { border-radius: var(--radius-lg); }  /* 12px - padrão */
.card-lg { border-radius: var(--radius-xl); }  /* 16px */
.card-xl { border-radius: var(--radius-2xl); } /* 24px */
```

### Inputs
```css
.input { border-radius: var(--radius-md); }      /* 8px - padrão */
.input-rounded { border-radius: var(--radius-lg); } /* 12px */
.input-pill { border-radius: var(--radius-full); }  /* Pill */
```

### Images
```css
.img-rounded { border-radius: var(--radius-md); }   /* 8px */
.img-rounded-lg { border-radius: var(--radius-lg); }  /* 12px */
.img-circle { border-radius: var(--radius-full); }    /* Circle */
```

### Modals & Overlays
```css
.modal { border-radius: var(--radius-xl); }       /* 16px */
.drawer { border-radius: 0; }                      /* No radius */
.popover { border-radius: var(--radius-lg); }     /* 12px */
.tooltip { border-radius: var(--radius-md); }     /* 8px */
```

## 🎨 Combinações com Outros Elementos

### Card com Image Header
```css
.card {
  border-radius: var(--radius-lg);
  overflow: hidden; /* Importante! */
}

.card-image {
  border-radius: 0; /* Herda do container */
}
```

### Button Group
```css
.btn-group .btn:first-child {
  border-top-left-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-md);
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-group .btn:last-child {
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.btn-group .btn:not(:first-child):not(:last-child) {
  border-radius: 0;
}
```

### Input with Icon
```css
.input-group {
  border-radius: var(--radius-md);
  overflow: hidden;
}

.input-group input {
  border-radius: 0;
}

.input-group .icon {
  border-top-left-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-md);
}
```

## ✨ Efeitos Especiais

### Soft Blob Effect
Para elementos orgânicos:
```css
.blob {
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
}
```

### Squircle (iOS Style)
Arredondamento suave tipo Apple:
```css
.squircle {
  border-radius: 20%;
  /* Ou usar clip-path para maior precisão */
}
```

## 📱 Responsive Radius

Ajustar border radius em diferentes telas:

```css
.card {
  border-radius: var(--radius-md); /* 8px mobile */
}

@media (min-width: 768px) {
  .card {
    border-radius: var(--radius-lg); /* 12px tablet */
  }
}

@media (min-width: 1024px) {
  .card {
    border-radius: var(--radius-xl); /* 16px desktop */
  }
}
```

## ✅ Boas Práticas

### Fazer
- Usar `overflow: hidden` em containers com imagens
- Manter consistência: mesmo tipo de componente = mesmo radius
- Aumentar radius proporcionalmente ao tamanho do elemento
- Usar `radius-full` para avatares e pills
- Combinar com padding adequado (mínimo 8px interno)

### Evitar
- Border radius muito grande em elementos pequenos
- Misturar radiuses muito diferentes no mesmo componente
- Border radius em apenas um canto sem razão clara
- Valores customizados fora da escala (ex: 7px, 15px)
- Border radius em elementos que precisam alinhar perfeitamente

## 🔧 Implementação

### CSS Variables
```css
:root {
  --radius-base: 8px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-3xl: 32px;
  --radius-full: 9999px;
}
```

### Utility Classes
```css
.rounded-none { border-radius: 0; }
.rounded-sm { border-radius: var(--radius-sm); }
.rounded { border-radius: var(--radius-md); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-xl { border-radius: var(--radius-xl); }
.rounded-2xl { border-radius: var(--radius-2xl); }
.rounded-3xl { border-radius: var(--radius-3xl); }
.rounded-full { border-radius: var(--radius-full); }
```

### Tailwind Config
```js
borderRadius: {
  'none': '0',
  'sm': '4px',
  'DEFAULT': '8px',
  'md': '8px',
  'lg': '12px',
  'xl': '16px',
  '2xl': '24px',
  '3xl': '32px',
  'full': '9999px',
}
```

## 📊 Tabela de Referência Rápida

| Token | Valor | Uso Principal |
|-------|-------|---------------|
| none | 0px | Sem arredondamento |
| sm | 4px | Badges, tags |
| md | 8px | Botões, inputs (padrão) |
| lg | 12px | Cards padrão |
| xl | 16px | Cards grandes |
| 2xl | 24px | Seções destacadas |
| 3xl | 32px | Hero sections |
| full | 9999px | Avatares, pills |
