import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioCard, RadioOption } from './RadioGroup';
import { useState } from 'react';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Grouped radio button input for selecting one option from multiple choices. Used for forms with mutually exclusive options.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const importModeOptions: RadioOption[] = [
  {
    value: 'replace',
    label: 'Substituir dados existentes',
    description: 'Remove todos os registros antigos e importa apenas os novos',
  },
  {
    value: 'merge',
    label: 'Mesclar com dados existentes',
    description: 'Atualiza registros existentes e adiciona novos',
  },
  {
    value: 'skip',
    label: 'Ignorar duplicados',
    description: 'Mantém dados existentes e adiciona apenas registros novos',
  },
];

const planOptions: RadioOption[] = [
  { value: 'free', label: 'Gratuito', description: 'Até 10 candidatos' },
  { value: 'basic', label: 'Básico', description: 'Até 100 candidatos - R$ 99/mês' },
  { value: 'pro', label: 'Profissional', description: 'Candidatos ilimitados - R$ 299/mês' },
];

/**
 * Default radio group
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('merge');
    return (
      <RadioGroup
        name="import-mode"
        options={importModeOptions}
        value={value}
        onChange={setValue}
        label="Modo de Importação"
      />
    );
  },
};

/**
 * With helper text
 */
export const WithHelperText: Story = {
  render: () => {
    const [value, setValue] = useState('merge');
    return (
      <RadioGroup
        name="import-mode"
        options={importModeOptions}
        value={value}
        onChange={setValue}
        label="Modo de Importação"
        helperText="Escolha como os dados do CSV serão importados para o sistema"
      />
    );
  },
};

/**
 * Required field
 */
export const Required: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <RadioGroup
        name="plan"
        options={planOptions}
        value={value}
        onChange={setValue}
        label="Escolha seu plano"
        required
        helperText="Este campo é obrigatório"
      />
    );
  },
};

/**
 * With error state
 */
export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <RadioGroup
        name="plan"
        options={planOptions}
        value={value}
        onChange={setValue}
        label="Escolha seu plano"
        required
        error="Por favor, selecione um plano para continuar"
      />
    );
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState('basic');
    return (
      <RadioGroup
        name="plan-disabled"
        options={planOptions}
        value={value}
        onChange={setValue}
        label="Plano Atual"
        disabled
        helperText="Não é possível alterar o plano no momento"
      />
    );
  },
};

/**
 * Individual disabled option
 */
export const WithDisabledOption: Story = {
  render: () => {
    const [value, setValue] = useState('basic');
    const optionsWithDisabled: RadioOption[] = [
      { value: 'free', label: 'Gratuito', description: 'Até 10 candidatos' },
      {
        value: 'basic',
        label: 'Básico',
        description: 'Até 100 candidatos - R$ 99/mês',
      },
      {
        value: 'pro',
        label: 'Profissional (Esgotado)',
        description: 'Indisponível no momento',
        disabled: true,
      },
    ];

    return (
      <RadioGroup
        name="plan-limited"
        options={optionsWithDisabled}
        value={value}
        onChange={setValue}
        label="Escolha seu plano"
      />
    );
  },
};

/**
 * Horizontal orientation
 */
export const Horizontal: Story = {
  render: () => {
    const [value, setValue] = useState('yes');
    const yesNoOptions: RadioOption[] = [
      { value: 'yes', label: 'Sim' },
      { value: 'no', label: 'Não' },
    ];

    return (
      <RadioGroup
        name="confirm"
        options={yesNoOptions}
        value={value}
        onChange={setValue}
        label="Confirmar importação?"
        orientation="horizontal"
      />
    );
  },
};

/**
 * Simple options (no descriptions)
 */
export const SimpleOptions: Story = {
  render: () => {
    const [value, setValue] = useState('csv');
    const formatOptions: RadioOption[] = [
      { value: 'csv', label: 'CSV' },
      { value: 'excel', label: 'Excel (XLSX)' },
      { value: 'json', label: 'JSON' },
    ];

    return (
      <RadioGroup
        name="file-format"
        options={formatOptions}
        value={value}
        onChange={setValue}
        label="Formato do arquivo"
        helperText="Selecione o formato do arquivo a ser importado"
      />
    );
  },
};

/**
 * Radio cards variant
 */
export const RadioCards: Story = {
  render: () => {
    const [value, setValue] = useState('basic');

    return (
      <div className="space-y-3">
        <legend className="text-sm font-medium text-gray-900 mb-3">
          Escolha seu plano
        </legend>
        <RadioCard
          name="plan-card"
          value="free"
          checked={value === 'free'}
          onChange={() => setValue('free')}
          title="Gratuito"
          description="Até 10 candidatos"
          icon={
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />
        <RadioCard
          name="plan-card"
          value="basic"
          checked={value === 'basic'}
          onChange={() => setValue('basic')}
          title="Básico"
          description="Até 100 candidatos - R$ 99/mês"
          icon={
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <RadioCard
          name="plan-card"
          value="pro"
          checked={value === 'pro'}
          onChange={() => setValue('pro')}
          title="Profissional"
          description="Candidatos ilimitados - R$ 299/mês"
          icon={
            <svg
              className="w-6 h-6 text-secondary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          }
        />
      </div>
    );
  },
};

/**
 * Interactive form example
 */
export const InteractiveForm: Story = {
  render: () => {
    const [mode, setMode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!mode) {
        setError('Por favor, selecione um modo de importação');
        return;
      }
      setError('');
      alert(`Modo selecionado: ${mode}`);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup
          name="import-mode-form"
          options={importModeOptions}
          value={mode}
          onChange={(value) => {
            setMode(value);
            setError('');
          }}
          label="Como deseja importar os dados?"
          required
          error={error}
          helperText={
            !error ? 'Esta escolha afetará como os dados serão processados' : undefined
          }
        />

        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md hover:bg-primary-600"
        >
          Continuar Importação
        </button>
      </form>
    );
  },
};
