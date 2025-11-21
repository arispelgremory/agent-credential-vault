import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type KYCStatus = "pending" | "in_progress" | "under_review" | "verified" | "rejected"

export interface UserState {
  id: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  kycStatus: KYCStatus | null
  kycSubmittedAt: string | null
  kycVerifiedAt?: string | null
  kycData: {
    personalInfo?: {
      dateOfBirth?: string
      nationality?: string
      idType?: string
      idNumber?: string
    }
    address?: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
    }
    documents?: {
      idDocument?: {
        name: string
        type?: string
        uploadedAt: string
        verificationStatus: "pending" | "verified" | "rejected"
      }
      addressDocument?: {
        name: string
        type?: string
        uploadedAt: string
        verificationStatus: "pending" | "verified" | "rejected"
      }
      selfieImage?: {
        name: string
        uploadedAt: string
        verificationStatus: "pending" | "verified" | "rejected"
      }
    }
  }
  isAuthenticated: boolean
  walletAddress?: string
  didDocument?: string
}

const initialState: UserState = {
  id: null,
  email: null,
  firstName: null,
  lastName: null,
  kycStatus: null,
  kycSubmittedAt: null,
  kycData: {},
  isAuthenticated: false,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
      }
    },
    updateKYCData: (state, action: PayloadAction<Partial<UserState["kycData"]>>) => {
      state.kycData = {
        ...state.kycData,
        ...action.payload,
      }
    },
    updateKYCStatus: (state, action: PayloadAction<KYCStatus>) => {
      state.kycStatus = action.payload
      if (action.payload === "verified" || action.payload === "rejected") {
        state.kycSubmittedAt = new Date().toISOString()
      }
    },
    updateKYCSubmittedAt: (state, action: PayloadAction<string | null>) => {
      state.kycSubmittedAt = action.payload
    },
    logout: (state) => {
      return initialState
    },
  },
})

export const { setUser, updateKYCData, updateKYCStatus, updateKYCSubmittedAt, logout } = userSlice.actions

export default userSlice.reducer
