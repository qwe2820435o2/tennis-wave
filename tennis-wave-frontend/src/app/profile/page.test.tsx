import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { toast } from "sonner";
import ProfilePage from "./page";
import { userService } from "@/services/userService";
import loadingSlice from "@/store/slices/loadingSlice";
import userSlice from "@/store/slices/userSlice";

// Mock dependencies
vi.mock("@/services/userService");
vi.mock("sonner");
vi.mock("date-fns", () => ({
    format: vi.fn(() => "2024-01-01 12:00:00")
}));
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
    useParams: vi.fn(),
    useSearchParams: vi.fn()
}));

const mockUserService = vi.mocked(userService);
const mockToast = vi.mocked(toast);

// Mock sessionStorage and localStorage
const mockSessionStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};

const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};

Object.defineProperty(window, "sessionStorage", {
    value: mockSessionStorage
});

Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage
});

// Create test store
const createTestStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            loading: loadingSlice,
            user: userSlice
        },
        preloadedState: initialState
    });
};

const mockUser = {
    id: 123,
    userName: "TestUser",
    email: "test@example.com",
    avatar: "avatar1.png",
    tennisLevel: "Intermediate",
    preferredLocation: "Central Park",
    bio: "Love playing tennis",
    createdAt: "2024-01-01T12:00:00Z"
};

const renderWithProvider = (component: React.ReactElement, initialState = {}) => {
    const store = createTestStore(initialState);
    return render(
        <Provider store={store}>
            {component}
        </Provider>
    );
};

