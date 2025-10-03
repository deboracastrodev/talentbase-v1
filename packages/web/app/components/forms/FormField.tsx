/**
 * FormField Component
 *
 * Reusable form field component that combines:
 * - Label with required indicator
 * - Input component from design system
 * - Error message display
 * - Helper text display
 * - Accessibility attributes (WCAG 2.1 AA compliant)
 *
 * This component eliminates the need to repeat label/input/error structure
 * across multiple forms, following DRY principle.
 */

import { ReactNode } from 'react';
import { Input, InputProps } from '@talentbase/design-system';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface FormFieldProps extends Omit<InputProps, 'variant'> {
  label: ReactNode; // Can be string or JSX element for flexibility
  error?: string;
  helperText?: string;
  showSuccess?: boolean;
  successMessage?: string;
  required?: boolean;
  children?: ReactNode; // For custom input components (textarea, select, etc.)
}

/**
 * Reusable form field with label, input, error, and helper text
 *
 * @example
 * <FormField
 *   id="email"
 *   name="email"
 *   type="email"
 *   label="Email"
 *   value={formData.email}
 *   onChange={(e) => handleChange('email', e.target.value)}
 *   error={errors.email}
 *   helperText="Digite seu melhor email"
 *   required
 * />
 */
export function FormField({
  label,
  error,
  helperText,
  showSuccess,
  successMessage,
  required,
  id,
  children,
  ...inputProps
}: FormFieldProps) {
  const hasError = !!error;
  const hasSuccess = showSuccess && !hasError;

  // Determine input variant based on state
  const variant = hasError ? 'error' : hasSuccess ? 'success' : 'default';

  return (
    <div className="space-y-2">
      {/* Label */}
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}{' '}
        {required && (
          <span className="text-red-500" aria-label="obrigatório">
            *
          </span>
        )}
      </label>

      {/* Input - either custom children or default Input component */}
      {children || (
        <Input
          id={id}
          variant={variant}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${id}-error`
              : hasSuccess
              ? `${id}-success`
              : helperText
              ? `${id}-helper`
              : undefined
          }
          className="w-full"
          {...inputProps}
        />
      )}

      {/* Error Message */}
      {hasError && (
        <p
          id={`${id}-error`}
          className="text-sm text-red-500 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Success Message */}
      {hasSuccess && successMessage && (
        <p
          id={`${id}-success`}
          className="text-sm text-green-500 flex items-center gap-1"
        >
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
          {successMessage}
        </p>
      )}

      {/* Helper Text (only show if no error or success) */}
      {!hasError && !hasSuccess && helperText && (
        <p id={`${id}-helper`} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
