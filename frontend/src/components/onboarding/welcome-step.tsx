"use client"

import Image from "next/image"

export function WelcomeStep() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center">
      <div className="relative w-32 h-32">
        <Image src="/placeholder.svg?height=128&width=128" alt="MetaMynd Logo" fill className="object-contain" />
      </div>
      <h3 className="text-xl font-semibold">Welcome to MetaMynd</h3>
      <p className="text-muted-foreground max-w-md">
        We're about to get you set up with a secure decentralized identity (DID) on the Hedera network, which will let
        you control AI agents securely.
      </p>
      <div className="bg-muted p-4 rounded-lg max-w-md text-left">
        <h4 className="font-medium mb-2">What to expect:</h4>
        <ul className="space-y-2 text-sm">
          <li>• We'll need to verify your identity through a quick KYC process</li>
          <li>• You'll create a secure Hedera wallet to store your credentials</li>
          <li>• Your decentralized ID (DID) will be generated on the Hedera network</li>
          <li>• Then you can start managing AI agent permissions</li>
        </ul>
      </div>
    </div>
  )
}
