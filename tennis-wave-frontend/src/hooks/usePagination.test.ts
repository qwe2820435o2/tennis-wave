import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "./usePagination";

describe("usePagination", () => {
    it("should initialize with default values", () => {
        const testData = [1, 2, 3, 4, 5];
        const { result } = renderHook(() => usePagination(testData));
        
        expect(result.current.currentPage).toBe(1);
        expect(result.current.pageSize).toBe(10);
        expect(result.current.totalItems).toBe(5);
        expect(result.current.totalPages).toBe(1);
        expect(result.current.hasNextPage).toBe(false);
        expect(result.current.hasPrevPage).toBe(false);
    });

    it("should change page", () => {
        const testData = Array.from({ length: 25 }, (_, i) => i + 1);
        const { result } = renderHook(() => usePagination(testData, { pageSize: 10 }));
        
        act(() => {
            result.current.goToPage(2);
        });
        
        expect(result.current.currentPage).toBe(2);
        expect(result.current.hasPrevPage).toBe(true);
        expect(result.current.hasNextPage).toBe(true);
    });
}); 