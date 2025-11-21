"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle } from "lucide-react"
import type { VerifiableCredential } from "@/lib/features/credentials/credentialsSlice"

interface CredentialMintingProps {
  credentialData: Partial<VerifiableCredential>
  isProcessing: boolean
}

export function CredentialMinting({ credentialData, isProcessing }: CredentialMintingProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-4">Creating Verifiable Credential</h3>
        <p className="text-muted-foreground mb-6">Your credential is being minted as an NFT on the Hedera network.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 rounded-full p-3">
                {isProcessing ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div>
                <h4 className="font-medium">{isProcessing ? "Minting in progress..." : "Credential created!"}</h4>
                <p className="text-sm text-muted-foreground">
                  {isProcessing
                    ? "This may take a few moments to complete"
                    : "Your credential has been successfully minted on the Hedera network"}
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credential Name:</span>
                <span className="font-medium">{credentialData.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Permissions:</span>
                <span className="font-medium">{credentialData.permissions?.length || 0} permissions</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium">Hedera Mainnet</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
