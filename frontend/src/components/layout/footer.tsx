"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  const pathname = usePathname()

  // Don't show footer on dashboard pages
  const isDashboard = pathname?.startsWith("/dashboard")
  if (isDashboard) return null

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">MetaMynd</h3>
            <p className="text-gray-600 mb-4">
              Self-Sovereign Identity Platform for AI Agents using W3C standards and Hedera Hashgraph
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/metamynd-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-metamynd-purple"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://twitter.com/metamynd_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-metamynd-purple"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://linkedin.com/company/metamynd-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-metamynd-purple"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/platform/technology" className="text-gray-600 hover:text-metamynd-purple">
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/platform/features" className="text-gray-600 hover:text-metamynd-purple">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/platform/pricing" className="text-gray-600 hover:text-metamynd-purple">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/platform/api-docs" className="text-gray-600 hover:text-metamynd-purple">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support/help-center" className="text-gray-600 hover:text-metamynd-purple">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="text-gray-600 hover:text-metamynd-purple">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/support/faq" className="text-gray-600 hover:text-metamynd-purple">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support/status" className="text-gray-600 hover:text-metamynd-purple">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy-policy" className="text-gray-600 hover:text-metamynd-purple">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms-of-service" className="text-gray-600 hover:text-metamynd-purple">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/security" className="text-gray-600 hover:text-metamynd-purple">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/legal/compliance" className="text-gray-600 hover:text-metamynd-purple">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} MetaMynd. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <select className="bg-white border border-gray-300 rounded px-2 py-1 text-sm">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  )
}
