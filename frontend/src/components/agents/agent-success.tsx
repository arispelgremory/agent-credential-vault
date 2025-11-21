"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Copy, ExternalLink, Loader2 } from "lucide-react"
import { useState } from "react"
import type { AgentRegistrationData } from "@/lib/types/agent-registration"
import type { Agent } from "@/lib/features/agents/agentsSlice"

interface AgentSuccessProps {
  registrationData: AgentRegistrationData
  agent: Agent | null
  isProcessing: boolean
}

export function AgentSuccess({ registrationData, agent, isProcessing }: AgentSuccessProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Registering AI Agent</h3>
          <p className="text-muted-foreground">
            Please wait while we register your AI agent on the Hedera network. This may take a few moments.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-sm font-medium">Creating agent record...</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-sm font-medium">Finalizing DID registration...</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-sm font-medium">Setting up smart contracts...</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-sm font-medium">Configuring permissions...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-medium mb-2">Agent Successfully Registered!</h3>
        <p className="text-muted-foreground">
          Your AI agent has been registered on the Hedera network with a decentralized identity.
        </p>
      </div>

      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Registration Complete</AlertTitle>
        <AlertDescription className="text-green-700">Agent ID: {agent?.id}</AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h4 className="text-base font-medium mb-4">Agent Details</h4>

          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-muted-foreground">Agent Name</h5>
              <p>{registrationData.name}</p>
            </div>

            <div>
              <h5 className="text-sm font-medium text-muted-foreground">Decentralized Identifier (DID)</h5>
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

            <div>
              <h5 className="text-sm font-medium text-muted-foreground">Hedera Account ID</h5>
              <div className="flex items-center">
                <p className="font-mono text-sm break-all select-all flex-1">{registrationData.hederaAccountId}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(registrationData.hederaAccountId || "", "account")}
                  className="ml-2"
                >
                  {copied === "account" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-muted-foreground">Ownership NFT</h5>
              <div className="flex items-center">
                <p className="font-mono text-sm break-all select-all flex-1">{registrationData.nftTokenId}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(registrationData.nftTokenId || "", "nft")}
                  className="ml-2"
                >
                  {copied === "nft" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="sm:flex-1" asChild>
              <a
                href={`https://hashscan.io/mainnet/account/${registrationData.hederaAccountId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" /> View on HashScan
              </a>
            </Button>
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={() => handleCopy(registrationData.agentDID || "", "did")}
            >
              <Copy className="h-4 w-4 mr-2" /> {copied === "did" ? "Copied!" : "Copy DID"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
            <li>Issue verifiable credentials to your agent to grant specific permissions</li>
            <li>Monitor your agent's activity in the dashboard</li>
            <li>Update permissions or revoke credentials as needed</li>
            <li>Integrate your agent with third-party systems using the provided DID</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
