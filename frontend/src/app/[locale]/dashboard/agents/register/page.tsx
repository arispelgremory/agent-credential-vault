"use client"

import { type KeyboardEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, X } from "lucide-react"

import { createClient } from "@/constants/axios-v1"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Step, Stepper } from "@/components/ui/stepper"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

type RegistrationType = "Agent" | "MCP"

type EndpointFormState = {
  name: string
  endpoint: string
  version: string
  capabilities: string[]
  capabilityInput: string
}

type RegisterAgentFormState = {
  type: RegistrationType
  name: string
  description: string
  endpoints: EndpointFormState[]
  supportedTrust: string[]
  tokenId: string
}

type RegisterAgentResponse = {
  success: boolean
  message: string
  data: {
    agentId: string
    txHash: string
    owner: string
    registrationUri?: string
    metadataCid?: string
    type: RegistrationType
    registrations?: Array<{
      agentId: number
      agentRegistry: string
    }>
  } | null
}

const initialEndpoint: EndpointFormState = {
  name: "",
  endpoint: "",
  version: "",
  capabilities: [],
  capabilityInput: "",
}

const initialFormState: RegisterAgentFormState = {
  type: "Agent",
  name: "",
  description: "",
  endpoints: [initialEndpoint],
  supportedTrust: ["reputation"],
  tokenId: "",
}

const steps = [
  { title: "Basic Info", description: "Type, name, description" },
  { title: "Endpoints", description: "Expose MCP endpoints" },
  { title: "Trust & Tokens", description: "Token configuration" },
  { title: "Review", description: "Confirm request" },
  { title: "Complete", description: "Registration done" },
]

