"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"
import { useState } from "react"

export function WalletInfoCard() {
  const wallet = useSelector((state: RootState) => state.wallet)
  const [copied, setCopied] = useState<string | null>(null)

  // Default values if wallet data is not available
  const displayAddress = wallet?.address || "0.0.1234567"
  const displayBalance = wallet?.balance || 100.5
  const displayDid = wallet?.did || "did:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxufgeVHEQcy5GRQe"
  const displayNetwork = wallet?.network || "Hedera Testnet"

  // Default tokens if not available
  const defaultTokens = [
    { name: "HBAR", balance: "100.5", value: "$10.05 USD" },
    { name: "NFT Credentials", count: 3 },
  ]

  // Safely access tokens with fallback to default
  const tokens = wallet?.tokens || defaultTokens

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Wallet Information</CardTitle>
        <CardDescription>Your blockchain identity and assets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Wallet Address:</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => copyToClipboard(displayAddress, "address")}
            >
              <Copy className="h-3 w-3 mr-1" />
              {copied === "address" ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-sm font-mono bg-muted p-2 rounded-md overflow-x-auto">{displayAddress}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Decentralized ID (DID):</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => copyToClipboard(displayDid, "did")}
            >
              <Copy className="h-3 w-3 mr-1" />
              {copied === "did" ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-sm font-mono bg-muted p-2 rounded-md overflow-x-auto">{displayDid}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/10 rounded-md p-3">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-lg font-semibold">{displayBalance} HBAR</p>
          </div>
          <div className="bg-primary/10 rounded-md p-3">
            <p className="text-xs text-muted-foreground">Network</p>
            <p className="text-lg font-semibold">{displayNetwork}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm font-medium mb-2">Assets</p>
          <div className="space-y-2">
            {tokens.map((token, index) => (
              <div key={index} className="flex justify-between items-center">
                <p className="text-sm">{token.name}</p>
                <p className="text-sm font-medium">
                  {token.balance ? `${token.balance} ${token.value ? `(${token.value})` : ""}` : `${token.count} NFTs`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full flex items-center justify-center" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          View on Explorer
        </Button>
      </CardContent>
    </Card>
  )
}
