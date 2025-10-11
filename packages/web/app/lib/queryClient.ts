/**
 * React Query Configuration
 *
 * Central configuration for TanStack Query (React Query).
 * Provides caching, data synchronization, and server state management.
 *
 * Features:
 * - Smart caching with automatic background refetching
 * - Optimistic updates
 * - Request deduplication
 * - Automatic retry logic
 * - DevTools integration (development only)
 *
 * @see https://tanstack.com/query/latest/docs/react/overview
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create QueryClient instance with default configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time
      staleTime: 1 * 60 * 1000, // 1 minute - data is fresh for this long
      gcTime: 5 * 60 * 1000, // 5 minutes - cache garbage collection time (renamed from cacheTime in v5)

      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 2 times on 5xx errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

      // Refetch behavior
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab (can be enabled per-query)
      refetchOnReconnect: true, // Refetch when internet connection is restored
      refetchOnMount: true, // Refetch when component mounts

      // Network mode
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      // Retry mutations only once on failure
      retry: 1,
      retryDelay: 1000,

      // Global mutation error handler
      onError: (error: any) => {
        console.error('[Mutation Error]:', error);
        // You can add toast notifications here if needed
        // toast.error(error?.message || 'Algo deu errado. Tente novamente.');
      },
    },
  },
});

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
