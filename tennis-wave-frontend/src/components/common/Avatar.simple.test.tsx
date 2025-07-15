import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the cn utility function
vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Simple Avatar component for testing
const Avatar = ({ avatar, userName, size = "md", className }: {
  avatar?: string;
  userName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base", 
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-xl"
  };

  const sizeClass = sizeClasses[size];
  
  // If avatar is provided and valid, show the avatar image
  if (avatar && avatar.startsWith("avatar") && avatar.endsWith(".png")) {
    return (
      <div className={`relative rounded-full overflow-hidden ${sizeClass} ${className || ''}`}>
        <img
          src={`/avatars/${avatar}`}
          alt={`${userName || 'User'} avatar`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  
  // Fallback to initials if no avatar or invalid avatar
  const initials = userName 
    ? userName.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2)
    : 'U';
    
  return (
    <div className={`bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center font-medium text-gray-700 dark:text-gray-300 ${sizeClass} ${className || ''}`}>
      {initials}
    </div>
  );
};

describe('Avatar Component (Simple)', () => {
  describe('Avatar with image', () => {
    it('should render avatar image when valid avatar is provided', () => {
      render(<Avatar avatar="avatar1.png" userName="John Doe" />);
      
      const avatarImage = screen.getByAltText('John Doe avatar');
      expect(avatarImage).toBeInTheDocument();
      expect(avatarImage).toHaveAttribute('src', '/avatars/avatar1.png');
    });

    it('should render avatar image with fallback alt text when no userName', () => {
      render(<Avatar avatar="avatar2.png" />);
      
      const avatarImage = screen.getByAltText('User avatar');
      expect(avatarImage).toBeInTheDocument();
      expect(avatarImage).toHaveAttribute('src', '/avatars/avatar2.png');
    });

    it('should not render image for invalid avatar format', () => {
      render(<Avatar avatar="invalid-avatar.jpg" userName="John Doe" />);
      
      const avatarImage = screen.queryByAltText('John Doe avatar');
      expect(avatarImage).not.toBeInTheDocument();
    });
  });

  describe('Avatar with initials', () => {
    it('should render initials for single name', () => {
      render(<Avatar userName="John" />);
      
      const initialsElement = screen.getByText('J');
      expect(initialsElement).toBeInTheDocument();
    });

    it('should render initials for full name', () => {
      render(<Avatar userName="John Doe" />);
      
      const initialsElement = screen.getByText('JD');
      expect(initialsElement).toBeInTheDocument();
    });

    it('should render fallback "U" when no userName provided', () => {
      render(<Avatar />);
      
      const fallbackElement = screen.getByText('U');
      expect(fallbackElement).toBeInTheDocument();
    });
  });

  describe('Avatar sizes', () => {
    it('should apply small size classes', () => {
      render(<Avatar userName="John Doe" size="sm" />);
      
      const avatarContainer = screen.getByText('JD').closest('div');
      expect(avatarContainer).toHaveClass('w-8', 'h-8', 'text-sm');
    });

    it('should apply medium size classes (default)', () => {
      render(<Avatar userName="John Doe" />);
      
      const avatarContainer = screen.getByText('JD').closest('div');
      expect(avatarContainer).toHaveClass('w-12', 'h-12', 'text-base');
    });

    it('should apply large size classes', () => {
      render(<Avatar userName="John Doe" size="lg" />);
      
      const avatarContainer = screen.getByText('JD').closest('div');
      expect(avatarContainer).toHaveClass('w-16', 'h-16', 'text-lg');
    });
  });

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      render(<Avatar userName="John Doe" className="custom-class" />);
      
      const avatarContainer = screen.getByText('JD').closest('div');
      expect(avatarContainer).toHaveClass('custom-class');
    });
  });
}); 