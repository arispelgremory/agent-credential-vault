"use client"

import React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps {
  currentStep: number
  className?: string
  children: React.ReactNode
}

interface StepProps {
  title: string
  description?: string
}

export function Stepper({ currentStep, className, children }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement<StepProps>(child)) return null
          
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isLast = index === React.Children.count(children) - 1

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step circle */}
                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/25 bg-background text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                </div>

                {/* Step content */}
                <div className="mt-2 text-center max-w-[120px]">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isActive || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {child.props.title}
                  </p>
                  {child.props.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {child.props.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-colors",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/25"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Step({ title, description }: StepProps) {
  // This component is used as a marker for Stepper to extract props
  // The actual rendering is handled by Stepper
  return null
}

