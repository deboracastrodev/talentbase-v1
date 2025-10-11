/**
 * Candidate Layout Route
 *
 * This layout is automatically applied to all routes under /candidate/*
 * Provides consistent navigation, header, and user context.
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { CandidateLayout } from '~/components/layouts/CandidateLayout';
import { requireCandidate, getUserFromToken } from '~/utils/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireCandidate(request);

  // Get user info
  const userData = await getUserFromToken(token);
  const user = {
    name: userData?.name || 'Candidate',
    email: userData?.email || 'candidate@example.com',
  };

  // Extract current path for active menu item
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Determine active menu item based on path
  let activeItem = 'dashboard';
  if (pathname.includes('/profile')) activeItem = 'profile';
  else if (pathname.includes('/jobs')) activeItem = 'jobs';
  else if (pathname.includes('/applications')) activeItem = 'applications';

  return json({ user, activeItem });
}

export default function CandidateLayoutRoute() {
  const { user, activeItem } = useLoaderData<typeof loader>();

  return (
    <CandidateLayout pageTitle="Candidate" activeItem={activeItem} user={user}>
      <Outlet />
    </CandidateLayout>
  );
}
