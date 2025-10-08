/**
 * Admin Dashboard Index
 *
 * Admin dashboard homepage with overview widgets.
 * Story 2.5 - AC1, AC2: Dashboard com widget "Pending Approvals"
 */

import { redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { PendingApprovalsWidget } from '~/components/admin/PendingApprovalsWidget';
import { fetchPendingApprovalsCount } from '~/lib/api/admin';

export async function loader({ request }: LoaderFunctionArgs) {
  // Get auth token from cookie
  const cookieHeader = request.headers.get('Cookie');
  const token = cookieHeader?.match(/auth_token=([^;]+)/)?.[1];

  if (!token) {
    return redirect('/auth/login');
  }

  try {
    // Fetch pending approvals count
    const pendingCount = await fetchPendingApprovalsCount(token);

    return {
      pendingCount,
    };
  } catch (error) {
    console.error('[Admin Dashboard] Error fetching stats:', error);

    // Handle auth errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return redirect('/auth/login');
    }

    // Return with zero count on error (graceful degradation)
    return {
      pendingCount: 0,
    };
  }
}

export default function AdminIndex() {
  const { pendingCount } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="mt-2 text-gray-600">
          Visão geral da plataforma TalentBase
        </p>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Widget - Story 2.5 AC1 */}
        <PendingApprovalsWidget count={pendingCount} />

        {/* Placeholder for future widgets */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Widget: Total Users (Story 2.5.1)</p>
        </div>

        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Widget: Active Jobs (Story 2.5.1)</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/users"
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <p className="font-medium text-gray-900">Gerenciar Usuários</p>
            <p className="text-sm text-gray-600 mt-1">Ver todos os usuários</p>
          </a>

          <a
            href="/admin/users?status=pending&role=company"
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <p className="font-medium text-gray-900">Revisar Empresas</p>
            <p className="text-sm text-gray-600 mt-1">Aprovar/rejeitar cadastros</p>
          </a>

          <div className="block p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
            <p className="font-medium text-gray-900">Gerenciar Vagas</p>
            <p className="text-sm text-gray-600 mt-1">Em breve (Epic 4)</p>
          </div>

          <div className="block p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
            <p className="font-medium text-gray-900">Matching</p>
            <p className="text-sm text-gray-600 mt-1">Em breve (Epic 5)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
