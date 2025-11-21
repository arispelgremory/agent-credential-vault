import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Token {
  name: string
  balance?: string
  value?: string
  count?: number
}

interface WalletState {
  address: string | null
  balance: number
  isConnected: boolean
  did: string | null
  isLoading: boolean
  error: string | null
  network: string | null
  tokens: Token[]
}

const initialState: WalletState = {
  address: null,
  balance: 0,
  isConnected: false,
  did: null,
  isLoading: false,
  error: null,
  network: "Hedera Testnet",
  tokens: [],
}

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload
    },
    setBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },
    setDID: (state, action: PayloadAction<string>) => {
      state.did = action.payload
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setNetwork: (state, action: PayloadAction<string>) => {
      state.network = action.payload
    },
    setTokens: (state, action: PayloadAction<Token[]>) => {
      state.tokens = action.payload
    },
    resetWallet: (state) => {
      return initialState
    },
  },
})

export const {
  setWalletAddress,
  setBalance,
  setConnectionStatus,
  setDID,
  setIsLoading,
  setError,
  setNetwork,
  setTokens,
  resetWallet,
} = walletSlice.actions

export default walletSlice.reducer
