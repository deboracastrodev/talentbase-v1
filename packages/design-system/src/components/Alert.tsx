/**
 * Alert Component
 *
 * Reusable alert component for displaying success, error, info, or warning messages.
 * Provides consistent styling and accessibility across the application.
 * Uses design system color tokens for brand consistency.
 */

import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export type AlertVariant = 'success' | 'error' | 'info' | 'warning';

export interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string | ReactNode;
  className?: string;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    textColor: 'text-green-700',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
  },
  info: {
    icon: Info,
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    iconColor: 'text-primary-500',
    titleColor: 'text-primary-800',
    textColor: 'text-primary-700',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
    textColor: 'text-yellow-700',
  },
};

/**
 * Alert message component with icon and styled background
 *
 * @example
 * <Alert
 *   variant="error"
 *   message="Email já cadastrado no sistema"
 * />
 *
 * <Alert
 *   variant="success"
 *   title="Sucesso!"
 *   message="Conta criada com sucesso"
 * />
 */
export function Alert({ variant, title, message, className = '' }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        config.bgColor,
        'border',
        config.borderColor,
        'rounded-lg p-4 flex items-start',
        className
      )}
      role="alert"
    >
      <Icon
        className={cn('h-5 w-5', config.iconColor, 'mr-3 flex-shrink-0 mt-0.5')}
        aria-hidden="true"
      />
      <div className="flex-1">
        {title && <p className={cn('text-sm font-semibold', config.titleColor, 'mb-1')}>{title}</p>}
        <div className={cn('text-sm', config.textColor)}>
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
      </div>
    </div>
  );
}
