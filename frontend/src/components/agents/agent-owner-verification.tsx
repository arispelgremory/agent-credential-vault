"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileUpload } from "@/components/ui/file-upload"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import type { AgentRegistrationData } from "@/lib/types/agent-registration"

const formSchema = z.object({
  ownerName: z.string().min(3, "Owner name must be at least 3 characters"),
  ownerEmail: z.string().email("Please enter a valid email address"),
  ownerOrganization: z.string().optional(),
})

interface AgentOwnerVerificationProps {
  registrationData: AgentRegistrationData
  updateRegistrationData: (data: Partial<AgentRegistrationData>) => void
}

export function AgentOwnerVerification({ registrationData, updateRegistrationData }: AgentOwnerVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected">(
    registrationData.ownerVerificationStatus || "pending",
  )

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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Legal Owner Verification</h3>
        <p className="text-muted-foreground">Verify the legal owner's identity to link with the agent's DID.</p>
      </div>

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

        {verificationStatus === "rejected" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              We couldn't verify your identity. Please check your document and try again.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
