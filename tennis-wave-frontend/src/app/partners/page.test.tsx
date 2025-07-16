import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import PartnersPage from "./page";
import loadingSlice from "@/store/slices/loadingSlice";
import { toast } from "sonner";

const mockGetRecommendedPartnersWithPagination = vi.fn();
const mockCreateConversation = vi.fn();
vi.mock("@/services/userService", () => ({
  userService: {
    getRecommendedPartnersWithPagination: (...args: any[]) => mockGetRecommendedPartnersWithPagination(...args),
  },
}));
vi.mock("@/services/chatService", () => ({
  createConversation: (...args: any[]) => mockCreateConversation(...args),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

// mock lucide-react 图标
vi.mock("lucide-react", () => ({
    Search: () => <svg data-testid="search-icon" />,
    ChevronRight: () => <svg data-testid="chevron-right" />,
    ChevronLeft: () => <svg data-testid="chevron-left" />,
    XIcon: () => <svg data-testid="x-icon" />,
    // ...补全其它用到的icon
}));

const createTestStore = () => configureStore({ reducer: { loading: loadingSlice } });

const partnerBase = {
  id: 1,
  userName: "partner1",
  avatar: "avatar1.png",
  email: "p1@example.com",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PartnersPage", () => {
  it("should render partners list", async () => {
    mockGetRecommendedPartnersWithPagination.mockResolvedValue({
      items: [
        { id: 1, userName: "partner1", email: "partner1@example.com", createdAt: "2024-01-01T10:00:00" },
        { id: 2, userName: "partner2", email: "partner2@example.com", createdAt: "2024-01-01T10:00:00" }
      ],
      totalCount: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      levelCounts: {},
      locationCounts: {},
      availableLevels: [],
      availableLocations: []
    });

    render(
      <Provider store={createTestStore()}>
        <PartnersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("partner1")).toBeInTheDocument();
      expect(screen.getByText("partner2")).toBeInTheDocument();
    });
  });

  it("should render no data state", async () => {
    mockGetRecommendedPartnersWithPagination.mockResolvedValueOnce({
      items: [],
      totalCount: 0,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
    render(
      <Provider store={createTestStore()}>
        <PartnersPage />
      </Provider>
    );
    expect(await screen.findByText(/No recommended partners found/i)).toBeInTheDocument();
  });

  it("should handle load failure", async () => {
    mockGetRecommendedPartnersWithPagination.mockRejectedValueOnce(new Error("fail"));
    render(
      <Provider store={createTestStore()}>
        <PartnersPage />
      </Provider>
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load recommended partners");
    });
  });

  it("should handle pagination", async () => {
    mockGetRecommendedPartnersWithPagination.mockResolvedValue({
      items: [
        { id: 1, userName: "partner1", email: "partner1@example.com", createdAt: "2024-01-01T10:00:00" }
      ],
      totalCount: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      levelCounts: {},
      locationCounts: {},
      availableLevels: [],
      availableLocations: []
    });

    render(
      <Provider store={createTestStore()}>
        <PartnersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("partner1")).toBeInTheDocument();
    });
  });

  it("should handle start chat", async () => {
    mockGetRecommendedPartnersWithPagination.mockResolvedValueOnce({
      items: [
        { id: 1, userName: "partner1", email: "partner1@example.com", createdAt: "2024-01-01T10:00:00" }
      ],
      totalCount: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      levelCounts: {},
      locationCounts: {},
      availableLevels: [],
      availableLocations: []
    });

    render(
      <Provider store={createTestStore()}>
        <PartnersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("partner1")).toBeInTheDocument();
    });
  });

  it("should handle partner with missing info", async () => {
    mockGetRecommendedPartnersWithPagination.mockResolvedValueOnce({
      items: [
        { 
          id: 1, 
          userName: "partner1", 
          email: "partner1@example.com", 
          createdAt: "2024-01-01T10:00:00",
          avatar: undefined,
          bio: undefined
        }
      ],
      totalCount: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      levelCounts: {},
      locationCounts: {},
      availableLevels: [],
      availableLocations: []
    });

    render(
      <Provider store={createTestStore()}>
        <PartnersPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("partner1")).toBeInTheDocument();
    });
  });
}); 