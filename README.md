# @talentbase/design-system

> Sistema de Design da TalentBase - Componentes React com Tailwind CSS

## 🎨 Visão Geral

Design system oficial da TalentBase, baseado na landing page e otimizado para React com Tailwind CSS.

## 🚀 Quick Start

### Instalação

```bash
npm install @talentbase/design-system
```

### Uso

```tsx
import { Button } from '@talentbase/design-system';

function App() {
  return (
    <Button variant="default">
      Quero meu headhunter pessoal
    </Button>
  );
}
```

## 📦 Componentes Disponíveis

### Button
Componente de botão com múltiplas variantes.

**Variantes:**
- `default` - Botão primário (ciano)
- `secondary` - Botão secundário (azul)
- `outline` - Botão com borda
- `ghost` - Botão transparente
- `destructive` - Botão de ação destrutiva
- `link` - Estilo de link

**Tamanhos:**
- `sm` - Pequeno
- `default` - Padrão
- `lg` - Grande
- `icon` - Ícone (quadrado)

**Exemplo:**
```tsx
<Button variant="default" size="lg">
  Button Large
</Button>

<Button variant="outline">
  Button Outline
</Button>

<Button variant="ghost" size="sm">
  Small Ghost
</Button>
```

## 🎨 Design Tokens

### Cores

#### Primary (Ciano)
```css
--color-primary-500: #00B8D4  /* Cor principal */
--color-primary-600: #00ACC1  /* Hover */
```

#### Secondary (Azul)
```css
--color-secondary-500: #1E3A8A  /* Cor secundária */
--color-secondary-600: #1E40AF  /* Hover */
```

### Tipografia
```css
font-family: 'Inter', system-ui, sans-serif
```

### Espaçamentos (Base-4)
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px...
```

### Border Radius
```
sm: 4px, md: 8px, lg: 12px, xl: 16px, full: 9999px
```

## 🛠️ Desenvolvimento

### Rodar Storybook

```bash
cd packages/design-system
npm run dev
```

Acesse: http://localhost:6006

### Build

```bash
npm run build
```

### Build Storybook (Deploy)

```bash
npm run build-storybook
```

## 📚 Documentação Completa

A documentação completa do design system está em `/docs/design-system/`:

- [Colors](../../docs/design-system/foundations/colors.md)
- [Typography](../../docs/design-system/foundations/typography.md)
- [Spacing](../../docs/design-system/foundations/spacing.md)
- [Grid](../../docs/design-system/foundations/grid.md)
- [Elevation](../../docs/design-system/foundations/elevation.md)
- [Border Radius](../../docs/design-system/foundations/border-radius.md)

## 🎯 Stack Técnica

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Tailwind CSS 3** - Utility-first CSS
- **Storybook 8** - Component development
- **class-variance-authority** - Variant management
- **clsx + tailwind-merge** - ClassName utilities

## 📝 Roadmap

- [x] Button component
- [ ] Card component
- [ ] Input component
- [ ] Badge component
- [ ] Modal component
- [ ] Form components
- [ ] Navigation components
- [ ] GitHub Pages deployment

## 📄 Licença

MIT © TalentBase
