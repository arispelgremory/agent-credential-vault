"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, Copy, Wallet } from "lucide-react"
import { createWallet } from "@/lib/utils/hederaUtils"
import type { AgentRegistrationData } from "@/lib/types/agent-registration"

interface AgentWalletSetupProps {
  registrationData: AgentRegistrationData
  updateRegistrationData: (data: Partial<AgentRegistrationData>) => void
}

export function AgentWalletSetup({ registrationData, updateRegistrationData }: AgentWalletSetupProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [initialHbar, setInitialHbar] = useState<number>(registrationData.initialHbarAmount || 50)

  const handleCreateWallet = async () => {
    setIsCreating(true)

    try {
      // Create a wallet
      const wallet = await createWallet()

      // Update registration data
      updateRegistrationData({
        walletAddress: wallet.address,
        hederaAccountId: wallet.address, // In a real implementation, these would be different
        initialHbarAmount: initialHbar,
      })

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (error) {
      console.error("Error creating wallet:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleHbarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setInitialHbar(value)
      updateRegistrationData({
        initialHbarAmount: value,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Hedera Wallet Setup</h3>
        <p className="text-muted-foreground">Create a Hedera wallet for your AI agent to interact with the network.</p>
      </div>

      {!registrationData.walletAddress ? (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Create Agent Wallet</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                A Hedera wallet will be created for your AI agent. This wallet will be used to store tokens, pay for
                transactions, and interact with the Hedera network.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="initial-hbar">Initial HBAR Amount</Label>
                <Input id="initial-hbar" type="number" min="0" value={initialHbar} onChange={handleHbarChange} />
                <p className="text-xs text-muted-foreground">
                  Amount of HBAR to fund the wallet with initially (for transaction fees)
                </p>
              </div>

              <Button onClick={handleCreateWallet} disabled={isCreating} className="w-full">
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Wallet...
                  </>
                ) : (
                  "Create Wallet"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-medium text-green-800">Wallet Successfully Created!</h3>
              </div>

              <div className="space-y-3">
                <div className="bg-white border border-green-200 rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">Hedera Account ID:</p>
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

                <div className="bg-white border border-green-200 rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">Wallet Address:</p>
                  <div className="flex items-center">
                    <p className="font-mono text-sm break-all select-all flex-1">{registrationData.walletAddress}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(registrationData.walletAddress || "", "wallet")}
                      className="ml-2"
                    >
                      {copied === "wallet" ? "Copied!" : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800">Wallet Funded</AlertTitle>
                <AlertDescription className="text-blue-700">
                  The wallet has been funded with {registrationData.initialHbarAmount} HBAR for transaction fees.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
