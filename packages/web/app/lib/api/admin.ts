/**
 * Admin API Client
 *
 * Handles API calls for admin user management using centralized apiServer.
 * Story 2.4 - Task 3
 */

import { apiServer } from '~/lib/apiServer';
import { API_ENDPOINTS } from '~/config/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'candidate' | 'company';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

export interface UserDetail extends User {
  is_active: boolean;
  updated_at: string;
  profile?: {
    full_name?: string;
    phone?: string;
    company_name?: string;
    website?: string;
    contact_person_name?: string;
    contact_person_email?: string;
    contact_person_phone?: string;
  };
}

export interface UsersListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface UsersFilters {
  role?: 'all' | 'admin' | 'candidate' | 'company';
  status?: 'all' | 'active' | 'inactive' | 'pending';
  search?: string;
  page?: number;
}

/**
 * Fetch users list with filters and pagination
 */
export async function fetchUsers(
  filters: UsersFilters = {},
  token: string
): Promise<UsersListResponse> {
  const params: Record<string, string | number> = {};

  if (filters.role && filters.role !== 'all') {
    params.role = filters.role;
  }
  if (filters.status && filters.status !== 'all') {
    params.status = filters.status;
  }
  if (filters.search) {
    params.search = filters.search;
  }
  if (filters.page) {
    params.page = filters.page;
  }

  return apiServer.get<UsersListResponse>(API_ENDPOINTS.admin.users, { token, params });
}

/**
 * Fetch user detail by ID
 */
export async function fetchUserDetail(userId: string, token: string): Promise<UserDetail> {
  return apiServer.get<UserDetail>(API_ENDPOINTS.admin.userDetail(userId), { token });
}

/**
 * Update user status (Task 4)
 * Story 2.5 - AC5, AC7: Adiciona suporte para campo motivo
 */
export async function updateUserStatus(
  userId: string,
  isActive: boolean,
  token: string,
  reason?: string
): Promise<UserDetail> {
  const body: { is_active: boolean; reason?: string } = { is_active: isActive };
  if (reason) {
    body.reason = reason;
  }

  return apiServer.patch<UserDetail>(API_ENDPOINTS.admin.updateUserStatus(userId), body, {
    token,
  });
}

/**
 * Get pending approvals count
 * Story 2.5 - AC1: Count empresas pendentes
 */
export async function fetchPendingApprovalsCount(token: string): Promise<number> {
  const data = await apiServer.get<{ count: number }>(API_ENDPOINTS.admin.pendingCount, {
    token,
  });
  return data.count;
}

/**
 * Admin dashboard stats
 * Story 2.5.1 - AC16: Get admin dashboard statistics
 */
export interface AdminStats {
  total_users: number;
  total_candidates: number;
  total_companies: number;
  total_admins: number;
  pending_approvals: number;
  active_jobs: number;
  recent_activity: Array<{
    id: string;
    type: string;
    user_email: string;
    user_role: string;
    timestamp: string;
  }>;
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  return apiServer.get<AdminStats>(API_ENDPOINTS.admin.stats, { token });
}
