import type { Meta, StoryObj } from '@storybook/react';
import { Stepper, Step } from '../components/Stepper';
import { useState } from 'react';

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Multi-step wizard navigation with step status indicators. Used for guided workflows like CSV import, profile creation, etc.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultSteps: Step[] = [
  {
    id: '1',
    label: 'Upload',
    description: 'Selecionar arquivo CSV',
  },
  {
    id: '2',
    label: 'Validar',
    description: 'Verificar dados do arquivo',
  },
  {
    id: '3',
    label: 'Confirmar',
    description: 'Revisar e importar',
  },
];

const profileSteps: Step[] = [
  {
    id: '1',
    label: 'Dados Pessoais',
    description: 'Nome, e-mail e telefone',
  },
  {
    id: '2',
    label: 'Experiência',
    description: 'Histórico profissional',
  },
  {
    id: '3',
    label: 'Habilidades',
    description: 'Skills e competências',
    optional: true,
  },
  {
    id: '4',
    label: 'Revisão',
    description: 'Confirmar informações',
  },
];

/**
 * Default horizontal stepper
 */
export const Default: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 1,
    orientation: 'horizontal',
  },
};

/**
 * First step (beginning)
 */
export const FirstStep: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 0,
    orientation: 'horizontal',
  },
};

/**
 * Last step (completion)
 */
export const LastStep: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 2,
    orientation: 'horizontal',
  },
};

/**
 * Vertical orientation
 */
export const Vertical: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 1,
    orientation: 'vertical',
  },
};

/**
 * Vertical with 4 steps
 */
export const VerticalWithMoreSteps: Story = {
  args: {
    steps: profileSteps,
    currentStep: 2,
    orientation: 'vertical',
  },
};

/**
 * Clickable completed steps
 */
export const ClickableSteps: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(2);

    return (
      <div>
        <Stepper
          steps={defaultSteps}
          currentStep={currentStep}
          onStepClick={(stepIndex) => {
            console.log('Step clicked:', stepIndex);
            setCurrentStep(stepIndex);
          }}
          clickableSteps
          orientation="horizontal"
        />
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            Etapa atual: {currentStep + 1} - {defaultSteps[currentStep].label}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Clique nas etapas completadas para navegar
          </p>
        </div>
      </div>
    );
  },
};

/**
 * With error step
 */
export const WithError: Story = {
  args: {
    steps: defaultSteps,
    currentStep: 2,
    errorSteps: [1],
    orientation: 'horizontal',
  },
};

/**
 * Interactive wizard simulation
 */
export const InteractiveWizard: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
      if (currentStep < defaultSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    };

    const handlePrevious = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };

    return (
      <div className="space-y-6">
        <Stepper
          steps={defaultSteps}
          currentStep={currentStep}
          onStepClick={(stepIndex) => setCurrentStep(stepIndex)}
          clickableSteps
          orientation="horizontal"
        />

        {/* Step Content */}
        <div className="p-6 bg-gray-50 rounded-lg min-h-[200px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {defaultSteps[currentStep].label}
          </h3>
          <p className="text-sm text-gray-600">
            {defaultSteps[currentStep].description}
          </p>
          <div className="mt-4 p-4 bg-white rounded border border-gray-200">
            <p className="text-xs text-gray-500">
              Conteúdo da etapa {currentStep + 1} seria exibido aqui
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === defaultSteps.length - 1}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === defaultSteps.length - 1 ? 'Concluir' : 'Próximo →'}
          </button>
        </div>
      </div>
    );
  },
};

/**
 * Profile creation wizard (vertical)
 */
export const ProfileWizard: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [errorSteps, setErrorSteps] = useState<number[]>([]);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar with Stepper */}
        <div className="md:col-span-1">
          <Stepper
            steps={profileSteps}
            currentStep={currentStep}
            onStepClick={(stepIndex) => setCurrentStep(stepIndex)}
            clickableSteps
            orientation="vertical"
            errorSteps={errorSteps}
          />
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {profileSteps[currentStep].label}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {profileSteps[currentStep].description}
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-700">
                  Formulário para "{profileSteps[currentStep].label}" seria
                  exibido aqui
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  onClick={() =>
                    setCurrentStep(
                      Math.min(profileSteps.length - 1, currentStep + 1)
                    )
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md hover:bg-primary-600"
                >
                  {currentStep === profileSteps.length - 1
                    ? 'Finalizar'
                    : 'Continuar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
