/**
 * SolutionsSelector Component
 *
 * Multi-select checkbox grid for solutions/industries selection.
 * Extracted from candidate.profile.create.tsx for better reusability.
 * Uses design system Checkbox component for consistency.
 */

import { Checkbox } from '@talentbase/design-system';

interface SolutionsSelectorProps {
  selected: string[];
  onChange: (solutions: string[]) => void;
}

const AVAILABLE_SOLUTIONS = [
  'SaaS B2B',
  'Fintech',
  'HR Tech',
  'Marketing Tech',
  'Sales Tech',
  'E-commerce',
  'Educação',
  'Saúde',
  'Logística',
  'Serviços Profissionais',
];

export function SolutionsSelector({ selected, onChange }: SolutionsSelectorProps) {
  const toggleSolution = (solution: string) => {
    if (selected.includes(solution)) {
      onChange(selected.filter((s) => s !== solution));
    } else {
      onChange([...selected, solution]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {AVAILABLE_SOLUTIONS.map((solution) => (
        <label
          key={solution}
          className={`
            flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors
            ${
              selected.includes(solution)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <Checkbox
            checked={selected.includes(solution)}
            onChange={() => toggleSolution(solution)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">{solution}</span>
        </label>
      ))}
    </div>
  );
}
