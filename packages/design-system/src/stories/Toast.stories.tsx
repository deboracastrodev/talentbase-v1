import type { Meta, StoryObj } from '@storybook/react';
import { Toast, ToastProvider, useToast } from '../index';
import { Button } from '../components/Button';

/**
 * Toast Component - Temporary Notifications
 *
 * Temporary notification component that appears at the top-right of the screen.
 * Perfect for providing quick feedback after user actions.
 *
 * ## Features
 * - 🎯 Auto-dismisses after 5-7 seconds
 * - 📚 Stackable - multiple toasts
 * - ♿️ Accessible (ARIA, screen readers)
 * - 🎨 4 semantic variants
 * - ✨ Smooth animations
 *
 * ## When to Use
 * - ✅ "Candidato criado com sucesso!"
 * - ✅ "Email enviado"
 * - ✅ "Senha alterada"
 * - ✅ "Rascunho salvo"
 *
 * ## When NOT to Use
 * - ❌ Critical errors requiring action → use Alert or Modal
 * - ❌ Form validation errors → use inline messages
 * - ❌ Long content → use Modal
 */
const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Toast component for temporary notifications. Must be used within ToastProvider.

## Setup

\`\`\`tsx
// 1. Add ToastProvider to root
<ToastProvider>
  <App />
</ToastProvider>

// 2. Use the hook
const { toast } = useToast();
toast.success('Done!');
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// Demo component to trigger toasts
function ToastDemo() {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Toast Component Demo</h1>
        <p className="text-gray-600 mb-8">
          Click buttons below to see different toast variants. Toasts appear in the top-right
          corner.
        </p>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Success */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-green-700">Success Toast</h2>
            <p className="text-sm text-gray-600 mb-3">
              Use for successful operations (green). Auto-dismisses in 5 seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => toast.success('Candidato criado com sucesso!')}
                variant="default"
              >
                Simple Success
              </Button>
              <Button
                onClick={() =>
                  toast.success(
                    'Email de boas-vindas enviado para joao@example.com',
                    'Candidato Criado!'
                  )
                }
                variant="default"
              >
                Success with Title
              </Button>
              <Button
                onClick={() =>
                  toast.success('Ação concluída rapidamente!', undefined, 2000)
                }
                variant="secondary"
              >
                Quick (2s)
              </Button>
            </div>
          </div>

          {/* Error */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-red-700">Error Toast</h2>
            <p className="text-sm text-gray-600 mb-3">
              Use for errors and failures (red). Auto-dismisses in 7 seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => toast.error('Email já cadastrado no sistema')}
                variant="destructive"
              >
                Simple Error
              </Button>
              <Button
                onClick={() =>
                  toast.error(
                    'Não foi possível conectar ao servidor. Verifique sua internet.',
                    'Erro de Conexão'
                  )
                }
                variant="destructive"
              >
                Error with Title
              </Button>
              <Button
                onClick={() =>
                  toast.error('Esta mensagem fica por 10 segundos', 'Erro Crítico', 10000)
                }
                variant="destructive"
              >
                Long Duration (10s)
              </Button>
            </div>
          </div>

          {/* Info */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-primary-700">Info Toast</h2>
            <p className="text-sm text-gray-600 mb-3">
              Use for neutral information (blue). Auto-dismisses in 5 seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => toast.info('Nova mensagem recebida')} variant="outline">
                Simple Info
              </Button>
              <Button
                onClick={() =>
                  toast.info(
                    'Seu perfil está visível para empresas parceiras.',
                    'Perfil Público'
                  )
                }
                variant="outline"
              >
                Info with Title
              </Button>
              <Button
                onClick={() =>
                  toast.info('Processando em background... Esta mensagem não fecha.', undefined, 0)
                }
                variant="secondary"
              >
                Never Dismiss (0)
              </Button>
            </div>
          </div>

          {/* Warning */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-yellow-700">Warning Toast</h2>
            <p className="text-sm text-gray-600 mb-3">
              Use for warnings and cautions (yellow). Auto-dismisses in 7 seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => toast.warning('Ação não pode ser desfeita')}
                variant="outline"
              >
                Simple Warning
              </Button>
              <Button
                onClick={() =>
                  toast.warning(
                    'Sua sessão expira em 5 minutos. Salve seu trabalho.',
                    'Atenção'
                  )
                }
                variant="outline"
              >
                Warning with Title
              </Button>
            </div>
          </div>

          {/* Multiple Toasts */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Multiple Toasts</h2>
            <p className="text-sm text-gray-600 mb-3">
              Toasts stack vertically. Max 5 toasts by default (configurable).
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  toast.success('Item 1 processado');
                  setTimeout(() => toast.success('Item 2 processado'), 300);
                  setTimeout(() => toast.success('Item 3 processado'), 600);
                }}
                variant="default"
              >
                Show 3 Toasts
              </Button>
              <Button
                onClick={() => {
                  toast.info('Iniciando operação...');
                  setTimeout(() => toast.success('Etapa 1 completa'), 1000);
                  setTimeout(() => toast.success('Etapa 2 completa'), 2000);
                  setTimeout(() => toast.success('Todas as etapas completas!'), 3000);
                }}
                variant="secondary"
              >
                Sequential Flow
              </Button>
              <Button
                onClick={() => {
                  toast.success('Sucesso!');
                  toast.error('Erro!');
                  toast.info('Info!');
                  toast.warning('Aviso!');
                }}
                variant="outline"
              >
                All Variants
              </Button>
            </div>
          </div>

          {/* Story 3.3.5 Examples */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-3">Story 3.3.5 Examples</h2>
            <p className="text-sm text-gray-600 mb-3">
              Real-world examples from Admin Manual Candidate Creation story.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  toast.success(
                    'Candidato criado com sucesso! Email de boas-vindas enviado.',
                    'Sucesso!'
                  )
                }
                variant="default"
              >
                Candidate Created (with email)
              </Button>
              <Button
                onClick={() => toast.success('Candidato criado com sucesso!', 'Sucesso!')}
                variant="default"
              >
                Candidate Created (no email)
              </Button>
              <Button
                onClick={() =>
                  toast.error('Este email já está cadastrado no sistema.', 'Email Duplicado')
                }
                variant="destructive"
              >
                Duplicate Email Error
              </Button>
              <Button
                onClick={() =>
                  toast.error(
                    'Link expirado. Solicite um novo link ao administrador.',
                    'Token Expirado',
                    10000
                  )
                }
                variant="destructive"
              >
                Expired Token
              </Button>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">How to Use</h3>
          <pre className="text-sm bg-white p-4 rounded border overflow-x-auto">
            <code>{`// 1. Setup ToastProvider (once, in root)
