"use client"

import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as d3 from "d3"

export function EntityRelationshipChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const { agents } = useSelector((state: RootState) => state.agents)
  const { credentials } = useSelector((state: RootState) => state.credentials)
  const user = useSelector((state: RootState) => state.user)

  useEffect(() => {
    if (!chartRef.current) return

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove()

    // Set up dimensions
    const width = chartRef.current.clientWidth
    const height = 500
    const margin = { top: 50, right: 50, bottom: 50, left: 50 }

    // Create SVG
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Chart title
    svg
      .append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#581c87") // Same purple as dashboard title
      .text("Entity Relationship Map")

    // Create nodes data
    const nodes = [
      // User (legal owner)
      {
        id: "user",
        name: "Legal Owner",
        type: "owner",
        radius: 20,
        color: "#000000",
      },
      // Agents
      ...agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        type: "agent",
        radius: 15,
        color: agent.isActive ? "#10b981" : "#ef4444", // Green for active, red for inactive
      })),
      // Credentials
      ...credentials.map((credential) => ({
        id: credential.id,
        name: credential.name,
        type: "credential",
        radius: 12,
        color: "#6366f1", // Indigo for credentials
      })),
    ]

    // Create links data
    const links = [
      // User to agents
      ...agents.map((agent) => ({
        source: "user",
        target: agent.id,
        value: 1,
      })),
      // Agents to credentials
      ...credentials.map((credential) => ({
        source: credential.agentId,
        target: credential.id,
        value: 1,
      })),
    ]

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force(
        "center",
        d3.forceCenter((width - margin.left - margin.right) / 2, (height - margin.top - margin.bottom) / 2),
      )
      .force(
        "collision",
        d3.forceCollide().radius((d: any) => d.radius + 10),
      )

    // Create links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.value))

    // Create node groups
    const node = svg
      .append("g")
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(d3.drag<any, any>().on("start", dragstarted).on("drag", dragged).on("end", dragended))

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)

    // Add labels above nodes
    node
      .append("text")
      .attr("dy", (d) => -d.radius - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#4c1d95") // Dark purple for better contrast
      .attr("stroke", "#ffffff") // White stroke for better readability
      .attr("stroke-width", "0.5px")
      .attr("paint-order", "stroke")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .text((d) => d.name)

    // Add type labels below nodes
    node
      .append("text")
      .attr("dy", (d) => d.radius + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280") // Gray for type labels
      .attr("font-size", "10px")
      .text((d) => d.type.charAt(0).toUpperCase() + d.type.slice(1))

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [agents, credentials, user])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-purple-900">Entity Relationship Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="w-full h-[500px]" />
      </CardContent>
    </Card>
  )
}
