import type { Meta, StoryObj } from '@storybook/react';
import AdvancedSearchFilter from './AdvancedSearchFilter';
import { ThemeProvider } from 'next-themes';
import { SearchBookingDto } from '@/types/tennisBooking';

const meta: Meta<typeof AdvancedSearchFilter> = {
  title: 'Bookings/AdvancedSearchFilter',
  component: AdvancedSearchFilter,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light">
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    onSearch: {
      action: 'search',
      description: 'Search callback function',
    },
    onReset: {
      action: 'reset',
      description: 'Reset callback function',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock statistics data
const mockStatistics = {
  typeCounts: {
    '1': 15, // Singles
    '2': 8,  // Doubles
    '3': 12, // Mixed
  },
  statusCounts: {
    '1': 20, // Open
    '2': 5,  // Full
    '3': 10, // Cancelled
  },
  skillLevelCounts: {
    '1': 8,  // Beginner
    '2': 12, // Intermediate
    '3': 15, // Advanced
  },
  availableLocations: ['Tennis Court A', 'Tennis Court B', 'Sports Center', 'Community Park'],
};

export const Default: Story = {
  args: {
    statistics: mockStatistics,
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tennis Booking Search Filter</h1>
          <Story />
        </div>
      </div>
    ),
  ],
};

export const WithActiveFilters: Story = {
  args: {
    statistics: mockStatistics,
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tennis Booking Search Filter</h1>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the filter state when there are active filter conditions.',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    statistics: mockStatistics,
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div className="min-h-screen bg-gray-900 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-white">Tennis Booking Search Filter</h1>
            <Story />
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
};

export const WithoutStatistics: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tennis Booking Search Filter</h1>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the filter state when there is no statistics data.',
      },
    },
  },
};

export const Expanded: Story = {
  args: {
    statistics: mockStatistics,
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tennis Booking Search Filter</h1>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the filter state when advanced options are expanded.',
      },
    },
  },
}; 