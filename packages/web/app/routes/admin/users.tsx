/**
 * Admin User Management Page
 *
 * Story 2.4 - Task 3: Create management interface
 * Story 2.5.1 - Task 7: Updated to use AdminLayout
 * AC1: Dashboard at /admin/users
 * AC2: Table view with columns
 * AC3: Filter by role
 * AC4: Filter by status
 * AC5: Search by name or email
 * AC6: Click row to open modal
 * AC9: Pagination (20 users/page)
 * AC14: Página /admin/users atualizada para usar AdminLayout
 * AC15: Navegação entre páginas admin funcional (sidebar active highlighting)
 */

import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { Card, Input, Select, Button, useToast } from '@talentbase/design-system';
import { useState } from 'react';

import { UserDetailModal } from '~/components/admin/UserDetailModal';
import { UserTable } from '~/components/admin/UserTable';
import { AdminLayout } from '~/components/layouts/AdminLayout';
import { fetchUsers, fetchUserDetail, updateUserStatus } from '~/lib/api/admin';
import type { User, UserDetail, UsersFilters } from '~/lib/api/admin';
import { requireAdmin, getUserFromToken } from '~/utils/auth.server';

interface LoaderData {
  users: User[];
  totalCount: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  filters: UsersFilters;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  token: string;
}

/**
 * Loader - Fetch users with filters and pagination
 * Requires admin authentication
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Require admin authentication
  const { token } = await requireAdmin(request);

  // Parse URL search params for filters
  const url = new URL(request.url);
  const filters: UsersFilters = {
    role: (url.searchParams.get('role') as UsersFilters['role']) || 'all',
    status: (url.searchParams.get('status') as UsersFilters['status']) || 'all',
    search: url.searchParams.get('search') || '',
    page: parseInt(url.searchParams.get('page') || '1', 10),
  };

  const response = await fetchUsers(filters, token);

  // Get actual user info from token
  const userData = await getUserFromToken(token);
  const user = {
    name: userData?.name || 'Admin User',
    email: userData?.email || 'admin@talentbase.com',
  };

  return json<LoaderData>({
    users: response.results || [],
    totalCount: response.count || 0,
    currentPage: filters.page || 1,
    hasNext: !!response.next,
    hasPrevious: !!response.previous,
    filters,
    user,
    token,
  });
}

export default function AdminUsersPage() {
  const { users, totalCount, currentPage, hasNext, hasPrevious, filters, user, token } =
    useLoaderData<typeof loader>();

  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Local state for filters (controlled inputs)
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  /**
   * Handle user row click - fetch detail and show modal
   */
  const handleUserClick = async (userId: string) => {
    setSelectedUserId(userId);

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
   * Story 3.3.5 - Atualizado para usar Toast notifications
   */
  const handleStatusChange = async (userId: string, isActive: boolean, reason?: string) => {
    setIsUpdatingStatus(true);

    try {
      const updatedUser = await updateUserStatus(userId, isActive, token, reason);

      // Update the selected user with new data
      setSelectedUser(updatedUser);

      // Show success toast notification
      const statusText = isActive
        ? updatedUser.role === 'company'
          ? 'aprovada'
          : 'ativado'
        : updatedUser.role === 'company'
          ? 'rejeitada'
          : 'desativado';

      toast.success(
        `Usuário ${statusText} com sucesso! Uma notificação foi enviada por email.`,
        'Status Atualizado'
      );

      // Refresh the user list after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Erro ao atualizar status do usuário. Tente novamente.', 'Erro');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <AdminLayout pageTitle="User Management" activeItem="users" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h2>
          <p className="mt-1 text-gray-600">
            {totalCount} {totalCount === 1 ? 'usuário encontrado' : 'usuários encontrados'}
          </p>
        </div>

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
                  <Button type="submit" variant="default">
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
          <UserTable users={users} onUserClick={handleUserClick} />

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
              <span className="text-sm text-gray-600">Página {currentPage}</span>
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
          }}
          user={selectedUser}
          onStatusChange={handleStatusChange}
          isUpdating={isUpdatingStatus}
        />
      </div>
    </AdminLayout>
  );
}
