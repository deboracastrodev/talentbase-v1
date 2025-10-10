# Toast Component

Componente de notificação temporária que aparece no canto superior direito da tela para fornecer feedback ao usuário sobre ações realizadas.

## Características

- ✅ **Auto-dismiss** configurável (padrão: 5s para success/info, 7s para error/warning)
- ✅ **Empilhável** - suporta múltiplas notificações simultâneas
- ✅ **Animações suaves** - entrada/saída com slide da direita
- ✅ **Acessível** - suporte completo a screen readers (ARIA)
- ✅ **Dismissível** - botão X para fechar manualmente
- ✅ **Variantes semânticas** - success, error, info, warning
- ✅ **Responsivo** - adapta-se a diferentes tamanhos de tela
- ✅ **Design consistente** - mesma paleta de cores do Alert

## Quando Usar

### ✅ Use Toast para:

- **Confirmações rápidas** - "Candidato criado com sucesso!"
- **Feedback de ações** - "Email enviado", "Senha alterada"
- **Notificações não-críticas** - "Rascunho salvo automaticamente"
- **Atualizações de status** - "Upload concluído"

### ❌ Não use Toast para:

- **Erros críticos** que requerem ação imediata → use `Alert` ou `Modal`
- **Informações importantes** que não devem desaparecer → use `Alert`
- **Formulários com erros de validação** → use mensagens inline
- **Conteúdo extenso** → use `Modal` ou página dedicada

## Instalação

O Toast já está incluído no design system. Basta importar:

```tsx
import { ToastProvider, useToast } from '@talentbase/design-system';
```

## Setup

### 1. Adicione o ToastProvider no root da aplicação

```tsx
// app/root.tsx (Remix) ou App.tsx (React)
import { ToastProvider } from '@talentbase/design-system';

export default function Root() {
  return (
    <ToastProvider>
      <Outlet /> {/* Ou suas rotas */}
    </ToastProvider>
  );
}
```

### 2. Use o hook useToast em qualquer componente

```tsx
import { useToast } from '@talentbase/design-system';

export default function MyComponent() {
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      await createCandidate();
      toast.success('Candidato criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar candidato');
    }
  };

  return <button onClick={handleSubmit}>Criar</button>;
}
```

## API

### ToastProvider Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `children` | `ReactNode` | - | Conteúdo da aplicação |
| `maxToasts` | `number` | `5` | Número máximo de toasts simultâneos |

### useToast Hook

```tsx
const { toast } = useToast();
```

#### Métodos disponíveis:

##### `toast.success(message, title?, duration?)`
Exibe toast de sucesso (verde).

```tsx
toast.success('Operação concluída!');
toast.success('Candidato criado!', 'Sucesso'); // com título
toast.success('Salvo', undefined, 3000); // duração customizada (3s)
```

##### `toast.error(message, title?, duration?)`
Exibe toast de erro (vermelho).

```tsx
toast.error('Email já cadastrado');
toast.error('Falha na conexão', 'Erro');
```

##### `toast.info(message, title?, duration?)`
Exibe toast informativo (azul primário).

```tsx
toast.info('Processando em segundo plano...');
toast.info('Nova versão disponível', 'Atualização');
```

##### `toast.warning(message, title?, duration?)`
Exibe toast de alerta (amarelo).

```tsx
toast.warning('Ação não pode ser desfeita');
toast.warning('Sessão expirando em breve', 'Atenção');
```

### Parâmetros

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `message` | `string` | - | Mensagem principal (obrigatório) |
| `title` | `string` | `undefined` | Título opcional em negrito |
| `duration` | `number` | `5000` ou `7000` | Duração em ms (0 = nunca fechar) |

**Durações padrão:**
- Success/Info: 5000ms (5s)
- Error/Warning: 7000ms (7s) - tempo extra para ler mensagens críticas

## Exemplos de Uso

### Story 3.3.5 - Admin Criação de Candidato

```tsx
// packages/web/app/routes/admin.candidates.new.tsx
import { useToast } from '@talentbase/design-system';

export default function CreateCandidate() {
  const { toast } = useToast();

  const handleSubmit = async (data: FormData) => {
    try {
      const response = await createCandidate(data);

      // Mensagem varia baseado em se email foi enviado
      if (response.email_sent) {
        toast.success(
          'Candidato criado com sucesso! Email de boas-vindas enviado.',
          'Sucesso!'
        );
      } else {
        toast.success('Candidato criado com sucesso!', 'Sucesso!');
      }

      navigate('/admin/candidates?created=true');
    } catch (error) {
      if (error.message.includes('already exists')) {
        toast.error('Email já cadastrado no sistema', 'Erro');
      } else {
        toast.error('Erro ao criar candidato. Tente novamente.', 'Erro');
      }
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Upload com Progresso

```tsx
const handleUpload = async (file: File) => {
  toast.info('Fazendo upload...', undefined, 0); // Não fecha automaticamente

  try {
    await uploadFile(file);
    toast.success('Upload concluído!');
  } catch (error) {
    toast.error('Falha no upload', 'Erro');
  }
};
```

### Auto-save de Rascunho

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    saveDraft(formData);
    toast.info('Rascunho salvo automaticamente', undefined, 2000); // 2s apenas
  }, 30000); // A cada 30s

  return () => clearInterval(timer);
}, [formData]);
```

### Múltiplas Notificações

