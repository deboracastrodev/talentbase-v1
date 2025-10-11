/**
 * Admin Candidates List Query Hook
 *
 * Fetches paginated list of candidates for admin panel.
 *
 * Features:
 * - Automatic caching per filter combination
 * - Background refetching
 * - Pagination support
 *
 * Usage:
 * ```typescript
 * const { data, isLoading } = useAdminCandidates({
 *   page: 1,
 *   search: 'John'
 * });
 * ```
 */

import { useQuery } from '@tanstack/react-query';

import { apiServer } from '~/lib/apiServer';
import { queryKeys } from '~/lib/queryClient';

export interface AdminCandidatesFilters {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export interface Candidate {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  current_position?: string;
  years_of_experience?: number;
  status?: 'available' | 'hired' | 'inactive';
  profile_photo_url?: string;
  created_at: string;
  import_source?: 'csv' | 'registration';
}

export interface AdminCandidatesResponse {
  results: Candidate[];
  count: number;
  next: string | null;
  previous: string | null;
}

export function useAdminCandidates(
  token: string,
  filters: AdminCandidatesFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.admin.candidates.list(filters),
    queryFn: async (): Promise<AdminCandidatesResponse> => {
      const params: Record<string, string> = {
        page: String(filters.page || 1),
        page_size: String(filters.page_size || 20),
      };

      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== 'all') params.status = filters.status;

      return apiServer.get<AdminCandidatesResponse>('/api/v1/candidates/admin/candidates', {
        token,
        params,
      });
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}
