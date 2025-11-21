"use client"

import { useSetAtom } from "jotai"
import { FileUpload } from "@/components/ui/file-upload"
import { onboardingKycDataAtom } from "@/store/atoms"
import { Info } from "lucide-react"

export function IdUploadStep() {
  const updateKycData = useSetAtom(onboardingKycDataAtom)

  const handleFileChange = (file: File | null) => {
    updateKycData({ idDocument: file })
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 flex items-start space-x-3">
        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium">Important:</p>
          <p>Please ensure your ID document is:</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>Clear and unobstructed</li>
            <li>Shows all four corners</li>
            <li>All text is clearly readable</li>
            <li>Not expired</li>
          </ul>
        </div>
      </div>

      <FileUpload label="Upload your ID Document" onFileChange={handleFileChange} acceptedFileTypes="image/*,.pdf" />

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-medium text-sm mb-2">Acceptable formats:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Passport</li>
            <li>• Driver's license</li>
            <li>• National ID card</li>
          </ul>
        </div>

        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-medium text-sm mb-2">Requirements:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• JPG, PNG or PDF format</li>
            <li>• Max file size: 5MB</li>
            <li>• Color image (no B&W)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
