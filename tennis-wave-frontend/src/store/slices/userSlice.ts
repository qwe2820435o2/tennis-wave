import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
    userId: number | null;
    userName: string | null;
    email: string | null;
    token: string | null;
    isHydrated: boolean;
}

const initialState: UserState = {
    userId: null,
    userName: null,
    email: null,
    token: null,
    isHydrated: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<Omit<UserState, "isHydrated">>) {
            state.userId = action.payload.userId;
            state.userName = action.payload.userName;
            state.email = action.payload.email;
            state.token = action.payload.token;
            state.isHydrated = true;
        },
        clearUser(state) {
            state.userId = null;
            state.userName = null;
            state.email = null;
            state.token = null;
            state.isHydrated = true;
        },
        hydrateUser(state) {
            state.isHydrated = true;
        }
    },
});

export const { setUser, clearUser, hydrateUser } = userSlice.actions;
export default userSlice.reducer;