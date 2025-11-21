"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Loader2, CheckCircle2, Copy, Wallet, Key, Shield, Plus, Trash2 } from "lucide-react"
import { generateDID, createWallet } from "@/lib/utils/hederaUtils"
import type { AgentRegistrationData, FungibleTokenAssignment } from "@/lib/types/agent-registration"

const tokenFormSchema = z.object({
  tokenSymbol: z.string().min(1, "Token symbol is required"),
  tokenId: z.string().min(1, "Token ID is required"),
  amount: z.number().min(0, "Amount must be a positive number"),
  dailyLimit: z.number().optional(),
  weeklyLimit: z.number().optional(),
  monthlyLimit: z.number().optional(),
})

interface AgentIdentityAndWalletProps {
  registrationData: AgentRegistrationData
  updateRegistrationData: (data: Partial<AgentRegistrationData>) => void
}

export function AgentIdentityAndWallet({ registrationData, updateRegistrationData }: AgentIdentityAndWalletProps) {
  const [activeTab, setActiveTab] = useState("identity")

  // Identity state
  const [isGeneratingDID, setIsGeneratingDID] = useState(false)
  const [securityConfirmed, setSecurityConfirmed] = useState(false)

  // Wallet state
  const [isCreatingWallet, setIsCreatingWallet] = useState(false)
  const [initialHbar, setInitialHbar] = useState<number>(registrationData.initialHbarAmount || 50)

  // Token state
  const [isMinting, setIsMinting] = useState(false)
  const [nftMinted, setNftMinted] = useState(!!registrationData.nftTokenId)
  const [showTokenForm, setShowTokenForm] = useState(false)
  const [tokens, setTokens] = useState<FungibleTokenAssignment[]>(registrationData.fungibleTokens || [])

  const [copied, setCopied] = useState<string | null>(null)

  const form = useForm<z.infer<typeof tokenFormSchema>>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      tokenSymbol: "",
      tokenId: "",
      amount: 0,
      dailyLimit: undefined,
      weeklyLimit: undefined,
      monthlyLimit: undefined,
    },
  })

  const handleGenerateDID = async () => {
    setIsGeneratingDID(true)

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
      setIsGeneratingDID(false)
    }
  }

  const handleConfirmSecurity = () => {
    setSecurityConfirmed(true)
    updateRegistrationData({
      privateKeySecured: true,
    })
  }

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true)

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
      setIsCreatingWallet(false)
    }
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

  const handleMintNFT = async () => {
    if (!registrationData.ownershipVC) return

    setIsMinting(true)

    try {
      // Mint NFT for the VC
      const nftTokenId = `0.0.${Math.floor(Math.random() * 1000000)}`

      // Update registration data
      updateRegistrationData({
        nftTokenId,
      })

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2500))

      setNftMinted(true)
    } catch (error) {
      console.error("Error minting NFT:", error)
    } finally {
      setIsMinting(false)
    }
  }

  const onSubmitToken = (values: z.infer<typeof tokenFormSchema>) => {
    const newToken: FungibleTokenAssignment = {
      tokenSymbol: values.tokenSymbol,
      tokenId: values.tokenId,
      amount: values.amount,
      spendingLimit: {
        daily: values.dailyLimit,
        weekly: values.weeklyLimit,
        monthly: values.monthlyLimit,
      },
    }

    const updatedTokens = [...tokens, newToken]
    setTokens(updatedTokens)

    // Update registration data
    updateRegistrationData({
      fungibleTokens: updatedTokens,
    })

    // Reset form and hide it
    form.reset()
    setShowTokenForm(false)
  }

  const removeToken = (index: number) => {
    const updatedTokens = [...tokens]
    updatedTokens.splice(index, 1)
    setTokens(updatedTokens)

    // Update registration data
    updateRegistrationData({
      fungibleTokens: updatedTokens,
    })
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Agent Identity & Wallet Setup</h3>
        <p className="text-muted-foreground">Create a decentralized identity and wallet for your AI agent.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="identity">Agent Identity</TabsTrigger>
          <TabsTrigger value="wallet">Wallet Setup</TabsTrigger>
          <TabsTrigger value="tokens">Token Setup</TabsTrigger>
        </TabsList>

        {/* Agent Identity Tab */}
        <TabsContent value="identity" className="space-y-6 pt-4">
          {!registrationData.agentDID ? (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Key className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Generate Agent DID</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  A decentralized identifier (DID) will be created for your AI agent on the Hedera network. This DID
                  will be used to identify your agent and link it to verifiable credentials.
                </p>
                <Button onClick={handleGenerateDID} disabled={isGeneratingDID} className="w-full max-w-xs mt-4">
                  {isGeneratingDID ? (
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
        </TabsContent>

        {/* Wallet Setup Tab */}
        <TabsContent value="wallet" className="space-y-6 pt-4">
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

                  <Button
                    onClick={handleCreateWallet}
                    disabled={isCreatingWallet || !registrationData.agentDID}
                    className="w-full"
                  >
                    {isCreatingWallet ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Wallet...
                      </>
                    ) : (
                      "Create Wallet"
                    )}
                  </Button>

                  {!registrationData.agentDID && (
                    <Alert variant="destructive">
                      <AlertTitle>Agent DID Required</AlertTitle>
                      <AlertDescription>You need to generate an agent DID before creating a wallet.</AlertDescription>
                    </Alert>
                  )}
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
                        <p className="font-mono text-sm break-all select-all flex-1">
                          {registrationData.hederaAccountId}
                        </p>
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
                        <p className="font-mono text-sm break-all select-all flex-1">
                          {registrationData.walletAddress}
                        </p>
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
        </TabsContent>

        {/* Token Setup Tab */}
        <TabsContent value="tokens" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ownership NFT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!nftMinted ? (
                <div className="space-y-4">
                  <p className="text-sm">
                    The ownership attestation will be minted as an NFT on the Hedera network. This NFT will contain the
                    verifiable credential in its metadata.
                  </p>

                  <Button
                    onClick={handleMintNFT}
                    disabled={isMinting || !registrationData.ownershipVC || !registrationData.walletAddress}
                    className="w-full"
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting NFT...
                      </>
                    ) : (
                      "Mint Ownership NFT"
                    )}
                  </Button>

                  {!registrationData.ownershipVC && (
                    <Alert variant="destructive">
                      <AlertTitle>Ownership Attestation Required</AlertTitle>
                      <AlertDescription>
                        You need to create an ownership attestation before minting an NFT.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!registrationData.walletAddress && registrationData.ownershipVC && (
                    <Alert variant="destructive">
                      <AlertTitle>Wallet Required</AlertTitle>
                      <AlertDescription>You need to create a wallet before minting an NFT.</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">NFT Successfully Minted!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Token ID: {registrationData.nftTokenId}
                    </AlertDescription>
                  </Alert>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">NFT Details</h4>
                    <ul className="text-sm space-y-2">
                      <li>
                        <span className="font-medium">Token ID:</span> {registrationData.nftTokenId}
                      </li>
                      <li>
                        <span className="font-medium">Token Type:</span> Non-Fungible Token (NFT)
                      </li>
                      <li>
                        <span className="font-medium">Network:</span> Hedera Mainnet
                      </li>
                      <li>
                        <span className="font-medium">Owner:</span> {registrationData.ownerDID}
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fungible Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Assign fungible tokens (e.g., USDC, HBAR) to the agent for transactions. You can set spending limits for
                each token.
              </p>

              {tokens.length > 0 && (
                <div className="space-y-3">
                  {tokens.map((token, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{token.tokenSymbol}</div>
                        <div className="text-sm text-muted-foreground">
                          Amount: {token.amount} • Token ID: {token.tokenId}
                        </div>
                        {token.spendingLimit && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Limits:
                            {token.spendingLimit.daily && ` Daily: ${token.spendingLimit.daily}`}
                            {token.spendingLimit.weekly && ` Weekly: ${token.spendingLimit.weekly}`}
                            {token.spendingLimit.monthly && ` Monthly: ${token.spendingLimit.monthly}`}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeToken(index)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {showTokenForm ? (
                <form onSubmit={form.handleSubmit(onSubmitToken)} className="space-y-4 border rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Token Symbol</Label>
                      <Input placeholder="e.g., USDC" {...form.register("tokenSymbol")} />
                      {form.formState.errors.tokenSymbol && (
                        <p className="text-xs text-destructive">{form.formState.errors.tokenSymbol.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Token ID</Label>
                      <Input placeholder="e.g., 0.0.123456" {...form.register("tokenId")} />
                      {form.formState.errors.tokenId && (
                        <p className="text-xs text-destructive">{form.formState.errors.tokenId.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 100"
                        {...form.register("amount", {
                          valueAsNumber: true,
                        })}
                      />
                      {form.formState.errors.amount && (
                        <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Spending Limits (Optional)</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Daily Limit</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 100"
                          {...form.register("dailyLimit", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Weekly Limit</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 500"
                          {...form.register("weeklyLimit", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Monthly Limit</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 1000"
                          {...form.register("monthlyLimit", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowTokenForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Token</Button>
                  </div>
                </form>
              ) : (
                <Button
                  onClick={() => setShowTokenForm(true)}
                  disabled={!registrationData.walletAddress}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Fungible Token
                </Button>
              )}

              {!registrationData.walletAddress && (
                <Alert variant="destructive">
                  <AlertTitle>Wallet Required</AlertTitle>
                  <AlertDescription>You need to create a wallet before adding fungible tokens.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Smart Contract Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">Configure smart contracts to enforce permissions and spending limits.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Enforce Permissions</div>
                    <div className="text-sm text-muted-foreground">Validate permissions before allowing actions</div>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      updateRegistrationData({
                        smartContractConfig: {
                          enforceSpendingLimits: false,
                          requireOwnerApproval: false,
                          ...registrationData.smartContractConfig,
                          enforcePermissions: checked,
                        },
                      })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Enforce Spending Limits</div>
                    <div className="text-sm text-muted-foreground">Enforce token spending limits</div>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      updateRegistrationData({
                        smartContractConfig: {
                          enforcePermissions: false,
                          requireOwnerApproval: false,
                          ...registrationData.smartContractConfig,
                          enforceSpendingLimits: checked,
                        },
                      })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Require Owner Approval</div>
                    <div className="text-sm text-muted-foreground">For transactions above a certain threshold</div>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      updateRegistrationData({
                        smartContractConfig: {
                          enforcePermissions: false,
                          enforceSpendingLimits: false,
                          ...registrationData.smartContractConfig,
                          requireOwnerApproval: checked,
                        },
                      })
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
