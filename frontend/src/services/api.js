import axios from "axios";
import { auth } from "./firebase";

// ── Axios Instance ─────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8001",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request Interceptor: attach Firebase idToken ──────────────────────────────
api.interceptors.request.use(
    async (config) => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                // forceRefresh=false → uses cached token if not expired
                const token = await currentUser.getIdToken(false);
                config.headers.Authorization = `Bearer ${token}`;
            } catch (err) {
                console.warn("[api] Could not get Firebase token:", err.message);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor: handle 401 token expiry ────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet, force-refresh the token and retry
        if (
            error.response?.status === 401 &&
            !originalRequest._retried &&
            auth.currentUser
        ) {
            originalRequest._retried = true;
            try {
                const freshToken = await auth.currentUser.getIdToken(true); // force refresh
                originalRequest.headers.Authorization = `Bearer ${freshToken}`;
                return api(originalRequest);
            } catch {
                console.error("[api] Token refresh failed, logging out.");
                await auth.signOut();
            }
        }

        return Promise.reject(error);
    }
);

export default api;
