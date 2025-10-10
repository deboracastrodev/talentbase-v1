/**
 * ToolsSelector Component
 *
 * Multi-select checkbox grid for sales tools/software selection.
 * Extracted from candidate.profile.create.tsx for better reusability.
 * Uses design system Checkbox component for consistency.
 */

import { Checkbox } from '@talentbase/design-system';

interface ToolsSelectorProps {
  selected: string[];
  onChange: (tools: string[]) => void;
}

const AVAILABLE_TOOLS = [
  'Salesforce',
  'HubSpot',
  'Pipedrive',
  'RD Station',
  'Apollo.io',
  'Outreach',
  'SalesLoft',
  'LinkedIn Sales Navigator',
  'ZoomInfo',
  'Exact Sales',
  'Meetime',
];

export function ToolsSelector({ selected, onChange }: ToolsSelectorProps) {
  const toggleTool = (tool: string) => {
    if (selected.includes(tool)) {
      onChange(selected.filter((t) => t !== tool));
    } else {
      onChange([...selected, tool]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {AVAILABLE_TOOLS.map((tool) => (
        <label
          key={tool}
          className={`
            flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors
            ${
              selected.includes(tool)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <Checkbox
            checked={selected.includes(tool)}
            onChange={() => toggleTool(tool)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">{tool}</span>
        </label>
      ))}
    </div>
  );
}
