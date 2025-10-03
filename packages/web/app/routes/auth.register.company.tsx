/**
 * Company Registration Page
 *
 * Story 2.2: User Registration (Company)
 * Route: /auth/register/company (AC1)
 *
 * Features:
 * - Form with company_name, cnpj, email, password, confirm password, contact_person_name, contact_person_phone, website (AC2)
 * - Client-side CNPJ validation (AC3)
 * - Success message: "Registro enviado, você receberá aprovação em 24 horas" (AC10)
 * - Accessibility WCAG 2.1 AA
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from '@remix-run/react';
import { cnpj } from 'cpf-cnpj-validator';

// Design system components
import { Input } from '@talentbase/design-system';
import { Button } from '@talentbase/design-system';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// API Configuration
import { buildApiUrl, API_ENDPOINTS, defaultFetchOptions } from '~/config/api';

export default function CompanyRegister() {
  const navigate = useNavigate();

  // Form state (AC2)
  const [formData, setFormData] = useState({
    company_name: '',
    cnpj: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact_person_name: '',
    contact_person_phone: '',
    website: ''
  });

  // Validation and UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  /**
   * Format CNPJ as user types: XX.XXX.XXX/XXXX-XX
   */
  const formatCNPJ = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  /**
   * Client-side validation (AC3)
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Company name validation
    if (!formData.company_name || formData.company_name.trim().length < 3) {
      newErrors.company_name = 'Nome da empresa é obrigatório (mínimo 3 caracteres)';
    }

    // CNPJ validation (AC3)
    const cnpjNumbers = formData.cnpj.replace(/\D/g, '');
    if (!formData.cnpj) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (cnpjNumbers.length !== 14) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
    } else if (!cnpj.isValid(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    }

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

    // Contact person name validation
    if (!formData.contact_person_name || formData.contact_person_name.trim().length < 3) {
      newErrors.contact_person_name = 'Nome do contato é obrigatório (mínimo 3 caracteres)';
    }

    // Contact person phone validation
    const phoneDigits = formData.contact_person_phone.replace(/\D/g, '');
    if (!formData.contact_person_phone) {
      newErrors.contact_person_phone = 'Telefone é obrigatório';
    } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      newErrors.contact_person_phone = 'Telefone deve ter entre 10 e 15 dígitos';
    }

    // Website validation (optional field)
    if (formData.website) {
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlRegex.test(formData.website)) {
        newErrors.website = 'URL inválida (ex: https://empresa.com.br)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * Calls API endpoint POST /api/v1/auth/register/company (AC4)
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    // Client-side validation first (AC3)
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Remove formatting from CNPJ before sending to API
      const cnpjNumbers = formData.cnpj.replace(/\D/g, '');

      // Build payload - only include website if it has a value
      const payload: Record<string, string> = {
        company_name: formData.company_name,
        cnpj: cnpjNumbers,
        email: formData.email,
        password: formData.password,
        contact_person_name: formData.contact_person_name,
        contact_person_phone: formData.contact_person_phone
      };

      // Only add website if it's not empty
      if (formData.website && formData.website.trim()) {
        payload.website = formData.website;
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.registerCompany), {
        ...defaultFetchOptions,
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          Object.keys(data.errors).forEach(key => {
            if (Array.isArray(data.errors[key])) {
              fieldErrors[key] = data.errors[key][0];
            }
          });
          setErrors(fieldErrors);

          if (data.errors.detail) {
            setServerError(data.errors.detail);
          }
        } else {
          setServerError('Erro ao criar conta. Tente novamente.');
        }
        setIsLoading(false);
        return;
      }

      // AC10: Success message - "Registro enviado, você receberá aprovação em 24 horas"
      setSuccessMessage(data.message || 'Registro enviado, você receberá aprovação em 24 horas');

      // Clear form
      setFormData({
        company_name: '',
        cnpj: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact_person_name: '',
        contact_person_phone: '',
        website: ''
      });

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/auth/login', {
          state: { message: 'Cadastro realizado! Você receberá um email quando sua conta for aprovada.' }
        });
      }, 3000);

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
    // Apply CNPJ formatting
    if (field === 'cnpj') {
      value = formatCNPJ(value);
    }

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
            Cadastrar Empresa
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Registre sua empresa para publicar vagas e buscar candidatos
          </p>
        </div>

        {/* Success Alert (AC10) */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start" role="alert">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-green-700">{successMessage}</p>
              <p className="text-xs text-green-600 mt-1">Redirecionando para o login...</p>
            </div>
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start" role="alert">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        {/* Registration Form (AC2) */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          {/* Company Name Field */}
          <div className="space-y-2">
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
              Nome da Empresa <span className="text-red-500" aria-label="obrigatório">*</span>
            </label>
            <Input
              id="company_name"
              name="company_name"
              type="text"
              required
              autoComplete="organization"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              variant={errors.company_name ? 'error' : 'default'}
              aria-invalid={!!errors.company_name}
              aria-describedby={errors.company_name ? 'company_name-error' : undefined}
              placeholder="Minha Empresa LTDA"
              className="w-full"
            />
            {errors.company_name && (
              <p id="company_name-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.company_name}
              </p>
            )}
          </div>

          {/* CNPJ Field (AC3 - CNPJ Validation) */}
          <div className="space-y-2">
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
              CNPJ <span className="text-red-500" aria-label="obrigatório">*</span>
            </label>
            <Input
              id="cnpj"
              name="cnpj"
              type="text"
              required
              value={formData.cnpj}
              onChange={(e) => handleChange('cnpj', e.target.value)}
              variant={errors.cnpj ? 'error' : 'default'}
              aria-invalid={!!errors.cnpj}
              aria-describedby={errors.cnpj ? 'cnpj-error' : 'cnpj-helper'}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className="w-full"
            />
            {errors.cnpj ? (
              <p id="cnpj-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.cnpj}
              </p>
            ) : (
              <p id="cnpj-helper" className="text-sm text-gray-500">
                Formato: XX.XXX.XXX/XXXX-XX
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Corporativo <span className="text-red-500" aria-label="obrigatório">*</span>
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
              placeholder="contato@empresa.com.br"
              className="w-full"
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Contact Person Name Field */}
          <div className="space-y-2">
            <label htmlFor="contact_person_name" className="block text-sm font-medium text-gray-700">
              Nome do Responsável <span className="text-red-500" aria-label="obrigatório">*</span>
            </label>
            <Input
              id="contact_person_name"
              name="contact_person_name"
              type="text"
              required
              autoComplete="name"
              value={formData.contact_person_name}
              onChange={(e) => handleChange('contact_person_name', e.target.value)}
              variant={errors.contact_person_name ? 'error' : 'default'}
              aria-invalid={!!errors.contact_person_name}
              aria-describedby={errors.contact_person_name ? 'contact_person_name-error' : undefined}
              placeholder="João Silva"
              className="w-full"
            />
            {errors.contact_person_name && (
              <p id="contact_person_name-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.contact_person_name}
              </p>
            )}
          </div>

          {/* Contact Person Phone Field */}
          <div className="space-y-2">
            <label htmlFor="contact_person_phone" className="block text-sm font-medium text-gray-700">
              Telefone do Responsável <span className="text-red-500" aria-label="obrigatório">*</span>
            </label>
            <Input
              id="contact_person_phone"
              name="contact_person_phone"
              type="tel"
              required
              autoComplete="tel"
              value={formData.contact_person_phone}
              onChange={(e) => handleChange('contact_person_phone', e.target.value)}
              variant={errors.contact_person_phone ? 'error' : 'default'}
              aria-invalid={!!errors.contact_person_phone}
              aria-describedby={errors.contact_person_phone ? 'contact_person_phone-error' : 'contact_person_phone-helper'}
              placeholder="(11) 99999-9999"
              className="w-full"
            />
            {errors.contact_person_phone ? (
              <p id="contact_person_phone-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.contact_person_phone}
              </p>
            ) : (
              <p id="contact_person_phone-helper" className="text-sm text-gray-500">
                Digite apenas números
              </p>
            )}
          </div>

          {/* Website Field (Optional) */}
          <div className="space-y-2">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <Input
              id="website"
              name="website"
              type="url"
              autoComplete="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              variant={errors.website ? 'error' : 'default'}
              aria-invalid={!!errors.website}
              aria-describedby={errors.website ? 'website-error' : 'website-helper'}
              placeholder="https://www.empresa.com.br"
              className="w-full"
            />
            {errors.website ? (
              <p id="website-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.website}
              </p>
            ) : (
              <p id="website-helper" className="text-sm text-gray-500">
                Ex: https://www.empresa.com.br
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
                Enviando cadastro...
              </>
            ) : (
              'Cadastrar Empresa'
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
