/**
 * Status Confirmation Modal
 *
 * Modal for confirming user status changes with optional reason field.
 * Story 2.5 - AC5, AC7: Campo de motivo para reject/deactivate
 */

import { useState } from 'react';
import { Modal, Button, Input } from '@talentbase/design-system';

interface StatusConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  action: 'approve' | 'reject' | 'activate' | 'deactivate';
  userName: string;
  userRole: string;
}

export function StatusConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  action,
  userName,
  userRole,
}: StatusConfirmModalProps) {
  const [reason, setReason] = useState('');

  // Reset reason when modal closes
  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  // Determine if reason is required
  const reasonRequired = action === 'reject' || action === 'deactivate';

  // Get action-specific text
  const getActionText = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Aprovar Empresa',
          message: `Tem certeza que deseja aprovar ${userName}?`,
          buttonText: 'Aprovar',
          buttonVariant: 'default' as const,
          description: 'A empresa receberá um email de confirmação e poderá acessar a plataforma imediatamente.',
        };
      case 'reject':
        return {
          title: 'Rejeitar Empresa',
          message: `Tem certeza que deseja rejeitar ${userName}?`,
          buttonText: 'Rejeitar',
          buttonVariant: 'destructive' as const,
          description: 'A empresa receberá um email informando que o cadastro não foi aprovado.',
        };
      case 'activate':
        return {
          title: 'Ativar Usuário',
          message: `Tem certeza que deseja ativar ${userName}?`,
          buttonText: 'Ativar',
          buttonVariant: 'default' as const,
          description: 'O usuário receberá um email de confirmação e poderá acessar a plataforma.',
        };
      case 'deactivate':
        return {
          title: 'Desativar Usuário',
          message: `Tem certeza que deseja desativar ${userName}?`,
          buttonText: 'Desativar',
          buttonVariant: 'destructive' as const,
          description: 'O usuário não poderá mais acessar a plataforma.',
        };
    }
  };

  const actionText = getActionText();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={actionText.title}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-900">{actionText.message}</p>
          <p className="mt-2 text-sm text-gray-600">{actionText.description}</p>
        </div>

        {reasonRequired && (
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo {reasonRequired && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id="reason"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o motivo para esta ação..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required={reasonRequired}
            />
            <p className="mt-1 text-xs text-gray-500">
              Este motivo será enviado no email para o usuário.
            </p>
          </div>
        )}

        {!reasonRequired && (
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo (opcional)
            </label>
            <textarea
              id="reason"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite um motivo opcional..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant={actionText.buttonVariant}
            onClick={handleConfirm}
            disabled={isLoading || (reasonRequired && !reason.trim())}
          >
            {isLoading ? 'Processando...' : actionText.buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
