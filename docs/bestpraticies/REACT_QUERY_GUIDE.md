# React Query Migration Guide

Este guia explica como usar os novos hooks baseados em React Query (TanStack Query) após a refatoração.

## 📚 Índice

1. [Por que React Query?](#por-que-react-query)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Hooks Disponíveis](#hooks-disponíveis)
4. [Exemplos de Uso](#exemplos-de-uso)
5. [Migração de Hooks Antigos](#migração-de-hooks-antigos)
6. [DevTools](#devtools)

---

## Por que React Query?

### Problemas Resolvidos

✅ **Cache Automático** - Não busca dados desnecessariamente
✅ **Invalidação Inteligente** - Atualiza dados quando necessário
✅ **Loading/Error States** - Gerenciamento automático de estados
✅ **Retry Logic** - Retenta automaticamente em caso de falha
✅ **Optimistic Updates** - Atualiza UI antes da resposta do servidor
✅ **Deduplicação** - Múltiplas chamadas simultâneas fazem apenas 1 request

---

## Estrutura de Pastas

```
app/
├── lib/
│   ├── queryClient.ts          # Configuração do React Query
│   └── apiClient.ts            # Cliente HTTP (já existente)
│
├── hooks/
│   ├── queries/                # Hooks para GET (buscar dados)
│   │   ├── useCurrentUser.ts
│   │   └── useAdminCandidates.ts
│   │
│   └── mutations/              # Hooks para POST/PUT/DELETE (modificar dados)
│       ├── useLogin.ts
│       └── useRegistration.ts
│
└── routes/                     # Rotas organizadas por domínio
    ├── auth/
    ├── admin/
    └── candidate/
```

---

## Hooks Disponíveis

### Mutations (Modificar Dados)

#### `useLogin()`

Login de usuário com redirecionamento automático.

```typescript
import { useLogin } from '~/hooks/mutations/useLogin';

const loginMutation = useLogin();

// Fazer login
loginMutation.mutate({ email, password });

// Estados disponíveis
loginMutation.isPending; // Está carregando?
loginMutation.isError; // Houve erro?
loginMutation.isSuccess; // Foi bem-sucedido?
loginMutation.error; // Objeto de erro (ApiError)
loginMutation.data; // Dados da resposta
```

#### `useRegistration()`

Registro de candidato ou empresa.

```typescript
import { useRegistration } from '~/hooks/mutations/useRegistration';

const registerMutation = useRegistration();

registerMutation.mutate({
  endpoint: '/api/v1/auth/register/candidate',
  data: { email, password, full_name, phone },
});
```

### Queries (Buscar Dados)

#### `useCurrentUser()`

Busca dados do usuário autenticado.

```typescript
import { useCurrentUser } from '~/hooks/queries/useCurrentUser';

const { data: user, isLoading, isError } = useCurrentUser();

if (isLoading) return <Spinner />;
if (isError) return <ErrorMessage />;

return <div>Olá, {user.name}!</div>;
```

#### `useAdminCandidates()`

Lista de candidatos no painel admin (com cache e paginação).

```typescript
import { useAdminCandidates } from '~/hooks/queries/useAdminCandidates';

const { data, isLoading } = useAdminCandidates(token, {
  page: 1,
  search: 'John',
  status: 'available',
});
```

---

## Exemplos de Uso

### Exemplo 1: Form de Login

**Antes (sem React Query):**

```typescript
const { login, isLoading, error } = useLogin();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await login(email, password);
  if (result) {
    navigate(result.redirect_url);
  }
};

return (
  <form onSubmit={handleSubmit}>
    {isLoading && <Spinner />}
    {error && <Alert>{error}</Alert>}
    {/* ... campos */}
  </form>
);
```

**Depois (com React Query):**

```typescript
const loginMutation = useLogin();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const handleSubmit = (e) => {
  e.preventDefault();
  loginMutation.mutate({ email, password });
  // Redirecionamento é automático no onSuccess
};

return (
  <form onSubmit={handleSubmit}>
    {loginMutation.isPending && <Spinner />}
    {loginMutation.isError && (
      <Alert>{loginMutation.error.message}</Alert>
    )}
    {/* ... campos */}
  </form>
);
```

### Exemplo 2: Invalidar Cache Após Mutação

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '~/lib/queryClient';

function useCreateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.post('/api/v1/candidates', data),
    onSuccess: () => {
      // Invalida lista de candidatos para forçar refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.candidates.all,
      });
    },
  });
}
```

### Exemplo 3: Optimistic Update

```typescript
function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileApi,

    // Atualiza UI imediatamente (antes da resposta)
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.candidate.profile.current(),
      });

      const previous = queryClient.getQueryData(queryKeys.candidate.profile.current());

      queryClient.setQueryData(queryKeys.candidate.profile.current(), newData);

      return { previous };
    },

    // Rollback em caso de erro
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKeys.candidate.profile.current(), context.previous);
    },
  });
}
```

---

## Migração de Hooks Antigos

### De `useState` para `useMutation`

**Antes:**

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const doSomething = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const result = await api.post(...);
    setIsLoading(false);
    return result;
  } catch (err) {
    setError(err);
    setIsLoading(false);
  }
};
```

**Depois:**

```typescript
const mutation = useMutation({
  mutationFn: (data) => api.post(..., data),
});

// mutation.isPending, mutation.isError, mutation.error
// disponíveis automaticamente!
```

### De `useEffect` + `fetch` para `useQuery`

**Antes:**

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/data')
    .then((res) => res.json())
    .then(setData)
    .finally(() => setLoading(false));
}, []);
```

**Depois:**

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: () => apiClient.get('/api/data'),
});
```

---

## DevTools

React Query inclui DevTools para visualizar queries, cache e mutations em tempo real.

### Como Ativar

Já está configurado! Em ambiente de desenvolvimento, as DevTools aparecem automaticamente no canto inferior direito.

### Recursos

- 🔍 Ver todas as queries ativas
- 📊 Status de cache (fresh, stale, inactive)
- 🔄 Refetch manual de queries
- 🗑️ Limpar cache manualmente
- ⏱️ Ver tempo de execução

---

## Query Keys

Centralizadas em `lib/queryClient.ts` para facilitar invalidação:

```typescript
import { queryKeys } from '~/lib/queryClient';

// Invalidar todas as queries de candidatos
queryClient.invalidateQueries({
  queryKey: queryKeys.admin.candidates.all,
});

// Invalidar apenas lista com filtros específicos
queryClient.invalidateQueries({
  queryKey: queryKeys.admin.candidates.list({ status: 'active' }),
});
```

---

## Recursos Adicionais

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Query Keys Guide](https://tkdodo.eu/blog/effective-react-query-keys)
- [Practical React Query](https://tkdodo.eu/blog/practical-react-query)

---

## Próximos Passos

1. Migrar hooks existentes gradualmente
2. Adicionar mais query hooks conforme necessário
3. Implementar optimistic updates onde faz sentido
4. Configurar error boundaries para erros globais
