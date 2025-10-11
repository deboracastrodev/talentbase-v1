/**
 * Registration Mutation Hook (React Query)
 *
 * Replaces the old useRegistration hook with React Query's useMutation.
 *
 * Usage:
 * ```typescript
 * const registerMutation = useRegistration();
 *
 * registerMutation.mutate({
 *   endpoint: '/api/v1/auth/register/candidate',
 *   data: { email, password, full_name, phone }
 * });
 * ```
 */

import { useNavigate } from '@remix-run/react';
import { useMutation } from '@tanstack/react-query';

import { apiClient, ApiError } from '~/lib/apiClient';
import { queryClient, queryKeys } from '~/lib/queryClient';

export interface RegistrationData {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  company_name?: string;
  cnpj?: string;
  [key: string]: any;
}

export interface RegistrationRequest {
  endpoint: string;
  data: RegistrationData;
}

export interface RegistrationResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  token: string;
  message?: string;
}

export function useRegistration() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ endpoint, data }: RegistrationRequest): Promise<RegistrationResponse> => {
      return apiClient.post<RegistrationResponse>(endpoint, data);
    },

    onSuccess: (data) => {
      // Cache the current user
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);

      // Redirect based on user role
      if (data.user.role === 'candidate') {
        navigate('/candidate/profile/create');
      } else if (data.user.role === 'company') {
        navigate('/auth/registration-pending');
      } else {
        navigate('/');
      }
    },

    onError: (error: ApiError) => {
      console.error('[Registration Error]:', error);
    },
  });
}

/**
 * Field-level errors interface
 */
export interface RegistrationFieldErrors {
  email?: string;
  password?: string;
  full_name?: string;
  phone?: string;
  company_name?: string;
  cnpj?: string;
  [key: string]: string | undefined;
}

/**
 * Helper to extract field errors from ApiError
 */
export function extractRegistrationFieldErrors(error: ApiError | null): RegistrationFieldErrors {
  if (!error?.data) return {};

  const errorData = error.data as any;
  const fieldErrors: RegistrationFieldErrors = {};

  if (errorData?.errors) {
    Object.keys(errorData.errors).forEach((key) => {
      const errorValue = errorData.errors[key];
      fieldErrors[key] = Array.isArray(errorValue) ? errorValue[0] : errorValue;
    });
  }

  return fieldErrors;
}

/**
 * Helper to extract general error message from ApiError
 */
export function extractRegistrationError(error: ApiError | null): string | null {
  if (!error?.data) return null;

  const errorData = error.data as any;

  if (errorData?.errors?.detail) {
    return Array.isArray(errorData.errors.detail)
      ? errorData.errors.detail[0]
      : errorData.errors.detail;
  }

  if (errorData?.detail) {
    return Array.isArray(errorData.detail) ? errorData.detail[0] : errorData.detail;
  }

  return 'Erro ao realizar cadastro. Tente novamente.';
}