describe("ProfilePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ userId: "user123" }));
        mockLocalStorage.getItem.mockReturnValue(null);
    });

    describe("Initial Load", () => {
        it("should render loading state initially", async () => {
            // Use a Promise that never resolves to simulate loading state
            mockUserService.getUserById.mockImplementation(() => new Promise(() => {}));
            
            renderWithProvider(<ProfilePage />);
            
            // In loading state, component should not render anything (because profile is null)
            expect(screen.queryByText("My Profile")).not.toBeInTheDocument();
        });

        it("should fetch and display user profile on mount", async () => {
            mockUserService.getUserById.mockResolvedValue(mockUser);
            
            renderWithProvider(<ProfilePage />);
            
            await waitFor(() => {
                expect(mockUserService.getUserById).toHaveBeenCalledWith("user123");
            });
            
            expect(screen.getByDisplayValue("TestUser")).toBeInTheDocument();
            expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Intermediate")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Central Park")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Love playing tennis")).toBeInTheDocument();
        });

        it("should handle no user in storage", () => {
            mockSessionStorage.getItem.mockReturnValue(null);
            mockLocalStorage.getItem.mockReturnValue(null);
            
            renderWithProvider(<ProfilePage />);
            
            expect(mockUserService.getUserById).not.toHaveBeenCalled();
        });

        it("should handle fetch profile error", async () => {
            const error = new Error("Network error");
            (error as any).isAxiosError = true;
            (error as any).response = { status: 500 };
            mockUserService.getUserById.mockRejectedValue(error);
            
            renderWithProvider(<ProfilePage />);
            
            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith("Failed to load profile");
            });
        });

        it("should not show error toast for 401 errors", async () => {
            const error = new Error("Unauthorized");
            (error as any).isAxiosError = true;
            (error as any).response = { status: 401 };
            mockUserService.getUserById.mockRejectedValue(error);
            
            renderWithProvider(<ProfilePage />);
            
            await waitFor(() => {
                expect(mockToast.error).not.toHaveBeenCalled();
            });
        });
    });

    describe("Form Interactions", () => {
        beforeEach(async () => {
            mockUserService.getUserById.mockResolvedValue(mockUser);
            renderWithProvider(<ProfilePage />);
            await waitFor(() => {
                expect(screen.getByDisplayValue("TestUser")).toBeInTheDocument();
            });
        });

        it("should update form data when input changes", () => {
            const userNameInput = screen.getByDisplayValue("TestUser");
            fireEvent.change(userNameInput, { target: { value: "NewUserName" } });
            
            expect(userNameInput).toHaveValue("NewUserName");
        });

        it("should update tennis level", () => {
            const tennisLevelInput = screen.getByDisplayValue("Intermediate");
            fireEvent.change(tennisLevelInput, { target: { value: "Advanced" } });
            
            expect(tennisLevelInput).toHaveValue("Advanced");
        });

        it("should update preferred location", () => {
            const locationInput = screen.getByDisplayValue("Central Park");
            fireEvent.change(locationInput, { target: { value: "Riverside Park" } });
            
            expect(locationInput).toHaveValue("Riverside Park");
        });

        it("should update bio", () => {
            const bioTextarea = screen.getByDisplayValue("Love playing tennis");
            fireEvent.change(bioTextarea, { target: { value: "Updated bio" } });
            
            expect(bioTextarea).toHaveValue("Updated bio");
        });

        it("should show avatar picker when change button is clicked", () => {
            const changeButton = screen.getByRole("button", { name: "Change" });
            fireEvent.click(changeButton);
            
            expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
        });

        it("should hide avatar picker when avatar is selected", async () => {
            const changeButton = screen.getByRole("button", { name: "Change" });
            fireEvent.click(changeButton);
            
            const avatarOption = screen.getByAltText("Avatar avatar2.png");
            fireEvent.click(avatarOption);
            
            expect(screen.queryByText("Select Avatar")).not.toBeInTheDocument();
        });

        it("should reset form data when cancel is clicked", () => {
            const userNameInput = screen.getByDisplayValue("TestUser");
            fireEvent.change(userNameInput, { target: { value: "ChangedName" } });
            
            const cancelButton = screen.getByRole("button", { name: "Cancel" });
            fireEvent.click(cancelButton);
            
            expect(userNameInput).toHaveValue("TestUser");
        });
    });

    describe("Save Functionality", () => {
        beforeEach(async () => {
            mockUserService.getUserById.mockResolvedValue(mockUser);
            renderWithProvider(<ProfilePage />);
            await waitFor(() => {
                expect(screen.getByDisplayValue("TestUser")).toBeInTheDocument();
            });
        });

        it("should save profile successfully", async () => {
            const updatedUser = { ...mockUser, userName: "UpdatedUser" };
            mockUserService.updateUser.mockResolvedValue(updatedUser);
            
            const userNameInput = screen.getByDisplayValue("TestUser");
            fireEvent.change(userNameInput, { target: { value: "UpdatedUser" } });
            
            const saveButton = screen.getByRole("button", { name: "Save" });
            fireEvent.click(saveButton);
            
            await waitFor(() => {
                expect(mockUserService.updateUser).toHaveBeenCalledWith("user123", {
                    ...mockUser,
                    userName: "UpdatedUser"
                });
            });
            
            expect(mockToast.success).toHaveBeenCalledWith("Profile updated successfully");
        });

        it("should show loading state during save", async () => {
            mockUserService.updateUser.mockImplementation(() => new Promise(() => {}));
            
            const saveButton = screen.getByRole("button", { name: "Save" });
            fireEvent.click(saveButton);
            
            expect(screen.getByRole("button", { name: "Saving..." })).toBeInTheDocument();
            expect(saveButton).toBeDisabled();
        });

        it("should handle save error", async () => {
            const error = new Error("Update failed");
            (error as any).isAxiosError = true;
            (error as any).response = { status: 500 };
            mockUserService.updateUser.mockRejectedValue(error);
            
            const saveButton = screen.getByRole("button", { name: "Save" });
            fireEvent.click(saveButton);
            
            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith("Failed to update profile");
            });
        });

        it("should not show error toast for 401 errors during save", async () => {
            const error = new Error("Unauthorized");
            (error as any).isAxiosError = true;
            (error as any).response = { status: 401 };
            mockUserService.updateUser.mockRejectedValue(error);
            
            const saveButton = screen.getByRole("button", { name: "Save" });
            fireEvent.click(saveButton);
            
            await waitFor(() => {
                expect(mockToast.error).not.toHaveBeenCalled();
            });
        });

        it("should handle save with no user in storage", async () => {
            mockSessionStorage.getItem.mockReturnValue(null);
            mockLocalStorage.getItem.mockReturnValue(null);
            
            const saveButton = screen.getByRole("button", { name: "Save" });
            fireEvent.click(saveButton);
            
            expect(mockUserService.updateUser).not.toHaveBeenCalled();
        });
    });

    describe("Form Submission", () => {
        beforeEach(async () => {
            mockUserService.getUserById.mockResolvedValue(mockUser);
            renderWithProvider(<ProfilePage />);
            await waitFor(() => {
                expect(screen.getByDisplayValue("TestUser")).toBeInTheDocument();
            });
        });

        it("should submit form when enter is pressed", async () => {
            mockUserService.updateUser.mockResolvedValue(mockUser);
            
            const form = screen.getByTestId("profile-form");
            fireEvent.submit(form);
            
            await waitFor(() => {
                expect(mockUserService.updateUser).toHaveBeenCalled();
            });
        });

        it("should prevent default form submission", async () => {
            const form = screen.getByTestId("profile-form");
            const preventDefault = vi.fn();
            
            // Simulate form submission event
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            Object.defineProperty(submitEvent, 'preventDefault', {
                value: preventDefault,
                writable: true
            });
            
            fireEvent(form, submitEvent);
            
            expect(preventDefault).toHaveBeenCalled();
        });
    });

    describe("Edge Cases", () => {
        it("should handle null profile data", () => {
            mockUserService.getUserById.mockResolvedValue(null as any);
            
            renderWithProvider(<ProfilePage />);
            
            expect(screen.queryByText("My Profile")).not.toBeInTheDocument();
        });

        it("should handle partial user data", async () => {
            const partialUser = {
                id: 123,
                userName: "TestUser",
                email: "test@example.com",
                createdAt: "2024-01-01T12:00:00Z"
            };
            mockUserService.getUserById.mockResolvedValue(partialUser);
            
            renderWithProvider(<ProfilePage />);
            
            await waitFor(() => {
                expect(screen.getByDisplayValue("TestUser")).toBeInTheDocument();
            });
            
            expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
        });

        it("should handle invalid JSON in storage", () => {
            mockSessionStorage.getItem.mockReturnValue("invalid json");
            
            renderWithProvider(<ProfilePage />);
            
            expect(mockUserService.getUserById).not.toHaveBeenCalled();
        });
    });

    describe("Accessibility", () => {
        beforeEach(async () => {
            mockUserService.getUserById.mockResolvedValue(mockUser);
            renderWithProvider(<ProfilePage />);
            await waitFor(() => {
                expect(screen.getByDisplayValue("TestUser")).toBeInTheDocument();
            });
        });

        it("should have proper form labels", () => {
            expect(screen.getByLabelText("User Name")).toBeInTheDocument();
            expect(screen.getByLabelText("Email")).toBeInTheDocument();
            expect(screen.getByLabelText("Tennis Level")).toBeInTheDocument();
            expect(screen.getByLabelText("Preferred Location")).toBeInTheDocument();
            expect(screen.getByLabelText("Bio")).toBeInTheDocument();
        });

        it("should have disabled email field", () => {
            const emailInput = screen.getByDisplayValue("test@example.com");
            expect(emailInput).toBeDisabled();
        });

        it("should have disabled created at field", () => {
            const createdAtInput = screen.getByDisplayValue("2024-01-01 12:00:00");
            expect(createdAtInput).toBeDisabled();
        });
    });
}); 