/**
 * AuthCard Component
 *
 * Card container for authentication forms with glassmorphism effect
 * Provides consistent styling for all auth-related content
 */

import { ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface AuthCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Authentication card with glassmorphism effect
 *
 * @example
 * <AuthCard
 *   title="Criar Conta - Candidato"
 *   subtitle="Cadastre-se para acessar as melhores vagas de vendas"
 * >
 *   <form>...</form>
 * </AuthCard>
 */
export function AuthCard({ children, title, subtitle, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        // Glassmorphism effect
        'bg-white/95 backdrop-blur-xl',
        'rounded-2xl shadow-2xl',
        'border border-white/20',
        // Sizing - default to md, can be overridden
        'w-full max-w-md mx-auto',
        // Spacing
        'p-8 sm:p-10',
        // Animation
        'animate-fade-in-up',
        className
      )}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && (
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
