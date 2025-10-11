/**
 * AlertMessage Component
 *
 * Reusable alert component for displaying success, error, info, or warning messages.
 * Provides consistent styling and accessibility across the application.
 */

import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

export type AlertVariant = 'success' | 'error' | 'info' | 'warning';

export interface AlertMessageProps {
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
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700',
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
 * <AlertMessage
 *   variant="error"
 *   message="Email já cadastrado no sistema"
 * />
 *
 * <AlertMessage
 *   variant="success"
 *   title="Sucesso!"
 *   message="Conta criada com sucesso"
 * />
 */
export function AlertMessage({ variant, title, message, className = '' }: AlertMessageProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} border ${config.borderColor} rounded-md p-4 flex items-start ${className}`}
      role="alert"
    >
      <Icon
        className={`h-5 w-5 ${config.iconColor} mr-2 flex-shrink-0 mt-0.5`}
        aria-hidden="true"
      />
      <div className="flex-1">
        {title && <p className={`text-sm font-medium ${config.titleColor} mb-1`}>{title}</p>}
        <div className={`text-sm ${config.textColor}`}>
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
      </div>
    </div>
  );
}
