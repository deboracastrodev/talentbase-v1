# Frontend Best Practices

**Projeto:** TalentBase
**Stack:** TypeScript + React + Remix + Tailwind CSS
**Status:** Living Document
**Última Atualização:** 2025-10-02

## 📋 Índice

- [Componentização](#componentização)
- [Design System](#design-system)
- [Estado e Data Fetching](#estado-e-data-fetching)
- [Roteamento](#roteamento-remix)
- [Tipagem](#tipagem-typescript)
- [Performance](#performance)
- [Testes](#testes)
- [Acessibilidade](#acessibilidade)

## Componentização

### Princípio da Responsabilidade Única

Cada componente deve ter **uma única responsabilidade**.

**❌ Ruim:**
```tsx
// CandidatePage.tsx - faz TUDO
function CandidatePage() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    // Fetch candidate
    // Fetch experiences
    // Validação
    // Transformação de dados
  }, []);

  return (
    <div>
      {/* 300 linhas de JSX */}
    </div>
  );
}
```

**✅ Bom:**
```tsx
// app/routes/candidates.$id.tsx - Apenas coordenação
export default function CandidatePage() {
  const { candidate } = useLoaderData<typeof loader>();

  return (
    <div className="container">
      <CandidateHeader candidate={candidate} />
      <CandidateProfile candidate={candidate} />
      <CandidateExperiences experiences={candidate.experiences} />
      <CandidateActions candidateId={candidate.id} />
    </div>
  );
}

// components/CandidateHeader.tsx - Responsabilidade: Header
interface CandidateHeaderProps {
  candidate: CandidateProfile;
}

export function CandidateHeader({ candidate }: CandidateHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{candidate.fullName}</h1>
        <p className="text-gray-600">{candidate.currentPosition}</p>
      </div>
      <Badge variant={candidate.status === 'available' ? 'success' : 'default'}>
        {candidate.status}
      </Badge>
    </header>
  );
}
```

### Hierarquia de Componentes

```
app/
├── routes/                      # Páginas (Remix routes)
│   ├── _index.tsx              # Homepage
│   ├── candidates._index.tsx   # Lista de candidatos
│   └── candidates.$id.tsx      # Detalhes do candidato
│
├── components/                  # Componentes de negócio
│   ├── candidate/
│   │   ├── CandidateCard.tsx
│   │   ├── CandidateProfile.tsx
│   │   └── CandidateList.tsx
│   ├── job/
│   │   ├── JobCard.tsx
│   │   └── JobList.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
│
└── lib/                         # Utilitários
    ├── api.ts
    ├── utils.ts
    └── validators.ts
```

### Tamanho dos Componentes

**Regras:**
- Componentes apresentacionais: < 150 linhas
- Componentes de página: < 200 linhas
- Se maior, quebrar em sub-componentes

## Design System

### OBRIGATÓRIO: Usar @talentbase/design-system

**❌ NUNCA faça isso:**
```tsx
// NÃO criar componentes do zero
function MyButton({ children, onClick }) {
  return (
    <button
      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

**✅ SEMPRE use o Design System:**
```tsx
import { Button, Input, Card, Badge } from '@talentbase/design-system';

export function CandidateForm() {
  return (
    <Card>
      <form>
        <Input
          label="Nome Completo"
          name="fullName"
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
        />
        <Button type="submit" variant="primary">
          Salvar
        </Button>
      </form>
    </Card>
  );
}
```

### Quando Criar Componentes Novos

**Componentes de Negócio (OK criar):**
```tsx
// components/candidate/CandidateCard.tsx
import { Card, Badge, Button } from '@talentbase/design-system';

interface CandidateCardProps {
  candidate: CandidateProfile;
  onSelect?: (id: string) => void;
}

export function CandidateCard({ candidate, onSelect }: CandidateCardProps) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <Avatar src={candidate.photoUrl} alt={candidate.fullName} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{candidate.fullName}</h3>
          <p className="text-sm text-gray-600">{candidate.currentPosition}</p>
          <div className="flex gap-2 mt-2">
            {candidate.topSkills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>
        {onSelect && (
          <Button onClick={() => onSelect(candidate.id)} size="sm">
            Ver Perfil
          </Button>
        )}
      </div>
    </Card>
  );
}
```

**Componentes Genéricos (adicionar ao Design System):**
```tsx
// Se você precisa de um componente genérico que não existe,
// adicione ao design system em packages/design-system/
```

### Estilização com Tailwind

**Classes Permitidas:**
- Spacing: `p-4`, `m-2`, `gap-4`
- Layout: `flex`, `grid`, `items-center`
- Typography: `text-lg`, `font-bold`
- Colors: Apenas tokens do design system

**❌ Evitar:**
```tsx
// Cores hardcoded
<div className="bg-[#3B82F6] text-[#FFFFFF]">
```

**✅ Usar:**
```tsx
// Tokens do design system
<div className="bg-primary text-white">
```

## Estado e Data Fetching

### Remix Loader Pattern

**✅ Server-side data fetching (preferido):**
```tsx
// app/routes/candidates.$id.tsx
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader({ params }: LoaderFunctionArgs) {
  const candidate = await api.candidates.get(params.id!);
  return json({ candidate });
}

export default function CandidateDetailPage() {
  const { candidate } = useLoaderData<typeof loader>();

  return <CandidateProfile candidate={candidate} />;
}
```

### Client-side State (apenas quando necessário)

**Usar para:**
- UI state (modais, dropdowns)
- Formulários não controlados
- State local temporário

```tsx
function CandidateFilters() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  return (
    <div>
      <Button onClick={() => setIsOpen(!isOpen)}>
        Filtros
      </Button>
      {isOpen && (
        <FilterPanel
          position={selectedPosition}
          onPositionChange={setSelectedPosition}
        />
      )}
    </div>
  );
}
```

### Evitar Prop Drilling

**❌ Ruim (prop drilling):**
```tsx
function App() {
  const [user, setUser] = useState(null);
  return <Layout user={user} setUser={setUser} />;
}

function Layout({ user, setUser }) {
  return <Header user={user} setUser={setUser} />;
}

function Header({ user, setUser }) {
  return <UserMenu user={user} onLogout={() => setUser(null)} />;
}
```

**✅ Bom (Context ou Remix):**
```tsx
// Use Remix loaders quando possível
export async function loader() {
  const user = await getUserFromSession();
  return json({ user });
}

// Ou Context para UI state global
const UIContext = createContext<UIState>(defaultState);

export function UIProvider({ children }) {
  const [state, setState] = useState(defaultState);
  return (
    <UIContext.Provider value={{ state, setState }}>
      {children}
    </UIContext.Provider>
  );
}
```

## Roteamento (Remix)

### File-based Routing

```
app/routes/
├── _index.tsx                    # / (homepage)
├── _auth.login.tsx              # /login (layout: _auth)
├── _auth.register.tsx           # /register
├── candidates._index.tsx        # /candidates (lista)
├── candidates.$id.tsx           # /candidates/:id (detalhe)
├── candidates.$id.edit.tsx      # /candidates/:id/edit
├── jobs._index.tsx              # /jobs
└── admin.tsx                    # /admin (root admin)
    ├── admin.candidates.tsx     # /admin/candidates
    └── admin.jobs.tsx           # /admin/jobs
```

### Loaders vs Actions

```tsx
// loader = GET data (server-side)
export async function loader({ params }: LoaderFunctionArgs) {
  const candidate = await api.candidates.get(params.id!);
  if (!candidate) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ candidate });
}

// action = POST/PUT/DELETE (mutations)
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const fullName = formData.get('fullName') as string;

  await api.candidates.update(params.id!, { fullName });

  return redirect(`/candidates/${params.id}`);
}
```

## Tipagem (TypeScript)

### Interfaces vs Types

**Interfaces (preferido para objetos):**
```typescript
interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  currentPosition: 'SDR/BDR' | 'AE/Closer' | 'CSM';
  yearsOfExperience: number;
  topSkills: string[];
  experiences: Experience[];
}

interface Experience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string | null;
}
```

**Types (para unions, intersections):**
```typescript
type CandidateStatus = 'available' | 'inactive' | 'no_contract';

type PartialCandidate = Partial<CandidateProfile>;

type CandidateWithScore = CandidateProfile & {
  matchScore: number;
};
```

### Evitar `any`

**❌ Ruim:**
```typescript
function processData(data: any) {
  return data.map((item: any) => item.value);
}
```

**✅ Bom:**
```typescript
interface DataItem {
  value: number;
  label: string;
}

function processData(data: DataItem[]): number[] {
  return data.map(item => item.value);
}
```

### Generics

```typescript
interface ApiResponse<T> {
  data: T;
  meta: {
    page: number;
    total: number;
  };
}

async function fetchPaginated<T>(
  endpoint: string,
  page: number = 1
): Promise<ApiResponse<T[]>> {
  const response = await fetch(`${endpoint}?page=${page}`);
  return response.json();
}

// Uso
const candidates = await fetchPaginated<CandidateProfile>('/api/candidates');
```

## Performance

### Code Splitting

```tsx
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const CandidateChart = lazy(() => import('~/components/CandidateChart'));

export function CandidateAnalytics() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CandidateChart />
    </Suspense>
  );
}
```

### Memoization

**Usar quando:**
- Cálculos pesados
- Callbacks passados para componentes filhos
- Listas grandes

```tsx
import { useMemo, useCallback } from 'react';

