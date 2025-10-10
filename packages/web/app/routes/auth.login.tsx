/**
 * Login Page
 *
 * Story 2.3: Login & Token Authentication
 * Route: /auth/login (AC1)
 *
 * Features:
 * - Email and password fields (AC2)
 * - API integration with POST /api/v1/auth/login (AC3)
 * - Token authentication with httpOnly cookie (AC4, AC5)
 * - Role-based redirect (AC6)
 * - Error handling for invalid credentials (AC7)
 * - Error handling for inactive/pending accounts (AC8)
 * - "Forgot password" placeholder link (AC9)
 */

import { FormEvent } from 'react';
import { useNavigate, Link } from '@remix-run/react';
import { Button, AuthLayout, AuthCard, Alert, AuthFormField } from '@talentbase/design-system';
import { Loader2 } from 'lucide-react';

// Hooks
import { useFormValidation } from '~/hooks/useFormValidation';
import { useLogin } from '~/hooks/useLogin';

// Utilities
import { validateEmail } from '~/utils/validation';
import { ERROR_MESSAGES } from '~/utils/constants';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();

  // Form validation hook
  const { formData, errors, handleChange, validateForm } = useFormValidation<LoginFormData>(
    {
      email: '',
      password: '',
    },
    {
      email: validateEmail,
      password: (value: string) => {
        // Basic required check for login (not as strict as registration)
        if (!value) {
          return { isValid: false, error: ERROR_MESSAGES.REQUIRED_PASSWORD };
        }
        return { isValid: true };
      },
    }
  );

  // Login API hook
  const { isLoading, error: serverError, login } = useLogin();

  /**
   * Handle form submission
   * AC3: Call POST /api/v1/auth/login
   * AC6: Redirect based on role and status
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    // Call login API
    const result = await login(formData.email, formData.password);

    if (result) {
      // Success! Token is now stored in httpOnly cookie by backend (AC4, AC5)
      // Store user data in localStorage (non-sensitive info only)
      localStorage.setItem('user', JSON.stringify(result.user));

      // AC6: Redirect based on role
      navigate(result.redirect_url);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Login"
        subtitle="Entre com seu email e senha para acessar sua conta"
      >
        {/* Server Error Alert (AC7, AC8) */}
        {serverError && <Alert variant="error" message={serverError} />}

        {/* Login Form (AC2) */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field */}
          <AuthFormField
            id="email"
            name="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            placeholder="seu@email.com"
            autoComplete="email"
            required
          />

          {/* Password Field */}
          <AuthFormField
            id="password"
            name="password"
            type="password"
            label="Senha"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          {/* Forgot Password Link (AC9: Placeholder) */}
          <div className="text-right">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>

          {/* Registration Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Ainda não tem uma conta?</p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/auth/register/candidate"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Criar conta - Candidato
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/auth/register/company"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Criar conta - Empresa
              </Link>
            </div>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
