/**
 * Admin User Management Page
 *
 * Story 2.4 - Task 3: Create management interface
 * AC1: Dashboard at /admin/users
 * AC2: Table view with columns
 * AC3: Filter by role
 * AC4: Filter by status
 * AC5: Search by name or email
 * AC6: Click row to open modal
 * AC9: Pagination (20 users/page)
 */

import { useState } from 'react';
import { json, redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import {
  Card,
  Input,
  Select,
  Button,
} from '@talentbase/design-system';
import { UserTable } from '~/components/admin/UserTable';
import { UserDetailModal } from '~/components/admin/UserDetailModal';
import { fetchUsers, fetchUserDetail, updateUserStatus } from '~/lib/api/admin';
import type { User, UserDetail, UsersFilters } from '~/lib/api/admin';

interface LoaderData {
  users: User[];
  totalCount: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  filters: UsersFilters;
}

/**
 * Loader - Fetch users with filters and pagination
 * Requires admin authentication
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Get auth token from cookie (assuming session-based auth)
  const cookieHeader = request.headers.get('Cookie');
  const token = cookieHeader?.match(/auth_token=([^;]+)/)?.[1];

  console.log('[Admin Loader] Cookie header:', cookieHeader ? 'present' : 'missing');
  console.log('[Admin Loader] Token extracted:', token ? 'yes' : 'no');

  if (!token) {
    console.log('[Admin Loader] No token found, redirecting to login');
    return redirect('/auth/login');
  }

  // Parse URL search params for filters
  const url = new URL(request.url);
  const filters: UsersFilters = {
    role: (url.searchParams.get('role') as UsersFilters['role']) || 'all',
    status: (url.searchParams.get('status') as UsersFilters['status']) || 'all',
    search: url.searchParams.get('search') || '',
    page: parseInt(url.searchParams.get('page') || '1', 10),
  };

  try {
    const response = await fetchUsers(filters, token);
    console.log('[Admin Loader] API Response:', {
      count: response.count,
      resultsLength: response.results?.length,
      hasResults: !!response.results
    });

    return json<LoaderData>({
      users: response.results || [],
      totalCount: response.count || 0,
      currentPage: filters.page || 1,
      hasNext: !!response.next,
      hasPrevious: !!response.previous,
      filters,
    });
  } catch (error) {
    console.error('[Admin Loader] Error:', error);
    // Handle auth errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return redirect('/auth/login');
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      throw new Response('Access Denied: Admin only', { status: 403 });
    }
    throw error;
  }
}

export default function AdminUsersPage() {
  const { users, totalCount, currentPage, hasNext, hasPrevious, filters } =
    useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Local state for filters (controlled inputs)
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  /**
   * Handle user row click - fetch detail and show modal
   */
  const handleUserClick = async (userId: string) => {
    setSelectedUserId(userId);

    // Fetch user details
    const cookieHeader = document.cookie;
    const token = cookieHeader?.match(/auth_token=([^;]+)/)?.[1];

    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    try {
      const userDetail = await fetchUserDetail(userId, token);
      setSelectedUser(userDetail);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching user detail:', error);
      alert('Erro ao carregar detalhes do usuário');
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    // Reset to page 1 when filters change
    newParams.delete('page');

    setSearchParams(newParams);
  };

  /**
   * Handle search submit
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('search', localSearch);
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  /**
   * Handle status change (AC7, AC8)
   * Story 2.5 - AC5, AC7: Adiciona suporte para campo motivo
   */
  const handleStatusChange = async (userId: string, isActive: boolean, reason?: string) => {
    setIsUpdatingStatus(true);
    setFeedback(null);

    const cookieHeader = document.cookie;
    const token = cookieHeader?.match(/auth_token=([^;]+)/)?.[1];

    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    try {
      const updatedUser = await updateUserStatus(userId, isActive, token, reason);

      // Update the selected user with new data
      setSelectedUser(updatedUser);

      // Show success feedback
      const statusText = isActive
        ? (updatedUser.role === 'company' ? 'aprovada' : 'ativado')
        : (updatedUser.role === 'company' ? 'rejeitada' : 'desativado');
      setFeedback({
        type: 'success',
        message: `Usuário ${statusText} com sucesso! Uma notificação foi enviada por email.`
      });

      // Refresh the user list after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error updating user status:', error);
      setFeedback({
        type: 'error',
        message: 'Erro ao atualizar status do usuário. Tente novamente.'
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        <p className="mt-2 text-gray-600">
          {totalCount} {totalCount === 1 ? 'usuário encontrado' : 'usuários encontrados'}
        </p>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            feedback.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <p className="text-sm font-medium">{feedback.message}</p>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-6">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por nome ou email
              </label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  type="text"
                  placeholder="Digite o nome ou email..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="primary">
                  Buscar
                </Button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por função
                </label>
                <Select
                  id="role"
                  value={filters.role || 'all'}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  options={[
                    { value: 'all', label: 'Todas' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'candidate', label: 'Candidato' },
                    { value: 'company', label: 'Empresa' },
                  ]}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por status
                </label>
                <Select
                  id="status"
                  value={filters.status || 'all'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'active', label: 'Ativo' },
                    { value: 'pending', label: 'Pendente' },
                    { value: 'inactive', label: 'Inativo' },
                  ]}
                />
              </div>
            </div>
          </form>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <UserTable
          users={users}
          onUserClick={handleUserClick}
        />

        {/* Pagination */}
        {(hasNext || hasPrevious) && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevious}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {currentPage}
            </span>
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
            >
              Próxima
            </Button>
          </div>
        )}
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          setSelectedUserId(null);
          setFeedback(null);
        }}
        user={selectedUser}
        onStatusChange={handleStatusChange}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
}
