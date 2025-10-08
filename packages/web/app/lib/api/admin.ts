/**
 * Admin API Client
 *
 * Handles API calls for admin user management.
 * Story 2.4 - Task 3
 */

const API_BASE_URL = typeof window !== 'undefined'
  ? window.ENV?.API_URL || 'http://localhost:8000'
  : process.env.API_URL || 'http://localhost:8000';

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

  const url = `${API_BASE_URL}/api/v1/admin/users${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

/**
 * Fetch user detail by ID
 */
export async function fetchUserDetail(
  userId: string,
  token: string
): Promise<UserDetail> {
  const url = `${API_BASE_URL}/api/v1/admin/users/${userId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
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
 */
export async function updateUserStatus(
  userId: string,
  isActive: boolean,
  token: string
): Promise<UserDetail> {
  const url = `${API_BASE_URL}/api/v1/admin/users/${userId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ is_active: isActive }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user status');
  }

  return response.json();
}
