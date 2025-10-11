/**
 * Admin Layout Route
 *
 * This layout is automatically applied to all routes under /admin/*
 * Provides consistent navigation, header, and user context.
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { AdminLayout } from '~/components/layouts/AdminLayout';
import { requireAdmin, getUserFromToken } from '~/utils/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireAdmin(request);

  // Get user info
  const userData = await getUserFromToken(token);
  const user = {
    name: userData?.name || 'Admin User',
    email: userData?.email || 'admin@talentbase.com',
  };

  // Extract current path for active menu item
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Determine active menu item based on path
  let activeItem = 'dashboard';
  if (pathname.includes('/users')) activeItem = 'users';
  else if (pathname.includes('/candidates')) activeItem = 'candidates';
  else if (pathname.includes('/companies')) activeItem = 'companies';
  else if (pathname.includes('/jobs')) activeItem = 'jobs';
  else if (pathname.includes('/applications')) activeItem = 'applications';
  else if (pathname.includes('/matching')) activeItem = 'matching';
  else if (pathname.includes('/profile')) activeItem = 'profile';

  return json({ user, activeItem });
}

export default function AdminLayoutRoute() {
  const { user, activeItem } = useLoaderData<typeof loader>();

  return (
    <AdminLayout pageTitle="Admin" activeItem={activeItem} user={user}>
      <Outlet />
    </AdminLayout>
  );
}
