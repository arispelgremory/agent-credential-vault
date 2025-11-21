import type { Agent, ActivityLog } from "@/lib/features/agents/agentsSlice"
import type { VerifiableCredential } from "@/lib/features/credentials/credentialsSlice"

// Sample activity logs
const createSampleActivityLogs = (agentId: string, count: number): ActivityLog[] => {
  const actions = [
    "Book medical appointment",
    "Access health records",
    "Make payment",
    "Schedule meeting",
    "Send email",
    "Update calendar",
    "Access document",
    "Verify identity",
  ]

  const systems = [
    "Hospital Booking System",
    "Calendar API",
    "Email Service",
    "Payment Gateway",
    "Document Storage",
    "Identity Provider",
  ]

  const statuses: Array<"success" | "failed" | "pending"> = [
    "success",
    "success",
    "success",
    "success",
    "failed",
    "pending",
  ]

  return Array.from({ length: count }).map((_, index) => {
    const action = actions[Math.floor(Math.random() * actions.length)]
    const system = systems[Math.floor(Math.random() * systems.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 7))

    return {
      id: `log-${agentId}-${index}`,
      agentId,
      action,
      timestamp: date.toISOString(),
      status,
      thirdPartySystem: system,
      details: status === "failed" ? "Authorization failed - permission expired" : undefined,
    }
  })
}

// Sample agents
export const sampleAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Medical Assistant",
    description: "AI agent for handling medical appointments and records",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["Medical.Schedule", "Medical.Records.Read"],
    credentialIds: ["vc-1"],
    isActive: true,
    activityLogs: createSampleActivityLogs("agent-1", 8),
  },
  {
    id: "agent-2",
    name: "Financial Advisor",
    description: "AI agent for financial advice and transactions",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["Financial.Advice", "Financial.Records.Read"],
    credentialIds: ["vc-2"],
    isActive: true,
    activityLogs: createSampleActivityLogs("agent-2", 5),
  },
  {
    id: "agent-3",
    name: "Calendar Manager",
    description: "AI agent for managing calendar and scheduling",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["Calendar.Read", "Calendar.Write", "Email.Send"],
    credentialIds: ["vc-3"],
    isActive: true,
    activityLogs: createSampleActivityLogs("agent-3", 12),
  },
  {
    id: "agent-4",
    name: "Document Assistant",
    description: "AI agent for document management",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["Documents.Read", "Documents.Write"],
    credentialIds: ["vc-4"],
    isActive: false,
    activityLogs: createSampleActivityLogs("agent-4", 3),
  },
  {
    id: "agent-5",
    name: "Travel Planner",
    description: "AI agent for travel planning and booking",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["Travel.Book", "Calendar.Write", "Payment.Authorize"],
    credentialIds: ["vc-5"],
    isActive: true,
    activityLogs: createSampleActivityLogs("agent-5", 6),
  },
]

// Sample verifiable credentials
export const sampleCredentials: VerifiableCredential[] = [
  {
    id: "vc-1",
    name: "Medical Appointments",
    description: "Authorize AI agent to schedule medical appointments",
    issuanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    expirationDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["Medical.Schedule", "Medical.Records.Read"],
    tokenId: "0.0.123456",
    isActive: true,
    agentId: "agent-1",
  },
  {
    id: "vc-2",
    name: "Financial Advice",
    description: "Authorize AI agent to access financial records and provide advice",
    issuanceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    expirationDate: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["Financial.Advice", "Financial.Records.Read"],
    tokenId: "0.0.123457",
    isActive: true,
    agentId: "agent-2",
  },
  {
    id: "vc-3",
    name: "Calendar Management",
    description: "Authorize AI agent to manage calendar and send emails",
    issuanceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    expirationDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["Calendar.Read", "Calendar.Write", "Email.Send"],
    tokenId: "0.0.123458",
    isActive: true,
    agentId: "agent-3",
  },
  {
    id: "vc-4",
    name: "Document Management",
    description: "Authorize AI agent to manage documents",
    issuanceDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    expirationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["Documents.Read", "Documents.Write"],
    tokenId: "0.0.123459",
    isActive: false,
    agentId: "agent-4",
  },
  {
    id: "vc-5",
    name: "Travel Booking",
    description: "Authorize AI agent to book travel and make payments",
    issuanceDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    expirationDate: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["Travel.Book", "Calendar.Write", "Payment.Authorize"],
    tokenId: "0.0.123460",
    isActive: true,
    agentId: "agent-5",
  },
]

// Sample wallet data
export const sampleWalletData = {
  address: "0.0.1234567",
  balance: 100.5,
  did: "did:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxufgeVHEQcy5GRQe",
  isConnected: true,
}

// Sample user data
export const sampleUserData = {
  id: "user-1",
  email: "demo@metamynd.io",
  firstName: "Alex",
  lastName: "Morgan",
  isAuthenticated: true,
  kycStatus: "verified",
  kycSubmittedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  kycVerifiedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
  walletAddress: "0.0.1234567",
  didDocument: "did:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxufgeVHEQcy5GRQe",
  kycData: {
    personalInfo: {
      dateOfBirth: "1985-06-15",
      nationality: "United States",
      idType: "Passport",
      idNumber: "P123456789",
    },
    address: {
      line1: "123 Main Street",
      line2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "United States",
    },
    documents: {
      idDocument: {
        name: "passport.jpg",
        uploadedAt: new Date(Date.now() - 62 * 24 * 60 * 60 * 1000).toISOString(),
        verificationStatus: "verified",
      },
      addressDocument: {
        name: "utility_bill.pdf",
        uploadedAt: new Date(Date.now() - 62 * 24 * 60 * 60 * 1000).toISOString(),
        verificationStatus: "verified",
      },
      selfieImage: {
        name: "selfie.jpg",
        uploadedAt: new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString(),
        verificationStatus: "verified",
      },
    },
  },
}
