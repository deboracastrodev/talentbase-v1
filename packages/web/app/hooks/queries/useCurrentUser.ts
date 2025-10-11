/**
 * Current User Query Hook
 *
 * Fetches and caches the current authenticated user.
 *
 * Benefits:
 * - Automatic caching (no redundant API calls)
 * - Background refetching on stale data
 * - Shared across components (single source of truth)
 *
 * Usage:
 * ```typescript
 * const { data: user, isLoading, isError } = useCurrentUser();
 * ```
 */

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '~/lib/apiClient';
import { queryKeys } from '~/lib/queryClient';

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  is_active: boolean;
}

export function useCurrentUser(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: async (): Promise<CurrentUser> => {
      return apiClient.get<CurrentUser>('/api/v1/auth/me');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
