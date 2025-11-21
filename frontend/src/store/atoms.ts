// store/atoms.ts
"use client";

import { atom } from "jotai";
import { atomWithLocalStorage } from "@/lib/atom-with-local-storage";
import type { Agent } from "@/lib/features/agents/agentsSlice";
import type { VerifiableCredential } from "@/lib/features/credentials/credentialsSlice";
import { UserType } from "@/lib/context/auth-context";

// Auth State
type AuthState = {
    user: UserType | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isKycVerified: boolean;
};

export const authStateAtom = atomWithLocalStorage<AuthState>("auth-storage", {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isKycVerified: false,
});

export const userAtom = atom(
    (get) => get(authStateAtom).user,
    (get, set, user: UserType | null) => set(authStateAtom, { ...get(authStateAtom), user })
);

export const isAuthenticatedAtom = atom(
    (get) => get(authStateAtom).isAuthenticated,
    (get, set, isAuthenticated: boolean) => set(authStateAtom, { ...get(authStateAtom), isAuthenticated })
);

export const isLoadingAtom = atom(
    (get) => get(authStateAtom).isLoading,
    (get, set, isLoading: boolean) => set(authStateAtom, { ...get(authStateAtom), isLoading })
);

// Agents State
type AgentsState = {
    agents: Agent[];
    isLoading: boolean;
    error: string | null;
};

export const agentsStateAtom = atomWithLocalStorage<AgentsState>("agents-storage", {
    agents: [],
    isLoading: false,
    error: null,
});

export const agentsAtom = atom(
    (get) => get(agentsStateAtom).agents,
    (get, set, agents: Agent[]) => set(agentsStateAtom, { ...get(agentsStateAtom), agents })
);

// Credentials State
type CredentialsState = {
    credentials: VerifiableCredential[];
    isLoading: boolean;
    error: string | null;
};

export const credentialsStateAtom = atomWithLocalStorage<CredentialsState>("credentials-storage", {
    credentials: [],
    isLoading: false,
    error: null,
});

export const credentialsAtom = atom(
    (get) => get(credentialsStateAtom).credentials,
    (get, set, credentials: VerifiableCredential[]) => set(credentialsStateAtom, { ...get(credentialsStateAtom), credentials })
);

// Wallet State
type WalletState = {
    address: string | null;
    balance: number;
    isConnected: boolean;
    did: string | null;
    isLoading: boolean;
    error: string | null;
    network: string | null;
};

export const walletStateAtom = atomWithLocalStorage<WalletState>("wallet-storage", {
    address: null,
    balance: 0,
    isConnected: false,
    did: null,
    isLoading: false,
    error: null,
    network: "Hedera Testnet",
});

export const walletAddressAtom = atom(
    (get) => get(walletStateAtom).address,
    (get, set, address: string | null) => set(walletStateAtom, { ...get(walletStateAtom), address })
);

export const walletBalanceAtom = atom(
    (get) => get(walletStateAtom).balance,
    (get, set, balance: number) => set(walletStateAtom, { ...get(walletStateAtom), balance })
);

export const walletConnectionStatusAtom = atom(
    (get) => get(walletStateAtom).isConnected,
    (get, set, isConnected: boolean) => set(walletStateAtom, { ...get(walletStateAtom), isConnected })
);

export const walletDidAtom = atom(
    (get) => get(walletStateAtom).did,
    (get, set, did: string | null) => set(walletStateAtom, { ...get(walletStateAtom), did })
);

// Actions
export const loginAtom = atom(null, (get, set, user: UserType) => {
    set(isLoadingAtom, true);
    set(userAtom, user);
    set(isAuthenticatedAtom, true);
    set(isLoadingAtom, false);
});

export const logoutAtom = atom(null, (get, set) => {
    set(userAtom, null);
    set(isAuthenticatedAtom, false);
    set(agentsAtom, []);
    set(credentialsAtom, []);
    set(walletAddressAtom, null);
    set(walletBalanceAtom, 0);
    set(walletConnectionStatusAtom, false);
    set(walletDidAtom, null);
});

// Onboarding State
type OnboardingKYCData = {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    nationality?: string;
    idType?: "passport" | "national_id" | "drivers_license";
    idNumber?: string;
    idDocument?: File | null;
    addressDocument?: File | null;
    selfieImage?: File | null;
    address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
};

type OnboardingState = {
    kycData: OnboardingKYCData;
};

export const onboardingStateAtom = atomWithLocalStorage<OnboardingState>("onboarding-storage", {
    kycData: {},
});

export const onboardingKycDataAtom = atom(
    (get) => get(onboardingStateAtom).kycData,
    (get, set, kycData: Partial<OnboardingKYCData>) => {
        const current = get(onboardingStateAtom);
        set(onboardingStateAtom, {
            ...current,
            kycData: { ...current.kycData, ...kycData },
        });
    }
);

// Action to update KYC status in user
export const updateKYCStatusAtom = atom(null, (get, set, status: "pending" | "in_progress" | "under_review" | "verified" | "rejected") => {
    const user = get(userAtom);
    if (user) {
        set(userAtom, { ...user, kycStatus: status });
    }
});

// Action to update KYC submitted at
export const updateKYCSubmittedAtAtom = atom(null, (get, set, submittedAt: string | null) => {
    const user = get(userAtom);
    if (user) {
        set(userAtom, { ...user, kycSubmittedAt: submittedAt });
    }
});
