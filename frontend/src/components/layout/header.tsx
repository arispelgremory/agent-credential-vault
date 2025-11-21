"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Check if we're on a dashboard page
  const isDashboard = pathname?.startsWith("/dashboard")

  // Don't show the main navigation header on dashboard pages
  if (isDashboard) return null

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/metamynd-full-logo.png"
              alt="MetaMynd Logo"
              width={150}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6">
            <Link
              href="/platform/technology"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname?.startsWith("/platform") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Platform
            </Link>
            <Link
              href="/support/help-center"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname?.startsWith("/support") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Support
            </Link>
            <Link
              href="/legal/privacy-policy"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname?.startsWith("/legal") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Legal
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 rounded-md" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/platform/technology"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname?.startsWith("/platform") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Platform
              </Link>
              <Link
                href="/support/help-center"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname?.startsWith("/support") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </Link>
              <Link
                href="/legal/privacy-policy"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname?.startsWith("/legal") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Legal
              </Link>
            </nav>

            <div className="flex flex-col space-y-2 pt-2 border-t">
              <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
