import axios from "axios";
import { store } from "@/store";
import { clearUser } from "@/store/slices/userSlice";
import {toast} from "sonner";

// Create axios instance
const instance = axios.create();

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