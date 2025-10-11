/**
 * Custom hook for user registration
 *
 * Handles API calls for candidate and company registration.
 * Provides loading state, error handling, and success callbacks.
 */

import { useState } from 'react';

import { apiClient, ApiError } from '~/lib/apiClient';
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
      const responseData = await apiClient.post<RegistrationResponse>(endpoint, data);

      setIsLoading(false);
      return responseData;
    } catch (err) {
      setIsLoading(false);

      if (err instanceof ApiError) {
        const errorData = err.data as any;

        if (errorData?.errors) {
          const errors: Record<string, string> = {};
          Object.keys(errorData.errors).forEach((key) => {
            const errorValue = errorData.errors[key];
            if (Array.isArray(errorValue)) {
              errors[key] = errorValue[0];
            } else if (typeof errorValue === 'string') {
              errors[key] = errorValue;
            }
          });

          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          }

          if (errorData.errors.detail) {
            const detailError = Array.isArray(errorData.errors.detail)
              ? errorData.errors.detail[0]
              : errorData.errors.detail;
            setError(detailError);
          } else if (Object.keys(errors).length === 0) {
            setError(ERROR_MESSAGES.SERVER_ERROR);
          }
        } else if (errorData?.detail) {
          const detailError = Array.isArray(errorData.detail)
            ? errorData.detail[0]
            : errorData.detail;
          setError(detailError);
        } else {
          setError(ERROR_MESSAGES.SERVER_ERROR);
        }
      } else {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      }

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
