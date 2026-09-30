import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 detik (cukup longgar untuk proses generative AI)
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Menyisipkan JWT Bearer Token otomatis jika user sedang login
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Penanganan respon dan pembersihan sesi jika token kedaluwarsa
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Jika token tidak valid / kedaluwarsa (HTTP 401)
        if (error.response && error.response.status === 401) {
            const isAuthRoute =
                error.config?.url?.includes("/api/auth/login") ||
                error.config?.url?.includes("/api/auth/register");

            // Hanya bersihkan sesi jika bukan kegagalan form login/register biasa
            if (!isAuthRoute) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
