import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { toast } from "sonner";
import ChatDetailPage from "./page";
import { chatService } from "@/services/chatService";
import signalRService from "@/services/signalRService";
import loadingSlice from "@/store/slices/loadingSlice";
import chatSlice from "@/store/slices/chatSlice";
import userSlice from "@/store/slices/userSlice";
import { ChatMessagesWithOtherUserDto } from "@/services/chatService";

// Mock dependencies
vi.mock("@/services/chatService");
vi.mock("@/services/signalRService");
vi.mock("sonner");
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
    useParams: vi.fn(() => ({ conversationId: "123" })),
    useSearchParams: vi.fn(() => new URLSearchParams())
}));
vi.mock("date-fns", () => ({
    format: vi.fn(() => "Jan 1, 2024, 12:00 PM")
}));

const mockChatService = vi.mocked(chatService);
const mockSignalRService = vi.mocked(signalRService);
const mockToast = vi.mocked(toast);

// Create test store
const createTestStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            loading: loadingSlice,
            chat: chatSlice,
            user: userSlice
        },
        preloadedState: initialState
    });
};

const mockMessages = [
    {
        id: 1,
        conversationId: 123,
        senderId: 456,
        senderName: "John Doe",
        senderAvatar: "/avatar1.png",
        content: "Hello there!",
        isFromCurrentUser: false,
        createdAt: "2024-01-01T12:00:00Z"
    },
    {
        id: 2,
        conversationId: 123,
        senderId: 789,
        senderName: "You",
        senderAvatar: "/avatar2.png",
        content: "Hi John!",
        isFromCurrentUser: true,
        createdAt: "2024-01-01T12:01:00Z"
    }
];

const mockUser = {
    userId: 789,
    userName: "You",
    avatar: "/avatar2.png"
};

const mockMessagesWithOtherUser: ChatMessagesWithOtherUserDto = {
    messages: mockMessages,
    otherUserName: "John Doe",
    otherUserAvatar: "/avatars/avatar1.png",
    otherUserId: 2
};

const mockMessagesWithOtherUserNoAvatar: ChatMessagesWithOtherUserDto = {
    messages: mockMessages,
    otherUserName: "John Doe",
    otherUserAvatar: undefined,
    otherUserId: 2
};

const renderWithProvider = (component: React.ReactElement, initialState = {}) => {
    const store = createTestStore(initialState);
    return render(
        <Provider store={store}>
            {component}
        </Provider>
    );
};

