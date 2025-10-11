/**
 * Toast Provider & Context
 *
 * Provides toast notification system throughout the application.
 * Manages toast state, stacking, and lifecycle.
 *
 * Usage:
 * 1. Wrap your app with ToastProvider (typically in root layout)
 * 2. Use the useToast hook anywhere in your component tree
 *
 * @example
 * // In root layout:
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * // In any component:
 * const { toast } = useToast();
 * toast.success('Operação concluída!');
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Toast, ToastVariant, ToastProps } from './Toast';

interface ToastConfig {
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Omit<ToastProps, 'onDismiss'>[];
  addToast: (config: ToastConfig) => void;
  removeToast: (id: string) => void;
  // Convenience methods
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export interface ToastProviderProps {
  children: ReactNode;
  /**
   * Maximum number of toasts to show simultaneously
   * Older toasts will be removed when limit is exceeded
   */
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onDismiss'>[]>([]);

  const addToast = useCallback(
    (config: ToastConfig) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Omit<ToastProps, 'onDismiss'> = {
        id,
        ...config,
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        // Limit total toasts
        return updated.slice(0, maxToasts);
      });
    },
    [maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({ variant: 'success', message, title, duration });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({ variant: 'error', message, title, duration });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({ variant: 'info', message, title, duration });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => {
      addToast({ variant: 'warning', message, title, duration });
    },
    [addToast]
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container - fixed position at top-right */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed top-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="flex flex-col items-end space-y-0">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onDismiss={removeToast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast notifications
 *
 * Must be used within a ToastProvider
 *
 * @example
 * const { toast } = useToast();
 *
 * // Simple usage
 * toast.success('Candidato criado com sucesso!');
 * toast.error('Email já cadastrado');
 *
 * // With title
 * toast.success('Candidato criado com sucesso!', 'Sucesso!');
 *
 * // Custom duration (in milliseconds)
 * toast.info('Processando...', undefined, 3000);
 *
 * // Never auto-dismiss
 * toast.warning('Ação necessária', 'Atenção', 0);
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    toast: {
      success: context.success,
      error: context.error,
      info: context.info,
      warning: context.warning,
    },
    // Advanced API
    addToast: context.addToast,
    toasts: context.toasts,
  };
}
