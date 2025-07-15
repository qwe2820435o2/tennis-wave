import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
// Mock reducers
const loadingReducer = (state = { isLoading: false }, action: any) => {
  switch (action.type) {
    case 'loading/setLoading':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const userReducer = (state = { currentUser: null }, action: any) => {
  switch (action.type) {
    case 'user/setUser':
      return { ...state, currentUser: action.payload };
    default:
      return state;
  }
};

const chatReducer = (state = { conversations: [], messages: {} }, action: any) => {
  switch (action.type) {
    case 'chat/setConversations':
      return { ...state, conversations: action.payload };
    case 'chat/setMessages':
      return { ...state, messages: { ...state.messages, ...action.payload } };
    default:
      return state;
  }
};

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: any;
}

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      loading: loadingReducer,
      user: userReducer,
      chat: chatReducer,
    },
    preloadedState,
  });
};

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock data generators
export const createMockUser = (overrides = {}) => ({
  id: '1',
  userName: 'testuser',
  email: 'test@example.com',
  avatar: 'avatar1.png',
  ...overrides,
});

export const createMockTennisBooking = (overrides = {}) => ({
  id: '1',
  title: 'Test Booking',
  description: 'Test description',
  date: '2024-01-01',
  time: '10:00',
  location: 'Test Court',
  maxParticipants: 4,
  currentParticipants: 2,
  status: 'Open',
  createdBy: '1',
  ...overrides,
});

export const createMockPaginationData = (overrides = {}) => ({
  items: [],
  page: 1,
  totalPages: 10,
  hasNextPage: true,
  hasPreviousPage: false,
  totalCount: 100,
  pageSize: 10,
  ...overrides,
});

// Common test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  });
};

export const mockApiError = (message: string, status = 400) => {
  return Promise.reject({
    response: {
      data: { message },
      status,
      statusText: 'Bad Request',
    },
  });
}; 