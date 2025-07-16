import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card Component", () => {
    it("should render card with content", () => {
        render(
            <Card>
                <CardContent>Card content</CardContent>
            </Card>
        );
        expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("should render card with header", () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
            </Card>
        );
        expect(screen.getByText("Card Title")).toBeInTheDocument();
        expect(screen.getByText("Card Description")).toBeInTheDocument();
    });

    it("should render card with footer", () => {
        render(
            <Card>
                <CardFooter>Card footer</CardFooter>
            </Card>
        );
        expect(screen.getByText("Card footer")).toBeInTheDocument();
    });
}); 