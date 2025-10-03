/**
 * Custom hook for user registration
 *
 * Handles API calls for candidate and company registration.
 * Provides loading state, error handling, and success callbacks.
 */

import { useState } from 'react';
import { buildApiUrl, defaultFetchOptions } from '~/config/api';
import { ERROR_MESSAGES } from '~/utils/constants';

export interface RegistrationResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  token: string;
  message?: string;
}

export interface UseRegistrationReturn {
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  register: (endpoint: string, data: Record<string, any>) => Promise<RegistrationResponse | null>;
  clearErrors: () => void;
}

/**
 * Hook for handling registration API calls
 *
 * @returns Registration state and functions
 *
 * @example
 * const { isLoading, error, register } = useRegistration();
 *
 * const handleSubmit = async () => {
 *   const result = await register('/api/v1/auth/register/candidate', {
 *     email: 'user@example.com',
 *     password: 'password123'
 *   });
 *   if (result) {
 *     // Handle success
 *   }
 * };
 */
export function useRegistration(): UseRegistrationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const register = async (
    endpoint: string,
    data: Record<string, any>
  ): Promise<RegistrationResponse | null> => {
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch(buildApiUrl(endpoint), {
        ...defaultFetchOptions,
        method: 'POST',
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (responseData.errors) {
          // Check for field-specific errors
          const errors: Record<string, string> = {};
          Object.keys(responseData.errors).forEach((key) => {
            if (Array.isArray(responseData.errors[key])) {
              errors[key] = responseData.errors[key][0];
            }
          });

          // If we have field errors, set them
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          }

          // Set general error if exists
          if (responseData.errors.detail) {
            setError(responseData.errors.detail);
          } else if (Object.keys(errors).length === 0) {
            setError(ERROR_MESSAGES.SERVER_ERROR);
          }
        } else {
          setError(ERROR_MESSAGES.SERVER_ERROR);
        }

        setIsLoading(false);
        return null;
      }

      // Success!
      setIsLoading(false);
      return responseData as RegistrationResponse;
    } catch (err) {
      console.error('Registration error:', err);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
      setIsLoading(false);
      return null;
    }
  };

  return {
    isLoading,
    error,
    fieldErrors,
    register,
    clearErrors,
  };
}
