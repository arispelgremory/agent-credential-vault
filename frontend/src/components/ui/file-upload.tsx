"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  label?: string
  onFileChange: (file: File | null) => void
  acceptedFileTypes?: string
  maxSize?: number // in MB
  className?: string
}

export function FileUpload({
  label,
  onFileChange,
  acceptedFileTypes = "image/*,.pdf",
  maxSize = 10,
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0]
        
        // Check file size
        const fileSizeMB = selectedFile.size / (1024 * 1024)
        if (maxSize && fileSizeMB > maxSize) {
          setError(`File size exceeds ${maxSize}MB limit`)
          return
        }
        
        setFile(selectedFile)
        setError(null)
        onFileChange(selectedFile)
      }
    },
    [maxSize, onFileChange],
  )

  const onDropRejected = useCallback((rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.some((e: any) => e.code === "file-too-large")) {
        setError(`File size exceeds ${maxSize}MB limit`)
      } else if (rejection.errors.some((e: any) => e.code === "file-invalid-type")) {
        setError("File type not accepted")
      } else {
        setError("File upload failed")
      }
    }
  }, [maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: acceptedFileTypes.includes(",")
      ? acceptedFileTypes.split(",").reduce((acc, type) => {
          const trimmed = type.trim()
          if (trimmed.includes("/*")) {
            const baseType = trimmed.split("/*")[0]
            acc[baseType] = []
          } else if (trimmed.startsWith(".")) {
            acc[trimmed.substring(1)] = []
          } else {
            acc[trimmed] = []
          }
          return acc
        }, {} as Record<string, string[]>)
      : acceptedFileTypes.includes("/*")
      ? { [acceptedFileTypes.split("/*")[0]]: [] }
      : { [acceptedFileTypes]: [] },
    maxFiles: 1,
    maxSize: maxSize ? maxSize * 1024 * 1024 : undefined,
  })

  const handleRemove = () => {
    setFile(null)
    setError(null)
    onFileChange(null)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-primary/50",
            error && "border-destructive"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-primary font-medium">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-muted-foreground">
              {acceptedFileTypes} (max {maxSize}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

