import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../components/Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Disponível',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Sem Contrato',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Pendente',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Inativo',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
    </div>
  ),
};

export const JobStatus: Story = {
  render: () => (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-md w-[350px]">
      <div className="flex items-center justify-between">
        <span className="font-medium">Status do Candidato:</span>
        <Badge variant="success">Disponível</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-medium">Tipo de Vaga:</span>
        <Badge variant="default">Remoto</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-medium">Nível:</span>
        <Badge variant="secondary">Pleno</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-medium">Contrato:</span>
        <Badge variant="ghost">CLT</Badge>
      </div>
    </div>
  ),
};

export const CandidateCard: Story = {
  render: () => (
    <div className="w-[350px] p-6 bg-white rounded-lg shadow-md space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg">Mateus Souza</h3>
          <p className="text-sm text-gray-600">Executivo de Contas</p>
        </div>
        <Badge variant="success">Disponível</Badge>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-3">
        <Badge variant="outline" size="sm">São Paulo</Badge>
        <Badge variant="outline" size="sm">32 anos</Badge>
        <Badge variant="outline" size="sm">Remoto</Badge>
      </div>
      
      <div className="flex gap-2 mt-4">
        <Badge variant="default">Vendas</Badge>
        <Badge variant="secondary">B2B</Badge>
      </div>
    </div>
  ),
};
