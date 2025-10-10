import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from '../components/Logo';

const meta: Meta<typeof Logo> = {
  title: 'Foundation/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente oficial da logo TalentBase. Disponível em versão completa (símbolo + texto) ou apenas símbolo, com três temas diferentes para adaptar a diferentes fundos.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['full', 'symbol'],
      description: 'Versão da logo',
      table: {
        defaultValue: { summary: 'full' },
      },
    },
    theme: {
      control: 'select',
      options: ['white', 'primary', 'dark'],
      description: 'Tema baseado no fundo onde será aplicada',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Tamanho da logo',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

/**
 * Logo completa com tema primary - use em fundos claros
 */
export const FullPrimary: Story = {
  args: {
    variant: 'full',
    theme: 'primary',
    size: 'lg',
  },
};

/**
 * Logo completa branca - use em fundos escuros
 */
export const FullWhite: Story = {
  args: {
    variant: 'full',
    theme: 'white',
    size: 'lg',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a365d' }],
    },
  },
};

/**
 * Logo completa dark - use em fundos muito claros
 */
export const FullDark: Story = {
  args: {
    variant: 'full',
    theme: 'dark',
    size: 'lg',
  },
  parameters: {
    backgrounds: {
      default: 'light',
      values: [{ name: 'light', value: '#f9fafb' }],
    },
  },
};

/**
 * Símbolo apenas - perfeito para favicons e ícones de app
 */
export const Symbol: Story = {
  args: {
    variant: 'symbol',
    theme: 'primary',
    size: 'md',
  },
};

/**
 * Logo pequena para navegação
 */
export const Small: Story = {
  args: {
    variant: 'full',
    theme: 'primary',
    size: 'sm',
  },
};

/**
 * Logo média para headers
 */
export const Medium: Story = {
  args: {
    variant: 'full',
    theme: 'primary',
    size: 'md',
  },
};

/**
 * Logo grande para landing pages
 */
export const Large: Story = {
  args: {
    variant: 'full',
    theme: 'primary',
    size: 'lg',
  },
};

/**
 * Logo extra large para hero sections
 */
export const ExtraLarge: Story = {
  args: {
    variant: 'full',
    theme: 'white',
    size: 'xl',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#000000' }],
    },
  },
};

/**
 * Todos os tamanhos lado a lado
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-start">
      <div>
        <p className="text-sm text-gray-600 mb-2">Small (h-6)</p>
        <Logo variant="full" theme="primary" size="sm" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Medium (h-10)</p>
        <Logo variant="full" theme="primary" size="md" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Large (h-12)</p>
        <Logo variant="full" theme="primary" size="lg" />
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Extra Large (h-16)</p>
        <Logo variant="full" theme="primary" size="xl" />
      </div>
    </div>
  ),
};

/**
 * Todos os temas lado a lado
 */
export const AllThemes: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8">
      <div className="flex flex-col items-center">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 mb-2">
          <Logo variant="full" theme="primary" size="lg" />
        </div>
        <p className="text-sm text-gray-600">Primary (fundos claros)</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-gradient-to-br from-[#1a365d] to-[#2d3748] rounded-lg p-8 mb-2">
          <Logo variant="full" theme="white" size="lg" />
        </div>
        <p className="text-sm text-gray-600">White (fundos escuros)</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-gray-100 rounded-lg p-8 mb-2">
          <Logo variant="full" theme="dark" size="lg" />
        </div>
        <p className="text-sm text-gray-600">Dark (fundos claros)</p>
      </div>
    </div>
  ),
};

/**
 * Exemplos de uso em Sidebar
 */
export const InSidebar: Story = {
  render: () => (
    <div className="flex gap-8">
      {/* Sidebar clara */}
      <div className="w-60 h-64 bg-white border border-gray-200 rounded-lg">
        <div className="h-16 px-4 border-b border-gray-200 flex items-center">
          <Logo variant="full" theme="primary" size="md" />
        </div>
        <div className="p-4 text-sm text-gray-600">Menu items...</div>
      </div>

      {/* Sidebar escura */}
      <div className="w-60 h-64 bg-gradient-to-br from-[#1a365d] to-[#2d3748] rounded-lg">
        <div className="h-16 px-4 border-b border-white/10 flex items-center">
          <Logo variant="full" theme="white" size="md" />
        </div>
        <div className="p-4 text-sm text-gray-300">Menu items...</div>
      </div>
    </div>
  ),
};

/**
 * Exemplo de uso em Email Header
 */
export const InEmailHeader: Story = {
  render: () => (
    <div className="max-w-xl mx-auto">
      <div className="bg-gradient-to-br from-[#1a365d] to-[#2d3748] rounded-t-lg p-8 text-center">
        <Logo variant="full" theme="white" size="lg" />
      </div>
      <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-8">
        <h2 className="text-xl font-semibold mb-4">Bem-vindo ao TalentBase!</h2>
        <p className="text-gray-600">Conteúdo do email...</p>
      </div>
    </div>
  ),
};
