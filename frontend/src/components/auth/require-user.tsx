"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAuthContext } from "@/lib/context/auth-context";
import { UserType } from "@/lib/context/auth-context";

// Non-null user context (DI for authenticated user)
const AuthedUserContext = createContext<UserType | null>(null);

type RequireUserProps = {
    children: ReactNode;
    fallback?: ReactNode;
    redirectTo?: string;
};

/**
 * RequireUser component - This is the DI boundary
 * It checks authentication at the layout/route level
 * and provides a guaranteed non-null user to children
 */
export function RequireUser({ children, fallback = <div>Loading...</div>, redirectTo }: RequireUserProps) {
    const { user, isLoading, isAuthenticated } = useAuthContext();

    // Show loading while checking auth
    if (isLoading) {
        return <>{fallback}</>;
    }

    // Redirect or show error if not authenticated
    if (!isAuthenticated || !user) {
        if (redirectTo) {
            // In Next.js, use router.push in a useEffect
            return <UnauthenticatedRedirect to={redirectTo} />;
        }
        return (
            <div>
                <p>Please log in to access this page.</p>
            </div>
        );
    }

    // ✅ From this point down, user is DEFINITELY not null
    // Provide it via context so children can access it without null checks
    return <AuthedUserContext.Provider value={user}>{children}</AuthedUserContext.Provider>;
}

// Component to handle redirect in client component
function UnauthenticatedRedirect({ to }: { to: string }) {
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            window.location.href = to;
        }
    }, [to]);
    return null;
}

/**
 * useAuthedUser hook - Returns a guaranteed non-null user
 * Must be used within <RequireUser> component
 */
export function useAuthedUser(): UserType {
    const user = useContext(AuthedUserContext);
    if (!user) {
        throw new Error("useAuthedUser must be used within <RequireUser> component");
    }
    return user; // ✅ Always non-null here
}
