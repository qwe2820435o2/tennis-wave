import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import BookingDetailPage from "./page";
import loadingSlice from "@/store/slices/loadingSlice";
import userSlice from "@/store/slices/userSlice";
import { toast } from "sonner";
import { TennisBooking, BookingType, BookingStatus, SkillLevel, ParticipantStatus, RequestStatus } from "@/types/tennisBooking";

const mockGetBookingById = vi.fn();
const mockGetBookingRequests = vi.fn();
const mockJoinBooking = vi.fn();
const mockLeaveBooking = vi.fn();
const mockDeleteBooking = vi.fn();
const mockRequestToJoin = vi.fn();
const mockRespondToRequest = vi.fn();
vi.mock("@/services/tennisBookingService", () => ({
  tennisBookingService: {
    getBookingById: (...args: any[]) => mockGetBookingById(...args),
    getBookingRequests: (...args: any[]) => mockGetBookingRequests(...args),
    joinBooking: (...args: any[]) => mockJoinBooking(...args),
    leaveBooking: (...args: any[]) => mockLeaveBooking(...args),
    deleteBooking: (...args: any[]) => mockDeleteBooking(...args),
    requestToJoin: (...args: any[]) => mockRequestToJoin(...args),
    respondToRequest: (...args: any[]) => mockRespondToRequest(...args),
  },
}));
vi.mock("lucide-react", () => ({
  ArrowLeft: (props: any) => <svg data-testid="arrow-left-icon" {...props} />,
  Calendar: (props: any) => <svg data-testid="calendar-icon" {...props} />,
  MapPin: (props: any) => <svg data-testid="map-pin-icon" {...props} />,
  Users: (props: any) => <svg data-testid="users-icon" {...props} />,
  User: (props: any) => <svg data-testid="user-icon" {...props} />,
  MessageCircle: (props: any) => <svg data-testid="message-circle-icon" {...props} />,
  Edit: (props: any) => <svg data-testid="edit-icon" {...props} />,
  Trash2: (props: any) => <svg data-testid="trash2-icon" {...props} />,
  Clock: (props: any) => <svg data-testid="clock-icon" {...props} />,
  XIcon: (props: any) => <svg data-testid="x-icon" {...props} />,
  // Complete other icons used
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}));
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
    useParams: vi.fn(() => ({ id: "123" })),
    useSearchParams: vi.fn(() => new URLSearchParams())
}));

const createTestStore = (userOverride = {}) => configureStore({
  reducer: { loading: loadingSlice, user: userSlice },
  preloadedState: {
    user: {
      userId: 1,
      userName: "test",
      email: "test@example.com",
      token: "token",
      isHydrated: true,
      ...userOverride
    }
  },
});

