import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

// Define the possible stages of the onboarding process
export enum OnboardingStage {
  WELCOME = "welcome",
  PERSONAL_INFO = "personal_info",
  ID_UPLOAD = "id_upload",
  ADDRESS_UPLOAD = "address_upload",
  SELFIE = "selfie",
  VERIFICATION = "verification",
  WALLET_CREATION = "wallet_creation",
  DID_GENERATION = "did_generation",
  COMPLETE = "complete",
}

// Define the structure of our KYC data
export interface KYCData {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  nationality?: string
  idType?: "passport" | "national_id" | "drivers_license"
  idNumber?: string
  idDocument?: File | null
  addressDocument?: File | null
  selfieImage?: File | null
  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

// Define the overall state structure for onboarding
interface OnboardingState {
  currentStage: OnboardingStage
  completedStages: OnboardingStage[]
  kycData: KYCData
  kycVerified: boolean
  isLoading: boolean
  error: string | null
}

// Initialize the state
const initialState: OnboardingState = {
  currentStage: OnboardingStage.WELCOME,
  completedStages: [],
  kycData: {},
  kycVerified: false,
  isLoading: false,
  error: null,
}

// Create the slice
const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setCurrentStage: (state, action: PayloadAction<OnboardingStage>) => {
      state.currentStage = action.payload
    },
    completeStage: (state, action: PayloadAction<OnboardingStage>) => {
      if (!state.completedStages.includes(action.payload)) {
        state.completedStages.push(action.payload)
      }
    },
    updateKYCData: (state, action: PayloadAction<Partial<KYCData>>) => {
      state.kycData = { ...state.kycData, ...action.payload }
    },
    setKYCVerified: (state, action: PayloadAction<boolean>) => {
      state.kycVerified = action.payload
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetOnboarding: (state) => {
      return initialState
    },
  },
})

export const {
  setCurrentStage,
  completeStage,
  updateKYCData,
  setKYCVerified,
  setIsLoading,
  setError,
  resetOnboarding,
} = onboardingSlice.actions

export default onboardingSlice.reducer
