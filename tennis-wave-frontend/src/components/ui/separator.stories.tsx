import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the separator',
    },
    decorative: {
      control: 'boolean',
      description: 'Whether the separator is decorative',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: (args) => (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Horizontal Separator</h4>
        <p className="text-sm text-muted-foreground">
          This is some content above the separator.
        </p>
      </div>
      <Separator {...args} />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Content Below</h4>
        <p className="text-sm text-muted-foreground">
          This is some content below the separator.
        </p>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="flex h-20 items-center space-x-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Left Content</h4>
        <p className="text-sm text-muted-foreground">
          Content on the left side.
        </p>
      </div>
      <Separator {...args} />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Right Content</h4>
        <p className="text-sm text-muted-foreground">
          Content on the right side.
        </p>
      </div>
    </div>
  ),
};

export const Decorative: Story = {
  args: {
    decorative: true,
  },
  render: (args) => (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Decorative Separator</h4>
        <p className="text-sm text-muted-foreground">
          This separator is purely decorative.
        </p>
      </div>
      <Separator {...args} />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">More Content</h4>
        <p className="text-sm text-muted-foreground">
          Additional content below the decorative separator.
        </p>
      </div>
    </div>
  ),
};

export const MultipleSeparators: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Section 1</h4>
        <p className="text-sm text-muted-foreground">
          First section content.
        </p>
      </div>
      <Separator />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Section 2</h4>
        <p className="text-sm text-muted-foreground">
          Second section content.
        </p>
      </div>
      <Separator />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Section 3</h4>
        <p className="text-sm text-muted-foreground">
          Third section content.
        </p>
      </div>
    </div>
  ),
}; 