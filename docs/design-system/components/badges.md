# Badges

Tags e indicadores visuais para categorizar, destacar status e exibir metadados.

---

## Variantes

### Default
```tsx
<Badge>Default</Badge>
```

### Primary
```tsx
<Badge variant="primary">Verificado</Badge>
```

### Secondary
```tsx
<Badge variant="secondary">Em Análise</Badge>
```

### Success
```tsx
<Badge variant="success">Ativo</Badge>
```

### Warning
```tsx
<Badge variant="warning">Pendente</Badge>
```

### Error
```tsx
<Badge variant="error">Inativo</Badge>
```

### Outline
```tsx
<Badge variant="outline">Outline</Badge>
```

---

## Exemplos de Uso

### Skills/Habilidades
```tsx
<div className="flex flex-wrap gap-2">
  <Badge variant="secondary">React</Badge>
  <Badge variant="secondary">TypeScript</Badge>
  <Badge variant="secondary">Node.js</Badge>
</div>
```

### Status do Candidato
```tsx
<Badge variant="success">Disponível</Badge>
<Badge variant="warning">Sem Contrato</Badge>
<Badge variant="error">Inativo</Badge>
```

### Com Ícone
```tsx
<Badge variant="primary" className="gap-1">
  <CheckCircle className="h-3 w-3" />
  Verificado
</Badge>
```

### Contador
```tsx
<Badge variant="error" className="rounded-full w-6 h-6 p-0 justify-center">
  3
</Badge>
```

---

## Diretrizes

### ✅ Fazer
- Usar para categorização e status
- Manter textos curtos (1-2 palavras)
- Usar cores semanticamente corretas
- Agrupar badges relacionadas

### ❌ Não Fazer
- Usar como botões
- Textos longos
- Muitas badges juntas (max 5-6)
- Badges clicáveis sem indicação visual

---

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| variant | `default` \| `primary` \| `secondary` \| `success` \| `warning` \| `error` \| `outline` | `default` | Estilo visual |
| className | string | - | Classes adicionais |
