import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"

export default function TechnologyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 metamynd-gradient-text">Our Technology</h1>

        <p className="text-lg text-gray-700 mb-8">
          MetaMynd leverages cutting-edge technologies to provide a secure, scalable, and user-friendly platform for
          managing decentralized identities and AI agent permissions.
        </p>

        <div className="space-y-16">
          {/* W3C Standards Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-purple-900">W3C Standards</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-700 mb-4">
                  Our platform is built on the latest W3C standards for decentralized identity, ensuring
                  interoperability and future-proof identity management.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">Decentralized Identifiers (DIDs)</strong>
                      <p className="text-gray-600">
                        Globally unique identifiers that enable verifiable, decentralized digital identity
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">Verifiable Credentials</strong>
                      <p className="text-gray-600">
                        Cryptographically secure, tamper-evident credentials that respect privacy
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">DID Authentication</strong>
                      <p className="text-gray-600">Secure authentication methods based on public key cryptography</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="W3C Standards Illustration"
                  width={500}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </section>

          {/* Hedera Hashgraph Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-purple-900">Hedera Hashgraph</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="Hedera Hashgraph Illustration"
                  width={500}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
              <div className="order-1 md:order-2">
                <p className="text-gray-700 mb-4">
                  We've chosen Hedera Hashgraph as our underlying distributed ledger technology for its security, speed,
                  and energy efficiency.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">Fast Finality</strong>
                      <p className="text-gray-600">Transactions achieve finality in seconds, not minutes</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">Energy Efficient</strong>
                      <p className="text-gray-600">
                        Uses a fraction of the energy compared to proof-of-work blockchains
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">Enterprise-Grade Security</strong>
                      <p className="text-gray-600">
                        ABFT (Asynchronous Byzantine Fault Tolerance) security with aBFT consensus
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* AI Technology Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-purple-900">AI-Powered Verification</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-700 mb-4">
                  Our platform uses advanced AI technologies to verify identities and detect fraud while maintaining
                  privacy.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">Facial Recognition</strong>
                      <p className="text-gray-600">Secure biometric verification with liveness detection</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">Document Analysis</strong>
                      <p className="text-gray-600">Advanced OCR and document verification to detect forgeries</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">Anomaly Detection</strong>
                      <p className="text-gray-600">ML models to identify suspicious patterns in agent behavior</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="AI Technology Illustration"
                  width={500}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold mb-4">Ready to experience our technology in action?</h3>
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
