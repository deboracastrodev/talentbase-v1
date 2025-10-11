import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
}

const sidebarVariants = cva(
  'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-transform duration-300',
  {
    variants: {
      collapsed: {
        true: '-translate-x-full lg:translate-x-0',
        false: 'translate-x-0',
      },
      width: {
        default: 'w-60', // 240px
        narrow: 'w-48',
        wide: 'w-72',
      },
    },
    defaultVariants: {
      collapsed: false,
      width: 'default',
    },
  }
);

const menuItemVariants = cva(
  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors cursor-pointer relative',
  {
    variants: {
      active: {
        true: 'bg-blue-50 text-primary-600 border-l-4 border-primary-500',
        false: 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
    },
  }
);

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  menuItems: MenuItem[];
  activeItemId: string;
  logo: React.ReactNode;
  onItemClick?: (item: MenuItem) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      menuItems,
      activeItemId,
      logo,
      onItemClick,
      isCollapsed = false,
      onToggle,
      width,
      ...props
    },
    ref
  ) => {
    return (
      <>
        {/* Mobile overlay */}
        {!isCollapsed && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={onToggle}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <div
          ref={ref}
          className={cn(
            sidebarVariants({ collapsed: isCollapsed, width, className })
          )}
          {...props}
        >
          {/* Logo section */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">{logo}</div>
            {/* Close button for mobile */}
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeItemId;

                return (
                  <li key={item.id}>
                    <a
                      href={item.disabled ? undefined : item.href}
                      className={cn(
                        menuItemVariants({
                          active: isActive,
                          disabled: item.disabled,
                        })
                      )}
                      onClick={(e) => {
                        if (item.disabled) {
                          e.preventDefault();
                          return;
                        }
                        if (onItemClick) {
                          onItemClick(item);
                        }
                      }}
                      role="button"
                      tabIndex={item.disabled ? -1 : 0}
                      onKeyDown={(e) => {
                        if (
                          !item.disabled &&
                          (e.key === 'Enter' || e.key === ' ') &&
                          onItemClick
                        ) {
                          e.preventDefault();
                          onItemClick(item);
                        }
                      }}
                    >
                      <Icon size={20} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export { Sidebar, sidebarVariants, menuItemVariants };