function CandidateList({ candidates }: { candidates: CandidateProfile[] }) {
  // Memoize expensive calculation
  const topCandidates = useMemo(() => {
    return candidates
      .filter(c => c.matchScore > 80)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [candidates]);

  // Memoize callback
  const handleSelect = useCallback((id: string) => {
    navigate(`/candidates/${id}`);
  }, [navigate]);

  return (
    <div>
      {topCandidates.map(candidate => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
```

### Imagens

```tsx
// Sempre otimizar imagens
<img
  src="/images/candidate-avatar.jpg"
  alt="João Silva"
  loading="lazy"
  width={200}
  height={200}
/>
```

## Testes

### Testes de Componentes (Vitest + Testing Library)

```tsx
// components/CandidateCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CandidateCard } from './CandidateCard';

describe('CandidateCard', () => {
  const mockCandidate: CandidateProfile = {
    id: '123',
    fullName: 'João Silva',
    currentPosition: 'SDR/BDR',
    topSkills: ['Outbound', 'HubSpot', 'Negociação'],
    // ... outros campos
  };

  it('renders candidate name and position', () => {
    render(<CandidateCard candidate={mockCandidate} />);

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('SDR/BDR')).toBeInTheDocument();
  });

  it('displays top 3 skills', () => {
    render(<CandidateCard candidate={mockCandidate} />);

    expect(screen.getByText('Outbound')).toBeInTheDocument();
    expect(screen.getByText('HubSpot')).toBeInTheDocument();
    expect(screen.getByText('Negociação')).toBeInTheDocument();
  });

  it('calls onSelect when button is clicked', async () => {
    const onSelect = vi.fn();
    render(<CandidateCard candidate={mockCandidate} onSelect={onSelect} />);

    const button = screen.getByRole('button', { name: /ver perfil/i });
    await userEvent.click(button);

    expect(onSelect).toHaveBeenCalledWith('123');
  });
});
```

### Cobertura de Testes

**Meta: >= 30%**

```bash
pnpm test --coverage
```

**Priorizar:**
1. Lógica de negócio
2. Componentes reutilizáveis
3. Utilities e helpers
4. Edge cases e validações

## Acessibilidade

### Semântica HTML

```tsx
// ✅ Bom - semântico
<nav>
  <ul>
    <li><a href="/candidates">Candidatos</a></li>
    <li><a href="/jobs">Vagas</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Título do Candidato</h1>
    <section>
      {/* Conteúdo */}
    </section>
  </article>
</main>
```

### ARIA Labels

```tsx
<button
  aria-label="Fechar modal"
  onClick={onClose}
>
  <X size={20} />
</button>

<input
  type="text"
  aria-describedby="name-help"
  aria-required="true"
/>
<span id="name-help">Digite seu nome completo</span>
```

### Keyboard Navigation

```tsx
function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return isOpen ? <div role="dialog" aria-modal="true">{children}</div> : null;
}
```

## Checklist Pré-Commit

Antes de fazer commit, verificar:

- [ ] Componentes usando Design System (@talentbase/design-system)
- [ ] Interfaces TypeScript para todas as props
- [ ] Sem `any` (exceto casos justificados)
- [ ] Componentes < 150 linhas
- [ ] ESLint sem warnings
- [ ] Prettier aplicado
- [ ] Testes passando
- [ ] Acessibilidade básica (ARIA labels, semântica)
- [ ] Sem console.log
- [ ] Imports organizados

## Recursos

- [Remix Docs](https://remix.run/docs)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
