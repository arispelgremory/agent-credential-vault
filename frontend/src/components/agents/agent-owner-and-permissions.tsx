"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUpload } from "@/components/ui/file-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Loader2, PlusCircle, X, FileText } from "lucide-react"
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

const formSchema = z.object({
  ownerName: z.string().min(3, "Owner name must be at least 3 characters"),
  ownerEmail: z.string().email("Please enter a valid email address"),
  ownerOrganization: z.string().optional(),
})

interface AgentOwnerAndPermissionsProps {
  registrationData: AgentRegistrationData
  updateRegistrationData: (data: Partial<AgentRegistrationData>) => void
}

export function AgentOwnerAndPermissions({ registrationData, updateRegistrationData }: AgentOwnerAndPermissionsProps) {
  const [activeTab, setActiveTab] = useState("owner")
  const [isVerifying, setIsVerifying] = useState(false)
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected">(
    registrationData.ownerVerificationStatus || "pending",
  )
  const [isCreatingVC, setIsCreatingVC] = useState(false)
  const [vcCreated, setVcCreated] = useState(!!registrationData.ownershipVC)

  // Permissions state
  const [permissions, setPermissions] = useState<StructuredPermission[]>(registrationData.permissions || [])
  const [permissionType, setPermissionType] = useState<PermissionType>("DataAccess")

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerName: registrationData.ownerName || "",
      ownerEmail: "",
      ownerOrganization: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateRegistrationData({
      ownerName: values.ownerName,
      ownerVerificationStatus: verificationStatus,
    })
  }

  // Update parent state when form values change
  const handleFormChange = () => {
    const values = form.getValues()
    updateRegistrationData({
      ownerName: values.ownerName,
    })
  }

  const handleVerify = async () => {
    if (!idDocument) return

    setIsVerifying(true)

    // Simulate verification process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Always succeed for demo purposes
    setVerificationStatus("verified")
    updateRegistrationData({
      ownerVerificationStatus: "verified",
    })

    setIsVerifying(false)
  }

  const handleCreateVC = async () => {
    if (!registrationData.ownerDID) return

    setIsCreatingVC(true)

    try {
      // Create ownership attestation VC
      const ownershipVC = {
        id: `vc-ownership-${Date.now()}`,
        issuanceDate: new Date().toISOString(),
        expirationDate: undefined,
      }

      // Update registration data
      updateRegistrationData({
        ownershipVC,
      })

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setVcCreated(true)
    } catch (error) {
      console.error("Error creating ownership attestation:", error)
    } finally {
      setIsCreatingVC(false)
    }
  }

  // Permission functions
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
    switch (permissionType) {
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

      // Add other permission type forms as needed...

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Owner Verification & Permissions</h3>
        <p className="text-muted-foreground">Verify the legal owner's identity and define agent permissions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="owner">Owner Identity</TabsTrigger>
          <TabsTrigger value="attestation">Ownership Attestation</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Owner Identity Tab */}
        <TabsContent value="owner" className="space-y-6 pt-4">
          <Form {...form}>
            <form onChange={handleFormChange} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Owner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Smith or Acme Corporation" {...field} />
                    </FormControl>
                    <FormDescription>Full legal name of the individual or organization</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., john@example.com" {...field} />
                    </FormControl>
                    <FormDescription>Email address for verification and notifications</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerOrganization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Acme Corporation" {...field} />
                    </FormControl>
                    <FormDescription>If registering on behalf of an organization</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Identity Verification</h4>
            <p className="text-sm text-muted-foreground">
              Please upload a government-issued ID or business registration document to verify your identity.
            </p>

            <FileUpload
              label="Identity Document"
              onFileChange={setIdDocument}
              acceptedFileTypes="image/*,.pdf"
              maxSize={5}
            />

            {idDocument && !isVerifying && verificationStatus === "pending" && (
              <Button onClick={handleVerify} className="w-full">
                Verify Identity
              </Button>
            )}

            {isVerifying && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Verifying your identity...</p>
                    <p className="text-blue-700 text-xs">This may take a few moments</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {verificationStatus === "verified" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Identity Verified</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your identity has been successfully verified. You can proceed to the next step.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        {/* Ownership Attestation Tab */}
        <TabsContent value="attestation" className="space-y-6 pt-4">
          {!vcCreated ? (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Create Ownership Attestation</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    A verifiable credential will be created that attests to your ownership of this AI agent. This
                    credential will be signed by your DID and will be used to prove ownership.
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Ownership Attestation Details</h4>
                  <ul className="text-sm space-y-2">
                    <li>
                      <span className="font-medium">Owner DID:</span> {registrationData.ownerDID}
                    </li>
                    <li>
                      <span className="font-medium">Owner Name:</span> {registrationData.ownerName}
                    </li>
                    <li>
                      <span className="font-medium">Registration Date:</span> {new Date().toLocaleDateString()}
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleCreateVC}
                  disabled={isCreatingVC || !registrationData.ownerName || verificationStatus !== "verified"}
                  className="w-full"
                >
                  {isCreatingVC ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Attestation...
                    </>
                  ) : (
                    "Create Ownership Attestation"
                  )}
                </Button>

                {(verificationStatus !== "verified" || !registrationData.ownerName) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Owner Verification Required</AlertTitle>
                    <AlertDescription>
                      You need to verify the owner's identity before creating an ownership attestation.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-medium text-green-800">Ownership Attestation Created!</h3>
                </div>

                <p className="text-sm text-green-700">
                  A verifiable credential has been created that attests to your ownership of this AI agent. This
                  credential will be minted as an NFT in the next step.
                </p>

                <div className="bg-white border border-green-200 rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">Verifiable Credential</h4>
                  <pre className="text-xs overflow-auto p-2 bg-gray-50 rounded">
                    {JSON.stringify(
                      {
                        "@context": ["https://www.w3.org/2018/credentials/v1"],
                        type: ["VerifiableCredential", "OwnershipAttestation"],
                        issuer: registrationData.ownerDID,
                        issuanceDate: registrationData.ownershipVC?.issuanceDate,
                        credentialSubject: {
                          ownedBy: registrationData.ownerDID,
                          ownerName: registrationData.ownerName,
                          registrationDate: new Date().toISOString().split("T")[0],
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Add New Permission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Permission Type</label>
                    <Select
                      value={permissionType}
                      onValueChange={(value) => {
                        setPermissionType(value as PermissionType)
                        setNewPermission({ ...newPermission, type: value as PermissionType })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select permission type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DataAccess">Data Access</SelectItem>
                        <SelectItem value="Action">Action</SelectItem>
                        <SelectItem value="Temporal">Temporal</SelectItem>
                        <SelectItem value="Geographic">Geographic</SelectItem>
                        <SelectItem value="Delegation">Delegation</SelectItem>
                        <SelectItem value="Ethical">Ethical</SelectItem>
                      </SelectContent>
                    </Select>
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
                        {permissionType === "DataAccess" && (
                          <>
                            <SelectItem value="allow">Allow</SelectItem>
                            <SelectItem value="deny">Deny</SelectItem>
                            <SelectItem value="require">Require</SelectItem>
                          </>
                        )}
                        {permissionType === "Action" && (
                          <>
                            <SelectItem value="enable">Enable</SelectItem>
                            <SelectItem value="disable">Disable</SelectItem>
                            <SelectItem value="limit">Limit</SelectItem>
                          </>
                        )}
                        {permissionType === "Temporal" && (
                          <>
                            <SelectItem value="before">Before</SelectItem>
                            <SelectItem value="after">After</SelectItem>
                            <SelectItem value="during">During</SelectItem>
                          </>
                        )}
                        {permissionType === "Geographic" && (
                          <>
                            <SelectItem value="within">Within</SelectItem>
                            <SelectItem value="outside">Outside</SelectItem>
                          </>
                        )}
                        {permissionType === "Delegation" && (
                          <>
                            <SelectItem value="permit">Permit</SelectItem>
                            <SelectItem value="restrict">Restrict</SelectItem>
                          </>
                        )}
                        {permissionType === "Ethical" && (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
