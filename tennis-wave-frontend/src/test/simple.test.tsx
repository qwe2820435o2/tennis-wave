import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Simple test component
const TestComponent = ({ text }: { text: string }) => (
  <div data-testid="test-component">{text}</div>
);

describe('Simple Test', () => {
  it('should render correctly', () => {
    render(<TestComponent text="Hello World" />);
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should handle different text', () => {
    render(<TestComponent text="Test Message" />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });
}); 