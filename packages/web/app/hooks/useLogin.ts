/**
 * Custom hook for user login
 *
 * Handles API calls for login with email and password.
 * Provides loading state, error handling, and success callbacks.
 *
 * Story 2.3: Login & Token Authentication
 */

import { useState } from 'react';

import { API_ENDPOINTS } from '~/config/api';
import { apiClient, ApiError } from '~/lib/apiClient';
import { ERROR_MESSAGES } from '~/utils/constants';

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
  };
  token: string;
  redirect_url: string;
}

export interface UseLoginReturn {
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  login: (email: string, password: string) => Promise<LoginResponse | null>;
  clearErrors: () => void;
}

/**
 * Hook for handling login API calls
 *
 * @returns Login state and functions
 *
 * @example
 * const { isLoading, error, login } = useLogin();
 *
 * const handleSubmit = async () => {
 *   const result = await login('user@example.com', 'password123');
 *   if (result) {
 *     navigate(result.redirect_url);
 *   }
 * };
 */
export function useLogin(): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const login = async (email: string, password: string): Promise<LoginResponse | null> => {
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const responseData = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, {
        email,
        password,
      });

      setIsLoading(false);
      return responseData;
    } catch (err) {
      setIsLoading(false);

      if (err instanceof ApiError) {
        const errorData = err.data as any;

        if (err.status === 401) {
          setError(errorData?.error || ERROR_MESSAGES.INVALID_CREDENTIALS);
        } else if (err.status === 429) {
          setError(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
        } else if (errorData?.errors) {
          const errors: Record<string, string> = {};
          Object.keys(errorData.errors).forEach((key) => {
            if (Array.isArray(errorData.errors[key])) {
              errors[key] = errorData.errors[key][0];
            }
          });

          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          }

          if (errorData.errors.detail) {
            setError(errorData.errors.detail);
          } else if (Object.keys(errors).length === 0) {
            setError(ERROR_MESSAGES.SERVER_ERROR);
          }
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
    login,
    clearErrors,
  };
}
