"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { format } from "date-fns"
import type { VerifiableCredential } from "@/lib/features/credentials/credentialsSlice"
import type { Agent } from "@/lib/features/agents/agentsSlice"
import type { StructuredPermission } from "@/lib/types/permissions"

interface CredentialSuccessProps {
  credential: VerifiableCredential | null
  agents: Agent[]
}

export function CredentialSuccess({ credential, agents }: CredentialSuccessProps) {
  const [copied, setCopied] = useState(false)

  const agent = agents.find((a) => a.id === credential?.agentId)

  const handleCopy = () => {
    if (credential?.tokenId) {
      navigator.clipboard.writeText(credential.tokenId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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

  if (!credential) {
    return <div>No credential data available</div>
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-medium mb-2">Credential Successfully Created!</h3>
        <p className="text-muted-foreground">
          Your verifiable credential has been minted as an NFT on the Hedera network
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Credential Name</h4>
              <p className="font-medium">{credential.name}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Agent</h4>
              <p className="font-medium">{agent?.name || "Unknown Agent"}</p>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p>{credential.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Issuance Date</h4>
              <p>{format(new Date(credential.issuanceDate), "PPP")}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Expiration Date</h4>
              <p>
                {credential.expirationDate
                  ? format(new Date(credential.expirationDate), "PPP")
                  : "No expiration (permanent)"}
              </p>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-muted-foreground">Token ID</h4>
              <div className="flex items-center mt-1">
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono flex-1 overflow-x-auto">
                  {credential.tokenId}
                </code>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="ml-2">
                  {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Permissions</h4>

            <div className="space-y-3">
              {(credential.permissions as any[]).map((permission, index) => (
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
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="sm:flex-1" asChild>
              <a
                href={`https://hashscan.io/mainnet/token/${credential.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" /> View on HashScan
              </a>
            </Button>
            <Button variant="outline" className="sm:flex-1" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" /> {copied ? "Copied!" : "Copy Token ID"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-green-800 mb-2">Credential Schema</h4>
          <p className="text-sm text-green-700 mb-3">
            Your credential has been issued with the following JSON-LD schema:
          </p>
          <pre className="bg-white border border-green-200 p-3 rounded-md text-xs overflow-auto max-h-48">
            {JSON.stringify(
              {
                "@context": [
                  "https://www.w3.org/2018/credentials/v1",
                  "https://w3id.org/security/suites/ed25519-2020/v1",
                ],
                type: ["VerifiableCredential", "AIAgentPermission"],
                issuer: "did:hedera:testnet:your-did",
                issuanceDate: credential.issuanceDate,
                expirationDate: credential.expirationDate,
                credentialSubject: {
                  id: `did:hedera:testnet:${agent?.id || "agent"}`,
                  name: credential.name,
                  permissions: credential.permissions,
                },
              },
              null,
              2,
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
