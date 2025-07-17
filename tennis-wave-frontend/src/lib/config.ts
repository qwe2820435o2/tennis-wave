// API Configuration
export const API_CONFIG = {
    // Base URL for API requests
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://tennis-wave-production.up.railway.app",
    
    // SignalR Hub URL
    SIGNALR_URL: process.env.NEXT_PUBLIC_API_URL || "https://tennis-wave-production.up.railway.app",
    
    // API Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: "/api/Auth/login",
            REGISTER: "/api/Auth/register",
        },
        USER: {
            BASE: "/api/user",
            RECOMMENDED_PARTNERS: "/api/user/recommended-partners",
            SEARCH: "/api/user/search-simple",
            PAGINATED: "/api/user/paginated",
        },
        CHAT: {
            CONVERSATIONS: "/api/chat/conversations",
            MESSAGES: "/api/chat/conversations",
            UNREAD_COUNTS: "/api/chat/unread-counts",
        },
        TENNIS_BOOKING: {
            BASE: "/api/tennisbooking",
            SEARCH: "/api/tennisbooking/search",
            REQUESTS: "/api/tennisbooking/requests",
        },
        SIGNALR: {
            CHAT_HUB: "/chatHub",
        },
    },
    
    // Request Configuration
    REQUEST_CONFIG: {
        TIMEOUT: 30000, // 30 seconds
        RETRY_ATTEMPTS: 3,
    },
    
    // Environment Detection
    IS_PRODUCTION: process.env.NODE_ENV === "production",
    IS_DEVELOPMENT: process.env.NODE_ENV === "development",
};

// Debug logging
if (typeof window !== "undefined") {
    console.log("🔧 API Configuration:", {
        BASE_URL: API_CONFIG.BASE_URL,
        IS_PRODUCTION: API_CONFIG.IS_PRODUCTION,
        IS_DEVELOPMENT: API_CONFIG.IS_DEVELOPMENT,
    });
} 