```tsx
const handleBulkAction = async (ids: string[]) => {
  let successCount = 0;
  let errorCount = 0;

  for (const id of ids) {
    try {
      await deleteCandidate(id);
      successCount++;
    } catch {
      errorCount++;
    }
  }

  if (successCount > 0) {
    toast.success(`${successCount} candidato(s) removido(s)`);
  }
  if (errorCount > 0) {
    toast.error(`${errorCount} falha(s) ao remover`, 'Erro');
  }
};
```

## UX Best Practices

### ✅ Boas Práticas

1. **Mensagens curtas e claras** - máximo 2 linhas
   ```tsx
   ✅ toast.success('Candidato criado!')
   ❌ toast.success('O candidato foi criado com sucesso no sistema e agora...')
   ```

2. **Use títulos para contexto extra**
   ```tsx
   toast.success('Email enviado para joao@example.com', 'Email de Boas-vindas');
   ```

3. **Escolha a duração apropriada**
   ```tsx
   toast.info('Salvando...', undefined, 0); // Não fecha até ação completar
   toast.success('Salvo!', undefined, 2000); // Fecha rápido para não incomodar
   ```

4. **Evite spam de toasts**
   ```tsx
   // ❌ Ruim - toast em loop
   items.forEach(item => toast.success(`${item} processado`));

   // ✅ Bom - agrupa em uma mensagem
   toast.success(`${items.length} itens processados`);
   ```

5. **Toasts não substituem confirmação de ação crítica**
   ```tsx
   // ❌ Ruim - deletar sem confirmar
   const handleDelete = () => {
     deleteUser();
     toast.success('Usuário deletado');
   };

   // ✅ Bom - confirma antes
   const handleDelete = () => {
     if (confirm('Deletar usuário?')) {
       deleteUser();
       toast.success('Usuário deletado');
     }
   };
   ```

### Acessibilidade

- **ARIA live regions** - toasts são anunciados por screen readers
- **Cor + ícone** - não depende apenas de cor para comunicar significado
- **Botão de fechar** - acessível via teclado (Tab + Enter)
- **Foco não roubado** - toast não interrompe navegação por teclado
- **Timeout adequado** - tempo suficiente para leitura

## Variantes

### Success (Verde)
Operações concluídas com êxito.
```tsx
toast.success('Senha alterada com sucesso!');
```

### Error (Vermelho)
Falhas e erros que precisam atenção.
```tsx
toast.error('Falha ao conectar com servidor');
```

### Info (Azul Primário)
Informações neutras e atualizações.
```tsx
toast.info('Nova mensagem recebida');
```

### Warning (Amarelo)
Avisos e ações que requerem cuidado.
```tsx
toast.warning('Sessão expira em 5 minutos');
```

## Customização Avançada

### Duração Customizada

```tsx
// Nunca fecha automaticamente (duração = 0)
toast.info('Processando em background...', undefined, 0);

// Fecha muito rápido (1 segundo)
toast.success('✓', undefined, 1000);

// Fecha depois de 10 segundos
toast.warning('Leia com atenção', 'Importante', 10000);
```

### Limite de Toasts Simultâneos

```tsx
// app/root.tsx
<ToastProvider maxToasts={3}>
  <App />
</ToastProvider>
```

Toasts mais antigos são removidos automaticamente quando o limite é atingido.

## Troubleshooting

### Toast não aparece

**Causa:** ToastProvider não foi adicionado ou está em local incorreto.

**Solução:** Adicione ToastProvider no root da aplicação, antes de usar useToast.

```tsx
// ✅ Correto
<ToastProvider>
  <ComponentThatUsesToast />
</ToastProvider>

// ❌ Errado - provider está dentro
<ComponentThatUsesToast>
  <ToastProvider />
</ComponentThatUsesToast>
```

### "useToast must be used within a ToastProvider"

**Causa:** Componente usando useToast está fora do ToastProvider.

**Solução:** Mova o ToastProvider para cima na árvore de componentes.

### Toast não fecha automaticamente

**Causa:** Duração definida como 0.

**Solução:** Omita o parâmetro duration ou passe um valor > 0.

```tsx
toast.success('Mensagem', undefined, 5000); // Fecha em 5s
```

## Design Tokens

Toast usa os mesmos tokens do Alert component:

- **Success**: green-50, green-200, green-500, green-700, green-800
- **Error**: red-50, red-200, red-500, red-700, red-800
- **Info**: primary-50, primary-200, primary-500, primary-700, primary-800
- **Warning**: yellow-50, yellow-200, yellow-500, yellow-700, yellow-800

## Comparação: Toast vs Alert

| Característica | Toast | Alert |
|----------------|-------|-------|
| **Duração** | Temporário (auto-fecha) | Permanente |
| **Posição** | Canto superior direito | Inline no conteúdo |
| **Uso** | Feedback de ações | Avisos contextuais |
| **Interrompe fluxo?** | Não | Sim (bloqueia atenção) |
| **Exemplo** | "Salvo com sucesso" | "Preencha todos os campos" |

## Changelog

### v1.0.0 (2025-10-10)
- ✨ Componente Toast inicial
- ✨ ToastProvider com context
- ✨ Hook useToast
- ✨ 4 variantes semânticas
- ✨ Auto-dismiss configurável
- ✨ Suporte a múltiplos toasts
- ✨ Animações de entrada/saída
- ✨ Acessibilidade completa (ARIA)
