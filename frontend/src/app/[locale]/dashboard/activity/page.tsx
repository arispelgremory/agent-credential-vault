"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, Clock, Search, FileDown, Filter } from "lucide-react"

export default function ActivityPage() {
  const { agents } = useSelector((state: RootState) => state.agents)

  // Flatten all activity logs from all agents
  const allActivityLogs = agents
    .flatMap((agent) =>
      agent.activityLogs.map((log) => ({
        ...log,
        agentName: agent.name,
      })),
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const [filteredLogs, setFilteredLogs] = useState(allActivityLogs)
  const [selectedAgent, setSelectedAgent] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const handleFilter = () => {
    let filtered = allActivityLogs

    if (selectedAgent !== "all") {
      filtered = filtered.filter((log) => {
        const agent = agents.find((a) => a.id === log.agentId)
        return agent && agent.name === selectedAgent
      })
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((log) => log.status === selectedStatus)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(query) ||
          (log.thirdPartySystem && log.thirdPartySystem.toLowerCase().includes(query)) ||
          (log.details && log.details.toLowerCase().includes(query)),
      )
    }

    setFilteredLogs(filtered)
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedAgent("all")
    setSelectedStatus("all")
    setSearchQuery("")
    setFilteredLogs(allActivityLogs)
  }

  // Format timestamp to readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return null
    }
  }

  // Get unique agent names
  const agentNames = [...new Set(agents.map((agent) => agent.name))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Activity Log</h1>
        <p className="text-muted-foreground">Monitor and track all AI agent activities</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Filter activity logs by agent, status, or keyword</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {agentNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button onClick={handleFilter} size="sm">
              <Filter className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
            <Button variant="outline" onClick={resetFilters} size="sm">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Activity Logs</CardTitle>
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" /> Export
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.agentName}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.thirdPartySystem || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      <span className="capitalize">{log.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activities match your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
