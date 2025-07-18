import axios from "axios";
import {toast} from "sonner";
import { store } from "@/store";
import { clearUser } from "@/store/slices/userSlice";
import { API_CONFIG } from "@/lib/config";

// Debug: Log environment variables
console.log("🔍 Environment Variables Debug:");
console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

// Use environment variable for API URL
const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.REQUEST_CONFIG.TIMEOUT,
    // baseURL: "https://tennis-wave-api-production.up.railway.app" // public networking
    // baseURL: process.env.NEXT_PUBLIC_API_URL || http://localhost:5161 // original code
});

// Debug: Log the actual baseURL being used
console.log("🚀 Axios instance created with baseURL:", instance.defaults.baseURL);

// Add token
instance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let hasShownSessionExpired = false;

// Handle 401
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response &&
            error.response.status === 401 &&
            !hasShownSessionExpired
        ) {
            hasShownSessionExpired = true;
            // Clear user state
            store.dispatch(clearUser());
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            
            toast.error("Session expired", {
                description: "Session expired, please log in again.",
                id: "session-expired"
            });
            setTimeout(() => {
                window.location.href = "/auth/login";
                hasShownSessionExpired = false;
            }, 1500);
            // Return a special object, recognizable by business layer
            return Promise.reject({ isAuthError: true });
        }
        // 401 but toast already shown, also recognizable by business layer
        if (error.response && error.response.status === 401) {
            return Promise.reject({ isAuthError: true });
        }
        return Promise.reject(error);
    }
);

export default instance;