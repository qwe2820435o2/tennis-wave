import { describe, it, expect } from "vitest";
import chatReducer, { 
    setConversations, 
    setMessages, 
    addMessage, 
    removeTempMessage,
    selectMessagesByConversationId,
    selectUnreadCountByConversationId,
    selectTotalUnreadCount,
    selectConversationsWithUnreadCounts,
    selectConversationsSortedByLastMessage
} from "./chatSlice";
import { ConversationDto, MessageDto } from "@/types/chat";

describe("chatSlice", () => {
    const initialState = {
        conversations: [],
        messages: {},
        unreadCounts: {},
    };

    it("should handle setConversations", () => {
        const conversations: ConversationDto[] = [
            { id: 1, otherUserName: "User 1", unreadCount: 0 }
        ];
        const state = chatReducer(initialState, setConversations(conversations));
        expect(state.conversations).toEqual(conversations);
    });

    it("should handle setMessages", () => {
        const messages: MessageDto[] = [
            { 
                id: 1, 
                conversationId: 1, 
                senderId: 1, 
                senderName: "User", 
                senderAvatar: "avatar1.png",
                content: "Hello", 
                createdAt: new Date().toISOString(), 
                isFromCurrentUser: false 
            }
        ];
        const state = chatReducer(initialState, setMessages({ conversationId: 1, messages }));
        expect(state.messages[1]).toEqual(messages);
    });

    it("should handle addMessage", () => {
        const message: MessageDto = {
            id: 1,
            conversationId: 1,
            senderId: 1,
            senderName: "User",
            senderAvatar: "avatar1.png",
            content: "Hello",
            createdAt: new Date().toISOString(),
            isFromCurrentUser: false
        };
        const state = chatReducer(initialState, addMessage({ conversationId: 1, message }));
        expect(state.messages[1]).toContain(message);
    });
});

describe("chatSlice selectors", () => {
    const mockState = {
        chat: {
            conversations: [
                { id: 1, otherUserName: "User 1", unreadCount: 2, lastMessage: "Hello" },
                { id: 2, otherUserName: "User 2", unreadCount: 0, lastMessage: "Hi" },
                { id: 3, otherUserName: "User 3", unreadCount: 5, lastMessage: "Bye" }
            ],
            messages: {
                1: [
                    { id: 1, conversationId: 1, senderId: 1, senderName: "User", senderAvatar: "avatar1.png", content: "Hello", isFromCurrentUser: false }
                ],
                2: [
                    { id: 2, conversationId: 2, senderId: 2, senderName: "User2", senderAvatar: "avatar2.png", content: "Hi", isFromCurrentUser: false }
                ]
            },
            unreadCounts: {
                1: 2,
                2: 0,
                3: 5
            }
        }
    };

    it("should select messages by conversation id", () => {
        const result = selectMessagesByConversationId(mockState, 1);
        expect(result).toHaveLength(1);
        expect(result[0].content).toBe("Hello");
    });

    it("should return empty array for non-existent conversation", () => {
        const result = selectMessagesByConversationId(mockState, 999);
        expect(result).toEqual([]);
    });

    it("should select unread count by conversation id", () => {
        const result = selectUnreadCountByConversationId(mockState, 1);
        expect(result).toBe(2);
    });

    it("should return 0 for non-existent conversation", () => {
        const result = selectUnreadCountByConversationId(mockState, 999);
        expect(result).toBe(0);
    });

    it("should calculate total unread count", () => {
        const result = selectTotalUnreadCount(mockState);
        expect(result).toBe(7); // 2 + 0 + 5
    });

    it("should select conversations with unread counts", () => {
        const result = selectConversationsWithUnreadCounts(mockState);
        expect(result).toHaveLength(3);
        expect(result[0].unreadCount).toBe(2);
        expect(result[1].unreadCount).toBe(0);
        expect(result[2].unreadCount).toBe(5);
    });

    it("should sort conversations by unread count", () => {
        const result = selectConversationsSortedByLastMessage(mockState);
        expect(result).toHaveLength(3);
        // 应该按 unreadCount 降序排列
        expect(result[0].unreadCount).toBe(5); // User 3
        expect(result[1].unreadCount).toBe(2); // User 1
        expect(result[2].unreadCount).toBe(0); // User 2
    });
}); 