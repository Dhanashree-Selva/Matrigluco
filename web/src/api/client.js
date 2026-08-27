import axios from "axios";

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api/v1";

const TOKEN_KEY = "matrigluco_access_token";
const REFRESH_KEY = "matrigluco_refresh_token";
const USER_KEY = "matrigluco_user";

export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setSessionData(accessToken, refreshToken, user) {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    else localStorage.removeItem(TOKEN_KEY);

    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_KEY);

    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);

    notifyAuthListeners();
}

export function clearSessionData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    notifyAuthListeners();
}

const authListeners = new Set();
export function onAuthStateChange(callback) {
    authListeners.add(callback);
    return () => authListeners.delete(callback);
}

function notifyAuthListeners() {
    const user = getStoredUser();
    const token = getStoredToken();
    const event = token && user ? "SIGNED_IN" : "SIGNED_OUT";
    authListeners.forEach(listener => {
        try {
            listener(event, { user, token });
        } catch (err) {
            console.error("Auth listener error:", err);
        }
    });
}

// ── Axios Client Instance ───────────────────────────────────────────────────

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(
    (config) => {
        const token = getStoredToken();
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: single-flight 401 token refresh queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/login") &&
            !originalRequest.url.includes("/auth/refresh")
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getStoredRefreshToken();
            if (!refreshToken) {
                clearSessionData();
                isRefreshing = false;
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });
                const { access_token, refresh_token: newRefreshToken, user } = res.data;
                setSessionData(access_token, newRefreshToken || refreshToken, user || getStoredUser());

                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                processQueue(null, access_token);
                return apiClient(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                clearSessionData();
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
