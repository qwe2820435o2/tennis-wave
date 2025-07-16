import { describe, it, expect, vi, beforeEach } from "vitest";
import { userService } from "./userService";
import axiosInstance from "./axiosInstance";

// Mock axios instance
vi.mock("./axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should fetch all users successfully", async () => {
      const mockUsers = [
        { id: 1, userName: "user1", email: "user1@example.com" },
        { id: 2, userName: "user2", email: "user2@example.com" },
      ];

      const mockResponse = { data: { data: mockUsers } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await userService.getUsers();

      expect(axiosInstance.get).toHaveBeenCalledWith("/api/user");
      expect(result).toEqual(mockUsers);
    });

    it("should handle error when fetching users fails", async () => {
      const error = new Error("Network error");
      (axiosInstance.get as any).mockRejectedValue(error);

      await expect(userService.getUsers()).rejects.toThrow("Network error");
    });
  });

  describe("getUsersWithPagination", () => {
    it("should fetch users with pagination successfully", async () => {
      const mockResult = {
        items: [
          { id: 1, userName: "user1", email: "user1@example.com" },
          { id: 2, userName: "user2", email: "user2@example.com" },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      const mockResponse = { data: { data: mockResult } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await userService.getUsersWithPagination(1, 20, "userName", false);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/api/user/paginated?page=1&pageSize=20&sortDescending=false&sortBy=userName"
      );
      expect(result).toEqual(mockResult);
    });

    it("should fetch users without sortBy parameter", async () => {
      const mockResult = {
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      const mockResponse = { data: { data: mockResult } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      await userService.getUsersWithPagination(1, 20);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/api/user/paginated?page=1&pageSize=20&sortDescending=false"
      );
    });
  });

  describe("searchUsersWithPagination", () => {
    it("should search users with pagination successfully", async () => {
      const searchParams = {
        query: "test",
        page: 1,
        pageSize: 20,
        sortBy: "userName",
        sortDescending: false,
      };

      const mockResult = {
        items: [{ id: 1, userName: "testuser", email: "test@example.com" }],
        totalCount: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      const mockResponse = { data: { data: mockResult } };
      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const result = await userService.searchUsersWithPagination(searchParams);

      expect(axiosInstance.post).toHaveBeenCalledWith("/api/user/search", searchParams);
      expect(result).toEqual(mockResult);
    });
  });

  describe("getRecommendedPartnersWithPagination", () => {
    it("should fetch recommended partners with pagination", async () => {
      const mockResult = {
        items: [
          { id: 1, userName: "partner1", email: "partner1@example.com" },
          { id: 2, userName: "partner2", email: "partner2@example.com" },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      const mockResponse = { data: { data: mockResult } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await userService.getRecommendedPartnersWithPagination(1, 20);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/api/user/recommended-partners?page=1&pageSize=20"
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getUserById", () => {
    it("should fetch user by ID successfully", async () => {
      const mockUser = { id: 1, userName: "testuser", email: "test@example.com" };
      const mockResponse = { data: { data: mockUser } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await userService.getUserById(1);

      expect(axiosInstance.get).toHaveBeenCalledWith("/api/user/1");
      expect(result).toEqual(mockUser);
    });

    it("should handle error when user not found", async () => {
      const error = new Error("User not found");
      (axiosInstance.get as any).mockRejectedValue(error);

      await expect(userService.getUserById(999)).rejects.toThrow("User not found");
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      const userData = {
        userName: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const mockUser = { id: 1, userName: "newuser", email: "newuser@example.com" };
      const mockResponse = { data: { data: mockUser } };
      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const result = await userService.createUser(userData);

      expect(axiosInstance.post).toHaveBeenCalledWith("/api/user", userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const userData = {
        userName: "updateduser",
        email: "updated@example.com",
      };

      const mockUser = { id: 1, userName: "updateduser", email: "updated@example.com" };
      const mockResponse = { data: { data: mockUser } };
      (axiosInstance.put as any).mockResolvedValue(mockResponse);

      const result = await userService.updateUser(1, userData);

      expect(axiosInstance.put).toHaveBeenCalledWith("/api/user/1", userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const mockResponse = { data: { success: true } };
      (axiosInstance.delete as any).mockResolvedValue(mockResponse);

      await userService.deleteUser(1);

      expect(axiosInstance.delete).toHaveBeenCalledWith("/api/user/1");
    });

    it("should handle error when deleting user fails", async () => {
      const error = new Error("Delete failed");
      (axiosInstance.delete as any).mockRejectedValue(error);

      await expect(userService.deleteUser(1)).rejects.toThrow("Delete failed");
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const passwordData = {
        currentPassword: "oldpassword",
        newPassword: "newpassword",
      };

      const mockResponse = { data: { data: true } };
      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const result = await userService.changePassword(1, passwordData);

      expect(axiosInstance.post).toHaveBeenCalledWith("/api/user/1/change-password", passwordData);
      expect(result).toBe(true);
    });
  });

  describe("checkEmailUnique", () => {
    it("should check email uniqueness successfully", async () => {
      const mockResponse = { data: { data: true } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await userService.checkEmailUnique("test@example.com");

      expect(axiosInstance.get).toHaveBeenCalledWith("/api/user/check-email?email=test%40example.com");
      expect(result).toBe(true);
    });

    it("should check email uniqueness with excludeUserId", async () => {
      const mockResponse = { data: { data: false } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await userService.checkEmailUnique("test@example.com", 1);

      expect(axiosInstance.get).toHaveBeenCalledWith("/api/user/check-email?email=test%40example.com&excludeUserId=1");
      expect(result).toBe(false);
    });
  });

  describe("checkUsernameUnique", () => {
    it("should check username uniqueness successfully", async () => {
      const mockResponse = { data: { data: true } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await userService.checkUsernameUnique("testuser");

      expect(axiosInstance.get).toHaveBeenCalledWith("/api/user/check-username?userName=testuser");
      expect(result).toBe(true);
    });

    it("should check username uniqueness with excludeUserId", async () => {
      const mockResponse = { data: { data: false } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await userService.checkUsernameUnique("testuser", 1);

      expect(axiosInstance.get).toHaveBeenCalledWith("/api/user/check-username?userName=testuser&excludeUserId=1");
      expect(result).toBe(false);
    });
  });

  describe("searchUsers", () => {
    it("should search users successfully", async () => {
      const mockUsers = [
        { id: 1, userName: "testuser", email: "test@example.com" },
      ];

      const mockResponse = { data: { data: mockUsers } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await userService.searchUsers("test");

      expect(axiosInstance.get).toHaveBeenCalledWith("/api/user/search-simple?query=test");
      expect(result).toEqual(mockUsers);
    });

    it("should handle special characters in search query", async () => {
      const mockUsers: any[] = [];
      const mockResponse = { data: { data: mockUsers } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      await userService.searchUsers("test@example.com");

      expect(axiosInstance.get).toHaveBeenCalledWith("/api/user/search-simple?query=test%40example.com");
    });
  });

  describe("getRecommendedPartners", () => {
    it("should fetch recommended partners successfully", async () => {
      const mockPartners = [
        { id: 1, userName: "partner1", email: "partner1@example.com" },
        { id: 2, userName: "partner2", email: "partner2@example.com" },
      ];

      const mockResponse = { data: { data: mockPartners } };
      (axiosInstance.get as any).mockResolvedValue(mockResponse);

      const result = await userService.getRecommendedPartners();

      expect(axiosInstance.get).toHaveBeenCalledWith("/api/user/recommended-partners");
      expect(result).toEqual(mockPartners);
    });
  });
}); 