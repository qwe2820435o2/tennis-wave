import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from 'next-themes';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Common/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="p-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InDarkMode: Story = {
  args: {},
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div className="p-4 bg-gray-900 min-h-screen">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export const InLightMode: Story = {
  args: {},
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="p-4 bg-white min-h-screen">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}; 