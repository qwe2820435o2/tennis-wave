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
            state.messages[action.payload.conversationId] = action.payload.messages;
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
            state.unreadCounts[action.payload.conversationId] = action.payload.count;
        },
        addMessage(
            state,
            action: PayloadAction<{ conversationId: number; message: MessageDto }>
        ) {
            if (!state.messages[action.payload.conversationId]) {
                state.messages[action.payload.conversationId] = [];
            }
            state.messages[action.payload.conversationId].push(action.payload.message);
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