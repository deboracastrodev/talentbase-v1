/**
 * Admin Candidates Management Page
 *
 * Story 3.3 - AC10: Candidatos importados visíveis na lista admin
 * Route: /admin/candidates
 * View and manage all candidates in the system
 */

import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams, Link } from '@remix-run/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Avatar,
} from '@talentbase/design-system';
import { Search, Upload, Eye, User } from 'lucide-react';
import { useState } from 'react';

import { AdminLayout } from '~/components/layouts/AdminLayout';
import { getApiBaseUrl } from '~/config/api';
import { requireAdmin, getUserFromToken } from '~/utils/auth.server';

interface Candidate {
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

interface LoaderData {
  candidates: Candidate[];
  totalCount: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  filters: {
    search: string;
    status: string;
    page: number;
  };
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

/**
 * Loader - Fetch candidates with filters and pagination
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireAdmin(request);

  // Parse URL search params
  const url = new URL(request.url);
  const filters = {
    search: url.searchParams.get('search') || '',
    status: url.searchParams.get('status') || 'all',
    page: parseInt(url.searchParams.get('page') || '1', 10),
  };

  try {
    const apiBaseUrl = getApiBaseUrl();

    // Build query params
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status !== 'all') params.append('status', filters.status);
    params.append('page', filters.page.toString());
    params.append('page_size', '20');

    // Fetch candidates from API
    const response = await fetch(
      `${apiBaseUrl}/api/v1/candidates/admin/candidates?${params.toString()}`,
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch candidates');
    }

    const data = await response.json();

    // Get user info
    const userData = await getUserFromToken(token);
    const user = {
      name: userData?.name || 'Admin User',
      email: userData?.email || 'admin@talentbase.com',
    };

    return json<LoaderData>({
      candidates: data.results || [],
      totalCount: data.count || 0,
      currentPage: filters.page,
      hasNext: !!data.next,
      hasPrevious: !!data.previous,
      filters,
      user,
    });
  } catch (error) {
    console.error('[Admin Candidates Loader] Error:', error);

    // Return mock data for development
    const user = {
      name: 'Admin User',
      email: 'admin@talentbase.com',
    };

    return json<LoaderData>({
      candidates: [],
      totalCount: 0,
      currentPage: 1,
      hasNext: false,
      hasPrevious: false,
      filters,
      user,
    });
  }
}

export default function AdminCandidatesPage() {
  const { candidates, totalCount, currentPage, hasNext, hasPrevious, filters, user } =
    useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localSearch) {
      newParams.set('search', localSearch);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1'); // Reset to page 1 on new search
    setSearchParams(newParams);
  };

  const handleStatusChange = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status && status !== 'all') {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">Disponível</Badge>;
      case 'hired':
        return <Badge variant="default">Contratado</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  return (
    <AdminLayout pageTitle="Candidatos" activeItem="candidates" user={user}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Candidatos</h2>
            <p className="text-gray-600 mt-1">
              {totalCount} candidato{totalCount !== 1 ? 's' : ''} no sistema
            </p>
          </div>
          <Link to="/admin/import/candidates">
            <Button variant="default">
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
          </Link>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      type="text"
                      placeholder="Nome, email ou telefone..."
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    id="status"
                    value={filters.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    options={[
                      { value: 'all', label: 'Todos' },
                      { value: 'available', label: 'Disponível' },
                      { value: 'hired', label: 'Contratado' },
                      { value: 'inactive', label: 'Inativo' },
                    ]}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Candidates Table */}
        <Card>
          <CardContent className="p-0">
            {candidates.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Nenhum candidato encontrado</p>
                <p className="text-sm text-gray-500 mb-4">
                  Importe candidatos via CSV ou aguarde que candidatos se registrem
                </p>
                <Link to="/admin/import/candidates">
                  <Button variant="default">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Candidatos
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidato</TableHead>
                      <TableHead>Posição</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Experiência</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Cadastro</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={candidate.profile_photo_url}
                              alt={candidate.full_name}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{candidate.full_name}</p>
                              {candidate.email && (
                                <p className="text-sm text-gray-500">{candidate.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {candidate.current_position || <span className="text-gray-400">—</span>}
                        </TableCell>
                        <TableCell>
                          {candidate.city || <span className="text-gray-400">—</span>}
                        </TableCell>
                        <TableCell>
                          {candidate.years_of_experience ? (
                            `${candidate.years_of_experience} anos`
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(candidate.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Open candidate detail modal or navigate to detail page
                              console.log('View candidate:', candidate.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalCount > 20 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Página {currentPage} - Mostrando {candidates.length} de {totalCount} candidatos
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!hasPrevious}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={!hasNext}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
