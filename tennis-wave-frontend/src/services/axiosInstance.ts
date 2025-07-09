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
                id: "session-expired"
            });
            setTimeout(() => {
                window.location.href = "/auth/login";
                hasShownSessionExpired = false;
            }, 1500);
            // 返回特殊对象，业务层可识别
            return Promise.reject({ isAuthError: true });
        }
        // 401但已弹过toast，业务层也可识别
        if (error.response && error.response.status === 401) {
            return Promise.reject({ isAuthError: true });
        }
        return Promise.reject(error);
    }
);

export default instance;