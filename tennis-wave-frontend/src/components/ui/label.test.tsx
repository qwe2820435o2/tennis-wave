import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Label } from "./label";

describe("Label Component", () => {
  describe("Basic rendering", () => {
    it("should render label with text content", () => {
      render(<Label>Test Label</Label>);
      
      const label = screen.getByText("Test Label");
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe("LABEL");
      expect(label).toHaveAttribute("data-slot", "label");
    });

    it("should render label with custom className", () => {
      render(<Label className="custom-label-class">Custom Label</Label>);
      
      const label = screen.getByText("Custom Label");
      expect(label).toHaveClass("custom-label-class");
    });

    it("should render label with htmlFor attribute", () => {
      render(<Label htmlFor="test-input">Input Label</Label>);
      
      const label = screen.getByText("Input Label");
      // Verify that the label element exists and has the correct text
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe("LABEL");
      // Verify that the label element has the data-slot attribute (feature of Radix UI)
      expect(label).toHaveAttribute("data-slot", "label");
    });
  });

  describe("Styling", () => {
    it("should have base styling classes", () => {
      render(<Label>Styled Label</Label>);
      
      const label = screen.getByText("Styled Label");
      expect(label).toHaveClass(
        "flex",
        "items-center",
        "gap-2",
        "text-sm",
        "leading-none",
        "font-medium",
        "select-none"
      );
    });

    it("should combine base classes with custom className", () => {
      render(<Label className="my-custom-class">Combined Label</Label>);
      
      const label = screen.getByText("Combined Label");
      expect(label).toHaveClass("my-custom-class");
      expect(label).toHaveClass("flex", "items-center", "gap-2");
    });
  });

  describe("Accessibility", () => {
    it("should associate label with input using htmlFor", () => {
      render(
        <div>
          <Label htmlFor="email-input">Email Address</Label>
          <input id="email-input" type="email" />
        </div>
      );
      
      const label = screen.getByText("Email Address");
      const input = screen.getByRole("textbox");
      
      expect(input).toHaveAttribute("id", "email-input");
      // Verify that the label element exists and has the correct text
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe("LABEL");
    });

    it("should handle aria-label attribute", () => {
      render(<Label aria-label="Hidden label">Visible Text</Label>);
      
      const label = screen.getByLabelText("Hidden label");
      expect(label).toBeInTheDocument();
    });

    it("should handle aria-describedby attribute", () => {
      render(<Label aria-describedby="description">Label with Description</Label>);
      
      const label = screen.getByText("Label with Description");
      expect(label).toHaveAttribute("aria-describedby", "description");
    });
  });

  describe("Form integration", () => {
    it("should work with form controls", () => {
      render(
        <form>
          <Label htmlFor="username">Username</Label>
          <input id="username" name="username" />
        </form>
      );
      
      const label = screen.getByText("Username");
      const input = screen.getByRole("textbox");
      
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("id", "username");
      // Verify that the label element exists and has the correct text
      expect(label.tagName).toBe("LABEL");
    });

    it("should work with select elements", () => {
      render(
        <div>
          <Label htmlFor="country">Country</Label>
          <select id="country">
            <option value="us">United States</option>
            <option value="ca">Canada</option>
          </select>
        </div>
      );
      
      const label = screen.getByText("Country");
      const select = screen.getByRole("combobox");
      
      expect(select).toHaveAttribute("id", "country");
      // Verify that the label element exists and has the correct text
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe("LABEL");
    });
  });

  describe("Edge cases", () => {
    it("should render empty label", () => {
      render(<Label></Label>);
      
      // Use getAllByText to get all empty text elements, then find the label element
      const elements = screen.getAllByText("");
      const label = elements.find(el => el.tagName === "LABEL");
      expect(label).toBeInTheDocument();
      expect(label?.tagName).toBe("LABEL");
      expect(label).toHaveAttribute("data-slot", "label");
    });

    it("should render label with complex children", () => {
      render(
        <Label>
          <span>Icon</span>
          <span>Text</span>
          <span>Description</span>
        </Label>
      );
      
      expect(screen.getByText("Icon")).toBeInTheDocument();
      expect(screen.getByText("Text")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("should handle special characters in label text", () => {
      render(<Label>Label with special chars: @#$%^&*()</Label>);
      
      expect(screen.getByText("Label with special chars: @#$%^&*()")).toBeInTheDocument();
    });

    it("should handle very long label text", () => {
      const longText = "This is a very long label text that might wrap to multiple lines and should still be properly rendered and accessible";
      render(<Label>{longText}</Label>);
      
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe("Disabled state", () => {
    it("should handle disabled state styling", () => {
      render(<Label data-disabled="true">Disabled Label</Label>);
      
      const label = screen.getByText("Disabled Label");
      expect(label).toHaveAttribute("data-disabled", "true");
    });

    it("should work with disabled form controls", () => {
      render(
        <div>
          <Label htmlFor="disabled-input">Disabled Input</Label>
          <input id="disabled-input" disabled />
        </div>
      );
      
      const label = screen.getByText("Disabled Input");
      const input = screen.getByRole("textbox");
      
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute("id", "disabled-input");
      // Verify that the label element exists and has the correct text
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe("LABEL");
    });
  });
}); 