import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Sidebar, type MenuItem } from './Sidebar';
import { Navbar, type User } from './Navbar';

export interface SidebarConfig {
  menuItems: MenuItem[];
  activeItemId: string;
  logo: React.ReactNode;
}

export interface DashboardLayoutProps {
  sidebarConfig: SidebarConfig;
  user: User;
  pageTitle: string;
  onLogout: () => void;
  children: React.ReactNode;
  className?: string;
}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  (
    {
      sidebarConfig,
      user,
      pageTitle,
      onLogout,
      children,
      className,
    },
    ref
  ) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    const handleMenuToggle = () => {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleMenuItemClick = (_item: MenuItem) => {
      // On mobile, close sidebar after selection
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };

    return (
      <div ref={ref} className={cn('min-h-screen bg-gray-50', className)}>
        {/* Sidebar */}
        <Sidebar
          menuItems={sidebarConfig.menuItems}
          activeItemId={sidebarConfig.activeItemId}
          logo={sidebarConfig.logo}
          isCollapsed={isSidebarCollapsed}
          onToggle={handleMenuToggle}
          onItemClick={handleMenuItemClick}
        />

        {/* Main content area */}
        <div className="lg:ml-60 min-h-screen flex flex-col">
          {/* Navbar */}
          <Navbar
            pageTitle={pageTitle}
            user={user}
            logo={sidebarConfig.logo}
            onLogout={onLogout}
            onMenuToggle={handleMenuToggle}
          />

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }
);

DashboardLayout.displayName = 'DashboardLayout';

export { DashboardLayout };
