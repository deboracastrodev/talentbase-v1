import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from './Navbar';

const meta = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

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
 * Default navbar with user menu
 */
export const Default: Story = {
  args: {
    pageTitle: 'Dashboard',
    user: sampleUser,
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    onLogout: () => alert('Logout clicked'),
  },
};

/**
 * Navbar with avatar image
 */
export const WithAvatar: Story = {
  args: {
    pageTitle: 'User Management',
    user: sampleUserWithAvatar,
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    onLogout: () => alert('Logout clicked'),
  },
};

/**
 * Navbar with hamburger menu (mobile)
 */
export const WithHamburger: Story = {
  args: {
    pageTitle: 'Dashboard',
    user: sampleUser,
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    onLogout: () => alert('Logout clicked'),
    onMenuToggle: () => alert('Menu toggle clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Navbar with long page title
 */
export const LongPageTitle: Story = {
  args: {
    pageTitle: 'Advanced User Management and Analytics Dashboard',
    user: sampleUser,
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    onLogout: () => alert('Logout clicked'),
  },
};

/**
 * Navbar with different shadow variants
 */
export const NoShadow: Story = {
  args: {
    pageTitle: 'Dashboard',
    user: sampleUser,
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    onLogout: () => alert('Logout clicked'),
    shadow: 'none',
  },
};

export const MediumShadow: Story = {
  args: {
    pageTitle: 'Dashboard',
    user: sampleUser,
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    onLogout: () => alert('Logout clicked'),
    shadow: 'md',
  },
};

/**
 * Navbar in a page context
 */
export const InPageContext: Story = {
  render: (args) => (
    <div className="h-screen bg-gray-50">
      <Navbar {...args} />
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Page Content</h2>
        <p className="text-gray-600 mb-4">
          This demonstrates the navbar in the context of a full page.
          Scroll down to see the sticky behavior.
        </p>
        <div className="space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold">Content Block {i + 1}</h3>
              <p className="text-sm text-gray-600">
                This is some sample content to demonstrate scrolling behavior.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  args: {
    pageTitle: 'Dashboard',
    user: sampleUserWithAvatar,
    logo: <span className="text-xl font-bold text-primary-600">TalentBase</span>,
    onLogout: () => alert('Logout clicked'),
    onMenuToggle: () => alert('Menu toggle clicked'),
  },
};

/**
 * Mobile view with full functionality
 */
export const MobileView: Story = {
  render: (args) => (
    <div className="h-screen bg-gray-50">
      <Navbar {...args} />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Mobile Page Content</h2>
        <p className="text-gray-600">
          This demonstrates the navbar on mobile devices with hamburger menu.
        </p>
      </div>
    </div>
  ),
  args: {
    pageTitle: 'Dashboard',
    user: sampleUser,
    logo: <span className="text-xl font-bold text-primary-600">TB</span>,
    onLogout: () => alert('Logout clicked'),
    onMenuToggle: () => alert('Menu toggle clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
