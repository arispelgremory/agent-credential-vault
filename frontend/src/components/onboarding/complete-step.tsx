"use client"

import { useAtomValue } from "jotai"
import { walletDidAtom } from "@/store/atoms"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function CompleteStep() {
  const router = useRouter()
  const did = useAtomValue(walletDidAtom)

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-2">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>

      <h3 className="text-2xl font-bold">All Set Up!</h3>

      <p className="text-muted-foreground max-w-md">
        Congratulations! You've successfully completed the onboarding process. Your secure digital identity is now
        established on the Hedera network.
      </p>

      <div className="bg-muted p-4 rounded-lg w-full max-w-md">
        <h4 className="font-medium mb-2">Here's what you've accomplished:</h4>
        <ul className="space-y-2 text-left">
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>Completed KYC verification</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>Created a secure Hedera wallet</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>Generated your decentralized identity (DID)</span>
          </li>
        </ul>
      </div>

      <p className="text-muted-foreground">
        Your DID: <span className="font-mono text-xs">{did}</span>
      </p>

      <Button onClick={handleGoToDashboard} className="w-full max-w-xs mt-4">
        Go to Dashboard
      </Button>
    </div>
  )
}
