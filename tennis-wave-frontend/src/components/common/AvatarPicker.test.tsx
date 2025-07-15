import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AvatarPicker from './AvatarPicker';

// Mock the Avatar component
vi.mock('./Avatar', () => ({
  default: ({ avatar, userName, size, className }: any) => (
    <div data-testid="avatar" data-avatar={avatar} data-user={userName} data-size={size} className={className} />
  ),
}));

describe('AvatarPicker Component', () => {
  const mockOnAvatarSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render avatar picker with title', () => {
      render(<AvatarPicker selectedAvatar="avatar1.png" onAvatarSelect={mockOnAvatarSelect} />);
      
      expect(screen.getByText('Choose your avatar')).toBeInTheDocument();
    });

    it('should render avatar grid', () => {
      render(<AvatarPicker selectedAvatar="avatar1.png" onAvatarSelect={mockOnAvatarSelect} />);
      
      // Should render multiple avatar options
      const avatarImages = screen.getAllByAltText(/Avatar avatar\d+\.png/);
      expect(avatarImages.length).toBeGreaterThan(1);
    });

    it('should show selected avatar info', () => {
      render(<AvatarPicker selectedAvatar="avatar2.png" onAvatarSelect={mockOnAvatarSelect} />);
      
      expect(screen.getByText('Selected: avatar2.png')).toBeInTheDocument();
    });
  });

  describe('Avatar selection', () => {
    it('should call onAvatarSelect when avatar is clicked', () => {
      render(<AvatarPicker selectedAvatar="avatar1.png" onAvatarSelect={mockOnAvatarSelect} />);
      
      const avatarImages = screen.getAllByAltText(/Avatar avatar\d+\.png/);
      const secondAvatar = avatarImages[1]; // Click second avatar option
      
      fireEvent.click(secondAvatar.closest('[role="button"]')!);
      
      expect(mockOnAvatarSelect).toHaveBeenCalledWith('avatar2.png');
    });

    it('should highlight selected avatar', () => {
      render(<AvatarPicker selectedAvatar="avatar3.png" onAvatarSelect={mockOnAvatarSelect} />);
      
      const selectedCard = screen.getByAltText('Avatar avatar3.png').closest('[role="button"]');
      expect(selectedCard).toHaveClass('ring-2', 'ring-green-500');
    });
  });

  describe('Disabled state', () => {
    it('should disable interactions when disabled', () => {
      render(<AvatarPicker selectedAvatar="avatar1.png" onAvatarSelect={mockOnAvatarSelect} disabled />);
      
      const avatarCards = screen.getAllByRole('button');
      avatarCards.forEach(card => {
        expect(card).toHaveClass('opacity-50', 'cursor-not-allowed');
      });
    });

    it('should not call onAvatarSelect when disabled', () => {
      render(<AvatarPicker selectedAvatar="avatar1.png" onAvatarSelect={mockOnAvatarSelect} disabled />);
      
      const avatarImages = screen.getAllByAltText(/Avatar avatar\d+\.png/);
      fireEvent.click(avatarImages[0].closest('[role="button"]')!);
      
      expect(mockOnAvatarSelect).not.toHaveBeenCalled();
    });
  });

  describe('Hover effects', () => {
    it('should show hover indicator on mouse enter', () => {
      render(<AvatarPicker selectedAvatar="avatar1.png" onAvatarSelect={mockOnAvatarSelect} />);
      
      const avatarCards = screen.getAllByRole('button');
      fireEvent.mouseEnter(avatarCards[0]);
      
      // Check for hover indicator
      const hoverIndicator = screen.getByText('✓');
      expect(hoverIndicator).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle no selected avatar', () => {
      render(<AvatarPicker onAvatarSelect={mockOnAvatarSelect} />);
      
      const avatarImages = screen.getAllByAltText(/Avatar avatar\d+\.png/);
      expect(avatarImages.length).toBeGreaterThan(0);
      expect(screen.queryByText(/Selected:/)).not.toBeInTheDocument();
    });
  });
}); 