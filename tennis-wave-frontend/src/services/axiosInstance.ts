import axios from "axios";
import {toast} from "sonner";
import { store } from "@/store";
import { clearUser } from "@/store/slices/userSlice";

// Create axios instance
const instance = axios.create({
    baseURL: 'http://localhost:5161'
});

// Add token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
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
                });
                setTimeout(() => {
                    window.location.href = "/auth/login";
                    hasShownSessionExpired = false;
                }, 1500);
            }
            return Promise.reject(error);
        }
);

export default instance;