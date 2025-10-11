# TalentBase Design System Rules for Figma Integration

This document provides comprehensive guidelines for integrating Figma designs into the TalentBase web application using the Model Context Protocol (MCP).

---

## 1. Design System Structure

### 1.1 Token Definitions

**Location**: `packages/design-system/tailwind.config.js`

The design system uses Tailwind CSS with custom tokens defined in the centralized configuration:

```javascript
// Design tokens are defined in tailwind.config.js
colors: {
  primary: {
    50: '#E0F7FA',
    100: '#B2EBF2',
    200: '#80DEEA',
    300: '#4DD0E1',
    400: '#26C6DA',
    500: '#00B8D4', // Main primary color (cyan)
    600: '#00ACC1',
    700: '#0097A7',
    800: '#00838F',
    900: '#006064',
  },
  secondary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#60A5FA',
    400: '#3B82F6',
    500: '#1E3A8A', // Main secondary color (dark blue)
    600: '#1E40AF',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
}
```

**Key Token Categories**:

1. **Colors**: Primary (cyan), Secondary (dark blue), and all Tailwind defaults
2. **Typography**: Custom display sizes (`display-xl`, `display-lg`, `display-md`, `display-sm`)
3. **Spacing**: Custom scale from 0-64 (4px increments: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256)
4. **Border Radius**: Custom scale (sm: 4px, md: 8px, lg: 12px, xl: 16px, 2xl: 24px, 3xl: 32px)
5. **Shadows**: Standard shadows plus custom `glow-primary` effect
6. **Font Family**: Inter (via Google Fonts or system fonts)

**Token Format**: Tailwind CSS utility classes (no CSS variables or tokens transformation)

**Usage in Figma**: Map Figma color styles to these exact values when converting designs.

### 1.2 Web App Configuration

**Location**: `packages/web/tailwind.config.ts`

The web app extends the design system with custom animations:

```typescript
theme: {
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.6s ease-out',
      'fade-in-up': 'fadeInUp 0.8s ease-out',
      'scale-in': 'scaleIn 0.5s ease-out',
      float: 'float 6s ease-in-out infinite',
    },
  },
}
```

---

## 2. Component Library

### 2.1 Component Location

**Primary Location**: `packages/design-system/src/components/`

**Component Count**: 32 components with full TypeScript support

**Component Categories**:

1. **Form Components**:
   - `Input.tsx` (with `Label`, `FormField` helpers)
   - `Textarea.tsx`
   - `Select.tsx`
   - `Checkbox.tsx`
   - `Radio.tsx`
   - `RadioGroup.tsx`
   - `FileUpload.tsx`

2. **UI Components**:
   - `Button.tsx`
   - `Card.tsx` (with `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`)
   - `Badge.tsx`
   - `Avatar.tsx` (with `AvatarGroup`)
   - `Modal.tsx` (with `ModalHeader`, `ModalBody`, `ModalFooter`)
   - `Alert.tsx`
   - `Toast.tsx` / `ToastProvider.tsx`
   - `Table.tsx` (full table composition)
   - `Timeline.tsx`
   - `ProgressBar.tsx` (with `ProgressBarWithSteps`)
   - `Stepper.tsx`

3. **Layout Components**:
   - `DashboardLayout.tsx`
   - `AuthLayout.tsx`
   - `Navbar.tsx`
   - `Sidebar.tsx`

4. **Domain Components**:
   - `Logo.tsx`
   - `CandidateCard.tsx`
   - `SearchBar.tsx`
   - `VideoPlayer.tsx`
   - `PublicProfileHero.tsx`
   - `AuthCard.tsx`
   - `AuthFormField.tsx`
   - `MultiStepWizard.tsx`

### 2.2 Component Architecture

**Pattern**: Class Variance Authority (CVA) + forwardRef pattern

