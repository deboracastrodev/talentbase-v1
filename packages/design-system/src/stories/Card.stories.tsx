import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/Card';
import { Button } from '../components/Button';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Executivo de Contas Pleno</CardTitle>
        <CardDescription>São Paulo, SP</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700">
          Profissionalmente Remoto • Construção CLT • Presencial
        </p>
        <p className="text-lg font-bold mt-2">R$ 7.000,00/mês</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Entrar em contato</Button>
        <Button variant="outline" size="sm">Ver detalhes</Button>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" className="w-[350px]">
      <CardHeader>
        <CardTitle>Mateus Souza</CardTitle>
        <CardDescription>Executivo de Contas Pleno</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">32 anos, São Paulo/SP</p>
        <p className="text-sm text-gray-600">Profissionalmente Remoto</p>
        <p className="text-sm text-gray-600">Construção CLT</p>
        <p className="text-sm font-semibold mt-2">
          Pretensão Salarial: R$ 7.000,00
        </p>
      </CardContent>
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined" className="w-[350px]">
      <CardHeader>
        <CardTitle>Card com Borda</CardTitle>
        <CardDescription>Destaque com borda primary</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Este card tem uma borda colorida para dar destaque.</p>
      </CardContent>
    </Card>
  ),
};

export const Ghost: Story = {
  render: () => (
    <Card variant="ghost" className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Ghost</CardTitle>
        <CardDescription>Sem borda por padrão</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card minimalista que mostra sombra apenas no hover.</p>
      </CardContent>
    </Card>
  ),
};

export const NoPadding: Story = {
  render: () => (
    <Card padding="none" className="w-[350px] overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-primary-500 to-secondary-500" />
      <div className="p-6">
        <CardTitle>Card com Imagem</CardTitle>
        <CardDescription className="mt-2">
          Sem padding interno, perfeito para imagens fullwidth
        </CardDescription>
      </div>
    </Card>
  ),
};
