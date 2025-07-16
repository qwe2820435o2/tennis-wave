import { describe, it, expect, vi, beforeEach } from "vitest";
import { login, register } from "./authService";
import axiosInstance from "./axiosInstance";

// Mock axios instance
vi.mock("./axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const mockResponse = {
        data: {
          code: 0,
          message: "Success",
          data: {
            userId: 1,
            userName: "testuser",
            email: "test@example.com",
            token: "mock-jwt-token",
          },
        },
      };

      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await login(loginData);

      expect(axiosInstance.post).toHaveBeenCalledWith("/api/Auth/login", loginData);
      expect(result).toEqual({
        userId: 1,
        userName: "testuser",
        email: "test@example.com",
        token: "mock-jwt-token",
      });
    });

    it("should throw error when login fails", async () => {
      const mockResponse = {
        data: {
          code: 1,
          message: "Invalid credentials",
          data: null,
        },
      };

      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      await expect(login(loginData)).rejects.toThrow("Invalid credentials");
      expect(axiosInstance.post).toHaveBeenCalledWith("/api/Auth/login", loginData);
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network error");
      (axiosInstance.post as any).mockRejectedValue(networkError);

      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      await expect(login(loginData)).rejects.toThrow("Network error");
    });

    it("should handle unexpected response format", async () => {
      const mockResponse = {
        data: {
          code: 0,
          message: "Success",
          data: {
            userId: 1,
            userName: "testuser",
            // Missing email and token
          },
        },
      };

      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await login(loginData);

      expect(result).toEqual({
        userId: 1,
        userName: "testuser",
      });
    });
  });

  describe("register", () => {
    it("should successfully register with valid data", async () => {
      const mockResponse = {
        data: {
          code: 0,
          message: "Success",
          data: {
            userId: 1,
            userName: "newuser",
            email: "newuser@example.com",
          },
        },
      };

      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const registerData = {
        userName: "newuser",
        email: "newuser@example.com",
        password: "password123",
        avatar: "avatar1.png",
      };

      const result = await register(registerData);

      expect(axiosInstance.post).toHaveBeenCalledWith("/api/Auth/register", registerData);
      expect(result).toEqual({
        userId: 1,
        userName: "newuser",
        email: "newuser@example.com",
      });
    });

    it("should successfully register without avatar", async () => {
      const mockResponse = {
        data: {
          code: 0,
          message: "Success",
          data: {
            userId: 1,
            userName: "newuser",
            email: "newuser@example.com",
          },
        },
      };

      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const registerData = {
        userName: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const result = await register(registerData);

      expect(axiosInstance.post).toHaveBeenCalledWith("/api/Auth/register", registerData);
      expect(result).toEqual({
        userId: 1,
        userName: "newuser",
        email: "newuser@example.com",
      });
    });

    it("should throw error when registration fails", async () => {
      const mockResponse = {
        data: {
          code: 1,
          message: "Email already exists",
          data: null,
        },
      };

      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const registerData = {
        userName: "existinguser",
        email: "existing@example.com",
        password: "password123",
      };

      await expect(register(registerData)).rejects.toThrow("Email already exists");
      expect(axiosInstance.post).toHaveBeenCalledWith("/api/Auth/register", registerData);
    });

    it("should handle network errors during registration", async () => {
      const networkError = new Error("Network error");
      (axiosInstance.post as any).mockRejectedValue(networkError);

      const registerData = {
        userName: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      await expect(register(registerData)).rejects.toThrow("Network error");
    });

    it("should handle validation errors", async () => {
      const mockResponse = {
        data: {
          code: 1,
          message: "Password must be at least 6 characters",
          data: null,
        },
      };

      (axiosInstance.post as any).mockResolvedValue(mockResponse);

      const registerData = {
        userName: "newuser",
        email: "newuser@example.com",
        password: "123",
      };

      await expect(register(registerData)).rejects.toThrow("Password must be at least 6 characters");
    });
  });

  describe("error handling", () => {
    it("should handle axios error with response", async () => {
      const axiosError = new Error("Server error");
      axiosError.name = "AxiosError";
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        data: {
          code: 1,
          message: "Server error",
        },
      };

      (axiosInstance.post as any).mockRejectedValue(axiosError);

      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      await expect(login(loginData)).rejects.toThrow("Server error");
    });

    it("should handle axios error without response", async () => {
      const axiosError = {
        isAxiosError: true,
        message: "Request timeout",
      };

      (axiosInstance.post as any).mockRejectedValue(axiosError);

      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      await expect(login(loginData)).rejects.toThrow("Request timeout");
    });
  });
}); 