**Example** (`Button.tsx`):

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white shadow hover:bg-primary-600',
        destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
        outline: 'border border-primary-500 text-primary-500 bg-transparent shadow-sm hover:bg-primary-50',
        secondary: 'bg-secondary-500 text-white shadow-sm hover:bg-secondary-600',
        ghost: 'hover:bg-primary-50 hover:text-primary-700',
        link: 'text-primary-500 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

**Key Principles**:

- All components use `cn()` utility for class merging
- Export both component and variant helpers
- Use TypeScript for full type safety
- Follow React `forwardRef` pattern for ref forwarding
- Export TypeScript types for all props

### 2.3 Component Documentation

**Storybook**: Available at `packages/design-system/src/stories/`

- All components have corresponding `.stories.tsx` files
- Run with: `npm run dev` (runs Storybook on port 6006)
- Build: `npm run build-storybook`

---

## 3. Frameworks & Libraries

### 3.1 Core Framework Stack

| Technology       | Version   | Purpose                                                 |
| ---------------- | --------- | ------------------------------------------------------- |
| **Remix**        | `^2.14.0` | Full-stack React framework (SSR, routing, data loading) |
| **React**        | `^18.2.0` | UI library                                              |
| **Vite**         | `^5.1.0`  | Build tool and dev server                               |
| **TypeScript**   | `^5.1.6`  | Type safety                                             |
| **Tailwind CSS** | `^3.4.18` | Styling framework                                       |

### 3.2 Styling Libraries

| Library                      | Version    | Purpose                       |
| ---------------------------- | ---------- | ----------------------------- |
| **class-variance-authority** | `^0.7.1`   | Component variant management  |
| **clsx**                     | `^2.1.1`   | Conditional class composition |
| **tailwind-merge**           | `^3.3.1`   | Tailwind class deduplication  |
| **lucide-react**             | `^0.544.0` | Icon library                  |

### 3.3 State Management & Data Fetching

| Library                            | Version   | Purpose                                         |
| ---------------------------------- | --------- | ----------------------------------------------- |
| **@tanstack/react-query**          | `^5.90.2` | Server state management, caching, SSR hydration |
| **@tanstack/react-query-devtools** | `^5.90.2` | Dev tools for React Query                       |

**Important**: React Query is configured with SSR best practices. See `REACT_QUERY_SSR_GUIDE.md` for details.

### 3.4 Build System

**Bundler**: Vite 5 with Remix plugin

**Configuration**: `vite.config.ts`

```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
});
```

**Design System Build**: Uses `tsup` for bundling (`tsup.config.ts`)

---

## 4. Asset Management

### 4.1 Asset Storage

**Web App Assets**:

- Local assets: `packages/web/app/assets/`
- Public assets: `packages/web/public/`

**Design System Assets**:

- `packages/design-system/public/`

### 4.2 Logo System

**Location**: `packages/web/public/logos/`

**Available Variants**:

```
logo-full-dark.svg       // Full logo with dark text
logo-full-primary.svg    // Full logo with primary color
logo-full-white.svg      // Full logo with white text
logo-symbol-dark.svg     // Symbol only, dark
logo-symbol-primary.svg  // Symbol only, primary color
logo-symbol-white.svg    // Symbol only, white
```

**Usage in Components**:

```typescript
// Import from assets (bundled)
import logoFull from '~/assets/logo-full.svg';

// Or use public path
<img src="/logos/logo-full-primary.svg" alt="TalentBase" />
```

**Logo Component**: `packages/design-system/src/components/Logo.tsx` provides a typed component:

```typescript
<Logo variant="full" theme="primary" size="md" />
```

### 4.3 Asset Optimization

- **SVG**: Preferred format for logos and icons
- **Optimization**: No specific optimization tooling (assets are hand-optimized)
- **CDN**: Not configured (assets served from build)

---

## 5. Icon System

### 5.1 Icon Library

**Primary Library**: `lucide-react` (v0.544.0)

**Import Pattern**:

```typescript
import { Menu, X, ArrowRight, Home, User, Briefcase } from 'lucide-react';

// Usage
<ArrowRight className="ml-2 h-5 w-5" />
```

