/**
 * Server-side authentication utilities for Remix loaders
 *
 * Story 2.6 - RBAC Frontend Protection
 *
 * IMPORTANT: This file runs ONLY on the server (Remix loader context)
 * For client-side auth, use useAuth hook
 */

import { redirect } from '@remix-run/node';

import { apiServer } from '~/lib/apiServer';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'candidate' | 'company';
  name?: string;
}

/**
 * Extract authentication token from request cookies
 *
 * @param request - Remix request object
 * @returns Token string or null if not found
 */
export function getAuthToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  console.log('[getAuthToken] Cookie header:', cookieHeader ? 'Present' : 'Missing');

  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(/auth_token=([^;]+)/);
  const token = match ? match[1] : null;
  console.log('[getAuthToken] Token found:', token ? 'Yes' : 'No');

  return token;
}

/**
 * Get user data from token by calling the API
 *
 * Calls GET /api/v1/auth/me to validate the token and retrieve user info.
 * This is used in server-side loaders to verify authentication and get user role.
 *
 * @param token - JWT authentication token
 * @returns User object or null if token is invalid
 */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const data = await apiServer.get<AuthUser>('/api/v1/auth/me', { token });
    return data;
  } catch (error) {
    // apiServer already logs errors
    return null;
  }
}

/**
 * Require authentication for a route
 *
 * Usage in loader:
 * ```typescript
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   const { token, user } = await requireAuth(request);
 *   // Continue with authenticated logic
 * }
 * ```
 *
 * @param request - Remix request object
 * @param requiredRole - Optional role requirement ('admin', 'candidate', 'company')
 * @returns Object with token and user (if available)
 * @throws Redirect to /auth/login if not authenticated
 * @throws Response(403) if authenticated but wrong role
 */
export async function requireAuth(
  request: Request,
  requiredRole?: 'admin' | 'candidate' | 'company'
): Promise<{ token: string; user: AuthUser | null }> {
  const token = getAuthToken(request);

  if (!token) {
    // Not authenticated - redirect to login
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;

    throw redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  // Get user info (for now, we'll fetch from API on each request)
  const user = await getUserFromToken(token);

  // If role is required and user info is available, check it
  if (requiredRole && user && user.role !== requiredRole) {
    throw new Response('Forbidden: Insufficient permissions', {
      status: 403,
      statusText: 'Forbidden',
    });
  }

  return { token, user };
}

/**
 * Check if user has specific role(s)
 *
 * @param user - User object
 * @param roles - Single role or array of allowed roles
 * @returns True if user has one of the allowed roles
 */
export function hasRole(
  user: AuthUser | null,
  roles: 'admin' | 'candidate' | 'company' | Array<'admin' | 'candidate' | 'company'>
): boolean {
  if (!user) return false;

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return allowedRoles.includes(user.role);
}

/**
 * Require admin role
 * Convenience wrapper around requireAuth for admin-only routes
 */
export async function requireAdmin(request: Request) {
  return requireAuth(request, 'admin');
}

/**
 * Require candidate role
 */
export async function requireCandidate(request: Request) {
  return requireAuth(request, 'candidate');
}

/**
 * Require company role
 */
export async function requireCompany(request: Request) {
  return requireAuth(request, 'company');
}
