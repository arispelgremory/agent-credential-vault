"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import type { VerifiableCredential } from "@/lib/features/credentials/credentialsSlice"
import type { Agent } from "@/lib/features/agents/agentsSlice"
import type { StructuredPermission } from "@/lib/types/permissions"

interface CredentialReviewProps {
  credentialData: Partial<VerifiableCredential>
  agents: Agent[]
}

export function CredentialReview({ credentialData, agents }: CredentialReviewProps) {
  const agent = agents.find((a) => a.id === credentialData.agentId)

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
      <div>
        <h3 className="text-lg font-medium mb-4">Review Credential Details</h3>
        <p className="text-muted-foreground mb-6">
          Please review the credential details before creating it on the Hedera network.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Credential Name</h4>
              <p className="font-medium">{credentialData.name}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Agent</h4>
              <p className="font-medium">{agent?.name || "Unknown Agent"}</p>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p>{credentialData.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Issuance Date</h4>
              <p>{format(new Date(), "PPP")}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Expiration Date</h4>
              <p>
                {credentialData.expirationDate
                  ? format(new Date(credentialData.expirationDate), "PPP")
                  : "No expiration (permanent)"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Permissions</h4>

          {credentialData.permissions && credentialData.permissions.length > 0 ? (
            <div className="space-y-3">
              {(credentialData.permissions as any[]).map((permission, index) => (
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
          <li>This credential will be minted as an NFT on the Hedera network</li>
          <li>The credential will be linked to your DID and the selected agent</li>
          <li>You can revoke this credential at any time by burning the NFT</li>
          <li>Gas fees may apply for minting the credential on the Hedera network</li>
          <li>Structured permissions provide fine-grained control over agent behavior</li>
        </ul>
      </div>
    </div>
  )
}
