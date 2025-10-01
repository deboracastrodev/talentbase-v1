import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../components/Textarea';
import { FormField } from '../components/Input';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[500px]">
      <Textarea placeholder="Digite sua mensagem..." />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[500px]">
      <FormField label="Observações" hint="Máximo 500 caracteres">
        <Textarea placeholder="Adicione observações sobre o candidato..." />
      </FormField>
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="w-[500px]">
      <FormField label="Descrição" error="Campo obrigatório" required>
        <Textarea variant="error" placeholder="Digite aqui..." />
      </FormField>
    </div>
  ),
};

export const Success: Story = {
  render: () => (
    <div className="w-[500px]">
      <FormField label="Experiência profissional" hint="Salvo com sucesso!">
        <Textarea
          variant="success"
          defaultValue="10 anos de experiência em vendas B2B..."
        />
      </FormField>
    </div>
  ),
};

export const Large: Story = {
  render: () => (
    <div className="w-[500px]">
      <FormField label="Descrição completa do candidato">
        <Textarea
          className="min-h-[200px]"
          placeholder="Descreva a experiência profissional, habilidades técnicas, soft skills..."
        />
      </FormField>
    </div>
  ),
};
