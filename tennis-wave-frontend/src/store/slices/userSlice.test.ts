import { describe, it, expect } from "vitest";
import userReducer, { 
    setUser, 
    clearUser, 
    hydrateUser, 
    UserState,
    selectUser,
    selectIsAuthenticated,
    selectUserDisplayName
} from "./userSlice";

describe("userSlice", () => {
    const initialState: UserState = {
        userId: null,
        userName: null,
        email: null,
        token: null,
        isHydrated: false,
    };

    it("should handle setUser", () => {
        const state = userReducer(initialState, setUser({
            userId: 1,
            userName: "Tom",
            email: "tom@example.com",
            token: "token"
        }));
        expect(state.userId).toBe(1);
        expect(state.userName).toBe("Tom");
        expect(state.isHydrated).toBe(true);
    });

    it("should handle clearUser", () => {
        const state = userReducer({
            ...initialState,
            userId: 1,
            userName: "Tom",
            email: "tom@example.com",
            token: "token",
            isHydrated: true
        }, clearUser());
        expect(state.userId).toBeNull();
        expect(state.userName).toBeNull();
        expect(state.isHydrated).toBe(true);
    });

    it("should handle hydrateUser", () => {
        const state = userReducer(initialState, hydrateUser());
        expect(state.isHydrated).toBe(true);
    });
});

describe("userSlice selectors", () => {
    const mockState = {
        user: {
            userId: 1,
            userName: "Tom",
            email: "tom@example.com",
            token: "token123",
            isHydrated: true
        }
    };

    it("should select user correctly", () => {
        const result = selectUser(mockState);
        expect(result).toEqual({
            userId: 1,
            userName: "Tom",
            email: "tom@example.com",
            token: "token123",
            isHydrated: true
        });
    });

    it("should select isAuthenticated correctly", () => {
        const result = selectIsAuthenticated(mockState);
        expect(result).toBe(true);
    });

    it("should select isAuthenticated as false when no user", () => {
        const emptyState = {
            user: {
                userId: null,
                userName: null,
                email: null,
                token: null,
                isHydrated: true
            }
        };
        const result = selectIsAuthenticated(emptyState);
        expect(result).toBe(false);
    });

    it("should select userDisplayName correctly", () => {
        const result = selectUserDisplayName(mockState);
        expect(result).toBe("Tom");
    });

    it("should fallback to email when userName is null", () => {
        const stateWithEmailOnly = {
            user: {
                userId: 1,
                userName: null,
                email: "tom@example.com",
                token: "token123",
                isHydrated: true
            }
        };
        const result = selectUserDisplayName(stateWithEmailOnly);
        expect(result).toBe("tom@example.com");
    });

    it("should fallback to 'Unknown User' when both userName and email are null", () => {
        const emptyState = {
            user: {
                userId: 1,
                userName: null,
                email: null,
                token: "token123",
                isHydrated: true
            }
        };
        const result = selectUserDisplayName(emptyState);
        expect(result).toBe("Unknown User");
    });
}); 