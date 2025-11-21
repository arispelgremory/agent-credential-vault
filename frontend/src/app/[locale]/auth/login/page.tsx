import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <div className="flex justify-center mb-2">
          <Image
            src="/images/metamynd-full-logo.png"
            alt="MetaMynd Logo"
            width={250}
            height={80}
            className="object-contain"
          />
        </div>
        <p className="text-gray-600">Self-Sovereign Identity Platform</p>
      </div>
      <LoginForm />
    </div>
  )
}
