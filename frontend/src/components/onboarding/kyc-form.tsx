"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { useSetAtom, useAtomValue } from "jotai"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, Camera, CheckCircle2, AlertTriangle } from "lucide-react"
import { updateKYCStatusAtom, updateKYCSubmittedAtAtom, userAtom, isLoadingAtom } from "@/store/atoms"
import { useAuth } from "@/lib/context/auth-context"
import Webcam from "react-webcam"
import { ToastAction } from "@/components/ui/toast"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { createClient } from "@/constants/axios-v1"

export function KYCForm() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const webcamRef = useRef<Webcam>(null)
  
  // Use atoms directly to avoid SSR issues with useUser hook
  const user = useAtomValue(userAtom)
  const isLoading = useAtomValue(isLoadingAtom)
  
  const client = createClient({ onRefreshFail: () => {
    toast.error("Session expired. Please log in again.")
    router.push("/auth/login")
  } })

  const [activeTab, setActiveTab] = useState("document")
  const [documentType, setDocumentType] = useState("")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [verificationMessage, setVerificationMessage] = useState("")

  // Show loading state during SSR or when user is loading
  if (isLoading || !user) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Identity Verification</CardTitle>
          <CardDescription>
            Loading...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle document upload
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setDocumentFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setDocumentPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      toast.success(`${file.name} has been uploaded successfully.`)
    }
  }

  // Capture selfie from webcam
  const captureSelfie = useCallback(() => {
    setIsCapturing(true)
    setTimeout(() => {
      const imageSrc = webcamRef.current?.getScreenshot()
      setSelfieImage(imageSrc || null)
      setIsCapturing(false)

      toast.success("Selfie captured", {
        description: "Your selfie has been captured successfully.",
      })
    }, 1000)
  }, [toast])

  // Reset selfie
  const resetSelfie = () => {
    setSelfieImage(null)
  }

  // Submit KYC verification
  const submitVerification = async () => {
    if (!documentFile || !documentType || !selfieImage) {
      toast.error("Missing information", {
        description: "Please upload your ID document and take a selfie before submitting.",
      })
      return
    }

    

    setIsSubmitting(true)
    setVerificationStatus("processing")
    setVerificationMessage("Analyzing your documents...")

    // Simulate AI verification process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setVerificationProgress(i)

      if (i === 30) {
        setVerificationMessage("Verifying document authenticity...")
      } else if (i === 60) {
        setVerificationMessage("Performing facial recognition...")
      } else if (i === 90) {
        setVerificationMessage("Finalizing verification...")
      }
    }

    // In a real app, this would be an API call to your verification service
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate successful verification (95% success rate)
    const isSuccessful = Math.random() < 0.95

    if (isSuccessful) {
      setVerificationStatus("success")
      setVerificationMessage("Verification successful! Your identity has been verified.")

      // Update KYC status in backend
      // updateKYCStatus("in_progress")
      // updateKYCSubmittedAt(new Date().toISOString())
      const updatePromise = client.put("/auth/user/verification-status", {
        userId: user.userInfo.userId,
        kycStatus: "verified",
        kycSubmittedAt: new Date().toISOString(),
      });
      

      toast.promise(updatePromise, {
        loading: "Verifying your identity...",
        success: async () => {
          // Refresh user data to get the latest profile information
          await refreshUser()
          // Redirect to status check page after a delay
          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)
          return "Verification successful"
        },
        error: (error) => {
          setVerificationStatus("error")
          setVerificationMessage("Verification failed. Please try again with clearer images.")

          return "Verification failed"
        },
        finally: () => {
          setIsSubmitting(false)
        },
      })

    } else {
      setVerificationStatus("error")
      setVerificationMessage("Verification failed. Please try again with clearer images.")

      toast.error("Verification failed", {
        description: "Please ensure your documents are clear and try again.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })

      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Identity Verification</CardTitle>
        <CardDescription>
          Complete the verification process to access the platform. We use AI-powered verification to ensure security.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {verificationStatus === "processing" ? (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-medium mb-2">{verificationMessage}</h3>
              <Progress value={verificationProgress} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Please wait while our AI verifies your identity...</p>
            </div>
          </div>
        ) : verificationStatus === "success" ? (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-medium mb-2">Verification Successful!</h3>
              <p className="text-muted-foreground">
                Your identity has been verified. You will be redirected to the dashboard shortly.
              </p>
            </div>
          </div>
        ) : verificationStatus === "error" ? (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-medium mb-2">Verification Failed</h3>
              <p className="text-muted-foreground mb-4">{verificationMessage}</p>
              <Button onClick={() => setVerificationStatus("idle")}>Try Again</Button>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="document">1. Upload ID Document</TabsTrigger>
              <TabsTrigger value="selfie" disabled={!documentFile}>
                2. Take Selfie
              </TabsTrigger>
            </TabsList>

            <TabsContent value="document" className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="national_id">National ID Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Upload Document</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {documentPreview ? (
                      <div className="space-y-4">
                        <img
                          src={documentPreview || "/placeholder.svg"}
                          alt="Document preview"
                          className="max-h-64 mx-auto object-contain"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDocumentFile(null)
                            setDocumentPreview(null)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Drag and drop your document, or click to browse
                          </p>
                        </div>
                        <Input
                          id="document-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleDocumentUpload}
                        />
                        <Button variant="outline" onClick={() => {
                          if (typeof document !== "undefined") {
                            document.getElementById("document-upload")?.click()
                          }
                        }}>
                          Select File
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, PDF. Max size: 5MB</p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("selfie")} disabled={!documentFile || !documentType}>
                    Next: Take Selfie
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="selfie" className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Take a Selfie</Label>
                  <div className="border rounded-lg p-4">
                    {selfieImage ? (
                      <div className="space-y-4 text-center">
                        <img
                          src={selfieImage || "/placeholder.svg"}
                          alt="Selfie preview"
                          className="max-h-64 mx-auto object-contain"
                        />
                        <Button variant="outline" onClick={resetSelfie}>
                          Retake Selfie
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 text-center">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{ facingMode: "user" }}
                          className="mx-auto rounded-lg"
                          height={300}
                          width={400}
                        />
                        <Button onClick={captureSelfie} disabled={isCapturing} className="mx-auto">
                          {isCapturing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Capturing...
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" /> Capture Selfie
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Make sure your face is clearly visible and well-lit</p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("document")}>
                    Back
                  </Button>
                  <Button onClick={submitVerification} disabled={!selfieImage || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit Verification"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium">Why we need this information:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>To verify your identity and prevent fraud</li>
            <li>To comply with regulatory requirements</li>
            <li>To create your decentralized identity (DID) on Hedera</li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Your data is encrypted and securely stored. We use AI-powered verification to ensure the highest level of
          security.
        </p>
      </CardFooter>
    </Card>
  )
}
