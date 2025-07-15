import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    themes: ['light', 'dark', 'system'],
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Sun: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'sun-icon' }),
  Moon: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'moon-icon' }),
}));

// Mock CSS modules
vi.mock('*.module.css', () => ({}));

// Mock image imports
vi.mock('*.png', () => 'test-image.png');
vi.mock('*.jpg', () => 'test-image.jpg');
vi.mock('*.jpeg', () => 'test-image.jpeg');
vi.mock('*.svg', () => 'test-image.svg');

// Mock SignalR service
vi.mock('@/services/signalRService', () => ({
  SignalRService: {
    startConnection: vi.fn(),
    stopConnection: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

// Mock auth service
vi.mock('@/services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
}));

// Mock user service
vi.mock('@/services/userService', () => ({
  searchUsers: vi.fn(),
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
}));

// Mock chat service
vi.mock('@/services/chatService', () => ({
  getConversations: vi.fn(),
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
  createConversation: vi.fn(),
}));

// Mock tennis booking service
vi.mock('@/services/tennisBookingService', () => ({
  getBookings: vi.fn(),
  createBooking: vi.fn(),
  updateBooking: vi.fn(),
  deleteBooking: vi.fn(),
  joinBooking: vi.fn(),
  leaveBooking: vi.fn(),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})); 