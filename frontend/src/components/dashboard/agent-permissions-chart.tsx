"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function AgentPermissionsChart() {
  // Add default empty array to prevent undefined errors
  const agents = useSelector((state: RootState) => state.agents?.agents || [])

  // Count permissions by category
  const getPermissionsByCategory = () => {
    const permissionCounts: Record<string, number> = {}

    agents.forEach((agent) => {
      agent.permissions.forEach((perm) => {
        // Extract the category from the permission (e.g., "Medical.Schedule" -> "Medical")
        const category = perm.split(".")[0]
        permissionCounts[category] = (permissionCounts[category] || 0) + 1
      })
    })

    return Object.entries(permissionCounts).map(([name, value]) => ({ name, value }))
  }

  const data = getPermissionsByCategory()

  // If no data, show sample data
  const displayData =
    data.length > 0
      ? data
      : [
          { name: "Medical", value: 2 },
          { name: "Financial", value: 2 },
          { name: "Calendar", value: 2 },
          { name: "Email", value: 1 },
          { name: "Documents", value: 2 },
        ]

  const COLORS = ["#2A5C8A", "#4FD1C5", "#805AD5", "#D53F8C", "#DD6B20", "#3182CE", "#38A169", "#D69E2E", "#E53E3E"]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Permission Categories</CardTitle>
        <CardDescription>Distribution of permission types across agents</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} permissions`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
