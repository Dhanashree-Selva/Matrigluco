const ACCESS_TOKEN_KEY = "matrigluco_access_token";
const REFRESH_TOKEN_KEY = "matrigluco_refresh_token";
const USER_KEY = "matrigluco_user";

export const tokenStore = {
    getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    getUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    setSession(accessToken, refreshToken, user) {
        if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        else localStorage.removeItem(ACCESS_TOKEN_KEY);

        if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        else localStorage.removeItem(REFRESH_TOKEN_KEY);

        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
        else localStorage.removeItem(USER_KEY);
    },

    clearSession() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
