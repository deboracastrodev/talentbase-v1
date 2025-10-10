import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from '../components/Timeline';

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Executivo de Contas Pleno',
        subtitle: 'Superlógica Tecnologias',
        period: 'mai/25 - o momento',
        duration: '7 meses',
        logoUrl: 'https://via.placeholder.com/40',
      },
      {
        id: '2',
        title: 'Sales Executive',
        subtitle: 'Mercado Livre',
        period: 'dez/22 - fev/25',
        duration: '2 anos e 3 meses',
        logoUrl: 'https://via.placeholder.com/40',
      },
      {
        id: '3',
        title: 'Executiva Comercial Sênior',
        subtitle: 'Só Marcas',
        period: 'mai/2010 - set/2022',
        duration: '12 anos e 5 meses',
        logoUrl: 'https://via.placeholder.com/40',
      },
    ],
  },
};

export const WithoutLogos: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Account Executive',
        subtitle: 'Tech Company A',
        period: 'jan/2023 - o momento',
        duration: '1 ano e 2 meses',
      },
      {
        id: '2',
        title: 'SDR',
        subtitle: 'Tech Company B',
        period: 'jun/2021 - dez/2022',
        duration: '1 ano e 7 meses',
      },
    ],
  },
};

export const WithDescriptions: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Senior Account Executive',
        subtitle: 'SaaS Company',
        period: 'jan/2023 - o momento',
        duration: '1 ano e 2 meses',
        logoUrl: 'https://via.placeholder.com/40',
        description:
          'Responsável por vendas enterprise, negociação com C-level e expansão de contas.',
      },
      {
        id: '2',
        title: 'Account Executive',
        subtitle: 'Tech Startup',
        period: 'jun/2021 - dez/2022',
        duration: '1 ano e 7 meses',
        description: 'Vendas B2B para PMEs, ciclo de vendas de 30-60 dias.',
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const SingleItem: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Sales Development Representative',
        subtitle: 'Current Company',
        period: 'mar/2024 - o momento',
        duration: '6 meses',
        logoUrl: 'https://via.placeholder.com/40',
      },
    ],
  },
};
