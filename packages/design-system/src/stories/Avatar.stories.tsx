import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup } from '../components/Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fallback: 'MS',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'John Doe',
  },
};

export const WithFallback: Story = {
  args: {
    fallback: 'Mateus Souza',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm" fallback="MS" />
      <Avatar size="md" fallback="MS" />
      <Avatar size="lg" fallback="MS" />
      <Avatar size="xl" fallback="MS" />
      <Avatar size="2xl" fallback="MS" />
      <Avatar size="3xl" fallback="MS" />
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
      <Avatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
      <Avatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
      <Avatar src="https://i.pravatar.cc/150?img=4" alt="User 4" />
      <Avatar src="https://i.pravatar.cc/150?img=5" alt="User 5" />
    </AvatarGroup>
  ),
};

export const GroupWithFallbacks: Story = {
  render: () => (
    <AvatarGroup max={4} size="lg">
      <Avatar fallback="MS" />
      <Avatar fallback="JD" />
      <Avatar fallback="AB" />
      <Avatar fallback="CD" />
      <Avatar fallback="EF" />
      <Avatar fallback="GH" />
    </AvatarGroup>
  ),
};

export const CandidateProfile: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
      <Avatar size="xl" src="https://i.pravatar.cc/150?img=8" alt="Mateus Souza" />
      <div>
        <h3 className="font-bold text-lg">Mateus Souza</h3>
        <p className="text-sm text-gray-600">Executivo de Contas Pleno</p>
        <p className="text-xs text-gray-500 mt-1">São Paulo, SP • 32 anos</p>
      </div>
    </div>
  ),
};

export const TeamMembers: Story = {
  render: () => (
    <div className="w-[400px] p-6 bg-white rounded-lg shadow-md space-y-4">
      <h3 className="font-bold text-lg mb-4">Time de Recrutamento</h3>
      
      <div className="flex items-center gap-3">
        <Avatar size="md" src="https://i.pravatar.cc/150?img=10" />
        <div className="flex-1">
          <p className="font-medium">Ana Silva</p>
          <p className="text-xs text-gray-500">Recrutadora Senior</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Avatar size="md" src="https://i.pravatar.cc/150?img=11" />
        <div className="flex-1">
          <p className="font-medium">Carlos Santos</p>
          <p className="text-xs text-gray-500">Headhunter</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Avatar size="md" fallback="MS" />
        <div className="flex-1">
          <p className="font-medium">Maria Souza</p>
          <p className="text-xs text-gray-500">Coordenadora</p>
        </div>
      </div>
    </div>
  ),
};
