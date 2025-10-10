/**
 * Admin Dashboard Homepage
 *
 * Story 2.5.1 - Task 6
 * AC7: Admin homepage route at /admin (dashboard landing page)
 * AC8: Dashboard exibe widgets overview
 * AC9: Widgets usam Card component do design system
 * AC10: Widgets são clicáveis e navegam para páginas relevantes
 * AC11: Dashboard carrega em menos de 2 segundos
 * AC13: Rota /admin protegida com auth
 */

import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { AdminLayout } from '~/components/layouts/AdminLayout';
import { StatCard } from '~/components/admin/StatCard';
import { getAdminStats, type AdminStats } from '~/lib/api/admin';
import { Users, AlertCircle, Briefcase, UserCheck, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@talentbase/design-system';
import { requireAdmin, getUserFromToken } from '~/utils/auth.server';

interface LoaderData {
  stats: AdminStats;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

/**
 * Loader - Fetch admin dashboard stats
 * Requires admin authentication (AC13)
 * Story 2.6: Updated to use requireAdmin utility and fetch real user data
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Story 2.6: Require admin role (checks auth + role)
  const { token } = await requireAdmin(request);

  try {
    // Fetch dashboard stats
    const stats = await getAdminStats(token);

    // Fetch real user data from API
    const userData = await getUserFromToken(token);
    const user = {
      name: userData?.name || 'Admin User',
      email: userData?.email || 'admin@talentbase.com',
    };

    return json<LoaderData>({
      stats,
      user,
    });
  } catch (error) {
    console.error('[Admin Dashboard Loader] Error:', error);

    // For errors, throw to error boundary
    throw new Response('Failed to load dashboard stats', { status: 500 });
  }
}

/**
 * Admin Dashboard Component
 */
export default function AdminDashboard() {
  const { stats, user } = useLoaderData<typeof loader>();

  return (
    <AdminLayout pageTitle="Dashboard" activeItem="dashboard" user={user}>
      <div className="space-y-6">
        {/* Welcome message */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your platform today.
          </p>
        </div>

        {/* Stats grid - AC8: Widgets overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users widget with breakdown - AC8 */}
          <StatCard
            title="Total Users"
            value={stats.total_users}
            icon={Users}
            breakdown={[
              { label: 'Candidates', value: stats.total_candidates },
              { label: 'Companies', value: stats.total_companies },
              { label: 'Admins', value: stats.total_admins },
            ]}
          />

          {/* Pending Approvals widget - AC8, AC10: Clicável */}
          <StatCard
            title="Pending Approvals"
            value={stats.pending_approvals}
            subtitle="Companies awaiting approval"
            icon={AlertCircle}
            href="/admin/users?status=pending&role=company"
          />

          {/* Active Jobs widget - AC8 */}
          <StatCard
            title="Active Jobs"
            value={stats.active_jobs}
            subtitle="Job postings available"
            icon={Briefcase}
          />

          {/* Total Candidates widget - AC8 */}
          <StatCard
            title="Total Candidates"
            value={stats.total_candidates}
            subtitle="Available candidates"
            icon={UserCheck}
          />
        </div>

        {/* Recent Activity widget - AC8 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-gray-600" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recent_activity && stats.recent_activity.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_activity.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        New {activity.user_role} registration
                      </p>
                      <p className="text-xs text-gray-600">{activity.user_email}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/users">
                <button className="w-full px-4 py-3 text-left bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                  <p className="font-medium text-primary-700">Manage Users</p>
                  <p className="text-sm text-primary-600">View and manage all users</p>
                </button>
              </Link>

              <Link to="/admin/users?status=pending&role=company">
                <button className="w-full px-4 py-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                  <p className="font-medium text-orange-700">Review Approvals</p>
                  <p className="text-sm text-orange-600">
                    {stats.pending_approvals} pending
                  </p>
                </button>
              </Link>

              <button
                disabled
                className="w-full px-4 py-3 text-left bg-gray-50 rounded-lg cursor-not-allowed opacity-50"
              >
                <p className="font-medium text-gray-700">Manage Jobs</p>
                <p className="text-sm text-gray-600">Coming in Epic 4</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

/**
 * Error boundary for dashboard errors
 */
export function ErrorBoundary() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Dashboard Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Failed to load dashboard statistics. Please try again.
          </p>
          <Link to="/admin/users">
            <button className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
              Go to User Management
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
