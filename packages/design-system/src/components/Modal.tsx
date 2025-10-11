/**
 * Modal Component - Enhanced
 *
 * Full-featured modal dialog with animations, variants, and accessibility.
 *
 * Features:
 * - 🎨 Multiple variants (default, danger, success)
 * - ✨ Smooth enter/exit animations
 * - 🔒 Focus trap and body scroll lock
 * - ⌨️ Keyboard navigation (Esc to close, Tab trapping)
 * - ♿️ Full ARIA support
 * - 📱 Responsive sizes
 * - 🎯 Click outside to close (optional)
 *
 * UX Best Practices:
 * - Use danger variant for destructive actions
 * - Use success variant for confirmations
 * - Keep content concise (use scrolling for long content)
 * - Always provide a way to close (X button or Cancel)
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Delete Candidate"
 *   variant="danger"
 * >
 *   <p>Are you sure you want to delete this candidate?</p>
 *   <ModalFooter>
 *     <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
 *     <Button variant="destructive" onClick={handleDelete}>Delete</Button>
 *   </ModalFooter>
 * </Modal>
 * ```
 */

import * as React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export type ModalVariant = 'default' | 'danger' | 'success' | 'info';

export interface ModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title (optional) */
  title?: string;
  /** Modal description (optional, shows below title) */
  description?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Visual variant */
  variant?: ModalVariant;
  /** Show close (X) button */
  showCloseButton?: boolean;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on Escape key */
  closeOnEscape?: boolean;
  /** Custom className for modal content */
  className?: string;
}

const variantConfig = {
  default: {
    icon: null,
    iconColor: '',
    titleColor: 'text-gray-900',
  },
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    titleColor: 'text-red-900',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    titleColor: 'text-green-900',
  },
  info: {
    icon: Info,
    iconColor: 'text-primary-500',
    titleColor: 'text-primary-900',
  },
};

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl mx-4',
};

/**
 * Modal Dialog Component
 *
 * Accessible modal with animations and variants.
 * Use ModalFooter, ModalHeader, ModalBody for structured content.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
}: ModalProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const config = variantConfig[variant];
  const Icon = config.icon;

  // Handle open animation
  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Wait for exit animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 200); // Match animation duration

      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard handlers
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    // Focus trap
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen && !isAnimating) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-all duration-200',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black transition-opacity duration-200',
          isOpen ? 'opacity-50' : 'opacity-0'
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-white rounded-lg shadow-2xl',
          'transform transition-all duration-200',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex-1 flex items-start gap-3">
              {/* Icon for variants */}
              {Icon && (
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className={cn('h-6 w-6', config.iconColor)} aria-hidden="true" />
                </div>
              )}

              {/* Title and Description */}
              <div className="flex-1 min-w-0">
                {title && (
                  <h2
                    id="modal-title"
                    className={cn('text-xl font-semibold', config.titleColor)}
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="mt-1 text-sm text-gray-600">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Close Button */}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'flex-shrink-0 ml-3 p-1 rounded-md',
                  'text-gray-400 hover:text-gray-600',
                  'hover:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  'transition-colors'
                )}
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

Modal.displayName = 'Modal';

/* ===== Sub-components for structured modals ===== */

export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Modal Header - Use when you need custom header content
 * (otherwise, use title/description props on Modal)
 */
export function ModalHeader({ children, className = '' }: ModalHeaderProps) {
  return (
    <div className={cn('p-6 border-b border-gray-200', className)}>
      {children}
    </div>
  );
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Modal Body - Use for custom body styling
 * (otherwise, just use children directly on Modal)
 */
export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return (
    <div className={cn('p-6 max-h-[calc(100vh-200px)] overflow-y-auto', className)}>
      {children}
    </div>
  );
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Modal Footer - Use for action buttons
 *
 * @example
 * <ModalFooter>
 *   <Button variant="ghost" onClick={onClose}>Cancel</Button>
 *   <Button onClick={onConfirm}>Confirm</Button>
 * </ModalFooter>
 */
export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3',
        'px-6 py-4',
        'border-t border-gray-200',
        'bg-gray-50',
        className
      )}
    >
      {children}
    </div>
  );
}

ModalFooter.displayName = 'ModalFooter';
