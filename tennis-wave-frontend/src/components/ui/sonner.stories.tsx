import type { Meta, StoryObj } from '@storybook/react';
import { Toaster } from './sonner';
import { Button } from './button';
import { toast } from 'sonner';

const meta: Meta<typeof Toaster> = {
  title: 'UI/Toaster',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => toast('This is a default toast')}
          variant="outline"
        >
          Default Toast
        </Button>
        <Button
          onClick={() => toast.success('This is a success toast')}
          variant="outline"
        >
          Success Toast
        </Button>
        <Button
          onClick={() => toast.error('This is an error toast')}
          variant="outline"
        >
          Error Toast
        </Button>
        <Button
          onClick={() => toast.warning('This is a warning toast')}
          variant="outline"
        >
          Warning Toast
        </Button>
        <Button
          onClick={() => toast.info('This is an info toast')}
          variant="outline"
        >
          Info Toast
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            toast('This toast has actions', {
              action: {
                label: 'Undo',
                onClick: () => console.log('Undo clicked'),
              },
            })
          }
          variant="outline"
        >
          Toast with Action
        </Button>
        <Button
          onClick={() =>
            toast('This toast has multiple actions', {
              action: {
                label: 'Undo',
                onClick: () => console.log('Undo clicked'),
              },
              cancel: {
                label: 'Cancel',
                onClick: () => console.log('Cancel clicked'),
              },
            })
          }
          variant="outline"
        >
          Toast with Multiple Actions
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};

export const WithDuration: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            toast('This toast will disappear in 1 second', {
              duration: 1000,
            })
          }
          variant="outline"
        >
          Short Duration (1s)
        </Button>
        <Button
          onClick={() =>
            toast('This toast will disappear in 10 seconds', {
              duration: 10000,
            })
          }
          variant="outline"
        >
          Long Duration (10s)
        </Button>
        <Button
          onClick={() =>
            toast('This toast will not auto-dismiss', {
              duration: Infinity,
            })
          }
          variant="outline"
        >
          No Auto-dismiss
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};

export const WithCustomStyling: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            toast('Custom styled toast', {
              style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
              },
            })
          }
          variant="outline"
        >
          Custom Styled Toast
        </Button>
        <Button
          onClick={() =>
            toast('Toast with custom description', {
              description: 'This is a detailed description of the toast message.',
            })
          }
          variant="outline"
        >
          Toast with Description
        </Button>
      </div>
      <Toaster />
    </div>
  ),
};

export const PromiseToast: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            const promise = new Promise((resolve, reject) => {
              setTimeout(() => {
                if (Math.random() > 0.5) {
                  resolve('Success!');
                } else {
                  reject('Failed!');
                }
              }, 2000);
            });

            toast.promise(promise, {
              loading: 'Loading...',
              success: 'Success!',
              error: 'Error!',
            });
          }}
          variant="outline"
        >
          Promise Toast (Random Result)
        </Button>
      </div>
      <Toaster />
    </div>
  ),
}; 