/**
 * Admin Profile Page
 *
 * Displays admin user profile information retrieved from /api/v1/auth/me
 * Uses design system components following project patterns
 */

import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@talentbase/design-system';
import { User, Mail, Shield } from 'lucide-react';

import { requireAdmin } from '~/utils/auth.server';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'candidate' | 'company';
  is_active: boolean;
}

interface LoaderData {
  profile: UserProfile;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

/**
 * Loader - Fetch admin profile data
 * Requires admin authentication
 *
 * OPTIMIZATION: Uses data from requireAdmin to avoid duplicate API calls.
 * Previously made 2-3 calls to /api/v1/auth/me, now makes only 1.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // requireAdmin already calls /api/v1/auth/me and returns user data
  const { user } = await requireAdmin(request);

  if (!user) {
    // This should never happen if requireAdmin works correctly,
    // but handle it defensively
    throw new Response('Unauthorized', { status: 401 });
  }

  // Transform user data to match UserProfile interface
  const profile: UserProfile = {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
    role: user.role,
    is_active: true, // User is authenticated, so must be active
  };

  // Prepare user data for layout
  const layoutUser = {
    name: user.name || profile.name,
    email: user.email,
  };

  return json<LoaderData>({
    profile,
    user: layoutUser,
  });
}

/**
 * Admin Profile Component
 * Note: AdminLayout is applied by parent route (admin.tsx)
 */
export default function AdminProfile() {
  const { profile, user } = useLoaderData<typeof loader>();

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'candidate':
        return 'Candidato';
      case 'company':
        return 'Empresa';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Meu Perfil</h2>
        <p className="text-base text-gray-600">Visualize suas informações de conta</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informações Pessoais</CardTitle>
            <Badge variant={profile.is_active ? 'success' : 'default'}>
              {profile.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-10 pt-4">
            {/* Avatar and Name */}
            <div className="flex items-center gap-6 pb-10 border-b border-gray-100">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-500 text-white text-xl font-semibold shadow-md">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-base text-gray-600 mt-1">{getRoleName(profile.role)}</p>
              </div>
            </div>

            {/* Profile Details - Grid layout for better space usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50">
                  <Mail size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-base text-gray-900 truncate">{profile.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50">
                  <Shield size={20} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Função
                  </p>
                  <p className="text-base text-gray-900">{getRoleName(profile.role)}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50">
                  <User size={20} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Status da Conta
                  </p>
                  <p className="text-base text-gray-900">
                    {profile.is_active ? 'Ativa' : 'Inativa'}
                  </p>
                </div>
              </div>

              {/* User ID - Full width on smaller screens */}
              <div className="flex items-start gap-4 md:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50">
                  <User size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    ID do Usuário
                  </p>
                  <p className="text-base text-gray-900 font-mono truncate">{profile.id}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 border-b border-gray-100">
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900 mb-1">Senha</p>
                <p className="text-sm text-gray-600">
                  Última atualização: Contate o suporte para alterar
                </p>
              </div>
              <button
                disabled
                className="px-6 py-2.5 text-sm font-medium text-gray-400 bg-gray-50 rounded-lg cursor-not-allowed whitespace-nowrap"
              >
                Em breve
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900 mb-1">
                  Autenticação de dois fatores
                </p>
                <p className="text-sm text-gray-600">
                  Adicione uma camada extra de segurança à sua conta
                </p>
              </div>
              <button
                disabled
                className="px-6 py-2.5 text-sm font-medium text-gray-400 bg-gray-50 rounded-lg cursor-not-allowed whitespace-nowrap"
              >
                Em breve
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Error boundary for profile errors
 * Provides contextual error messages based on error type
 */
export function ErrorBoundary() {
  // In Remix v2+, we use useRouteError hook
  const error = useRouteError();

  console.error('[AdminProfile ErrorBoundary] Error caught:', error);

  // Determine error type for better user messaging
  const isNetworkError =
    error?.message?.includes('fetch') ||
    error?.message?.includes('NetworkError') ||
    error?.message?.includes('Failed to fetch');

  const isAuthError =
    error?.message?.includes('Unauthorized') ||
    error?.message?.includes('401') ||
    error?.status === 401;

  let title = 'Erro ao Carregar Perfil';
  let message = 'Não foi possível carregar as informações do perfil. Por favor, tente novamente.';

  if (isNetworkError) {
    title = 'Servidor Indisponível';
    message =
      'O servidor está temporariamente indisponível. Verifique se o Django API está rodando na porta 8000.';
  } else if (isAuthError) {
    title = 'Sessão Expirada';
    message = 'Sua sessão expirou. Por favor, faça login novamente.';
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{message}</p>

          {/* Show technical details in development mode */}
          {import.meta.env.DEV && error && (
            <details className="mb-4">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                Detalhes Técnicos (Dev Mode)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40 text-gray-800">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="space-y-2">
            <a href="/admin">
              <button className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
                Voltar ao Dashboard
              </button>
            </a>
            {isAuthError && (
              <a href="/auth/login">
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  Ir para Login
                </button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
