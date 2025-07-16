import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./input";

describe("Input Component", () => {
    it("should render with placeholder", () => {
        render(<Input placeholder="Enter text" />);
        expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("should handle value changes", () => {
        const handleChange = vi.fn();
        render(<Input onChange={handleChange} />);
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "test" } });
        expect(handleChange).toHaveBeenCalled();
    });

    it("should be disabled when disabled prop is true", () => {
        render(<Input disabled />);
        expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should render with different types", () => {
        render(<Input type="email" placeholder="Email" />);
        const input = screen.getByPlaceholderText("Email");
        expect(input).toHaveAttribute("type", "email");
    });
}); 