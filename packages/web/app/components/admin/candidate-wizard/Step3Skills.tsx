/**
 * Step 3: Tools & Skills
 * Admin Candidate Creation Wizard
 */

import { Input } from '@talentbase/design-system';

import { LanguageInput } from '~/components/admin/LanguageInput';
import { ToolsSelector } from '~/components/candidate/ToolsSelector';
import type { AdminCandidateFormData } from '~/lib/types/admin-candidate';

interface Step3SkillsProps {
  formData: AdminCandidateFormData;
  onUpdate: (updates: Partial<AdminCandidateFormData>) => void;
}

export function Step3Skills({ formData, onUpdate }: Step3SkillsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Ferramentas & Habilidades</h3>

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Ferramentas e Software <span className="text-red-500">*</span>
        </p>
        <ToolsSelector
          selected={formData.tools_software}
          onChange={(tools) => onUpdate({ tools_software: tools })}
        />
        <p className="text-xs text-gray-500 mt-1">Selecione pelo menos uma ferramenta</p>
      </div>

      <div>
        <label htmlFor="top_skills" className="block text-sm font-medium text-gray-700 mb-2">
          Principais Habilidades (opcional)
        </label>
        <Input
          id="top_skills"
          placeholder="Ex: Negociação, Prospecção, Cold Call (separados por vírgula)"
          value={formData.top_skills?.join(', ') || ''}
          onChange={(e) =>
            onUpdate({
              top_skills: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
        <p className="text-xs text-gray-500 mt-1">Separe as habilidades por vírgula</p>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Idiomas (opcional)</p>
        <LanguageInput
          languages={formData.languages || []}
          onChange={(languages) => onUpdate({ languages })}
        />
      </div>
    </div>
  );
}
