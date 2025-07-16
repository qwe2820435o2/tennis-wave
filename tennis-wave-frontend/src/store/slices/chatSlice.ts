import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConversationDto, MessageDto } from "@/types/chat";
import { createSelector } from "reselect";

interface ChatState {
    conversations: ConversationDto[];
    messages: { [conversationId: number]: MessageDto[] };
    unreadCounts: { [conversationId: number]: number };
}

const initialState: ChatState = {
    conversations: [],
    messages: {},
    unreadCounts: {},
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setConversations(state, action: PayloadAction<ConversationDto[]>) {
            state.conversations = action.payload;
        },
        setMessages(
            state,
            action: PayloadAction<{ conversationId: number; messages: MessageDto[] }>
        ) {
            const key = Number(action.payload.conversationId);
            state.messages[key] = action.payload.messages;
        },
        setUnreadCounts(
            state,
            action: PayloadAction<{ [conversationId: number]: number }>
        ) {
            state.unreadCounts = action.payload;
        },
        updateUnreadCount(
            state,
            action: PayloadAction<{ conversationId: number; count: number }>
        ) {
            const key = Number(action.payload.conversationId);
            state.unreadCounts[key] = action.payload.count;
        },
        addMessage(
            state,
            action: PayloadAction<{ conversationId: number | string; message: MessageDto }>
        ) {
            const key = Number(action.payload.conversationId);
            if (!state.messages[key]) {
                state.messages[key] = [];
            }
            state.messages[key].push(action.payload.message);
        },
        removeTempMessage(
            state,
            action: PayloadAction<{ conversationId: number | string; content: string }>
        ) {
            const key = Number(action.payload.conversationId);
            if (state.messages[key]) {
                state.messages[key] = state.messages[key].filter(
                    msg => msg.content !== action.payload.content
                );
            }
        },
    },
});

export const {
    setConversations,
    setMessages,
    setUnreadCounts,
    updateUnreadCount,
    addMessage,
    removeTempMessage,
} = chatSlice.actions;

// Memoized selectors
export const selectConversations = createSelector(
    (state: { chat: ChatState }) => state.chat.conversations,
    (conversations) => conversations
);

export const selectMessages = createSelector(
    (state: { chat: ChatState }) => state.chat.messages,
    (messages) => messages
);

export const selectUnreadCounts = createSelector(
    (state: { chat: ChatState }) => state.chat.unreadCounts,
    (unreadCounts) => unreadCounts
);

// Enhanced selectors for better performance
export const selectMessagesByConversationId = createSelector(
    selectMessages,
    (_state: { chat: ChatState }, conversationId: number) => conversationId,
    (messages, conversationId) => messages[conversationId] || []
);

export const selectUnreadCountByConversationId = createSelector(
    selectUnreadCounts,
    (_state: { chat: ChatState }, conversationId: number) => conversationId,
    (unreadCounts, conversationId) => unreadCounts[conversationId] || 0
);

export const selectTotalUnreadCount = createSelector(
    selectUnreadCounts,
    (unreadCounts) => Object.values(unreadCounts).reduce((total, count) => total + count, 0)
);

export const selectConversationsWithUnreadCounts = createSelector(
    selectConversations,
    selectUnreadCounts,
    (conversations, unreadCounts) => 
        conversations.map(conversation => ({
            ...conversation,
            unreadCount: unreadCounts[conversation.id] || 0
        }))
);

export const selectConversationsSortedByLastMessage = createSelector(
    selectConversationsWithUnreadCounts,
    (conversations) => 
        [...conversations].sort((a, b) => {
            // 由于没有时间戳，我们按 unreadCount 排序，未读消息多的在前面
            return b.unreadCount - a.unreadCount;
        })
);

export default chatSlice.reducer;