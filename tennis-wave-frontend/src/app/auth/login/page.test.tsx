import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import LoginPage from "./page";

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Eye: ({ className }: any) => <span className={className}>👁️</span>,
  EyeOff: ({ className }: any) => <span className={className}>👁️‍🗨️</span>,
  Mail: ({ className }: any) => <span className={className}>📧</span>,
  Lock: ({ className }: any) => <span className={className}>🔒</span>,
  Volleyball: ({ className }: any) => <span className={className}>🏐</span>,
}));

// Mock auth service
vi.mock("@/services/authService", () => ({
  login: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("LoginPage", () => {
  const mockInitialState = {
    user: { 
      isHydrated: true, 
      currentUser: null,
      token: null 
    },
    loading: { isLoading: false },
    chat: { conversations: [], messages: {} },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("Basic rendering", () => {
    it("should render login page with title and form", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      expect(screen.getByText("Tennis Wave")).toBeInTheDocument();
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      expect(screen.getByText("Enter your email and password to sign in to your account")).toBeInTheDocument();
    });

    it("should render form inputs", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter your email address")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    });

    it("should render login button", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("should render remember me checkbox", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      expect(screen.getByLabelText("Remember me")).toBeInTheDocument();
    });

    it("should render forgot password link", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      expect(screen.getByText("Forgot password?")).toBeInTheDocument();
      expect(screen.getByText("Forgot password?")).toHaveAttribute("href", "/auth/forgot-password");
    });

    it("should render register link", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      expect(screen.getByText("Do not have an account?")).toBeInTheDocument();
      expect(screen.getByText("Sign up now")).toBeInTheDocument();
      expect(screen.getByText("Sign up now")).toHaveAttribute("href", "/auth/register");
    });
  });

  describe("Form interactions", () => {
    it("should update email input value", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      const emailInput = screen.getByLabelText("Email");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      
      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should update password input value", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      
      expect(passwordInput).toHaveValue("password123");
    });

    it("should toggle password visibility", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      const passwordInput = screen.getByLabelText("Password");
      // 查找密码输入框后面的按钮（眼睛图标）
      const toggleButton = passwordInput.parentElement?.querySelector("button");
      
      expect(toggleButton).toBeInTheDocument();
      
      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute("type", "password");
      
      // Click to show password
      fireEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute("type", "text");
      
      // Click to hide password again
      fireEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should toggle remember me checkbox", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      const rememberCheckbox = screen.getByLabelText("Remember me");
      
      expect(rememberCheckbox).not.toBeChecked();
      
      fireEvent.click(rememberCheckbox);
      expect(rememberCheckbox).toBeChecked();
      
      fireEvent.click(rememberCheckbox);
      expect(rememberCheckbox).not.toBeChecked();
    });
  });

  describe("Form validation", () => {
    it("should require email and password", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      
      expect(emailInput).toHaveAttribute("required");
      expect(passwordInput).toHaveAttribute("required");
    });

    it("should validate email format", () => {
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      const emailInput = screen.getByLabelText("Email");
      expect(emailInput).toHaveAttribute("type", "email");
    });
  });

  describe("Loading state", () => {
    it("should show loading when user is not hydrated", () => {
      // Mock user state to not be hydrated
      const mockStore = {
        user: { isHydrated: false },
        loading: { isLoading: false },
        chat: { conversations: [], messages: {} },
      };
      
      renderWithProviders(<LoginPage />, { preloadedState: mockStore });
      
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("Auto-redirect", () => {
    it("should redirect to home if user is already logged in", () => {
      localStorage.setItem("token", "mock-token");
      localStorage.setItem("user", JSON.stringify({ userId: 1, userName: "test" }));
      
      const mockStore = {
        user: { isHydrated: true, currentUser: { userId: 1, userName: "test" } },
        loading: { isLoading: false },
        chat: { conversations: [], messages: {} },
      };
      
      renderWithProviders(<LoginPage />, { preloadedState: mockStore });
      
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  describe("Form submission", () => {
    it("should handle successful login", async () => {
      const { login } = await import("@/services/authService");
      const mockLoginResult = {
        token: "mock-token",
        userId: 1,
        userName: "testuser",
        email: "test@example.com",
      };
      (login as any).mockResolvedValue(mockLoginResult);
      
      const { toast } = await import("sonner");
      
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      // Fill form
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
      
      // Submit form
      fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));
      
      await waitFor(() => {
        expect(login).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Login Successful", {
          description: "Welcome back, testuser!",
        });
      });
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    it("should handle login error", async () => {
      const { login } = await import("@/services/authService");
      const { toast } = await import("sonner");
      
      (login as any).mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: "Invalid credentials" },
        },
      });
      
      renderWithProviders(<LoginPage />, { preloadedState: mockInitialState });
      
      // Fill form
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrongpassword" } });
      
      // Submit form
      fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Login Failed", {
          description: "Invalid credentials",
        });
      });
    });
  });
}); 