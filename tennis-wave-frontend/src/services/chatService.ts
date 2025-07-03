import axiosInstance from "./axiosInstance";
import { ConversationDto, MessageDto } from "@/types/chat";

export interface ChatMessagesWithOtherUserDto {
    messages: MessageDto[];
    otherUserId: number;
    otherUserName: string;
    otherUserAvatar?: string;
}

export const chatService = {
    getConversations: async (): Promise<ConversationDto[]> => {
        const res = await axiosInstance.get("/api/chat/conversations");
        return res.data.data;
    },
    getMessages: async (conversationId: number): Promise<ChatMessagesWithOtherUserDto> => {
        const res = await axiosInstance.get(`/api/chat/conversations/${conversationId}/messages`);
        return res.data.data;
    },
    sendMessage: async (conversationId: number, content: string): Promise<MessageDto> => {
        const res = await axiosInstance.post(`/api/chat/conversations/${conversationId}/messages`, { content });
        return res.data.data;
    },
    markAsRead: async (conversationId: number) => {
        await axiosInstance.post(`/api/chat/conversations/${conversationId}/read`);
    },
    getUnreadCounts: async (): Promise<{ [conversationId: number]: number }> => {
        const res = await axiosInstance.get("/api/chat/unread-counts");
        // 转换为map
        const map: { [conversationId: number]: number } = {};
        res.data.data.forEach((item: { conversationId: number; unreadCount: number }) => {
            map[item.conversationId] = item.unreadCount;
        });
        return map;
    },
};