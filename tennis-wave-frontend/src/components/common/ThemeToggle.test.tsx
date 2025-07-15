import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

// Mock next-themes
const mockSetTheme = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mounted state
    vi.spyOn(React, 'useState').mockImplementation(() => [false, vi.fn()]);
  });

  describe('Initial render state', () => {
    it('should show loading state when not mounted', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const loadingButton = screen.getByRole('button');
      expect(loadingButton).toBeDisabled();
      expect(loadingButton).toHaveClass('animate-pulse');
    });

    it('should show loading placeholder when not mounted', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const placeholder = screen.getByRole('button').querySelector('.animate-pulse');
      expect(placeholder).toBeInTheDocument();
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
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
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

    it('should have correct button styling', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveClass(
        'w-9',
        'h-9',
        'rounded-lg',
        'hover:bg-gray-100',
        'dark:hover:bg-gray-800',
        'transition-all',
        'duration-200',
        'hover:scale-105',
        'active:scale-95'
      );
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

    it('should have screen reader text', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const srText = screen.getByText('Toggle theme', { selector: '.sr-only' });
      expect(srText).toBeInTheDocument();
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

    it('should handle multiple clicks correctly', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      fireEvent.click(toggleButton);
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
      
      fireEvent.click(toggleButton);
      expect(mockSetTheme).toHaveBeenCalledWith('light');
      
      expect(mockSetTheme).toHaveBeenCalledTimes(2);
    });
  });

  describe('Icon transitions', () => {
    beforeEach(() => {
      vi.spyOn(React, 'useState').mockImplementation(() => [true, vi.fn()]);
    });

    it('should have correct sun icon classes for light theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const sunIcon = screen.getByTestId('sun-icon');
      expect(sunIcon).toHaveClass(
        'h-4',
        'w-4',
        'rotate-0',
        'scale-100',
        'transition-all',
        'duration-200',
        'dark:-rotate-90',
        'dark:scale-0'
      );
    });

    it('should have correct moon icon classes for dark theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const moonIcon = screen.getByTestId('moon-icon');
      expect(moonIcon).toHaveClass(
        'absolute',
        'h-4',
        'w-4',
        'rotate-90',
        'scale-0',
        'transition-all',
        'duration-200',
        'dark:rotate-0',
        'dark:scale-100'
      );
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      vi.spyOn(React, 'useState').mockImplementation(() => [true, vi.fn()]);
    });

    it('should be keyboard accessible', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('tabIndex', '0');
    });

    it('should respond to Enter key', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      fireEvent.keyDown(toggleButton, { key: 'Enter' });
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should respond to Space key', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        themes: ['light', 'dark', 'system'],
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      fireEvent.keyDown(toggleButton, { key: ' ' });
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
  });
}); 