"use client"

import { useSetAtom } from "jotai"
import { FileUpload } from "@/components/ui/file-upload"
import { onboardingKycDataAtom } from "@/store/atoms"
import { Camera, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"

export function SelfieStep() {
  const updateKycData = useSetAtom(onboardingKycDataAtom)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (file: File | null) => {
    updateKycData({ selfieImage: file })
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCapturedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setCapturedImage(null)
    }
  }

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCameraOpen(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        // Set canvas dimensions to match video
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight

        // Draw the video frame to the canvas
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)

        // Convert canvas to image
        const dataUrl = canvasRef.current.toDataURL("image/png")
        setCapturedImage(dataUrl)

        // Convert data URL to File object
        fetch(dataUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "selfie.png", { type: "image/png" })
            updateKycData({ selfieImage: file })
          })

        // Stop the camera
        stopCamera()
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-medium">Selfie guidelines:</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>Make sure your face is clearly visible</li>
            <li>Remove any glasses, hats, or masks</li>
            <li>Ensure good lighting with a neutral background</li>
            <li>Look directly at the camera</li>
          </ul>
        </div>
      </div>

      {!isCameraOpen && !capturedImage && (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <Button onClick={openCamera} className="mb-4">
              Take Selfie with Camera
            </Button>
            <p className="text-sm text-muted-foreground">or</p>
            <div className="w-full mt-4">
              <FileUpload label="" onFileChange={handleFileChange} acceptedFileTypes="image/*" />
            </div>
          </div>
        </div>
      )}

      {isCameraOpen && (
        <div className="space-y-4">
          <div className="relative border rounded-lg overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg" />
          </div>
          <div className="flex justify-center space-x-4">
            <Button onClick={takePicture} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Take Photo
            </Button>
            <Button variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <img src={capturedImage || "/placeholder.svg"} alt="Captured selfie" className="w-full h-auto" />
          </div>
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setCapturedImage(null)
                updateKycData({ selfieImage: null })
              }}
            >
              Retake
            </Button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
