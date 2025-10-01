import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
        '3xl': 'h-24 w-24',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const initials = React.useMemo(() => {
      if (fallback) {
        return fallback
          .split(' ')
          .map((word) => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
      return alt
        ? alt
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';
    }, [fallback, alt]);

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-semibold">
            {initials}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// AvatarGroup component
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: VariantProps<typeof avatarVariants>['size'];
  children: React.ReactElement<AvatarProps>[];
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 3, size = 'md', children, ...props }, ref) => {
    const displayAvatars = children.slice(0, max);
    const remainingCount = children.length - max;

    return (
      <div ref={ref} className={cn('flex -space-x-2', className)} {...props}>
        {displayAvatars.map((child, index) =>
          React.cloneElement(child, {
            key: index,
            size: size,
            className: cn(child.props.className, 'ring-2 ring-white'),
          })
        )}
        {remainingCount > 0 && (
          <Avatar
            size={size}
            fallback={`+${remainingCount}`}
            className="ring-2 ring-white"
          />
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup, avatarVariants };
