import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, FileText, HelpCircle, Mail, Phone, Video, BookOpen, Lightbulb, Search } from "lucide-react"

export const metadata: Metadata = {
  title: "Support | MetaMynd",
  description: "Get help and support for MetaMynd's Self-Sovereign Identity Platform",
}

export default function SupportPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-metamynd-purple/10 to-metamynd-blue/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How Can We Help?</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find answers, get support, and resolve issues with our comprehensive support resources.
          </p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <Input type="text" placeholder="Search for help articles..." className="pl-12 py-6 text-lg rounded-full" />
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Support Options</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border border-gray-200">
              <CardHeader className="text-center">
                <div className="mx-auto bg-metamynd-purple/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-metamynd-purple" />
                </div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Chat with our support team in real-time</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">Available Monday to Friday, 9 AM - 6 PM EST</p>
                <Button className="bg-metamynd-purple text-white hover:bg-metamynd-purple/90">Start Chat</Button>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="text-center">
                <div className="mx-auto bg-metamynd-blue/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-metamynd-blue" />
                </div>
                <CardTitle>Email Support</CardTitle>
                <CardDescription>Send us an email and we'll respond within 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">For non-urgent issues and general inquiries</p>
                <Button className="bg-metamynd-blue text-white hover:bg-metamynd-blue/90">Email Us</Button>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="text-center">
                <div className="mx-auto bg-metamynd-purple/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-metamynd-purple" />
                </div>
                <CardTitle>Phone Support</CardTitle>
                <CardDescription>Speak directly with our support specialists</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">Available for Premium and Enterprise customers</p>
                <Button className="bg-metamynd-purple text-white hover:bg-metamynd-purple/90">Call Us</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Help Center */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Help Center</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <BookOpen className="h-6 w-6 text-metamynd-purple" />,
                  title: "Getting Started",
                  description: "Learn the basics of our platform",
                  links: [
                    "Creating your account",
                    "KYC verification process",
                    "Setting up your DID",
                    "Managing your wallet",
                  ],
                },
                {
                  icon: <FileText className="h-6 w-6 text-metamynd-blue" />,
                  title: "Verifiable Credentials",
                  description: "Everything about VCs",
                  links: [
                    "Creating verifiable credentials",
                    "Sharing credentials securely",
                    "Revoking credentials",
                    "Credential verification",
                  ],
                },
                {
                  icon: <HelpCircle className="h-6 w-6 text-metamynd-purple" />,
                  title: "AI Agent Management",
                  description: "Managing your AI agents",
                  links: [
                    "Registering a new AI agent",
                    "Setting agent permissions",
                    "Monitoring agent activity",
                    "Revoking agent access",
                  ],
                },
                {
                  icon: <Lightbulb className="h-6 w-6 text-metamynd-blue" />,
                  title: "Security & Privacy",
                  description: "Keeping your identity secure",
                  links: [
                    "Multi-factor authentication",
                    "Private key management",
                    "Secure recovery options",
                    "Privacy settings",
                  ],
                },
                {
                  icon: <Video className="h-6 w-6 text-metamynd-purple" />,
                  title: "Video Tutorials",
                  description: "Visual guides for all features",
                  links: [
                    "Platform overview",
                    "Identity verification walkthrough",
                    "Creating and sharing credentials",
                    "Advanced security features",
                  ],
                },
                {
                  icon: <MessageSquare className="h-6 w-6 text-metamynd-blue" />,
                  title: "Community Forum",
                  description: "Connect with other users",
                  links: ["Ask questions", "Share experiences", "Feature requests", "Integration examples"],
                },
              ].map((category, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    {category.icon}
                    <h3 className="text-xl font-bold ml-2">{category.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link href="#" className="text-metamynd-purple hover:underline flex items-center">
                          <span className="text-xs mr-2">•</span> {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Contact Us</h2>
          <p className="text-lg text-gray-600 mb-12 text-center">
            Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
          </p>

          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="email" type="email" placeholder="Your email" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea id="message" placeholder="Please describe your issue in detail..." rows={6} />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-metamynd-purple to-metamynd-blue text-white"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
