"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { PlusCircle, X, Info } from "lucide-react"
import type { AgentRegistrationData } from "@/lib/types/agent-registration"
import type {
  StructuredPermission,
  PermissionType,
  PermissionOperator,
  DataAccessValue,
  ActionValue,
  TemporalValue,
  GeographicValue,
  DelegationValue,
  EthicalValue,
} from "@/lib/types/permissions"

interface AgentPermissionsProps {
  registrationData: AgentRegistrationData
  updateRegistrationData: (data: Partial<AgentRegistrationData>) => void
}

export function AgentPermissions({ registrationData, updateRegistrationData }: AgentPermissionsProps) {
  const [permissions, setPermissions] = useState<StructuredPermission[]>(registrationData.permissions || [])
  const [activeTab, setActiveTab] = useState<PermissionType>("DataAccess")

  // New permission being created
  const [newPermission, setNewPermission] = useState<Partial<StructuredPermission>>({
    type: "DataAccess",
    operator: "allow",
    value: {},
  })

  // Values for different permission types
  const [dataAccessValue, setDataAccessValue] = useState<Partial<DataAccessValue>>({})
  const [actionValue, setActionValue] = useState<Partial<ActionValue>>({})
  const [temporalValue, setTemporalValue] = useState<Partial<TemporalValue>>({})
  const [geographicValue, setGeographicValue] = useState<Partial<GeographicValue>>({})
  const [delegationValue, setDelegationValue] = useState<Partial<DelegationValue>>({})
  const [ethicalValue, setEthicalValue] = useState<Partial<EthicalValue>>({})

  const addPermission = () => {
    // Get the appropriate value based on the permission type
    let permissionValue: any = {}

    switch (newPermission.type) {
      case "DataAccess":
        permissionValue = dataAccessValue
        break
      case "Action":
        permissionValue = actionValue
        break
      case "Temporal":
        permissionValue = temporalValue
        break
      case "Geographic":
        permissionValue = geographicValue
        break
      case "Delegation":
        permissionValue = delegationValue
        break
      case "Ethical":
        permissionValue = ethicalValue
        break
    }

    // Create the complete permission
    const completePermission: StructuredPermission = {
      type: newPermission.type as PermissionType,
      operator: newPermission.operator as PermissionOperator,
      value: permissionValue,
    }

    // Add to permissions list
    const updatedPermissions = [...permissions, completePermission]
    setPermissions(updatedPermissions)

    // Update parent state
    updateRegistrationData({
      permissions: updatedPermissions,
    })

    // Reset form values
    resetPermissionForm()
  }

  const resetPermissionForm = () => {
    setDataAccessValue({})
    setActionValue({})
    setTemporalValue({})
    setGeographicValue({})
    setDelegationValue({})
    setEthicalValue({})
  }

  const removePermission = (index: number) => {
    const updatedPermissions = [...permissions]
    updatedPermissions.splice(index, 1)
    setPermissions(updatedPermissions)

    // Update parent state
    updateRegistrationData({
      permissions: updatedPermissions,
    })
  }

  // Check if the current permission is valid and can be added
  const isPermissionValid = () => {
    if (!newPermission.type || !newPermission.operator) return false

    switch (newPermission.type) {
      case "DataAccess":
        return !!dataAccessValue.resource && !!dataAccessValue.access
      case "Action":
        return !!actionValue.action
      case "Temporal":
        return !!(temporalValue.window || (temporalValue.start_date && temporalValue.end_date))
      case "Geographic":
        return !!(geographicValue.region || (geographicValue.coordinates?.lat && geographicValue.coordinates?.lng))
      case "Delegation":
        return delegationValue.max_depth !== undefined
      case "Ethical":
        return !!ethicalValue.standard
      default:
        return false
    }
  }

  // Render the appropriate form fields based on the permission type
  const renderPermissionValueForm = () => {
    switch (activeTab) {
      case "DataAccess":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource</label>
                <Input
                  placeholder="e.g., dataset:medical_records"
                  value={dataAccessValue.resource || ""}
                  onChange={(e) => setDataAccessValue({ ...dataAccessValue, resource: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Identifier for the data resource</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Access Level</label>
                <Select
                  value={dataAccessValue.access || ""}
                  onValueChange={(value) =>
                    setDataAccessValue({ ...dataAccessValue, access: value as "read" | "write" | "delete" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Type of access granted</p>
              </div>
            </div>
          </div>
        )

      case "Action":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Input
                  placeholder="e.g., predict, notify, purchase"
                  value={actionValue.action || ""}
                  onChange={(e) => setActionValue({ ...actionValue, action: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Type of action the agent can perform</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Calls (Optional)</label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={actionValue.max_calls || ""}
                  onChange={(e) =>
                    setActionValue({ ...actionValue, max_calls: Number.parseInt(e.target.value) || undefined })
                  }
                />
                <p className="text-xs text-muted-foreground">Maximum number of calls allowed</p>
              </div>
            </div>
          </div>
        )

      case "Temporal":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Window</label>
                <Input
                  placeholder="e.g., 09:00-17:00"
                  value={temporalValue.window || ""}
                  onChange={(e) => setTemporalValue({ ...temporalValue, window: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Time range when actions are allowed</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Days</label>
                <Select
                  value={temporalValue.days?.join(",") || ""}
                  onValueChange={(value) => setTemporalValue({ ...temporalValue, days: value.split(",") })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mon,Tue,Wed,Thu,Fri">Weekdays</SelectItem>
                    <SelectItem value="Sat,Sun">Weekends</SelectItem>
                    <SelectItem value="Mon,Tue,Wed,Thu,Fri,Sat,Sun">All days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Days when actions are allowed</p>
              </div>
            </div>
          </div>
        )

      case "Geographic":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Region</label>
                <Input
                  placeholder="e.g., country:EU, state:California"
                  value={geographicValue.region || ""}
                  onChange={(e) => setGeographicValue({ ...geographicValue, region: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Geographic region for restriction</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Coordinates (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Latitude"
                    type="number"
                    value={geographicValue.coordinates?.lat || ""}
                    onChange={(e) =>
                      setGeographicValue({
                        ...geographicValue,
                        coordinates: {
                          lat: Number.parseFloat(e.target.value) || 0,
                          lng: geographicValue.coordinates?.lng || 0,
                          radius: geographicValue.coordinates?.radius,
                        },
                      })
                    }
                  />
                  <Input
                    placeholder="Longitude"
                    type="number"
                    value={geographicValue.coordinates?.lng || ""}
                    onChange={(e) =>
                      setGeographicValue({
                        ...geographicValue,
                        coordinates: {
                          lat: geographicValue.coordinates?.lat || 0,
                          lng: Number.parseFloat(e.target.value) || 0,
                          radius: geographicValue.coordinates?.radius,
                        },
                      })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">Specific coordinates for geo-fencing</p>
              </div>
            </div>
          </div>
        )

      case "Delegation":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Delegation Depth</label>
                <Input
                  type="number"
                  placeholder="e.g., 2"
                  value={delegationValue.max_depth || ""}
                  onChange={(e) =>
                    setDelegationValue({ ...delegationValue, max_depth: Number.parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-muted-foreground">Maximum delegation depth allowed</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Approved Agents (Optional)</label>
                <Input
                  placeholder="e.g., did:example:agent2"
                  value={delegationValue.approved_agents?.join(",") || ""}
                  onChange={(e) =>
                    setDelegationValue({
                      ...delegationValue,
                      approved_agents: e.target.value ? e.target.value.split(",") : undefined,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">Comma-separated list of approved agent DIDs</p>
              </div>
            </div>
          </div>
        )

      case "Ethical":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Standard</label>
                <Select
                  value={ethicalValue.standard || ""}
                  onValueChange={(value) => setEthicalValue({ ...ethicalValue, standard: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GDPR">GDPR</SelectItem>
                    <SelectItem value="HIPAA">HIPAA</SelectItem>
                    <SelectItem value="CCPA">CCPA</SelectItem>
                    <SelectItem value="ISO27001">ISO 27001</SelectItem>
                    <SelectItem value="no_racial_bias">No Racial Bias</SelectItem>
                    <SelectItem value="no_gender_bias">No Gender Bias</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Ethical or compliance standard</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Rules (Optional)</label>
                <Input
                  placeholder="e.g., no_discrimination, data_minimization"
                  value={ethicalValue.rules?.join(",") || ""}
                  onChange={(e) =>
                    setEthicalValue({ ...ethicalValue, rules: e.target.value ? e.target.value.split(",") : undefined })
                  }
                />
                <p className="text-xs text-muted-foreground">Comma-separated list of ethical rules</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Agent Permissions</h3>
        <p className="text-muted-foreground">Define structured permissions that control what the AI agent can do.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Add New Permission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Permission Type</label>
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => {
                    setActiveTab(value as PermissionType)
                    setNewPermission({ ...newPermission, type: value as PermissionType })
                  }}
                >
                  <TabsList className="grid grid-cols-3 md:grid-cols-6">
                    <TabsTrigger value="DataAccess">Data</TabsTrigger>
                    <TabsTrigger value="Action">Action</TabsTrigger>
                    <TabsTrigger value="Temporal">Time</TabsTrigger>
                    <TabsTrigger value="Geographic">Geo</TabsTrigger>
                    <TabsTrigger value="Delegation">Delegate</TabsTrigger>
                    <TabsTrigger value="Ethical">Ethical</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Operator</label>
                <Select
                  value={(newPermission.operator as string) || ""}
                  onValueChange={(value) =>
                    setNewPermission({ ...newPermission, operator: value as PermissionOperator })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTab === "DataAccess" && (
                      <>
                        <SelectItem value="allow">Allow</SelectItem>
                        <SelectItem value="deny">Deny</SelectItem>
                        <SelectItem value="require">Require</SelectItem>
                      </>
                    )}
                    {activeTab === "Action" && (
                      <>
                        <SelectItem value="enable">Enable</SelectItem>
                        <SelectItem value="disable">Disable</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                      </>
                    )}
                    {activeTab === "Temporal" && (
                      <>
                        <SelectItem value="before">Before</SelectItem>
                        <SelectItem value="after">After</SelectItem>
                        <SelectItem value="during">During</SelectItem>
                      </>
                    )}
                    {activeTab === "Geographic" && (
                      <>
                        <SelectItem value="within">Within</SelectItem>
                        <SelectItem value="outside">Outside</SelectItem>
                      </>
                    )}
                    {activeTab === "Delegation" && (
                      <>
                        <SelectItem value="permit">Permit</SelectItem>
                        <SelectItem value="restrict">Restrict</SelectItem>
                      </>
                    )}
                    {activeTab === "Ethical" && (
                      <>
                        <SelectItem value="require">Require</SelectItem>
                        <SelectItem value="prohibit">Prohibit</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Render form fields based on permission type */}
            {renderPermissionValueForm()}

            <Button onClick={addPermission} disabled={!isPermissionValid()} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Permission
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display added permissions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Added Permissions</h4>
          <Badge variant="outline">{permissions.length} permissions</Badge>
        </div>

        {permissions.length > 0 ? (
          <div className="space-y-2">
            {permissions.map((permission, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-primary/10">
                    {permission.type}
                  </Badge>
                  <span className="text-sm font-medium">{permission.operator}</span>
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {JSON.stringify(permission.value)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePermission(index)}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed rounded-md">
            <p className="text-muted-foreground">No permissions added yet</p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
        <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-amber-800">About Agent Permissions</h4>
          <p className="text-sm text-amber-700 mt-1">
            Permissions define what your AI agent can do. Each permission has a type, operator, and value. These
            permissions will be enforced by smart contracts when the agent performs actions.
          </p>
        </div>
      </div>
    </div>
  )
}
