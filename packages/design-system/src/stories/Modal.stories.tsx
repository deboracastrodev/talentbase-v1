import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal, ModalFooter, Button } from '../index';
import { User, Trash2, AlertTriangle } from 'lucide-react';

/**
 * Modal Component - Dialog Modals
 *
 * Full-featured modal with animations, variants, and accessibility.
 *
 * ## Features
 * - 🎨 4 semantic variants
 * - ✨ Smooth animations
 * - 🔒 Focus trap
 * - ⌨️ Keyboard navigation
 * - ♿️ Full ARIA support
 * - 📱 Responsive sizes
 */
const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Modal dialog component for confirmations, forms, and detailed views.

## Usage

\`\`\`tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Delete User"
  variant="danger"
>
  <p>Are you sure?</p>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="destructive">Delete</Button>
  </ModalFooter>
</Modal>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component for interactive demos
function ModalDemo({
  variant,
  title,
  description,
  size,
  buttonLabel,
}: {
  variant?: 'default' | 'danger' | 'success' | 'info';
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  buttonLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{buttonLabel}</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        description={description}
        variant={variant}
        size={size}
      >
        <p className="text-gray-700">
          This is the modal content. You can put anything here: forms, details, confirmations, etc.
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>Confirm</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

/**
 * Default modal for general use.
 */
export const Default: Story = {
  render: () => (
    <ModalDemo
      title="Welcome"
      description="This is a basic modal dialog."
      buttonLabel="Open Default Modal"
    />
  ),
};

/**
 * Danger variant for destructive actions.
 * Shows red alert icon and styling.
 */
export const DangerVariant: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="destructive" onClick={() => setIsOpen(true)}>
          Delete User
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Delete User"
          description="This action cannot be undone."
          variant="danger"
        >
          <p className="text-gray-700">
            Are you sure you want to delete <strong>João Silva</strong>? This will permanently
            remove the user and all associated data.
          </p>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setIsOpen(false)}>
              Delete User
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

/**
 * Success variant for positive confirmations.
 * Shows green checkmark icon.
 */
export const SuccessVariant: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Show Success</Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Candidate Created!"
          variant="success"
        >
          <p className="text-gray-700">
            João Silva has been successfully added to the database. An email has been sent with
            login instructions.
          </p>
          <ModalFooter>
            <Button onClick={() => setIsOpen(false)}>OK</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

/**
 * Info variant for informational messages.
 * Shows blue info icon.
 */
export const InfoVariant: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Show Info
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Session Expiring Soon"
          description="Your session will expire in 5 minutes."
          variant="info"
        >
          <p className="text-gray-700">
            Please save your work to avoid losing any changes. You can extend your session or
            continue working.
          </p>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Logout
            </Button>
            <Button onClick={() => setIsOpen(false)}>Extend Session</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

/**
 * Small modal for quick confirmations.
 */
export const SmallSize: Story = {
  render: () => (
    <ModalDemo size="sm" title="Quick Confirmation" buttonLabel="Open Small Modal" />
  ),
};

/**
 * Large modal for detailed content.
 */
export const LargeSize: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>View Details</Button>

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Candidate Details" size="lg">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-600">Name</dt>
                  <dd className="font-medium">João Silva</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Email</dt>
                  <dd className="font-medium">joao@example.com</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Phone</dt>
                  <dd className="font-medium">(11) 99999-9999</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">City</dt>
                  <dd className="font-medium">São Paulo, SP</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Information</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-600">Position</dt>
                  <dd className="font-medium">SDR/BDR</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Experience</dt>
                  <dd className="font-medium">3 years</dd>
                </div>
              </dl>
            </div>
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setIsOpen(false)}>Edit</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

/**
 * Modal with form example.
 */
export const WithForm: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Create Candidate</Button>

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New Candidate" size="md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="João Silva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="joao@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Select...</option>
                <option value="sdr">SDR/BDR</option>
                <option value="ae">Account Executive</option>
                <option value="csm">Customer Success</option>
              </select>
            </div>

            <ModalFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );
  },
};

/**
 * Modal without close button (useful for critical flows).
 */
export const NoCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Start Process</Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Processing..."
          showCloseButton={false}
          closeOnBackdrop={false}
          closeOnEscape={false}
        >
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
            <p className="text-gray-600">Please wait while we process your request...</p>
          </div>
        </Modal>
      </>
    );
  },
};

/**
 * Modal with scrollable content.
 */
export const ScrollableContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Long Content</Button>

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Terms of Service" size="lg">
          <div className="space-y-4 text-gray-700">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <h3 className="font-semibold mb-2">Section {i + 1}</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                  nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
            ))}
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Decline
            </Button>
            <Button onClick={() => setIsOpen(false)}>Accept</Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

/**
 * All modal variants showcase.
 */
export const AllVariants: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);

    return (
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" onClick={() => setOpenModal('default')}>
          Default
        </Button>
        <Button variant="destructive" onClick={() => setOpenModal('danger')}>
          Danger
        </Button>
        <Button variant="default" onClick={() => setOpenModal('success')}>
          Success
        </Button>
        <Button variant="outline" onClick={() => setOpenModal('info')}>
          Info
        </Button>

        <Modal
          isOpen={openModal === 'default'}
          onClose={() => setOpenModal(null)}
          title="Default Modal"
        >
          <p>This is a default modal without any special styling.</p>
          <ModalFooter>
            <Button onClick={() => setOpenModal(null)}>Close</Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={openModal === 'danger'}
          onClose={() => setOpenModal(null)}
          title="Danger Modal"
          description="This is a destructive action"
          variant="danger"
        >
          <p>Use this variant for delete confirmations and other destructive actions.</p>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setOpenModal(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setOpenModal(null)}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={openModal === 'success'}
          onClose={() => setOpenModal(null)}
          title="Success Modal"
          variant="success"
        >
          <p>Use this variant for success confirmations and positive feedback.</p>
          <ModalFooter>
            <Button onClick={() => setOpenModal(null)}>OK</Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={openModal === 'info'}
          onClose={() => setOpenModal(null)}
          title="Info Modal"
          description="Here's some important information"
          variant="info"
        >
          <p>Use this variant for informational messages and updates.</p>
          <ModalFooter>
            <Button onClick={() => setOpenModal(null)}>Got it</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  },
};
