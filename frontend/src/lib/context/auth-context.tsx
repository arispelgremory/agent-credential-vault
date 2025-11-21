"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAtomValue, useSetAtom } from "jotai"
import { sampleAgents, sampleCredentials, sampleWalletData } from "@/lib/utils/sample-data"
import { createPublicClient, createClient } from "@/constants/axios-v1"
import { saveAccessToken, saveRefreshToken, clearAuthStorage } from "@/lib/auth-storage"
import { env } from "@/env/env"
import type { AxiosError } from "axios"
import {
  userAtom,
  isAuthenticatedAtom,
  isLoadingAtom,
  agentsAtom,
  credentialsAtom,
  walletAddressAtom,
  walletBalanceAtom,
  walletConnectionStatusAtom,
  walletDidAtom,
  logoutAtom,
} from "@/store/atoms"
import { toast } from "sonner"

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserType | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<boolean>
  refreshUser: () => Promise<void>
}

// API Client Context - For dependency injection pattern
const ApiClientContext = createContext<ReturnType<typeof createClient> | null>(null)

type KYCStatus = "pending" | "in_progress" | "under_review" | "verified" | "rejected"

export type UserType = {
  userInfo: {
    userId: string
    userEmail: string
    userContactNo: string
    userFirstName: string
    userLastName: string
    gender: string
    accountId: string
    roleId: string | null
    sessionId: string | null
    status: string
    kycStatus: KYCStatus
    kycSubmittedAt: string | null
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string
    balance: number
  }
  hederaAccount: {
    hederaAccountId: string
    accountInfo: {
      accountId: string
      key: string
      balance: string
      isReceiverSignatureRequired: boolean
      expirationTime: string
      autoRenewPeriod: string
      memo: string
      isDeleted: boolean
      ethereumNonce: string
      stakingInfo: {
        declineStakingReward: boolean
        stakePeriodStart: string | null
        pendingReward: string
        stakedToMe: string
        stakedAccountId: string | null
        stakedNodeId: string | null
      }
    }
    network: string
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Jotai atoms
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const isLoading = useAtomValue(isLoadingAtom)
  const user = useAtomValue(userAtom)
  
  // Setters
  const setUser = useSetAtom(userAtom)
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom)
  const setIsLoading = useSetAtom(isLoadingAtom)
  const setAgents = useSetAtom(agentsAtom)
  const setCredentials = useSetAtom(credentialsAtom)
  const setWalletAddress = useSetAtom(walletAddressAtom)
  const setBalance = useSetAtom(walletBalanceAtom)
  const setDID = useSetAtom(walletDidAtom)
  const setConnectionStatus = useSetAtom(walletConnectionStatusAtom)
  const handleLogoutAtom = useSetAtom(logoutAtom)

  // Mock user database for demonstration
  // const mockUsers = {
  //   "demo@metamynd.io": {
  //     id: "user-demo",
  //     email: "demo@metamynd.io",
  //     firstName: "Demo",
  //     lastName: "User",
  //     kycStatus: "verified", // This user has passed KYC
  //     kycSubmittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  //     isAuthenticated: true,
  //   },
  //   "john.doe@example.com": {
  //     id: "user-456",
  //     email: "john.doe@example.com",
  //     firstName: "John",
  //     lastName: "Doe",
  //     kycStatus: "pending", // This user has not completed KYC
  //     kycSubmittedAt: null,
  //     isAuthenticated: true,
  //   },
  // }

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Check if we have an access token
      const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      
      if (!accessToken) {
        console.log("Auth check - User not authenticated")
        setIsAuthenticated(false)
        setUser(null)
        // router.push("/auth/login")
        return false
      }
      
      // Try to fetch fresh user data from API
      try {
        const authenticatedClient = createClient({
          onRefreshFail: () => {
            setIsAuthenticated(false)
            setUser(null)
            router.push("/auth/login")
          },
        })

        const profileResponse = await authenticatedClient.get("/auth/user/profile")
        const profileData: UserType = profileResponse.data.data || profileResponse.data

        // Update atoms with fresh data from API
        setUser(profileData)
        setIsAuthenticated(true)
        
        // Load sample data for the demo (you may want to fetch from API instead)
        // Check if agents/credentials/wallet data exists in storage, otherwise use samples
        const agentsStorage = localStorage.getItem("agents-storage")
        const credentialsStorage = localStorage.getItem("credentials-storage")
        const walletStorage = localStorage.getItem("wallet-storage")
        
        if (!agentsStorage) setAgents(sampleAgents)
        if (!credentialsStorage) setCredentials(sampleCredentials)
        
        if (!walletStorage) {
          setWalletAddress(sampleWalletData.address)
          setBalance(sampleWalletData.balance)
          setDID(sampleWalletData.did)
          setConnectionStatus(sampleWalletData.isConnected)
        }

        console.log("Auth check - User authenticated from API:", {
          email: profileData.userInfo.userEmail,
          kycStatus: profileData.userInfo.kycStatus,
        })

        return true
      } catch (apiError) {
        console.error("Error fetching user profile from API:", apiError)
        
        // Fallback to localStorage if API call fails
        if (typeof window !== "undefined") {
          const authStorage = localStorage.getItem("auth-storage")
          if (authStorage) {
            try {
              const authState = JSON.parse(authStorage)
              
              if (authState.user) {
                // Sync atoms with stored data as fallback
                setUser(authState.user)
                setIsAuthenticated(true)
                
                console.log("Auth check - User authenticated from localStorage (fallback):", {
                  email: authState.user.userInfo?.userEmail || authState.user.email,
                  kycStatus: authState.user.userInfo?.kycStatus || authState.user.kycStatus,
                })

                return true
              }
            } catch (e) {
              console.error("Error parsing auth storage:", e)
            }
          }
        }
        
        return false
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      setIsAuthenticated(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      // Check if API URL is configured
      const apiUrl = env.NEXT_PUBLIC_API_URL

      // if (!apiUrl) {
      //   // Fallback to mock login if API URL is not configured
      //   console.warn("API URL not configured, using mock login")
      //   await new Promise((resolve) => setTimeout(resolve, 1000))

      //   const user = mockUsers[email.toLowerCase() as keyof typeof mockUsers] || {
      //     id: "user-" + Date.now(),
      //     email: email,
      //     firstName: "New",
      //     lastName: "User",
      //     kycStatus: "pending",
      //     kycSubmittedAt: null,
      //     isAuthenticated: true,
      //   }

      //   console.log("Logging in user (mock):", user)

      //   // Save mock token for API client
      //   saveAccessToken("mock-jwt-token")

      //   // Update atoms (which will persist to localStorage)
      //   setUser(user as any)
      //   setIsAuthenticated(true)
      //   setAgents(sampleAgents)
      //   setCredentials(sampleCredentials)
      //   setWalletAddress(sampleWalletData.address)
      //   setBalance(sampleWalletData.balance)
      //   setDID(sampleWalletData.did)
      //   setConnectionStatus(sampleWalletData.isConnected)

      //   if (user.kycStatus === "verified") {
      //     router.push("/dashboard")
      //   } else if (user.kycStatus === "under_review" || user.kycStatus === "in_progress") {
      //     router.push("/onboarding")
      //   } else {
      //     console.log("AuthContext - Redirecting to KYC")
      //     router.push("/onboarding/kyc")
      //   }
      //   return
      // }

      // Make API call to login endpoint
      const publicClient = createPublicClient()
      const response = await publicClient.post("/auth/login", {
        username: email,
        password,
      })

      // Extract tokens and user data from response
      // Adjust these based on your actual API response structure
      const { accessToken, refreshToken, user: userData } = response.data.data

      if (!accessToken) {
        throw new Error("No access token received from API")
      }

      // Save tokens
      saveAccessToken(accessToken)
      if (refreshToken) {
        saveRefreshToken(refreshToken)
      }

      // Fetch user profile using authenticated client
      const authenticatedClient = createClient({
        onRefreshFail: () => {
          setIsAuthenticated(false)
          router.push("/auth/login")
        },
      })

      const profileResponse = await authenticatedClient.get("/auth/user/profile")
      const profileData: UserType = profileResponse.data.data || profileResponse.data

      // Map profile API response to UserState structure
      // const user = {
      //   id: profileData.id || profileData._id || `user-${Date.now()}`,
      //   email: profileData.email || profileData.userEmail || email,
      //   firstName: profileData.firstName || profileData.userFirstName || profileData.first_name || null,
      //   lastName: profileData.lastName || profileData.userLastName || profileData.last_name || null,
      //   kycStatus: (profileData.kycStatus || profileData.kyc_status || "pending") as "pending" | "in_progress" | "under_review" | "verified" | "rejected",
      //   kycSubmittedAt: profileData.kycSubmittedAt || profileData.kyc_submitted_at || null,
      //   kycVerifiedAt: profileData.kycVerifiedAt || profileData.kyc_verified_at || null,
      //   kycData: profileData.kycData || profileData.kyc_data || {},
      //   walletAddress: profileData.walletAddress || profileData.wallet_address || null,
      //   didDocument: profileData.didDocument || profileData.did_document || null,
      //   isAuthenticated: true,
      // }

      console.log("User profile fetched (API):", profileData)

      // Update atoms (which will persist to localStorage via atomWithLocalStorage)
      setUser(profileData)
      setIsAuthenticated(true)

      // Load sample data for the demo (you may want to fetch real data from API instead)
      // setAgents(sampleAgents)
      // setCredentials(sampleCredentials)
      
      // // Use wallet data from profile if available, otherwise use sample data
      // if (user.walletAddress) {
      //   setWalletAddress(user.walletAddress)
      // } else {
      //   setWalletAddress(sampleWalletData.address)
      // }
      
      // if (profileData.balance !== undefined) {
      //   setBalance(profileData.balance)
      // } else {
      //   setBalance(sampleWalletData.balance)
      // }
      
      // if (user.didDocument) {
      //   setDID(user.didDocument)
      // } else {
      //   setDID(sampleWalletData.did)
      // }
      
      // setConnectionStatus(true)

      // Redirect based on KYC status
      if (profileData.userInfo.kycStatus === "verified") {
        console.log("Redirecting verified user to dashboard")
        router.push("/dashboard")
      } else if (profileData.userInfo.kycStatus === "under_review" || profileData.userInfo.kycStatus === "in_progress") {
        console.log("Redirecting in-progress user to onboarding")
        router.push("/onboarding")
      } else {
        console.log("Redirecting pending user to KYC")
        router.push("/onboarding/kyc")
      }
    } catch (error) {
      console.error("Login error:", error)
      
      // Handle API errors
      if ((error as AxiosError).response) {
        const axiosError = error as AxiosError
        const status = axiosError.response?.status
        const message = (axiosError.response?.data as any)?.message || axiosError.message

        if (status === 401) {
          throw new Error("Invalid email or password")
        } else if (status === 400) {
          throw new Error(message || "Invalid request. Please check your credentials.")
        } else if (status && status >= 500) {
          throw new Error("Server error. Please try again later.")
        } else {
          throw new Error(message || "Login failed. Please try again.")
        }
      }
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const authenticatedClient = createClient({
        onRefreshFail: () => {
          setIsAuthenticated(false)
          router.push("/auth/login")
        },
      })

      const profileResponse = await authenticatedClient.get("/auth/user/profile")
      const profileData: UserType = profileResponse.data.data || profileResponse.data

      // Update the user atom with fresh data
      setUser(profileData)
      
      console.log("User profile refreshed:", profileData)
    } catch (error) {
      console.error("Error refreshing user profile:", error)
      // Don't throw - allow the component to handle the error gracefully
    }
  }

  // Logout handler that clears tokens and state
  const handleLogout = useCallback(() => {
    console.log("Logging out user")

    // Clear auth tokens
    clearAuthStorage()

    // Clear all atoms (which will also clear localStorage via atomWithLocalStorage)
    handleLogoutAtom()

    toast.success("Logged out successfully")

    // Redirect to login page
    router.push("/auth/login")
  }, [handleLogoutAtom, router])

  // Create API client with logout callback (DI injection point)
  // useMemo is needed here to prevent recreating axios instance on every render
  const apiClient = useMemo(() => {
    return createClient({
      onRefreshFail: handleLogout,
    })
  }, [handleLogout])

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Handle protected routes
  useEffect(() => {
    if (isLoading) return

    // Handle admin routes (from auth-provider)
    if (pathname.includes("/admin")) {
      if (isAuthenticated && pathname.includes("/login")) {
        router.push("/admin/dashboard")
      } else if (!isAuthenticated && !pathname.includes("/login")) {
        router.push("/admin/login")
      }
      return
    }

    // Skip for public routes
    if (
      pathname === "/en" ||
      pathname.includes("/auth/") ||
      pathname.includes("/onboarding") ||
      pathname.includes("/platform/") ||
      pathname.includes("/support/") ||
      pathname.includes("/legal/") 
    ) {
      if (pathname.startsWith("/auth") && isAuthenticated) {
        router.push("/dashboard")
      }
      return
    }

    // For dashboard routes, check authentication and KYC status
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login")
      router.push("/auth/login")
      return
    }

    if (user?.userInfo?.kycStatus !== "verified" && !pathname.includes("/onboarding")) {
      console.log("User not KYC verified, redirecting to onboarding")
      router.push("/onboarding")
      return
    }
  }, [isLoading, isAuthenticated, user, pathname, router])

  // Context value needs memoization to prevent unnecessary re-renders
  const authValue = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      login,
      logout: handleLogout,
      checkAuth,
      refreshUser,
    }),
    [isAuthenticated, isLoading, user, login, handleLogout, checkAuth, refreshUser]
  )

  return (
    <ApiClientContext.Provider value={apiClient}>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </ApiClientContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

/**
 * Hook to get the API client (DI consumption)
 * This provides access to the authenticated axios client instance
 */
export function useApiClient() {
  const client = useContext(ApiClientContext)
  if (!client) {
    throw new Error("useApiClient must be used within an AuthProvider")
  }
  return client
}

/**
 * Hook to get auth state and actions (for backward compatibility with auth-provider)
 * This is an alias for useAuth that matches the interface from the old auth-provider
 */
export function useAuthContext() {
  return useAuth()
}

/**
 * Hook to get the current user with proper TypeScript typing.
 * Guarantees a non-null UserType. Throws an error if user is not authenticated.
 * 
 * @example
 * const user = useUser()
 * console.log(user.userInfo.userEmail)
 * console.log(user.hederaAccount.hederaAccountId)
 */
export function useUser(): UserType {
  const user = useAtomValue(userAtom)
  const router = useRouter()
  const isLoading = useAtomValue(isLoadingAtom)

  // Handle SSR - don't throw during server-side rendering
  if (typeof window === "undefined") {
    // During SSR, return a placeholder or throw a special error that won't break the build
    // The component should handle this case
    throw new Error("User data is not available during SSR")
  }

  if (isLoading) {
    throw new Error("User data is still loading")
  }

  if (!user) {
    // Only show toast and redirect on client side
    if (typeof window !== "undefined") {
      toast.error("Authentication error", {
        description: "Please log in again to continue.",
      })
      router.push("/auth/login")
    }
    throw new Error("User is not authenticated")
  }

  return user
}
