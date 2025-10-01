# Cards

Containers para agrupar informações relacionadas de forma visual e organizada.

---

## Componentes

### Card (Container Principal)
```tsx
<Card>
  {/* Conteúdo */}
</Card>
```

### CardHeader
```tsx
<CardHeader>
  <CardTitle>Título do Card</CardTitle>
  <CardDescription>Descrição opcional</CardDescription>
</CardHeader>
```

### CardContent
```tsx
<CardContent>
  <p>Conteúdo principal do card</p>
</CardContent>
```

### CardFooter
```tsx
<CardFooter>
  <Button>Ação</Button>
</CardFooter>
```

---

## Exemplos de Uso

### Card Básico
```tsx
<Card>
  <CardHeader>
    <CardTitle>Perfil do Candidato</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Informações do candidato</p>
  </CardContent>
</Card>
```

### Card Completo
```tsx
<Card>
  <CardHeader>
    <CardTitle>João Silva</CardTitle>
    <CardDescription>Senior Frontend Developer</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <p>5 anos de experiência</p>
      <p>São Paulo, SP</p>
    </div>
  </CardContent>
  <CardFooter className="gap-2">
    <Button variant="outline">Ver Perfil</Button>
    <Button>Contatar</Button>
  </CardFooter>
</Card>
```

### CandidateCard (Especializado)
Card customizado para listagem de candidatos.

```tsx
<CandidateCard
  name="Maria Santos"
  avatar="/avatars/maria.jpg"
  role="Product Manager"
  experience="3 anos"
  location="Rio de Janeiro"
  skills={['Product Design', 'Scrum', 'Analytics']}
  salary="R$ 12.000/mês"
  isVerified
  isFavorite
  onFavoriteToggle={() => {}}
/>
```

---

## Variações

### Card Interativo (Hover)
```tsx
<Card className="cursor-pointer hover:shadow-lg transition-shadow">
  {/* conteúdo */}
</Card>
```

### Card com Borda Colorida
```tsx
<Card className="border-l-4 border-l-primary-500">
  {/* conteúdo */}
</Card>
```

### Card com Background
```tsx
<Card className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
  {/* conteúdo */}
</Card>
```

---

## Diretrizes

### ✅ Fazer
- Agrupar informações relacionadas
- Manter hierarquia clara (título > descrição > conteúdo)
- Usar padding consistente
- Adicionar hover states em cards clicáveis

### ❌ Não Fazer
- Aninhar muitos cards (max 2 níveis)
- Cards muito largos (max 600px de largura)
- Conteúdo sem padding adequado
- Cards sem contexto claro

---

## Props

| Componente | Props | Descrição |
|------------|-------|-----------|
| Card | className | Classes Tailwind adicionais |
| CardHeader | className | Classes adicionais |
| CardTitle | className | Classes adicionais |
| CardDescription | className | Classes adicionais |
| CardContent | className | Classes adicionais |
| CardFooter | className | Classes adicionais (flex gap-2 por padrão) |
