"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, Copy, Shield, Key } from "lucide-react"
import { generateDID } from "@/lib/utils/hederaUtils"
import type { AgentRegistrationData } from "@/lib/types/agent-registration"

interface AgentIdentitySetupProps {
  registrationData: AgentRegistrationData
  updateRegistrationData: (data: Partial<AgentRegistrationData>) => void
}

export function AgentIdentitySetup({ registrationData, updateRegistrationData }: AgentIdentitySetupProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [securityConfirmed, setSecurityConfirmed] = useState(false)

  const handleGenerateDID = async () => {
    setIsGenerating(true)

    try {
      // Generate a DID based on the agent name
      const agentSlug = registrationData.name.replace(/\s+/g, "-").toLowerCase()
      const did = await generateDID(agentSlug)

      // Update registration data
      updateRegistrationData({
        agentDID: did,
        privateKeySecured: false,
      })

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (error) {
      console.error("Error generating DID:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleConfirmSecurity = () => {
    setSecurityConfirmed(true)
    updateRegistrationData({
      privateKeySecured: true,
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Agent Identity Setup</h3>
        <p className="text-muted-foreground">Create a decentralized identifier (DID) for your AI agent.</p>
      </div>

      {!registrationData.agentDID ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Key className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Generate Agent DID</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              A decentralized identifier (DID) will be created for your AI agent on the Hedera network. This DID will be
              used to identify your agent and link it to verifiable credentials.
            </p>
            <Button onClick={handleGenerateDID} disabled={isGenerating} className="w-full max-w-xs mt-4">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating DID...
                </>
              ) : (
                "Generate DID"
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
                <h3 className="text-lg font-medium text-green-800">DID Successfully Generated!</h3>
              </div>
              <div className="bg-white border border-green-200 rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Agent Decentralized Identifier (DID):</p>
                <div className="flex items-center">
                  <p className="font-mono text-sm break-all select-all flex-1">{registrationData.agentDID}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(registrationData.agentDID || "", "did")}
                    className="ml-2"
                  >
                    {copied === "did" ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-green-700">
                This DID uniquely identifies your AI agent on the Hedera network and will be used to link verifiable
                credentials and permissions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-medium">Private Key Security</h3>
              </div>
              <p className="text-sm">
                The private keys associated with this DID must be securely stored. We recommend using:
              </p>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li>Hardware Security Module (HSM)</li>
                <li>Multi-Party Computation (MPC) wallet</li>
                <li>Secure key management system with proper access controls</li>
              </ul>

              {!registrationData.privateKeySecured && !securityConfirmed && (
                <Button onClick={handleConfirmSecurity} className="w-full">
                  I Confirm Private Keys Will Be Secured
                </Button>
              )}

              {(registrationData.privateKeySecured || securityConfirmed) && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Security Confirmed</AlertTitle>
                  <AlertDescription className="text-green-700">
                    You've confirmed that the private keys will be properly secured.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
