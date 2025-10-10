import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const logoVariants = cva('', {
  variants: {
    variant: {
      full: 'w-auto',
      symbol: 'w-auto',
    },
    theme: {
      white: '',
      primary: '',
      dark: '',
    },
    size: {
      sm: 'h-6',
      md: 'h-10',
      lg: 'h-12',
      xl: 'h-16',
    },
  },
  defaultVariants: {
    variant: 'full',
    theme: 'primary',
    size: 'md',
  },
});

export interface LogoProps
  extends Omit<React.HTMLAttributes<HTMLImageElement>, 'src'>,
    VariantProps<typeof logoVariants> {
  /**
   * Usar logo completa (símbolo + texto) ou apenas símbolo
   */
  variant?: 'full' | 'symbol';
  /**
   * Tema da logo baseado no fundo onde será aplicada
   */
  theme?: 'white' | 'primary' | 'dark';
  /**
   * Tamanho da logo
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Componente Logo do TalentBase
 *
 * Renderiza a logo em diferentes variações (full/symbol) e temas (white/primary/dark).
 *
 * @example
 * ```tsx
 * // Logo completa primary (fundos claros)
 * <Logo variant="full" theme="primary" size="lg" />
 *
 * // Logo branca para fundos escuros
 * <Logo variant="full" theme="white" size="md" />
 *
 * // Apenas símbolo
 * <Logo variant="symbol" theme="primary" size="sm" />
 * ```
 */
export const Logo = React.forwardRef<HTMLImageElement, LogoProps>(
  ({ className, variant = 'full', theme = 'primary', size = 'md', ...props }, ref) => {
    const logoSrc = `/logos/logo-${variant}-${theme}.svg`;

    return (
      <img
        ref={ref}
        src={logoSrc}
        alt="TalentBase"
        className={cn(logoVariants({ variant, theme, size }), className)}
        {...props}
      />
    );
  }
);

Logo.displayName = 'Logo';

export { logoVariants };
