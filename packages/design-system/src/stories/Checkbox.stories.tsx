import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../components/Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Aceito os termos e condições',
  },
};

export const WithoutLabel: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    label: 'Receber notificações por email',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Opção desabilitada',
    disabled: true,
  },
};

export const CheckedDisabled: Story = {
  args: {
    label: 'Opção marcada e desabilitada',
    defaultChecked: true,
    disabled: true,
  },
};

export const Group: Story = {
  render: () => (
    <div className="space-y-3">
      <p className="font-medium text-sm mb-3">Preferências de Vaga:</p>
      <Checkbox label="Remoto" defaultChecked />
      <Checkbox label="Presencial" />
      <Checkbox label="Híbrido" defaultChecked />
      <p className="font-medium text-sm mt-6 mb-3">Tipo de Contrato:</p>
      <Checkbox label="CLT" defaultChecked />
      <Checkbox label="PJ" />
      <Checkbox label="Estágio" />
    </div>
  ),
};
