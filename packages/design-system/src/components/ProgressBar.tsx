/**
 * ProgressBar Component - Design System
 *
 * Visual progress indicator with label and variants.
 * Used for showing upload progress, import progress, etc.
 *
 * @example
 * ```tsx
 * <ProgressBar
 *   value={75}
 *   max={100}
 *   label="Importando candidatos"
 *   variant="default"
 *   showPercentage
 * />
 * ```
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const progressBarVariants = cva(
  'h-2 rounded-full transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-primary-500',
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const progressContainerVariants = cva(
  'w-full bg-gray-200 rounded-full overflow-hidden',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ProgressBarProps
  extends VariantProps<typeof progressBarVariants>,
    VariantProps<typeof progressContainerVariants> {
  /**
   * Current progress value
   */
  value: number;
  /**
   * Maximum value (defaults to 100)
   */
  max?: number;
  /**
   * Label text to display above progress bar
   */
  label?: string;
  /**
   * Show percentage text (e.g., "75%")
   */
  showPercentage?: boolean;
  /**
   * Show fraction text (e.g., "75 / 100")
   */
  showFraction?: boolean;
  /**
   * Additional CSS classes for container
   */
  className?: string;
  /**
   * Animated stripe effect
   */
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  variant = 'default',
  size = 'md',
  showPercentage = false,
  showFraction = false,
  className,
  animated = false,
}: ProgressBarProps) {
  // Ensure value is within bounds
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = Math.round((clampedValue / max) * 100);

  return (
    <div className={cn('w-full', className)} role="progressbar" aria-valuenow={clampedValue} aria-valuemin={0} aria-valuemax={max}>
      {/* Label and Info Row */}
      {(label || showPercentage || showFraction) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}

          <div className="flex items-center gap-2">
            {showFraction && (
              <span className="text-xs text-gray-600">
                {clampedValue} / {max}
              </span>
            )}
            {showPercentage && (
              <span className="text-xs font-semibold text-gray-700">
                {percentage}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className={cn(progressContainerVariants({ size }))}>
        <div
          className={cn(
            progressBarVariants({ variant }),
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * ProgressBarWithSteps - Shows progress with discrete steps
 */
export interface ProgressBarWithStepsProps {
  /**
   * Current step (0-indexed)
   */
  currentStep: number;
  /**
   * Total number of steps
   */
  totalSteps: number;
  /**
   * Step labels
   */
  stepLabels?: string[];
  /**
   * Variant
   */
  variant?: VariantProps<typeof progressBarVariants>['variant'];
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function ProgressBarWithSteps({
  currentStep,
  totalSteps,
  stepLabels = [],
  variant = 'default',
  className,
}: ProgressBarWithStepsProps) {
  const percentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Step Labels */}
      {stepLabels.length > 0 && (
        <div className="flex justify-between mb-2">
          {stepLabels.map((label, index) => (
            <span
              key={index}
              className={cn(
                'text-xs font-medium',
                index <= currentStep ? 'text-primary-600' : 'text-gray-400'
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              progressBarVariants({ variant }),
              'transition-all duration-500 ease-in-out'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Step Dots */}
        <div className="absolute top-0 left-0 w-full h-2 flex justify-between items-center">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-4 h-4 rounded-full border-2 bg-white transition-all duration-300',
                index <= currentStep
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300 bg-white'
              )}
            />
          ))}
        </div>
      </div>

      {/* Step Counter */}
      <div className="text-center mt-2">
        <span className="text-xs text-gray-600">
          Passo {currentStep + 1} de {totalSteps}
        </span>
      </div>
    </div>
  );
}

export { progressBarVariants, progressContainerVariants };
