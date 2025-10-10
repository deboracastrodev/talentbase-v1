/**
 * Stepper Component - Design System
 *
 * Multi-step wizard navigation with step status indicators.
 * Used for guided workflows like CSV import, profile creation, etc.
 *
 * @example
 * ```tsx
 * <Stepper
 *   steps={[
 *     { id: '1', label: 'Upload', description: 'Selecionar arquivo' },
 *     { id: '2', label: 'Validar', description: 'Verificar dados' },
 *     { id: '3', label: 'Confirmar', description: 'Revisar importação' },
 *   ]}
 *   currentStep={1}
 *   onStepClick={(stepId) => console.log(stepId)}
 * />
 * ```
 */

import { cn } from '../lib/utils';

export type StepStatus = 'completed' | 'current' | 'upcoming' | 'error';

export interface Step {
  /**
   * Unique step identifier
   */
  id: string;
  /**
   * Step label (e.g., "Upload CSV")
   */
  label: string;
  /**
   * Optional description (e.g., "Selecione o arquivo CSV")
   */
  description?: string;
  /**
   * Optional icon component
   */
  icon?: React.ReactNode;
  /**
   * Is step optional?
   */
  optional?: boolean;
}

export interface StepperProps {
  /**
   * Array of step configurations
   */
  steps: Step[];
  /**
   * Current active step (0-indexed)
   */
  currentStep: number;
  /**
   * Callback when step is clicked (if clickable)
   */
  onStepClick?: (stepIndex: number) => void;
  /**
   * Allow clicking on completed steps
   */
  clickableSteps?: boolean;
  /**
   * Orientation of stepper
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Steps with errors (0-indexed)
   */
  errorSteps?: number[];
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  clickableSteps = false,
  orientation = 'horizontal',
  errorSteps = [],
  className,
}: StepperProps) {
  const getStepStatus = (index: number): StepStatus => {
    if (errorSteps.includes(index)) return 'error';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const isStepClickable = (index: number): boolean => {
    if (!onStepClick) return false;
    if (!clickableSteps) return false;
    return index < currentStep; // Only completed steps are clickable
  };

  if (orientation === 'vertical') {
    return (
      <nav aria-label="Progress" className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const clickable = isStepClickable(index);

          return (
            <div key={step.id} className="relative">
              <div
                className={cn(
                  'flex items-start gap-4',
                  clickable && 'cursor-pointer hover:opacity-80',
                  !clickable && 'cursor-default'
                )}
                onClick={() => clickable && onStepClick?.(index)}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onStepClick?.(index);
                  }
                }}
              >
                {/* Step Icon */}
                <StepIcon
                  status={status}
                  stepNumber={index + 1}
                  icon={step.icon}
                />

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        status === 'current' && 'text-primary-600',
                        status === 'completed' && 'text-gray-900',
                        status === 'upcoming' && 'text-gray-500',
                        status === 'error' && 'text-red-600'
                      )}
                    >
                      {step.label}
                    </p>
                    {step.optional && (
                      <span className="text-xs text-gray-500">(Opcional)</span>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-4 top-10 bottom-0 w-0.5 -mb-4 bg-gray-200">
                  {getStepStatus(index) === 'completed' && (
                    <div className="w-full h-full bg-primary-500" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  // Horizontal orientation
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const clickable = isStepClickable(index);
          const isLastStep = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn('relative flex-1', !isLastStep && 'pr-8 sm:pr-20')}
            >
              <div
                className={cn(
                  'flex flex-col items-center',
                  clickable && 'cursor-pointer hover:opacity-80',
                  !clickable && 'cursor-default'
                )}
                onClick={() => clickable && onStepClick?.(index)}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onStepClick?.(index);
                  }
                }}
              >
                {/* Step Icon */}
                <StepIcon
                  status={status}
                  stepNumber={index + 1}
                  icon={step.icon}
                />

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <p
                      className={cn(
                        'text-xs sm:text-sm font-medium',
                        status === 'current' && 'text-primary-600',
                        status === 'completed' && 'text-gray-900',
                        status === 'upcoming' && 'text-gray-500',
                        status === 'error' && 'text-red-600'
                      )}
                    >
                      {step.label}
                    </p>
                    {step.optional && (
                      <span className="text-xs text-gray-500 hidden sm:inline">
                        (Opcional)
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLastStep && (
                <div
                  className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200"
                  aria-hidden="true"
                >
                  {status === 'completed' && (
                    <div className="w-full h-full bg-primary-500 transition-all duration-500" />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * StepIcon - Internal component for step status icon
 */
interface StepIconProps {
  status: StepStatus;
  stepNumber: number;
  icon?: React.ReactNode;
}

function StepIcon({ status, stepNumber, icon }: StepIconProps) {
  if (icon) {
    return (
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full',
          status === 'current' &&
            'bg-primary-500 text-white ring-4 ring-primary-100',
          status === 'completed' && 'bg-primary-500 text-white',
          status === 'upcoming' && 'bg-gray-200 text-gray-500',
          status === 'error' && 'bg-red-500 text-white ring-4 ring-red-100'
        )}
      >
        {icon}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all duration-200',
        status === 'current' &&
          'bg-primary-500 text-white ring-4 ring-primary-100',
        status === 'completed' && 'bg-primary-500 text-white',
        status === 'upcoming' && 'bg-gray-200 text-gray-500',
        status === 'error' && 'bg-red-500 text-white ring-4 ring-red-100'
      )}
      aria-label={`Passo ${stepNumber}`}
    >
      {status === 'completed' ? (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : status === 'error' ? (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <span>{stepNumber}</span>
      )}
    </div>
  );
}

export { StepIcon };
