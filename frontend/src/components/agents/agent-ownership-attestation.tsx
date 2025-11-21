"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle2, FileText } from "lucide-react"
import type { AgentRegistrationData } from "@/lib/types/agent-registration"

interface AgentOwnershipAttestationProps {
  registrationData: AgentRegistrationData
  updateRegistrationData: (data: Partial<AgentRegistrationData>) => void
}

export function AgentOwnershipAttestation({
  registrationData,
  updateRegistrationData,
}: AgentOwnershipAttestationProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [vcCreated, setVcCreated] = useState(!!registrationData.ownershipVC)

  const handleCreateVC = async () => {
    if (!registrationData.agentDID || !registrationData.ownerDID) return

    setIsCreating(true)

    try {
      // Create ownership attestation VC
      const ownershipVC = {
        id: `vc-ownership-${Date.now()}`,
        issuanceDate: new Date().toISOString(),
        expirationDate: undefined,
      }

      // Update registration data
      updateRegistrationData({
        ownershipVC,
      })

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setVcCreated(true)
    } catch (error) {
      console.error("Error creating ownership attestation:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Ownership Attestation</h3>
        <p className="text-muted-foreground">
          Create a verifiable credential that attests to your ownership of this AI agent.
        </p>
      </div>

      {!vcCreated ? (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Create Ownership Attestation</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                A verifiable credential will be created that attests to your ownership of this AI agent. This credential
                will be signed by your DID and will be used to prove ownership.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Ownership Attestation Details</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <span className="font-medium">Owner DID:</span> {registrationData.ownerDID}
                </li>
                <li>
                  <span className="font-medium">Agent DID:</span> {registrationData.agentDID}
                </li>
                <li>
                  <span className="font-medium">Owner Name:</span> {registrationData.ownerName}
                </li>
                <li>
                  <span className="font-medium">Registration Date:</span> {new Date().toLocaleDateString()}
                </li>
              </ul>
            </div>

            <Button onClick={handleCreateVC} disabled={isCreating} className="w-full">
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Attestation...
                </>
              ) : (
                "Create Ownership Attestation"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-medium text-green-800">Ownership Attestation Created!</h3>
              </div>

              <p className="text-sm text-green-700">
                A verifiable credential has been created that attests to your ownership of this AI agent. This
                credential will be minted as an NFT in the next step.
              </p>

              <div className="bg-white border border-green-200 rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">Verifiable Credential</h4>
                <pre className="text-xs overflow-auto p-2 bg-gray-50 rounded">
                  {JSON.stringify(
                    {
                      "@context": ["https://www.w3.org/2018/credentials/v1"],
                      type: ["VerifiableCredential", "OwnershipAttestation"],
                      issuer: registrationData.ownerDID,
                      issuanceDate: registrationData.ownershipVC?.issuanceDate,
                      credentialSubject: {
                        id: registrationData.agentDID,
                        ownedBy: registrationData.ownerDID,
                        ownerName: registrationData.ownerName,
                        registrationDate: new Date().toISOString().split("T")[0],
                      },
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
