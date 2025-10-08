/**
 * User Detail Modal Component
 *
 * Displays detailed user information in a modal.
 * Story 2.4 - Task 3 (AC6), Task 4 (AC7)
 */

import { Modal, Badge, Button } from '@talentbase/design-system';
import type { UserDetail } from '~/lib/api/admin';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDetail | null;
  onStatusChange?: (userId: string, isActive: boolean) => void;
  isUpdating?: boolean;
}

export function UserDetailModal({ isOpen, onClose, user, onStatusChange, isUpdating = false }: UserDetailModalProps) {
  if (!user) return null;

  const handleStatusToggle = () => {
    if (onStatusChange && !isUpdating) {
      onStatusChange(user.id, !user.is_active);
    }
  };

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
        return 'Administrador';
      case 'candidate':
        return 'Candidato';
      case 'company':
        return 'Empresa';
      default:
        return role;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Usuário"
      size="lg"
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nome</label>
            <p className="mt-1 text-sm text-gray-900">{user.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Função</label>
            <div className="mt-1">
              <Badge variant="secondary">{getRoleName(user.role)}</Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="mt-1">
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {user.status === 'active' ? 'Ativo' : user.status === 'pending' ? 'Pendente' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        {user.profile && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Informações do Perfil</h3>

            {user.role === 'candidate' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                  <p className="mt-1 text-sm text-gray-900">{user.profile.full_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Telefone</label>
                  <p className="mt-1 text-sm text-gray-900">{user.profile.phone || '-'}</p>
                </div>
              </div>
            )}

            {user.role === 'company' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nome da Empresa</label>
                    <p className="mt-1 text-sm text-gray-900">{user.profile.company_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Website</label>
                    <p className="mt-1 text-sm text-gray-900">{user.profile.website || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Pessoa de Contato</label>
                    <p className="mt-1 text-sm text-gray-900">{user.profile.contact_person_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email de Contato</label>
                    <p className="mt-1 text-sm text-gray-900">{user.profile.contact_person_email || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Telefone de Contato</label>
                  <p className="mt-1 text-sm text-gray-900">{user.profile.contact_person_phone || '-'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Metadados</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Criado em</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Atualizado em</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user.updated_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Status Change Actions (AC7) */}
        {onStatusChange && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Ações de Status</h3>
            <div className="flex items-center gap-3">
              {user.is_active ? (
                <Button
                  variant="destructive"
                  onClick={handleStatusToggle}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Desativando...' : 'Desativar Usuário'}
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleStatusToggle}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Ativando...' : user.role === 'company' ? 'Aprovar Empresa' : 'Ativar Usuário'}
                </Button>
              )}
              <p className="text-sm text-gray-600">
                {user.is_active
                  ? 'Desativar impedirá o acesso do usuário à plataforma.'
                  : user.role === 'company'
                  ? 'Aprovar permitirá que a empresa acesse a plataforma.'
                  : 'Ativar permitirá que o usuário acesse a plataforma.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
