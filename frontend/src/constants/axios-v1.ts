// lib/http/client.ts
"use client";

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, saveAccessToken, saveRefreshToken } from "@/lib/auth-storage";
import { env } from "@/env/env";

type CreateClientParams = {
    onRefreshFail: () => void;
};

export function createClient({ onRefreshFail }: CreateClientParams): AxiosInstance {
    // Use client-safe environment variable (t3-oss/env-nextjs ensures type safety)
    const instance = axios.create({
        baseURL: `${env.NEXT_PUBLIC_API_URL}/v1`,
        headers: {
            "Content-Type": "application/json",
        },
        // if you use cookies etc: withCredentials: true,
    });

    let isRefreshing = false;
    let failedQueue: Array<{ resolve: (value?: any) => void; reject: (err: any) => void }> = [];

    const processQueue = (error: any, token: string | null = null) => {
        failedQueue.forEach((prom) => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });
        failedQueue = [];
    };

    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = getAccessToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as any;

            // only trigger if 401, not _retry flagged
            if (error.response?.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    // queue the request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then((token) => {
                        if (!originalRequest.headers) originalRequest.headers = {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return instance(originalRequest);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refreshToken = getRefreshToken();
                    if (!refreshToken) {
                        throw new Error("No refresh token");
                    }

                    // Use the same instance to respect baseURL and interceptors
                    const { data } = await instance.post("/auth/refresh", { refreshToken });

                    const newAccessToken = data.accessToken;
                    saveAccessToken(newAccessToken);

                    // Save new refresh token if provided (some APIs rotate refresh tokens)
                    if (data.refreshToken) {
                        saveRefreshToken(data.refreshToken);
                    }

                    instance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);

                    return instance(originalRequest);
                } catch (err) {
                    processQueue(err, null);
                    onRefreshFail();
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );

    return instance;
}

/**
 * Create a public axios instance for unauthenticated endpoints
 * (e.g., login, register, password reset)
 * This instance doesn't include auth interceptors since no token is needed
 */
export function createPublicClient(): AxiosInstance {
    const apiUrl = env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured. Please set it in your environment variables.");
    }
    return axios.create({
        baseURL: `${apiUrl}/v1`,
        headers: {
            "Content-Type": "application/json",
        },
    });
}
