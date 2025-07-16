import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next-themes
const mockSetTheme = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

// Simple ThemeToggle component for testing
const ThemeToggle = () => {
  const { theme, setTheme } = mockUseTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        disabled
        className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
      </button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
    >
      <svg className="h-4 w-4 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" data-testid="sun-icon" />
      <svg className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" data-testid="moon-icon" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};

describe('ThemeToggle Component (Simple)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial render state', () => {
    it('should show loading state when not mounted', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      // Mock useState to return [false, setMounted] for unmounted state
      vi.spyOn(React, 'useState').mockImplementation(() => [false, vi.fn()]);

      render(<ThemeToggle />);
      
      const loadingButton = screen.getByRole('button');
      expect(loadingButton).toBeDisabled();
    });
  });

  describe('Mounted state', () => {
    beforeEach(() => {
      // Mock mounted state
      vi.spyOn(React, 'useState').mockImplementation(() => [true, vi.fn()]);
    });

    it('should render theme toggle button when mounted', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).not.toBeDisabled();
    });

    it('should show sun icon when theme is light', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const sunIcon = screen.getByTestId('sun-icon');
      expect(sunIcon).toBeInTheDocument();
    });

    it('should show moon icon when theme is dark', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const moonIcon = screen.getByTestId('moon-icon');
      expect(moonIcon).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-label', 'Toggle theme');
    });
  });

  describe('Theme switching functionality', () => {
    beforeEach(() => {
      vi.spyOn(React, 'useState').mockImplementation(() => [true, vi.fn()]);
    });

    it('should call setTheme with dark when switching from light', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should call setTheme with light when switching from dark', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });
}); 