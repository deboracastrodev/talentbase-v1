import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { Menu, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';

const navbarVariants = cva(
  'sticky top-0 z-30 w-full bg-white border-b border-gray-200 transition-all',
  {
    variants: {
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
      },
    },
    defaultVariants: {
      shadow: 'sm',
    },
  }
);

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export interface NavbarProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof navbarVariants> {
  pageTitle: string;
  user: User;
  logo: React.ReactNode;
  onLogout: () => void;
  onMenuToggle?: () => void;
}

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      pageTitle,
      user,
      logo,
      onLogout,
      onMenuToggle,
      shadow,
      ...props
    },
    ref
  ) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = () => {
      setIsUserMenuOpen(false);
      onLogout();
    };

    return (
      <nav
        ref={ref}
        className={cn(navbarVariants({ shadow, className }))}
        {...props}
      >
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left section: Hamburger (mobile) + Logo + Page title */}
          <div className="flex items-center gap-4">
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </button>
            )}

            <div className="hidden lg:flex items-center">{logo}</div>

            <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
          </div>

          {/* Right section: User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              {/* Avatar */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-semibold">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* User info (hidden on mobile) */}
              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-sm font-medium text-gray-900">
                  {user.name}
                </span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>

              <ChevronDown
                size={16}
                className={cn(
                  'text-gray-500 transition-transform',
                  isUserMenuOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown menu */}
            {isUserMenuOpen && (
              <>
                {/* Backdrop for mobile */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                  aria-hidden="true"
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {/* User info (visible in dropdown on mobile) */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Menu items */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      // Navigate to profile (to be implemented by consumer)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserIcon size={16} />
                    <span>Profile</span>
                  </button>

                  <div className="border-t border-gray-200 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    );
  }
);

Navbar.displayName = 'Navbar';

export { Navbar, navbarVariants };
