"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationResult } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";

interface PaginationControlsProps<T> {
  data: PaginationResult<T>;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
}

export function PaginationControls<T>({
  data,
  onPageChange,
  className,
  showInfo = true,
}: PaginationControlsProps<T>) {
  const { page, totalPages, hasNextPage, hasPreviousPage, totalCount, pageSize } = data;

  if (totalPages <= 1) {
    return null;
  }

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Pagination Info */}
      {showInfo && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span>显示</span>
            <span className="font-medium text-foreground">{startItem}</span>
            <span>到</span>
            <span className="font-medium text-foreground">{endItem}</span>
            <span>条，共</span>
            <span className="font-medium text-foreground">{totalCount}</span>
            <span>条记录</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>第</span>
            <span className="font-medium text-foreground">{page}</span>
            <span>页，共</span>
            <span className="font-medium text-foreground">{totalPages}</span>
            <span>页</span>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination className="w-full">
        <PaginationContent className="flex items-center justify-center space-x-2">
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(page - 1)}
              className={cn(
                "transition-all duration-200 hover:scale-105",
                !hasPreviousPage 
                  ? "pointer-events-none opacity-50 cursor-not-allowed" 
                  : "cursor-pointer hover:bg-primary/10"
              )}
            />
          </PaginationItem>

          {/* Page Numbers */}
          {getVisiblePages().map((pageNumber, index) => (
            <PaginationItem key={index}>
              {pageNumber === "..." ? (
                <PaginationEllipsis className="text-muted-foreground" />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(pageNumber as number)}
                  isActive={page === pageNumber}
                  className={cn(
                    "transition-all duration-200 hover:scale-105",
                    page === pageNumber
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-primary/10 cursor-pointer"
                  )}
                >
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(page + 1)}
              className={cn(
                "transition-all duration-200 hover:scale-105",
                !hasNextPage 
                  ? "pointer-events-none opacity-50 cursor-not-allowed" 
                  : "cursor-pointer hover:bg-primary/10"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

// 简化版分页组件，用于移动端或紧凑布局
export function CompactPaginationControls<T>({
  data,
  onPageChange,
  className,
}: PaginationControlsProps<T>) {
  const { page, totalPages, hasNextPage, hasPreviousPage } = data;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <PaginationPrevious
        onClick={() => onPageChange(page - 1)}
        className={cn(
          "transition-all duration-200",
          !hasPreviousPage 
            ? "pointer-events-none opacity-50" 
            : "cursor-pointer hover:scale-105"
        )}
      />
      
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-muted-foreground">第</span>
        <span className="font-medium">{page}</span>
        <span className="text-muted-foreground">页，共</span>
        <span className="font-medium">{totalPages}</span>
        <span className="text-muted-foreground">页</span>
      </div>

      <PaginationNext
        onClick={() => onPageChange(page + 1)}
        className={cn(
          "transition-all duration-200",
          !hasNextPage 
            ? "pointer-events-none opacity-50" 
            : "cursor-pointer hover:scale-105"
        )}
      />
    </div>
  );
} 