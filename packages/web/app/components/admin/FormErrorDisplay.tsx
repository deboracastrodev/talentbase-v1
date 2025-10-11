/**
 * FormErrorDisplay Component
 *
 * Displays form submission errors in a consistent, accessible way.
 * Handles both general errors and field-specific errors.
 *
 * @example
 * <FormErrorDisplay
 *   error="Erro ao criar candidato"
 *   fieldErrors={{ email: 'Email já cadastrado' }}
 * />
 */

import { Alert } from '@talentbase/design-system';

/**
 * Component props
 */
interface FormErrorDisplayProps {
  /**
   * General error message
   */
  error?: string;

  /**
   * Field-specific errors
   */
  fieldErrors?: Record<string, string>;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Display form errors in a user-friendly way
 */
export function FormErrorDisplay({ error, fieldErrors, className }: FormErrorDisplayProps) {
  // Don't render if no errors
  if (!error && (!fieldErrors || Object.keys(fieldErrors).length === 0)) {
    return null;
  }

  return (
    <div className={className}>
      {/* General error */}
      {error && (
        <Alert variant="destructive" className="mb-6" role="alert">
          {error}
        </Alert>
      )}

      {/* Field-specific errors */}
      {fieldErrors && Object.keys(fieldErrors).length > 0 && (
        <Alert variant="destructive" className="mb-6" role="alert">
          <div>
            <p className="font-semibold mb-2">Corrija os seguintes erros:</p>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(fieldErrors).map(([field, message]) => (
                <li key={field}>
                  <span className="font-medium">{field}:</span> {message}
                </li>
              ))}
            </ul>
          </div>
        </Alert>
      )}
    </div>
  );
}
