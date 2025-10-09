/**
 * RequireRole Component
 *
 * Story 2.6 - RBAC Frontend Protection (AC8)
 *
 * Conditionally renders children based on user role
 * Note: This is UI-only protection. Backend MUST validate all permissions.
 */

import { useAuth, type User } from '~/hooks/useAuth';

export interface RequireRoleProps {
  /**
   * Required role(s) to render children
   * Can be a single role or array of roles
   */
  roles: User['role'] | User['role'][];

  /**
   * Content to render if user has required role
   */
  children: React.ReactNode;

  /**
   * Optional fallback to render if user doesn't have required role
   * If not provided, nothing is rendered
   */
  fallback?: React.ReactNode;
}

/**
 * Conditionally render content based on user role
 *
 * Usage:
 * ```tsx
 * <RequireRole roles="admin">
 *   <AdminOnlyButton />
 * </RequireRole>
 *
 * <RequireRole roles={['admin', 'company']}>
 *   <CreateJobButton />
 * </RequireRole>
 *
 * <RequireRole roles="candidate" fallback={<LoginPrompt />}>
 *   <ApplyButton />
 * </RequireRole>
 * ```
 */
export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hide content for specific roles (inverse of RequireRole)
 */
export interface HideForRoleProps {
  roles: User['role'] | User['role'][];
  children: React.ReactNode;
}

export function HideForRole({ roles, children }: HideForRoleProps) {
  const { hasRole } = useAuth();

  if (hasRole(roles)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Show content only for authenticated users
 */
export function RequireAuth({ children, fallback = null }: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
