import { DashboardLayout, Logo, type MenuItem } from '@talentbase/design-system';
import { Home, Users, Building2, User, Briefcase, FileText, Target } from 'lucide-react';

import { getApiBaseUrl } from '~/config/api';

const adminMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: Home },
  { id: 'users', label: 'Users', href: '/admin/users', icon: Users },
  { id: 'candidates', label: 'Candidates', href: '/admin/candidates', icon: User },
  { id: 'companies', label: 'Companies', href: '/admin/companies', icon: Building2, disabled: true },
  { id: 'jobs', label: 'Jobs', href: '/admin/jobs', icon: Briefcase, disabled: true },
  { id: 'applications', label: 'Applications', href: '/admin/applications', icon: FileText, disabled: true },
  { id: 'matching', label: 'Matching', href: '/admin/matching', icon: Target, disabled: true },
];

export interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  activeItem: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function AdminLayout({ children, pageTitle, activeItem, user }: AdminLayoutProps) {
  const handleLogout = async () => {
    try {
      const apiUrl = getApiBaseUrl();
      await fetch(`${apiUrl}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect on error
      window.location.href = '/auth/login';
    }
  };

  return (
    <DashboardLayout
      sidebarConfig={{
        menuItems: adminMenuItems,
        activeItemId: activeItem,
        logo: <Logo variant="full" theme="primary" size="md" />,
      }}
      user={user}
      pageTitle={pageTitle}
      onLogout={handleLogout}
    >
      {children}
    </DashboardLayout>
  );
}
