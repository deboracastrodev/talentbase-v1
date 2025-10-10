/**
 * DepartmentsSelector Component
 *
 * Multi-select checkbox grid for department/buyer persona selection.
 * Extracted from candidate.profile.create.tsx for better reusability.
 * Uses design system Checkbox component for consistency.
 */

import { Checkbox } from '@talentbase/design-system';

interface DepartmentsSelectorProps {
  selected: string[];
  onChange: (departments: string[]) => void;
}

const AVAILABLE_DEPARTMENTS = [
  'C-Level',
  'Marketing',
  'Vendas',
  'TI/Tecnologia',
  'Financeiro',
  'RH',
  'Operações',
  'Produto',
];

export function DepartmentsSelector({ selected, onChange }: DepartmentsSelectorProps) {
  const toggleDepartment = (department: string) => {
    if (selected.includes(department)) {
      onChange(selected.filter((d) => d !== department));
    } else {
      onChange([...selected, department]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {AVAILABLE_DEPARTMENTS.map((department) => (
        <label
          key={department}
          className={`
            flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors
            ${
              selected.includes(department)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <Checkbox
            checked={selected.includes(department)}
            onChange={() => toggleDepartment(department)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">{department}</span>
        </label>
      ))}
    </div>
  );
}
