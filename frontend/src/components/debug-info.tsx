"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function DebugInfo() {
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(true)} className="bg-white/80 backdrop-blur-sm">
          Show Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white/80 backdrop-blur-sm border rounded-lg shadow-lg max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Debug Info</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
          Close
        </Button>
      </div>
      <div className="space-y-2 text-xs">
        <div>
          <p className="font-semibold">Current Path:</p>
          <p>{typeof window !== "undefined" ? window.location.pathname : "SSR"}</p>
        </div>
        <div>
          <p className="font-semibold">Auth Status:</p>
          <p>
            Cookie: {typeof document !== "undefined" ? (document.cookie.includes("auth_token") ? "Yes" : "No") : "SSR"}
          </p>
          <p>
            LocalStorage: {typeof localStorage !== "undefined" ? (localStorage.getItem("user") ? "Yes" : "No") : "SSR"}
          </p>
        </div>
        <div>
          <p className="font-semibold">Redux State:</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log(
                "Redux State:",
                typeof window !== "undefined" && (window as any).__REDUX_STATE__
                  ? (window as any).__REDUX_STATE__()
                  : "Not available",
              )
              alert("Redux state logged to console")
            }}
          >
            Log to Console
          </Button>
        </div>
      </div>
    </div>
  )
}
