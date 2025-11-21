import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Key, Bot, Lock, FileCheck, Fingerprint } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-900 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Secure Identity Management for AI Agents</h1>
            <p className="text-xl mb-8">
              Empower your AI agents with verifiable credentials and secure identity management using W3C standards and
              Hedera Hashgraph.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Account Section */}
      <section className="py-12 bg-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-purple-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-purple-800">Try Our Demo Account</CardTitle>
                <CardDescription>Experience the platform with our pre-configured demo account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <p className="font-medium text-purple-800">Email</p>
                    <p className="font-mono">demo@metamynd.io</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <p className="font-medium text-purple-800">Password</p>
                    <p className="font-mono">password123</p>
                  </div>
                </div>
                <div className="text-center">
                  <Link href="/auth/login">
                    <Button className="w-full sm:w-auto">Log in with Demo Account</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-purple-900">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-600 mb-2" />
                <CardTitle>Self-Sovereign Identity</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Give users complete control over their digital identities with W3C Decentralized Identifiers (DIDs)
                  and Verifiable Credentials.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bot className="h-12 w-12 text-purple-600 mb-2" />
                <CardTitle>AI Agent Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Register, manage, and monitor AI agents with granular permission controls and comprehensive activity
                  tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Key className="h-12 w-12 text-purple-600 mb-2" />
                <CardTitle>Credential Issuance</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Issue, verify, and revoke verifiable credentials for AI agents, enabling secure access to third-party
                  services.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-12 w-12 text-purple-600 mb-2" />
                <CardTitle>Secure Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Manage cryptographic keys and digital assets with our secure wallet infrastructure built on Hedera
                  Hashgraph.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="h-12 w-12 text-purple-600 mb-2" />
                <CardTitle>KYC Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Streamlined Know Your Customer process with secure document upload and verification for regulatory
                  compliance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Fingerprint className="h-12 w-12 text-purple-600 mb-2" />
                <CardTitle>Ownership Attestation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Cryptographically prove ownership of AI agents and establish verifiable trust relationships between
                  entities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our platform today and take control of your AI agent identities with secure, verifiable credentials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="default" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
            <Link href="/platform/technology">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
