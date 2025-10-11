/**
 * React Query Configuration for Remix SSR
 *
 * Central configuration for TanStack Query (React Query) with SSR support.
 * Provides caching, data synchronization, and server state management.
 *
 * Features:
 * - Smart caching with automatic background refetching
 * - Server-side prefetching with dehydration/hydration
 * - Optimistic updates
 * - Request deduplication
 * - Automatic retry logic
 * - DevTools integration (development only)
 *
 * SSR Pattern:
 * 1. Server (loader): prefetchQuery() + dehydrate()
 * 2. Client (component): HydrationBoundary + useQuery()
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/ssr
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
 */

import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';

/**
 * Default QueryClient configuration for SSR
 * Optimized for Remix with server-side prefetching
 */
const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Cache time - Important for SSR to avoid immediate refetch
      staleTime: 60 * 1000, // 60 seconds - data is fresh for this long
      gcTime: 5 * 60 * 1000, // 5 minutes - cache garbage collection time

      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 2 times on 5xx errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch behavior - Optimized for SSR
      refetchOnWindowFocus: false, // Avoid unnecessary refetches after SSR
      refetchOnReconnect: true, // Refetch when internet connection is restored
      refetchOnMount: false, // Don't refetch on mount if we have data from SSR

      // Network mode
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      onError: (error: any) => {
        console.error('[Mutation Error]:', error);
      },
    },
    // SSR-specific: Configure which queries should be dehydrated
    dehydrate: {
      // Include queries with these conditions in SSR payload
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) || query.state.status === 'pending', // Include pending queries for streaming
    },
  },
};

/**
 * Factory function to create a new QueryClient instance
 * Use this in SSR contexts to avoid state sharing between requests
 */
export function createQueryClient() {
  return new QueryClient(queryClientConfig);
}

/**
 * Default QueryClient instance for client-side usage
 * Note: In SSR, create a new instance per request using createQueryClient()
 */
export const queryClient = createQueryClient();

/**
 * Query Keys Factory
 *
 * Centralized place to define all query keys used in the app.
 * This ensures consistency and makes it easy to invalidate related queries.
 *
 * Usage:
 * ```typescript
 * useQuery({ queryKey: queryKeys.admin.candidates.list(filters), ... })
 * queryClient.invalidateQueries({ queryKey: queryKeys.admin.candidates.all })
 * ```
 */
export const queryKeys = {
  // Authentication
  auth: {
    all: ['auth'] as const,
    currentUser: () => ['auth', 'current-user'] as const,
  },

  // Admin domain
  admin: {
    all: ['admin'] as const,
    users: {
      all: ['admin', 'users'] as const,
      list: (filters?: Record<string, any>) => ['admin', 'users', 'list', filters] as const,
      detail: (id: string) => ['admin', 'users', 'detail', id] as const,
    },
    candidates: {
      all: ['admin', 'candidates'] as const,
      list: (filters?: Record<string, any>) => ['admin', 'candidates', 'list', filters] as const,
      detail: (id: string) => ['admin', 'candidates', 'detail', id] as const,
    },
    stats: () => ['admin', 'stats'] as const,
  },

  // Candidate domain
  candidate: {
    all: ['candidate'] as const,
    profile: {
      all: ['candidate', 'profile'] as const,
      current: () => ['candidate', 'profile', 'current'] as const,
    },
    dashboard: () => ['candidate', 'dashboard'] as const,
  },

  // Public/Share domain
  share: {
    all: ['share'] as const,
    candidateProfile: (token: string) => ['share', 'candidate', token] as const,
  },
} as const;
