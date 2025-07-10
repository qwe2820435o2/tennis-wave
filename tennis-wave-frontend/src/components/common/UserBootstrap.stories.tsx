import type { Meta, StoryObj } from '@storybook/react';
import UserBootstrap from './UserBootstrap';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userSlice from '@/store/slices/userSlice';

// Create test store
const createTestStore = (userState: any) => {
  return configureStore({
    reducer: {
      user: userSlice,
    },
    preloadedState: {
      user: userState,
    },
  });
};

const meta: Meta<typeof UserBootstrap> = {
  title: 'Common/UserBootstrap',
  component: UserBootstrap,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAuthenticatedUser: Story = {
  args: {},
  decorators: [
    (Story) => {
      const store = createTestStore({
        userId: '123',
        userName: 'Test User',
        email: 'test@example.com',
        token: 'mock-token',
        isAuthenticated: true,
      });
      
      // Mock sessionStorage
      const originalGetItem = sessionStorage.getItem;
      sessionStorage.getItem = (key: string) => {
        if (key === 'user') {
          return JSON.stringify({
            userId: '123',
            userName: 'Test User',
            email: 'test@example.com',
          });
        }
        if (key === 'token') {
          return 'mock-token';
        }
        return originalGetItem.call(sessionStorage, key);
      };

      return (
        <Provider store={store}>
          <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">UserBootstrap Test</h1>
            <p className="mb-4">This component runs in the background to initialize user state and SignalR connection.</p>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Current User State:</h2>
              <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                {JSON.stringify(store.getState().user, null, 2)}
              </pre>
            </div>
            <Story />
          </div>
        </Provider>
      );
    },
  ],
};

export const WithoutAuthenticatedUser: Story = {
  args: {},
  decorators: [
    (Story) => {
      const store = createTestStore({
        userId: null,
        userName: null,
        email: null,
        token: null,
        isAuthenticated: false,
      });
      
      // Mock empty sessionStorage
      const originalGetItem = sessionStorage.getItem;
      sessionStorage.getItem = (key: string) => {
        return null;
      };

      return (
        <Provider store={store}>
          <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">UserBootstrap Test</h1>
            <p className="mb-4">This component runs in the background to initialize user state and SignalR connection.</p>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Current User State:</h2>
              <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                {JSON.stringify(store.getState().user, null, 2)}
              </pre>
            </div>
            <Story />
          </div>
        </Provider>
      );
    },
  ],
}; 