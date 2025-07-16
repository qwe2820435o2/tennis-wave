import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ChatListPage from "./page";
import { chatService } from "@/services/chatService";
import loadingSlice from "@/store/slices/loadingSlice";
import chatSlice from "@/store/slices/chatSlice";
import userSlice from "@/store/slices/userSlice";

// Mock dependencies
vi.mock("@/services/chatService");
vi.mock("@/components/chat/NewChatModal", () => ({
    default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
        isOpen ? (
            <div data-testid="new-chat-modal">
                <button onClick={onClose}>Close Modal</button>
            </div>
        ) : null
    )
}));
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
    useParams: vi.fn(),
    useSearchParams: vi.fn()
}));

const mockChatService = vi.mocked(chatService);

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

const mockConversations = [
    {
        id: 1,
        otherUserName: "John Doe",
        otherUserAvatar: "/avatar1.png",
        lastMessage: "Hello there!",
        unreadCount: 2
    },
    {
        id: 2,
        otherUserName: "Jane Smith",
        otherUserAvatar: "/avatar2.png",
        lastMessage: "How are you?",
        unreadCount: 0
    }
];

const mockUnreadCounts = {
    conv1: 2,
    conv2: 0
};

const renderWithProvider = (component: React.ReactElement, initialState = {}) => {
    const store = createTestStore(initialState);
    return render(
        <Provider store={store}>
            {component}
        </Provider>
    );
};

