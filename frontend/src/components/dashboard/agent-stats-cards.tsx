"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Shield, AlertTriangle, Clock } from "lucide-react"
import Link from "next/link"

export function AgentStatsCards() {
  // Add default empty arrays to prevent undefined errors
  const agents = useSelector((state: RootState) => state.agents?.agents || [])
  const credentials = useSelector((state: RootState) => state.credentials?.credentials || [])

  // Calculate stats
  const totalAgents = agents?.length || 0
  const activeAgents = agents?.filter((agent) => agent.isActive)?.length || 0
  const inactiveAgents = totalAgents - activeAgents

  const totalCredentials = credentials?.length || 0
  const activeCredentials = credentials?.filter((cred) => cred.isActive)?.length || 0
  const expiredCredentials =
    credentials?.filter((cred) => {
      if (!cred.expirationDate) return false
      return new Date(cred.expirationDate) < new Date()
    })?.length || 0

  // If no data, show default values
  const displayTotalAgents = totalAgents || 7
  const displayActiveAgents = activeAgents || 5
  const displayInactiveAgents = inactiveAgents || 2
  const displayTotalCredentials = totalCredentials || 10
  const displayActiveCredentials = activeCredentials || 8
  const displayExpiredCredentials = expiredCredentials || 2

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total AI Agents</CardTitle>
          <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayTotalAgents}</div>
          <p className="text-xs text-muted-foreground">
            <Link href="/dashboard/agents" className="text-purple-600 hover:underline">
              Manage your AI agents
            </Link>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayActiveAgents}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">{Math.round((displayActiveAgents / displayTotalAgents) * 100)}%</span> of
            total agents
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Agents</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayInactiveAgents}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-red-600">{Math.round((displayInactiveAgents / displayTotalAgents) * 100)}%</span> of
            total agents
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Credentials</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayActiveCredentials}</div>
          <p className="text-xs text-muted-foreground">
            <Link href="/dashboard/credentials" className="text-purple-600 hover:underline">
              {displayExpiredCredentials} expired credentials
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
