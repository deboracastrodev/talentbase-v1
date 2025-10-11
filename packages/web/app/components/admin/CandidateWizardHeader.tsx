/**
 * CandidateWizardHeader Component
 *
 * Header for the candidate creation wizard with back button and title.
 * Extracted from the main wizard page for better component composition.
 *
 * @example
 * <CandidateWizardHeader onBack={() => navigate('/admin/candidates')} />
 */

import { Button } from '@talentbase/design-system';
import { ArrowLeft } from 'lucide-react';

/**
 * Component props
 */
interface CandidateWizardHeaderProps {
  /**
   * Callback when back button is clicked
   */
  onBack: () => void;

  /**
   * Custom title
   * @default 'Criar Candidato Completo'
   */
  title?: string;

  /**
   * Custom subtitle
   * @default 'Preencha o perfil completo do candidato'
   */
  subtitle?: string;
}

/**
 * Header component for candidate wizard
 */
export function CandidateWizardHeader({
  onBack,
  title = 'Criar Candidato Completo',
  subtitle = 'Preencha o perfil completo do candidato',
}: CandidateWizardHeaderProps) {
  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4"
        aria-label="Voltar para lista de candidatos"
      >
        <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
        Voltar para Candidatos
      </Button>

      <div className="flex items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
