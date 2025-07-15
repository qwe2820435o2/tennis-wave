import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GlobalLoading from './GlobalLoading';
// Mock the loading slice
const loadingReducer = (state = { isLoading: false }, action: any) => {
  switch (action.type) {
    case 'loading/setLoading':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// Mock the Spinner component
vi.mock('@/components/ui/spinner', () => ({
  Spinner: ({ className }: { className?: string }) => (
    <div data-testid="spinner" className={className} />
  ),
}));

describe('GlobalLoading Component', () => {
  const createMockStore = (loadingState: boolean) => {
    return configureStore({
      reducer: {
        loading: loadingReducer,
      },
      preloadedState: {
        loading: {
          isLoading: loadingState,
        },
      },
    });
  };

  describe('Loading state', () => {
    it('should render loading overlay when isLoading is true', () => {
      const store = createMockStore(true);
      
      render(
        <Provider store={store}>
          <GlobalLoading />
        </Provider>
      );

      const loadingOverlay = screen.getByTestId('spinner').parentElement;
      expect(loadingOverlay).toBeInTheDocument();
      expect(loadingOverlay).toHaveClass(
        'fixed',
        'inset-0',
        'z-50',
        'flex',
        'items-center',
        'justify-center',
        'bg-black/30'
      );
    });

    it('should render spinner with correct styling', () => {
      const store = createMockStore(true);
      
      render(
        <Provider store={store}>
          <GlobalLoading />
        </Provider>
      );

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-16', 'h-16');
    });
  });

  describe('Not loading state', () => {
    it('should not render anything when isLoading is false', () => {
      const store = createMockStore(false);
      
      const { container } = render(
        <Provider store={store}>
          <GlobalLoading />
        </Provider>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Redux integration', () => {
    it('should respond to loading state changes', () => {
      const store = createMockStore(false);
      
      const { rerender } = render(
        <Provider store={store}>
          <GlobalLoading />
        </Provider>
      );

      // Initially should not render
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();

      // Update store to loading state
      store.dispatch({ type: 'loading/setLoading', payload: true });

      // Re-render with updated store
      rerender(
        <Provider store={store}>
          <GlobalLoading />
        </Provider>
      );

      // Should now render loading overlay
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });
}); 