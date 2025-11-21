import type { Metadata } from "next"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "FAQ | MetaMynd",
  description: "Frequently asked questions about MetaMynd's W3C-compliant AI Agent Identity Platform",
}

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h1>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="bg-white rounded-lg shadow-md px-6">
            <AccordionTrigger className="text-lg font-medium py-4">
              What is a Decentralized Identifier (DID)?
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-600">
              A Decentralized Identifier (DID) is a new type of identifier that enables verifiable, self-sovereign
              digital identity. DIDs are fully under the control of the DID subject, independent from any centralized
              registry, identity provider, or certificate authority. They are persistent, globally unique identifiers
              that do not require a centralized registration authority because they are registered with distributed
              ledger technology or other decentralized networks.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-white rounded-lg shadow-md px-6">
            <AccordionTrigger className="text-lg font-medium py-4">
              How does MetaMynd ensure the security of my identity data?
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-600">
              MetaMynd employs multiple layers of security to protect your identity data. We use end-to-end encryption
              (AES-256, TLS 1.3) for all data in transit and at rest. Our platform follows a Zero Trust Architecture for
              access control, and we implement multi-factor authentication (MFA, WebAuthn, Biometrics) to prevent
              unauthorized access. Additionally, our blockchain-based storage provides tamper-proof identity records,
              ensuring that your data cannot be altered without your permission.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="bg-white rounded-lg shadow-md px-6">
            <AccordionTrigger className="text-lg font-medium py-4">What is a Verifiable Credential?</AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-600">
              A Verifiable Credential (VC) is a digital credential that contains claims about a subject (person,
              organization, or thing) made by an issuer. These credentials are cryptographically secure,
              privacy-respecting, and machine-verifiable. Examples include digital versions of physical credentials like
              driver's licenses, passports, university degrees, as well as new types of credentials like KYC
              verification, financial history, or professional certifications.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="bg-white rounded-lg shadow-md px-6">
            <AccordionTrigger className="text-lg font-medium py-4">
              How do I register an AI agent on the platform?
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-600">
              To register an AI agent, log in to your dashboard and navigate to the "Agents" section. Click on "Register
              New Agent" and follow the step-by-step process. You'll need to provide basic information about the agent,
              verify your ownership, set up the agent's identity and wallet, configure permissions, and review the
              registration details. Once completed, your AI agent will have its own DID and can interact with the
              platform based on the permissions you've granted.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="bg-white rounded-lg shadow-md px-6">
            <AccordionTrigger className="text-lg font-medium py-4">
              What blockchain technology does MetaMynd use?
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-600">
              MetaMynd primarily uses Hedera Hashgraph for its DID implementation, though we also support Hyperledger
              Indy for certain use cases. Hedera provides a fast, secure, and energy-efficient distributed ledger that
              enables our platform to create tamper-proof identity records with high throughput and low fees. This
              ensures that our identity solution is both scalable and sustainable.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="bg-white rounded-lg shadow-md px-6">
            <AccordionTrigger className="text-lg font-medium py-4">
              How does the AI-powered KYC verification work?
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-600">
              Our AI-powered KYC verification uses advanced machine learning models to verify identity documents and
              detect fraud. When you upload your ID document, our system uses TensorFlow and OpenCV to analyze the
              document for authenticity, checking security features and detecting alterations. For facial verification,
              we compare your selfie with the photo on your ID using biometric matching algorithms. YOLOv8 helps detect
              deepfakes and synthetic images, while our fraud detection models score the overall risk based on multiple
              factors. This comprehensive approach ensures high accuracy while maintaining user privacy.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="bg-white rounded-lg shadow-md px-6">
            <AccordionTrigger className="text-lg font-medium py-4">
              Can I integrate MetaMynd with my existing systems?
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-600">
              Yes, MetaMynd provides comprehensive APIs for integration with your existing systems. We offer both REST
              and GraphQL endpoints, along with webhooks for real-time notifications. Our APIs support OAuth2, JWT, and
              OpenID Connect authentication to ensure secure integration. You can use our APIs to create and manage
              DIDs, issue and verify credentials, and monitor identity verification status. For enterprise customers, we
              also offer custom integration services to meet specific requirements.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8" className="bg-white rounded-lg shadow-md px-6">
            <AccordionTrigger className="text-lg font-medium py-4">
              What compliance standards does MetaMynd adhere to?
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-600">
              MetaMynd adheres to several key compliance standards, including GDPR for data protection in the European
              Union, eIDAS for electronic identification and trust services, and ISO 27001 for information security
              management. We also follow industry best practices for identity verification and KYC/AML compliance. Our
              platform is regularly audited by third-party security firms to ensure compliance with these standards and
              to identify and address any potential vulnerabilities.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
