"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAtomValue, useSetAtom } from "jotai"
import { walletAddressAtom, walletDidAtom } from "@/store/atoms"
import { generateDID } from "@/lib/utils/hederaUtils"
import { CheckCircle2, LucideLoader2, Info } from "lucide-react"
import { TooltipHelper } from "@/components/ui/tooltip-helper"
import { TooltipProvider } from "@/components/ui/tooltip"

export function DIDGenerationStep() {
  const address = useAtomValue(walletAddressAtom)
  const setDID = useSetAtom(walletDidAtom)
  const [did, setGeneratedDID] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleGenerateDID = async () => {
    if (!address) return

    setIsGenerating(true)
    try {
      const generatedDID = await generateDID(address)
      setGeneratedDID(generatedDID)
      setDID(generatedDID)
      setIsComplete(true)
    } catch (error) {
      console.error("Error generating DID:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-start space-x-3 mb-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium flex items-center">
                What is a Decentralized Identifier (DID)?
                <TooltipHelper
                  title="DID"
                  content="A DID is a W3C standard for a globally unique identifier that doesn't require a central registration authority because it's generated and registered on distributed ledgers or other decentralized systems."
                />
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                A DID is your unique digital identity on the Hedera network. It will be used to:
              </p>
            </div>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 pl-8 list-disc">
            <li>Verify you are the owner of your identity credentials</li>
            <li>Authorize AI agents to act on your behalf</li>
            <li>Cryptographically sign and verify permissions</li>
            <li>Create and manage verifiable credentials as NFTs</li>
          </ul>
        </div>

        {!did ? (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <svg
                  className="h-8 w-8 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16V12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8H12.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Generate Your DID</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Your DID will be created on the Hedera network and linked to your wallet address. This process is secure
                and private.
              </p>
              <Button onClick={handleGenerateDID} disabled={isGenerating || !address} className="w-full max-w-xs mt-4">
                {isGenerating ? (
                  <>
                    <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" /> Generating DID...
                  </>
                ) : (
                  "Generate DID"
                )}
              </Button>
              {!address && (
                <p className="text-amber-500 text-xs">You need to create a wallet first before generating a DID.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-medium text-green-800">DID Successfully Generated!</h3>
              </div>
              <div className="bg-white border border-green-200 rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Your Decentralized Identifier (DID):</p>
                <p className="font-mono text-sm break-all select-all">{did}</p>
              </div>
              <p className="text-sm text-green-700">
                Your digital identity is now secured on the Hedera network. You can use it to create and manage
                verifiable credentials for your AI agents.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
