import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Custom CSS class name',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    className: 'w-4 h-4',
  },
};

export const Medium: Story = {
  args: {
    className: 'w-8 h-8',
  },
};

export const Large: Story = {
  args: {
    className: 'w-12 h-12',
  },
};

export const ExtraLarge: Story = {
  args: {
    className: 'w-16 h-16',
  },
};

export const WithText: Story = {
  render: () => (
    <div className="flex flex-col items-center space-y-4">
      <Spinner className="w-8 h-8" />
      <p className="text-sm text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
        <Spinner className="w-4 h-4" />
        <span>Loading</span>
      </button>
      <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg">
        <Spinner className="w-4 h-4" />
        <span>Saving</span>
      </button>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-64 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-center h-32">
        <Spinner className="w-8 h-8" />
      </div>
      <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
        Loading content...
      </p>
    </div>
  ),
}; 