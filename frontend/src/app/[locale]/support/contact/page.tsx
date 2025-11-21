import type { Metadata } from "next"
import { Mail, MessageSquare, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const metadata: Metadata = {
  title: "Contact Us | MetaMynd",
  description: "Get in touch with the MetaMynd support team",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-metamynd-purple/10 text-metamynd-purple mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Email</h2>
          <p className="text-gray-600 mb-4">For general inquiries</p>
          <a href="mailto:support@metamynd.io" className="text-metamynd-purple hover:underline">
            support@metamynd.io
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-metamynd-purple/10 text-metamynd-purple mb-4">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Live Chat</h2>
          <p className="text-gray-600 mb-4">Available Monday-Friday</p>
          <p className="text-gray-600">9:00 AM - 5:00 PM EST</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-metamynd-purple/10 text-metamynd-purple mb-4">
            <Phone className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Phone</h2>
          <p className="text-gray-600 mb-4">For urgent matters</p>
          <a href="tel:+18005551234" className="text-metamynd-purple hover:underline">
            +1 (800) 555-1234
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input id="name" placeholder="Your name" />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input id="email" type="email" placeholder="Your email" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <Select>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Inquiry</SelectItem>
                <SelectItem value="technical">Technical Support</SelectItem>
                <SelectItem value="billing">Billing Question</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <Textarea id="message" placeholder="How can we help you?" rows={6} />
          </div>

          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
      </div>
    </div>
  )
}
