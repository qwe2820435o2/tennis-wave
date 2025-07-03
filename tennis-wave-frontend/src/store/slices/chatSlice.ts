import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConversationDto, MessageDto } from "@/types/chat";

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
    },
});

export const {
    setConversations,
    setMessages,
    setUnreadCounts,
    updateUnreadCount,
    addMessage,
} = chatSlice.actions;

export default chatSlice.reducer;