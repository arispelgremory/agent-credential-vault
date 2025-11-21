export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 metamynd-gradient-text">Privacy Policy</h1>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          <p className="text-gray-600 mb-6">Last Updated: April 3, 2025</p>

          <div className="prose max-w-none">
            <h2>1. Introduction</h2>
            <p>
              MetaMynd ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you use our decentralized identity platform
              for AI agents.
            </p>
            <p>
              We take your privacy seriously and have designed our platform with privacy-by-design principles. By using
              our services, you agree to the collection and use of information in accordance with this policy.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We may collect the following types of personal information:</p>
            <ul>
              <li>Identity information (name, date of birth, government ID)</li>
              <li>Contact information (email address, phone number)</li>
              <li>Biometric data (facial recognition for identity verification)</li>
              <li>Address information (for proof of address verification)</li>
              <li>Account credentials (username, password hash)</li>
            </ul>

            <h3>2.2 Technical Information</h3>
            <p>We automatically collect certain information when you use our platform:</p>
            <ul>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3>2.3 Blockchain Information</h3>
            <p>
              As a decentralized identity platform, certain information is stored on the Hedera Hashgraph distributed
              ledger:
            </p>
            <ul>
              <li>Your Decentralized Identifier (DID)</li>
              <li>Public keys associated with your DID</li>
              <li>Verifiable Credential metadata (without personal data)</li>
              <li>AI agent DIDs and ownership attestations</li>
            </ul>
            <p>
              <strong>Note:</strong> Personal data is never stored directly on the blockchain. We use off-chain storage
              with encryption for sensitive information.
            </p>

            <h2>3. How We Use Your Information</h2>
            <p>We use your information for the following purposes:</p>
            <ul>
              <li>To verify your identity through our KYC process</li>
              <li>To create and manage your decentralized identity</li>
              <li>To register and manage AI agents on your behalf</li>
              <li>To issue and verify credentials</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To improve our platform and develop new features</li>
              <li>To detect and prevent fraud or unauthorized access</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>4. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul>
              <li>Identity verification service providers (for KYC processing)</li>
              <li>Cloud service providers (for secure data storage)</li>
              <li>Legal authorities (when required by law)</li>
            </ul>
            <p>
              We do not sell your personal information to third parties. Any sharing is done with appropriate safeguards
              and data processing agreements in place.
            </p>

            <h2>5. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
            <ul>
              <li>End-to-end encryption for sensitive data</li>
              <li>Multi-factor authentication for account access</li>
              <li>Regular security audits and penetration testing</li>
              <li>Employee training on data protection</li>
              <li>Secure data centers with physical access controls</li>
            </ul>
            <p>
              While we strive to use commercially acceptable means to protect your personal information, no method of
              transmission over the Internet or electronic storage is 100% secure.
            </p>

            <h2>6. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li>Access to your personal information</li>
              <li>Correction of inaccurate or incomplete data</li>
              <li>Deletion of your personal information</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing</li>
              <li>Withdrawal of consent</li>
            </ul>
            <p>To exercise these rights, please contact us at privacy@metamynd.ai.</p>

            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this
              Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
            <p>
              KYC verification data is retained in accordance with applicable anti-money laundering regulations,
              typically for a period of 5 years after the end of our business relationship.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal
              information from children. If you are a parent or guardian and believe your child has provided us with
              personal information, please contact us.
            </p>

            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence.
              These countries may have different data protection laws. We ensure appropriate safeguards are in place to
              protect your information when transferred internationally.
            </p>

            <h2>10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last Updated" date.
            </p>
            <p>We encourage you to review this Privacy Policy periodically for any changes.</p>

            <h2>11. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p>
              Email: privacy@metamynd.ai
              <br />
              Address: 123 Blockchain Avenue, Suite 456, San Francisco, CA 94105
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
