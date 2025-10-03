/**
 * Custom hook for user login
 *
 * Handles API calls for login with email and password.
 * Provides loading state, error handling, and success callbacks.
 *
 * Story 2.3: Login & Token Authentication
 */

import { useState } from 'react';
import { buildApiUrl, defaultFetchOptions, API_ENDPOINTS } from '~/config/api';
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

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse | null> => {
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.login), {
        ...defaultFetchOptions,
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle 401 errors (invalid credentials, inactive account)
        if (response.status === 401) {
          // Use error message from backend (AC7, AC8)
          setError(responseData.error || ERROR_MESSAGES.INVALID_CREDENTIALS);
        } else if (response.status === 429) {
          // Rate limit exceeded
          setError(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
        } else if (responseData.errors) {
          // Handle field-level validation errors
          const errors: Record<string, string> = {};
          Object.keys(responseData.errors).forEach((key) => {
            if (Array.isArray(responseData.errors[key])) {
              errors[key] = responseData.errors[key][0];
            }
          });

          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          }

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

      // Success! Token is now stored in httpOnly cookie by backend
      setIsLoading(false);
      return responseData as LoginResponse;
    } catch (err) {
      console.error('Login error:', err);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
      setIsLoading(false);
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
