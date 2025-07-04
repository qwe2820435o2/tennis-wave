export interface ConversationDto {
    id: number;
    otherUserName: string;
    otherUserAvatar?: string;
    lastMessage?: string;
    unreadCount: number;
}

export interface MessageDto {
    id: number;
    conversationId: number;
    senderId: number;
    senderName: string;
    senderAvatar: string;
    content: string;
    isFromCurrentUser: boolean;
    createdAt?: string;
}

export interface CreateConversationDto {
    otherUserId: number;
}