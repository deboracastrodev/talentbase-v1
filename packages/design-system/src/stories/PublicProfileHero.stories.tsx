import type { Meta, StoryObj } from '@storybook/react';
import { PublicProfileHero } from '../components/PublicProfileHero';

const meta = {
  title: 'Components/PublicProfileHero',
  component: PublicProfileHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PublicProfileHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Juliana Fernandes do Amaral',
    avatarUrl: 'https://via.placeholder.com/160',
    badges: [
      { label: '📍 Osasco - SP' },
      { label: '💼 Híbrido' },
      { label: '🎯 Account Manager/CSM' },
    ],
  },
};

export const WithPCD: Story = {
  args: {
    name: 'João Silva Santos',
    avatarUrl: 'https://via.placeholder.com/160',
    badges: [
      { label: '📍 São Paulo - SP' },
      { label: '💼 Remoto' },
      { label: '🎯 SDR/BDR' },
      { label: '♿ PCD', variant: 'success' },
    ],
  },
};

export const RemotePosition: Story = {
  args: {
    name: 'Maria Oliveira',
    avatarUrl: 'https://via.placeholder.com/160',
    badges: [
      { label: '📍 Florianópolis - SC' },
      { label: '🌍 100% Remoto' },
      { label: '🎯 Sales Executive' },
    ],
  },
};

export const OnSitePosition: Story = {
  args: {
    name: 'Carlos Eduardo',
    avatarUrl: 'https://via.placeholder.com/160',
    badges: [
      { label: '📍 Rio de Janeiro - RJ' },
      { label: '🏢 Presencial' },
      { label: '🎯 Enterprise AE' },
    ],
  },
};

export const MinimalInfo: Story = {
  args: {
    name: 'Ana Paula Costa',
    avatarUrl: 'https://via.placeholder.com/160',
    badges: [
      { label: '📍 Belo Horizonte - MG' },
      { label: '🎯 Customer Success Manager' },
    ],
  },
};

export const WithoutAvatar: Story = {
  args: {
    name: 'Roberto Fernandes',
    badges: [
      { label: '📍 Curitiba - PR' },
      { label: '💼 Híbrido' },
      { label: '🎯 Business Development' },
    ],
  },
};

export const LongName: Story = {
  args: {
    name: 'Maria Aparecida da Silva Conceição Santos',
    avatarUrl: 'https://via.placeholder.com/160',
    badges: [
      { label: '📍 Brasília - DF' },
      { label: '💼 Híbrido' },
      { label: '🎯 Strategic Account Executive' },
    ],
  },
};
