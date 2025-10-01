# Forms

Componentes de formulário para captura e validação de dados do usuário.

---

## Input

Campo de texto para entrada de dados simples.

### Variantes

#### Default
```tsx
<Input type="text" placeholder="Digite seu nome" />
```

#### With Label
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="seu@email.com" />
</div>
```

#### Error State
```tsx
<div className="space-y-2">
  <Label htmlFor="password">Senha</Label>
  <Input
    id="password"
    type="password"
    variant="error"
    placeholder="••••••••"
  />
  <p className="text-sm text-error-500">Senha muito curta</p>
</div>
```

#### Success State
```tsx
<Input variant="success" placeholder="Email verificado" />
```

#### Disabled
```tsx
<Input disabled placeholder="Campo desabilitado" />
```

### Tamanhos
```tsx
<Input inputSize="sm" placeholder="Pequeno" />
<Input inputSize="md" placeholder="Médio (padrão)" />
<Input inputSize="lg" placeholder="Grande" />
```

### Com Ícones
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
  <Input className="pl-10" placeholder="Buscar..." />
</div>
```

---

## Select

Dropdown para seleção de opções.

### Basic
```tsx
<Select
  options={[
    { value: 'frontend', label: 'Frontend Developer' },
    { value: 'backend', label: 'Backend Developer' },
    { value: 'fullstack', label: 'Fullstack Developer' }
  ]}
  placeholder="Selecione a área"
/>
```

### With Label
```tsx
<div className="space-y-2">
  <Label htmlFor="role">Função</Label>
  <Select
    id="role"
    options={options}
    placeholder="Selecione"
  />
</div>
```

### Estados
```tsx
<Select variant="error" options={options} />
<Select variant="success" options={options} />
<Select disabled options={options} />
```

---

## Textarea

Campo de texto multilinha para entradas maiores.

### Basic
```tsx
<Textarea placeholder="Descreva sua experiência..." />
```

### With Label e Helper Text
```tsx
<div className="space-y-2">
  <Label htmlFor="bio">Sobre Você</Label>
  <Textarea
    id="bio"
    placeholder="Conte-nos sobre sua trajetória profissional..."
    rows={4}
  />
  <p className="text-sm text-gray-500">Máximo 500 caracteres</p>
</div>
```

### Tamanhos
```tsx
<Textarea textareaSize="sm" rows={3} />
<Textarea textareaSize="md" rows={4} />
<Textarea textareaSize="lg" rows={6} />
```

---

## Checkbox

Seleção binária (sim/não) ou múltipla escolha.

### Single Checkbox
```tsx
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Aceito os termos e condições</Label>
</div>
```

### Checkbox Group
```tsx
<div className="space-y-3">
  <Label>Habilidades</Label>
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <Checkbox id="react" />
      <Label htmlFor="react">React</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="typescript" />
      <Label htmlFor="typescript">TypeScript</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="node" />
      <Label htmlFor="node">Node.js</Label>
    </div>
  </div>
</div>
```

### Estados
```tsx
<Checkbox checked />
<Checkbox />
<Checkbox disabled />
<Checkbox disabled checked />
```

---

## Radio

Seleção única entre múltiplas opções.

### Radio Group
```tsx
<div className="space-y-3">
  <Label>Nível de Senioridade</Label>
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <Radio name="level" value="junior" id="junior" />
      <Label htmlFor="junior">Júnior</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Radio name="level" value="pleno" id="pleno" />
      <Label htmlFor="pleno">Pleno</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Radio name="level" value="senior" id="senior" />
      <Label htmlFor="senior">Sênior</Label>
    </div>
  </div>
</div>
```

---

## FormField

Wrapper completo com label, input e mensagem de erro.

```tsx
<FormField
  label="Nome Completo"
  error="Campo obrigatório"
  helperText="Como você gostaria de ser chamado"
>
  <Input variant="error" placeholder="Digite seu nome" />
</FormField>
```

---

## Validação e Feedback

### Estados de Validação

#### Erro
```tsx
<div className="space-y-2">
  <Label htmlFor="email" className="text-error-700">
    Email
  </Label>
  <Input
    id="email"
    variant="error"
    placeholder="seu@email.com"
  />
  <p className="text-sm text-error-500 flex items-center gap-1">
    <AlertCircle className="h-4 w-4" />
    Email inválido
  </p>
</div>
```

#### Sucesso
```tsx
<div className="space-y-2">
  <Label htmlFor="username">Username</Label>
  <Input
    id="username"
    variant="success"
    placeholder="@username"
  />
  <p className="text-sm text-success-500 flex items-center gap-1">
    <CheckCircle className="h-4 w-4" />
    Username disponível
  </p>
</div>
```

#### Loading
```tsx
<div className="relative">
  <Input placeholder="Verificando..." />
  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
</div>
```

---

## Layout de Formulários

### Formulário Vertical (Padrão)
```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="name">Nome</Label>
    <Input id="name" />
  </div>

  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" />
  </div>

  <Button type="submit">Enviar</Button>
</form>
```

### Grid (2 colunas)
```tsx
<form className="space-y-6">
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="firstName">Primeiro Nome</Label>
      <Input id="firstName" />
    </div>

    <div className="space-y-2">
      <Label htmlFor="lastName">Sobrenome</Label>
      <Input id="lastName" />
    </div>
  </div>

  <Button type="submit">Salvar</Button>
</form>
```

---

## Diretrizes de Uso

### ✅ Fazer
- Sempre incluir labels acessíveis
- Fornecer feedback visual claro (erro, sucesso)
- Usar placeholders como exemplos, não instruções
- Validar em tempo real quando apropriado
- Indicar campos obrigatórios com asterisco (*)

### ❌ Não Fazer
- Usar placeholders no lugar de labels
- Validar antes do usuário terminar de digitar
- Mensagens de erro genéricas ("Erro")
- Múltiplos estados visuais simultâneos
- Campos muito longos sem quebra

---

## Acessibilidade

```tsx
// Label associado ao input
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// Mensagens de erro acessíveis
<Input
  id="password"
  aria-invalid="true"
  aria-describedby="password-error"
/>
<p id="password-error" role="alert">
  Senha deve ter no mínimo 8 caracteres
</p>

// Checkbox com label
<Checkbox id="newsletter" />
<Label htmlFor="newsletter">
  Quero receber newsletter
</Label>

// Campos obrigatórios
<Label htmlFor="name">
  Nome Completo <span aria-label="obrigatório">*</span>
</Label>
<Input id="name" required />
```

---

## Props

### Input
| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| variant | `default` \| `error` \| `success` | `default` | Estado visual |
| inputSize | `sm` \| `md` \| `lg` | `md` | Tamanho |
| disabled | boolean | false | Desabilita o campo |

### Select
| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| options | `Array<{value, label, disabled?}>` | - | Opções do dropdown |
| placeholder | string | - | Texto placeholder |
| variant | `default` \| `error` \| `success` | `default` | Estado visual |

### Textarea
| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| rows | number | 4 | Número de linhas |
| textareaSize | `sm` \| `md` \| `lg` | `md` | Tamanho |
| disabled | boolean | false | Desabilita o campo |
