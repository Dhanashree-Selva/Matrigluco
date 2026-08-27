import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { tokenStore } from "./token-store";
import { authApi } from "../api/auth";
import { onAuthStateChange } from "../api/client";
import { queryClient } from "../query/client";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => tokenStore.getUser());
    const [token, setToken] = useState(() => tokenStore.getAccessToken());
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const current = await authApi.getCurrentUser();
            if (current) {
                setUser(current);
            }
            return current;
        } catch (err) {
            console.warn("Background user refresh error:", err);
            return null;
        }
    }, []);

    useEffect(() => {
        const storedToken = tokenStore.getAccessToken();
        const storedUser = tokenStore.getUser();

        if (storedToken && storedUser) {
            setUser(storedUser);
            setToken(storedToken);
            refreshUser().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }

        const unsubscribe = onAuthStateChange((event, data) => {
            if (data?.token && data?.user) {
                setUser(data.user);
                setToken(data.token);
            } else {
                setUser(null);
                setToken(null);
                queryClient.clear();
            }
        });

        return () => unsubscribe();
    }, [refreshUser]);

    const login = async (email, password) => {
        const result = await authApi.login(email, password);
        setUser(result.user);
        setToken(result.access_token);
        return result;
    };

    const register = async (payload) => {
        const result = await authApi.register(payload);
        setUser(result.user);
        setToken(result.access_token);
        return result;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            setToken(null);
            tokenStore.clear();
            queryClient.clear();
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
