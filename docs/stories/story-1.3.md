# Story 1.3: Design System Integration & Component Library

Status: Draft

## Story

Como um **frontend developer**,
Eu quero **o @talentbase/design-system package integrado no Remix**,
Para que **todos os componentes UI sejam consistentes e reutilizáveis**.

## Contexto

Esta story integra o design system existente (Storybook) como dependência workspace do app Remix. Inclui configuração de Tailwind, importação de componentes e criação do componente VideoPlayer (identificado como gap no review).

## Acceptance Criteria

1. ✅ Design system package linkado via pnpm workspace (`workspace:*`)
2. ✅ Tailwind CSS config importado do design system
3. ✅ Todos os design tokens acessíveis (colors, spacing, typography)
4. ✅ Componentes core renderizam no Remix: Button, Input, Card, Badge, Select, Checkbox
5. ✅ Componente VideoPlayer criado e funcionando (YouTube embeds)
6. ✅ Página de exemplos criada em `/dev/components`
7. ✅ Design system Storybook acessível localmente
8. ✅ Sem erros no console ao usar componentes
9. ✅ Testes de componente executando com sucesso
10. ✅ Build do design system funciona corretamente

## Tasks / Subtasks

### Task 1: Configurar dependência workspace (AC: 1)
- [ ] Editar `packages/web/package.json`:
  ```json
  {
    "dependencies": {
      "@talentbase/design-system": "workspace:*",
      "@remix-run/node": "^2.14.0",
      "@remix-run/react": "^2.14.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    }
  }
  ```
- [ ] Executar `pnpm install` na raiz para resolver workspace dependency
- [ ] Verificar que design system está linkado: `ls -la packages/web/node_modules/@talentbase/`

### Task 2: Importar Tailwind config (AC: 2, 3)
- [ ] Criar `packages/web/tailwind.config.ts`:
  ```typescript
  import type { Config } from 'tailwindcss';
  import designSystemConfig from '@talentbase/design-system/tailwind.config';

  export default {
    presets: [designSystemConfig],
    content: [
      './app/**/*.{js,jsx,ts,tsx}',
      '../design-system/src/**/*.{js,jsx,ts,tsx}',
    ],
  } satisfies Config;
  ```
- [ ] Verificar que design tokens estão disponíveis (colors, spacing, etc.)

### Task 3: Criar componente VideoPlayer (AC: 5)
- [ ] Criar `packages/design-system/src/components/VideoPlayer.tsx`:
  ```typescript
  export interface VideoPlayerProps {
    url: string;
    title?: string;
    className?: string;
  }

  function extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  export function VideoPlayer({ url, title = "Vídeo de Apresentação", className }: VideoPlayerProps) {
    const videoId = extractYouTubeId(url);

    if (!videoId) {
      return <div className="text-red-500">URL de vídeo inválida</div>;
    }

    return (
      <div className={className}>
        <iframe
          src={`https://youtube.com/embed/${videoId}`}
          title={title}
          className="aspect-video w-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  ```
- [ ] Exportar em `packages/design-system/src/index.ts`:
  ```typescript
  export { VideoPlayer } from './components/VideoPlayer';
  ```
- [ ] Rebuild design system: `pnpm --filter @talentbase/design-system build`

### Task 4: Criar página de exemplos (AC: 4, 6, 8)
- [ ] Criar `packages/web/app/routes/dev.components.tsx`:
  ```typescript
  import { Button, Input, Card, Badge, Select, Checkbox, VideoPlayer } from '@talentbase/design-system';

  export default function ComponentsPage() {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Design System Components</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
          <div className="flex gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Inputs</h2>
          <div className="max-w-md space-y-4">
            <Input label="Email" type="email" placeholder="seu@email.com" />
            <Input label="Password" type="password" />
            <Select label="Posição" options={[
              { value: 'SDR/BDR', label: 'SDR/BDR' },
              { value: 'AE/Closer', label: 'Account Executive/Closer' },
              { value: 'CSM', label: 'Customer Success Manager' },
            ]} />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Cards & Badges</h2>
          <Card className="max-w-md">
            <h3 className="text-xl font-semibold mb-2">Candidate Profile</h3>
            <p className="text-gray-600">João Silva - SDR/BDR</p>
            <Badge variant="success" className="mt-4">Disponível</Badge>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Checkboxes</h2>
          <div className="space-y-2">
            <Checkbox label="HubSpot" />
            <Checkbox label="Salesforce" />
            <Checkbox label="Apollo.io" />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Video Player</h2>
          <div className="max-w-2xl">
            <VideoPlayer url="https://youtube.com/watch?v=dQw4w9WgXcQ" />
          </div>
        </section>
      </div>
    );
  }
  ```

