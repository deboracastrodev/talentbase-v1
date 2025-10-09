import type { Meta, StoryObj } from '@storybook/react';
import { CandidateCard } from '../components/CandidateCard';

const meta = {
  title: 'Components/CandidateCard',
  component: CandidateCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof CandidateCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AccountExecutive: Story = {
  args: {
    name: 'Rafael Mendes',
    initials: 'RM',
    role: 'Account Executive',
    experience: '8 anos',
    location: 'São Paulo',
    country: '🇧🇷',
    salary: 'R$ 12.000/mês',
    hourlyRate: 'R$ 72/h',
    description:
      'Account Executive especializado em SaaS B2B com histórico de superação de metas e ciclos de venda enterprise',
    skills: [
      { name: 'Vendas Enterprise', verified: true },
      { name: 'Salesforce', verified: true },
      { name: 'Negociação C-Level', verified: true },
      { name: 'Inside Sales', verified: false },
    ],
    verified: true,
    badges: [
      <span key="1" className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">
        🎯
      </span>,
      <span key="2" className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-xs">
        ⚡
      </span>,
    ],
  },
};

export const SDR: Story = {
  args: {
    name: 'Carolina Silva',
    initials: 'CS',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'SDR/BDR',
    experience: '3 anos',
    location: 'Rio de Janeiro',
    country: '🇧🇷',
    salary: 'R$ 5.500/mês',
    hourlyRate: 'R$ 33/h',
    description:
      'SDR especializada em prospecção outbound com experiência em ferramentas de automação e geração de pipeline',
    skills: [
      { name: 'Prospecção Outbound', verified: true },
      { name: 'Apollo.io', verified: true },
      { name: 'Cold Calling', verified: true },
      { name: 'LinkedIn Sales Navigator', verified: false },
      { name: 'Hubspot', verified: false },
    ],
    verified: true,
  },
};

export const BrazilianCandidate: Story = {
  args: {
    name: 'Mateus Souza',
    initials: 'MS',
    avatar: 'https://i.pravatar.cc/150?img=8',
    role: 'Executivo de Contas Pleno',
    experience: '7 anos',
    location: 'São Paulo',
    country: '🇧🇷',
    salary: 'R$ 7.000,00/mês',
    hourlyRate: 'R$ 42/h',
    description:
      'Executivo de contas com experiência em vendas B2B, gestão de carteira e inside sales',
    skills: [
      { name: 'Vendas B2B', verified: true },
      { name: 'Inside Sales', verified: true },
      { name: 'Gestão de Carteira', verified: true },
      { name: 'Prospecção', verified: false },
    ],
    verified: true,
  },
};

export const Grid: Story = {
  args: {
    name: "Rafael Mendes",
    role: "Account Executive",
    experience: "8 anos",
    location: "São Paulo",
    salary: "R$ 12.000/mês",
    description: "AE especializado em SaaS B2B",
    skills: [],
  },
  render: () => (
    <div className="grid grid-cols-2 gap-6 max-w-6xl p-6 bg-gray-50">
      <CandidateCard
        name="Rafael Mendes"
        initials="RM"
        role="Account Executive"
        experience="8 anos"
        location="São Paulo"
        country="🇧🇷"
        salary="R$ 12.000/mês"
        hourlyRate="R$ 72/h"
        description="AE especializado em SaaS B2B com histórico de superação de metas"
        skills={[
          { name: 'Vendas Enterprise', verified: true },
          { name: 'Salesforce', verified: true },
          { name: 'Negociação C-Level', verified: true },
        ]}
        verified
      />
      <CandidateCard
        name="Carolina Silva"
        initials="CS"
        role="SDR/BDR"
        experience="3 anos"
        location="Rio de Janeiro"
        country="🇧🇷"
        salary="R$ 5.500/mês"
        hourlyRate="R$ 33/h"
        description="SDR especializada em prospecção outbound e geração de pipeline"
        skills={[
          { name: 'Prospecção Outbound', verified: true },
          { name: 'Apollo.io', verified: true },
          { name: 'Cold Calling', verified: true },
        ]}
        verified
      />
      <CandidateCard
        name="Mateus Souza"
        initials="MS"
        avatar="https://i.pravatar.cc/150?img=5"
        role="Customer Success Manager"
        experience="5 anos"
        location="Belo Horizonte"
        country="🇧🇷"
        salary="R$ 9.500/mês"
        hourlyRate="R$ 57/h"
        description="CSM com experiência em SaaS, expansão de contas e redução de churn"
        skills={[
          { name: 'Account Expansion', verified: true },
          { name: 'Churn Reduction', verified: true },
          { name: 'Gainsight', verified: true },
        ]}
        verified
      />
      <CandidateCard
        name="Juliana Fernandes"
        initials="JF"
        avatar="https://i.pravatar.cc/150?img=9"
        role="Sales Manager"
        experience="12 anos"
        location="São Paulo"
        country="🇧🇷"
        salary="R$ 18.000/mês"
        hourlyRate="R$ 108/h"
        description="Gerente de vendas com experiência em gestão de equipes e grandes contas"
        skills={[
          { name: 'Gestão de Equipes', verified: true },
          { name: 'Field Sales', verified: true },
          { name: 'Grandes Contas', verified: true },
        ]}
        verified
        isFavorite
      />
    </div>
  ),
};

export const WithInteraction: Story = {
  args: {
    name: 'Juliana Fernandes',
    initials: 'JF',
    avatar: 'https://i.pravatar.cc/150?img=47',
    role: 'Executiva de Vendas Sênior',
    experience: '10 anos',
    location: 'São Paulo',
    country: '🇧🇷',
    salary: 'R$ 8.500,00/mês',
    description:
      'Executiva de vendas com experiência em gestão de equipes e grandes contas',
    skills: [
      { name: 'Gestão de Equipes', verified: true },
      { name: 'Grandes Contas', verified: true },
      { name: 'Field Sales', verified: true },
    ],
    verified: true,
    onMenuClick: () => alert('Menu clicked!'),
    onFavorite: () => alert('Favorite toggled!'),
  },
};
