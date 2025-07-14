import type { Meta, StoryObj } from '@storybook/react';
import { PaginationControls, CompactPaginationControls } from './PaginationControls';
import { ThemeProvider } from 'next-themes';

const meta: Meta<typeof PaginationControls> = {
  title: 'Common/PaginationControls',
  component: PaginationControls,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A beautiful pagination component with tennis-themed styling and responsive design.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="w-full max-w-4xl p-8">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    showInfo: {
      control: 'boolean',
      description: 'Whether to show pagination info',
    },
    onPageChange: {
      action: 'page-changed',
      description: 'Callback when page changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockData = {
  items: Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` })),
  totalCount: 100,
  page: 3,
  pageSize: 20,
  totalPages: 5,
  hasNextPage: true,
  hasPreviousPage: true,
};

export const Default: Story = {
  args: {
    data: mockData,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    showInfo: true,
  },
};

export const WithoutInfo: Story = {
  args: {
    data: mockData,
    onPageChange: (page: number) => console.log('Page changed to:', page),
    showInfo: false,
  },
};

export const FirstPage: Story = {
  args: {
    data: {
      ...mockData,
      page: 1,
      hasPreviousPage: false,
    },
    onPageChange: (page: number) => console.log('Page changed to:', page),
  },
};

export const LastPage: Story = {
  args: {
    data: {
      ...mockData,
      page: 5,
      hasNextPage: false,
    },
    onPageChange: (page: number) => console.log('Page changed to:', page),
  },
};

export const ManyPages: Story = {
  args: {
    data: {
      ...mockData,
      totalCount: 1000,
      page: 25,
      totalPages: 50,
    },
    onPageChange: (page: number) => console.log('Page changed to:', page),
  },
};

export const Compact: Story = {
  render: (args) => (
    <CompactPaginationControls
      data={args.data}
      onPageChange={args.onPageChange}
      className="w-full"
    />
  ),
  args: {
    data: mockData,
    onPageChange: (page: number) => console.log('Page changed to:', page),
  },
};

export const DarkMode: Story = {
  args: {
    data: mockData,
    onPageChange: (page: number) => console.log('Page changed to:', page),
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div className="w-full max-w-4xl p-8 bg-gray-900 min-h-screen">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export const MobileView: Story = {
  args: {
    data: mockData,
    onPageChange: (page: number) => console.log('Page changed to:', page),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}; 