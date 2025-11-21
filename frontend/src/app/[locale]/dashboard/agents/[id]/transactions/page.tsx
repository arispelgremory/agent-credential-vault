"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { sampleAgents } from "@/lib/utils/sample-data"

export default function AgentTransactionsPage() {
  const params = useParams()
  const agentId = params.id as string

  // Get agent data from Redux or sample data
  const agents = useSelector((state: RootState) => {
    const stateAgents = state.agents?.agents || []
    return stateAgents.length > 0 ? stateAgents : sampleAgents
  })

  const agent = agents.find((a) => a.id === agentId)

  // Sample transactions data
  const transactions = [
    {
      id: "tx-1",
      type: "Authentication",
      status: "success",
      timestamp: "2023-10-15T14:32:00Z",
      system: "OpenAI API",
      details: "Agent authenticated with OpenAI API using verifiable credential",
    },
    {
      id: "tx-2",
      type: "Data Access",
      status: "success",
      timestamp: "2023-10-15T14:35:12Z",
      system: "Customer Database",
      details: "Agent accessed customer records within permitted scope",
    },
    {
      id: "tx-3",
      type: "Action Execution",
      status: "failed",
      timestamp: "2023-10-15T14:40:23Z",
      system: "Payment Gateway",
      details: "Agent attempted to process payment outside of permitted amount range",
    },
    {
      id: "tx-4",
      type: "Credential Verification",
      status: "pending",
      timestamp: "2023-10-15T15:01:45Z",
      system: "Hedera Network",
      details: "Verifying agent credential with Hedera consensus service",
    },
    {
      id: "tx-5",
      type: "Permission Update",
      status: "success",
      timestamp: "2023-10-14T09:12:33Z",
      system: "MetaMynd Platform",
      details: "Owner updated agent permissions to include new data access rights",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="mb-4 pl-0 text-metamynd-blue hover:text-metamynd-blue/80 hover:bg-metamynd-purple/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold metamynd-gradient-text">Agent Transactions</h1>
          <p className="text-muted-foreground">
            Activity log for agent: <span className="font-medium text-white">{agent?.name || agentId}</span>
          </p>
        </div>
      </div>

      <Card className="border border-metamynd-purple/20 bg-metamynd-darker">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent activities and transactions performed by this agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-start p-4 rounded-lg border border-metamynd-purple/10 bg-metamynd-dark/50"
              >
                <div className="mr-4 mt-1">{getStatusIcon(tx.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-white">{tx.type}</div>
                    <Badge
                      variant="outline"
                      className={`
                        ${tx.status === "success" ? "bg-green-500/10 text-green-500 border-green-500/30" : ""}
                        ${tx.status === "failed" ? "bg-red-500/10 text-red-500 border-red-500/30" : ""}
                        ${tx.status === "pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" : ""}
                      `}
                    >
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{tx.details}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-metamynd-blue">{tx.system}</span>
                    <span className="text-muted-foreground">{formatDate(tx.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
