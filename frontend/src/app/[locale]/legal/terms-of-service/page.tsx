import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | MetaMynd",
  description: "MetaMynd's terms of service governing the use of our W3C-compliant AI Agent Identity Platform",
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600">Last Updated: April 1, 2023</p>

          <h2>1. Agreement to Terms</h2>
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement between you and MetaMynd ("we,"
            "our," or "us") governing your access to and use of the MetaMynd W3C-compliant AI Agent Identity Platform
            ("Platform").
          </p>
          <p>
            By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree to these
            Terms, you may not access or use the Platform.
          </p>

          <h2>2. Description of Services</h2>
          <p>MetaMynd provides a self-sovereign identity platform that enables users to:</p>
          <ul>
            <li>Create and manage W3C-compliant Decentralized Identifiers (DIDs)</li>
            <li>Complete AI-powered KYC verification</li>
            <li>Register and manage AI agents with unique identities</li>
            <li>Issue and verify Verifiable Credentials</li>
            <li>Interact with blockchain networks for identity management</li>
          </ul>

          <h2>3. Account Registration and Requirements</h2>

          <h3>3.1 Account Creation</h3>
          <p>
            To use certain features of the Platform, you must create an account. When you create an account, you agree
            to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your account credentials secure and confidential</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>

          <h3>3.2 Identity Verification</h3>
          <p>
            To access certain features, you may be required to complete our identity verification process, which may
            include:
          </p>
          <ul>
            <li>Providing government-issued identification documents</li>
            <li>Submitting biometric data (e.g., facial recognition)</li>
            <li>Providing proof of address</li>
            <li>Answering identity verification questions</li>
          </ul>
          <p>
            You consent to our collection, use, and processing of this information for identity verification purposes as
            described in our Privacy Policy.
          </p>

          <h2>4. DID Management</h2>

          <h3>4.1 DID Creation and Ownership</h3>
          <p>When you create a DID through our Platform:</p>
          <ul>
            <li>You are the sole owner of your DID and associated private keys</li>
            <li>You are responsible for securing your private keys</li>
            <li>We cannot recover lost private keys or access to your DID</li>
          </ul>

          <h3>4.2 Blockchain Transactions</h3>
          <p>DID creation and management may involve blockchain transactions that:</p>
          <ul>
            <li>May require payment of network fees</li>
            <li>Are irreversible once confirmed on the blockchain</li>
            <li>Are subject to the rules and limitations of the underlying blockchain</li>
          </ul>

          <h2>5. AI Agent Registration</h2>

          <h3>5.1 Agent Ownership</h3>
          <p>When you register an AI agent on our Platform:</p>
          <ul>
            <li>You must be the legitimate owner or authorized representative of the AI agent</li>
            <li>You are responsible for all actions taken by your registered AI agents</li>
            <li>You must ensure your AI agents comply with these Terms and applicable laws</li>
          </ul>

          <h3>5.2 Agent Permissions</h3>
          <p>You are responsible for:</p>
          <ul>
            <li>Setting appropriate permissions for your AI agents</li>
            <li>Monitoring your AI agents' activities</li>
            <li>Revoking permissions when necessary</li>
          </ul>

          <h2>6. Verifiable Credentials</h2>

          <h3>6.1 Issuing Credentials</h3>
          <p>When issuing Verifiable Credentials through our Platform:</p>
          <ul>
            <li>You are responsible for the accuracy of the information in the credentials you issue</li>
            <li>You must have the legal right to issue such credentials</li>
            <li>You must not issue fraudulent or misleading credentials</li>
          </ul>

          <h3>6.2 Using Credentials</h3>
          <p>When using Verifiable Credentials:</p>
          <ul>
            <li>You must not tamper with or alter credentials</li>
            <li>You must respect the privacy and intended use of credentials shared with you</li>
            <li>You must not use credentials for unauthorized purposes</li>
          </ul>

          <h2>7. Prohibited Activities</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Platform for any illegal purpose</li>
            <li>Violate any laws or regulations</li>
            <li>Impersonate another person or entity</li>
            <li>Create false or misleading identities</li>
            <li>Interfere with the operation of the Platform</li>
            <li>Attempt to gain unauthorized access to the Platform</li>
            <li>Use the Platform to conduct fraudulent activities</li>
            <li>Harass, threaten, or intimidate other users</li>
            <li>Infringe on the intellectual property rights of others</li>
            <li>Use the Platform to distribute malware or other harmful code</li>
          </ul>

          <h2>8. Fees and Payment</h2>
          <p>
            Certain features of the Platform may require payment of fees. By using such features, you agree to pay all
            applicable fees as specified on our pricing page. We reserve the right to change our fees at any time with
            notice to you.
          </p>

          <h2>9. Intellectual Property</h2>
          <p>
            The Platform, including its content, features, and functionality, is owned by MetaMynd and is protected by
            copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify,
            create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any
            of the material on our Platform without our prior written consent.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, MetaMynd shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in
            connection with your use of the Platform.
          </p>

          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless MetaMynd and its officers, directors, employees, agents,
            and affiliates from and against any claims, liabilities, damages, judgments, awards, losses, costs,
            expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of
            these Terms or your use of the Platform.
          </p>

          <h2>12. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Platform at any time, without prior notice or
            liability, for any reason, including if you violate these Terms. Upon termination, your right to use the
            Platform will immediately cease.
          </p>

          <h2>13. Changes to Terms</h2>
          <p>
            We may revise these Terms at any time by updating this page. By continuing to use the Platform after those
            revisions become effective, you agree to be bound by the revised Terms.
          </p>

          <h2>14. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of California,
            without regard to its conflict of law provisions.
          </p>

          <h2>15. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>
            Email: legal@metamynd.io
            <br />
            Address: 123 Blockchain Avenue, Suite 456, San Francisco, CA 94105, USA
          </p>
        </div>
      </div>
    </div>
  )
}
