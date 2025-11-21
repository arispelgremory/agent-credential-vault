import { KYCStatusCheck } from "@/components/onboarding/kyc-status-check"

// Force dynamic rendering to prevent SSR errors with authentication
export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">MetaMynd Identity Platform</h1>
          <p className="text-muted-foreground">Set up your secure, self-sovereign identity</p>
        </header>

        <KYCStatusCheck />
      </div>
    </div>
  )
}
