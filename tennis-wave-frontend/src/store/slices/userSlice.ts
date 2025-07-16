import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "reselect";

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

// Memoized selectors
export const selectUserId = createSelector(
    (state: { user: UserState }) => state.user.userId,
    (userId) => userId
);

export const selectUserName = createSelector(
    (state: { user: UserState }) => state.user.userName,
    (userName) => userName
);

export const selectEmail = createSelector(
    (state: { user: UserState }) => state.user.email,
    (email) => email
);

export const selectToken = createSelector(
    (state: { user: UserState }) => state.user.token,
    (token) => token
);

export const selectIsHydrated = createSelector(
    (state: { user: UserState }) => state.user.isHydrated,
    (isHydrated) => isHydrated
);

// Combined selectors for better performance
export const selectUser = createSelector(
    (state: { user: UserState }) => state.user,
    (user) => ({
        userId: user.userId,
        userName: user.userName,
        email: user.email,
        token: user.token,
        isHydrated: user.isHydrated
    })
);

export const selectIsAuthenticated = createSelector(
    selectUserId,
    selectToken,
    (userId, token) => userId !== null && token !== null
);

export const selectUserDisplayName = createSelector(
    selectUserName,
    selectEmail,
    (userName, email) => userName || email || 'Unknown User'
);