"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MultiStepFormProps {
  steps: {
    title: string
    description: string
    content: React.ReactNode
  }[]
  onComplete: () => void
}

export function MultiStepForm({ steps, onComplete }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsSubmitting(true)
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false)
        onComplete()
      }, 1500)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Ensure we have steps before rendering
  if (!steps || steps.length === 0) {
    return <div>Loading form steps...</div>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6 md:p-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center w-full max-w-md">
              {steps.map((_, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 ${index < currentStep ? "bg-primary" : "bg-muted"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="min-h-[300px]">{steps[currentStep].content}</div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? (
                "Processing..."
              ) : currentStep === steps.length - 1 ? (
                "Complete"
              ) : (
                <>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
