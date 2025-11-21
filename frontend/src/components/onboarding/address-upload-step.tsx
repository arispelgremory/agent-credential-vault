"use client"

import { useSetAtom } from "jotai"
import { FileUpload } from "@/components/ui/file-upload"
import { onboardingKycDataAtom } from "@/store/atoms"
import { Info, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

export function AddressUploadStep() {
  const updateKycData = useSetAtom(onboardingKycDataAtom)
  const [isVerified, setIsVerified] = useState(false)

  const handleFileChange = (file: File | null) => {
    updateKycData({ addressDocument: file })

    // Simulate verification process
    if (file) {
      setTimeout(() => {
        setIsVerified(true)
      }, 2000)
    } else {
      setIsVerified(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 flex items-start space-x-3">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium">Proof of address requirements:</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>Must be less than 3 months old</li>
            <li>Must show your full name and current address</li>
            <li>Must be issued by a recognized authority</li>
          </ul>
        </div>
      </div>

      <FileUpload label="Upload Proof of Address" onFileChange={handleFileChange} acceptedFileTypes="image/*,.pdf" />

      {isVerified && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-green-800 text-sm font-medium">Address document successfully verified!</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-medium text-sm mb-2">Acceptable documents:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Utility bill (electricity, water, gas)</li>
            <li>• Bank statement</li>
            <li>• Government-issued document</li>
            <li>• Tax bill or statement</li>
          </ul>
        </div>

        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-medium text-sm mb-2">Not acceptable:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Mobile phone bills</li>
            <li>• Insurance statements</li>
            <li>• Screenshots of online bills</li>
            <li>• Documents older than 3 months</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
