# Best Practices

Diretrizes e melhores práticas para uso do TalentBase Design System.

---

## Princípios Gerais

### 1. Consistência
Mantenha padrões visuais e comportamentais em toda a aplicação.

**✅ Fazer:**
- Usar os mesmos componentes para situações similares
- Manter hierarquia visual consistente
- Seguir a mesma linguagem de ações (botões, links)

**❌ Evitar:**
- Misturar estilos diferentes para mesma função
- Reinventar componentes já existentes
- Comportamentos inconsistentes

---

### 2. Hierarquia Visual
Estabeleça ordem de importância clara através de tipografia, cor e espaçamento.

**Níveis de Hierarquia:**
1. **Primário:** Ações principais, títulos H1
2. **Secundário:** Ações alternativas, títulos H2-H3
3. **Terciário:** Ações complementares, metadados

---

### 3. Espaçamento

Use o sistema base-4 (4px) para manter ritmo visual.

```tsx
// ✅ Correto - Múltiplos de 4
<div className="gap-4 p-6 mt-8">

// ❌ Evitar - Valores arbitrários
<div className="gap-5 p-7 mt-9">
```

**Regras:**
- Espaçamento interno de componentes: 12px-24px (spacing-3 a spacing-6)
- Entre seções: 32px-48px (spacing-8 a spacing-12)
- Margens de página: 16px-24px mobile, 24px-48px desktop

---

### 4. Cores

**Uso Semântico:**
```tsx
// ✅ Correto
<Badge variant="success">Aprovado</Badge>
<Badge variant="error">Rejeitado</Badge>

// ❌ Evitar
<Badge variant="success">Rejeitado</Badge> // Cor errada para contexto
```

**Contraste:**
- Texto em fundo claro: min. gray-700
- Texto em fundo escuro: min. gray-50
- Ratio mínimo: 4.5:1 (WCAG AA)

---

### 5. Tipografia

**Escala de Importância:**
```tsx
// Títulos principais
<h1 className="text-4xl font-bold">Título Principal</h1>

// Subtítulos
<h2 className="text-2xl font-semibold">Subtítulo</h2>

// Corpo de texto
<p className="text-base font-normal">Texto padrão</p>

// Textos secundários
<span className="text-sm text-gray-500">Metadata</span>
```

**Limites de Linha:**
- Leitura ideal: 50-75 caracteres
- Máximo: 80-90 caracteres

---

## Performance

### 1. Otimização de Componentes

```tsx
// ✅ Componentes memoizados
const CandidateCard = React.memo(({ data }) => {
  // ...
});

// ✅ Lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 2. Imagens
- Usar formatos modernos (WebP, AVIF)
- Lazy loading para imagens abaixo da fold
- Responsive images com srcset

```tsx
<img
  src="/avatar.webp"
  srcSet="/avatar-sm.webp 300w, /avatar-lg.webp 600w"
  loading="lazy"
  alt="Avatar do candidato"
/>
```

---

## Acessibilidade (a11y)

### 1. Navegação por Teclado
Todos os elementos interativos devem ser acessíveis via teclado.

```tsx
// ✅ Nativo
<button>Clique Aqui</button>

// ❌ Evitar div clicável sem acessibilidade
<div onClick={handleClick}>Clique Aqui</div>
```

### 2. ARIA Labels
```tsx
// Botão com ícone
<button aria-label="Fechar modal">
  <X className="h-4 w-4" />
</button>

// Imagem decorativa
<img src="icon.svg" alt="" aria-hidden="true" />

// Campos de formulário
<input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
```

### 3. Focus Visible
```tsx
// ✅ Sempre visível
<button className="focus:ring-2 focus:ring-primary-500">
  Botão
</button>
```

---

## Responsividade

### Breakpoints
```tsx
// Mobile-first approach
<div className="
  p-4        // mobile
  md:p-6     // tablet (768px+)
  lg:p-8     // desktop (1024px+)
">
```

### Grid Responsivo
```tsx
// 1 coluna mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## Mensagens e Feedback

### 1. Feedback Imediato
```tsx
// Loading states
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Salvando...
</Button>

// Success feedback
<Toast variant="success">
  Candidato salvo com sucesso!
</Toast>
```

### 2. Mensagens de Erro
```tsx
// ✅ Específicas e acionáveis
<p className="text-error-500">
  Email já cadastrado. <Link>Fazer login?</Link>
</p>

// ❌ Genéricas
<p className="text-error-500">Erro</p>
```

---

## Formulários

### 1. Validação
```tsx
// Validação em tempo real (após primeiro blur)
<Input
  onBlur={() => validateField()}
  onChange={() => field.isDirty && validateField()}
/>
```

### 2. Campos Obrigatórios
```tsx
<Label htmlFor="name">
  Nome Completo <span className="text-error-500">*</span>
</Label>
```

### 3. Helper Text
```tsx
<div className="space-y-2">
  <Label htmlFor="password">Senha</Label>
  <Input id="password" type="password" />
  <p className="text-sm text-gray-500">
    Mínimo 8 caracteres, 1 maiúscula, 1 número
  </p>
</div>
```

---

## Nomenclatura

### Componentes
```tsx
// ✅ PascalCase
<CandidateCard />
<SearchBar />

// ❌ camelCase ou kebab-case
<candidateCard />
<candidate-card />
```

### Props
```tsx
// ✅ camelCase
<Button onClick={handleClick} isLoading={true} />

// ❌ PascalCase ou snake_case
<Button OnClick={} IsLoading={} is_loading={} />
```

### Classes CSS
```tsx
// ✅ Tailwind utilities
className="flex items-center gap-2 p-4"

// ❌ Custom classes sem necessidade
className="my-custom-flex-container"
```

---

## Testes

### 1. Testes de Componente
```tsx
describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2. Testes de Acessibilidade
```tsx
it('should have accessible label', () => {
  render(
    <button aria-label="Close modal">
      <X />
    </button>
  );
  expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
});
```

---

## Checklist de Qualidade

Antes de fazer commit/deploy:

- [ ] Componentes seguem design system
- [ ] Código está formatado (Prettier)
- [ ] Sem erros de lint (ESLint)
- [ ] TypeScript sem erros
- [ ] Acessibilidade validada
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Performance otimizada
- [ ] Testes passando
