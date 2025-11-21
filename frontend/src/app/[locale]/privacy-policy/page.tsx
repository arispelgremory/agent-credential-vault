import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | MetaMynd",
  description: "MetaMynd's Privacy Policy - How we collect, use, and protect your data",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: April 3, 2024</p>

          <div className="prose prose-lg max-w-none">
            <p>
              At MetaMynd, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our Self-Sovereign Identity Platform.
            </p>

            <h2>Information We Collect</h2>
            <p>We collect information that you provide directly to us when you:</p>
            <ul>
              <li>Create an account and complete the KYC verification process</li>
              <li>Generate a Decentralized Identifier (DID)</li>
              <li>Issue or manage Verifiable Credentials</li>
              <li>Register AI agents on our platform</li>
              <li>Contact our support team</li>
            </ul>

            <p>This information may include:</p>
            <ul>
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Government-issued identification documents</li>
              <li>Biometric data for identity verification</li>
              <li>Blockchain wallet addresses</li>
              <li>AI agent information and permissions</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Verify your identity through our KYC process</li>
              <li>Generate and manage your Decentralized Identifier (DID)</li>
              <li>Issue and verify Verifiable Credentials</li>
              <li>Detect and prevent fraud and security incidents</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>Self-Sovereign Identity and Data Control</h2>
            <p>
              Our platform is built on the principle of self-sovereign identity, which means you have control over your
              identity data. You decide what information to share and with whom. Your identity data is stored securely
              on the Hedera Hashgraph blockchain, and only you have the keys to access and manage it.
            </p>

            <h2>Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information:</p>
            <ul>
              <li>End-to-end encryption (AES-256) for all sensitive data</li>
              <li>TLS 1.3 for secure data transmission</li>
              <li>Multi-factor authentication for account access</li>
              <li>Zero Trust Architecture for access control</li>
              <li>Regular security audits and penetration testing</li>
            </ul>

            <h2>Data Sharing and Disclosure</h2>
            <p>
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul>
              <li>With your consent or at your direction</li>
              <li>With third-party service providers who need access to provide services</li>
              <li>To comply with legal obligations, such as court orders or legal processes</li>
              <li>To protect our rights, privacy, safety, or property</li>
            </ul>

            <h2>International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. We
              ensure appropriate safeguards are in place to protect your information when transferred internationally,
              in compliance with applicable data protection laws.
            </p>

            <h2>Your Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information:</p>
            <ul>
              <li>Access and receive a copy of your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your personal information</li>
              <li>Restrict or object to processing of your information</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>

            <p>
              To exercise these rights, please contact us at{" "}
              <a href="mailto:privacy@metamynd.com" className="text-metamynd-purple hover:underline">
                privacy@metamynd.com
              </a>
              .
            </p>

            <h2>Retention of Information</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services, comply with legal
              obligations, resolve disputes, and enforce our agreements. When we no longer need your information, we
              will securely delete or anonymize it.
            </p>

            <h2>Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal
              information from children. If you believe we have collected information from a child, please contact us
              immediately.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy
              Policy periodically.
            </p>

            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p>
              Email:{" "}
              <a href="mailto:privacy@metamynd.com" className="text-metamynd-purple hover:underline">
                privacy@metamynd.com
              </a>
              <br />
              Address: 123 Tech Plaza, Suite 400, San Francisco, CA 94105
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
