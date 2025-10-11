/**
 * Step 2: Position & Experience
 * Admin Candidate Creation Wizard
 */

import { FormField, Input, Select, Textarea } from '@talentbase/design-system';

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
        <FormField label="Posição Atual" required>
          <Select
            id="current_position"
            value={formData.current_position}
            onChange={(e) => onUpdate({ current_position: e.target.value })}
            options={POSITION_OPTIONS}
            required
          />
        </FormField>

        <FormField label="Anos de Experiência" required>
          <Input
            id="years_of_experience"
            type="number"
            min="0"
            max="50"
            value={formData.years_of_experience}
            onChange={(e) => onUpdate({ years_of_experience: parseInt(e.target.value) || 0 })}
            required
          />
        </FormField>

        <FormField label="Tipo de Vendas" required>
          <Select
            id="sales_type"
            value={formData.sales_type}
            onChange={(e) => onUpdate({ sales_type: e.target.value })}
            options={SALES_TYPE_OPTIONS}
            required
          />
        </FormField>

        <FormField label="Ciclo de Vendas" hint="Informe o tempo médio do ciclo de vendas">
          <Input
            id="sales_cycle"
            placeholder="Ex: 30-60 dias"
            value={formData.sales_cycle || ''}
            onChange={(e) => onUpdate({ sales_cycle: e.target.value })}
          />
        </FormField>

        <FormField label="Ticket Médio" hint="Valor médio das vendas realizadas">
          <Input
            id="avg_ticket"
            placeholder="Ex: R$ 10k-50k MRR"
            value={formData.avg_ticket || ''}
            onChange={(e) => onUpdate({ avg_ticket: e.target.value })}
          />
        </FormField>

        <FormField label="Formação Acadêmica">
          <Input
            id="academic_degree"
            placeholder="Ex: Ensino Superior Completo, MBA"
            value={formData.academic_degree || ''}
            onChange={(e) => onUpdate({ academic_degree: e.target.value })}
          />
        </FormField>

        <FormField label="Bio Profissional" hint="Resumo da experiência e trajetória profissional">
          <Textarea
            id="bio"
            placeholder="Descreva brevemente a experiência profissional do candidato..."
            value={formData.bio || ''}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            rows={4}
          />
        </FormField>
      </div>
    </div>
  );
}
