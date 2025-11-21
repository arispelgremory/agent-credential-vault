import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface ActivityLog {
  id: string
  agentId: string
  action: string
  timestamp: string
  status: "success" | "failed" | "pending"
  thirdPartySystem?: string
  details?: string
}

export interface Agent {
  id: string
  name: string
  description: string
  createdAt: string
  permissions: string[]
  credentialIds: string[]
  isActive: boolean
  activityLogs: ActivityLog[]
}

interface AgentsState {
  agents: Agent[]
  isLoading: boolean
  error: string | null
}

const initialState: AgentsState = {
  agents: [],
  isLoading: false,
  error: null,
}

const agentsSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<Agent[]>) => {
      state.agents = action.payload
    },
    addAgent: (state, action: PayloadAction<Agent>) => {
      state.agents.push(action.payload)
    },
    updateAgent: (state, action: PayloadAction<{ id: string; updates: Partial<Agent> }>) => {
      const index = state.agents.findIndex((agent) => agent.id === action.payload.id)
      if (index !== -1) {
        state.agents[index] = {
          ...state.agents[index],
          ...action.payload.updates,
        }
      }
    },
    disableAgent: (state, action: PayloadAction<string>) => {
      const index = state.agents.findIndex((agent) => agent.id === action.payload)
      if (index !== -1) {
        state.agents[index].isActive = false
      }
    },
    addActivityLog: (state, action: PayloadAction<{ agentId: string; log: ActivityLog }>) => {
      const agent = state.agents.find((agent) => agent.id === action.payload.agentId)
      if (agent) {
        agent.activityLogs.push(action.payload.log)
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

export const { setAgents, addAgent, updateAgent, disableAgent, addActivityLog, setIsLoading, setError } =
  agentsSlice.actions

export default agentsSlice.reducer
