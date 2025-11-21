import type { Metadata } from "next"
import { CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Compliance | MetaMynd",
  description: "Learn about MetaMynd's compliance with regulations and standards",
}

export default function CompliancePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Compliance</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 className="text-2xl font-semibold mb-6">Our Compliance Framework</h2>
        <p className="text-gray-600 mb-4">
          At MetaMynd, we are committed to maintaining the highest standards of compliance with relevant laws,
          regulations, and industry standards. Our comprehensive compliance framework ensures that our platform meets or
          exceeds requirements for data protection, identity verification, and digital identity management.
        </p>
        <p className="text-gray-600">
          We regularly review and update our compliance measures to adapt to evolving regulatory landscapes and emerging
          best practices in the self-sovereign identity and AI agent identity spaces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Data Protection Compliance</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">GDPR (General Data Protection Regulation)</span>
                <p className="text-gray-600 text-sm mt-1">
                  We comply with the EU's comprehensive data protection law, respecting data subject rights and
                  implementing appropriate technical and organizational measures.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">
                  CCPA/CPRA (California Consumer Privacy Act/California Privacy Rights Act)
                </span>
                <p className="text-gray-600 text-sm mt-1">
                  Our platform adheres to California's privacy regulations, providing California residents with specific
                  rights regarding their personal information.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">
                  PIPEDA (Personal Information Protection and Electronic Documents Act)
                </span>
                <p className="text-gray-600 text-sm mt-1">
                  We comply with Canada's federal privacy law for private-sector organizations.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Identity Verification Compliance</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">KYC (Know Your Customer)</span>
                <p className="text-gray-600 text-sm mt-1">
                  Our identity verification processes meet KYC requirements, helping to prevent identity fraud and
                  ensuring proper user verification.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">AML (Anti-Money Laundering)</span>
                <p className="text-gray-600 text-sm mt-1">
                  We implement measures to prevent money laundering and terrorist financing through our platform.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">
                  eIDAS (Electronic Identification, Authentication and Trust Services)
                </span>
                <p className="text-gray-600 text-sm mt-1">
                  Our platform aligns with the EU regulation on electronic identification and trust services for
                  electronic transactions.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 className="text-xl font-semibold mb-4">Industry Standards & Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <h3 className="font-medium mb-2">ISO 27001</h3>
            <p className="text-gray-600 text-sm">Information Security Management System</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <h3 className="font-medium mb-2">SOC 2 Type II</h3>
            <p className="text-gray-600 text-sm">Security, Availability & Confidentiality</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <h3 className="font-medium mb-2">NIST 800-53</h3>
            <p className="text-gray-600 text-sm">Security and Privacy Controls</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <h3 className="font-medium mb-2">W3C DID Specification</h3>
            <p className="text-gray-600 text-sm">Decentralized Identifiers</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <h3 className="font-medium mb-2">W3C VC Data Model</h3>
            <p className="text-gray-600 text-sm">Verifiable Credentials</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <h3 className="font-medium mb-2">DIF Presentation Exchange</h3>
            <p className="text-gray-600 text-sm">Credential Exchange Format</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Compliance Documentation</h2>
        <p className="text-gray-600 mb-6">
          We maintain comprehensive documentation of our compliance efforts. Enterprise customers can request access to
          the following compliance documentation:
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Document</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Description</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-500">Available To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4">Security Whitepaper</td>
                <td className="py-3 px-4">Detailed overview of our security practices</td>
                <td className="py-3 px-4">All customers</td>
              </tr>
              <tr>
                <td className="py-3 px-4">SOC 2 Report</td>
                <td className="py-3 px-4">Independent audit report of our controls</td>
                <td className="py-3 px-4">Enterprise customers (under NDA)</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Penetration Test Results</td>
                <td className="py-3 px-4">Results of our latest security testing</td>
                <td className="py-3 px-4">Enterprise customers (under NDA)</td>
              </tr>
              <tr>
                <td className="py-3 px-4">GDPR Compliance Statement</td>
                <td className="py-3 px-4">Details of our GDPR compliance measures</td>
                <td className="py-3 px-4">All customers</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Data Processing Addendum</td>
                <td className="py-3 px-4">Legal agreement for data processing</td>
                <td className="py-3 px-4">Available upon request</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-gray-600">
          To request access to compliance documentation or to discuss specific compliance requirements, please contact
          our compliance team at{" "}
          <a href="mailto:compliance@metamynd.io" className="text-metamynd-purple hover:underline">
            compliance@metamynd.io
          </a>
          .
        </p>
      </div>
    </div>
  )
}
