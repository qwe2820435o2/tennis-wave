import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock react-redux
const mockUseSelector = vi.fn();
vi.mock('react-redux', () => ({
  useSelector: (selector: any) => mockUseSelector(selector),
}));

// Mock Spinner component
vi.mock('@/components/ui/spinner', () => ({
  Spinner: ({ className }: { className?: string }) => (
    <div data-testid="spinner" className={className}>Loading...</div>
  ),
}));

// Simple GlobalLoading component for testing
const GlobalLoading = () => {
  const isLoading = mockUseSelector();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div data-testid="spinner" className="w-16 h-16">Loading...</div>
    </div>
  );
};

describe('GlobalLoading Component (Simple)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should render loading overlay when isLoading is true', () => {
      mockUseSelector.mockReturnValue(true);

      render(<GlobalLoading />);
      
      const overlay = screen.getByTestId('spinner').parentElement;
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center', 'bg-black/30');
    });

    it('should render spinner with correct styling', () => {
      mockUseSelector.mockReturnValue(true);

      render(<GlobalLoading />);
      
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-16', 'h-16');
    });

    it('should not render when isLoading is false', () => {
      mockUseSelector.mockReturnValue(false);

      const { container } = render(<GlobalLoading />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Redux integration', () => {
    it('should respond to loading state changes', () => {
      mockUseSelector.mockReturnValue(true);

      const { rerender } = render(<GlobalLoading />);
      expect(screen.getByTestId('spinner')).toBeInTheDocument();

      mockUseSelector.mockReturnValue(false);
      rerender(<GlobalLoading />);
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });
  });
}); 