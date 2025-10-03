# Iconografia TalentBase

## Princípios

Nosso sistema de ícones segue princípios de clareza, consistência e simplicidade:

- **Grid Base:** 24×24px
- **Stroke Width:** 2px (padrão), 1.5px (thin), 2.5px (bold)
- **Cantos:** Arredondados (2px radius)
- **Estilo:** Outline (padrão), Filled (variações)

---

## Categorias de Ícones

### Navigation
- Home
- Search
- Menu
- Close
- Arrow (Up, Down, Left, Right)
- Chevron (Up, Down, Left, Right)

### Actions
- Plus / Add
- Edit / Pencil
- Delete / Trash
- Download
- Upload
- Share
- Copy
- Check / Checkmark
- X / Close
- Settings / Gear

### User & Profile
- User
- User Circle
- Users / Team
- User Plus
- User Minus
- Heart (Favoritar)
- Star (Avaliar)
- Badge / Shield (Verificado)

### Communication
- Mail
- Bell (Notificações)
- Chat / Message
- Phone
- Video

### Business / Recruitment
- Briefcase (Vaga)
- Building (Empresa)
- Certificate (Certificação)
- Award (Conquista)
- Target (Objetivo)
- Chart / Analytics
- Calendar
- Clock / Time
- Location / Pin

### Files & Data
- Document
- Folder
- File
- Image
- Attachment / Clip
- Filter
- Sort

### Status
- Info
- Alert / Warning
- Error
- Success / Check Circle
- Question / Help

---

## Tamanhos

| Tamanho | Dimensões | Uso |
|---------|-----------|-----|
| XS | 16×16px | Inline text, badges |
| SM | 20×20px | Botões pequenos, tags |
| MD | 24×24px | Padrão (UI geral) |
| LG | 32×32px | Botões maiores, headers |
| XL | 48×48px | Features, empty states |

---

## Cores

Os ícones devem usar as cores do design system:

```css
/* Padrão */
color: var(--color-gray-700);  /* #374151 */

/* Hover/Active */
color: var(--color-primary-500);  /* #00B8D4 */

/* Disabled */
color: var(--color-gray-400);  /* #9CA3AF */

/* On Dark Background */
color: var(--color-gray-50);  /* #F9FAFB */
```

---

## Implementação

### React Component

```tsx
import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const Icon = ({
  size = 24,
  className = '',
  ...props
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Icon paths here */}
  </svg>
);
```

### Uso

```tsx
<Icon size={20} className="text-primary-500" />
```

---

## Biblioteca de Ícones

Para manter consistência, usamos [Lucide Icons](https://lucide.dev/) como base, aplicando customizações quando necessário.

**Instalação:**
```bash
npm install lucide-react
```

**Exemplo de uso:**
```tsx
import { Search, User, Briefcase } from 'lucide-react';

<Search size={24} className="text-gray-700" />
<User size={20} />
<Briefcase size={24} strokeWidth={2.5} />
```

---

## Ícones Customizados

Para ícones específicos da TalentBase (que não existem em bibliotecas):

### Verified Badge (Candidato Verificado)
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>
```

### Skill Tag
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>
```

---

## Guidelines de Uso

### ✅ Fazer
- Usar ícones para ações claras e reconhecíveis
- Manter consistência de tamanho em contextos similares
- Sempre incluir label/tooltip para acessibilidade
- Usar a cor adequada ao contexto (success, error, etc.)

### ❌ Não Fazer
- Misturar estilos diferentes (outline + filled)
- Usar ícones decorativos sem significado
- Omitir labels em ações importantes
- Usar tamanhos menores que 16px

---

## Acessibilidade

```tsx
// Com aria-label
<Search aria-label="Buscar candidatos" />

// Decorativo (esconder de screen readers)
<Star aria-hidden="true" />

// Com texto visível
<button>
  <Search aria-hidden="true" />
  <span>Buscar</span>
</button>
```
