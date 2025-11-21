import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | MetaMynd",
  description: "MetaMynd's Terms of Service - Rules and guidelines for using our platform",
}

export default function TermsOfServicePage() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: April 3, 2024</p>

          <div className="prose prose-lg max-w-none">
            <p>
              Welcome to MetaMynd. These Terms of Service ("Terms") govern your access to and use of the MetaMynd
              Self-Sovereign Identity Platform ("Platform"). Please read these Terms carefully before using our
              Platform.
            </p>

            <h2>Acceptance of Terms</h2>
            <p>
              By accessing or using our Platform, you agree to be bound by these Terms and our Privacy Policy. If you do
              not agree to these Terms, you may not access or use the Platform.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. If we make changes, we will provide notice by posting the updated
              Terms on our website and updating the "Last updated" date. Your continued use of the Platform after the
              changes are made constitutes your acceptance of the updated Terms.
            </p>

            <h2>Account Registration and Security</h2>
            <p>
              To use certain features of the Platform, you must create an account and complete our KYC (Know Your
              Customer) verification process. You are responsible for:
            </p>
            <ul>
              <li>Providing accurate and complete information during registration</li>
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access to your account</li>
            </ul>

            <h2>Identity Verification and KYC</h2>
            <p>
              Our Platform requires identity verification through our KYC process. By using our Platform, you agree to:
            </p>
            <ul>
              <li>Provide accurate and authentic identification documents</li>
              <li>Participate in biometric verification if required</li>
              <li>Allow us to verify your identity through third-party services</li>
              <li>Update your information if it changes</li>
            </ul>

            <h2>Decentralized Identifiers (DIDs) and Verifiable Credentials</h2>
            <p>
              Our Platform enables you to create and manage Decentralized Identifiers (DIDs) and Verifiable Credentials.
              You understand and agree that:
            </p>
            <ul>
              <li>You are responsible for managing your private keys and recovery methods</li>
              <li>Lost private keys may result in permanent loss of access to your DID</li>
              <li>Verifiable Credentials issued through our Platform are stored on the Hedera Hashgraph blockchain</li>
              <li>You control who can access your Verifiable Credentials</li>
            </ul>

            <h2>AI Agent Registration and Management</h2>
            <p>
              Our Platform allows you to register and manage AI agents with decentralized identities. When using this
              feature, you agree to:
            </p>
            <ul>
              <li>Only register AI agents that you own or have permission to register</li>
              <li>Accurately represent the capabilities and permissions of your AI agents</li>
              <li>Take responsibility for the actions of your registered AI agents</li>
              <li>Comply with all applicable laws and regulations regarding AI usage</li>
            </ul>

            <h2>Prohibited Activities</h2>
            <p>You agree not to engage in any of the following prohibited activities:</p>
            <ul>
              <li>Violating any applicable laws or regulations</li>
              <li>Providing false or misleading information during identity verification</li>
              <li>Attempting to bypass or manipulate our security measures</li>
              <li>Using the Platform for fraudulent or deceptive purposes</li>
              <li>Interfering with the proper operation of the Platform</li>
              <li>Accessing or attempting to access other users' accounts or data</li>
              <li>Using the Platform to harm, threaten, or harass others</li>
              <li>Infringing on the intellectual property rights of others</li>
            </ul>

            <h2>Intellectual Property Rights</h2>
            <p>
              The Platform and its content, features, and functionality are owned by MetaMynd and are protected by
              copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or
              lease any part of our Platform without our permission.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              Our Platform may integrate with third-party services, such as blockchain networks, identity verification
              providers, and other services. Your use of these third-party services is subject to their terms of service
              and privacy policies. We are not responsible for the content or practices of these third-party services.
            </p>

            <h2>Disclaimer of Warranties</h2>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL METAMYND BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF
              OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF THE PLATFORM.
            </p>

            <h2>Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless MetaMynd and its officers, directors, employees, and
              agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable
              attorneys' fees, arising out of or in any way connected with your access to or use of the Platform or your
              violation of these Terms.
            </p>

            <h2>Termination</h2>
            <p>
              We may terminate or suspend your access to the Platform immediately, without prior notice or liability,
              for any reason, including if you breach these Terms. Upon termination, your right to use the Platform will
              immediately cease.
            </p>

            <h2>Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California,
              without regard to its conflict of law provisions. Any legal action or proceeding arising out of or
              relating to these Terms shall be brought exclusively in the federal or state courts located in San
              Francisco, California.
            </p>

            <h2>Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p>
              Email:{" "}
              <a href="mailto:legal@metamynd.com" className="text-metamynd-purple hover:underline">
                legal@metamynd.com
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
