import { configureStore } from "@reduxjs/toolkit"
import onboardingReducer from "./features/onboarding/onboardingSlice"
import walletReducer from "./features/wallet/walletSlice"
import credentialsReducer from "./features/credentials/credentialsSlice"
import agentsReducer from "./features/agents/agentsSlice"
import userReducer from "./features/user/userSlice"

export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
    wallet: walletReducer,
    credentials: credentialsReducer,
    agents: agentsReducer,
    user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
