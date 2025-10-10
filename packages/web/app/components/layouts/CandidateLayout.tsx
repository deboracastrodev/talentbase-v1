/**
 * Candidate Layout Component
 *
 * Layout wrapper for candidate-facing pages with sidebar navigation,
 * user menu, and logout functionality.
 *
 * Similar structure to AdminLayout but with candidate-specific menu items.
 */

import { DashboardLayout, Logo, type MenuItem } from '@talentbase/design-system';
import { Home, User, Briefcase, FileText, Settings } from 'lucide-react';

import { getApiBaseUrl } from '~/config/api';

const candidateMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/candidate/dashboard', icon: Home },
  { id: 'profile', label: 'Meu Perfil', href: '/candidate/profile', icon: User },
  { id: 'jobs', label: 'Buscar Vagas', href: '/jobs', icon: Briefcase, disabled: true },
  {
    id: 'applications',
    label: 'Minhas Candidaturas',
    href: '/candidate/applications',
    icon: FileText,
    disabled: true,
  },
  {
    id: 'settings',
    label: 'Configurações',
    href: '/candidate/settings',
    icon: Settings,
    disabled: true,
  },
];

export interface CandidateLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  activeItem: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function CandidateLayout({ children, pageTitle, activeItem, user }: CandidateLayoutProps) {
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

  const handleProfileClick = () => {
    // Navigate to candidate profile page
    window.location.href = '/candidate/profile';
  };

  return (
    <DashboardLayout
      sidebarConfig={{
        menuItems: candidateMenuItems,
        activeItemId: activeItem,
        logo: <Logo variant="full" theme="primary" size="md" />,
      }}
      user={user}
      pageTitle={pageTitle}
      onLogout={handleLogout}
      onProfileClick={handleProfileClick}
    >
      {children}
    </DashboardLayout>
  );
}
