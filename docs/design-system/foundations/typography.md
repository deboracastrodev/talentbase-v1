# Typography - Tipografia

Sistema tipográfico da TalentBase baseado em fontes modernas e legíveis, extraído da landing page.

## 🔤 Font Family

### Primary Font
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

**Fallback Stack:** Sistema operacional nativo → Web-safe fonts

### Como Importar

#### Google Fonts
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

#### CSS @import
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
```

## 📏 Type Scale

Sistema de escala tipográfica baseado em proporção harmônica (1.250 - Major Third).

### Display Styles
Usados em heros e títulos principais:

```css
/* Display XL */
--font-display-xl-size: 72px;
--font-display-xl-height: 90px;
--font-display-xl-weight: 800;
--font-display-xl-spacing: -0.02em;

/* Display LG */
--font-display-lg-size: 60px;
--font-display-lg-height: 72px;
--font-display-lg-weight: 800;
--font-display-lg-spacing: -0.02em;

/* Display MD */
--font-display-md-size: 48px;
--font-display-md-height: 60px;
--font-display-md-weight: 700;
--font-display-md-spacing: -0.01em;

/* Display SM */
--font-display-sm-size: 36px;
--font-display-sm-height: 44px;
--font-display-sm-weight: 700;
--font-display-sm-spacing: -0.01em;
```

### Heading Styles
Usados em títulos de seções e componentes:

```css
/* Heading XL (H1) */
--font-h1-size: 30px;
--font-h1-height: 38px;
--font-h1-weight: 700;
--font-h1-spacing: -0.01em;

/* Heading LG (H2) */
--font-h2-size: 24px;
--font-h2-height: 32px;
--font-h2-weight: 700;
--font-h2-spacing: 0;

/* Heading MD (H3) */
--font-h3-size: 20px;
--font-h3-height: 28px;
--font-h3-weight: 600;
--font-h3-spacing: 0;

/* Heading SM (H4) */
--font-h4-size: 18px;
--font-h4-height: 28px;
--font-h4-weight: 600;
--font-h4-spacing: 0;

/* Heading XS (H5) */
--font-h5-size: 16px;
--font-h5-height: 24px;
--font-h5-weight: 600;
--font-h5-spacing: 0;
```

### Body Styles
Usados em textos corridos e parágrafos:

```css
/* Body XL */
--font-body-xl-size: 20px;
--font-body-xl-height: 30px;
--font-body-xl-weight: 400;
--font-body-xl-spacing: 0;

/* Body LG */
--font-body-lg-size: 18px;
--font-body-lg-height: 28px;
--font-body-lg-weight: 400;
--font-body-lg-spacing: 0;

/* Body MD (Base) */
--font-body-md-size: 16px;
--font-body-md-height: 24px;
--font-body-md-weight: 400;
--font-body-md-spacing: 0;

/* Body SM */
--font-body-sm-size: 14px;
--font-body-sm-height: 20px;
--font-body-sm-weight: 400;
--font-body-sm-spacing: 0;

/* Body XS */
--font-body-xs-size: 12px;
--font-body-xs-height: 18px;
--font-body-xs-weight: 400;
--font-body-xs-spacing: 0;
```

### Label & Caption
Usados em labels, badges e textos auxiliares:

```css
/* Label LG */
--font-label-lg-size: 14px;
--font-label-lg-height: 20px;
--font-label-lg-weight: 500;
--font-label-lg-spacing: 0;

/* Label MD */
--font-label-md-size: 12px;
--font-label-md-height: 16px;
--font-label-md-weight: 500;
--font-label-md-spacing: 0;

/* Label SM */
--font-label-sm-size: 11px;
--font-label-sm-height: 16px;
--font-label-sm-weight: 500;
--font-label-sm-spacing: 0.01em;

/* Caption */
--font-caption-size: 12px;
--font-caption-height: 16px;
--font-caption-weight: 400;
--font-caption-spacing: 0;
```

## 📐 Font Weights

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;
```

