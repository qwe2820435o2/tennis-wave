import type { Meta, StoryObj } from '@storybook/react';
import AvatarPicker from './AvatarPicker';

const meta: Meta<typeof AvatarPicker> = {
  title: 'Common/AvatarPicker',
  component: AvatarPicker,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    selectedAvatar: { control: 'text' },
    onAvatarSelect: { action: 'avatar-selected' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedAvatar: undefined,
    disabled: false,
  },
};

export const WithSelectedAvatar: Story = {
  args: {
    selectedAvatar: 'avatar3.png',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    selectedAvatar: 'avatar5.png',
    disabled: true,
  },
}; 