describe("ChatDetailPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockChatService.getMessages.mockResolvedValue(mockMessagesWithOtherUser);
        mockChatService.markAsRead.mockResolvedValue(undefined);
        mockSignalRService.markAsRead.mockResolvedValue(undefined);
        mockSignalRService.joinConversation.mockResolvedValue(undefined);
        mockSignalRService.leaveConversation.mockResolvedValue(undefined);
        mockSignalRService.ensureConnection.mockResolvedValue(undefined);
        mockSignalRService.sendMessage.mockResolvedValue(undefined);
    });

    describe("Initial Load", () => {
        it("should render chat detail page with header", async () => {
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            });
        });

        it("should load messages and conversation data on mount", async () => {
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(mockChatService.getMessages).toHaveBeenCalledWith(123);
                expect(mockChatService.markAsRead).toHaveBeenCalledWith(123);
                expect(mockSignalRService.markAsRead).toHaveBeenCalledWith("123");
                expect(mockSignalRService.joinConversation).toHaveBeenCalledWith("123");
            });
        });

        it("should display messages correctly", async () => {
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("Hello there!")).toBeInTheDocument();
                expect(screen.getByText("Hi John!")).toBeInTheDocument();
            });
        });

        it("should display other user information", async () => {
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            });
        });

        it("should handle missing other user avatar", async () => {
            mockChatService.getMessages.mockResolvedValue(mockMessagesWithOtherUserNoAvatar);
            
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            });
        });
    });

    describe("Message Display", () => {
        beforeEach(async () => {
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            await waitFor(() => {
                expect(screen.getByText("Hello there!")).toBeInTheDocument();
            });
        });

        it("should show time stamps for messages", async () => {
            expect(screen.getByText("Jan 1, 2024, 12:00 PM")).toBeInTheDocument();
        });

        it("should display current user messages on the right", async () => {
            const userMessage = screen.getByText("Hi John!");
            const userFlex = userMessage.closest(".flex");
            expect(userFlex).toHaveClass("items-end");
        });

        it("should display other user messages on the left", async () => {
            const otherMessage = screen.getByText("Hello there!");
            const otherFlex = otherMessage.closest(".flex");
            expect(otherFlex).toHaveClass("items-start");
        });

        it("should show avatars for messages", () => {
            const avatars = screen.getAllByTestId("avatar");
            expect(avatars.length).toBeGreaterThan(0);
        });
    });

    describe("Message Sending", () => {
        beforeEach(async () => {
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            await waitFor(() => {
                expect(screen.getByText("Hello there!")).toBeInTheDocument();
            });
        });

        it("should send message when form is submitted", async () => {
            const input = screen.getByPlaceholderText("Type a message...");
            const sendButton = screen.getByRole("button", { name: "Send" });
            
            await act(async () => {
                fireEvent.change(input, { target: { value: "New message" } });
                fireEvent.click(sendButton);
            });
            
            await waitFor(() => {
                expect(mockSignalRService.ensureConnection).toHaveBeenCalled();
                expect(mockSignalRService.sendMessage).toHaveBeenCalledWith("123", "New message");
            });
        });

        it("should send message when Enter is pressed", async () => {
            const input = screen.getByPlaceholderText("Type a message...");
            
            await act(async () => {
                fireEvent.change(input, { target: { value: "New message" } });
                fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });
            });
            
            await waitFor(() => {
                expect(mockSignalRService.sendMessage).toHaveBeenCalledWith("123", "New message");
            });
        });

        it("should not send message when Shift+Enter is pressed", async () => {
            const input = screen.getByPlaceholderText("Type a message...");
            
            await act(async () => {
                fireEvent.change(input, { target: { value: "New message" } });
                fireEvent.keyPress(input, { key: "Enter", code: "Enter", shiftKey: true });
            });
            
            expect(mockSignalRService.sendMessage).not.toHaveBeenCalled();
        });

        it("should not send empty messages", async () => {
            const sendButton = screen.getByRole("button", { name: "Send" });
            
            await act(async () => {
                fireEvent.click(sendButton);
            });
            
            expect(mockSignalRService.sendMessage).not.toHaveBeenCalled();
        });

        it("should not send message when already sending", async () => {
            mockSignalRService.sendMessage.mockImplementation(() => new Promise(() => {}));
            
            const input = screen.getByPlaceholderText("Type a message...");
            const sendButton = screen.getByRole("button", { name: "Send" });
            
            await act(async () => {
                fireEvent.change(input, { target: { value: "New message" } });
                fireEvent.click(sendButton);
            });
            
            // Try to send another message immediately
            await act(async () => {
                fireEvent.change(input, { target: { value: "Another message" } });
                fireEvent.click(sendButton);
            });
            
            await waitFor(() => {
                expect(mockSignalRService.sendMessage).toHaveBeenCalledTimes(1);
            });
        });

        it("should show loading state while sending", async () => {
            mockSignalRService.sendMessage.mockImplementation(() => new Promise(() => {}));
            
            const input = screen.getByPlaceholderText("Type a message...");
            const sendButton = screen.getByRole("button", { name: "Send" });
            
            await act(async () => {
                fireEvent.change(input, { target: { value: "New message" } });
                fireEvent.click(sendButton);
            });
            
            // Use more specific query to avoid conflicts with multiple "Sending..." texts
            expect(screen.getByRole("button", { name: "Sending..." })).toBeInTheDocument();
            expect(sendButton).toBeDisabled();
        });

        it("should clear input after sending", async () => {
            const input = screen.getByPlaceholderText("Type a message...");
            const sendButton = screen.getByRole("button", { name: "Send" });
            
            await act(async () => {
                fireEvent.change(input, { target: { value: "New message" } });
                fireEvent.click(sendButton);
            });
            
            await waitFor(() => {
                expect(input).toHaveValue("");
            });
        });
    });

    describe("Error Handling", () => {
        it("should handle message loading error", async () => {
            mockChatService.getMessages.mockRejectedValue(new Error("Network error"));
            
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith("Failed to load messages");
            });
        });

        it("should handle mark as read error", async () => {
            mockChatService.markAsRead.mockRejectedValue(new Error("Network error"));
            
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            });
        });

        it("should handle SignalR mark as read error", async () => {
            mockSignalRService.markAsRead.mockRejectedValue(new Error("Network error"));
            
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            });
        });

        it("should handle SignalR join conversation error", async () => {
            mockSignalRService.joinConversation.mockRejectedValue(new Error("Network error"));
            
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            });
        });

        it("should handle send message authentication error", async () => {
            const authError = new Error("not authenticated");
            mockSignalRService.sendMessage.mockRejectedValue(authError);
            
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("Hello there!")).toBeInTheDocument();
            });
            
            const input = screen.getByPlaceholderText("Type a message...");
            const sendButton = screen.getByRole("button", { name: "Send" });
            
            await act(async () => {
                fireEvent.change(input, { target: { value: "New message" } });
                fireEvent.click(sendButton);
            });
            
            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith("Please login again to send messages");
            });
        });

        it("should handle send message connection error", async () => {
            const connectionError = new Error("not available");
            mockSignalRService.sendMessage.mockRejectedValue(connectionError);
            
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("Hello there!")).toBeInTheDocument();
            });
            
            const input = screen.getByPlaceholderText("Type a message...");
            const sendButton = screen.getByRole("button", { name: "Send" });
            
            await act(async () => {
                fireEvent.change(input, { target: { value: "New message" } });
                fireEvent.click(sendButton);
            });
            
            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith("Connection lost. Please refresh the page and try again");
            });
        });

        it("should handle generic send message error", async () => {
            const genericError = new Error("Unknown error");
            mockSignalRService.sendMessage.mockRejectedValue(genericError);
            
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("Hello there!")).toBeInTheDocument();
            });
            
            const input = screen.getByPlaceholderText("Type a message...");
            const sendButton = screen.getByRole("button", { name: "Send" });
            
            await act(async () => {
                fireEvent.change(input, { target: { value: "New message" } });
                fireEvent.click(sendButton);
            });
            
            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith("Failed to send message. Please try again");
            });
        });

        it("should handle non-Error send message error", async () => {
            mockSignalRService.sendMessage.mockRejectedValue("String error");
            
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("Hello there!")).toBeInTheDocument();
            });
            
            const input = screen.getByPlaceholderText("Type a message...");
            const sendButton = screen.getByRole("button", { name: "Send" });
            
            await act(async () => {
                fireEvent.change(input, { target: { value: "New message" } });
                fireEvent.click(sendButton);
            });
            
            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith("Failed to send message. Please try again");
            });
        });

        it("should restore input content on send error", async () => {
            mockSignalRService.sendMessage.mockRejectedValue(new Error("Network error"));
            
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            
            await waitFor(() => {
                expect(screen.getByText("Hello there!")).toBeInTheDocument();
            });
            
            const input = screen.getByPlaceholderText("Type a message...");
            const sendButton = screen.getByRole("button", { name: "Send" });
            
            await act(async () => {
                fireEvent.change(input, { target: { value: "New message" } });
                fireEvent.click(sendButton);
            });
            
            await waitFor(() => {
                expect(input).toHaveValue("New message");
            });
        });
    });

    describe("SignalR Integration", () => {
        it("should leave conversation on unmount", async () => {
            const { unmount } = renderWithProvider(<ChatDetailPage />, {
                user: mockUser
            });
            
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            });
            
            unmount();
            
            expect(mockSignalRService.leaveConversation).toHaveBeenCalledWith("123");
        });

        it("should handle leave conversation error", async () => {
            mockSignalRService.leaveConversation.mockRejectedValue(new Error("Network error"));
            
            const { unmount } = renderWithProvider(<ChatDetailPage />, {
                user: mockUser
            });
            
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            });
            
            unmount();
            
            expect(mockSignalRService.leaveConversation).toHaveBeenCalledWith("123");
        });
    });

    describe("Redux State Integration", () => {
        it("should use messages from Redux state", () => {
            const initialState = {
                chat: {
                    conversations: [],
                    unreadCounts: {},
                    currentConversation: null,
                    messages: {
                        123: mockMessages
                    }
                },
                user: mockUser
            };
            
            renderWithProvider(<ChatDetailPage />, initialState);
            
            expect(screen.getByText("Hello there!")).toBeInTheDocument();
            expect(screen.getByText("Hi John!")).toBeInTheDocument();
        });

        it("should dispatch messages to Redux store", async () => {
            const store = createTestStore({ user: mockUser });
            render(
                <Provider store={store}>
                    <ChatDetailPage />
                </Provider>
            );
            
            await waitFor(() => {
                const state = store.getState();
                expect(state.chat.messages[123]).toEqual(mockMessages);
            });
        });
    });

    describe("Accessibility", () => {
        beforeEach(async () => {
            await act(async () => {
                renderWithProvider(<ChatDetailPage />, {
                    user: mockUser
                });
            });
            await waitFor(() => {
                expect(screen.getByText("Hello there!")).toBeInTheDocument();
            });
        });

        it("should have proper form structure", () => {
            const form = screen.getByTestId("chat-form");
            expect(form).toBeInTheDocument();
        });

        it("should have proper input attributes", () => {
            const input = screen.getByPlaceholderText("Type a message...");
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("type", "text");
        });

        it("should have proper button attributes", () => {
            const sendButton = screen.getByRole("button", { name: "Send" });
            expect(sendButton).toHaveAttribute("type", "submit");
        });
    });
}); 