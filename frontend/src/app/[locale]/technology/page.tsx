import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Server,
  Shield,
  Database,
  Fingerprint,
  FileCheck,
  AlertTriangle,
  Key,
  Code,
  Cloud,
  CheckCircle,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Technology | MetaMynd",
  description: "Learn about the technology behind MetaMynd's Self-Sovereign Identity Platform",
}

export default function TechnologyPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-metamynd-purple/10 to-metamynd-blue/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Technology</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            MetaMynd leverages cutting-edge technologies to provide a secure, decentralized identity platform for AI
            agents.
          </p>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Microservices Architecture</h2>
          <p className="text-lg text-gray-600 mb-12 text-center">
            Our platform is built on a robust microservices architecture that ensures scalability, reliability, and
            security.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Server className="h-8 w-8 text-metamynd-purple" />,
                title: "Authentication Service",
                description: "Handles user login & identity verification using WebAuthn and OAuth2 standards.",
              },
              {
                icon: <Key className="h-8 w-8 text-metamynd-blue" />,
                title: "Identity Management Service",
                description: "Creates & manages DIDs on Hedera Hashgraph following W3C standards.",
              },
              {
                icon: <Fingerprint className="h-8 w-8 text-metamynd-purple" />,
                title: "AI KYC Verification Service",
                description: "Scans & validates identity documents using advanced AI models.",
              },
              {
                icon: <FileCheck className="h-8 w-8 text-metamynd-blue" />,
                title: "Verifiable Credentials Service",
                description: "Allows users to issue & verify credentials as NFTs on Hedera.",
              },
              {
                icon: <AlertTriangle className="h-8 w-8 text-metamynd-purple" />,
                title: "Fraud Detection Service",
                description: "AI-powered fraud scoring engine to detect suspicious activities.",
              },
              {
                icon: <Database className="h-8 w-8 text-metamynd-blue" />,
                title: "Data Storage Service",
                description: "Secure, encrypted storage for user data with blockchain integration.",
              },
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="flex items-center mb-4">
                  {service.icon}
                  <h3 className="text-xl font-bold ml-3">{service.title}</h3>
                </div>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Technology */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">AI-Powered Identity Verification</h2>
            <p className="text-lg text-gray-600 mb-12 text-center">
              Our platform uses advanced AI and machine learning models to ensure secure and accurate identity
              verification.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h3 className="text-xl font-bold mb-4">AI Technologies Used</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">TensorFlow</span>
                      <p className="text-gray-600 text-sm">Face & document verification with deep learning models</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">OpenCV</span>
                      <p className="text-gray-600 text-sm">Image processing & document OCR for data extraction</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">YOLOv8</span>
                      <p className="text-gray-600 text-sm">Deepfake & synthetic image detection to prevent fraud</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Scikit-learn</span>
                      <p className="text-gray-600 text-sm">Machine learning fraud detection models for risk scoring</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h3 className="text-xl font-bold mb-4">AI Capabilities</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Document Verification</span>
                      <p className="text-gray-600 text-sm">Detect fake or altered identity documents</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Facial Biometrics</span>
                      <p className="text-gray-600 text-sm">Match facial features with ID photos and detect liveness</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Risk Scoring</span>
                      <p className="text-gray-600 text-sm">Flag suspicious activities with real-time risk assessment</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Continuous Learning</span>
                      <p className="text-gray-600 text-sm">Models improve over time with new data and patterns</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blockchain & DID */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Blockchain & Decentralized Identity</h2>
          <p className="text-lg text-gray-600 mb-12 text-center">
            We implement W3C-compliant Decentralized Identifiers (DIDs) using Hedera Hashgraph for secure,
            self-sovereign identity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-bold mb-4">DID Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Self-sovereign identity</span>
                    <p className="text-gray-600 text-sm">Users own and control their identity data</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Blockchain-based storage</span>
                    <p className="text-gray-600 text-sm">Tamper-proof identity records on Hedera Hashgraph</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Interoperability</span>
                    <p className="text-gray-600 text-sm">Compatible with Web3 & decentralized applications</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Cryptographic security</span>
                    <p className="text-gray-600 text-sm">Public/private key infrastructure for secure authentication</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Verifiable Credentials</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Government-issued ID verification</span>
                    <p className="text-gray-600 text-sm">Securely verify identity with government credentials</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Educational certificates</span>
                    <p className="text-gray-600 text-sm">Verify educational qualifications and work history</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">Financial & KYC compliance</span>
                    <p className="text-gray-600 text-sm">Streamline financial verification processes</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium">AI agent permissions</span>
                    <p className="text-gray-600 text-sm">Control what your AI agents can access and do</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Security & Compliance</h2>
            <p className="text-lg text-gray-600 mb-12 text-center">
              Security is our top priority. We implement industry-leading security measures and comply with global
              regulations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Security Measures</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-metamynd-purple mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">End-to-end encryption</span>
                      <p className="text-gray-600 text-sm">AES-256 and TLS 1.3 for data protection</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-metamynd-purple mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Multi-factor authentication</span>
                      <p className="text-gray-600 text-sm">MFA, WebAuthn, and biometric verification</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-metamynd-purple mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Zero Trust Architecture</span>
                      <p className="text-gray-600 text-sm">Strict access control and continuous verification</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-metamynd-purple mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Regular security audits</span>
                      <p className="text-gray-600 text-sm">Penetration testing and vulnerability assessments</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Compliance</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">GDPR Compliance</span>
                      <p className="text-gray-600 text-sm">European data protection regulations</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">eIDAS Compliance</span>
                      <p className="text-gray-600 text-sm">European electronic identification standards</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">ISO 27001</span>
                      <p className="text-gray-600 text-sm">Information security management standards</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">SOC 2 Type II</span>
                      <p className="text-gray-600 text-sm">Security, availability, and confidentiality</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API & Integrations */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">API & Third-Party Integrations</h2>
          <p className="text-lg text-gray-600 mb-12 text-center">
            We provide comprehensive APIs for developers to integrate identity verification into their applications.
          </p>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-8">
            <h3 className="text-xl font-bold mb-4">API Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <Code className="h-5 w-5 text-metamynd-blue mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">REST & GraphQL endpoints</span>
                  <p className="text-gray-600 text-sm">Flexible API options for different integration needs</p>
                </div>
              </div>
              <div className="flex items-start">
                <Code className="h-5 w-5 text-metamynd-blue mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">OAuth2, JWT, OpenID Connect</span>
                  <p className="text-gray-600 text-sm">Industry-standard authentication protocols</p>
                </div>
              </div>
              <div className="flex items-start">
                <Code className="h-5 w-5 text-metamynd-blue mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">Webhooks</span>
                  <p className="text-gray-600 text-sm">Real-time identity verification status updates</p>
                </div>
              </div>
              <div className="flex items-start">
                <Code className="h-5 w-5 text-metamynd-blue mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">SDK Support</span>
                  <p className="text-gray-600 text-sm">Libraries for JavaScript, Python, Java, and more</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/api-docs">
              <Button className="bg-metamynd-purple text-white hover:bg-metamynd-purple/90">
                View API Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Deployment & Infrastructure */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Deployment & Infrastructure</h2>
            <p className="text-lg text-gray-600 mb-12 text-center">
              Our platform is built on a robust, scalable cloud infrastructure with modern DevOps practices.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Cloud Infrastructure</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Cloud className="h-5 w-5 text-metamynd-blue mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Cloud Hosting</span>
                      <p className="text-gray-600 text-sm">AWS / Azure / GCP for global availability</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Cloud className="h-5 w-5 text-metamynd-blue mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Containerization</span>
                      <p className="text-gray-600 text-sm">Docker + Kubernetes for scalable deployments</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Cloud className="h-5 w-5 text-metamynd-blue mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Load Balancing</span>
                      <p className="text-gray-600 text-sm">Auto-scaling to handle varying workloads</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Cloud className="h-5 w-5 text-metamynd-blue mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Global CDN</span>
                      <p className="text-gray-600 text-sm">Fast content delivery worldwide</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h3 className="text-xl font-bold mb-4">DevOps Practices</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">CI/CD Pipeline</span>
                      <p className="text-gray-600 text-sm">GitHub Actions / Jenkins for automated deployments</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Infrastructure as Code</span>
                      <p className="text-gray-600 text-sm">Terraform / CloudFormation for consistent environments</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Monitoring & Logging</span>
                      <p className="text-gray-600 text-sm">Prometheus, Grafana, ELK stack for observability</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">Disaster Recovery</span>
                      <p className="text-gray-600 text-sm">Regular backups and multi-region failover</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-metamynd-purple to-metamynd-blue">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join us in building the future of decentralized identity for AI agents.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-metamynd-purple hover:bg-gray-100">
                Create Your Account
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
