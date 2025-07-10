import type { Meta, StoryObj } from '@storybook/react';
import GlobalLoading from './GlobalLoading';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import loadingSlice from '@/store/slices/loadingSlice';

// Create test store
const createTestStore = (isLoading: boolean) => {
  return configureStore({
    reducer: {
      loading: loadingSlice,
    },
    preloadedState: {
      loading: { isLoading },
    },
  });
};

const meta: Meta<typeof GlobalLoading> = {
  title: 'Common/GlobalLoading',
  component: GlobalLoading,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {},
  decorators: [
    (Story) => {
      const store = createTestStore(true);
      return (
        <Provider store={store}>
          <div className="relative h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8">
                          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
            <p>This is some page content. When loading state is true, a global loading overlay will be displayed.</p>
            </div>
            <Story />
          </div>
        </Provider>
      );
    },
  ],
};

export const NotLoading: Story = {
  args: {},
  decorators: [
    (Story) => {
      const store = createTestStore(false);
      return (
        <Provider store={store}>
          <div className="relative h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8">
                          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
            <p>This is some page content. When loading state is false, no global loading overlay will be displayed.</p>
            </div>
            <Story />
          </div>
        </Provider>
      );
    },
  ],
}; 