import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import HomePage from "./page";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Volleyball: ({ className }: any) => <span className={className}>🏐</span>,
  Users: ({ className }: any) => <span className={className}>👥</span>,
  MapPin: ({ className }: any) => <span className={className}>📍</span>,
  Calendar: ({ className }: any) => <span className={className}>📅</span>,
  Trophy: ({ className }: any) => <span className={className}>🏆</span>,
  MessageCircle: ({ className }: any) => <span className={className}>💬</span>,
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("HomePage", () => {
  beforeEach(() => {
    // Clear storage before each test
    sessionStorage.clear();
    localStorage.clear();
  });

  describe("Basic rendering", () => {
    it("should render homepage with hero section", () => {
      renderWithProviders(<HomePage />);
      
      expect(screen.getByText("Connect with Tennis")).toBeInTheDocument();
      expect(screen.getByText("Enthusiasts")).toBeInTheDocument();
      expect(screen.getByText(/Find tennis partners, join matches/)).toBeInTheDocument();
    });

    it("should render features section", () => {
      renderWithProviders(<HomePage />);
      
      expect(screen.getByText("Everything You Need for Tennis")).toBeInTheDocument();
      expect(screen.getByText("Find Tennis Partners")).toBeInTheDocument();
      expect(screen.getByText("Discover Courts")).toBeInTheDocument();
      expect(screen.getByText("Schedule Matches")).toBeInTheDocument();
      expect(screen.getByText("Real-time Chat")).toBeInTheDocument();
      expect(screen.getByText("Track Progress")).toBeInTheDocument();
      expect(screen.getByText("Join Tournaments")).toBeInTheDocument();
    });

    it("should render footer", () => {
      renderWithProviders(<HomePage />);
      
      expect(screen.getByText("Tennis Wave")).toBeInTheDocument();
      expect(screen.getByText("Connect with tennis enthusiasts, start your tennis journey")).toBeInTheDocument();
      expect(screen.getByText("© 2025 Tennis Wave. All rights reserved.")).toBeInTheDocument();
    });
  });

  describe("User authentication states", () => {
    it("should show login/register buttons when user is not logged in", () => {
      renderWithProviders(<HomePage />);
      
      expect(screen.getByText("Get Started")).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
      expect(screen.queryByText("Find Bookings")).not.toBeInTheDocument();
      expect(screen.queryByText("My Profile")).not.toBeInTheDocument();
    });

    it("should show user action buttons when user is logged in", () => {
      const mockUser = { userId: 1, userName: "testuser", email: "test@example.com" };
      sessionStorage.setItem("user", JSON.stringify(mockUser));
      
      renderWithProviders(<HomePage />);
      
      expect(screen.getByText("Find Bookings")).toBeInTheDocument();
      expect(screen.getByText("My Profile")).toBeInTheDocument();
      expect(screen.queryByText("Get Started")).not.toBeInTheDocument();
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
    });

    it("should handle invalid user data in storage", () => {
      sessionStorage.setItem("user", "invalid-json");
      
      renderWithProviders(<HomePage />);
      
      // Should fall back to not logged in state
      expect(screen.getByText("Get Started")).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });
  });

  describe("CTA section", () => {
    it("should show CTA button for non-logged in users", () => {
      renderWithProviders(<HomePage />);
      
      expect(screen.getByText("Ready to Start Your Tennis Journey?")).toBeInTheDocument();
      expect(screen.getByText("Join Tennis Wave Today")).toBeInTheDocument();
    });

    it("should not show CTA button for logged in users", () => {
      const mockUser = { userId: 1, userName: "testuser", email: "test@example.com" };
      sessionStorage.setItem("user", JSON.stringify(mockUser));
      
      renderWithProviders(<HomePage />);
      
      expect(screen.getByText("Ready to Start Your Tennis Journey?")).toBeInTheDocument();
      expect(screen.queryByText("Join Tennis Wave Today")).not.toBeInTheDocument();
    });
  });

  describe("Feature descriptions", () => {
    it("should render all feature descriptions", () => {
      renderWithProviders(<HomePage />);
      
      expect(screen.getByText(/Connect with tennis enthusiasts in your area/)).toBeInTheDocument();
      expect(screen.getByText(/Find the best tennis courts near you/)).toBeInTheDocument();
      expect(screen.getByText(/Easily schedule and manage your tennis matches/)).toBeInTheDocument();
      expect(screen.getByText(/Communicate with your tennis partners/)).toBeInTheDocument();
      expect(screen.getByText(/Monitor your tennis journey/)).toBeInTheDocument();
      expect(screen.getByText(/Participate in local tournaments/)).toBeInTheDocument();
    });
  });

  describe("Navigation links", () => {
    it("should have correct links for non-logged in users", () => {
      renderWithProviders(<HomePage />);
      
      const getStartedLink = screen.getByText("Get Started").closest("a");
      const signInLink = screen.getByText("Sign In").closest("a");
      
      expect(getStartedLink).toHaveAttribute("href", "/auth/register");
      expect(signInLink).toHaveAttribute("href", "/auth/login");
    });

    it("should have correct links for logged in users", () => {
      const mockUser = { userId: 1, userName: "testuser", email: "test@example.com" };
      sessionStorage.setItem("user", JSON.stringify(mockUser));
      
      renderWithProviders(<HomePage />);
      
      const findBookingsLink = screen.getByText("Find Bookings").closest("a");
      const myProfileLink = screen.getByText("My Profile").closest("a");
      
      expect(findBookingsLink).toHaveAttribute("href", "/bookings");
      expect(myProfileLink).toHaveAttribute("href", "/profile");
    });
  });
}); 