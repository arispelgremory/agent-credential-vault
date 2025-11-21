import type { Metadata } from "next"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Pricing | MetaMynd",
  description: "Explore pricing plans for MetaMynd's W3C-compliant AI Agent Identity Platform",
}

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-4">Pricing Plans</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Choose the right plan for your identity verification needs. All plans include our core self-sovereign identity
        features.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Basic Plan */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold mb-2">Basic</h2>
            <p className="text-gray-600 mb-4">For individuals and small projects</p>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Up to 5 DIDs</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Basic KYC verification</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>10 verifiable credentials per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Email support</span>
              </li>
            </ul>
            <Button className="w-full mt-6">Get Started</Button>
          </div>
        </div>

        {/* Professional Plan */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-metamynd-purple">
          <div className="p-6 border-b bg-metamynd-purple/5">
            <div className="bg-metamynd-purple text-white text-xs font-bold uppercase py-1 px-2 rounded-full inline-block mb-2">
              Popular
            </div>
            <h2 className="text-2xl font-bold mb-2">Professional</h2>
            <p className="text-gray-600 mb-4">For businesses and teams</p>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Up to 50 DIDs</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Advanced KYC with AI verification</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>100 verifiable credentials per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Priority email & chat support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>API access</span>
              </li>
            </ul>
            <Button className="w-full mt-6 bg-metamynd-purple hover:bg-metamynd-purple/90">Get Started</Button>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold mb-2">Enterprise</h2>
            <p className="text-gray-600 mb-4">For large organizations</p>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">Custom</span>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Unlimited DIDs</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Premium KYC with fraud detection</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Unlimited verifiable credentials</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>24/7 dedicated support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Custom integrations</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>SLA guarantees</span>
              </li>
            </ul>
            <Button className="w-full mt-6" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing
              cycle.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Do you offer a free trial?</h3>
            <p className="text-gray-600">
              Yes, we offer a 14-day free trial for all our plans. No credit card required to start.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Is there a setup fee?</h3>
            <p className="text-gray-600">
              No, there are no setup fees for our Basic and Professional plans. Enterprise plans may include custom
              setup services.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