describe("ChatListPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Initial Load", () => {
        it("should render chat list page with title", async () => {
            mockChatService.getConversations.mockResolvedValue([]);
            mockChatService.getUnreadCounts.mockResolvedValue({});
            
            renderWithProvider(<ChatListPage />);
            
            expect(screen.getByRole("heading", { name: "chat Chat" })).toBeInTheDocument();
            const newChatButtons = screen.getAllByRole("button", { name: "New Chat" });
            expect(newChatButtons.length).toBeGreaterThanOrEqual(1);
        });

        it("should fetch conversations and unread counts on mount", async () => {
            mockChatService.getConversations.mockResolvedValue(mockConversations);
            mockChatService.getUnreadCounts.mockResolvedValue(mockUnreadCounts);
            
            renderWithProvider(<ChatListPage />);
            
            await waitFor(() => {
                expect(mockChatService.getConversations).toHaveBeenCalled();
                expect(mockChatService.getUnreadCounts).toHaveBeenCalled();
            });
        });

        it("should display conversations when data is loaded", async () => {
            mockChatService.getConversations.mockResolvedValue(mockConversations);
            mockChatService.getUnreadCounts.mockResolvedValue(mockUnreadCounts);
            
            renderWithProvider(<ChatListPage />);
            
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
                expect(screen.getByText("Jane Smith")).toBeInTheDocument();
                expect(screen.getByText("Hello there!")).toBeInTheDocument();
                expect(screen.getByText("How are you?")).toBeInTheDocument();
            });
        });

        it("should display unread count badges", async () => {
            mockChatService.getConversations.mockResolvedValue(mockConversations);
            mockChatService.getUnreadCounts.mockResolvedValue({ 1: 2, 2: 1 });

            renderWithProvider(<ChatListPage />);

            await waitFor(() => {
                expect(screen.getByText("2")).toBeInTheDocument();
                expect(screen.getByText("1")).toBeInTheDocument();
            });
        });

        it("should handle empty conversations list", async () => {
            mockChatService.getConversations.mockResolvedValue([]);
            mockChatService.getUnreadCounts.mockResolvedValue({});
            
            renderWithProvider(<ChatListPage />);
            
            await waitFor(() => {
                expect(screen.getByText("No conversations yet")).toBeInTheDocument();
                expect(screen.getByText("Start a new chat to connect with partners")).toBeInTheDocument();
            });
        });

        it("should handle conversations with no last message", async () => {
            const conversationsWithNoMessage = [
                {
                    ...mockConversations[0],
                    lastMessage: undefined
                }
            ];
            mockChatService.getConversations.mockResolvedValue(conversationsWithNoMessage);
            mockChatService.getUnreadCounts.mockResolvedValue({});
            
            renderWithProvider(<ChatListPage />);
            
            await waitFor(() => {
                expect(screen.getByText("No messages yet")).toBeInTheDocument();
            });
        });

        it("should handle conversations with missing avatar", async () => {
            const conversationsWithoutAvatar = [
                {
                    ...mockConversations[0],
                    otherUserAvatar: undefined
                }
            ];
            mockChatService.getConversations.mockResolvedValue(conversationsWithoutAvatar);
            mockChatService.getUnreadCounts.mockResolvedValue({});
            
            renderWithProvider(<ChatListPage />);
            
            await waitFor(() => {
                expect(screen.getByText("J")).toBeInTheDocument(); // Fallback for John
            });
        });

        it("should handle conversations with missing username", async () => {
            const conversationsWithoutName = [
                {
                    ...mockConversations[0],
                    otherUserName: ""
                }
            ];
            mockChatService.getConversations.mockResolvedValue(conversationsWithoutName);
            mockChatService.getUnreadCounts.mockResolvedValue({});
            
            renderWithProvider(<ChatListPage />);
            
            await waitFor(() => {
                expect(screen.getByText("U")).toBeInTheDocument(); // Fallback for unknown user
            });
        });
    });

    describe("New Chat Modal", () => {
        beforeEach(async () => {
            mockChatService.getConversations.mockResolvedValue(mockConversations);
            mockChatService.getUnreadCounts.mockResolvedValue(mockUnreadCounts);
            renderWithProvider(<ChatListPage />);
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            });
        });

        it("should open new chat modal when button is clicked", () => {
            const newChatButton = screen.getByRole("button", { name: "New Chat" });
            fireEvent.click(newChatButton);
            
            expect(screen.getByTestId("new-chat-modal")).toBeInTheDocument();
        });

        it("should open new chat modal from empty state", async () => {
            mockChatService.getConversations.mockResolvedValue([]);
            mockChatService.getUnreadCounts.mockResolvedValue({});
            
            renderWithProvider(<ChatListPage />);
            
            await waitFor(() => {
                expect(screen.getByText("No conversations yet")).toBeInTheDocument();
            });
            
            const newChatButtons = screen.getAllByRole("button", { name: "New Chat" });
            fireEvent.click(newChatButtons[0]);
            
            expect(screen.getByTestId("new-chat-modal")).toBeInTheDocument();
        });

        it("should close new chat modal", () => {
            const newChatButton = screen.getByRole("button", { name: "New Chat" });
            fireEvent.click(newChatButton);
            
            expect(screen.getByTestId("new-chat-modal")).toBeInTheDocument();
            
            const closeButton = screen.getByText("Close Modal");
            fireEvent.click(closeButton);
            
            expect(screen.queryByTestId("new-chat-modal")).not.toBeInTheDocument();
        });
    });

    describe("Conversation Links", () => {
        beforeEach(async () => {
            mockChatService.getConversations.mockResolvedValue(mockConversations);
            mockChatService.getUnreadCounts.mockResolvedValue(mockUnreadCounts);
            renderWithProvider(<ChatListPage />);
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            });
        });

        it("should render conversation links with correct href", () => {
            const conversationLinks = screen.getAllByRole("link");
            expect(conversationLinks).toHaveLength(2);
            
            expect(conversationLinks[0]).toHaveAttribute("href", "/chat/1");
            expect(conversationLinks[1]).toHaveAttribute("href", "/chat/2");
        });

        it("should display conversation cards with proper styling", () => {
            const conversationCards = screen.getAllByRole("link");
            expect(conversationCards[0]).toHaveClass("block", "group");
        });
    });

    describe("Error Handling", () => {
        it("should handle conversation fetch error gracefully", async () => {
            mockChatService.getConversations.mockRejectedValue(new Error("Network error"));
            mockChatService.getUnreadCounts.mockResolvedValue({});
            renderWithProvider(<ChatListPage />);
            
            // 等待组件渲染完成，即使有错误也应该显示空状态
            await waitFor(() => {
                expect(screen.getByText("No conversations yet")).toBeInTheDocument();
            });
        });

        it("should handle unread counts fetch error gracefully", async () => {
            mockChatService.getConversations.mockResolvedValue(mockConversations);
            mockChatService.getUnreadCounts.mockRejectedValue(new Error("Network error"));
            renderWithProvider(<ChatListPage />);
            
            // 当 getUnreadCounts 失败时，整个 Promise.all 会失败，所以不会显示对话列表
            await waitFor(() => {
                expect(screen.getByText("No conversations yet")).toBeInTheDocument();
            });
        });

        it("should handle both fetch errors gracefully", async () => {
            mockChatService.getConversations.mockRejectedValue(new Error("Network error"));
            mockChatService.getUnreadCounts.mockRejectedValue(new Error("Network error"));
            renderWithProvider(<ChatListPage />);
            
            // 等待组件渲染完成，应该显示空状态
            await waitFor(() => {
                expect(screen.getByText("No conversations yet")).toBeInTheDocument();
            });
        });
    });

    describe("Redux State Integration", () => {
        it("should use conversations from Redux state", () => {
            const initialState = {
                chat: {
                    conversations: mockConversations,
                    unreadCounts: mockUnreadCounts,
                    currentConversation: null,
                    messages: []
                }
            };
            
            renderWithProvider(<ChatListPage />, initialState);
            
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        });

        it("should dispatch conversations to Redux store", async () => {
            mockChatService.getConversations.mockResolvedValue(mockConversations);
            mockChatService.getUnreadCounts.mockResolvedValue(mockUnreadCounts);
            
            const store = createTestStore();
            render(
                <Provider store={store}>
                    <ChatListPage />
                </Provider>
            );
            
            await waitFor(() => {
                const state = store.getState();
                expect(state.chat.conversations).toEqual(mockConversations);
                expect(state.chat.unreadCounts).toEqual(mockUnreadCounts);
            });
        });
    });

    describe("Loading States", () => {
        it("should dispatch loading actions", async () => {
            mockChatService.getConversations.mockResolvedValue([]);
            mockChatService.getUnreadCounts.mockResolvedValue({});
            
            const store = createTestStore();
            render(
                <Provider store={store}>
                    <ChatListPage />
                </Provider>
            );
            
            await waitFor(() => {
                const state = store.getState();
                expect(state.loading.isLoading).toBe(false);
            });
        });
    });

    describe("Accessibility", () => {
        beforeEach(async () => {
            mockChatService.getConversations.mockResolvedValue(mockConversations);
            mockChatService.getUnreadCounts.mockResolvedValue(mockUnreadCounts);
            renderWithProvider(<ChatListPage />);
            await waitFor(() => {
                expect(screen.getByText("John Doe")).toBeInTheDocument();
            });
        });

        it("should have proper ARIA labels", () => {
            expect(screen.getByLabelText("chat")).toBeInTheDocument();
        });

        it("should have proper button roles", () => {
            const buttons = screen.getAllByRole("button");
            expect(buttons.length).toBeGreaterThan(0);
        });

        it("should have proper link roles", () => {
            const links = screen.getAllByRole("link");
            expect(links.length).toBeGreaterThan(0);
        });
    });
}); 