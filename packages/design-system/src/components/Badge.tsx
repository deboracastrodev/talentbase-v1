import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'border-transparent bg-secondary-500 text-white hover:bg-secondary-600',
        success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
        error: 'border-transparent bg-red-500 text-white hover:bg-red-600',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        outline: 'border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50',
        ghost: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
