/**
 * AuthLayout Component
 *
 * Layout wrapper for authentication pages (login, register, reset password, etc.)
 * Provides consistent branded background with gradient and blur effects matching landing page
 */

import { ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Authentication layout with branded gradient background
 *
 * @example
 * <AuthLayout>
 *   <AuthCard title="Login">
 *     <LoginForm />
 *   </AuthCard>
 * </AuthLayout>
 */
export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center',
        'bg-gradient-to-br from-black via-blue-900 to-cyan-500',
        'py-12 px-4 sm:px-6 lg:px-8',
        'relative overflow-hidden',
        className
      )}
    >
      {/* Animated blur effects matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
