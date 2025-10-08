import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './Sidebar';
import { Home, Users, Building2, User, Briefcase, FileText, Target, Settings } from 'lucide-react';
import { useState } from 'react';

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMenuItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home },
  { id: 'users', label: 'Users', href: '/users', icon: Users },
  { id: 'companies', label: 'Companies', href: '/companies', icon: Building2 },
  { id: 'candidates', label: 'Candidates', href: '/candidates', icon: User },
  { id: 'jobs', label: 'Jobs', href: '/jobs', icon: Briefcase },
  { id: 'applications', label: 'Applications', href: '/applications', icon: FileText },
  { id: 'matching', label: 'Matching', href: '/matching', icon: Target },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];

const sampleMenuItemsWithBadges = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home },
  { id: 'users', label: 'Users', href: '/users', icon: Users, badge: 5 },
  { id: 'companies', label: 'Companies', href: '/companies', icon: Building2, badge: 'New' },
  { id: 'candidates', label: 'Candidates', href: '/candidates', icon: User },
  { id: 'jobs', label: 'Jobs', href: '/jobs', icon: Briefcase },
];

const sampleMenuItemsDisabled = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home },
  { id: 'users', label: 'Users', href: '/users', icon: Users },
  { id: 'companies', label: 'Companies', href: '/companies', icon: Building2, disabled: true },
  { id: 'candidates', label: 'Candidates', href: '/candidates', icon: User, disabled: true },
  { id: 'jobs', label: 'Jobs', href: '/jobs', icon: Briefcase, disabled: true },
];

/**
 * Default sidebar with menu items and logo
 */
export const Default: Story = {
  args: {
    menuItems: sampleMenuItems,
    activeItemId: 'dashboard',
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
  },
};

/**
 * Sidebar with active item highlighted
 */
export const ActiveItemHighlighted: Story = {
  args: {
    menuItems: sampleMenuItems,
    activeItemId: 'users',
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
  },
};

/**
 * Sidebar with badges on menu items
 */
export const WithBadges: Story = {
  args: {
    menuItems: sampleMenuItemsWithBadges,
    activeItemId: 'dashboard',
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
  },
};

/**
 * Sidebar with disabled menu items
 */
export const WithDisabledItems: Story = {
  args: {
    menuItems: sampleMenuItemsDisabled,
    activeItemId: 'users',
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
  },
};

/**
 * Mobile collapsed state (visible on mobile)
 */
export const MobileCollapsed: Story = {
  args: {
    menuItems: sampleMenuItems,
    activeItemId: 'dashboard',
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    isCollapsed: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Mobile expanded with overlay (visible on mobile)
 */
export const MobileExpanded: Story = {
  args: {
    menuItems: sampleMenuItems,
    activeItemId: 'dashboard',
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    isCollapsed: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Interactive sidebar with toggle functionality
 */
export const Interactive: Story = {
  render: (args) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeItem, setActiveItem] = useState('dashboard');

    return (
      <div className="relative h-screen">
        <Sidebar
          {...args}
          isCollapsed={isCollapsed}
          activeItemId={activeItem}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          onItemClick={(item) => {
            setActiveItem(item.id);
            // On mobile, close sidebar after selection
            if (window.innerWidth < 1024) {
              setIsCollapsed(true);
            }
          }}
        />
        <div className="lg:ml-60 p-8">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden mb-4 px-4 py-2 bg-primary-500 text-white rounded-md"
          >
            Toggle Sidebar
          </button>
          <h1 className="text-2xl font-bold mb-4">Main Content Area</h1>
          <p>Active item: {activeItem}</p>
          <p>Sidebar is {isCollapsed ? 'collapsed' : 'expanded'}</p>
        </div>
      </div>
    );
  },
  args: {
    menuItems: sampleMenuItemsWithBadges,
    activeItemId: 'dashboard',
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
  },
};

/**
 * Narrow width variant
 */
export const NarrowWidth: Story = {
  args: {
    menuItems: sampleMenuItems,
    activeItemId: 'dashboard',
    logo: <span className="text-lg font-bold text-primary-600">TB</span>,
    width: 'narrow',
  },
};

/**
 * Wide width variant
 */
export const WideWidth: Story = {
  args: {
    menuItems: sampleMenuItems,
    activeItemId: 'dashboard',
    logo: <span className="text-xl font-bold text-primary-600">TalentBase Platform</span>,
    width: 'wide',
  },
};
