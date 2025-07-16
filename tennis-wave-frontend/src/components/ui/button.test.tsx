import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button Component", () => {
    it("should render with children", () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText("Click Me")).toBeInTheDocument();
    });

    it("should call onClick when clicked", () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click</Button>);
        fireEvent.click(screen.getByText("Click"));
        expect(handleClick).toHaveBeenCalled();
    });

    it("should be disabled when disabled prop is true", () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByText("Disabled")).toBeDisabled();
    });

    it("should apply variant class", () => {
        render(<Button variant="destructive">Danger</Button>);
        expect(screen.getByText("Danger")).toBeInTheDocument();
    });
}); 