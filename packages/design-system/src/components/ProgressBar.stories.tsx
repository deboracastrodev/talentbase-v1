import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar, ProgressBarWithSteps } from './ProgressBar';
import { useState, useEffect } from 'react';

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Visual progress indicator with label and variants. Used for showing upload progress, import progress, etc.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default progress bar at 75%
 */
export const Default: Story = {
  args: {
    value: 75,
    max: 100,
    label: 'Progresso',
  },
};

/**
 * Progress bar with percentage display
 */
export const WithPercentage: Story = {
  args: {
    value: 60,
    max: 100,
    label: 'Uploading arquivo',
    showPercentage: true,
  },
};

/**
 * Progress bar with fraction display
 */
export const WithFraction: Story = {
  args: {
    value: 45,
    max: 100,
    label: 'Processando registros',
    showFraction: true,
  },
};

/**
 * Progress bar with both percentage and fraction
 */
export const WithBothDisplays: Story = {
  args: {
    value: 8,
    max: 12,
    label: 'Importando candidatos',
    showPercentage: true,
    showFraction: true,
  },
};

/**
 * Success variant
 */
export const Success: Story = {
  args: {
    value: 100,
    max: 100,
    label: 'Upload completo',
    variant: 'success',
    showPercentage: true,
  },
};

/**
 * Error variant
 */
export const Error: Story = {
  args: {
    value: 45,
    max: 100,
    label: 'Erro no upload',
    variant: 'error',
    showPercentage: true,
  },
};

/**
 * Warning variant
 */
export const Warning: Story = {
  args: {
    value: 80,
    max: 100,
    label: 'Atenção: verificar dados',
    variant: 'warning',
    showPercentage: true,
  },
};

/**
 * Animated progress bar
 */
export const Animated: Story = {
  args: {
    value: 65,
    max: 100,
    label: 'Processando...',
    animated: true,
    showPercentage: true,
  },
};

/**
 * Small size
 */
export const SmallSize: Story = {
  args: {
    value: 70,
    max: 100,
    label: 'Pequeno',
    size: 'sm',
    showPercentage: true,
  },
};

/**
 * Large size
 */
export const LargeSize: Story = {
  args: {
    value: 70,
    max: 100,
    label: 'Grande',
    size: 'lg',
    showPercentage: true,
  },
};

/**
 * Simulated upload progress
 */
export const SimulatedUpload: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      return () => clearInterval(interval);
    }, []);

    return (
      <ProgressBar
        value={progress}
        max={100}
        label="Fazendo upload do arquivo CSV"
        variant={progress === 100 ? 'success' : 'default'}
        showPercentage
        showFraction
        animated={progress < 100}
      />
    );
  },
};

/**
 * Progress bar with steps (3 steps)
 */
export const WithSteps: Story = {
  render: () => {
    return (
      <ProgressBarWithSteps
        currentStep={1}
        totalSteps={3}
        stepLabels={['Upload', 'Validar', 'Importar']}
        variant="default"
      />
    );
  },
};

/**
 * Progress bar with steps - completed
 */
export const WithStepsCompleted: Story = {
  render: () => {
    return (
      <ProgressBarWithSteps
        currentStep={2}
        totalSteps={3}
        stepLabels={['Upload', 'Validar', 'Importar']}
        variant="success"
      />
    );
  },
};

/**
 * Progress bar with 5 steps
 */
export const WithManySteps: Story = {
  render: () => {
    return (
      <ProgressBarWithSteps
        currentStep={2}
        totalSteps={5}
        stepLabels={['Início', 'Dados', 'Validação', 'Revisão', 'Conclusão']}
        variant="default"
      />
    );
  },
};

/**
 * Simulated stepped progress
 */
export const SimulatedSteppedProgress: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 4;

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            clearInterval(interval);
            return totalSteps - 1;
          }
          return prev + 1;
        });
      }, 2000);

      return () => clearInterval(interval);
    }, []);

    return (
      <ProgressBarWithSteps
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabels={['Upload CSV', 'Validar Dados', 'Processar', 'Concluir']}
        variant={currentStep === totalSteps - 1 ? 'success' : 'default'}
      />
    );
  },
};
