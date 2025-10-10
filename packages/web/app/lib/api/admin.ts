/**
 * Admin API Client
 *
 * Handles API calls for admin user management.
 * Story 2.4 - Task 3
 */

import { buildApiUrl, API_ENDPOINTS } from '~/config/api';

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
  const params = new URLSearchParams();

  if (filters.role && filters.role !== 'all') {
    params.append('role', filters.role);
  }
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }

  const url = buildApiUrl(
    `${API_ENDPOINTS.admin.users}${params.toString() ? `?${params.toString()}` : ''}`
  );

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} - ${errorText}`);

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch user detail by ID
 */
export async function fetchUserDetail(userId: string, token: string): Promise<UserDetail> {
  const url = buildApiUrl(API_ENDPOINTS.admin.userDetail(userId));

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    }
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    throw new Error('Failed to fetch user detail');
  }

  return response.json();
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
  const url = buildApiUrl(API_ENDPOINTS.admin.updateUserStatus(userId));

  const body: { is_active: boolean; reason?: string } = { is_active: isActive };
  if (reason) {
    body.reason = reason;
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to update user status');
  }

  return response.json();
}

/**
 * Get pending approvals count
 * Story 2.5 - AC1: Count empresas pendentes
 */
export async function fetchPendingApprovalsCount(token: string): Promise<number> {
  const url = buildApiUrl(API_ENDPOINTS.admin.pendingCount);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch pending approvals count');
  }

  const data = await response.json();
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
  const url = buildApiUrl(API_ENDPOINTS.admin.stats);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} - ${errorText}`);

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    throw new Error(`Failed to fetch admin stats: ${response.status} - ${errorText}`);
  }

  return response.json();
}
