"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AgentRegistrationData } from "@/lib/types/agent-registration"
import type { StructuredPermission } from "@/lib/types/permissions"

interface AgentReviewProps {
  registrationData: AgentRegistrationData
}

export function AgentReview({ registrationData }: AgentReviewProps) {
  // Helper function to render permission details
  const renderPermissionDetails = (permission: StructuredPermission) => {
    switch (permission.type) {
      case "DataAccess":
        return (
          <div className="text-xs">
            <span className="font-medium">Resource:</span> {permission.value.resource},
            <span className="font-medium"> Access:</span> {permission.value.access}
          </div>
        )
      case "Action":
        return (
          <div className="text-xs">
            <span className="font-medium">Action:</span> {permission.value.action}
            {permission.value.max_calls && (
              <>
                , <span className="font-medium">Max calls:</span> {permission.value.max_calls}
              </>
            )}
          </div>
        )
      case "Temporal":
        return (
          <div className="text-xs">
            {permission.value.window && (
              <>
                <span className="font-medium">Window:</span> {permission.value.window}
              </>
            )}
            {permission.value.days && (
              <>
                , <span className="font-medium">Days:</span> {permission.value.days.join(", ")}
              </>
            )}
          </div>
        )
      case "Geographic":
        return (
          <div className="text-xs">
            {permission.value.region && (
              <>
                <span className="font-medium">Region:</span> {permission.value.region}
              </>
            )}
            {permission.value.coordinates && (
              <>
                , <span className="font-medium">Coordinates:</span> {permission.value.coordinates.lat},{" "}
                {permission.value.coordinates.lng}
              </>
            )}
          </div>
        )
      case "Delegation":
        return (
          <div className="text-xs">
            <span className="font-medium">Max depth:</span> {permission.value.max_depth}
            {permission.value.approved_agents && (
              <>
                , <span className="font-medium">Approved agents:</span> {permission.value.approved_agents.join(", ")}
              </>
            )}
          </div>
        )
      case "Ethical":
        return (
          <div className="text-xs">
            <span className="font-medium">Standard:</span> {permission.value.standard}
            {permission.value.rules && (
              <>
                , <span className="font-medium">Rules:</span> {permission.value.rules.join(", ")}
              </>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Review Agent Registration</h3>
        <p className="text-muted-foreground">Please review the agent details before completing the registration.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Agent Name</h4>
              <p className="font-medium">{registrationData.name}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Legal Owner</h4>
              <p className="font-medium">{registrationData.ownerName}</p>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p>{registrationData.description}</p>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-muted-foreground">Purpose</h4>
              <p>{registrationData.purpose}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Identity & Wallet</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-medium text-muted-foreground">Agent DID</h5>
              <p className="text-sm font-mono">{registrationData.agentDID}</p>
            </div>

            <div>
              <h5 className="text-xs font-medium text-muted-foreground">Hedera Account ID</h5>
              <p className="text-sm font-mono">{registrationData.hederaAccountId}</p>
            </div>

            <div>
              <h5 className="text-xs font-medium text-muted-foreground">Wallet Address</h5>
              <p className="text-sm font-mono">{registrationData.walletAddress}</p>
            </div>

            <div>
              <h5 className="text-xs font-medium text-muted-foreground">Initial HBAR</h5>
              <p className="text-sm">{registrationData.initialHbarAmount} HBAR</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Ownership & Tokens</h4>

          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-medium text-muted-foreground">Ownership NFT</h5>
              <p className="text-sm font-mono">{registrationData.nftTokenId || "Not minted yet"}</p>
            </div>

            {registrationData.fungibleTokens && registrationData.fungibleTokens.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-muted-foreground">Fungible Tokens</h5>
                <div className="space-y-2 mt-2">
                  {registrationData.fungibleTokens.map((token, index) => (
                    <div key={index} className="border rounded-md p-2">
                      <div className="text-sm font-medium">{token.tokenSymbol}</div>
                      <div className="text-xs text-muted-foreground">
                        Amount: {token.amount} • Token ID: {token.tokenId}
                      </div>
                      {token.spendingLimit && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Limits:
                          {token.spendingLimit.daily && ` Daily: ${token.spendingLimit.daily}`}
                          {token.spendingLimit.weekly && ` Weekly: ${token.spendingLimit.weekly}`}
                          {token.spendingLimit.monthly && ` Monthly: ${token.spendingLimit.monthly}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Permissions</h4>

          {registrationData.permissions && registrationData.permissions.length > 0 ? (
            <div className="space-y-3">
              {registrationData.permissions.map((permission, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className="bg-primary/10">
                      {permission.type}
                    </Badge>
                    <span className="text-sm font-medium">{permission.operator}</span>
                  </div>
                  {renderPermissionDetails(permission)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No permissions defined</p>
          )}
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-medium text-amber-800 mb-2">Important Information</h4>
        <ul className="text-sm text-amber-700 space-y-1 list-disc pl-5">
          <li>The agent will be registered on the Hedera network with a unique DID</li>
          <li>The ownership attestation will be minted as an NFT</li>
          <li>Permissions will be enforced by smart contracts</li>
          <li>You can update or revoke permissions at any time</li>
          <li>Gas fees may apply for transactions on the Hedera network</li>
        </ul>
      </div>
    </div>
  )
}