<ToastProvider>
  <App />
</ToastProvider>

// 2. Use in any component
import { useToast } from '@talentbase/design-system';

function MyComponent() {
  const { toast } = useToast();

  const handleClick = () => {
    toast.success('Done!');
  };

  return <button onClick={handleClick}>Click me</button>;
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive demo showing all toast variants and features.
 * Click buttons to see toasts appear in the top-right corner.
 */
export const Interactive: Story = {
  render: () => <ToastDemo />,
};

/**
 * Success toast - use for successful operations.
 * Auto-dismisses in 5 seconds.
 */
export const SuccessVariant: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <div className="p-8">
        <Button onClick={() => toast.success('Candidato criado com sucesso!', 'Sucesso!')}>
          Show Success Toast
        </Button>
      </div>
    );
  },
};

/**
 * Error toast - use for failures and errors.
 * Auto-dismisses in 7 seconds (longer for critical messages).
 */
export const ErrorVariant: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <div className="p-8">
        <Button
          variant="destructive"
          onClick={() => toast.error('Email já cadastrado no sistema', 'Erro')}
        >
          Show Error Toast
        </Button>
      </div>
    );
  },
};

/**
 * Info toast - use for neutral information.
 * Auto-dismisses in 5 seconds.
 */
export const InfoVariant: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <div className="p-8">
        <Button variant="outline" onClick={() => toast.info('Processando em background...')}>
          Show Info Toast
        </Button>
      </div>
    );
  },
};

/**
 * Warning toast - use for cautions and warnings.
 * Auto-dismisses in 7 seconds.
 */
export const WarningVariant: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <div className="p-8">
        <Button
          variant="outline"
          onClick={() => toast.warning('Sessão expira em 5 minutos', 'Atenção')}
        >
          Show Warning Toast
        </Button>
      </div>
    );
  },
};

/**
 * Multiple toasts stack vertically.
 * Max 5 toasts by default (configurable in ToastProvider).
 */
export const MultipleToasts: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <div className="p-8">
        <Button
          onClick={() => {
            toast.success('Item 1 processado');
            setTimeout(() => toast.info('Item 2 processado'), 300);
            setTimeout(() => toast.success('Item 3 processado'), 600);
            setTimeout(() => toast.warning('Quase lá...'), 900);
            setTimeout(() => toast.success('Todos os itens processados!'), 1200);
          }}
        >
          Show Multiple Toasts
        </Button>
      </div>
    );
  },
};

/**
 * Toast with custom duration.
 * Pass 0 to never auto-dismiss (requires manual close).
 */
export const CustomDuration: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <div className="p-8 space-x-4">
        <Button onClick={() => toast.success('Closes in 1 second', undefined, 1000)}>
          Quick (1s)
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.info('Closes in 10 seconds', undefined, 10000)}
        >
          Long (10s)
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.warning('Never closes automatically', undefined, 0)}
        >
          Never (0)
        </Button>
      </div>
    );
  },
};
