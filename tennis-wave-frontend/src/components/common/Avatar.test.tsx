import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Avatar from './Avatar';

describe('Avatar Component', () => {
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

    it('should not render image for avatar that does not start with "avatar"', () => {
      render(<Avatar avatar="profile1.png" userName="John Doe" />);
      
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

    it('should render initials for multiple names', () => {
      render(<Avatar userName="John Michael Doe" />);
      
      const initialsElement = screen.getByText('JD');
      expect(initialsElement).toBeInTheDocument();
    });

    it('should render fallback "U" when no userName provided', () => {
      render(<Avatar />);
      
      const fallbackElement = screen.getByText('U');
      expect(fallbackElement).toBeInTheDocument();
    });

    it('should render fallback "U" when userName is empty string', () => {
      render(<Avatar userName="" />);
      
      const fallbackElement = screen.getByText('U');
      expect(fallbackElement).toBeInTheDocument();
    });

    it('should handle names with extra spaces', () => {
      render(<Avatar userName="  John   Doe  " />);
      
      const initialsElement = screen.getByText('JD');
      expect(initialsElement).toBeInTheDocument();
    });
  });

  describe('Avatar sizes', () => {
    it('should apply small size classes', () => {
      render(<Avatar userName="John Doe" size="sm" />);
      
      const avatarContainer = screen.getByText('JD').parentElement;
      expect(avatarContainer).toHaveClass('w-8', 'h-8', 'text-sm');
    });

    it('should apply medium size classes (default)', () => {
      render(<Avatar userName="John Doe" />);
      
      const avatarContainer = screen.getByText('JD').parentElement;
      expect(avatarContainer).toHaveClass('w-12', 'h-12', 'text-base');
    });

    it('should apply large size classes', () => {
      render(<Avatar userName="John Doe" size="lg" />);
      
      const avatarContainer = screen.getByText('JD').parentElement;
      expect(avatarContainer).toHaveClass('w-16', 'h-16', 'text-lg');
    });

    it('should apply extra large size classes', () => {
      render(<Avatar userName="John Doe" size="xl" />);
      
      const avatarContainer = screen.getByText('JD').parentElement;
      expect(avatarContainer).toHaveClass('w-24', 'h-24', 'text-xl');
    });
  });

  describe('Avatar styling', () => {
    it('should apply custom className', () => {
      render(<Avatar userName="John Doe" className="custom-class" />);
      
      const avatarContainer = screen.getByText('JD').parentElement;
      expect(avatarContainer).toHaveClass('custom-class');
    });

    it('should have correct base styling for initials', () => {
      render(<Avatar userName="John Doe" />);
      
      const avatarContainer = screen.getByText('JD').parentElement;
      expect(avatarContainer).toHaveClass(
        'bg-gray-300',
        'dark:bg-gray-600',
        'rounded-full',
        'flex',
        'items-center',
        'justify-center',
        'font-medium',
        'text-gray-700',
        'dark:text-gray-300'
      );
    });

    it('should have correct styling for image container', () => {
      render(<Avatar avatar="avatar1.png" userName="John Doe" />);
      
      const avatarContainer = screen.getByAltText('John Doe avatar').parentElement;
      expect(avatarContainer).toHaveClass('relative', 'rounded-full', 'overflow-hidden');
    });

    it('should have correct image styling', () => {
      render(<Avatar avatar="avatar1.png" userName="John Doe" />);
      
      const avatarImage = screen.getByAltText('John Doe avatar');
      expect(avatarImage).toHaveClass('w-full', 'h-full', 'object-cover');
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in names', () => {
      render(<Avatar userName="José María" />);
      
      const initialsElement = screen.getByText('JM');
      expect(initialsElement).toBeInTheDocument();
    });

    it('should handle numbers in names', () => {
      render(<Avatar userName="John123 Doe" />);
      
      const initialsElement = screen.getByText('JD');
      expect(initialsElement).toBeInTheDocument();
    });

    it('should handle very long names', () => {
      render(<Avatar userName="John Michael Alexander Doe Smith" />);
      
      const initialsElement = screen.getByText('JD');
      expect(initialsElement).toBeInTheDocument();
    });

    it('should prioritize image over initials when both are provided', () => {
      render(<Avatar avatar="avatar1.png" userName="John Doe" />);
      
      const avatarImage = screen.getByAltText('John Doe avatar');
      const initialsElement = screen.queryByText('JD');
      
      expect(avatarImage).toBeInTheDocument();
      expect(initialsElement).not.toBeInTheDocument();
    });
  });
}); 