/**
 * Custom hook for form validation
 *
 * Provides a reusable way to handle form state, validation, and error management.
 * Reduces boilerplate code in form components.
 */

import { useState, useCallback } from 'react';

export type ValidationFunction<T> = (value: T) => { isValid: boolean; error?: string };

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationFunction<T[K]>;
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export interface UseFormValidationReturn<T> {
  formData: T;
  errors: FormErrors<T>;
  isValidating: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors<T>>>;
  clearErrors: () => void;
  resetForm: () => void;
}

/**
 * Hook for managing form validation
 *
 * @param initialValues - Initial form values
 * @param validationSchema - Validation functions for each field
 * @returns Form state and validation utilities
 *
 * @example
 * const { formData, errors, handleChange, validateForm } = useFormValidation(
 *   { email: '', password: '' },
 *   {
 *     email: validateEmail,
 *     password: validatePassword
 *   }
 * );
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: ValidationSchema<T>
): UseFormValidationReturn<T> {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (field: keyof T): boolean => {
      if (!validationSchema || !validationSchema[field]) {
        return true;
      }

      const validator = validationSchema[field];
      const value = formData[field];
      const result = validator(value);

      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, [field]: result.error }));
        return false;
      }

      // Clear error if valid
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });

      return true;
    },
    [formData, validationSchema]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    if (!validationSchema) {
      return true;
    }

    setIsValidating(true);
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    // Validate all fields
    (Object.keys(validationSchema) as Array<keyof T>).forEach((field) => {
      const validator = validationSchema[field];
      if (!validator) return;

      const value = formData[field];
      const result = validator(value);

      if (!result.isValid) {
        newErrors[field] = result.error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setIsValidating(false);

    return isValid;
  }, [formData, validationSchema]);

  /**
   * Handle input change
   * Automatically clears error for the field being edited
   */
  const handleChange = useCallback((field: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Handle field blur (when user leaves a field)
   * Triggers validation for the specific field
   */
  const handleBlur = useCallback(
    (field: keyof T) => {
      validateField(field);
    },
    [validateField]
  );

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    formData,
    errors,
    isValidating,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    setFormData,
    setErrors,
    clearErrors,
    resetForm,
  };
}
