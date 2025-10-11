/**
 * Set Password with Token Page
 *
 * Story 3.3.5 - AC 17, 18, 19, 20, 21, 24, 25
 * Route: /auth/set-password?token=<uuid>
 *
 * Candidate sets their password after admin creates account.
 * Token is valid for 7 days and single-use.
 */

import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useActionData, useLoaderData, useNavigation, Form } from '@remix-run/react';
import { Button, AuthLayout, AuthCard, Alert, Input } from '@talentbase/design-system';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { useState } from 'react';

import { apiClient } from '~/lib/apiClient';
// TODO: Implement createUserSession or use redirect
// import { createUserSession } from '~/utils/auth.server';

interface LoaderData {
  token: string | null;
  tokenValid: boolean;
  error?: string;
}

interface ActionData {
  error?: string;
  fieldErrors?: {
    password?: string;
    confirmPassword?: string;
  };
}

/**
 * Loader - Validate token parameter exists
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return json<LoaderData>({
      token: null,
      tokenValid: false,
      error: 'Token de redefinição de senha não fornecido',
    });
  }

  // Token validation will happen on submit
  return json<LoaderData>({
    token,
    tokenValid: true,
  });
}

/**
 * Action - Handle password set submission
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const token = formData.get('token')?.toString();
  const password = formData.get('password')?.toString() || '';
  const confirmPassword = formData.get('confirmPassword')?.toString() || '';

  // Validation
  const fieldErrors: ActionData['fieldErrors'] = {};

  if (!password || password.length < 8) {
    fieldErrors.password = 'Senha deve ter no mínimo 8 caracteres';
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = 'As senhas não coincidem';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return json<ActionData>({ fieldErrors }, { status: 400 });
  }

  if (!token) {
    return json<ActionData>(
      {
        error: 'Token inválido ou expirado',
      },
      { status: 400 }
    );
  }

  try {
    // Call API to set password with token
    const response = await apiClient.post<{
      access_token: string;
      user: { id: string; email: string; role: string };
    }>('/api/v1/auth/set-password', {
      token,
      password,
    });

    // TODO: Create user session with the returned JWT token
    // For now, just redirect (session handling to be implemented)
    return redirect('/candidate/profile/create');
  } catch (error: any) {
    console.error('[Set Password] Error:', error);

    // Handle invalid/expired token
    if (error.status === 400) {
      return json<ActionData>(
        {
          error: 'Token inválido ou expirado. Solicite um novo link ao administrador.',
        },
        { status: 400 }
      );
    }

    // Generic error
    return json<ActionData>(
      {
        error: 'Erro ao definir senha. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

export default function SetPasswordPage() {
  const { token, tokenValid, error: loaderError } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 8) return { strength: 'weak', color: 'red', label: 'Fraca' };
    if (pwd.length < 12) return { strength: 'medium', color: 'yellow', label: 'Média' };
    return { strength: 'strong', color: 'green', label: 'Forte' };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // If no token or invalid token, show error
  if (!tokenValid || loaderError) {
    return (
      <AuthLayout>
        <AuthCard title="Link Inválido" subtitle="O link de redefinição de senha não é válido">
          <Alert variant="destructive" title="Erro">
            {loaderError || 'Token de redefinição de senha não encontrado na URL.'}
          </Alert>

          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-gray-600">
              Se você recebeu um email de boas-vindas, verifique se copiou o link completo.
            </p>
            <p className="text-sm text-gray-600">
              Caso o link tenha expirado (7 dias), entre em contato com o administrador para receber
              um novo convite.
            </p>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard title="Defina sua Senha" subtitle="Crie uma senha segura para acessar sua conta">
        {/* Server Error Alert */}
        {actionData?.error && (
          <Alert variant="destructive" title="Erro">
            {actionData.error}
          </Alert>
        )}

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium">Bem-vindo ao TalentBase!</p>
              <p className="mt-1 text-sm text-blue-700">
                Após definir sua senha, você poderá completar seu perfil profissional e começar a
                buscar oportunidades.
              </p>
            </div>
          </div>
        </div>

        {/* Set Password Form */}
        <Form method="post" className="space-y-5 mt-6" noValidate>
          <input type="hidden" name="token" value={token || ''} />

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={actionData?.fieldErrors?.password}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        passwordStrength.strength === 'weak'
                          ? 'bg-red-500 w-1/3'
                          : passwordStrength.strength === 'medium'
                            ? 'bg-yellow-500 w-2/3'
                            : 'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}

            {actionData?.fieldErrors?.password && (
              <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirme a Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                error={actionData?.fieldErrors?.confirmPassword}
                disabled={isSubmitting}
              />
              {passwordsMatch && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              )}
            </div>
            {actionData?.fieldErrors?.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Requirements List */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Requisitos da senha:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <div
                  className={`h-4 w-4 rounded-full flex items-center justify-center ${
                    password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  {password.length >= 8 && (
                    <CheckCircle className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </div>
                Mínimo de 8 caracteres
              </li>
              <li className="flex items-center gap-2">
                <div
                  className={`h-4 w-4 rounded-full flex items-center justify-center ${
                    passwordsMatch ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  {passwordsMatch && <CheckCircle className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
                Senhas coincidem
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={isSubmitting || !password || !confirmPassword}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Definindo senha...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Definir Senha e Continuar
              </>
            )}
          </Button>
        </Form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Após definir sua senha, você será redirecionado para completar seu perfil profissional.
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
