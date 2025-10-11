/**
 * useWizardSubmit Hook
 *
 * Manages form submission for multi-step wizards with proper error handling,
 * loading states, and success callbacks.
 *
 * @example
 * const { submit, isSubmitting, error, fieldErrors } = useWizardSubmit({
 *   onSuccess: () => clearDraft(),
 *   onError: (error) => console.error(error),
 * });
 *
 * <Form onSubmit={(e) => submit(e, formData)}>...</Form>
 */

import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';

/**
 * Hook options
 */
interface UseWizardSubmitOptions {
  /**
   * Callback executed on successful submission
   * Receives the response from the server
   */
  onSuccess?: (response?: unknown) => void;

  /**
   * Callback executed on submission error
   * Receives the error object
   */
  onError?: (error: Error) => void;

  /**
   * Custom submit handler (optional)
   * If not provided, uses default Remix Form submission
   */
  customSubmit?: (data: unknown) => Promise<unknown>;
}

/**
 * Hook return value
 */
interface UseWizardSubmitReturn {
  /**
   * Submit handler for form
   */
  submit: (event: FormEvent<HTMLFormElement>, data: unknown) => Promise<void>;

  /**
   * Indicates if submission is in progress
   */
  isSubmitting: boolean;

  /**
   * General error message
   */
  error: string | null;

  /**
   * Field-specific errors
   */
  fieldErrors: Record<string, string> | null;

  /**
   * Clear all errors
   */
  clearErrors: () => void;

  /**
   * Set error manually
   */
  setError: (error: string) => void;

  /**
   * Set field errors manually
   */
  setFieldErrors: (errors: Record<string, string>) => void;
}

/**
 * Wizard form submission hook
 */
export function useWizardSubmit({
  onSuccess,
  onError,
  customSubmit,
}: UseWizardSubmitOptions = {}): UseWizardSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const [fieldErrors, setFieldErrorsState] = useState<Record<string, string> | null>(null);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrorState(null);
    setFieldErrorsState(null);
  }, []);

  /**
   * Set general error
   */
  const setError = useCallback((err: string) => {
    setErrorState(err);
  }, []);

  /**
   * Set field-specific errors
   */
  const setFieldErrors = useCallback((errors: Record<string, string>) => {
    setFieldErrorsState(errors);
  }, []);

  /**
   * Submit form data
   */
  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>, data: unknown) => {
      // Clear previous errors
      clearErrors();
      setIsSubmitting(true);

      try {
        let response: unknown;

        if (customSubmit) {
          // Use custom submit handler
          response = await customSubmit(data);
        } else {
          // Use default Remix Form submission
          // Form will POST to current route's action
          // Don't prevent default - let Remix handle it
          return;
        }

        // Success callback
        onSuccess?.(response);
      } catch (err) {
        // Error handling
        const error = err as Error;

        // Log error (will be replaced by proper logging system)
        if (process.env.NODE_ENV === 'development') {
          console.error('[useWizardSubmit] Submission error:', error);
        }

        // Set error state
        if ('fieldErrors' in error && typeof error.fieldErrors === 'object') {
          setFieldErrorsState(error.fieldErrors as Record<string, string>);
        } else {
          setErrorState(error.message || 'Erro ao processar requisição. Tente novamente.');
        }

        // Error callback
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [customSubmit, onSuccess, onError, clearErrors]
  );

  return {
    submit,
    isSubmitting,
    error,
    fieldErrors,
    clearErrors,
    setError,
    setFieldErrors,
  };
}
