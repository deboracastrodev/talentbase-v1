import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const logoVariants = cva('inline-block', {
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

// SVG Logos inline (garantido funcionar em Storybook)
const LOGO_SVGS = {
  'full-primary': `<svg width="280" height="64" viewBox="0 0 280 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4L54.6 17V43L32 56L9.4 43V17L32 4Z" stroke="#00B8D4" stroke-width="3" fill="none"/>
    <path d="M32 18L35.6 27.6H45.8L37.6 33.6L41.2 43.2L32 37.2L22.8 43.2L26.4 33.6L18.2 27.6H28.4L32 18Z" fill="#00B8D4"/>
    <text x="72" y="43" font-family="Inter, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#111827">talentbase</text>
  </svg>`,
  'full-white': `<svg width="280" height="64" viewBox="0 0 280 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4L54.6 17V43L32 56L9.4 43V17L32 4Z" stroke="#FFFFFF" stroke-width="3" fill="none"/>
    <path d="M32 18L35.6 27.6H45.8L37.6 33.6L41.2 43.2L32 37.2L22.8 43.2L26.4 33.6L18.2 27.6H28.4L32 18Z" fill="#FFFFFF"/>
    <text x="72" y="43" font-family="Inter, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">talentbase</text>
  </svg>`,
  'full-dark': `<svg width="280" height="64" viewBox="0 0 280 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4L54.6 17V43L32 56L9.4 43V17L32 4Z" stroke="#1E3A8A" stroke-width="3" fill="none"/>
    <path d="M32 18L35.6 27.6H45.8L37.6 33.6L41.2 43.2L32 37.2L22.8 43.2L26.4 33.6L18.2 27.6H28.4L32 18Z" fill="#1E3A8A"/>
    <text x="72" y="43" font-family="Inter, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E3A8A">talentbase</text>
  </svg>`,
  'symbol-primary': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4L54.6 17V43L32 56L9.4 43V17L32 4Z" stroke="#00B8D4" stroke-width="3" fill="none"/>
    <path d="M32 18L35.6 27.6H45.8L37.6 33.6L41.2 43.2L32 37.2L22.8 43.2L26.4 33.6L18.2 27.6H28.4L32 18Z" fill="#00B8D4"/>
  </svg>`,
  'symbol-white': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4L54.6 17V43L32 56L9.4 43V17L32 4Z" stroke="#FFFFFF" stroke-width="3" fill="none"/>
    <path d="M32 18L35.6 27.6H45.8L37.6 33.6L41.2 43.2L32 37.2L22.8 43.2L26.4 33.6L18.2 27.6H28.4L32 18Z" fill="#FFFFFF"/>
  </svg>`,
  'symbol-dark': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4L54.6 17V43L32 56L9.4 43V17L32 4Z" stroke="#1E3A8A" stroke-width="3" fill="none"/>
    <path d="M32 18L35.6 27.6H45.8L37.6 33.6L41.2 43.2L32 37.2L22.8 43.2L26.4 33.6L18.2 27.6H28.4L32 18Z" fill="#1E3A8A"/>
  </svg>`,
};

export interface LogoInlineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'src'>,
    VariantProps<typeof logoVariants> {
  variant?: 'full' | 'symbol';
  theme?: 'white' | 'primary' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Componente Logo Inline do TalentBase
 *
 * Versão com SVGs inline para garantir compatibilidade com Storybook.
 * Use este componente quando Logo.tsx não renderizar corretamente.
 */
export const LogoInline = React.forwardRef<HTMLDivElement, LogoInlineProps>(
  ({ className, variant = 'full', theme = 'primary', size = 'md', ...props }, ref) => {
    const logoKey = `${variant}-${theme}` as keyof typeof LOGO_SVGS;
    const svgContent = LOGO_SVGS[logoKey];

    return (
      <div
        ref={ref}
        className={cn(logoVariants({ variant, theme, size }), className)}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        aria-label="TalentBase"
        role="img"
        {...props}
      />
    );
  }
);

LogoInline.displayName = 'LogoInline';

export { logoVariants };
