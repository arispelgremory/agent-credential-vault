"use client"

import { useState } from "react"
import { useAtomValue } from "jotai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { userAtom, isLoadingAtom } from "@/store/atoms"

export function KYCStatusCheck() {
  const router = useRouter()
  const user = useAtomValue(userAtom)
  const isLoading = useAtomValue(isLoadingAtom)
  const [isChecking, setIsChecking] = useState(false)

  // Show loading state during SSR or when user is loading
  if (isLoading || !user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">KYC Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const kycStatus = user.userInfo.kycStatus
  const kycSubmittedAt = user.userInfo.kycSubmittedAt
  const email = user.userInfo.userEmail

  console.log("kycStatus", kycStatus)


  const handleCheckStatus = async () => {
    setIsChecking(true)

    try {
      // In a real app, this would be an API call to check KYC status
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For jasim.puthucheary@gmail.com, always return verified
      const userEmail = email

      console.log("Checking KYC status for email:", userEmail)

      if (userEmail === "jasim.puthucheary@gmail.com") {
        console.log("Setting verified status for jasim.puthucheary@gmail.com")
        // updateKYCStatus("verified")
      } else {
        // Mock response - in a real app, this would come from your backend
        const mockStatus = Math.random() > 0.3 ? "verified" : "under_review"
        console.log(`Setting ${mockStatus} status for ${userEmail}`)
        // updateKYCStatus(mockStatus)
      }
    } catch (error) {
      console.error("Error checking KYC status:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">KYC Verification Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {kycStatus === "pending" && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800">Verification Required</AlertTitle>
            <AlertDescription className="text-amber-700">
              You need to complete the KYC verification process to access your account.
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === "in_progress" && (
          <Alert className="bg-blue-50 border-blue-200">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <AlertTitle className="text-blue-800">Verification In Progress</AlertTitle>
            <AlertDescription className="text-blue-700">
              Your KYC verification is currently in progress. This may take a few minutes.
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === "under_review" && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-blue-800">Under Review</AlertTitle>
            <AlertDescription className="text-blue-700">
              Your KYC documents are under review. This process typically takes 24-48 hours.
              {kycSubmittedAt && <div className="mt-2 text-sm">Submitted on: {formatDate(kycSubmittedAt)}</div>}
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === "verified" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Verification Successful</AlertTitle>
            <AlertDescription className="text-green-700">
              Your identity has been successfully verified. You can now access all platform features.
              {kycSubmittedAt && <div className="mt-2 text-sm">Verified on: {formatDate(kycSubmittedAt)}</div>}
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === "rejected" && (
          <Alert variant="destructive">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              Your KYC verification was unsuccessful. Please review the issues below and resubmit your documents.
              {kycSubmittedAt && <div className="mt-2 text-sm">Reviewed on: {formatDate(kycSubmittedAt)}</div>}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 pt-4">
          {kycStatus === "pending" && (
            <Button onClick={() => router.push("/onboarding/kyc")} className="w-full">
              Start KYC Verification
            </Button>
          )}

          {kycStatus === "in_progress" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <p className="text-muted-foreground mb-4">Please wait while we process your verification...</p>
              <Button variant="outline" className="w-full" disabled>
                Processing...
              </Button>
            </div>
          )}

          {kycStatus === "under_review" && (
            <>
              <Button onClick={handleCheckStatus} variant="outline" className="w-full" disabled={isChecking}>
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking status...
                  </>
                ) : (
                  "Check Status"
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                You'll receive an email once your verification is complete.
              </p>
            </>
          )}

          {kycStatus === "verified" && (
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          )}

          {kycStatus === "rejected" && (
            <>
              <Button onClick={() => router.push("/onboarding/kyc")} className="w-full">
                Resubmit Documents
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  /* Open support chat */
                }}
              >
                Contact Support
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
