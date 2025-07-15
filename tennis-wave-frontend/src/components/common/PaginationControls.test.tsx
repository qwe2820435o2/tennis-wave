import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaginationControls, CompactPaginationControls } from './PaginationControls';

// Mock the pagination hook
const mockPaginationData = {
  items: [],
  page: 1,
  totalPages: 10,
  hasNextPage: true,
  hasPreviousPage: false,
  totalCount: 100,
  pageSize: 10,
};

describe('PaginationControls Component', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render pagination controls with correct info', () => {
      render(
        <PaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('显示')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('到')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('条，共')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('条记录')).toBeInTheDocument();
    });

    it('should render page information correctly', () => {
      render(
        <PaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('第')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('页，共')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('页')).toBeInTheDocument();
    });

    it('should not render when totalPages is 1', () => {
      const singlePageData = { ...mockPaginationData, totalPages: 1 };
      
      const { container } = render(
        <PaginationControls
          data={singlePageData}
          onPageChange={mockOnPageChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when totalPages is 0', () => {
      const zeroPageData = { ...mockPaginationData, totalPages: 0 };
      
      const { container } = render(
        <PaginationControls
          data={zeroPageData}
          onPageChange={mockOnPageChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Page navigation', () => {
    it('should call onPageChange when next button is clicked', () => {
      render(
        <PaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when previous button is clicked', () => {
      const dataWithPrevious = { ...mockPaginationData, page: 2, hasPreviousPage: true };
      
      render(
        <PaginationControls
          data={dataWithPrevious}
          onPageChange={mockOnPageChange}
        />
      );

      const previousButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(previousButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange when page number is clicked', () => {
      render(
        <PaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
        />
      );

      const pageButton = screen.getByText('2');
      fireEvent.click(pageButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should disable previous button when on first page', () => {
      render(
        <PaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
        />
      );

      const previousButton = screen.getByRole('button', { name: /previous/i });
      expect(previousButton).toHaveClass('pointer-events-none', 'opacity-50', 'cursor-not-allowed');
    });

    it('should disable next button when on last page', () => {
      const lastPageData = { ...mockPaginationData, page: 10, hasNextPage: false };
      
      render(
        <PaginationControls
          data={lastPageData}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toHaveClass('pointer-events-none', 'opacity-50', 'cursor-not-allowed');
    });
  });

  describe('Page number display', () => {
    it('should show ellipsis when there are many pages', () => {
      const manyPagesData = { ...mockPaginationData, totalPages: 20, page: 10 };
      
      render(
        <PaginationControls
          data={manyPagesData}
          onPageChange={mockOnPageChange}
        />
      );

      const ellipsisElements = screen.getAllByText('...');
      expect(ellipsisElements.length).toBeGreaterThan(0);
    });

    it('should show correct page numbers around current page', () => {
      const middlePageData = { ...mockPaginationData, page: 5, hasPreviousPage: true };
      
      render(
        <PaginationControls
          data={middlePageData}
          onPageChange={mockOnPageChange}
        />
      );

      // Should show pages around current page (5)
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should highlight current page', () => {
      const currentPageData = { ...mockPaginationData, page: 3, hasPreviousPage: true };
      
      render(
        <PaginationControls
          data={currentPageData}
          onPageChange={mockOnPageChange}
        />
      );

      const currentPageButton = screen.getByText('3');
      expect(currentPageButton).toHaveClass('bg-primary', 'text-primary-foreground', 'shadow-lg');
    });
  });

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      render(
        <PaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
          className="custom-pagination"
        />
      );

      const container = screen.getByText('显示').closest('.space-y-4');
      expect(container).toHaveClass('custom-pagination');
    });

    it('should hide info when showInfo is false', () => {
      render(
        <PaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
          showInfo={false}
        />
      );

      expect(screen.queryByText('显示')).not.toBeInTheDocument();
      expect(screen.queryByText('条，共')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle single page correctly', () => {
      const singlePageData = { ...mockPaginationData, totalPages: 1 };
      
      const { container } = render(
        <PaginationControls
          data={singlePageData}
          onPageChange={mockOnPageChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle zero total count', () => {
      const zeroCountData = { ...mockPaginationData, totalCount: 0, totalPages: 0 };
      
      const { container } = render(
        <PaginationControls
          data={zeroCountData}
          onPageChange={mockOnPageChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should calculate start and end items correctly', () => {
      const page2Data = { ...mockPaginationData, page: 2, hasPreviousPage: true };
      
      render(
        <PaginationControls
          data={page2Data}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('11')).toBeInTheDocument(); // startItem = (2-1) * 10 + 1 = 11
      expect(screen.getByText('20')).toBeInTheDocument(); // endItem = 2 * 10 = 20
    });
  });
});

describe('CompactPaginationControls Component', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render compact pagination controls', () => {
      render(
        <CompactPaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('第')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('页，共')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('页')).toBeInTheDocument();
    });

    it('should not render when totalPages is 1', () => {
      const singlePageData = { ...mockPaginationData, totalPages: 1 };
      
      const { container } = render(
        <CompactPaginationControls
          data={singlePageData}
          onPageChange={mockOnPageChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should call onPageChange when next button is clicked', () => {
      render(
        <CompactPaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when previous button is clicked', () => {
      const dataWithPrevious = { ...mockPaginationData, page: 2, hasPreviousPage: true };
      
      render(
        <CompactPaginationControls
          data={dataWithPrevious}
          onPageChange={mockOnPageChange}
        />
      );

      const previousButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(previousButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('should disable previous button when on first page', () => {
      render(
        <CompactPaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
        />
      );

      const previousButton = screen.getByRole('button', { name: /previous/i });
      expect(previousButton).toHaveClass('pointer-events-none', 'opacity-50');
    });

    it('should disable next button when on last page', () => {
      const lastPageData = { ...mockPaginationData, page: 10, hasNextPage: false };
      
      render(
        <CompactPaginationControls
          data={lastPageData}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toHaveClass('pointer-events-none', 'opacity-50');
    });
  });

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      render(
        <CompactPaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
          className="custom-compact"
        />
      );

      const container = screen.getByText('第').closest('.flex');
      expect(container).toHaveClass('custom-compact');
    });
  });
}); 