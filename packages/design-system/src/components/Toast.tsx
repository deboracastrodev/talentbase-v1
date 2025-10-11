/**
 * Toast Component
 *
 * Temporary notification component that appears at the top-right of the screen.
 * Auto-dismisses after a configurable duration and supports multiple toast stacking.
 * Provides consistent styling with the Alert component for brand consistency.
 *
 * UX Considerations:
 * - Auto-dismiss after 5s (success/info) or 7s (error/warning) for appropriate reading time
 * - Positioned top-right to avoid blocking main content
 * - Smooth enter/exit animations for polished feel
 * - Dismissible via click for user control
 * - Stacks multiple toasts vertically with proper spacing
 * - Uses semantic colors and icons for quick scanning
 */

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number; // milliseconds, 0 = no auto-dismiss
  onDismiss: (id: string) => void;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    textColor: 'text-green-700',
    defaultDuration: 5000,
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
    defaultDuration: 7000, // Longer for errors
  },
  info: {
    icon: Info,
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    iconColor: 'text-primary-500',
    titleColor: 'text-primary-800',
    textColor: 'text-primary-700',
    defaultDuration: 5000,
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
    textColor: 'text-yellow-700',
    defaultDuration: 7000, // Longer for warnings
  },
};

/**
 * Individual toast notification
 *
 * Internal component - use via ToastProvider + useToast hook
 *
 * @example
 * // Don't use directly - use the hook:
 * const { toast } = useToast();
 * toast.success('Candidato criado com sucesso!');
 */
export function Toast({
  id,
  variant,
  title,
  message,
  duration,
  onDismiss,
}: ToastProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const effectiveDuration = duration ?? config.defaultDuration;

  // Enter animation
  useEffect(() => {
    // Trigger enter animation after mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    if (effectiveDuration === 0) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, effectiveDuration);

    return () => clearTimeout(timer);
  }, [effectiveDuration]);

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for exit animation before removing from DOM
    setTimeout(() => {
      onDismiss(id);
    }, 300); // Match animation duration
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        // Base styles
        'pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg',
        config.bgColor,
        config.borderColor,
        // Animation
        'transition-all duration-300 ease-out',
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
        // Layout
        'mb-4'
      )}
    >
      <div className="flex items-start p-4">
        {/* Icon */}
        <Icon
          className={cn('h-5 w-5', config.iconColor, 'mr-3 flex-shrink-0 mt-0.5')}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className={cn('text-sm font-semibold', config.titleColor, 'mb-1')}>
              {title}
            </p>
          )}
          <p className={cn('text-sm', config.textColor)}>{message}</p>
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            'ml-3 flex-shrink-0 rounded-md p-1',
            'inline-flex',
            'hover:bg-black hover:bg-opacity-10',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            config.iconColor.replace('text-', 'focus:ring-'),
            'transition-colors'
          )}
          aria-label="Fechar notificação"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
