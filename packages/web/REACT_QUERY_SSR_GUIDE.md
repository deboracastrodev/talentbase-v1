# React Query SSR Guide - TalentBase

Guia completo para implementar Server-Side Rendering (SSR) com React Query no Remix.

## 📚 Índice

1. [Conceitos Fundamentais](#conceitos-fundamentais)
2. [Padrão SSR no Remix](#padrão-ssr-no-remix)
3. [Exemplo Completo](#exemplo-completo)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

---

## Conceitos Fundamentais

### O Que é SSR no React Query?

Server-Side Rendering com React Query envolve 3 etapas:

1. **Server (Prefetch)**: Buscar dados no servidor durante o loader do Remix
2. **Server (Dehydrate)**: Serializar o cache do React Query para JSON
3. **Client (Hydrate)**: Reconstruir o cache no cliente sem refetch

### Por Que Usar SSR?

✅ **SEO** - HTML com dados completos para crawlers
✅ **Performance** - Usuário vê conteúdo imediatamente
✅ **UX** - Sem loading spinners na primeira renderização
✅ **Cache** - Aproveita cache do React Query após hidratação

---

## Padrão SSR no Remix

### Arquitetura

```
┌─────────────────────────────────────────┐
│          SERVER (Remix Loader)          │
├─────────────────────────────────────────┤
│  1. Create QueryClient                  │
│  2. await queryClient.prefetchQuery()   │
│  3. return { dehydratedState: dehy...}  │
└────────────────┬────────────────────────┘
                 │
                 │ JSON with cached data
                 ▼
┌─────────────────────────────────────────┐
│       CLIENT (React Component)          │
├─────────────────────────────────────────┤
│  1. <HydrationBoundary state={...}>     │
│  2. useQuery() - uses hydrated data     │
│  3. No loading state on first render!   │
└─────────────────────────────────────────┘
```

### Configuração do QueryClient

```typescript
// app/lib/queryClient.ts
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 seconds
        refetchOnMount: false, // Não refetch se temos dados do SSR
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // Incluir queries pending para streaming
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}
```

---

## Exemplo Completo

### 1. Server-Side: Remix Loader

```typescript
// app/routes/admin._index.tsx
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createQueryClient } from '~/lib/queryClient';
import { queryKeys } from '~/lib/queryClient';
import { getAdminStats } from '~/lib/api/admin';
import { requireAdmin } from '~/utils/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireAdmin(request);

  // Criar QueryClient para esta request
  const queryClient = createQueryClient();

  // Prefetch data on server
  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => getAdminStats(token),
  });

  // Dehydrate cache e enviar para o cliente
  return json({
    dehydratedState: dehydrate(queryClient),
  });
}

export default function AdminDashboard() {
  const { dehydratedState } = useLoaderData<typeof loader>();

  return (
    <HydrationBoundary state={dehydratedState}>
      <DashboardContent />
    </HydrationBoundary>
  );
}
```

### 2. Client-Side: React Component

```typescript
// app/components/admin/DashboardContent.tsx
'use client'; // Se usando React Server Components

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '~/lib/queryClient';
import { getAdminStats } from '~/lib/api/admin';

export function DashboardContent() {
  // useQuery irá usar os dados hidratados, sem fazer fetch inicial!
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: getAdminStats, // Só é chamado se dados ficarem stale
  });

  // No primeiro render: isLoading = false, data já existe!
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Total Users: {data.total_users}</h1>
      <h2>Pending: {data.pending_approvals}</h2>
    </div>
  );
}
```

### 3. Query Keys Centralizados

```typescript
// app/lib/queryClient.ts
export const queryKeys = {
  admin: {
    all: ['admin'] as const,
    stats: () => ['admin', 'stats'] as const,
    candidates: {
      all: ['admin', 'candidates'] as const,
      list: (filters?: any) => ['admin', 'candidates', 'list', filters] as const,
    },
  },
  auth: {
    all: ['auth'] as const,
    currentUser: () => ['auth', 'current-user'] as const,
  },
};
```

---

## Best Practices

### 1. ✅ Sempre Criar Novo QueryClient no Servidor

```typescript
// ❌ ERRADO - Compartilha estado entre requests
const queryClient = new QueryClient();

export async function loader() {
  await queryClient.prefetchQuery(...);
}

// ✅ CORRETO - Novo client por request
export async function loader() {
  const queryClient = createQueryClient();
  await queryClient.prefetchQuery(...);
}
```

### 2. ✅ Configure staleTime Para Evitar Refetch Imediato

```typescript
{
  queries: {
    staleTime: 60 * 1000, // Dados ficam "fresh" por 60s
    refetchOnMount: false, // Não refetch se já temos dados
  }
}
```

### 3. ✅ Use Query Keys Tipados

```typescript
// ❌ ERRADO - Magic strings
useQuery({ queryKey: ['admin', 'stats'] });

// ✅ CORRETO - Centralizado e tipado
useQuery({ queryKey: queryKeys.admin.stats() });
```

### 4. ✅ Prefetch Apenas Dados Críticos

```typescript
// Prefetch só o necessário para first render
await queryClient.prefetchQuery({
  queryKey: queryKeys.admin.stats(),
  queryFn: getAdminStats,
});

// Dados secundários podem ser fetched on demand
// (ex: detalhes que aparecem em modals)
```

### 5. ✅ Use HydrationBoundary Por Rota

```typescript
// Cada rota tem seu próprio boundary
export default function MyRoute() {
  const { dehydratedState } = useLoaderData<typeof loader>();

  return (
    <HydrationBoundary state={dehydratedState}>
      <MyRouteContent />
    </HydrationBoundary>
  );
}
```

---

## Troubleshooting

### Problema: Dados Sendo Refetchados Imediatamente

**Causa**: `staleTime` muito baixo ou `refetchOnMount: true`

**Solução**:

```typescript
{
  queries: {
    staleTime: 60 * 1000, // Aumentar
    refetchOnMount: false, // Desabilitar
  }
}
```

### Problema: Hydration Mismatch Error

**Causa**: QueryClient compartilhado entre requests no servidor

**Solução**:

```typescript
// Criar novo client em cada loader
const queryClient = createQueryClient();
```

### Problema: isLoading = true no Primeiro Render

**Causa**: Query key diferente entre server e client

**Solução**:

```typescript
// Server
queryKey: queryKeys.admin.stats();

// Client - DEVE SER IDÊNTICO
queryKey: queryKeys.admin.stats();
```

### Problema: Dados Não Aparecem Após Hidratação

**Causa**: `shouldDehydrateQuery` excluindo a query

**Solução**:

```typescript
dehydrate: {
  shouldDehydrateQuery: (query) =>
    defaultShouldDehydrateQuery(query) ||
    query.state.status === 'pending',
}
```

---

## Exemplo Real: Admin Dashboard

Ver implementação completa em:

- `app/routes/admin._index.tsx` - Loader com prefetch
- `app/components/admin/DashboardContent.tsx` - Component com useQuery
- `app/lib/queryClient.ts` - Configuração SSR

---

## Referências

- [TanStack Query SSR Guide](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- [TanStack Query Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [Remix Data Loading](https://remix.run/docs/en/main/guides/data-loading)

---

**Última atualização**: 2025-01-10
