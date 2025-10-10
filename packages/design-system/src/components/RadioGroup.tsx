/**
 * RadioGroup Component - Design System
 *
 * Grouped radio button input for selecting one option from multiple choices.
 * Used for forms with mutually exclusive options.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   name="import-mode"
 *   options={[
 *     { value: 'replace', label: 'Substituir existentes', description: 'Remove dados antigos' },
 *     { value: 'merge', label: 'Mesclar com existentes', description: 'Atualiza apenas novos' },
 *   ]}
 *   value={selectedMode}
 *   onChange={(value) => setSelectedMode(value)}
 * />
 * ```
 */

import { cn } from '../lib/utils';

export interface RadioOption {
  /**
   * Option value
   */
  value: string;
  /**
   * Option label
   */
  label: string;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Is option disabled?
   */
  disabled?: boolean;
  /**
   * Optional icon
   */
  icon?: React.ReactNode;
}

export interface RadioGroupProps {
  /**
   * Name attribute for radio inputs
   */
  name: string;
  /**
   * Array of radio options
   */
  options: RadioOption[];
  /**
   * Currently selected value
   */
  value?: string;
  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void;
  /**
   * Group label
   */
  label?: string;
  /**
   * Helper text below group
   */
  helperText?: string;
  /**
   * Error message
   */
  error?: string;
  /**
   * Disable all options
   */
  disabled?: boolean;
  /**
   * Orientation
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Required field
   */
  required?: boolean;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  helperText,
  error,
  disabled = false,
  orientation = 'vertical',
  className,
  required = false,
}: RadioGroupProps) {
  return (
    <fieldset className={cn('space-y-2', className)}>
      {/* Group Label */}
      {label && (
        <legend className="text-sm font-medium text-gray-900 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}

      {/* Radio Options */}
      <div
        className={cn(
          'space-y-3',
          orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0'
        )}
        role="radiogroup"
        aria-label={label}
        aria-required={required}
      >
        {options.map((option) => {
          const isDisabled = disabled || option.disabled;
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                'relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer',
                isSelected && !isDisabled && 'border-primary-500 bg-primary-50',
                !isSelected && !isDisabled && 'border-gray-200 hover:border-gray-300',
                isDisabled && 'opacity-50 cursor-not-allowed bg-gray-50',
                error && !isDisabled && 'border-red-500'
              )}
            >
              {/* Radio Input */}
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => !isDisabled && onChange?.(option.value)}
                disabled={isDisabled}
                required={required}
                className="sr-only"
                aria-describedby={
                  option.description ? `${name}-${option.value}-description` : undefined
                }
              />

              {/* Custom Radio Circle */}
              <div
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all mt-0.5',
                  isSelected && !isDisabled && 'border-primary-500 border-[6px]',
                  !isSelected && !isDisabled && 'border-gray-300',
                  isDisabled && 'border-gray-300'
                )}
                aria-hidden="true"
              />

              {/* Option Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {option.icon && (
                    <span className="flex-shrink-0 text-gray-500">
                      {option.icon}
                    </span>
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected && !isDisabled && 'text-primary-700',
                      !isSelected && !isDisabled && 'text-gray-900',
                      isDisabled && 'text-gray-500'
                    )}
                  >
                    {option.label}
                  </span>
                </div>
                {option.description && (
                  <p
                    id={`${name}-${option.value}-description`}
                    className="text-xs text-gray-500 mt-1"
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-2">{helperText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 mt-2" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/**
 * RadioCard - Alternative radio component with card-like appearance
 */
export interface RadioCardProps {
  /**
   * Name attribute
   */
  name: string;
  /**
   * Card value
   */
  value: string;
  /**
   * Is selected?
   */
  checked: boolean;
  /**
   * On change callback
   */
  onChange: () => void;
  /**
   * Card title
   */
  title: string;
  /**
   * Card description
   */
  description?: string;
  /**
   * Card icon
   */
  icon?: React.ReactNode;
  /**
   * Is disabled?
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  icon,
  disabled = false,
  className,
}: RadioCardProps) {
  return (
    <label
      className={cn(
        'relative flex flex-col p-4 rounded-lg border-2 transition-all cursor-pointer',
        checked && !disabled && 'border-primary-500 bg-primary-50 shadow-sm',
        !checked && !disabled && 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
        disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
        className
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />

      <div className="flex items-start gap-3">
        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-white">
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4
              className={cn(
                'text-sm font-semibold',
                checked && !disabled && 'text-primary-700',
                !checked && !disabled && 'text-gray-900',
                disabled && 'text-gray-500'
              )}
            >
              {title}
            </h4>

            {/* Check Icon */}
            {checked && !disabled && (
              <svg
                className="w-5 h-5 text-primary-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </label>
  );
}
