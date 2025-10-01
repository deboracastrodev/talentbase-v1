import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from '../components/Radio';

const meta = {
  title: 'Components/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Opção 1',
    name: 'option',
  },
};

export const WithoutLabel: Story = {
  args: {
    name: 'option',
  },
};

export const Checked: Story = {
  args: {
    label: 'Opção selecionada',
    name: 'option',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Opção desabilitada',
    name: 'option',
    disabled: true,
  },
};

export const Group: Story = {
  render: () => (
    <div className="space-y-3">
      <p className="font-medium text-sm mb-3">Nível de Experiência:</p>
      <Radio name="experience" label="Júnior (0-3 anos)" />
      <Radio name="experience" label="Pleno (3-7 anos)" defaultChecked />
      <Radio name="experience" label="Sênior (7+ anos)" />
      <Radio name="experience" label="Especialista (10+ anos)" />
    </div>
  ),
};

export const MultipleGroups: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="font-medium text-sm mb-3">Modalidade de Trabalho:</p>
        <div className="space-y-2">
          <Radio name="modality" label="100% Remoto" defaultChecked />
          <Radio name="modality" label="Híbrido" />
          <Radio name="modality" label="Presencial" />
        </div>
      </div>

      <div>
        <p className="font-medium text-sm mb-3">Disponibilidade:</p>
        <div className="space-y-2">
          <Radio name="availability" label="Imediata" defaultChecked />
          <Radio name="availability" label="30 dias" />
          <Radio name="availability" label="60 dias" />
          <Radio name="availability" label="Negociável" />
        </div>
      </div>
    </div>
  ),
};