### Task 5: Criar testes de componente (AC: 9)
- [ ] Criar `packages/web/app/components/__tests__/DesignSystemImport.test.tsx`:
  ```typescript
  import { render, screen } from '@testing-library/react';
  import { Button, Input, VideoPlayer } from '@talentbase/design-system';

  describe('Design System Components', () => {
    it('renders Button component', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders Input component with label', () => {
      render(<Input label="Email" type="email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders VideoPlayer with valid YouTube URL', () => {
      const { container } = render(
        <VideoPlayer url="https://youtube.com/watch?v=abc123" />
      );
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain('youtube.com/embed/abc123');
    });

    it('shows error for invalid video URL', () => {
      render(<VideoPlayer url="https://invalid.com/video" />);
      expect(screen.getByText('URL de vídeo inválida')).toBeInTheDocument();
    });
  });
  ```

### Task 6: Validação e documentação (AC: 7, 10)
- [ ] Testar build do design system: `pnpm --filter @talentbase/design-system build`
- [ ] Iniciar Storybook: `pnpm --filter @talentbase/design-system storybook`
- [ ] Acessar Remix dev: http://localhost:3000/dev/components
- [ ] Verificar que todos os componentes renderizam sem erros
- [ ] Executar testes: `pnpm --filter @talentbase/web test`

## Dev Notes

### Gap Fix from Review

Esta story implementa o **Gap Moderado 3** identificado no review:
- Componente VideoPlayer criado no design system
- Função `extractYouTubeId` para parsing de URLs
- Tratamento de erro para URLs inválidas
- Iframe com sandbox apropriado

### Design Tokens

O Tailwind config do design system deve incluir:
```javascript
// packages/design-system/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      spacing: {
        // Custom spacing
      },
      typography: {
        // Custom typography
      },
    },
  },
};
```

### Testing Strategy

**Validation Checklist:**
- [ ] `pnpm install` resolve design system corretamente
- [ ] `/dev/components` renderiza sem erros
- [ ] Todos componentes exibem corretamente
- [ ] Tailwind classes aplicam (colors, spacing)
- [ ] Sem warnings no console
- [ ] Storybook acessível

### References

- [Source: docs/epics/tech-spec-epic-1.md#Story-1.3]
- [Source: docs/epics/tech-spec-epic-1-review.md#Gap-Moderado-3]

## Change Log

| Date       | Version | Description | Author |
| ---------- | ------- | ----------- | ------ |
| 2025-10-02 | 0.1     | Initial draft - Design system integration + VideoPlayer | Debora |

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes

- Tempo estimado: 2-3 horas
- Inclui correção do Gap Moderado 3 (VideoPlayer)
- Bloqueia: Story 1.4 (Landing page usa componentes)

### Dependencies

**Depends On:**
- Story 1.1: Monorepo structure and pnpm workspaces configured

**Blocks:**
- Story 1.4: Landing page requires design system components

### File List

**To be created:**
- `packages/design-system/src/components/VideoPlayer.tsx`
- `packages/web/app/routes/dev.components.tsx`
- `packages/web/app/components/__tests__/DesignSystemImport.test.tsx`

**To be modified:**
- `packages/web/package.json` - Add design system dependency
- `packages/web/tailwind.config.ts` - Import design system config
- `packages/design-system/src/index.ts` - Export VideoPlayer