export default function RegisterAgentPage() {
  const router = useRouter()
  const apiClient = useMemo(
    () =>
      createClient({
        onRefreshFail: () => {
          router.push("/login?reason=session-expired")
        },
      }),
    [router],
  )

  const [currentStep, setCurrentStep] = useState(0)
  const [formState, setFormState] = useState<RegisterAgentFormState>(initialFormState)
  const [supportedTrustInput, setSupportedTrustInput] = useState("reputation")
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [registrationResult, setRegistrationResult] = useState<RegisterAgentResponse["data"] | null>(null)

  const submitRegistration = useMutation({
    mutationFn: async (payload: RegisterAgentFormState) => {
      const requestBody = {
        type: payload.type,
        name: payload.name,
        description: payload.description,
        endpoints: payload.endpoints.map((endpoint) => {
          return {
            name: endpoint.name,
            endpoint: endpoint.endpoint,
            version: endpoint.version,
            capabilities: endpoint.capabilities.length ? endpoint.capabilities : undefined,
          }
        }),
        supportedTrust: payload.supportedTrust.length > 0 ? payload.supportedTrust : undefined,
        tokenId: payload.tokenId,
      }

      const { data } = await apiClient.post<RegisterAgentResponse>("/identity/agent/register", requestBody)
      if (!data.success) {
        throw new Error(data.message || "Failed to register agent")
      }
      return data
    },
    onSuccess: (data) => {
      setRegistrationResult(data.data)
      setSubmissionError(null)
      setCurrentStep(4)
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to register agent"
      setSubmissionError(message)
    },
  })

  const isProcessing = submitRegistration.isPending

  const handleCancel = () => {
    router.push("/dashboard/agents")
  }

  const updateFormState = (updates: Partial<RegisterAgentFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }))
  }

  const updateEndpoint = (index: number, updates: Partial<EndpointFormState>) => {
    setFormState((prev) => ({
      ...prev,
      endpoints: prev.endpoints.map((endpoint, idx) => (idx === index ? { ...endpoint, ...updates } : endpoint)),
    }))
  }

  const addEndpoint = () => {
    setFormState((prev) => ({
      ...prev,
      endpoints: [...prev.endpoints, { ...initialEndpoint }],
    }))
  }

  const removeEndpoint = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      endpoints: prev.endpoints.filter((_, idx) => idx !== index),
    }))
  }

  const parseSupportedTrust = (value: string) => {
    const trusts = value
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
    setSupportedTrustInput(value)
    updateFormState({ supportedTrust: trusts.length > 0 ? trusts : [] })
  }

  const updateCapabilityInput = (index: number, value: string) => {
    setFormState((prev) => ({
      ...prev,
      endpoints: prev.endpoints.map((endpoint, idx) =>
        idx === index ? { ...endpoint, capabilityInput: value } : endpoint,
      ),
    }))
  }

  const addCapability = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      endpoints: prev.endpoints.map((endpoint, idx) => {
        if (idx !== index) return endpoint
        const trimmed = endpoint.capabilityInput.trim()
        if (!trimmed) return endpoint
        if (endpoint.capabilities.includes(trimmed)) {
          return { ...endpoint, capabilityInput: "" }
        }
        return {
          ...endpoint,
          capabilities: [...endpoint.capabilities, trimmed],
          capabilityInput: "",
        }
      }),
    }))
  }

  const removeCapability = (endpointIndex: number, capabilityIndex: number) => {
    setFormState((prev) => ({
      ...prev,
      endpoints: prev.endpoints.map((endpoint, idx) => {
        if (idx !== endpointIndex) return endpoint
        return {
          ...endpoint,
          capabilities: endpoint.capabilities.filter((_, capIdx) => capIdx !== capabilityIndex),
        }
      }),
    }))
  }

  const handleCapabilityKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      addCapability(index)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return Boolean(formState.name && formState.description)
      case 1:
        return (
          formState.endpoints.length > 0 &&
          formState.endpoints.every((endpoint) => endpoint.name && endpoint.endpoint && endpoint.version)
        )
      case 2:
        return Boolean(formState.tokenId.trim())
      case 3:
        return true
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (currentStep === 3) {
      await submitRegistration.mutateAsync(formState)
      return
    }
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    if (currentStep === 0 || isProcessing) return
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium mb-2">Registration Type</p>
        <div className="flex space-x-2">
          {(["Agent", "MCP"] as RegistrationType[]).map((type) => (
            <Button
              key={type}
              type="button"
              variant={formState.type === type ? "default" : "outline"}
              onClick={() => updateFormState({ type })}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Agent Name</label>
        <Input value={formState.name} onChange={(event) => updateFormState({ name: event.target.value })} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          rows={4}
          value={formState.description}
          onChange={(event) => updateFormState({ description: event.target.value })}
        />
      </div>
    </div>
  )

  const renderEndpointsStep = () => (
    <div className="space-y-6">
      {formState.endpoints.map((endpoint, index) => (
        <Card key={`endpoint-${index}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Endpoint #{index + 1}</CardTitle>
            {formState.endpoints.length > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => removeEndpoint(index)}>
                Remove
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={endpoint.name} onChange={(event) => updateEndpoint(index, { name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Endpoint URL</label>
              <Input
                type="url"
                value={endpoint.endpoint}
                onChange={(event) => updateEndpoint(index, { endpoint: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Version</label>
              <Input value={endpoint.version} onChange={(event) => updateEndpoint(index, { version: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Capabilities</label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. create-wallet"
                    value={endpoint.capabilityInput}
                    onChange={(event) => updateCapabilityInput(index, event.target.value)}
                    onKeyDown={(event) => handleCapabilityKeyDown(index, event)}
                  />
                  <Button
                    type="button"
                    onClick={() => addCapability(index)}
                    disabled={!endpoint.capabilityInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                {endpoint.capabilities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {endpoint.capabilities.map((capability, capabilityIndex) => (
                      <Badge key={`${capability}-${capabilityIndex}`} variant="secondary" className="flex items-center gap-1">
                        {capability}
                        <button
                          type="button"
                          aria-label={`Remove ${capability}`}
                          onClick={() => removeCapability(index, capabilityIndex)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No capabilities added yet.</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Press Enter or click Add to include capabilities like create-wallet, check-balance, build-transaction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={addEndpoint}>
        Add Endpoint
      </Button>
    </div>
  )

  const renderTrustStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Supported Trust (comma separated)</label>
        <Input value={supportedTrustInput} onChange={(event) => parseSupportedTrust(event.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Token ID</label>
        <Input
          placeholder="0.0.1234567"
          value={formState.tokenId}
          onChange={(event) => updateFormState({ tokenId: event.target.value })}
        />
        <p className="text-xs text-muted-foreground">Format: shard.realm.account (e.g., 0.0.1234567)</p>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
          <CardDescription>Confirm the payload before submitting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold">Type</p>
            <p>{formState.type}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Name</p>
            <p>{formState.name}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Description</p>
            <p>{formState.description}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Supported Trust</p>
            <p>{formState.supportedTrust.length ? formState.supportedTrust.join(", ") : "None"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Token ID</p>
            <p>{formState.tokenId || "None"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Endpoints</p>
            <div className="space-y-3 mt-2">
              {formState.endpoints.map((endpoint, index) => (
                <div key={`review-endpoint-${index}`} className="rounded-lg border p-3 text-sm space-y-1">
                  <p>
                    <span className="font-medium">Name:</span> {endpoint.name}
                  </p>
                  <p>
                    <span className="font-medium">URL:</span> {endpoint.endpoint}
                  </p>
                  <p>
                    <span className="font-medium">Version:</span> {endpoint.version}
                  </p>
                  <p>
                    <span className="font-medium">Capabilities:</span>{" "}
                    {endpoint.capabilities.length > 0 ? endpoint.capabilities.join(", ") : "None"}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {submissionError && <p className="text-sm text-destructive">{submissionError}</p>}
        </CardContent>
      </Card>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="space-y-4 text-center">
      <p className="text-lg font-semibold">Agent registered successfully!</p>
      {registrationResult ? (
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Agent ID:</span> {registrationResult.agentId}
          </p>
          <p>
            <span className="font-semibold">Tx Hash:</span> {registrationResult.txHash}
          </p>
          <p>
            <span className="font-semibold">Registry Type:</span> {registrationResult.type}
          </p>
          {registrationResult.registrationUri && (
            <p>
              <span className="font-semibold">Registration URI:</span> {registrationResult.registrationUri}
            </p>
          )}
          {registrationResult.registrations && registrationResult.registrations.length > 0 && (
            <div className="text-left space-y-1 pt-2">
              <p className="text-sm font-semibold text-center sm:text-left">Registrations</p>
              <div className="space-y-1">
                {registrationResult.registrations.map((registration, index) => (
                  <div key={`registration-${registration.agentId}-${index}`} className="rounded border px-3 py-2 text-left">
                    <p>
                      <span className="font-medium">Agent ID:</span> {registration.agentId}
                    </p>
                    <p>
                      <span className="font-medium">Registry:</span> {registration.agentRegistry}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Review the dashboard for full details.</p>
      )}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep()
      case 1:
        return renderEndpointsStep()
      case 2:
        return renderTrustStep()
      case 3:
        return renderReviewStep()
      case 4:
        return renderSuccessStep()
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={handleCancel} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Agents
          </Button>
          <h1 className="text-2xl font-bold">Register AI Agent</h1>
          <p className="text-muted-foreground">Create a new AI agent or MCP server on the Hedera identity registry</p>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Agent Registration</CardTitle>
          <CardDescription>Provide the details required by the register agent API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <Stepper currentStep={currentStep} className="mb-8">
              {steps.map((step, index) => (
                <Step key={step.title} title={step.title} description={step.description} />
              ))}
            </Stepper>
          </div>

          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          {currentStep < 4 && (
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isProcessing}>
              Back
            </Button>
          )}

          {currentStep < 4 && (
            <Button onClick={handleNext} disabled={isProcessing || !isStepValid()}>
              {currentStep === 3 ? (isProcessing ? "Registering..." : "Register Agent") : "Next"}
            </Button>
          )}

          {currentStep === 4 && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
              <Button variant="outline" onClick={() => router.push("/dashboard/agents")}>
                View All Agents
              </Button>
              <Button onClick={() => router.refresh()}>Register Another Agent</Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
