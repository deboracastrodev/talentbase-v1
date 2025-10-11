/**
 * Step 5: Work Preferences
 * Admin Candidate Creation Wizard
 */

import { Checkbox, Input, Select, Textarea } from '@talentbase/design-system';

import { WORK_MODEL_OPTIONS } from '~/lib/constants/admin-candidate';
import type { AdminCandidateFormData } from '~/lib/types/admin-candidate';

interface Step5PreferencesProps {
  formData: AdminCandidateFormData;
  onUpdate: (updates: Partial<AdminCandidateFormData>) => void;
}

export function Step5Preferences({ formData, onUpdate }: Step5PreferencesProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Preferências de Trabalho</h3>
      <p className="text-sm text-gray-600">Todos os campos desta etapa são opcionais</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="work_model" className="block text-sm font-medium text-gray-700 mb-2">
            Modelo de Trabalho
          </label>
          <Select
            id="work_model"
            value={formData.work_model || ''}
            onChange={(e) =>
              onUpdate({ work_model: e.target.value as 'remote' | 'hybrid' | 'onsite' | '' })
            }
            options={WORK_MODEL_OPTIONS}
          />
        </div>

        <div>
          <label
            htmlFor="relocation_availability"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Disponibilidade para Mudança
          </label>
          <Input
            id="relocation_availability"
            placeholder="Ex: Sim, Não, Depende da oportunidade"
            value={formData.relocation_availability || ''}
            onChange={(e) => onUpdate({ relocation_availability: e.target.value })}
          />
        </div>

        <div>
          <label
            htmlFor="travel_availability"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Disponibilidade para Viagens
          </label>
          <Input
            id="travel_availability"
            placeholder="Ex: Sim semanalmente, Eventualmente, Não"
            value={formData.travel_availability || ''}
            onChange={(e) => onUpdate({ travel_availability: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="accepts_pj"
            checked={formData.accepts_pj || false}
            onCheckedChange={(checked) => onUpdate({ accepts_pj: checked as boolean })}
          />
          <label htmlFor="accepts_pj" className="text-sm font-medium text-gray-700 cursor-pointer">
            Aceita contrato PJ
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="pcd"
            checked={formData.pcd || false}
            onCheckedChange={(checked) =>
              onUpdate({
                pcd: checked as boolean,
                is_pcd: checked as boolean,
              })
            }
          />
          <label htmlFor="pcd" className="text-sm font-medium text-gray-700 cursor-pointer">
            Pessoa com Deficiência (PCD)
          </label>
        </div>

        <div>
          <label
            htmlFor="position_interest"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Posição de Interesse
          </label>
          <Input
            id="position_interest"
            placeholder="Ex: Account Manager/CSM, SDR, AE"
            value={formData.position_interest || ''}
            onChange={(e) => onUpdate({ position_interest: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="minimum_salary" className="block text-sm font-medium text-gray-700 mb-2">
            Remuneração Mínima Mensal (R$)
          </label>
          <Input
            id="minimum_salary"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.minimum_salary || ''}
            onChange={(e) => onUpdate({ minimum_salary: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="salary_notes" className="block text-sm font-medium text-gray-700 mb-2">
            Observações sobre Remuneração
          </label>
          <Textarea
            id="salary_notes"
            placeholder="Ex: Valores negociáveis, preferência por variável, etc."
            value={formData.salary_notes || ''}
            onChange={(e) => onUpdate({ salary_notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_drivers_license"
            checked={formData.has_drivers_license || false}
            onCheckedChange={(checked) => onUpdate({ has_drivers_license: checked as boolean })}
          />
          <label
            htmlFor="has_drivers_license"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Possui CNH
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_vehicle"
            checked={formData.has_vehicle || false}
            onCheckedChange={(checked) => onUpdate({ has_vehicle: checked as boolean })}
          />
          <label htmlFor="has_vehicle" className="text-sm font-medium text-gray-700 cursor-pointer">
            Possui veículo próprio
          </label>
        </div>
      </div>
    </div>
  );
}
