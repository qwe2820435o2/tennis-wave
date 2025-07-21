import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import MyBookingsPage from "./page";
import loadingSlice from "@/store/slices/loadingSlice";
import userSlice from "@/store/slices/userSlice";
import { BookingStatus, BookingType, SkillLevel } from "@/types/tennisBooking";
import { toast } from "sonner";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockShowLoading = vi.fn();
const mockHideLoading = vi.fn();
vi.mock("@/store/slices/loadingSlice", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    showLoading: (...args: any[]) => { mockShowLoading(...args); return { type: "loading/showLoading" }; },
    hideLoading: (...args: any[]) => { mockHideLoading(...args); return { type: "loading/hideLoading" }; },
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockGetMyBookings = vi.fn();
const mockDeleteBooking = vi.fn();
vi.mock("@/services/tennisBookingService", () => ({
  tennisBookingService: {
    getMyBookings: (...args: any[]) => mockGetMyBookings(...args),
    deleteBooking: (...args: any[]) => mockDeleteBooking(...args),
  },
}));

const user: any = { userId: 1, userName: "test", email: "test@example.com", token: "token", isHydrated: true };
const createTestStore = (userOverride = {}) => {
  return configureStore({
    reducer: { loading: loadingSlice, user: userSlice },
    preloadedState: { user: { ...user, ...userOverride } },
  });
};

const bookingBase = {
  id: 101,
  title: "Test Booking",
  description: "desc",
  bookingTime: new Date().toISOString(),
  location: "Court 1",
  type: BookingType.Casual,
  status: BookingStatus.Confirmed,
  minSkillLevel: SkillLevel.Beginner,
  maxSkillLevel: SkillLevel.Advanced,
  maxParticipants: 4,
  currentParticipants: 2,
  isFlexible: false,
  creatorId: 1,
  createdAt: new Date().toISOString(),
  creator: user,
  participants: [],
  requests: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MyBookingsPage", () => {
  it("should render empty state and create button when no bookings", async () => {
    mockGetMyBookings.mockResolvedValueOnce([]);
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MyBookingsPage />
      </Provider>
    );
    expect(await screen.findByText(/You have not created any bookings yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Your First Booking/i })).toBeInTheDocument();
  });

  it("should render created bookings with organizer actions", async () => {
    mockGetMyBookings.mockResolvedValueOnce([
      { ...bookingBase, participants: [], creatorId: 1, title: "My Created Booking" },
    ]);
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MyBookingsPage />
      </Provider>
    );
    expect(await screen.findByText(/My Created Booking/i)).toBeInTheDocument();
    expect(screen.getByText(/Organizer/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View Details/i })).toBeInTheDocument();
  });

  it("should render participated bookings without organizer actions", async () => {
    mockGetMyBookings.mockResolvedValueOnce([
      { ...bookingBase, id: 102, creatorId: 2, title: "Joined Booking", participants: [{ userId: 1, id: 1, bookingId: 102, status: 2, joinedAt: '', user: user }] },
    ]);
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MyBookingsPage />
      </Provider>
    );
    expect(await screen.findByText(/Joined Booking/i)).toBeInTheDocument();
    expect(screen.queryByText(/Organizer/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Delete/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View Details/i })).toBeInTheDocument();
  });

  it("should handle delete booking success", async () => {
    mockGetMyBookings.mockResolvedValueOnce([
      { ...bookingBase, id: 103, creatorId: 1, title: "Delete Me" },
    ]);
    mockDeleteBooking.mockResolvedValueOnce(true);
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MyBookingsPage />
      </Provider>
    );
    expect(await screen.findByText(/Delete Me/i)).toBeInTheDocument();
    // First click the Delete button on the card
    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
    // Then click the Delete button in the modal
    const deleteButtons = await screen.findAllByRole("button", { name: /Delete/i });
    expect(deleteButtons.length).toBeGreaterThan(1);
    fireEvent.click(deleteButtons[1]);
    await waitFor(() => {
      expect(mockDeleteBooking).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Booking deleted successfully");
    });
  });

  it("should handle delete booking failure", async () => {
    mockGetMyBookings.mockResolvedValueOnce([
      { ...bookingBase, id: 104, creatorId: 1, title: "Delete Fail" },
    ]);
    mockDeleteBooking.mockRejectedValueOnce(new Error("fail"));
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MyBookingsPage />
      </Provider>
    );
    expect(await screen.findByText(/Delete Fail/i)).toBeInTheDocument();
    // First click the Delete button on the card
    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
    // Then click the Delete button in the modal
    const deleteButtons = await screen.findAllByRole("button", { name: /Delete/i });
    expect(deleteButtons.length).toBeGreaterThan(1);
    fireEvent.click(deleteButtons[1]);
    await waitFor(() => {
      expect(mockDeleteBooking).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Failed to delete booking");
    });
  });

  it("should handle load bookings failure", async () => {
    mockGetMyBookings.mockRejectedValueOnce(new Error("fail"));
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MyBookingsPage />
      </Provider>
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load bookings");
    });
  });

  it("should show loading state when loading bookings", async () => {
    let resolve: any;
    mockGetMyBookings.mockReturnValue(new Promise(r => { resolve = r; }));
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MyBookingsPage />
      </Provider>
    );
    expect(mockShowLoading).toHaveBeenCalled();
    resolve([]);
    await waitFor(() => {
      expect(mockHideLoading).toHaveBeenCalled();
    });
  });
}); 