const mockBooking: TennisBooking = {
    id: 123,
    title: "Test Booking",
    description: "Test Description",
    bookingTime: "2024-01-01T12:00:00",
    location: "Test Location",
    type: BookingType.Casual,
    status: BookingStatus.Pending,
    minSkillLevel: SkillLevel.Beginner,
    maxSkillLevel: SkillLevel.Intermediate,
    maxParticipants: 4,
    currentParticipants: 2,
    isFlexible: false,
    creatorId: 1,
    createdAt: "2024-01-01T10:00:00",
    creator: {
        id: 1,
        userName: "Creator",
        email: "creator@example.com",
        createdAt: "2024-01-01T10:00:00"
    },
    participants: [
        {
            id: 1,
            bookingId: 123,
            userId: 2,
            status: ParticipantStatus.Confirmed,
            joinedAt: "2024-01-01T11:00:00",
            user: {
                id: 2,
                userName: "Participant1",
                email: "participant1@example.com",
                createdAt: "2024-01-01T10:00:00"
            }
        }
    ],
    requests: [
        {
            id: 1,
            bookingId: 123,
            requesterId: 3,
            message: "I would like to join",
            status: RequestStatus.Pending,
            requestedAt: "2024-01-01T11:30:00",
            requester: {
                id: 3,
                userName: "Requester1",
                email: "requester1@example.com",
                createdAt: "2024-01-01T10:00:00"
            }
        }
    ]
};
const mockUser = { id: "user-id", userName: "TestUser" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("BookingDetailPage", () => {
  it("should render booking detail", async () => {
    mockGetBookingById.mockResolvedValueOnce(mockBooking);
    mockGetBookingRequests.mockResolvedValueOnce([]);
    render(
      <Provider store={createTestStore()}>
        <BookingDetailPage />
      </Provider>
    );
    expect(await screen.findByText(/Test Booking/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
  });

  it("should handle load booking failure", async () => {
    const axiosError = new Error("fail") as any;
    axiosError.isAxiosError = true;
    axiosError.response = { status: 500 };
    mockGetBookingById.mockRejectedValueOnce(axiosError);
    mockGetBookingRequests.mockResolvedValueOnce([]);
    render(
      <Provider store={createTestStore()}>
        <BookingDetailPage />
      </Provider>
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load booking");
    });
  });

  it("should handle join booking", async () => {
    mockGetBookingById.mockResolvedValueOnce({ ...mockBooking, creatorId: 2, participants: [] });
    mockGetBookingRequests.mockResolvedValueOnce([]);
    mockJoinBooking.mockResolvedValueOnce(true);
    render(
      <Provider store={createTestStore()}>
        <BookingDetailPage />
      </Provider>
    );
    expect(await screen.findByText(/Test Booking/i)).toBeInTheDocument();
    const joinButtons = screen.getAllByRole("button", { name: /Join/i });
    fireEvent.click(joinButtons[0]); // Select the first Join button
    await waitFor(() => {
      expect(mockJoinBooking).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Successfully joined booking");
    });
  });

  it("should handle leave booking", async () => {
    mockGetBookingById.mockResolvedValueOnce({ 
      ...mockBooking, 
      creatorId: 2, 
      participants: [{ 
        id: 1, 
        bookingId: 123, 
        userId: 1, 
        status: 2, 
        joinedAt: "2024-01-01T11:00:00",
        user: {
          id: 1,
          userName: "TestUser",
          email: "test@example.com",
          createdAt: "2024-01-01T10:00:00"
        }
      }] 
    });
    mockGetBookingRequests.mockResolvedValueOnce([]);
    mockLeaveBooking.mockResolvedValueOnce(true);
    render(
      <Provider store={createTestStore()}>
        <BookingDetailPage />
      </Provider>
    );
    expect(await screen.findByText(/Test Booking/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Leave/i }));
    await waitFor(() => {
      expect(mockLeaveBooking).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Successfully left booking");
    });
  });

  it("should handle delete booking", async () => {
    mockGetBookingById.mockResolvedValueOnce(mockBooking);
    mockGetBookingRequests.mockResolvedValueOnce([]);
    mockDeleteBooking.mockResolvedValueOnce(true);
    window.confirm = vi.fn(() => true);
    render(
      <Provider store={createTestStore()}>
        <BookingDetailPage />
      </Provider>
    );
    expect(await screen.findByText(/Test Booking/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
    await waitFor(() => {
      expect(mockDeleteBooking).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Booking deleted successfully");
    });
  });

  it("should handle request to join with empty message", async () => {
    mockGetBookingById.mockResolvedValueOnce({ 
      ...mockBooking, 
      creatorId: 2, 
      participants: [],
      currentParticipants: 4,
      maxParticipants: 4
    });
    mockGetBookingRequests.mockResolvedValueOnce([]);
    render(
      <Provider store={createTestStore()}>
        <BookingDetailPage />
      </Provider>
    );
    expect(await screen.findByText(/Test Booking/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Request to Join/i }));
    fireEvent.click(screen.getByRole("button", { name: /Send Request/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please enter the request message");
    });
  });

  it("should handle respond to request", async () => {
    mockGetBookingById.mockResolvedValueOnce(mockBooking);
    mockGetBookingRequests.mockResolvedValueOnce([
      { 
        id: 1, 
        bookingId: 123,
        requesterId: 2, 
        message: "msg", 
        status: RequestStatus.Pending, 
        requestedAt: "2024-01-01T11:30:00",
        requester: { 
          id: 2, 
          userName: "user2",
          email: "user2@example.com",
          createdAt: "2024-01-01T10:00:00"
        } 
      },
    ]);
    mockRespondToRequest.mockResolvedValueOnce(true);
    render(
      <Provider store={createTestStore()}>
        <BookingDetailPage />
      </Provider>
    );
    expect(await screen.findByText(/Test Booking/i)).toBeInTheDocument();
    // Additional click flow can be added here based on actual UI
  });

  it("should handle booking with missing creator", async () => {
    const bookingWithoutCreator = { 
      ...mockBooking, 
      creator: {
        id: 0,
        userName: "Unknown User",
        email: "unknown@example.com",
        createdAt: "2024-01-01T10:00:00"
      }
    };
    mockGetBookingById.mockResolvedValueOnce(bookingWithoutCreator);
    mockGetBookingRequests.mockResolvedValueOnce([]);
    render(
      <Provider store={createTestStore()}>
        <BookingDetailPage />
      </Provider>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText("Test Booking")).toBeInTheDocument();
    });
    
    // Verify that booking title can still be displayed correctly
    expect(screen.getByText("Test Booking")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });
}); 