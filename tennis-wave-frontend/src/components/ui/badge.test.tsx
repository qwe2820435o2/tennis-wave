import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge Component", () => {
  describe("Basic rendering", () => {
    it("should render badge with default variant", () => {
      render(<Badge>Default Badge</Badge>);
      
      const badge = screen.getByText("Default Badge");
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe("SPAN");
      expect(badge).toHaveAttribute("data-slot", "badge");
    });

    it("should render badge with custom className", () => {
      render(<Badge className="custom-class">Custom Badge</Badge>);
      
      const badge = screen.getByText("Custom Badge");
      expect(badge).toHaveClass("custom-class");
    });

    it("should render badge with children", () => {
      render(<Badge>Test Content</Badge>);
      
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render default variant correctly", () => {
      render(<Badge variant="default">Default</Badge>);
      
      const badge = screen.getByText("Default");
      expect(badge).toHaveClass("border-transparent", "bg-primary", "text-primary-foreground");
    });

    it("should render secondary variant correctly", () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      
      const badge = screen.getByText("Secondary");
      expect(badge).toHaveClass("border-transparent", "bg-secondary", "text-secondary-foreground");
    });

    it("should render destructive variant correctly", () => {
      render(<Badge variant="destructive">Destructive</Badge>);
      
      const badge = screen.getByText("Destructive");
      expect(badge).toHaveClass("border-transparent", "bg-destructive", "text-white");
    });

    it("should render outline variant correctly", () => {
      render(<Badge variant="outline">Outline</Badge>);
      
      const badge = screen.getByText("Outline");
      expect(badge).toHaveClass("text-foreground");
    });
  });

  describe("asChild prop", () => {
    it("should render as button when asChild is true and wrapped in button", () => {
      render(
        <Badge asChild>
          <button>Button Badge</button>
        </Badge>
      );
      
      const badge = screen.getByRole("button", { name: "Button Badge" });
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe("BUTTON");
      expect(badge).toHaveAttribute("data-slot", "badge");
    });

    it("should render as link when asChild is true and wrapped in link", () => {
      render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      );
      
      const badge = screen.getByRole("link", { name: "Link Badge" });
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe("A");
      expect(badge).toHaveAttribute("href", "/test");
      expect(badge).toHaveAttribute("data-slot", "badge");
    });

    it("should render as span when asChild is false", () => {
      render(<Badge asChild={false}>Span Badge</Badge>);
      
      const badge = screen.getByText("Span Badge");
      expect(badge.tagName).toBe("SPAN");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<Badge aria-label="Status badge">Status</Badge>);
      
      const badge = screen.getByLabelText("Status badge");
      expect(badge).toBeInTheDocument();
    });

    it("should handle aria-invalid attribute", () => {
      render(<Badge aria-invalid="true">Invalid Badge</Badge>);
      
      const badge = screen.getByText("Invalid Badge");
      expect(badge).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Styling", () => {
    it("should have base styling classes", () => {
      render(<Badge>Styled Badge</Badge>);
      
      const badge = screen.getByText("Styled Badge");
      expect(badge).toHaveClass(
        "inline-flex",
        "items-center",
        "justify-center",
        "rounded-md",
        "border",
        "px-2",
        "py-0.5",
        "text-xs",
        "font-medium",
        "w-fit",
        "whitespace-nowrap",
        "shrink-0"
      );
    });

    it("should combine variant and custom classes", () => {
      render(<Badge variant="destructive" className="my-custom-class">Custom Destructive</Badge>);
      
      const badge = screen.getByText("Custom Destructive");
      expect(badge).toHaveClass("my-custom-class");
      expect(badge).toHaveClass("bg-destructive", "text-white");
    });
  });

  describe("Edge cases", () => {
    it("should render empty badge", () => {
      render(<Badge></Badge>);
      
      // Use getAllByRole to find all elements with role 'generic', then find badge
      const elements = screen.getAllByRole("generic");
      const badge = elements.find(el => el.hasAttribute("data-slot") && el.getAttribute("data-slot") === "badge");
      expect(badge).toBeInTheDocument();
      expect(badge?.tagName).toBe("SPAN");
      expect(badge).toHaveAttribute("data-slot", "badge");
    });

    it("should render badge with complex children", () => {
      render(
        <Badge>
          <span>Icon</span>
          <span>Text</span>
        </Badge>
      );
      
      expect(screen.getByText("Icon")).toBeInTheDocument();
      expect(screen.getByText("Text")).toBeInTheDocument();
    });

    it("should handle undefined variant gracefully", () => {
      render(<Badge variant={undefined as any}>Undefined Variant</Badge>);
      
      const badge = screen.getByText("Undefined Variant");
      expect(badge).toBeInTheDocument();
      // Should fall back to default variant
      expect(badge).toHaveClass("bg-primary");
    });
  });
}); 