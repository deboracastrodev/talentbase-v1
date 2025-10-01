# Elevation - Elevação e Sombras

Sistema de elevação da TalentBase para criar profundidade e hierarquia visual através de sombras.

## 🎨 Sistema de Elevação

Sistema baseado em 5 níveis de elevação, do mais baixo ao mais alto:

```css
--elevation-0: none;
--elevation-1: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--elevation-2: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--elevation-3: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--elevation-4: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--elevation-5: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--elevation-6: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

## 📊 Níveis de Elevação

### Level 0 - Flat
```css
box-shadow: none;
```
**Uso:** Elementos sem elevação, backgrounds planos

### Level 1 - Subtle
```css
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
```
**Uso:**
- Separadores sutis
- Inputs em estado normal
- Badges e tags

### Level 2 - Low
```css
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
```
**Uso:**
- Cards em estado normal
- Dropdowns
- Tooltips simples

### Level 3 - Medium
```css
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
```
**Uso:**
- Botões elevados
- Cards em hover
- Headers fixos
- Navigation bars

### Level 4 - High
```css
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
```
**Uso:**
- Modais
- Popovers
- Drawers
- Floating action buttons

### Level 5 - Very High
```css
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
```
**Uso:**
- Modais importantes
- Overlays críticos
- Notifications

### Level 6 - Maximum
```css
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```
**Uso:**
- Hero cards
- Featured content
- Marketing CTAs

## 🌓 Sombras em Background Escuro

Para elementos sobre fundo escuro (como na landing page):

```css
--elevation-dark-1: 0 1px 2px 0 rgba(255, 255, 255, 0.05);
--elevation-dark-2: 0 1px 3px 0 rgba(255, 255, 255, 0.1), 0 1px 2px -1px rgba(255, 255, 255, 0.1);
--elevation-dark-3: 0 4px 6px -1px rgba(255, 255, 255, 0.15), 0 2px 4px -2px rgba(255, 255, 255, 0.15);
--elevation-dark-4: 0 10px 15px -3px rgba(0, 184, 212, 0.3), 0 4px 6px -4px rgba(0, 184, 212, 0.2);
```

**Nota:** Sombras em backgrounds escuros podem usar a cor primary com opacity para criar um glow effect.

## ✨ Inner Shadow (Inset)

Para criar profundidade invertida:

```css
--elevation-inset-1: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
--elevation-inset-2: inset 0 2px 4px 0 rgba(0, 0, 0, 0.1);
```

**Uso:**
- Inputs focados
- Pressed buttons
- Wells e depressões

## 🎯 Estados Interativos

### Hover States
```css
/* Card Hover */
.card {
  box-shadow: var(--elevation-2);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--elevation-3);
}

/* Button Hover */
.btn {
  box-shadow: var(--elevation-1);
}

.btn:hover {
  box-shadow: var(--elevation-2);
}
```

### Active States
```css
.btn:active {
  box-shadow: var(--elevation-inset-1);
  transform: translateY(1px);
}
```

### Focus States
```css
.input:focus {
  box-shadow: 0 0 0 3px rgba(0, 184, 212, 0.1);
  outline: none;
}
```

## 🎨 Glow Effects

Para elementos de destaque (como botões primary na landing page):

```css
/* Primary Glow */
--glow-primary: 0 0 20px rgba(0, 184, 212, 0.3);
--glow-primary-strong: 0 0 30px rgba(0, 184, 212, 0.5);

/* Success Glow */
--glow-success: 0 0 20px rgba(16, 185, 129, 0.3);

/* Error Glow */
--glow-error: 0 0 20px rgba(239, 68, 68, 0.3);
```

**Uso:**
```css
.btn-primary:hover {
  box-shadow: var(--elevation-2), var(--glow-primary);
}
```

## 📐 Overlay Shadows

Para modais e overlays:

```css
/* Backdrop */
.backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* Modal com sombra forte */
.modal {
  box-shadow: var(--elevation-5);
}

/* Drawer lateral */
.drawer {
  box-shadow: -10px 0 25px -5px rgba(0, 0, 0, 0.1);
}
```

## 🎨 Aplicações na Landing Page

### Cards de Vaga
```css
.job-card {
  background: white;
  border-radius: 12px;
  box-shadow: var(--elevation-2);
  transition: all 0.2s ease;
}

.job-card:hover {
  box-shadow: var(--elevation-3);
  transform: translateY(-2px);
}
```

### Botão CTA Principal
```css
.cta-button {
  background: white;
  box-shadow: var(--elevation-2);
  transition: all 0.3s ease;
}

.cta-button:hover {
  box-shadow: var(--elevation-3), var(--glow-primary);
  transform: scale(1.02);
}
```

### Perfil Card (Background Escuro)
```css
.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: var(--elevation-4);
}
```

## ✅ Boas Práticas

### Fazer
- Usar elevação para criar hierarquia visual
- Incrementar sombra em hover (1 nível acima)
- Combinar com transições suaves (0.2s - 0.3s)
- Usar sombras sutis em backgrounds claros
- Aplicar glow em CTAs importantes

### Evitar
- Pular níveis de elevação (ex: 1 → 5)
- Sombras muito pesadas em elementos pequenos
- Múltiplas sombras complexas no mesmo layout
- Sombras em textos (usar text-shadow separado)
- Elevation em elementos que não precisam destaque

## 🔧 Implementação

### CSS Variables
```css
:root {
  /* Light backgrounds */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* Focus */
  --shadow-focus: 0 0 0 3px rgba(0, 184, 212, 0.1);

  /* Inner */
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}
```

### Tailwind Config
```js
boxShadow: {
  'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  'glow-primary': '0 0 20px rgba(0, 184, 212, 0.3)',
}
```

## 📊 Tabela de Referência Rápida

| Level | Nome | Blur | Uso Principal |
|-------|------|------|---------------|
| 0 | Flat | 0px | Sem elevação |
| 1 | Subtle | 2px | Badges, inputs |
| 2 | Low | 3px | Cards padrão |
| 3 | Medium | 6px | Hover states, navbars |
| 4 | High | 15px | Modais, FABs |
| 5 | Very High | 25px | Overlays importantes |
| 6 | Maximum | 50px | Hero elements |
