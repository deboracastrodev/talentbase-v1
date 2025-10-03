/**
 * Auth Entry Point Page
 *
 * Route: /auth/register
 *
 * Unified entry point for both registration and login
 * Handles:
 * - ?type=candidate → redirect to /auth/register/candidate
 * - ?type=company → redirect to /auth/register/company
 * - No query param → show selection page
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from '@remix-run/react';
import { AuthLayout, AuthCard } from '@talentbase/design-system';
import { Users, Building2, ArrowRight } from 'lucide-react';
import logoFull from '~/assets/logo-full.svg';

export default function AuthEntryPoint() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  // Auto-redirect if type is specified
  useEffect(() => {
    if (type === 'candidate') {
      navigate('/auth/register/candidate');
    } else if (type === 'company') {
      navigate('/auth/register/company');
    }
  }, [type, navigate]);

  // If redirecting, show nothing (prevents flash)
  if (type) {
    return null;
  }

  return (
    <AuthLayout>
      <AuthCard className="max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={logoFull}
            alt="TalentBase"
            className="h-16 w-auto pl-14"
            style={{ filter: 'brightness(0) saturate(100%) invert(18%) sepia(51%) saturate(2878%) hue-rotate(197deg) brightness(95%) contrast(101%)' }}
          />
        </div>

        {/* Subtitle */}
        <h3 className="text-xl text-center text-gray-700 mb-8 font-medium">
          Como você deseja entrar?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidate Card */}
          <Link
            to="/auth/register/candidate"
            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 p-6 transition-all duration-300 hover:border-primary-500 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon */}
              <div className="p-4 rounded-full bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
                <Users className="h-8 w-8" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900">
                Candidato
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600">
                Buscar vagas de vendas tech e conectar-se com empresas
              </p>

              {/* Benefits */}
              <ul className="text-xs text-gray-500 space-y-2 text-left w-full">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  Acesso imediato ao dashboard
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  Headhunter de IA pessoal
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  Conexão direta com decisores
                </li>
              </ul>

              {/* CTA */}
              <div className="flex items-center text-primary-600 font-medium text-sm group-hover:text-primary-700">
                Entrar como candidato
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Company Card */}
          <Link
            to="/auth/register/company"
            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 p-6 transition-all duration-300 hover:border-primary-500 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon */}
              <div className="p-4 rounded-full bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
                <Building2 className="h-8 w-8" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900">
                Empresa
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600">
                Publicar vagas e buscar os melhores vendedores tech
              </p>

              {/* Benefits */}
              <ul className="text-xs text-gray-500 space-y-2 text-left w-full">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  Aprovação rápida (análise em 24h)
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  Acesso a candidatos qualificados
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  Ferramentas de recrutamento
                </li>
              </ul>

              {/* CTA */}
              <div className="flex items-center text-primary-600 font-medium text-sm group-hover:text-primary-700">
                Entrar como empresa
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">ou</span>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              Faça login aqui
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