### 5.2 Icon Usage Patterns

**Common Sizes**:

- Small: `h-4 w-4` (16px)
- Default: `h-5 w-5` (20px)
- Large: `h-6 w-6` (24px)
- Extra Large: `h-8 w-8` (32px)

**Example from Navbar**:

```typescript
{isOpen ? <X size={24} /> : <Menu size={24} />}
```

**Example from Layout**:

```typescript
const candidateMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/candidate/dashboard', icon: Home },
  { id: 'profile', label: 'Meu Perfil', href: '/candidate/profile', icon: User },
  { id: 'jobs', label: 'Buscar Vagas', href: '/jobs', icon: Briefcase },
];
```

### 5.3 Icon Naming Convention

Use PascalCase from lucide-react exports. Common icons:

- Navigation: `Home`, `User`, `Settings`, `Briefcase`, `FileText`
- Actions: `ArrowRight`, `Plus`, `Edit`, `Trash`, `Check`
- UI: `Menu`, `X`, `ChevronDown`, `Search`

---

## 6. Styling Approach

### 6.1 CSS Methodology

**Primary Approach**: Utility-first with Tailwind CSS

**Component Styling**:

1. Use `cva()` for variants
2. Use `cn()` for class merging
3. Apply Tailwind utilities directly in JSX
4. No CSS Modules or styled-components

**Example**:

```typescript
<button
  className={cn(
    buttonVariants({ variant, size }),
    'additional-class',
    className
  )}
/>
```

### 6.2 Global Styles

**Web App**: `packages/web/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Design System**: `packages/design-system/src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    border-color: hsl(214.3 31.8% 91.4%);
  }

  body {
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;
    font-feature-settings:
      'rlig' 1,
      'calt' 1;
  }
}
```

**Import in Root**: `packages/web/app/root.tsx`

```typescript
import globals from './globals.css?url';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: globals }];
```

### 6.3 Responsive Design

**Breakpoints**: Use Tailwind defaults

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Pattern**:

```typescript
<div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
  Responsive heading
</div>
```

**Container**: Use `container` utility with responsive padding:

```typescript
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
```

### 6.4 Animations

**Custom Animations** (defined in web app's `tailwind.config.ts`):

```typescript
animation: {
  'fade-in': 'fadeIn 0.6s ease-out',
  'fade-in-up': 'fadeInUp 0.8s ease-out',
  'scale-in': 'scaleIn 0.5s ease-out',
  float: 'float 6s ease-in-out infinite',
}
```

**Usage**:

```typescript
<h1 className="animate-fade-in-up">Welcome</h1>
<div className="animate-float">Floating element</div>

// With delay
<p style={{ animationDelay: '0.2s' }} className="animate-fade-in">
  Delayed fade in
</p>
```

---

## 7. Project Structure

### 7.1 Monorepo Organization

```
talentbase-v1/
└── packages/
    ├── design-system/          # Shared component library
    │   ├── src/
    │   │   ├── components/     # All UI components
    │   │   ├── lib/           # Utilities (cn)
    │   │   ├── stories/       # Storybook stories
    │   │   └── styles/        # Global styles
    │   ├── tailwind.config.js # Design tokens
    │   └── package.json
    │
    └── web/                    # Main web application
        ├── app/
        │   ├── components/     # App-specific components
        │   │   ├── admin/
        │   │   ├── candidate/
        │   │   ├── forms/
        │   │   ├── landing/
        │   │   └── layouts/
        │   ├── routes/         # Remix routes (flat file convention)
        │   ├── hooks/          # Custom React hooks
        │   ├── lib/            # Utilities (queryClient, etc.)
        │   ├── config/         # Configuration (routes, API)
        │   ├── utils/          # Helper functions
        │   ├── assets/         # Local assets (SVG logos)
        │   ├── root.tsx        # Root layout
        │   └── globals.css     # Global styles
        ├── public/             # Static assets
        │   └── logos/          # Logo variants
        ├── tests/              # E2E tests (Playwright)
        ├── tailwind.config.ts  # Extended config
        ├── vite.config.ts      # Vite configuration
        └── package.json
