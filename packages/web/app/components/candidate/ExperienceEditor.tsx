/**
 * ExperienceEditor Component
 *
 * Dynamic list editor for professional experiences.
 * Extracted from candidate.profile.create.tsx for better reusability.
 * Uses design system Input, Textarea, and Button components.
 */

import { Input, Textarea, Button } from '@talentbase/design-system';

export interface Experience {
  company_name: string;
  position: string;
  start_date: string;
  end_date: string;
  responsibilities: string;
}

interface ExperienceEditorProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

export function ExperienceEditor({ experiences, onChange }: ExperienceEditorProps) {
  const addExperience = () => {
    onChange([
      ...experiences,
      {
        company_name: '',
        position: '',
        start_date: '',
        end_date: '',
        responsibilities: '',
      },
    ]);
  };

  const updateExperience = (index: number, updates: Partial<Experience>) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-md">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              Experiência {index + 1}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeExperience(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remover
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`company-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <Input
                id={`company-${index}`}
                type="text"
                required
                value={exp.company_name}
                onChange={(e) => updateExperience(index, { company_name: e.target.value })}
                placeholder="Nome da empresa"
              />
            </div>

            <div>
              <label htmlFor={`position-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                Cargo *
              </label>
              <Input
                id={`position-${index}`}
                type="text"
                required
                value={exp.position}
                onChange={(e) => updateExperience(index, { position: e.target.value })}
                placeholder="SDR, AE, etc."
              />
            </div>

            <div>
              <label htmlFor={`start-date-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início *
              </label>
              <Input
                id={`start-date-${index}`}
                type="date"
                required
                value={exp.start_date}
                onChange={(e) => updateExperience(index, { start_date: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor={`end-date-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                Data de Término
              </label>
              <Input
                id={`end-date-${index}`}
                type="date"
                value={exp.end_date}
                onChange={(e) => updateExperience(index, { end_date: e.target.value })}
                placeholder="Deixe em branco se emprego atual"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor={`responsibilities-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
              Responsabilidades
            </label>
            <Textarea
              id={`responsibilities-${index}`}
              rows={3}
              value={exp.responsibilities}
              onChange={(e) => updateExperience(index, { responsibilities: e.target.value })}
              placeholder="Descreva suas principais responsabilidades e conquistas..."
            />
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addExperience}
        className="w-full"
      >
        + Adicionar Experiência
      </Button>
    </div>
  );
}
