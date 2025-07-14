import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function usePagination(initialPage = 1, initialPageSize = 20) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
  });

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const previousPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({ page: initialPage, pageSize: initialPageSize });
  }, [initialPage, initialPageSize]);

  return {
    pagination,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    goToPage,
    resetPagination,
  };
} 