**Uso Recomendado:**
- **Light (300):** Textos grandes e decorativos
- **Regular (400):** Body text padrão
- **Medium (500):** Labels e botões
- **Semibold (600):** Subtítulos e destaques
- **Bold (700):** Títulos e headings
- **Extrabold (800):** Display e heros
- **Black (900):** Casos especiais (raramente usado)

## 🎯 Aplicações Práticas

### Hero Section
```css
.hero-title {
  font-size: 60px;
  line-height: 72px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 18px;
  line-height: 28px;
  font-weight: 400;
  color: var(--color-gray-400);
}
```

### Card Title
```css
.card-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
}
```

### Button Text
```css
.button-text {
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  letter-spacing: 0.01em;
}
```

### Form Label
```css
.form-label {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: var(--color-gray-700);
}
```

## 📱 Responsive Typography

### Mobile (< 640px)
```css
--font-display-xl-size: 48px;
--font-display-lg-size: 40px;
--font-h1-size: 24px;
--font-h2-size: 20px;
```

### Tablet (640px - 1024px)
```css
--font-display-xl-size: 60px;
--font-display-lg-size: 48px;
--font-h1-size: 28px;
--font-h2-size: 22px;
```

### Desktop (> 1024px)
Usar valores padrão definidos acima.

## 🎨 Text Colors

Baseadas na paleta de cores:

```css
/* Primary Text */
--text-primary: var(--color-gray-900);
--text-secondary: var(--color-gray-600);
--text-tertiary: var(--color-gray-500);
--text-disabled: var(--color-gray-400);

/* Inverse (em backgrounds escuros) */
--text-inverse-primary: var(--color-white);
--text-inverse-secondary: var(--color-gray-300);
--text-inverse-tertiary: var(--color-gray-400);

/* Accent */
--text-accent: var(--color-primary-500);
--text-link: var(--color-primary-500);
```

## 📋 Classes Utilitárias

```css
/* Display */
.text-display-xl { /* aplicar variáveis display-xl */ }
.text-display-lg { /* aplicar variáveis display-lg */ }
.text-display-md { /* aplicar variáveis display-md */ }
.text-display-sm { /* aplicar variáveis display-sm */ }

/* Headings */
.text-h1 { /* aplicar variáveis h1 */ }
.text-h2 { /* aplicar variáveis h2 */ }
.text-h3 { /* aplicar variáveis h3 */ }
.text-h4 { /* aplicar variáveis h4 */ }
.text-h5 { /* aplicar variáveis h5 */ }

/* Body */
.text-body-xl { /* aplicar variáveis body-xl */ }
.text-body-lg { /* aplicar variáveis body-lg */ }
.text-body-md { /* aplicar variáveis body-md */ }
.text-body-sm { /* aplicar variáveis body-sm */ }
.text-body-xs { /* aplicar variáveis body-xs */ }

/* Labels */
.text-label-lg { /* aplicar variáveis label-lg */ }
.text-label-md { /* aplicar variáveis label-md */ }
.text-label-sm { /* aplicar variáveis label-sm */ }
.text-caption { /* aplicar variáveis caption */ }
```

## ✅ Boas Práticas

### Fazer
- Usar Inter como fonte principal
- Manter hierarquia consistente
- Respeitar line-height para legibilidade
- Aplicar letter-spacing em displays grandes
- Usar Medium (500) ou Semibold (600) em botões

### Evitar
- Misturar mais de 3 pesos na mesma tela
- Usar Light (300) em textos pequenos (< 16px)
- Letter-spacing negativo em body text
- Line-height menor que 1.4 em parágrafos
- Texto em caixa alta sem aumentar letter-spacing

## 🔧 Implementação

### CSS Variables
```css
:root {
  --font-primary: 'Inter', sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.5;
}
```

### Tailwind Config
```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
},
fontSize: {
  'display-xl': ['72px', { lineHeight: '90px', letterSpacing: '-0.02em', fontWeight: '800' }],
  // ... outras definições
}
```
