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

export const ProductManager: Story = {
  args: {
    name: 'X.P.',
    initials: 'XP',
    role: 'Senior Product Manager',
    experience: '15 years',
    location: 'Hong Kong S.A.R.',
    country: '🇭🇰',
    salary: '$10k',
    hourlyRate: '$60/h',
    description:
      'Senior product manager from top companies with 15+ years PM experience across software/hardware',
    skills: [
      { name: 'Product Vision And Strategy', verified: true },
      { name: 'Agile', verified: true },
      { name: 'Product Roadmap Definition', verified: true },
      { name: 'Stakeholder Management', verified: false },
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

export const DataEngineer: Story = {
  args: {
    name: 'G.S.',
    initials: 'GS',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'Senior Data Engineer',
    experience: '5 years',
    location: 'India',
    country: '🇮🇳',
    salary: '$7,612/month',
    hourlyRate: '$46/h',
    description:
      'Experienced data engineer from top university, strong cloud and ETL background',
    skills: [
      { name: 'Data Libraries', verified: true },
      { name: 'SQL', verified: true },
      { name: 'Data Engineering', verified: true },
      { name: 'Python', verified: false },
      { name: 'AWS', verified: false },
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
  render: () => (
    <div className="grid grid-cols-2 gap-6 max-w-6xl p-6 bg-gray-50">
      <CandidateCard
        name="X.P."
        initials="XP"
        role="Senior Product Manager"
        experience="15 years"
        location="Hong Kong S.A.R."
        country="🇭🇰"
        salary="$10k"
        hourlyRate="$60/h"
        description="Senior product manager from top companies with 15+ years PM experience"
        skills={[
          { name: 'Product Vision', verified: true },
          { name: 'Agile', verified: true },
          { name: 'Roadmap', verified: true },
        ]}
        verified
      />
      <CandidateCard
        name="G.S."
        initials="GS"
        role="Senior Data Engineer"
        experience="5 years"
        location="India"
        country="🇮🇳"
        salary="$7,612/month"
        hourlyRate="$46/h"
        description="Experienced data engineer from top university, strong cloud background"
        skills={[
          { name: 'Data Libraries', verified: true },
          { name: 'SQL', verified: true },
          { name: 'Data Engineering', verified: true },
        ]}
        verified
      />
      <CandidateCard
        name="D.H."
        initials="DH"
        avatar="https://i.pravatar.cc/150?img=5"
        role="Product Manager"
        experience="5 years"
        location="United Kingdom"
        country="🇬🇧"
        salary="$11,937/month"
        hourlyRate="$69/h"
        description="Experienced Product Manager from top companies with Python, SQL background"
        skills={[
          { name: 'Product Vision', verified: true },
          { name: 'Agile', verified: true },
          { name: 'Roadmap', verified: true },
        ]}
        verified
      />
      <CandidateCard
        name="B.T."
        initials="BT"
        avatar="https://i.pravatar.cc/150?img=9"
        role="ML Data Analyst"
        experience="4 years"
        location="India"
        country="🇮🇳"
        salary="$5,363/month"
        hourlyRate="$31/h"
        description="Experienced ML data analyst from a top company with relevant skills"
        skills={[
          { name: 'Data Annotation', verified: true },
          { name: 'Quality Assurance', verified: true },
          { name: 'Handling Ambiguity', verified: true },
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
