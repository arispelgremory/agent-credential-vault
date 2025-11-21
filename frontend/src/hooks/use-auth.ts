"use client";

import { useRouter } from "next/navigation";
import { useAuth as useAuthContext } from "@/lib/context/auth-context";

/**
 * Legacy useAuth hook - now uses unified AuthProvider
 * This maintains backward compatibility while using the unified auth context
 */
export function useAuth() {
    const authContext = useAuthContext();
    const router = useRouter();

    const logout = () => {
        authContext.logout();
        // Navigate after logout
        router.push("/");
    };

    // Refresh token is now handled automatically by axios interceptor
    // This is kept for backward compatibility but will always return false
    const refreshAuthToken = async () => {
        // Refresh logic is now in axios interceptor
        // If refresh fails, logout callback is automatically called
        return false;
    };

    return {
        user: authContext.user,
        isAuthenticated: authContext.isAuthenticated,
        isLoading: authContext.isLoading,
        login: authContext.login,
        logout,
        refreshAuthToken,
    };
}
