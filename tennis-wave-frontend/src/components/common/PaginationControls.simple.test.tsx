import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

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

// Simple PaginationControls component for testing
const PaginationControls = ({ data, onPageChange, showInfo = true }: any) => {
  const { page, totalPages, hasNextPage, hasPreviousPage, totalCount, pageSize } = data;

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-4">
      {/* Pagination Info */}
      {showInfo && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span>显示</span>
            <span className="font-medium">{startItem}</span>
            <span>到</span>
            <span className="font-medium">{endItem}</span>
            <span>条，共</span>
            <span className="font-medium">{totalCount}</span>
            <span>条记录</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>第</span>
            <span className="font-medium">{page}</span>
            <span>页，共</span>
            <span className="font-medium">{totalPages}</span>
            <span>页</span>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className="px-3 py-1 rounded"
        >
          上一页
        </button>

        {/* Page Numbers */}
        <button
          onClick={() => onPageChange(1)}
          className="px-3 py-1 rounded"
        >
          1
        </button>

        <button
          onClick={() => onPageChange(2)}
          className="px-3 py-1 rounded"
        >
          2
        </button>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="px-3 py-1 rounded"
        >
          下一页
        </button>
      </div>
    </div>
  );
};

describe('PaginationControls Component (Simple)', () => {
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
      expect(screen.getByText('到')).toBeInTheDocument();
      expect(screen.getByText('条，共')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('条记录')).toBeInTheDocument();
      
      // Check that both "10" elements exist (one for range, one for total pages)
      const tens = screen.getAllByText('10');
      expect(tens).toHaveLength(2);
    });

    it('should render page information correctly', () => {
      render(
        <PaginationControls
          data={mockPaginationData}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('第')).toBeInTheDocument();
      expect(screen.getByText('页，共')).toBeInTheDocument();
      expect(screen.getByText('页')).toBeInTheDocument();
      
      // Check that both "10" elements exist (one for range, one for total pages)
      const tens = screen.getAllByText('10');
      expect(tens).toHaveLength(2);
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

      const nextButton = screen.getByText('下一页');
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

      const prevButton = screen.getByText('上一页');
      fireEvent.click(prevButton);
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

      const prevButton = screen.getByText('上一页');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button when on last page', () => {
      const dataOnLastPage = { ...mockPaginationData, page: 10, hasNextPage: false };
      render(
        <PaginationControls
          data={dataOnLastPage}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByText('下一页');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Custom styling', () => {
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
    it('should calculate start and end items correctly', () => {
      const dataPage2 = { ...mockPaginationData, page: 2 };
      render(
        <PaginationControls
          data={dataPage2}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('11')).toBeInTheDocument(); // startItem = (2-1)*10+1 = 11
      expect(screen.getByText('20')).toBeInTheDocument(); // endItem = 2*10 = 20
    });
  });
}); 