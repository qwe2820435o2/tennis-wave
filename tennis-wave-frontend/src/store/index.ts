import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import loadingReducer from "./slices/loadingSlice";
import chatReducer from "./slices/chatSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        loading: loadingReducer,
        chat: chatReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;