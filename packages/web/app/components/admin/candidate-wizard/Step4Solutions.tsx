/**
 * Step 4: Solutions & Departments
 * Admin Candidate Creation Wizard
 */

import { DepartmentsSelector } from '~/components/candidate/DepartmentsSelector';
import { SolutionsSelector } from '~/components/candidate/SolutionsSelector';
import type { AdminCandidateFormData } from '~/lib/types/admin-candidate';

interface Step4SolutionsProps {
  formData: AdminCandidateFormData;
  onUpdate: (updates: Partial<AdminCandidateFormData>) => void;
}

export function Step4Solutions({ formData, onUpdate }: Step4SolutionsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Soluções & Departamentos</h3>

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Soluções Vendidas <span className="text-red-500">*</span>
        </p>
        <SolutionsSelector
          selected={formData.solutions_sold}
          onChange={(solutions) => onUpdate({ solutions_sold: solutions })}
        />
        <p className="text-xs text-gray-500 mt-1">Selecione pelo menos uma solução</p>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Departamentos (Buyer Personas) <span className="text-red-500">*</span>
        </p>
        <DepartmentsSelector
          selected={formData.departments_sold_to}
          onChange={(departments) => onUpdate({ departments_sold_to: departments })}
        />
        <p className="text-xs text-gray-500 mt-1">Selecione pelo menos um departamento</p>
      </div>
    </div>
  );
}
