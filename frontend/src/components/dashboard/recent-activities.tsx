"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Bot, ExternalLink } from "lucide-react"
import Link from "next/link"

export function RecentActivities() {
  // Add default empty array to prevent undefined errors
  const agents = useSelector((state: RootState) => state.agents?.agents || [])

  // Collect all activity logs from all agents
  const allActivities = agents.flatMap((agent) =>
    (agent.activityLogs || []).map((log) => ({
      ...log,
      agentName: agent.name,
      agentIsActive: agent.isActive,
    })),
  )

  // Sort by timestamp (most recent first)
  const sortedActivities = [...allActivities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  // Take the 10 most recent activities
  const recentActivities = sortedActivities.slice(0, 10)

  // If no activities, show sample data
  const displayActivities =
    recentActivities.length > 0
      ? recentActivities
      : [
          {
            id: "sample-1",
            agentId: "agent-1",
            agentName: "Medical Assistant",
            agentIsActive: true,
            action: "Book medical appointment",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: "success",
            thirdPartySystem: "Hospital Booking System",
          },
          {
            id: "sample-2",
            agentId: "agent-2",
            agentName: "Financial Advisor",
            agentIsActive: true,
            action: "Transfer funds",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            status: "failed",
            thirdPartySystem: "Banking System",
            details: "Authorization failed - permission expired",
          },
          {
            id: "sample-3",
            agentId: "agent-3",
            agentName: "Calendar Manager",
            agentIsActive: true,
            action: "Schedule meeting",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "success",
            thirdPartySystem: "Calendar API",
          },
        ]

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
            <CardDescription>Latest actions performed by your AI agents</CardDescription>
          </div>
          <Link href="/dashboard/activity">
            <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
              View All Activities
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="mt-0.5">
                {activity.status === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : activity.status === "failed" ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium">{activity.action}</p>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={
                        activity.status === "success"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : activity.status === "failed"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }
                    >
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Bot className="mr-1 h-3 w-3" />
                    <span>{activity.agentName}</span>
                  </div>
                  <span className="hidden sm:inline mx-2">•</span>
                  <span>{activity.thirdPartySystem}</span>
                </div>
                {activity.details && <p className="text-sm text-red-600 mt-1">{activity.details}</p>}
              </div>
            </div>
          ))}

          {displayActivities.length === 0 && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No recent activities</p>
            </div>
          )}

          <div className="pt-4 flex justify-center">
            <Link href="/dashboard/activity">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ExternalLink className="mr-2 h-4 w-4" /> View All Activity Logs
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
