import { describe, it, expect, vi, beforeEach } from "vitest";
import { tennisBookingService } from "./tennisBookingService";
import axiosInstance from "./axiosInstance";

// Mock axiosInstance
vi.mock("./axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockAxios = axiosInstance as any;

const mockData = { data: { data: "ok" } };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("tennisBookingService", () => {
  it("should getBookings", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getBookings();
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalledWith("/api/tennisbooking");
  });

  it("should getBookingsWithPagination", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getBookingsWithPagination(2, 10, "time", true);
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalled();
  });

  it("should getAvailableBookingsWithPagination", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getAvailableBookingsWithPagination(1, 5);
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalled();
  });

  it("should getMyBookingsWithPagination", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getMyBookingsWithPagination(1, 5);
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalled();
  });

  it("should getRecommendedBookingsWithPagination", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getRecommendedBookingsWithPagination(1, 5);
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalled();
  });

  it("should getBookingById", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getBookingById(123);
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalledWith("/api/tennisbooking/123");
  });

  it("should getAvailableBookings", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getAvailableBookings();
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalledWith("/api/tennisbooking/available");
  });

  it("should getMyBookings", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getMyBookings();
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalledWith("/api/tennisbooking/my-bookings");
  });

  it("should getBookingsByType", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getBookingsByType(1);
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalled();
  });

  it("should getBookingsByStatus", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getBookingsByStatus(2);
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalled();
  });

  it("should getBookingsByLocation", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getBookingsByLocation("loc");
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalled();
  });

  it("should createBooking", async () => {
    mockAxios.post.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.createBooking({} as any);
    expect(res).toBe("ok");
    expect(mockAxios.post).toHaveBeenCalled();
  });

  it("should updateBooking", async () => {
    mockAxios.put.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.updateBooking(1, {} as any);
    expect(res).toBe("ok");
    expect(mockAxios.put).toHaveBeenCalled();
  });

  it("should deleteBooking", async () => {
    mockAxios.delete.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.deleteBooking(1);
    expect(res).toBe("ok");
    expect(mockAxios.delete).toHaveBeenCalled();
  });

  it("should joinBooking", async () => {
    mockAxios.post.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.joinBooking(1);
    expect(res).toBe("ok");
    expect(mockAxios.post).toHaveBeenCalled();
  });

  it("should leaveBooking", async () => {
    mockAxios.post.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.leaveBooking(1);
    expect(res).toBe("ok");
    expect(mockAxios.post).toHaveBeenCalled();
  });

  it("should confirmParticipant", async () => {
    mockAxios.post.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.confirmParticipant(1, 2);
    expect(res).toBe("ok");
    expect(mockAxios.post).toHaveBeenCalled();
  });

  it("should declineParticipant", async () => {
    mockAxios.post.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.declineParticipant(1, 2);
    expect(res).toBe("ok");
    expect(mockAxios.post).toHaveBeenCalled();
  });

  it("should requestToJoin", async () => {
    mockAxios.post.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.requestToJoin(1, {} as any);
    expect(res).toBe("ok");
    expect(mockAxios.post).toHaveBeenCalled();
  });

  it("should respondToRequest", async () => {
    mockAxios.post.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.respondToRequest(1, {} as any);
    expect(res).toBe("ok");
    expect(mockAxios.post).toHaveBeenCalled();
  });

  it("should getRequestsByBookingId", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getRequestsByBookingId(1);
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalled();
  });

  it("should getMyRequests", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getMyRequests();
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalled();
  });

  it("should getRecommendedBookings", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getRecommendedBookings();
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalled();
  });

  it("should searchBookings", async () => {
    mockAxios.post.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.searchBookings({} as any);
    expect(res).toBe("ok");
    expect(mockAxios.post).toHaveBeenCalled();
  });

  it("should getBookingStatistics", async () => {
    mockAxios.get.mockResolvedValueOnce(mockData);
    const res = await tennisBookingService.getBookingStatistics();
    expect(res).toBe("ok");
    expect(mockAxios.get).toHaveBeenCalled();
  });

  // 异常分支
  it("should throw on getBookings error", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("fail"));
    await expect(tennisBookingService.getBookings()).rejects.toThrow("fail");
  });
  it("should throw on createBooking error", async () => {
    mockAxios.post.mockRejectedValueOnce(new Error("fail"));
    await expect(tennisBookingService.createBooking({} as any)).rejects.toThrow("fail");
  });
  it("should throw on deleteBooking error", async () => {
    mockAxios.delete.mockRejectedValueOnce(new Error("fail"));
    await expect(tennisBookingService.deleteBooking(1)).rejects.toThrow("fail");
  });
}); 