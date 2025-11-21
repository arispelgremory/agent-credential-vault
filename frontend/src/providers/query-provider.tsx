// providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useState, useRef, useEffect } from "react";
import { AxiosError } from "axios";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, logout } = useAuth();
    const router = useRouter();

    // Use refs to store latest values for closure (React 19 best practice)
    // This ensures the QueryClient closure always reads the latest values
    const authRef = useRef({ isAuthenticated, logout, router });

    // Update ref when values change (React 19 handles this efficiently)
    // The closure captures the ref object, so reading ref.current gets latest values
    useEffect(() => {
        authRef.current.isAuthenticated = isAuthenticated;
        authRef.current.logout = logout;
        authRef.current.router = router;
    }, [isAuthenticated, logout, router]);

    // React 19: useState with lazy initialization is still recommended for expensive computations
    // eslint-disable-next-line react-hooks/refs
    const [queryClient] = useState(() => {
        return new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 60_000,
                    gcTime: 10 * 60_000,
                    retry: (failureCount, error: any) => {
                        if (error?.response?.status >= 400 && error?.response?.status < 500) {
                            if (error?.response?.status === 408 || error?.response?.status === 429) {
                                return failureCount < 3;
                            }
                            return false;
                        }
                        return failureCount < 3;
                    },
                },
                mutations: {
                    retry: (failureCount, error: any) => {
                        if (error?.response?.status >= 400 && error?.response?.status < 500) {
                            return false;
                        }
                        return failureCount < 2;
                    },
                },
            },
            queryCache: new QueryCache({
                onError: async (error) => {
                    // Note: 401 handling is now done in axios interceptor
                    // This is just a fallback for any 401s that slip through
                    if (error instanceof AxiosError) {
                        // Access ref only when error handler is called, not during render

                        const {
                            isAuthenticated: currentAuth,
                            logout: currentLogout,
                            router: currentRouter,
                        } = authRef.current;
                        if (error.response?.status === 401 && currentAuth) {
                            // Logout is already handled by axios interceptor's onRefreshFail callback
                            currentLogout();
                            currentRouter.push("/");
                        }
                    }
                },
            }),
        });
    });

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        </QueryClientProvider>
    );
}
