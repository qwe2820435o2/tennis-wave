import type { Meta, StoryObj } from '@storybook/react';
import Avatar from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Common/Avatar',
  component: Avatar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    avatar: { control: 'text' },
    userName: { control: 'text' },
    size: { 
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl']
    },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    avatar: undefined,
    userName: 'John Doe',
    size: 'md',
  },
};

export const WithAvatar: Story = {
  args: {
    avatar: 'avatar3.png',
    userName: 'John Doe',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    avatar: 'avatar5.png',
    userName: 'Jane Smith',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    avatar: 'avatar7.png',
    userName: 'Bob Johnson',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    avatar: 'avatar2.png',
    userName: 'Alice Brown',
    size: 'xl',
  },
};

export const FallbackInitials: Story = {
  args: {
    avatar: undefined,
    userName: 'Michael Wilson',
    size: 'md',
  },
};

export const InvalidAvatar: Story = {
  args: {
    avatar: 'invalid-avatar.jpg',
    userName: 'Test User',
    size: 'md',
  },
}; 