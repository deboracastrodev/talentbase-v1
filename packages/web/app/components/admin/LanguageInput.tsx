/**
 * LanguageInput Component
 * Story 3.3.5: Admin candidate creation with languages input
 *
 * Allows adding multiple languages with proficiency levels.
 */

import { Button, Input, Select } from '@talentbase/design-system';
import { X } from 'lucide-react';
import { useState } from 'react';

export interface Language {
  name: string;
  level: string;
}

interface LanguageInputProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
}

const PROFICIENCY_LEVELS = [
  { value: 'Básico', label: 'Básico' },
  { value: 'Intermediário', label: 'Intermediário' },
  { value: 'Avançado', label: 'Avançado' },
  { value: 'Fluente', label: 'Fluente' },
  { value: 'Nativo', label: 'Nativo' },
];

export function LanguageInput({ languages, onChange }: LanguageInputProps) {
  const [newLanguage, setNewLanguage] = useState<Language>({
    name: '',
    level: 'Intermediário',
  });

  const addLanguage = () => {
    if (newLanguage.name.trim()) {
      onChange([...languages, newLanguage]);
      setNewLanguage({ name: '', level: 'Intermediário' });
    }
  };

  const removeLanguage = (index: number) => {
    onChange(languages.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLanguage();
    }
  };

  return (
    <div className="space-y-3">
      {/* List of added languages */}
      {languages.map((lang, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200"
        >
          <div className="flex-1">
            <span className="font-medium text-gray-900">{lang.name}</span>
            <span className="text-gray-600 text-sm ml-2">- {lang.level}</span>
          </div>
          <button
            type="button"
            onClick={() => removeLanguage(index)}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            aria-label={`Remover ${lang.name}`}
          >
            <X size={16} />
          </button>
        </div>
      ))}

      {/* Add new language form */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Nome do idioma"
            value={newLanguage.name}
            onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="w-40">
          <Select
            value={newLanguage.level}
            onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
            options={PROFICIENCY_LEVELS}
          />
        </div>
        <Button type="button" onClick={addLanguage} variant="secondary" size="sm">
          Adicionar
        </Button>
      </div>

      {languages.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum idioma adicionado ainda</p>
      )}
    </div>
  );
}
