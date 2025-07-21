import type { Meta, StoryObj } from '@storybook/react';
import NewChatModalForStorybook from './NewChatModalForStorybook';
import { useState } from 'react';
import { ThemeProvider } from 'next-themes';

// Mock user data
const mockUsers = [
  {
    userId: 1,
    userName: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
  },
  {
    userId: 2,
    userName: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isOnline: false,
  },
  {
    userId: 3,
    userName: 'Mike Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
  },
];

// Wrapper component to control modal open/close state
const NewChatModalWrapper = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return <NewChatModalForStorybook isOpen={isOpen} onClose={onClose} />;
};

const meta: Meta<typeof NewChatModalWrapper> = {
  title: 'Chat/NewChatModal',
  component: NewChatModalWrapper,
  parameters: {
    layout: 'centered',
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
    isOpen: {
      control: 'boolean',
      description: 'Control whether the modal is displayed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
  },
  decorators: [
    (Story) => {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
          <div className="mb-4">
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Open New Chat Modal
            </button>
          </div>
          <Story args={{ isOpen, onClose: () => setIsOpen(false) }} />
        </div>
      );
    },
  ],
};

export const DarkMode: Story = {
  args: {
    isOpen: true,
  },
  decorators: [
    (Story) => {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <ThemeProvider attribute="class" defaultTheme="dark">
          <div className="min-h-screen bg-gray-900 p-8">
            <div className="mb-4">
              <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Open New Chat Modal
              </button>
            </div>
            <Story args={{ isOpen, onClose: () => setIsOpen(false) }} />
          </div>
        </ThemeProvider>
      );
    },
  ],
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
  decorators: [
    (Story) => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
          <div className="mb-4">
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Open New Chat Modal
            </button>
          </div>
          <Story args={{ isOpen, onClose: () => setIsOpen(false) }} />
        </div>
      );
    },
  ],
};

// Mock search results Story
export const WithSearchResults: Story = {
  args: {
    isOpen: true,
  },
  decorators: [
    (Story) => {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
          <div className="mb-4">
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Open New Chat Modal
            </button>
          </div>
          <Story args={{ isOpen, onClose: () => setIsOpen(false) }} />
        </div>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the modal state when displaying search results. In actual usage, search results are obtained through API.',
      },
    },
  },
}; 