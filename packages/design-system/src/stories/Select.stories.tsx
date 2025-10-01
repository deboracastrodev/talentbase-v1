import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '../components/Select';
import { FormField } from '../components/Input';

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const jobOptions = [
  { value: 'vendas', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'ti', label: 'TI' },
  { value: 'rh', label: 'Recursos Humanos' },
  { value: 'financeiro', label: 'Financeiro' },
];

export const Default: Story = {
  render: () => (
    <div className="w-[350px]">
      <Select options={jobOptions} placeholder="Selecione uma área" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[350px]">
      <FormField label="Área de atuação" required>
        <Select options={jobOptions} placeholder="Selecione..." />
      </FormField>
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="w-[350px]">
      <FormField label="Área de atuação" error="Por favor selecione uma área" required>
        <Select variant="error" options={jobOptions} defaultValue="" />
      </FormField>
    </div>
  ),
};

export const Success: Story = {
  render: () => (
    <div className="w-[350px]">
      <FormField label="Área de atuação" hint="Área selecionada com sucesso!">
        <Select variant="success" options={jobOptions} defaultValue="vendas" />
      </FormField>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <FormField label="Small">
        <Select selectSize="sm" options={jobOptions} placeholder="Small select" />
      </FormField>
      <FormField label="Medium (Default)">
        <Select selectSize="md" options={jobOptions} placeholder="Medium select" />
      </FormField>
      <FormField label="Large">
        <Select selectSize="lg" options={jobOptions} placeholder="Large select" />
      </FormField>
    </div>
  ),
};
