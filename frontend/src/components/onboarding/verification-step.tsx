"use client"

import { useAtomValue, useSetAtom } from "jotai"
import { userAtom, onboardingKycDataAtom, updateKYCStatusAtom } from "@/store/atoms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { useState, useEffect } from "react"

enum VerificationStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  VERIFIED = "verified",
  FAILED = "failed",
}

interface VerificationItem {
  id: string
  name: string
  status: VerificationStatus
  message?: string
}

export function VerificationStep() {
  const kycData = useAtomValue(onboardingKycDataAtom)
  const user = useAtomValue(userAtom)
  const updateKYCStatus = useSetAtom(updateKYCStatusAtom)

  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([
    {
      id: "identity",
      name: "Identity Verification",
      status: VerificationStatus.PENDING,
    },
    {
      id: "address",
      name: "Address Verification",
      status: VerificationStatus.PENDING,
    },
    {
      id: "facematch",
      name: "Face Matching",
      status: VerificationStatus.PENDING,
    },
    {
      id: "kyc",
      name: "KYC Compliance Check",
      status: VerificationStatus.PENDING,
    },
  ])

  const [overallStatus, setOverallStatus] = useState<VerificationStatus>(VerificationStatus.PROCESSING)

  useEffect(() => {
    const verifyDocuments = async () => {
      try {
        // Update statuses one by one to simulate verification process
        updateItemStatus("identity", VerificationStatus.PROCESSING)
        await delay(1500)
        updateItemStatus("identity", VerificationStatus.VERIFIED)

        updateItemStatus("address", VerificationStatus.PROCESSING)
        await delay(2000)
        updateItemStatus("address", VerificationStatus.VERIFIED)

        updateItemStatus("facematch", VerificationStatus.PROCESSING)
        await delay(1800)
        updateItemStatus("facematch", VerificationStatus.VERIFIED)

        updateItemStatus("kyc", VerificationStatus.PROCESSING)
        await delay(2500)

        // In a real app, this would be determined by your KYC provider's response
        const isApproved = Math.random() > 0.2 // 80% chance of success for demo purposes

        if (isApproved) {
          updateItemStatus("kyc", VerificationStatus.VERIFIED)
          setOverallStatus(VerificationStatus.VERIFIED)
          updateKYCStatus("in_progress")
        } else {
          updateItemStatus("kyc", VerificationStatus.FAILED, "Additional verification required")
          setOverallStatus(VerificationStatus.FAILED)
          updateKYCStatus("rejected")
        }
      } catch (error) {
        console.error("Verification error:", error)
        setOverallStatus(VerificationStatus.FAILED)
      }
    }

    verifyDocuments()
  }, [kycData, updateKYCStatus])

  const updateItemStatus = (id: string, status: VerificationStatus, message?: string) => {
    setVerificationItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, status, message } : item)))
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case VerificationStatus.FAILED:
        return <XCircle className="h-5 w-5 text-red-500" />
      case VerificationStatus.PROCESSING:
        return <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Verification Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {verificationItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <span className="font-medium">{item.name}</span>
                </div>
                <span
                  className={`text-sm ${
                    item.status === VerificationStatus.VERIFIED
                      ? "text-green-500"
                      : item.status === VerificationStatus.FAILED
                        ? "text-red-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {item.status === VerificationStatus.VERIFIED
                    ? "Verified"
                    : item.status === VerificationStatus.FAILED
                      ? "Failed"
                      : item.status === VerificationStatus.PROCESSING
                        ? "Processing..."
                        : "Pending"}
                </span>
              </div>
            ))}
          </div>

          {overallStatus === VerificationStatus.VERIFIED && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="text-green-800 font-medium mb-1">Initial Verification Complete!</h4>
              <p className="text-green-700 text-sm">
                Your documents have been successfully processed. Our team will now review your submission. This
                typically takes 24-48 hours.
              </p>
            </div>
          )}

          {overallStatus === VerificationStatus.FAILED && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h4 className="text-red-800 font-medium mb-1">Verification Issue Detected</h4>
              <p className="text-red-700 text-sm">
                There was an issue with your verification. Please check the errors above and try again. You may need to
                provide clearer documents or additional information.
              </p>
            </div>
          )}

          {overallStatus === VerificationStatus.PROCESSING && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-2"></div>
              <h4 className="text-blue-800 font-medium mb-1">Verification in Progress</h4>
              <p className="text-blue-700 text-sm">We're verifying your identity. This may take a few moments.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
