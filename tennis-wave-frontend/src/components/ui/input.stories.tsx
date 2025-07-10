import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { ThemeProvider } from 'next-themes';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable input component that supports multiple types and states.',
      },
    },
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
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local'],
      description: 'Type of the input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    value: {
      control: 'text',
      description: 'Value of the input field',
    },
    onChange: {
      action: 'changed',
      description: 'Change event handler',
    },
    onFocus: {
      action: 'focused',
      description: 'Focus event handler',
    },
    onBlur: {
      action: 'blurred',
      description: 'Blur event handler',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Hello World',
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number...',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Date: Story = {
  args: {
    type: 'date',
  },
};

export const Time: Story = {
  args: {
    type: 'time',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="space-y-2">
      <label htmlFor="input-with-label" className="text-sm font-medium">
        Label
      </label>
      <Input id="input-with-label" {...args} />
    </div>
  ),
  args: {
    placeholder: 'Input with label...',
  },
};

export const WithError: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Input {...args} />
      <p className="text-sm text-red-600">This field is required</p>
    </div>
  ),
  args: {
    placeholder: 'Input with error...',
  },
};

export const WithIcon: Story = {
  render: (args) => (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <Input className="pl-10" {...args} />
    </div>
  ),
  args: {
    placeholder: 'Search with icon...',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-1">Text</label>
        <Input type="text" placeholder="Text input" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input type="email" placeholder="Email input" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <Input type="password" placeholder="Password input" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Number</label>
        <Input type="number" placeholder="Number input" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Search</label>
        <Input type="search" placeholder="Search input" />
      </div>
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    placeholder: 'Dark mode input...',
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div className="bg-gray-900 p-8 rounded-lg">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}; 