```

### 7.2 Routing Pattern

**Convention**: Remix Flat File Convention (v2)

**Pattern**: `app/routes/{route}.{nested}.tsx`

**Examples**:

- `app/routes/_index.tsx` → `/`
- `app/routes/auth.tsx` → `/auth` (layout)
- `app/routes/auth.login.tsx` → `/auth/login`
- `app/routes/candidate.profile._index.tsx` → `/candidate/profile`
- `app/routes/admin.candidates.new.tsx` → `/admin/candidates/new`

**Route Configuration**: `app/config/routes.ts`

```typescript
export const ROUTES = {
  home: '/',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    candidateRegister: '/auth/register/candidate',
    companyRegister: '/auth/register/company',
  },
  candidate: {
    dashboard: '/candidate/dashboard',
    profile: '/candidate/profile',
  },
  admin: {
    dashboard: '/admin',
    candidates: '/admin/candidates',
  },
};
```

### 7.3 Feature Organization

**Component Organization**:

1. **Design System Components** (`packages/design-system/src/components/`):
   - Generic, reusable UI components
   - Exported via `index.ts`
   - Have Storybook stories

2. **App-Specific Components** (`packages/web/app/components/`):
   - Domain-specific components
   - Organized by feature area (admin, candidate, landing, forms, layouts)

**Layout Components**:

- `DashboardLayout` (design-system) - Generic dashboard shell
- `CandidateLayout` (web) - Candidate-specific wrapper
- `AdminLayout` (web) - Admin-specific wrapper

---

## 8. Figma Integration Guidelines

### 8.1 Converting Figma Colors

**Map Figma color styles to**:

- Primary colors → `primary-{shade}` (50-900)
- Secondary colors → `secondary-{shade}` (50-900)
- Use exact hex values from `tailwind.config.js`
- Primary main: `#00B8D4` (cyan)
- Secondary main: `#1E3A8A` (dark blue)

### 8.2 Converting Figma Typography

**Map Figma text styles to**:

- Headings → `text-display-xl`, `text-display-lg`, `text-display-md`, `text-display-sm`
- Body → `text-base`, `text-sm`, `text-xs`
- Font weight → `font-{weight}` (light, normal, medium, semibold, bold, extrabold)
- Font family → Default (Inter) or specify `font-sans`

### 8.3 Converting Figma Spacing

**Map Auto Layout spacing to**:

- Use custom spacing scale: `space-{n}` or `gap-{n}`, `p-{n}`, `m-{n}`
- Available: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 10 (40px), 12 (48px), 16 (64px), 20 (80px), 24 (96px), 32 (128px), 40 (160px), 48 (192px), 64 (256px)

### 8.4 Converting Figma Components

**Component Mapping**:

| Figma Component Type | TalentBase Component       | Import From                 |
| -------------------- | -------------------------- | --------------------------- |
| Button               | `Button`                   | `@talentbase/design-system` |
| Input Field          | `Input`, `FormField`       | `@talentbase/design-system` |
| Card                 | `Card`, `CardHeader`, etc. | `@talentbase/design-system` |
| Modal/Dialog         | `Modal`                    | `@talentbase/design-system` |
| Navigation           | `Navbar`, `Sidebar`        | `@talentbase/design-system` |
| Badge/Tag            | `Badge`                    | `@talentbase/design-system` |
| Avatar               | `Avatar`                   | `@talentbase/design-system` |
| Table                | `Table`                    | `@talentbase/design-system` |

**Component Variant Selection**:

- Buttons: `variant="default|destructive|outline|secondary|ghost|link"`, `size="sm|default|lg|icon"`
- Inputs: `variant="default|error|success"`, `inputSize="sm|md|lg"`
- Cards: `variant="default|elevated|outlined"`

