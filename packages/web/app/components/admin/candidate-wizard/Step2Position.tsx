/**
 * Step 2: Position & Experience
 * Admin Candidate Creation Wizard
 */

import { Input, Select, Textarea } from '@talentbase/design-system';

import { POSITION_OPTIONS, SALES_TYPE_OPTIONS } from '~/lib/constants/admin-candidate';
import type { AdminCandidateFormData } from '~/lib/types/admin-candidate';

interface Step2PositionProps {
  formData: AdminCandidateFormData;
  onUpdate: (updates: Partial<AdminCandidateFormData>) => void;
}

export function Step2Position({ formData, onUpdate }: Step2PositionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Posição & Experiência</h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="current_position"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Posição Atual <span className="text-red-500">*</span>
          </label>
          <Select
            id="current_position"
            value={formData.current_position}
            onChange={(e) => onUpdate({ current_position: e.target.value })}
            options={POSITION_OPTIONS}
            required
          />
        </div>

        <div>
          <label
            htmlFor="years_of_experience"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Anos de Experiência <span className="text-red-500">*</span>
          </label>
          <Input
            id="years_of_experience"
            type="number"
            min="0"
            value={formData.years_of_experience}
            onChange={(e) => onUpdate({ years_of_experience: parseInt(e.target.value) || 0 })}
            required
          />
        </div>

        <div>
          <label htmlFor="sales_type" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Vendas <span className="text-red-500">*</span>
          </label>
          <Select
            id="sales_type"
            value={formData.sales_type}
            onChange={(e) => onUpdate({ sales_type: e.target.value })}
            options={SALES_TYPE_OPTIONS}
            required
          />
        </div>

        <div>
          <label htmlFor="sales_cycle" className="block text-sm font-medium text-gray-700 mb-2">
            Ciclo de Vendas (opcional)
          </label>
          <Input
            id="sales_cycle"
            placeholder="Ex: 30-60 dias"
            value={formData.sales_cycle || ''}
            onChange={(e) => onUpdate({ sales_cycle: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="avg_ticket" className="block text-sm font-medium text-gray-700 mb-2">
            Ticket Médio (opcional)
          </label>
          <Input
            id="avg_ticket"
            placeholder="Ex: R$ 10k-50k MRR"
            value={formData.avg_ticket || ''}
            onChange={(e) => onUpdate({ avg_ticket: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="academic_degree" className="block text-sm font-medium text-gray-700 mb-2">
            Formação Acadêmica (opcional)
          </label>
          <Input
            id="academic_degree"
            placeholder="Ex: Ensino Superior Completo, MBA"
            value={formData.academic_degree || ''}
            onChange={(e) => onUpdate({ academic_degree: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio Profissional (opcional)
          </label>
          <Textarea
            id="bio"
            placeholder="Descreva brevemente a experiência profissional do candidato..."
            value={formData.bio || ''}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
