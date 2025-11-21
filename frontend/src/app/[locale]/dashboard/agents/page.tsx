"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"

import { createClient } from "@/constants/axios-v1"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type AgentEndpoint = {
  name?: string
  endpoint?: string
  version?: string
  capabilities?: string[]
}

type IdentityAgent = {
  agentId: string
  agentIdOnChain: string
  name: string
  description: string
  owner: string
  registrationUri: string | null
  metadataCid: string | null
  txHash: string
  tokenId: string | null
  supportedTrust: string[]
  endpoints: AgentEndpoint[]
  agentRegistry: string
  chainId: string
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  createdAt: string
  updatedAt: string
}

type GetAgentsResponse =
  | {
      success: true
      message: string
      data: IdentityAgent[]
    }
  | {
      success: false
      message: string
      data: null
    }

export default function AgentsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  const apiClient = useMemo(
    () =>
      createClient({
        onRefreshFail: () => {
          router.push("/login?reason=session-expired")
        },
      }),
    [router],
  )

  const {
    data,
    isLoading,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await apiClient.get<GetAgentsResponse>("/identity/agent")
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to fetch agents")
      }
      return response.data.data
    },
    staleTime: 30_000,
  })

  const agents = data ?? []

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      if (activeTab === "active") return agent.status === "ACTIVE"
      if (activeTab === "inactive") return agent.status !== "ACTIVE"
      return true
    })
  }, [agents, activeTab])

  const showEmptyState = !isLoading && !fetchError && filteredAgents.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">AI Agents & MCP Servers</h1>
          <p className="text-muted-foreground">Manage your on-chain AI agents and MCP servers along with their endpoints</p>
        </div>
        <Link href="/dashboard/agents/register">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Register New Agent
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Agents</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <AgentsGrid agents={filteredAgents} isLoading={isLoading} error={fetchError?.message} onRetry={refetch} />
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <AgentsGrid agents={filteredAgents} isLoading={isLoading} error={fetchError?.message} onRetry={refetch} />
        </TabsContent>
        <TabsContent value="inactive" className="mt-4">
          <AgentsGrid agents={filteredAgents} isLoading={isLoading} error={fetchError?.message} onRetry={refetch} />
        </TabsContent>
      </Tabs>

      {showEmptyState && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No AI agents or MCP servers found</h3>
          <p className="text-muted-foreground mb-6">
            {activeTab === "active"
              ? "You don't have any active agents."
              : activeTab === "inactive"
                ? "You don't have any inactive agents."
                : "You haven't created any AI agents or MCP servers yet."}
          </p>
          <Link href="/dashboard/agents/register">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Register Your First Agent
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

interface AgentCardProps {
  agent: IdentityAgent
}

function AgentCard({ agent }: AgentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const isActive = agent.status === "ACTIVE"

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg">{agent.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Registered on {formatDate(agent.createdAt)} • On-chain ID {agent.agentIdOnChain}
          </p>
        </div>
        <Badge
          variant={isActive ? "default" : "outline"}
          className={isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
        >
          {isActive ? "Active" : agent.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{agent.description}</p>

        <div>
          <h4 className="text-sm font-medium mb-2">Supported Trust</h4>
          {agent.supportedTrust.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {agent.supportedTrust.map((trust) => (
                <Badge key={trust} variant="outline" className="bg-muted/50">
                  {trust}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No trust signals configured.</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Endpoints</h4>
          {agent.endpoints.length > 0 ? (
            <div className="space-y-3">
              {agent.endpoints.map((endpoint, index) => (
                <div key={`${endpoint.endpoint}-${index}`} className="rounded border px-3 py-2 text-xs space-y-1">
                  <p>
                    <span className="font-semibold">Name:</span> {endpoint.name || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">URL:</span> {endpoint.endpoint || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Version:</span> {endpoint.version || "N/A"}
                  </p>
                  {endpoint.capabilities && endpoint.capabilities.length > 0 && (
                    <p>
                      <span className="font-semibold">Capabilities:</span> {endpoint.capabilities.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No endpoints registered.</p>
          )}
        </div>

      </CardContent>
    </Card>
  )
}

type AgentsGridProps = {
  agents: IdentityAgent[]
  isLoading: boolean
  error?: string
  onRetry: () => void
}

function AgentsGrid({ agents, isLoading, error, onRetry }: AgentsGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-sm text-muted-foreground">Loading agents...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10 space-y-3">
        <p className="text-sm text-destructive">Failed to load agents: {error}</p>
        <Button variant="outline" onClick={() => onRetry()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-sm text-muted-foreground">No agents for this filter.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {agents.map((agent) => (
        <AgentCard key={agent.agentId} agent={agent} />
      ))}
    </div>
  )
}