### 8.5 Converting Figma Icons

**Icon Conversion**:

1. Identify icon name in Figma
2. Search for equivalent in lucide-react: https://lucide.dev/icons
3. Import: `import { IconName } from 'lucide-react'`
4. Use with size: `<IconName className="h-5 w-5" />`

**Common Icon Mappings**:

- Menu → `Menu`
- Close → `X`
- Arrow → `ArrowRight`, `ArrowLeft`, `ChevronRight`, etc.
- User → `User`
- Settings → `Settings`
- Home → `Home`

### 8.6 Creating New Components from Figma

**If design requires a new component**:

1. **Create in Design System** (if reusable):
   - File: `packages/design-system/src/components/NewComponent.tsx`
   - Use CVA pattern with variants
   - Export from `packages/design-system/src/index.ts`
   - Create Storybook story: `packages/design-system/src/stories/NewComponent.stories.tsx`

2. **Create in Web App** (if domain-specific):
   - File: `packages/web/app/components/{category}/NewComponent.tsx`
   - Use design system components as building blocks
   - Import design system components: `from '@talentbase/design-system'`

**Component Template**:

```typescript
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils'; // or '@talentbase/design-system'

const newComponentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'variant-classes',
      },
      size: {
        default: 'size-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface NewComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof newComponentVariants> {
  // Additional props
}

const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(newComponentVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

NewComponent.displayName = 'NewComponent';

export { NewComponent, newComponentVariants };
```

---

## 9. Best Practices

### 9.1 When Converting Figma Designs

1. **Always** use design system components first
2. **Always** use the `cn()` utility for class merging
3. **Never** hardcode colors - use Tailwind token classes
4. **Always** use responsive classes (`sm:`, `md:`, `lg:`, etc.)
5. **Always** maintain accessibility (ARIA labels, semantic HTML)
6. **Always** use TypeScript for type safety

### 9.2 Component Development Workflow

1. Check if component exists in design system
2. If exists, use with appropriate variants
3. If doesn't exist, create in appropriate location
4. Follow CVA pattern for variants
5. Export types and variant helpers
6. Add Storybook story (if in design system)
7. Update `index.ts` exports (if in design system)

### 9.3 Styling Workflow

1. Start with Tailwind utilities
2. Use design tokens from `tailwind.config.js`
3. Use CVA for component variants
4. Use `cn()` for merging classes
5. Avoid custom CSS unless absolutely necessary
6. Use custom animations from config when needed

### 9.4 Asset Workflow

1. SVG logos → Place in `public/logos/`
2. Icons → Use lucide-react
3. Local bundled assets → Place in `app/assets/`
4. Reference public assets with `/path` (e.g., `/logos/logo.svg`)
5. Import local assets with `import assetName from '~/assets/file.svg'`

---

## 10. Quick Reference

### 10.1 Common Imports

```typescript
// Design system components
import { Button, Input, Card, Badge } from '@talentbase/design-system';

// Icons
import { ArrowRight, Menu, X } from 'lucide-react';

// Utilities
import { cn } from '@talentbase/design-system';

// Remix
import { Link, useNavigate } from '@remix-run/react';

// Config
import { ROUTES } from '~/config/routes';
```

### 10.2 Common Patterns

**Button with Icon**:

```typescript
<Button size="lg">
  Get Started
  <ArrowRight className="ml-2 h-5 w-5" />
</Button>
```

**Form Field**:

```typescript
<FormField label="Email" error={errors.email} required>
  <Input type="email" variant={errors.email ? 'error' : 'default'} />
</FormField>
```

**Card Layout**:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

**Responsive Container**:

```typescript
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

---

## 11. Support & Resources

- **Storybook**: Run `npm run dev` in `packages/design-system`
- **Design System Docs**: `packages/design-system/README.md`
- **React Query Guide**: `packages/web/REACT_QUERY_SSR_GUIDE.md`
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/icons
- **Remix Docs**: https://remix.run/docs
