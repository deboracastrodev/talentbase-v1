/**
 * User Table Component
 *
 * Displays users in a table with filtering and pagination.
 * Story 2.4 - Task 3 (AC2, AC3, AC4, AC5, AC9)
 */

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from '@talentbase/design-system';
import type { User } from '~/lib/api/admin';

interface UserTableProps {
  users: User[];
  onUserClick: (userId: string) => void;
  isLoading?: boolean;
}

export function UserTable({ users, onUserClick, isLoading = false }: UserTableProps) {
  // Safety check: ensure users is an array
  if (!users || !Array.isArray(users)) {
    console.error('[UserTable] users prop is invalid:', users);
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg">
        <p className="text-red-600">Erro: Dados de usuários não disponíveis.</p>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'candidate':
        return 'Candidato';
      case 'company':
        return 'Empresa';
      default:
        return role;
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'inactive':
        return 'Inativo';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            clickable
            onClick={() => onUserClick(user.id)}
          >
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell className="text-gray-600">{user.email}</TableCell>
            <TableCell>
              <Badge variant="secondary">{getRoleName(user.role)}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {getStatusName(user.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-600">
              {new Date(user.created_at).toLocaleDateString('pt-BR')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
