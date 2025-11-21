import { KYCForm } from "@/components/onboarding/kyc-form"

// Force dynamic rendering to prevent SSR errors with authentication
export const dynamic = 'force-dynamic'

export default function KYCPage() {

  return (
    <div className="container max-w-5xl py-8 px-4 md:px-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Identity Verification</h1>
          <p className="text-muted-foreground">
            Complete the verification process to access the platform. We use AI-powered verification to ensure security.
          </p>
        </div>

        <KYCForm />
      </div>
    </div>
  )
}
