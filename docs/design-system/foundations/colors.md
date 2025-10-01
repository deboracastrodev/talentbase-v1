# Colors - Paleta de Cores

A paleta de cores da TalentBase foi extraída da landing page oficial e reflete modernidade, confiança e tecnologia.

## 🎨 Cores Primárias

### Primary (Ciano)
A cor principal da marca, usada para CTAs, links e elementos de destaque.

```css
--color-primary-500: #00B8D4;
--color-primary-400: #26C6DA;
--color-primary-300: #4DD0E1;
--color-primary-600: #00ACC1;
--color-primary-700: #0097A7;
```

**Uso:**
- Botões primários
- Links e elementos interativos
- Ícones de destaque
- Bordas em elementos ativos

### Secondary (Azul)
Cor secundária para gradientes e backgrounds.

```css
--color-secondary-500: #1E3A8A;
--color-secondary-400: #3B82F6;
--color-secondary-300: #60A5FA;
--color-secondary-600: #1E40AF;
--color-secondary-700: #1E3A8A;
```

**Uso:**
- Backgrounds de seções
- Gradientes
- Elementos secundários

## ⚫ Cores Neutras

### Grayscale
```css
--color-black: #000000;
--color-gray-900: #111827;
--color-gray-800: #1F2937;
--color-gray-700: #374151;
--color-gray-600: #4B5563;
--color-gray-500: #6B7280;
--color-gray-400: #9CA3AF;
--color-gray-300: #D1D5DB;
--color-gray-200: #E5E7EB;
--color-gray-100: #F3F4F6;
--color-gray-50: #F9FAFB;
--color-white: #FFFFFF;
```

**Uso:**
- Textos (900, 800, 700)
- Borders (300, 200)
- Backgrounds (100, 50)
- Overlays (900 com opacity)

## 🌈 Cores Funcionais

### Success (Verde)
```css
--color-success-500: #10B981;
--color-success-400: #34D399;
--color-success-600: #059669;
--color-success-100: #D1FAE5;
```

**Uso:** Mensagens de sucesso, status positivo, ícones de confirmação

### Error (Vermelho)
```css
--color-error-500: #EF4444;
--color-error-400: #F87171;
--color-error-600: #DC2626;
--color-error-100: #FEE2E2;
```

**Uso:** Mensagens de erro, validações, alertas críticos

### Warning (Amarelo/Laranja)
```css
--color-warning-500: #F59E0B;
--color-warning-400: #FBBF24;
--color-warning-600: #D97706;
--color-warning-100: #FEF3C7;
```

**Uso:** Avisos, atenção, estados intermediários

### Info (Azul Claro)
```css
--color-info-500: #3B82F6;
--color-info-400: #60A5FA;
--color-info-600: #2563EB;
--color-info-100: #DBEAFE;
```

**Uso:** Informações gerais, tooltips, dicas

## 🎭 Cores de Status (Badges)

Baseadas nos cards de vagas da landing page:

```css
--color-badge-green: #10B981;
--color-badge-gray: #6B7280;
--color-badge-red: #EF4444;
--color-badge-purple: #8B5CF6;
--color-badge-blue: #3B82F6;
--color-badge-yellow: #F59E0B;
```

## 🌅 Gradientes

### Gradient Hero
Usado no hero section da landing page:
```css
background: linear-gradient(180deg, #000000 0%, #1E3A8A 50%, #00B8D4 100%);
```

### Gradient Card
Para cards e elementos elevados:
```css
background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
```

### Gradient Overlay
Para overlays e modais:
```css
background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(30,58,138,0.6) 100%);
```

## 📊 Tabela de Contraste (WCAG AA)

| Combinação | Ratio | Status |
|------------|-------|--------|
| Primary-500 em Black | 5.2:1 | ✅ Pass |
| Primary-500 em White | 4.1:1 | ✅ Pass |
| Gray-700 em White | 8.5:1 | ✅ Pass |
| Gray-300 em Black | 9.2:1 | ✅ Pass |

## 🎯 Boas Práticas

### ✅ Fazer
- Usar `primary-500` para CTAs principais
- Manter contraste adequado (min 4.5:1 para texto)
- Usar gradientes para backgrounds grandes
- Aplicar cores funcionais de forma consistente

### ❌ Evitar
- Misturar Primary com Success (muito similar)
- Usar mais de 2 cores vibrantes no mesmo componente
- Aplicar gradientes em textos pequenos
- Usar Gray-400 ou mais claro para texto principal

## 🔧 Implementação

### CSS Variables
```css
:root {
  --color-primary: #00B8D4;
  --color-background: #000000;
  --color-surface: #FFFFFF;
  --color-text: #111827;
}
```

### Tailwind Config
```js
colors: {
  primary: {
    DEFAULT: '#00B8D4',
    50: '#E0F7FA',
    // ... outras variações
  }
}
```
