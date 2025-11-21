import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Shield, Key, Fingerprint, ArrowRight, Lock, Cpu, Eye, UserPlus, FileText } from "lucide-react"

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 metamynd-gradient-text">Platform Features</h1>

        <p className="text-lg text-gray-700 mb-8">
          MetaMynd offers a comprehensive suite of features designed to give you complete control over your digital
          identity and AI agent permissions.
        </p>

        <div className="space-y-16">
          {/* Identity Management Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-purple-900">Identity Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-metamynd-purple/10 flex items-center justify-center mb-4">
                  <Fingerprint className="h-6 w-6 text-metamynd-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">Biometric Verification</h3>
                <p className="text-gray-600">
                  Secure facial recognition and liveness detection to verify your identity with the highest level of
                  assurance.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-metamynd-blue/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-metamynd-blue" />
                </div>
                <h3 className="text-xl font-bold mb-2">Document Authentication</h3>
                <p className="text-gray-600">
                  AI-powered document scanning to verify the authenticity of your ID documents and proof of address.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-metamynd-purple/10 flex items-center justify-center mb-4">
                  <Key className="h-6 w-6 text-metamynd-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">DID Creation</h3>
                <p className="text-gray-600">
                  Generate your W3C-compliant decentralized identifier (DID) on Hedera Hashgraph with a user-friendly
                  interface.
                </p>
              </div>
            </div>
          </section>

          {/* Credential Management Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-purple-900">Credential Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-metamynd-blue/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-metamynd-blue" />
                </div>
                <h3 className="text-xl font-bold mb-2">Verifiable Credentials</h3>
                <p className="text-gray-600">
                  Issue and manage W3C Verifiable Credentials as NFTs for your AI agents with customizable attributes.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-metamynd-purple/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-metamynd-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">Selective Disclosure</h3>
                <p className="text-gray-600">
                  Control exactly what information your AI agents can share with third parties, protecting your privacy.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-metamynd-blue/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-metamynd-blue" />
                </div>
                <h3 className="text-xl font-bold mb-2">Credential Verification</h3>
                <p className="text-gray-600">
                  Verify the authenticity of credentials presented by other agents or users with cryptographic proof.
                </p>
              </div>
            </div>
          </section>

          {/* Agent Management Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-purple-900">AI Agent Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-metamynd-purple/10 flex items-center justify-center mb-4">
                  <UserPlus className="h-6 w-6 text-metamynd-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">Agent Registration</h3>
                <p className="text-gray-600">
                  Register AI agents with their own DIDs and link them to your identity with ownership attestations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-metamynd-blue/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-metamynd-blue" />
                </div>
                <h3 className="text-xl font-bold mb-2">Permission Control</h3>
                <p className="text-gray-600">
                  Fine-grained permission controls to specify exactly what your AI agents can access and do on your
                  behalf.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-metamynd-purple/10 flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-metamynd-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">Activity Monitoring</h3>
                <p className="text-gray-600">
                  Comprehensive activity logs and real-time monitoring of all actions performed by your AI agents.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold mb-4">Ready to explore these features?</h3>
          <Link href="/auth/signup">
            <Button className="bg-metamynd-purple hover:bg-metamynd-purple/90">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
