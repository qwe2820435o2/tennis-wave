import type { Meta, StoryObj } from '@storybook/react';
import HeaderForStorybook from './HeaderForStorybook';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userSlice from '@/store/slices/userSlice';
import { ThemeProvider } from 'next-themes';

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

const meta: Meta<typeof HeaderForStorybook> = {
  title: 'Layout/Header',
  component: HeaderForStorybook,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light">
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AuthenticatedUser: Story = {
  args: {},
  decorators: [
    (Story) => {
      const store = createTestStore({
        userId: '123',
        userName: 'John Doe',
        email: 'zhangsan@example.com',
        token: 'mock-token',
        isAuthenticated: true,
        isHydrated: true,
      });
      
      return (
        <Provider store={store}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Story />
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Page Content</h1>
              <p>This is some page content to demonstrate the Header component.</p>
            </div>
          </div>
        </Provider>
      );
    },
  ],
};

export const UnauthenticatedUser: Story = {
  args: {},
  decorators: [
    (Story) => {
      const store = createTestStore({
        userId: null,
        userName: null,
        email: null,
        token: null,
        isAuthenticated: false,
        isHydrated: true,
      });
      
      return (
        <Provider store={store}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Story />
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Page Content</h1>
              <p>This is some page content to demonstrate the Header component.</p>
            </div>
          </div>
        </Provider>
      );
    },
  ],
};

export const DarkMode: Story = {
  args: {},
  decorators: [
    (Story) => {
      const store = createTestStore({
        userId: '123',
        userName: 'Jane Smith',
        email: 'lisi@example.com',
        token: 'mock-token',
        isAuthenticated: true,
        isHydrated: true,
      });
      
      return (
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Provider store={store}>
            <div className="min-h-screen bg-gray-900">
              <Story />
              <div className="p-8">
                <h1 className="text-2xl font-bold mb-4 text-white">Page Content</h1>
                <p className="text-gray-300">This is some page content to demonstrate the Header component in dark mode.</p>
              </div>
            </div>
          </Provider>
        </ThemeProvider>
      );
    },
  ],
};

export const LoadingState: Story = {
  args: {},
  decorators: [
    (Story) => {
      const store = createTestStore({
        userId: null,
        userName: null,
        email: null,
        token: null,
        isAuthenticated: false,
        isHydrated: false,
      });
      
      return (
        <Provider store={store}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Story />
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Page Content</h1>
              <p>The Header component will not display in loading state.</p>
            </div>
          </div>
        </Provider>
      );
    },
  ],
}; 