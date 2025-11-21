import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Book, FileQuestion, MessageSquare, Lightbulb, ArrowRight, Video } from "lucide-react"

export default function HelpCenterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 metamynd-gradient-text">Help Center</h1>

        <p className="text-lg text-gray-700 mb-8">
          Find answers to your questions and learn how to get the most out of the MetaMynd platform.
        </p>

        {/* Search Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-metamynd-purple focus:border-metamynd-purple"
              placeholder="Search for help articles..."
            />
            <button
              type="submit"
              className="absolute right-2.5 bottom-2.5 bg-metamynd-purple hover:bg-metamynd-purple/90 text-white font-medium rounded-lg text-sm px-4 py-2"
            >
              Search
            </button>
          </div>
        </div>

        {/* Popular Topics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-purple-900">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/support/faq#getting-started"
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:border-metamynd-purple transition-colors"
            >
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-metamynd-purple/10 flex items-center justify-center mr-4 flex-shrink-0">
                  <Book className="h-5 w-5 text-metamynd-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Getting Started</h3>
                  <p className="text-gray-600">Learn how to set up your account and complete the KYC process</p>
                </div>
              </div>
            </Link>

            <Link
              href="/support/faq#agent-registration"
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:border-metamynd-purple transition-colors"
            >
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-metamynd-blue/10 flex items-center justify-center mr-4 flex-shrink-0">
                  <FileQuestion className="h-5 w-5 text-metamynd-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Agent Registration</h3>
                  <p className="text-gray-600">How to register and manage your AI agents</p>
                </div>
              </div>
            </Link>

            <Link
              href="/support/faq#credentials"
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:border-metamynd-purple transition-colors"
            >
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-metamynd-purple/10 flex items-center justify-center mr-4 flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-metamynd-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Verifiable Credentials</h3>
                  <p className="text-gray-600">Understanding and managing verifiable credentials</p>
                </div>
              </div>
            </Link>

            <Link
              href="/support/faq#security"
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:border-metamynd-purple transition-colors"
            >
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-metamynd-blue/10 flex items-center justify-center mr-4 flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-metamynd-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Security & Privacy</h3>
                  <p className="text-gray-600">Best practices for keeping your identity secure</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-purple-900">Video Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Complete KYC Process", duration: "5:32" },
              { title: "Register Your First AI Agent", duration: "7:15" },
              { title: "Issue Verifiable Credentials", duration: "6:48" },
            ].map((video, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1">{video.title}</h3>
                  <p className="text-gray-500 text-sm">{video.duration}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <Link href="/support/tutorials" className="text-metamynd-purple hover:underline inline-flex items-center">
              View all tutorials <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-gray-50 p-8 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-purple-900">Still Need Help?</h2>
          <p className="text-gray-700 mb-6">
            Our support team is available to assist you with any questions or issues you may have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/support/contact">
              <Button className="bg-metamynd-purple hover:bg-metamynd-purple/90">Contact Support</Button>
            </Link>
            <Link href="/support/faq">
              <Button
                variant="outline"
                className="border-metamynd-purple text-metamynd-purple hover:bg-metamynd-purple/10"
              >
                Browse FAQ
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
