import type { Meta, StoryObj } from '@storybook/react';
import { Input, FormField } from '../components/Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[350px]">
      <Input placeholder="Digite seu nome" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[350px]">
      <FormField label="Nome" required>
        <Input placeholder="Digite seu nome" />
      </FormField>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-[350px]">
      <FormField label="E-mail" error="E-mail inválido" required>
        <Input
          type="email"
          variant="error"
          placeholder="email@example.com"
          defaultValue="invalidemail"
        />
      </FormField>
    </div>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <div className="w-[350px]">
      <FormField label="E-mail" hint="E-mail válido!">
        <Input
          type="email"
          variant="success"
          placeholder="email@example.com"
          defaultValue="valid@email.com"
        />
      </FormField>
    </div>
  ),
};

export const WithHint: Story = {
  render: () => (
    <div className="w-[350px]">
      <FormField label="Senha" hint="Mínimo 8 caracteres" required>
        <Input type="password" placeholder="••••••••" />
      </FormField>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <FormField label="Small">
        <Input inputSize="sm" placeholder="Small input" />
      </FormField>
      <FormField label="Medium (Default)">
        <Input inputSize="md" placeholder="Medium input" />
      </FormField>
      <FormField label="Large">
        <Input inputSize="lg" placeholder="Large input" />
      </FormField>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="w-[400px] space-y-4 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Preencha seu perfil</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nome" required>
          <Input placeholder="Seu nome" />
        </FormField>
        <FormField label="Sobrenome" required>
          <Input placeholder="Seu sobrenome" />
        </FormField>
      </div>

      <FormField label="E-mail" hint="exemplo@dominio.com.br" required>
        <Input type="email" placeholder="email@example.com.br" />
      </FormField>

      <FormField label="Data de Nascimento" required>
        <Input type="date" placeholder="dd/mm/aaaa" />
      </FormField>

      <FormField label="Endereço">
        <Input placeholder="Rua, número, complemento" />
      </FormField>

      <FormField label="Cargo desejado" required>
        <Input placeholder="Ex: Executivo de Vendas" />
      </FormField>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[350px]">
      <FormField label="Campo desabilitado">
        <Input placeholder="Não editável" disabled value="Valor fixo" />
      </FormField>
    </div>
  ),
};
