/**
 * Candidate Registration Page
 *
 * Story 2.1: User Registration (Candidate)
 * Route: /auth/register/candidate (AC1)
 *
 * Features:
 * - Form with email, password, confirm password, full_name, phone (AC2)
 * - Client-side validation (AC3)
 * - Accessibility WCAG 2.1 AA (AC10)
 * - Error handling for duplicate email (AC9)
 * - Success redirect to /candidate/profile (AC8)
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from '@remix-run/react';
import { ActionFunction, json } from '@remix-run/node';

// Design system components (per doc7: forms.md)
import { Input } from '@talentbase/design-system';
import { Button } from '@talentbase/design-system';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// API Configuration (LOW-2: Centralized API configuration)
import { buildApiUrl, API_ENDPOINTS, defaultFetchOptions } from '~/config/api';

export default function CandidateRegister() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
  });

  // Validation and UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  /**
   * Client-side validation (AC3)
   * Validates before API call for better UX
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Password strength validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Senha deve conter letras maiúsculas, minúsculas e números';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    // Full name validation
    if (!formData.full_name || formData.full_name.trim().length < 3) {
      newErrors.full_name = 'Nome completo é obrigatório (mínimo 3 caracteres)';
    }

    // Phone validation
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      newErrors.phone = 'Telefone deve ter entre 10 e 15 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * Calls API endpoint POST /api/v1/auth/register/candidate (AC4)
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    // Client-side validation first (AC3)
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // LOW-2: Using centralized API configuration
      const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.registerCandidate), {
        ...defaultFetchOptions,
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // AC9: Handle duplicate email and validation errors
        if (data.errors?.email) {
          setErrors({ email: data.errors.email[0] });
        } else if (data.errors?.detail) {
          setServerError(data.errors.detail);
        } else {
          setServerError('Erro ao criar conta. Tente novamente.');
        }
        setIsLoading(false);
        return;
      }

      // Success! Token is now stored in httpOnly cookie by backend (MED-1 fix)
      // No need to manually store token - it's automatically included in future requests
      if (data.token) {
        // Store user data in localStorage (non-sensitive info only)
        localStorage.setItem('user', JSON.stringify(data.user));

        // AC8: Redirect to /candidate/profile (onboarding)
        // Token will be automatically sent in cookies for authenticated requests
        navigate('/candidate/profile', {
          state: { message: 'Conta criada com sucesso! Complete seu perfil.' }
        });
      }

    } catch (error) {
      console.error('Registration error:', error);
      setServerError('Erro de conexão. Verifique sua internet e tente novamente.');
      setIsLoading(false);
    }
  };

  /**
   * Handle input changes with real-time validation
   */
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Criar Conta - Candidato
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Cadastre-se para acessar as melhores vagas de vendas
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start" role="alert">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        {/* Registration Form (AC2, AC10 - Accessibility) */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          {/* Full Name Field */}
          <div className="space-y-2">
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Nome Completo <span className="text-red-500" aria-label="obrigatório">*</span>
            </label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              variant={errors.full_name ? 'error' : 'default'}
              aria-invalid={!!errors.full_name}
              aria-describedby={errors.full_name ? 'full_name-error' : undefined}
              placeholder="João Silva"
              className="w-full"
            />
            {errors.full_name && (
              <p id="full_name-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.full_name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500" aria-label="obrigatório">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              variant={errors.email ? 'error' : 'default'}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              placeholder="joao@example.com"
              className="w-full"
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Telefone <span className="text-red-500" aria-label="obrigatório">*</span>
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              variant={errors.phone ? 'error' : 'default'}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : 'phone-helper'}
              placeholder="(11) 99999-9999"
              className="w-full"
            />
            {errors.phone ? (
              <p id="phone-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.phone}
              </p>
            ) : (
              <p id="phone-helper" className="text-sm text-gray-500">
                Digite apenas números
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha <span className="text-red-500" aria-label="obrigatório">*</span>
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              variant={errors.password ? 'error' : 'default'}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : 'password-helper'}
              placeholder="••••••••"
              className="w-full"
            />
            {errors.password ? (
              <p id="password-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.password}
              </p>
            ) : (
              <p id="password-helper" className="text-sm text-gray-500">
                Mínimo 8 caracteres com letras maiúsculas, minúsculas e números
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Senha <span className="text-red-500" aria-label="obrigatório">*</span>
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              variant={errors.confirmPassword ? 'error' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'success' : 'default'}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              placeholder="••••••••"
              className="w-full"
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.confirmPassword}
              </p>
            )}
            {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                Senhas conferem
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Faça login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
