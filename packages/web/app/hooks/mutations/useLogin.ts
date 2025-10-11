/**
 * Login Mutation Hook (React Query)
 *
 * Replaces the old useLogin hook with React Query's useMutation.
 *
 * Benefits:
 * - Automatic loading/error state management
 * - Built-in retry logic
 * - Better error handling
 * - Integration with query cache (can set currentUser on success)
 *
 * Usage:
 * ```typescript
 * const loginMutation = useLogin();
 *
 * <form onSubmit={() => loginMutation.mutate({ email, password })}>
 *   {loginMutation.isPending && <Spinner />}
 *   {loginMutation.isError && <Alert>{loginMutation.error.message}</Alert>}
 * </form>
 * ```
 */

import { useNavigate } from '@remix-run/react';
import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '~/config/api';
import { apiClient, ApiError } from '~/lib/apiClient';
import { queryClient, queryKeys } from '~/lib/queryClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

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

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      return apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, credentials);
    },

    onSuccess: (data) => {
      // Cache the current user
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);

      // Redirect to the appropriate page
      navigate(data.redirect_url);
    },

    onError: (error: ApiError) => {
      console.error('[Login Error]:', error);
      // Error is automatically available via mutation.error
      // Can add toast notification here if desired
    },
  });
}

/**
 * Field-level errors interface (for form validation)
 */
export interface LoginFieldErrors {
  email?: string;
  password?: string;
}

/**
 * Helper to extract field errors from ApiError
 */
export function extractLoginFieldErrors(error: ApiError | null): LoginFieldErrors {
  if (!error?.data) return {};

  const errorData = error.data as any;
  const fieldErrors: LoginFieldErrors = {};

  if (errorData?.errors) {
    Object.keys(errorData.errors).forEach((key) => {
      if (key === 'email' || key === 'password') {
        const errorValue = errorData.errors[key];
        fieldErrors[key] = Array.isArray(errorValue) ? errorValue[0] : errorValue;
      }
    });
  }

  return fieldErrors;
}
