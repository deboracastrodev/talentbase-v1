import type { Meta, StoryObj } from '@storybook/react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Home, Users, Building2, User, Briefcase, FileText, Target, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';

const meta = {
  title: 'Components/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const adminMenuItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: Home },
  { id: 'users', label: 'Users', href: '/admin/users', icon: Users, badge: 5 },
  { id: 'companies', label: 'Companies', href: '/admin/companies', icon: Building2, disabled: true },
  { id: 'candidates', label: 'Candidates', href: '/admin/candidates', icon: User, disabled: true },
  { id: 'jobs', label: 'Jobs', href: '/admin/jobs', icon: Briefcase, disabled: true },
  { id: 'applications', label: 'Applications', href: '/admin/applications', icon: FileText, disabled: true },
  { id: 'matching', label: 'Matching', href: '/admin/matching', icon: Target, disabled: true },
  { id: 'settings', label: 'Settings', href: '/admin/settings', icon: Settings },
];

const candidateMenuItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/candidate', icon: Home },
  { id: 'profile', label: 'My Profile', href: '/candidate/profile', icon: User },
  { id: 'jobs', label: 'Browse Jobs', href: '/candidate/jobs', icon: Briefcase, badge: 'New' },
  { id: 'applications', label: 'My Applications', href: '/candidate/applications', icon: FileText, badge: 3 },
];

const companyMenuItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/company', icon: Home },
  { id: 'profile', label: 'Company Profile', href: '/company/profile', icon: Building2 },
  { id: 'jobs', label: 'My Jobs', href: '/company/jobs', icon: Briefcase },
  { id: 'candidates', label: 'Search Candidates', href: '/company/candidates', icon: Users },
];

const sampleUser = {
  name: 'John Doe',
  email: 'john.doe@talentbase.com',
};

const sampleUserWithAvatar = {
  name: 'Jane Smith',
  email: 'jane.smith@talentbase.com',
  avatar: 'https://i.pravatar.cc/150?img=5',
};

/**
 * Full dashboard layout for admin (desktop view)
 */
export const AdminDashboardDesktop: Story = {
  args: {
    sidebarConfig: {
      menuItems: adminMenuItems,
      activeItemId: 'dashboard',
      logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    },
    user: sampleUser,
    pageTitle: 'Dashboard',
    onLogout: () => alert('Logout clicked'),
    children: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, John!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-sm text-gray-600">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">56</p>
              <p className="text-sm text-gray-600">8 new this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm text-gray-600">Requires attention</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
};

/**
 * Mobile layout with sidebar collapsed
 */
export const AdminDashboardMobile: Story = {
  args: {
    sidebarConfig: {
      menuItems: adminMenuItems,
      activeItemId: 'dashboard',
      logo: <span className="text-xl font-bold text-primary-600">TB</span>,
    },
    user: sampleUser,
    pageTitle: 'Dashboard',
    onLogout: () => alert('Logout clicked'),
    children: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Welcome back!</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1,234</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">56</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Candidate dashboard layout
 */
export const CandidateDashboard: Story = {
  args: {
    sidebarConfig: {
      menuItems: candidateMenuItems,
      activeItemId: 'dashboard',
      logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    },
    user: sampleUserWithAvatar,
    pageTitle: 'My Dashboard',
    onLogout: () => alert('Logout clicked'),
    children: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Find Your Dream Job</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">3</p>
              <p className="text-sm text-gray-600">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Profile Views</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">127</p>
              <p className="text-sm text-gray-600">This month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
};

/**
 * Company dashboard layout
 */
export const CompanyDashboard: Story = {
  args: {
    sidebarConfig: {
      menuItems: companyMenuItems,
      activeItemId: 'dashboard',
      logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    },
    user: {
      name: 'Acme Corp',
      email: 'hr@acmecorp.com',
    },
    pageTitle: 'Company Dashboard',
    onLogout: () => alert('Logout clicked'),
    children: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Your Hiring</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">8</p>
              <p className="text-sm text-gray-600">Hiring now</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">42</p>
              <p className="text-sm text-gray-600">Pending review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">15</p>
              <p className="text-sm text-gray-600">New candidates</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
};

/**
 * Users management page (different active item)
 */
export const UsersManagementPage: Story = {
  args: {
    sidebarConfig: {
      menuItems: adminMenuItems,
      activeItemId: 'users',
      logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    },
    user: sampleUser,
    pageTitle: 'User Management',
    onLogout: () => alert('Logout clicked'),
    children: (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
            Add User
          </button>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                  <td className="px-6 py-4 whitespace-nowrap">john@example.com</td>
                  <td className="px-6 py-4 whitespace-nowrap">Admin</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    ),
  },
};

/**
 * Empty state example
 */
export const EmptyState: Story = {
  args: {
    sidebarConfig: {
      menuItems: adminMenuItems,
      activeItemId: 'dashboard',
      logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    },
    user: sampleUser,
    pageTitle: 'Dashboard',
    onLogout: () => alert('Logout clicked'),
    children: (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">Start by adding some content to your dashboard.</p>
        </div>
      </div>
    ),
  },
};
