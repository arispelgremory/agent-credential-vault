import { Shield, Lock, Eye, CheckCircle, Server, Users } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 metamynd-gradient-text">Security</h1>

        <p className="text-lg text-gray-700 mb-8">
          At MetaMynd, security is our top priority. We've implemented multiple layers of protection to ensure your
          identity data and AI agent permissions remain secure.
        </p>

        <div className="space-y-12">
          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-purple-900 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-metamynd-purple" />
              Data Protection
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <p className="text-gray-700 mb-4">
                We employ industry-leading encryption and security practices to protect your sensitive information:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">AES-256 Encryption</strong>
                    <p className="text-gray-600">All sensitive data is encrypted at rest using AES-256 encryption</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">TLS 1.3</strong>
                    <p className="text-gray-600">All data in transit is protected with TLS 1.3 encryption</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Secure Key Management</strong>
                    <p className="text-gray-600">Private keys are stored in hardware security modules (HSMs)</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Data Minimization</strong>
                    <p className="text-gray-600">
                      We only collect and store the minimum data necessary for our services
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Infrastructure Security */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-purple-900 flex items-center">
              <Server className="h-6 w-6 mr-2 text-metamynd-purple" />
              Infrastructure Security
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <p className="text-gray-700 mb-4">Our infrastructure is designed with security at its core:</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">SOC 2 Type II Compliant</strong>
                    <p className="text-gray-600">Our infrastructure and processes meet SOC 2 Type II standards</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Regular Penetration Testing</strong>
                    <p className="text-gray-600">Independent security experts regularly test our systems</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">24/7 Monitoring</strong>
                    <p className="text-gray-600">
                      Continuous monitoring for suspicious activities and potential threats
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Redundant Systems</strong>
                    <p className="text-gray-600">
                      Multiple data centers with automatic failover to prevent service disruption
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Access Controls */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-purple-900 flex items-center">
              <Lock className="h-6 w-6 mr-2 text-metamynd-purple" />
              Access Controls
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <p className="text-gray-700 mb-4">We implement strict access controls to protect your account:</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Multi-Factor Authentication</strong>
                    <p className="text-gray-600">Optional MFA for an additional layer of security</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Role-Based Access Control</strong>
                    <p className="text-gray-600">Granular permissions for different user roles</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Session Management</strong>
                    <p className="text-gray-600">Automatic session timeouts and device tracking</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Activity Logging</strong>
                    <p className="text-gray-600">Comprehensive audit logs of all account activities</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Privacy Features */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-purple-900 flex items-center">
              <Eye className="h-6 w-6 mr-2 text-metamynd-purple" />
              Privacy Features
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <p className="text-gray-700 mb-4">Our platform is designed with privacy-by-design principles:</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Selective Disclosure</strong>
                    <p className="text-gray-600">Control exactly what information is shared with third parties</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Zero-Knowledge Proofs</strong>
                    <p className="text-gray-600">Verify claims without revealing underlying data</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Data Minimization</strong>
                    <p className="text-gray-600">We only collect and store the minimum data necessary</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">GDPR Compliance</strong>
                    <p className="text-gray-600">Our platform is designed to meet GDPR requirements</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Security Team */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-purple-900 flex items-center">
              <Users className="h-6 w-6 mr-2 text-metamynd-purple" />
              Security Team
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <p className="text-gray-700 mb-4">
                Our dedicated security team works around the clock to protect your data:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Security Experts</strong>
                    <p className="text-gray-600">
                      Team of certified security professionals with experience in blockchain and identity
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Continuous Training</strong>
                    <p className="text-gray-600">Regular training on the latest security threats and countermeasures</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Bug Bounty Program</strong>
                    <p className="text-gray-600">
                      We reward security researchers who responsibly disclose vulnerabilities
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-medium">Incident Response</strong>
                    <p className="text-gray-600">Comprehensive incident response plan with regular drills</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>

        <div className="mt-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-purple-900">Security Certifications</h3>
          <p className="text-gray-700 mb-6">
            Our platform has undergone rigorous security assessments and holds the following certifications:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["ISO 27001", "SOC 2 Type II", "GDPR Compliant", "CCPA Compliant"].map((cert, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-100 text-center">
                <p className="font-medium">{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
