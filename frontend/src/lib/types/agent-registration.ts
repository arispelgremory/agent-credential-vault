import type { StructuredPermission } from "./permissions"

export interface AgentRegistrationData {
  // Basic Information
  name: string
  description: string
  purpose: string

  // Legal Owner Information
  ownerDID: string
  ownerName: string
  ownerVerificationStatus: "pending" | "verified" | "rejected"

  // Agent Identity
  agentDID?: string
  hederaAccountId?: string
  privateKeySecured?: boolean

  // Wallet Information
  walletAddress?: string
  initialHbarAmount?: number

  // Ownership Attestation
  ownershipVC?: {
    id: string
    issuanceDate: string
    expirationDate?: string
  }

  // Token Information
  nftTokenId?: string
  fungibleTokens?: FungibleTokenAssignment[]

  // Permissions
  permissions: StructuredPermission[]

  // Smart Contract Configuration
  smartContractConfig?: SmartContractConfig
}

export interface FungibleTokenAssignment {
  tokenSymbol: string // e.g., "USDC"
  tokenId: string // Hedera token ID
  amount: number // Amount to assign
  spendingLimit?: {
    daily?: number
    weekly?: number
    monthly?: number
  }
  allowedRecipients?: string[] // Whitelist of allowed recipient addresses
}

export interface SmartContractConfig {
  contractId?: string
  enforcePermissions: boolean
  enforceSpendingLimits: boolean
  requireOwnerApproval: boolean
  approvalThreshold?: number // Amount above which owner approval is required
}
