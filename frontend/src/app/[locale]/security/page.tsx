import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Lock, FileCheck, AlertTriangle, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Security | MetaMynd",
  description: "Learn about the security measures implemented in MetaMynd's Self-Sovereign Identity Platform",
}

export default function SecurityPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-metamynd-purple/10 to-metamynd-blue/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Security & Compliance</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            At MetaMynd, security is our top priority. We implement industry-leading security measures to protect your
            identity data.
          </p>
        </div>
      </section>

      {/* Security Overview */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Security Approach</h2>
          <p className="text-lg text-gray-600 mb-12 text-center">
            We follow a comprehensive security approach that combines encryption, authentication, access control, and
            continuous monitoring.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-metamynd-purple" />
                <h3 className="text-xl font-bold ml-3">Data Protection</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">End-to-end encryption</span>
                    <p className="text-gray-600 text-sm">AES-256 encryption for all sensitive data</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">TLS 1.3</span>
                    <p className="text-gray-600 text-sm">Secure data transmission with perfect forward secrecy</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Secure key management</span>
                    <p className="text-gray-600 text-sm">Hardware security modules (HSMs) for cryptographic keys</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <Lock className="h-8 w-8 text-metamynd-blue" />
                <h3 className="text-xl font-bold ml-3">Authentication</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Multi-factor authentication</span>
                    <p className="text-gray-600 text-sm">Multiple verification methods for secure access</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">WebAuthn support</span>
                    <p className="text-gray-600 text-sm">
                      Passwordless authentication with biometrics and security keys
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Secure session management</span>
                    <p className="text-gray-600 text-sm">Automatic timeouts and secure cookie handling</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <FileCheck className="h-8 w-8 text-metamynd-purple" />
                <h3 className="text-xl font-bold ml-3">Access Control</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Zero Trust Architecture</span>
                    <p className="text-gray-600 text-sm">Verify every access request regardless of source</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Principle of least privilege</span>
                    <p className="text-gray-600 text-sm">Minimal access rights for each user and service</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Role-based access control</span>
                    <p className="text-gray-600 text-sm">Granular permissions based on user roles</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-8 w-8 text-metamynd-blue" />
                <h3 className="text-xl font-bold ml-3">Monitoring & Response</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">24/7 security monitoring</span>
                    <p className="text-gray-600 text-sm">Continuous surveillance of all systems</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Automated threat detection</span>
                    <p className="text-gray-600 text-sm">AI-powered systems to identify suspicious activities</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Incident response team</span>
                    <p className="text-gray-600 text-sm">Dedicated security experts ready to respond to threats</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Compliance & Certifications</h2>
            <p className="text-lg text-gray-600 mb-12 text-center">
              We adhere to global standards and regulations to ensure the highest level of security and privacy.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
                <div className="h-16 w-16 bg-metamynd-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-metamynd-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">GDPR Compliance</h3>
                <p className="text-gray-600">
                  We comply with the European General Data Protection Regulation to protect user privacy and data
                  rights.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
                <div className="h-16 w-16 bg-metamynd-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-metamynd-blue" />
                </div>
                <h3 className="text-xl font-bold mb-2">ISO 27001</h3>
                <p className="text-gray-600">
                  Our information security management system is certified to meet international standards.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
                <div className="h-16 w-16 bg-metamynd-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-metamynd-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">SOC 2 Type II</h3>
                <p className="text-gray-600">
                  We maintain strict controls for security, availability, and confidentiality of customer data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Security Best Practices</h2>
          <p className="text-lg text-gray-600 mb-12 text-center">
            We implement industry-leading security practices throughout our development and operations.
          </p>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Secure Development Lifecycle</h3>
              <p className="text-gray-600 mb-4">
                Security is integrated into every phase of our development process, from design to deployment.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Security requirements in design phase</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Threat modeling for all new features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Static and dynamic code analysis</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Regular security code reviews</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Regular Security Testing</h3>
              <p className="text-gray-600 mb-4">
                We conduct comprehensive security testing to identify and address vulnerabilities.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Penetration testing by third-party security experts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Vulnerability scanning of all systems</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Red team exercises to simulate real-world attacks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Bug bounty program for responsible disclosure</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Employee Security</h3>
              <p className="text-gray-600 mb-4">
                Our team members follow strict security protocols to protect customer data.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Background checks for all employees</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Regular security awareness training</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Strict access controls based on job responsibilities</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Security policies and procedures for all staff</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Report Vulnerability */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Report a Vulnerability</h2>
            <p className="text-lg text-gray-600 mb-8">
              We take security seriously and appreciate the community's help in keeping our platform secure. If you
              discover a security vulnerability, please report it to us.
            </p>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 text-left">
              <h3 className="text-xl font-bold mb-4">Responsible Disclosure</h3>
              <p className="text-gray-600 mb-4">
                Please email us at{" "}
                <a href="mailto:security@metamynd.com" className="text-metamynd-purple hover:underline">
                  security@metamynd.com
                </a>{" "}
                with details about the vulnerability. We ask that you:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Provide detailed information about the vulnerability</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Include steps to reproduce the issue</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">
                    Allow us reasonable time to address the issue before public disclosure
                  </span>
                </li>
              </ul>
              <p className="text-gray-600">
                We commit to acknowledging your report within 24 hours and will keep you updated on our progress in
                resolving the issue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-metamynd-purple to-metamynd-blue">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Secure Your Identity?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join MetaMynd and take control of your digital identity with our secure, decentralized platform.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-metamynd-purple hover:bg-gray-100">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
