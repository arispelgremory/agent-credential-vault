import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface VerifiableCredential {
  id: string
  name: string
  description: string
  issuanceDate: string
  expirationDate: string | null
  permissions: string[]
  tokenId: string
  isActive: boolean
  agentId: string
}

interface CredentialsState {
  credentials: VerifiableCredential[]
  isLoading: boolean
  error: string | null
}

const initialState: CredentialsState = {
  credentials: [],
  isLoading: false,
  error: null,
}

const credentialsSlice = createSlice({
  name: "credentials",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<VerifiableCredential[]>) => {
      state.credentials = action.payload
    },
    addCredential: (state, action: PayloadAction<VerifiableCredential>) => {
      state.credentials.push(action.payload)
    },
    updateCredential: (state, action: PayloadAction<{ id: string; updates: Partial<VerifiableCredential> }>) => {
      const index = state.credentials.findIndex((cred) => cred.id === action.payload.id)
      if (index !== -1) {
        state.credentials[index] = {
          ...state.credentials[index],
          ...action.payload.updates,
        }
      }
    },
    revokeCredential: (state, action: PayloadAction<string>) => {
      const index = state.credentials.findIndex((cred) => cred.id === action.payload)
      if (index !== -1) {
        state.credentials[index].isActive = false
      }
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setCredentials, addCredential, updateCredential, revokeCredential, setIsLoading, setError } =
  credentialsSlice.actions

export default credentialsSlice.reducer
