"use client"

import { useEffect, useState } from "react"
import { WalletInfoCard } from "@/components/dashboard/wallet-info-card"
import { AgentStatsCards } from "@/components/dashboard/agent-stats-cards"
import { AgentPermissionsChart } from "@/components/dashboard/agent-permissions-chart"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"
import { AuthDebugger } from "@/components/auth-debugger"
import { EntityRelationshipChart } from "@/components/dashboard/entity-relationship-chart"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [pageLoading, setPageLoading] = useState(true)

  // Add default empty arrays to prevent undefined errors
  const agents = useSelector((state: RootState) => state.agents?.agents || [])
  const credentials = useSelector((state: RootState) => state.credentials?.credentials || [])

  useEffect(() => {
    if (!isLoading) {
      setPageLoading(false)
    }
  }, [isLoading])

  useEffect(() => {
    // Log data to verify it's loaded
    console.log("Dashboard data:", {
      agentsCount: agents?.length || 0,
      credentialsCount: credentials?.length || 0,
    })
  }, [agents, credentials])

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-700" />
          <p className="text-purple-700">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <AuthDebugger />

      <div>
        <h1 className="text-2xl font-bold mb-2 text-purple-900">Dashboard</h1>
        <p className="text-purple-700">Manage your identity and AI agent permissions</p>
      </div>

      <AgentStatsCards />

      <div className="grid grid-cols-1 gap-6">
        <EntityRelationshipChart />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WalletInfoCard />
          <AgentPermissionsChart />
        </div>
      </div>

      <RecentActivities />
    </div>
  )
}
