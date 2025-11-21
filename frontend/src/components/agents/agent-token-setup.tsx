"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Loader2, CheckCircle2, Plus, Trash2 } from "lucide-react"
import type { AgentRegistrationData, FungibleTokenAssignment } from "@/lib/types/agent-registration"

const tokenFormSchema = z.object({
  tokenSymbol: z.string().min(1, "Token symbol is required"),
  tokenId: z.string().min(1, "Token ID is required"),
  amount: z.number().min(0, "Amount must be a positive number"),
  dailyLimit: z.number().optional(),
  weeklyLimit: z.number().optional(),
  monthlyLimit: z.number().optional(),
})

interface AgentTokenSetupProps {
  registrationData: AgentRegistrationData
  updateRegistrationData: (data: Partial<AgentRegistrationData>) => void
}

export function AgentTokenSetup({ registrationData, updateRegistrationData }: AgentTokenSetupProps) {
  const [isMinting, setIsMinting] = useState(false)
  const [nftMinted, setNftMinted] = useState(!!registrationData.nftTokenId)
  const [showTokenForm, setShowTokenForm] = useState(false)
  const [tokens, setTokens] = useState<FungibleTokenAssignment[]>(registrationData.fungibleTokens || [])

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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Token Setup</h3>
        <p className="text-muted-foreground">
          Mint the ownership attestation as an NFT and assign fungible tokens to the agent.
        </p>
      </div>

      <div className="space-y-6">
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
                  disabled={isMinting || !registrationData.ownershipVC}
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitToken)} className="space-y-4 border rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tokenSymbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Symbol</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., USDC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tokenId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 0.0.123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 100"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Spending Limits (Optional)</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="dailyLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Limit</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 100"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weeklyLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weekly Limit</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 500"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="monthlyLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Limit</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 1000"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowTokenForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Token</Button>
                  </div>
                </form>
              </Form>
            ) : (
              <Button onClick={() => setShowTokenForm(true)} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Fungible Token
              </Button>
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
      </div>
    </div>
  )
}
