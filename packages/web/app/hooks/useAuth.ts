/**
 * Client-side authentication hook
 *
 * Story 2.6 - RBAC Frontend Protection
 *
 * Provides access to current user data from localStorage
 * Note: This is NOT a security measure - backend validates all permissions
 * This is purely for UX (hiding/showing UI elements based on role)
 */

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'candidate' | 'company';
  name?: string;
  is_active?: boolean;
}

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCandidate: boolean;
  isCompany: boolean;
  hasRole: (roles: User['role'] | User['role'][]) => boolean;
  logout: () => void;
}

/**
 * Hook to access current user authentication state
 *
 * Usage:
 * ```typescript
 * const { user, isAdmin, hasRole } = useAuth();
 *
 * if (isAdmin) {
 *   // Show admin-only UI
 * }
 *
 * if (hasRole(['admin', 'company'])) {
 *   // Show UI for admins and companies
 * }
 * ```
 *
 * @returns Authentication state and helpers
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage (set during login)
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const hasRole = (roles: User['role'] | User['role'][]): boolean => {
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Note: Cookie is httpOnly, so backend must clear it
    // Redirect to logout endpoint which will clear cookie and redirect to login
    window.location.href = '/auth/logout';
  };

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
    isCandidate: user?.role === 'candidate',
    isCompany: user?.role === 'company',
    hasRole,
    logout,
  };
}
