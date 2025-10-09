/**
 * MultiStepWizard Component
 * Story 3.1: Reusable multi-step wizard with progress indicator.
 */

import { useState, ReactNode } from 'react';

interface Step {
  id: number;
  title: string;
  description?: string;
  content: ReactNode;
}

interface MultiStepWizardProps {
  steps: Step[];
  onComplete: () => void;
  onSaveDraft?: () => void;
  showDraftButton?: boolean;
  initialStep?: number;
}

export function MultiStepWizard({
  steps,
  onComplete,
  onSaveDraft,
  showDraftButton = true,
  initialStep = 0,
}: MultiStepWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-medium text-gray-700">
            Passo {currentStep + 1} de {steps.length}
          </h2>
          <span className="text-sm text-gray-500">{Math.round(progress)}% completo</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {steps[currentStep].title}
        </h1>
        {steps[currentStep].description && (
          <p className="text-gray-600">{steps[currentStep].description}</p>
        )}
      </div>

      {/* Step content */}
      <div className="mb-8">{steps[currentStep].content}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div>
          {!isFirstStep && (
            <button
              type="button"
              onClick={handlePrevious}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Anterior
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {showDraftButton && onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              💾 Salvar Rascunho
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLastStep ? 'Finalizar ✓' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  );
}
