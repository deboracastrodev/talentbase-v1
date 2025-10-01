import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from '../components/SearchBar';

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <SearchBar placeholder="ex: react native developer with 4 years of experience and a passion for startups." />
    </div>
  ),
};

export const WithFilters: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <SearchBar
        placeholder="Search candidates..."
        showFilters
        onFilterClick={() => alert('Filters clicked!')}
      />
    </div>
  ),
};

export const WithActiveFilters: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <SearchBar
        placeholder="Search candidates..."
        showFilters
        filterCount={3}
        onFilterClick={() => alert('Filters clicked!')}
      />
    </div>
  ),
};

export const Complete: Story = {
  render: () => (
    <div className="w-full max-w-6xl bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
      <div className="mb-6">
        <SearchBar
          placeholder="ex: react native developer with 4 years of experience and a passion for startups."
          showFilters
          filterCount={2}
          onSearch={(value) => console.log('Search:', value)}
          onFilterClick={() => alert('Open filters')}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
          Sort by
        </button>

        <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          View favorites
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  ),
};
