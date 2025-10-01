# Buttons

Botões são elementos interativos que permitem aos usuários realizar ações e fazer escolhas com um único toque.

---

## Variantes

### Primary (Padrão)
Ação principal da tela. Use apenas um botão primary por contexto.

```tsx
<Button variant="default">Salvar Candidato</Button>
```

**Quando usar:**
- Ação primária de um formulário
- CTA principal da página
- Confirmação de ações importantes

---

### Secondary (Outline)
Ações secundárias que complementam a ação principal.

```tsx
<Button variant="outline">Cancelar</Button>
```

**Quando usar:**
- Ações alternativas
- Navegação secundária
- Pares com botões primary

---

### Ghost
Ações terciárias ou em contextos onde o botão precisa ser discreto.

```tsx
<Button variant="ghost">Ver Detalhes</Button>
```

**Quando usar:**
- Ações menos importantes
- Navegação em listas
- Menus e toolbars

---

### Destructive
Ações destrutivas ou permanentes que requerem atenção.

```tsx
<Button variant="destructive">Excluir Vaga</Button>
```

**Quando usar:**
- Deletar itens
- Ações irreversíveis
- Avisos críticos

---

### Link
Ações que parecem links mas mantêm comportamento de botão.

```tsx
<Button variant="link">Saiba mais</Button>
```

**Quando usar:**
- Navegação inline
- Ações secundárias em textos
- Redirecionamentos

---

## Tamanhos

### Small (sm)
```tsx
<Button size="sm">Pequeno</Button>
```
**Uso:** Tabelas, cards compactos, interfaces densas

### Default (md)
```tsx
<Button size="default">Padrão</Button>
```
**Uso:** Formulários, diálogos, uso geral

### Large (lg)
```tsx
<Button size="lg">Grande</Button>
```
**Uso:** CTAs principais, landing pages, hero sections

---

## Estados

### Default
Estado padrão, interativo.

### Hover
Alteração visual ao passar o mouse.

### Active/Pressed
Feedback visual durante o clique.

### Focus
Indicador de foco para navegação por teclado.

### Disabled
Estado não interativo.

```tsx
<Button disabled>Botão Desabilitado</Button>
```

### Loading
Estado de carregamento com indicador.

```tsx
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Carregando...
</Button>
```

---

## Com Ícones

### Ícone à Esquerda
```tsx
<Button>
  <Search className="mr-2 h-4 w-4" />
  Buscar Candidatos
</Button>
```

### Ícone à Direita
```tsx
<Button>
  Próximo
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

### Apenas Ícone
```tsx
<Button size="icon">
  <Search className="h-4 w-4" />
  <span className="sr-only">Buscar</span>
</Button>
```

---

## Grupos de Botões

### Botões Adjacentes
```tsx
<div className="flex gap-3">
  <Button variant="outline">Cancelar</Button>
  <Button>Salvar</Button>
</div>
```

### Button Group (Toggle)
```tsx
<div className="inline-flex rounded-lg border">
  <Button variant="ghost" className="rounded-r-none">
    <List />
  </Button>
  <Button variant="ghost" className="rounded-none">
    <Grid />
  </Button>
  <Button variant="ghost" className="rounded-l-none">
    <Table />
  </Button>
</div>
```

---

## Diretrizes de Uso

### ✅ Fazer
- Usar textos claros e ação orientados (verbos)
- Manter hierarquia visual clara (1 primary por contexto)
- Adicionar loading states em ações assíncronas
- Incluir aria-label em botões com apenas ícone

### ❌ Não Fazer
- Usar múltiplos botões primary na mesma tela
- Textos muito longos (max 3-4 palavras)
- Usar destructive para ações não destrutivas
- Omitir estados de disabled/loading

---

## Acessibilidade

```tsx
// Botão com texto
<Button>Salvar</Button>

// Botão com ícone (acessível)
<Button aria-label="Fechar modal">
  <X className="h-4 w-4" />
</Button>

// Loading state
<Button disabled aria-busy="true">
  <Loader2 className="animate-spin" />
  Salvando...
</Button>
```

---

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| variant | `default` \| `outline` \| `ghost` \| `destructive` \| `link` | `default` | Variante visual |
| size | `sm` \| `default` \| `lg` \| `icon` | `default` | Tamanho do botão |
| disabled | boolean | false | Desabilita interações |
| asChild | boolean | false | Renderiza como child component |
| className | string | - | Classes CSS adicionais |
