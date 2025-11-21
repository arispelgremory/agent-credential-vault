"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createWallet } from "@/lib/utils/hederaUtils"
import { useSetAtom } from "jotai"
import { walletAddressAtom, walletConnectionStatusAtom } from "@/store/atoms"
import { AlertCircle, CheckCircle2, Copy, LucideLoader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function WalletCreationStep() {
  const setWalletAddress = useSetAtom(walletAddressAtom)
  const setConnectionStatus = useSetAtom(walletConnectionStatusAtom)
  const [walletAddress, setAddress] = useState<string | null>(null)
  const [mnemonic, setMnemonic] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false)
  const [isMnemonicCopied, setIsMnemonicCopied] = useState(false)
  const [isMnemonicConfirmed, setIsMnemonicConfirmed] = useState(false)

  const handleCreateWallet = async () => {
    setIsCreating(true)
    try {
      const { address, mnemonic } = await createWallet()
      setAddress(address)
      setMnemonic(mnemonic)
      setWalletAddress(address)
      setConnectionStatus(true)
    } catch (error) {
      console.error("Error creating wallet:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyMnemonic = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic)
      setIsMnemonicCopied(true)
      setTimeout(() => setIsMnemonicCopied(false), 2000)
    }
  }

  const handleConfirmMnemonic = () => {
    setIsMnemonicConfirmed(true)
  }

  return (
    <div className="space-y-6">
      {!walletAddress ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <svg
                className="h-8 w-8 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 5h-7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
                <path d="M17 2l-5 5-5-5" />
                <path d="M4 11h.01" />
                <path d="M4 15h.01" />
                <path d="M4 19h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Create Your Hedera Wallet</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Your wallet will be used to store your identity credentials and manage permissions for your AI agents on
              the Hedera network.
            </p>
            <Button onClick={handleCreateWallet} disabled={isCreating} className="w-full max-w-xs mt-4">
              {isCreating ? (
                <>
                  <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Wallet...
                </>
              ) : (
                "Create Wallet"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-800 text-sm font-medium">Wallet successfully created!</p>
                <p className="text-green-700 text-xs">Your wallet address: {walletAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Alert variant="destructive" className="border-amber-500 bg-amber-50 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important Security Notice</AlertTitle>
            <AlertDescription>
              In the next step, you'll see your recovery phrase (12 words). This is the ONLY way to recover your wallet
              if you lose access. Write it down and keep it somewhere safe. Never share it with anyone.
            </AlertDescription>
          </Alert>

          {!isMnemonicVisible ? (
            <Button onClick={() => setIsMnemonicVisible(true)} className="w-full">
              Show Recovery Phrase
            </Button>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-2">Recovery Phrase (12 words)</h4>
                  <div className="bg-muted p-4 rounded-md grid grid-cols-3 gap-2 mb-2 text-sm">
                    {mnemonic?.split(" ").map((word, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-muted-foreground mr-1">{index + 1}.</span>
                        <span>{word}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center text-xs"
                    onClick={handleCopyMnemonic}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {isMnemonicCopied ? "Copied!" : "Copy to clipboard"}
                  </Button>
                </CardContent>
              </Card>

              {!isMnemonicConfirmed ? (
                <Button onClick={handleConfirmMnemonic} className="w-full">
                  I've Saved My Recovery Phrase
                </Button>
              ) : (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Recovery Phrase Saved</AlertTitle>
                  <AlertDescription>
                    Keep your recovery phrase in a safe place. You'll need it to recover your wallet if you ever lose
                    access.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
