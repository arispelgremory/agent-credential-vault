import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">MetaMynd</h1>
        <p className="text-muted-foreground">Self-Sovereign Identity Platform</p>
      </div>
      <SignupForm />
    </div>
  )
}
