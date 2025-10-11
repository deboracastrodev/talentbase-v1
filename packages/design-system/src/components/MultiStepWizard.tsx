import React from 'react';
import { cn } from '../lib/utils';
import { Button } from './Button';

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

export interface MultiStepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onNext?: () => void | Promise<void>;
  onPrevious?: () => void;
  onSaveDraft?: () => void | Promise<void>;
  onSubmit?: () => void | Promise<void>;
  children: React.ReactNode;
  isLoading?: boolean;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  showSaveDraft?: boolean;
  submitLabel?: string;
  className?: string;
}

export const MultiStepWizard = React.forwardRef<HTMLDivElement, MultiStepWizardProps>(
  (
    {
      steps,
      currentStep,
      onNext,
      onPrevious,
      onSaveDraft,
      onSubmit,
      children,
      isLoading = false,
      canGoNext = true,
      canGoPrevious = true,
      showSaveDraft = true,
      submitLabel = 'Finalizar',
      className,
    },
    ref
  ) => {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const progressPercentage = ((currentStep + 1) / steps.length) * 100;

    const handleNext = async () => {
      if (onNext && !isLoading) {
        await onNext();
      }
    };

    const handlePrevious = () => {
      if (onPrevious && !isLoading && canGoPrevious) {
        onPrevious();
      }
    };

    const handleSaveDraft = async () => {
      if (onSaveDraft && !isLoading) {
        await onSaveDraft();
      }
    };

    const handleSubmit = async () => {
      if (onSubmit && !isLoading) {
        await onSubmit();
      }
    };

    return (
      <div ref={ref} className={cn('w-full mx-auto', className)}>
        {/* Progress Indicator */}
        <div className="mb-8">
          {/* Step Counter */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700">
              Passo {currentStep + 1} de {steps.length}
            </p>
            <p className="text-xs text-gray-500">{Math.round(progressPercentage)}% completo</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Step Pills */}
          <div className="flex items-center justify-between gap-2">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isUpcoming = index > currentStep;

              return (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center w-full">
                    {/* Step Circle */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200',
                        isCompleted && 'bg-primary-600 text-white',
                        isActive && 'bg-primary-600 text-white ring-4 ring-primary-100',
                        isUpcoming && 'bg-gray-200 text-gray-500'
                      )}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="mt-2 text-center">
                      <p
                        className={cn(
                          'text-xs font-medium transition-colors',
                          (isActive || isCompleted) && 'text-gray-900',
                          isUpcoming && 'text-gray-500'
                        )}
                      >
                        {step.label}
                      </p>
                      {step.description && (
                        <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-2 mt-[-40px] transition-colors duration-200',
                        index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep].label}</h2>
          {steps[currentStep].description && (
            <p className="text-gray-600 mt-1">{steps[currentStep].description}</p>
          )}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">{children}</div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-3">
            {/* Previous Button */}
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isLoading || !canGoPrevious}
                className="min-w-[120px]"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Anterior
              </Button>
            )}

            {/* Save Draft Button */}
            {showSaveDraft && (
              <Button variant="ghost" onClick={handleSaveDraft} disabled={isLoading}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Salvar Rascunho
              </Button>
            )}
          </div>

          {/* Next/Submit Button */}
          {!isLastStep ? (
            <Button
              onClick={handleNext}
              disabled={isLoading || !canGoNext}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Carregando...
                </>
              ) : (
                <>
                  Próximo
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="min-w-[120px]">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {submitLabel}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }
);

MultiStepWizard.displayName = 'MultiStepWizard';
